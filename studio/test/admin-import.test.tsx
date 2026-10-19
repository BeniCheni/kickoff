import { existsSync, lstatSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, utimesSync, writeFileSync } from 'node:fs'
import { request as httpRequest, type IncomingHttpHeaders } from 'node:http'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { eq, sql } from 'drizzle-orm'
import { CHECKLIST_LINES, event, job, ledger, videos } from '../db/schema.ts'
import { syntheticMp4 } from '../media/mp4.ts'
import { CLIP_LIMIT, PHOTO_LIMIT } from '../server/body.ts'
import { pathInsideWorktree } from '../server/import.ts'
import { startAdmin, type AdminServer } from '../server/http.ts'
import { openAdmin } from '../server/open.ts'
import { DRAFT } from '../shared/admin-copy.ts'
import { importRefusal, statusLine } from '../shared/status.ts'
import { ImportForm } from '../ui/app/import.tsx'
import { minimalJpeg } from './jpeg.ts'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const servers: AdminServer[] = []
const MAC_EPOCH_SECONDS = 2_082_844_800

afterEach(async () => {
  while (servers.length > 0) await servers.pop()?.close()
})

function creationTime(iso: string): number {
  return Math.floor(new Date(iso).getTime() / 1000) + MAC_EPOCH_SECONDS
}

function folders(): NodeJS.ProcessEnv {
  return {
    STUDIO_DATA_DIR: mkdtempSync(path.join(tmpdir(), 'kickoff-studio-data-')),
    STUDIO_MEDIA_DIR: mkdtempSync(path.join(tmpdir(), 'kickoff-studio-media-')),
    STUDIO_NOW: '2026-10-21T16:00:00.000Z',
  }
}

function ask(admin: AdminServer, options: {
  path: string
  method?: string
  headers?: IncomingHttpHeaders
  body?: Buffer | string
}): Promise<{ status: number; body: string; headers: IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const req = httpRequest({
      hostname: '127.0.0.1',
      port: admin.port,
      path: options.path,
      method: options.method ?? 'GET',
      headers: { host: `127.0.0.1:${admin.port}`, ...options.headers },
    }, (response) => {
      const chunks: Buffer[] = []
      response.on('data', (chunk: Buffer) => chunks.push(chunk))
      response.on('end', () => resolve({
        status: response.statusCode ?? 0,
        headers: response.headers,
        body: Buffer.concat(chunks).toString('utf8'),
      }))
    })
    req.on('error', reject)
    if (options.body) req.write(options.body)
    req.end()
  })
}

async function cookieFor(admin: AdminServer): Promise<string> {
  const ticket = await ask(admin, { path: `/?ticket=${encodeURIComponent(admin.token)}` })
  const header = ticket.headers['set-cookie']
  return (Array.isArray(header) ? header[0] : header)?.split(';')[0] ?? ''
}

const idle = {
  clipName: null,
  stillName: null,
  png: false,
  prompt: '',
  subjects: [] as string[],
  title: '',
  note: '',
  madeOn: '',
  preview: null,
  notice: null,
  onClip: () => undefined,
  onStill: () => undefined,
  onPng: () => undefined,
  onOther: () => undefined,
  onPrompt: () => undefined,
  onSubject: () => undefined,
  onTitle: () => undefined,
  onNote: () => undefined,
  onMadeOn: () => undefined,
  onPreview: () => undefined,
  onImport: () => undefined,
}

describe('import screen', () => {
  it('names a path inside the worktree and renders the PNG and preview states', () => {
    expect(pathInsideWorktree(path.join(repoRoot, 'studio/README.md'))).toBe(true)
    expect(pathInsideWorktree(path.join(tmpdir(), 'outside-the-repo.mp4'))).toBe(false)
    expect(importRefusal({ outcome: 'inside-worktree' })).toBe(DRAFT.importWorktree)
    expect(statusLine({ outcome: 'clip-refused', reason: 'not-mp4', brand: 'qt' })).toBe(`${DRAFT.importNotMp4} The brand is qt.`)
    expect(statusLine({ outcome: 'needs-made-on' })).toBe(DRAFT.importNeedsMadeOn)
    expect(statusLine({ outcome: 'upload-missing' })).toBe(DRAFT.importMissing)
    expect(statusLine({ outcome: 'missing' })).toBe(DRAFT.clipUnrecorded)
    expect(statusLine({ outcome: 'missing' })).not.toBe(DRAFT.importMissing)
    const after = renderToStaticMarkup(
      <ImportForm {...idle} clipName="fenway.mp4" stillName="still.jpg" prompt="a fictional cat" subjects={['Fenway']} title="Fenway" notice={DRAFT.importImported} />,
    )
    expect(after).toContain('class="studio-primary" disabled=""')
    expect(after).toContain(DRAFT.importImported)
    const empty = renderToStaticMarkup(<ImportForm {...idle} />)
    expect(empty).toContain('Import')
    expect(empty).toContain('>Subjects<')
    expect(empty.indexOf('>Subjects<')).toBeLessThan(empty.indexOf('for="i-title"'))
    expect(empty).toContain(DRAFT.importChoose)
    expect(empty).toContain('disabled')
    const png = renderToStaticMarkup(<ImportForm {...idle} png clipName="clip.mp4" />)
    expect(png).toContain('This still is a PNG. Convert it with sips -s format jpeg &lt;still.png&gt; --out &lt;still.jpg&gt;.')
    const preview = renderToStaticMarkup(
      <ImportForm
        {...idle}
        clipName="clip.mp4"
        stillName="still.jpg"
        prompt="a fictional cat"
        subjects={['Fenway']}
        title="Fenway"
        preview={{
          outcome: 'preview',
          width: 1920,
          height: 1080,
          durationS: '5.000',
          frameRate: 24,
          audio: true,
          fastStart: true,
          stripped: 'udta,meta',
          needsMadeOn: false,
        }}
      />,
    )
    expect(preview).toContain('Width 1920')
    expect(preview).toContain('Height 1080')
    expect(preview).toContain('Duration 5.000')
    expect(preview).toContain('Frame rate 24')
    expect(preview).toContain('Audio yes')
    expect(preview).toContain('Fast start yes')
    expect(preview).toContain('Strip will remove udta,meta.')
    expect(preview).not.toContain('disabled=""')
  })

  it('imports a synthetic clip, then keeps, gates, publishes and unpublishes it', async () => {
    const admin = await startAdmin({ env: folders(), port: 0 })
    servers.push(admin)
    const cookie = await cookieFor(admin)
    const headers = { cookie, origin: admin.origin }
    const clip = Buffer.from(syntheticMp4({
      userData: true,
      audio: true,
      creationTime: creationTime('2026-10-21T15:00:00.000Z'),
    }))
    const storedClip = JSON.parse((await ask(admin, {
      path: '/api/import/clip',
      method: 'POST',
      headers: { ...headers, 'content-type': 'video/mp4' },
      body: clip,
    })).body) as { id: string }
    const storedStill = JSON.parse((await ask(admin, {
      path: '/api/import/still',
      method: 'POST',
      headers: { ...headers, 'content-type': 'image/jpeg' },
      body: Buffer.from(minimalJpeg),
    })).body) as { id: string }
    const preview = JSON.parse((await ask(admin, {
      path: '/api/import/preview',
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({ clipId: storedClip.id, stillId: storedStill.id }),
    })).body) as { outcome: string; width: number; height: number; durationS: string; frameRate: number; audio: boolean; fastStart: boolean; stripped: string }
    expect(preview).toMatchObject({
      outcome: 'preview',
      width: 1920,
      height: 1080,
      durationS: '5.000',
      frameRate: 24,
      audio: true,
      fastStart: true,
      stripped: 'udta,meta',
    })
    const imported = JSON.parse((await ask(admin, {
      path: '/api/import/confirm',
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({
        clipId: storedClip.id,
        stillId: storedStill.id,
        prompt: 'a fictional cat, as typed',
        subjects: ['Fenway'],
        title: 'Fenway',
        note: 'Wednesday',
        madeOn: '',
      }),
    })).body) as { outcome: string; jobId: string }
    expect(imported.outcome).toBe('imported')
    const again = JSON.parse((await ask(admin, {
      path: '/api/import/confirm',
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({
        clipId: storedClip.id,
        stillId: storedStill.id,
        prompt: 'a fictional cat, as typed',
        subjects: ['Fenway'],
        title: 'Fenway',
        note: 'Wednesday',
        madeOn: '',
      }),
    })).body) as { outcome: string }
    expect(again.outcome).toBe('upload-missing')
    expect(statusLine(again)).toBe('Unavailable: that file is no longer waiting. Choose it again.')
    const jobs = JSON.parse((await ask(admin, { path: '/api/jobs', headers: { cookie } })).body) as { id: string; status: string }[]
    expect(jobs.find((row) => row.id === imported.jobId)?.status).toBe('downloaded')
    const review = JSON.parse((await ask(admin, { path: `/api/review/${imported.jobId}`, headers: { cookie } })).body) as { prompt: string }
    expect(review.prompt).toContain('a fictional cat')
    const kept = JSON.parse((await ask(admin, {
      path: `/api/review/${imported.jobId}/keep`,
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({ answers: CHECKLIST_LINES.map((line) => ({ line, answer: 'clear' })) }),
    })).body) as { outcome: string }
    expect(kept.outcome).toBe('kept')
    const gate = JSON.parse((await ask(admin, {
      path: '/api/gate',
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({
        answer: 'Recorded for the import test.',
        disclosure: 'The Generated label stays.',
        recordedBy: 'operator',
        source: 'test',
      }),
    })).body) as { outcome: string }
    expect(gate.outcome).toBe('gate-recorded')
    const published = JSON.parse((await ask(admin, {
      path: `/api/publish/${imported.jobId}/go`,
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({ publicId: 'fenway-import', title: 'Fenway', position: 1, confirm: true }),
    })).body) as { outcome: string }
    expect(published.outcome).toBe('published')
    const withdrawn = JSON.parse((await ask(admin, {
      path: `/api/publish/${imported.jobId}/unpublish`,
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({ deleteFiles: false }),
    })).body) as { outcome: string }
    expect(withdrawn.outcome).toBe('withdrawn')
    await admin.opened.db.execute(sql`alter table studio.event disable trigger user`)
    await admin.opened.db.execute(sql`alter table studio.ledger disable trigger user`)
    await admin.opened.db.delete(videos).where(eq(videos.jobId, imported.jobId))
    await admin.opened.db.delete(ledger).where(eq(ledger.jobId, imported.jobId))
    await admin.opened.db.delete(event).where(eq(event.jobId, imported.jobId))
    await admin.opened.db.delete(job).where(eq(job.id, imported.jobId))
    const gone = JSON.parse((await ask(admin, {
      path: `/api/publish/${imported.jobId}/go`,
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({ publicId: 'fenway-import', title: 'Fenway', position: 1, confirm: true }),
    })).body) as { outcome: string }
    expect(gone.outcome).toBe('missing')
    expect(statusLine(gone)).toBe(DRAFT.clipUnrecorded)
    expect(statusLine(gone)).not.toBe(DRAFT.importMissing)
  })

  it('refuses the upload by type, size, truncation, brand, a duplicate, a missing date and a non-JPEG', async () => {
    const env = folders()
    const admin = await startAdmin({ env, port: 0 })
    const mediaDir = env.STUDIO_MEDIA_DIR
    if (!mediaDir) throw new Error('media dir')
    const incomingDir = path.join(mediaDir, 'incoming')
    const emptyIncoming = () => {
      if (!existsSync(incomingDir)) return
      expect(readdirSync(incomingDir)).toEqual([])
    }
    servers.push(admin)
    const cookie = await cookieFor(admin)
    const headers = { cookie, origin: admin.origin }
    const png = await ask(admin, {
      path: '/api/import/still',
      method: 'POST',
      headers: { ...headers, 'content-type': 'image/png' },
      body: Buffer.from('not-a-picture'),
    })
    expect(png.status).toBe(415)
    expect(statusLine(JSON.parse(png.body))).toBe(DRAFT.importPng)
    const text = await ask(admin, {
      path: '/api/import/clip',
      method: 'POST',
      headers: { ...headers, 'content-type': 'text/plain' },
      body: Buffer.from('hello'),
    })
    expect(text.status).toBe(415)
    expect(statusLine(JSON.parse(text.body))).toBe(DRAFT.importNotMp4)
    const empty = await ask(admin, {
      path: '/api/import/clip',
      method: 'POST',
      headers: { ...headers, 'content-type': 'video/mp4' },
      body: Buffer.alloc(0),
    })
    expect(empty.status).toBe(400)
    expect(statusLine(JSON.parse(empty.body))).toBe(DRAFT.importEmpty)
    const huge = await ask(admin, {
      path: '/api/import/still',
      method: 'POST',
      headers: { ...headers, 'content-type': 'image/jpeg', 'content-length': String(PHOTO_LIMIT + 1) },
      body: Buffer.alloc(PHOTO_LIMIT + 1),
    })
    expect(huge.status).toBe(413)
    expect(statusLine(JSON.parse(huge.body))).toBe('Unavailable: that still is over 20 MB.')
    const hugeClip = await ask(admin, {
      path: '/api/import/clip',
      method: 'POST',
      headers: { ...headers, 'content-type': 'video/mp4' },
      body: Buffer.alloc(CLIP_LIMIT + 1),
    })
    expect(hugeClip.status).toBe(413)
    expect(statusLine(JSON.parse(hugeClip.body))).toBe('Unavailable: that clip is over 100 MB.')

    const upload = async (bytes: Uint8Array, type: string, route: 'clip' | 'still') => JSON.parse((await ask(admin, {
      path: `/api/import/${route}`,
      method: 'POST',
      headers: { ...headers, 'content-type': type },
      body: Buffer.from(bytes),
    })).body) as { id?: string; outcome?: string }

    const whole = syntheticMp4({ chunks: true, creationTime: creationTime('2026-10-21T15:00:00.000Z') })
    const cut = whole.slice(0, Buffer.from(whole).lastIndexOf('mdat') + 8)
    const cutId = await upload(cut, 'video/mp4', 'clip')
    const stillId = await upload(minimalJpeg, 'image/jpeg', 'still')
    const truncated = JSON.parse((await ask(admin, {
      path: '/api/import/preview',
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({ clipId: cutId.id, stillId: stillId.id }),
    })).body) as { outcome: string; reason: string }
    expect(truncated).toMatchObject({ outcome: 'clip-refused', reason: 'truncated' })
    expect(statusLine(truncated)).toBe(DRAFT.importTruncated)
    emptyIncoming()

    const qt = await upload(syntheticMp4({ brand: 'qt  ', compatible: ['qt  '] }), 'video/mp4', 'clip')
    const qtStill = await upload(minimalJpeg, 'image/jpeg', 'still')
    const branded = JSON.parse((await ask(admin, {
      path: '/api/import/preview',
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({ clipId: qt.id, stillId: qtStill.id }),
    })).body) as { reason: string; brand: string }
    expect(statusLine(branded)).toBe(`${DRAFT.importNotMp4} The brand is qt.`)
    emptyIncoming()

    const good = await upload(syntheticMp4({ creationTime: 0 }), 'video/mp4', 'clip')
    const jpeg = await upload(minimalJpeg, 'image/jpeg', 'still')
    const undated = JSON.parse((await ask(admin, {
      path: '/api/import/confirm',
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({
        clipId: good.id,
        stillId: jpeg.id,
        prompt: 'a fictional cat',
        subjects: ['Fenway'],
        title: 'Fenway',
      }),
    })).body) as { outcome: string }
    expect(undated.outcome).toBe('needs-made-on')
    expect(statusLine(undated)).toBe(DRAFT.importNeedsMadeOn)
    emptyIncoming()
    const datedClip = await upload(syntheticMp4({ creationTime: 0 }), 'video/mp4', 'clip')
    const datedStill = await upload(minimalJpeg, 'image/jpeg', 'still')
    const dated = JSON.parse((await ask(admin, {
      path: '/api/import/confirm',
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({
        clipId: datedClip.id,
        stillId: datedStill.id,
        prompt: 'a fictional cat',
        subjects: ['Fenway'],
        title: 'Fenway',
        madeOn: '2026-10-21',
      }),
    })).body) as { outcome: string }
    expect(dated.outcome).toBe('imported')
    emptyIncoming()
    const againClip = await upload(syntheticMp4({ creationTime: 0 }), 'video/mp4', 'clip')
    const againStill = await upload(minimalJpeg, 'image/jpeg', 'still')
    const previewDuplicate = JSON.parse((await ask(admin, {
      path: '/api/import/preview',
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({ clipId: againClip.id, stillId: againStill.id }),
    })).body) as { outcome: string }
    expect(previewDuplicate.outcome).toBe('already-imported')
    expect(statusLine(previewDuplicate)).toBe(DRAFT.importDuplicate)
    emptyIncoming()
    const thirdClip = await upload(syntheticMp4({ creationTime: 0 }), 'video/mp4', 'clip')
    const thirdStill = await upload(minimalJpeg, 'image/jpeg', 'still')
    const duplicate = JSON.parse((await ask(admin, {
      path: '/api/import/confirm',
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({
        clipId: thirdClip.id,
        stillId: thirdStill.id,
        prompt: 'a fictional cat',
        subjects: ['Fenway'],
        title: 'Fenway',
        madeOn: '2026-10-21',
      }),
    })).body) as { outcome: string }
    expect(duplicate.outcome).toBe('already-imported')
    expect(statusLine(duplicate)).toBe(DRAFT.importDuplicate)
    emptyIncoming()

    const fakeStill = await upload(syntheticMp4(), 'image/jpeg', 'still')
    const clipId = await upload(syntheticMp4({ creationTime: creationTime('2026-10-21T15:00:00.000Z') }), 'video/mp4', 'clip')
    const notJpeg = JSON.parse((await ask(admin, {
      path: '/api/import/preview',
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: JSON.stringify({ clipId: clipId.id, stillId: fakeStill.id }),
    })).body) as { outcome: string }
    expect(notJpeg.outcome).toBe('not-a-jpeg')
    expect(statusLine(notJpeg)).toBe(DRAFT.importNotJpeg)
    emptyIncoming()
  })

  it('discards the uploaded clip when the still is over 20 MB', async () => {
    const env = folders()
    const admin = await startAdmin({ env, port: 0 })
    servers.push(admin)
    const cookie = await cookieFor(admin)
    const headers = { cookie, origin: admin.origin, 'content-type': 'application/json' }
    const mediaDir = env.STUDIO_MEDIA_DIR
    if (!mediaDir) throw new Error('media dir')
    const incomingDir = path.join(mediaDir, 'incoming')
    const clip = JSON.parse((await ask(admin, {
      path: '/api/import/clip',
      method: 'POST',
      headers: { cookie, origin: admin.origin, 'content-type': 'video/mp4' },
      body: Buffer.from(syntheticMp4()),
    })).body) as { id: string }
    const still = await ask(admin, {
      path: '/api/import/still',
      method: 'POST',
      headers: { cookie, origin: admin.origin, 'content-type': 'image/jpeg' },
      body: Buffer.alloc(PHOTO_LIMIT + 1),
    })
    expect(still.status).toBe(413)
    expect(readdirSync(incomingDir)).toEqual([`${clip.id}.mp4`])
    const removed = JSON.parse((await ask(admin, {
      path: '/api/import/discard',
      method: 'POST',
      headers,
      body: JSON.stringify({ id: clip.id, kind: 'clip' }),
    })).body) as { outcome: string }
    expect(removed.outcome).toBe('discarded')
    expect(readdirSync(incomingDir)).toEqual([])
    const keeper = JSON.parse((await ask(admin, {
      path: '/api/import/clip',
      method: 'POST',
      headers: { cookie, origin: admin.origin, 'content-type': 'video/mp4' },
      body: Buffer.from(syntheticMp4()),
    })).body) as { id: string }
    for (const body of [
      { id: '../outside', kind: 'clip' },
      { id: path.join(incomingDir, `${keeper.id}.mp4`), kind: 'clip' },
      { id: 'a'.repeat(32), kind: 'clip' },
    ]) {
      const refused = await ask(admin, {
        path: '/api/import/discard',
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      expect(refused.status).toBe(400)
      expect(JSON.parse(refused.body)).toEqual({ outcome: 'refused' })
    }
    expect(readdirSync(incomingDir)).toEqual([`${keeper.id}.mp4`])
  })

  it('refuses a symlink in incoming and leaves its target', async () => {
    const env = folders()
    const admin = await startAdmin({ env, port: 0 })
    servers.push(admin)
    const cookie = await cookieFor(admin)
    const headers = { cookie, origin: admin.origin, 'content-type': 'application/json' }
    const mediaDir = env.STUDIO_MEDIA_DIR
    if (!mediaDir) throw new Error('media dir')
    const sentinel = path.join(mediaDir, 'downloaded-sentinel.mp4')
    writeFileSync(sentinel, syntheticMp4())
    const plant = async () => {
      const clip = JSON.parse((await ask(admin, {
        path: '/api/import/clip',
        method: 'POST',
        headers: { cookie, origin: admin.origin, 'content-type': 'video/mp4' },
        body: Buffer.from(syntheticMp4()),
      })).body) as { id: string }
      const still = JSON.parse((await ask(admin, {
        path: '/api/import/still',
        method: 'POST',
        headers: { cookie, origin: admin.origin, 'content-type': 'image/jpeg' },
        body: Buffer.from(minimalJpeg),
      })).body) as { id: string }
      const link = path.join(mediaDir, 'incoming', `${clip.id}.mp4`)
      rmSync(link)
      symlinkSync(sentinel, link)
      return { clipId: clip.id, stillId: still.id, link }
    }
    const discarded = await plant()
    const discard = JSON.parse((await ask(admin, {
      path: '/api/import/discard',
      method: 'POST',
      headers,
      body: JSON.stringify({ id: discarded.clipId, kind: 'clip' }),
    })).body) as { outcome: string }
    expect(discard.outcome).toBe('refused')
    expect(readFileSync(sentinel).equals(syntheticMp4())).toBe(true)
    expect(lstatSync(discarded.link).isSymbolicLink()).toBe(true)
    const previewed = await plant()
    const preview = JSON.parse((await ask(admin, {
      path: '/api/import/preview',
      method: 'POST',
      headers,
      body: JSON.stringify({ clipId: previewed.clipId, stillId: previewed.stillId }),
    })).body) as { outcome: string }
    expect(preview.outcome).toBe('refused')
    expect(preview.outcome).not.toBe('preview')
    expect(readFileSync(sentinel).equals(syntheticMp4())).toBe(true)
    expect(lstatSync(previewed.link).isSymbolicLink()).toBe(true)
    const confirmed = await plant()
    const confirmedBody = JSON.parse((await ask(admin, {
      path: '/api/import/confirm',
      method: 'POST',
      headers,
      body: JSON.stringify({
        clipId: confirmed.clipId,
        stillId: confirmed.stillId,
        prompt: 'a fictional cat',
        subjects: ['Fenway'],
        title: 'Fenway',
      }),
    })).body) as { outcome: string }
    expect(confirmedBody.outcome).toBe('refused')
    expect(confirmedBody.outcome).not.toBe('imported')
    expect(readFileSync(sentinel).equals(syntheticMp4())).toBe(true)
    expect(lstatSync(confirmed.link).isSymbolicLink()).toBe(true)
  })

  it('refuses every import route when incoming is a symlink', async () => {
    const env = folders()
    const admin = await startAdmin({ env, port: 0 })
    servers.push(admin)
    const cookie = await cookieFor(admin)
    const headers = { cookie, origin: admin.origin, 'content-type': 'application/json' }
    const mediaDir = env.STUDIO_MEDIA_DIR
    if (!mediaDir) throw new Error('media dir')
    const outside = mkdtempSync(path.join(tmpdir(), 'kickoff-studio-outside-'))
    const keep = path.join(outside, 'keep.txt')
    writeFileSync(keep, 'stay')
    const incomingDir = path.join(mediaDir, 'incoming')
    if (existsSync(incomingDir)) rmSync(incomingDir, { recursive: true })
    symlinkSync(outside, incomingDir)
    const before = readdirSync(outside)
    const stored = JSON.parse((await ask(admin, {
      path: '/api/import/clip',
      method: 'POST',
      headers: { cookie, origin: admin.origin, 'content-type': 'video/mp4' },
      body: Buffer.from(syntheticMp4()),
    })).body) as { outcome?: string; id?: string }
    expect(stored.outcome).toBe('uploads-folder')
    expect(stored.id).toBeUndefined()
    expect(statusLine(stored)).toBe(DRAFT.uploadsFolder)
    const id = 'a'.repeat(32)
    for (const [route, body] of [
      ['/api/import/preview', { clipId: id, stillId: id }],
      ['/api/import/confirm', { clipId: id, stillId: id, prompt: 'p', subjects: ['Fenway'], title: 'Fenway' }],
      ['/api/import/discard', { id, kind: 'clip' }],
    ] as const) {
      const refused = JSON.parse((await ask(admin, {
        path: route,
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })).body) as { outcome: string }
      expect(refused.outcome).toBe('uploads-folder')
      expect(statusLine(refused)).toBe('Unavailable: the uploads folder is not a plain folder on this Mac.')
    }
    expect(readdirSync(outside)).toEqual(before)
    expect(readFileSync(keep, 'utf8')).toBe('stay')
  })

  it('leaves an outside folder alone when incoming is a symlink to it', async () => {
    const data = mkdtempSync(path.join(tmpdir(), 'kickoff-studio-data-'))
    const media = mkdtempSync(path.join(tmpdir(), 'kickoff-studio-media-'))
    const outside = mkdtempSync(path.join(tmpdir(), 'kickoff-studio-outside-'))
    const sentinel = path.join(outside, 'sentinel.txt')
    const other = path.join(outside, 'other.txt')
    writeFileSync(sentinel, 'stay')
    writeFileSync(other, 'also')
    const old = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    utimesSync(sentinel, old, old)
    utimesSync(other, old, old)
    symlinkSync(outside, path.join(media, 'incoming'))
    const opened = await openAdmin({ STUDIO_DATA_DIR: data, STUDIO_MEDIA_DIR: media }, false)
    await opened.close()
    expect(readFileSync(sentinel, 'utf8')).toBe('stay')
    expect(readFileSync(other, 'utf8')).toBe('also')
  })
})
