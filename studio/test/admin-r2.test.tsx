import { createHash } from 'node:crypto'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { request as httpRequest, type IncomingHttpHeaders } from 'node:http'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { eq } from 'drizzle-orm'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { CHECKLIST_LINES, asset, generation, generationInput, job, subject, videos } from '../db/schema.ts'
import { openAdmin } from '../server/open.ts'
import { startAdmin, type AdminServer } from '../server/http.ts'
import { sha256Hex } from '../storage/sigv4.ts'
import { DRAFT, STORAGE_REFUSAL } from '../shared/admin-copy.ts'
import { statusLine } from '../shared/status.ts'
import type { ShellView } from '../shared/types.ts'
import { PublishCard } from '../ui/app/publish.tsx'
import { StudioShell } from '../ui/app/shell.tsx'
import { minimalJpeg } from './jpeg.ts'

const servers: AdminServer[] = []
const ACCOUNT = ['R2', '_ACCOUNT_ID'].join('')
const ACCESS = ['R2', '_ACCESS_KEY_ID'].join('')
const SECRET_NAME = ['R2', '_SECRET_ACCESS_KEY'].join('')
const BUCKET = ['R2', '_BUCKET'].join('')
const SECRET = ['super', '-secret-value'].join('')

afterEach(async () => {
  while (servers.length > 0) await servers.pop()?.close()
})

function folders(extra: Record<string, string> = {}): NodeJS.ProcessEnv & { STUDIO_MEDIA_DIR: string } {
  return {
    STUDIO_DATA_DIR: mkdtempSync(path.join(tmpdir(), 'kickoff-studio-data-')),
    STUDIO_MEDIA_DIR: mkdtempSync(path.join(tmpdir(), 'kickoff-studio-media-')),
    STUDIO_NOW: '2026-10-18T18:00:00.000Z',
    STUDIO_LIVE: '1',
    DATABASE_URL: ['postgres', '://127.0.0.1:1/studio'].join(''),
    STUDIO_ADMIN_LIVE_PGLITE: '1',
    [ACCOUNT]: 'accountid123',
    [ACCESS]: 'AKIAEXAMPLEKEY',
    [SECRET_NAME]: SECRET,
    [BUCKET]: 'moments-live',
    ...extra,
  }
}

function ask(admin: AdminServer, options: {
  path: string
  method?: string
  headers?: IncomingHttpHeaders
  body?: string
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

type Seen = { method: string; url: string }

function capturing(respond: (seen: Seen) => Promise<Response> | Response) {
  const seen: Seen[] = []
  const fetchImpl: typeof fetch = async (input, init) => {
    const item = { method: init?.method ?? 'GET', url: String(input) }
    seen.push(item)
    const body = init?.body
    const bytes = body instanceof Uint8Array ? body : new Uint8Array()
    expect(sha256Hex(bytes)).not.toContain(SECRET)
    expect(JSON.stringify(init?.headers ?? {})).not.toContain(SECRET)
    return respond(item)
  }
  return { fetchImpl, seen }
}

async function keptClip(env: NodeJS.ProcessEnv & { STUDIO_MEDIA_DIR: string }): Promise<string> {
  const opened = await openAdmin(env, false)
  const [who] = await opened.db.insert(subject).values({ name: 'Fenway' }).returning()
  if (!who) throw new Error('no subject')
  const submitted = await opened.studio.submit({
    endpoint: 'minimax/h3-max-turbo/image-to-video',
    params: { prompt: 'a fictional cat', duration: 15, resolution: '480P', seed: 'r2' },
    prompt: 'a fictional cat',
    seed: 'r2',
    subjectId: who.id,
  })
  if (submitted.outcome !== 'submitted') throw new Error(submitted.outcome)
  for (let step = 0; step < 4; step += 1) {
    const polled = await opened.studio.poll(submitted.jobId)
    if (polled.outcome === 'completed') break
  }
  if ((await opened.studio.download(submitted.jobId)).outcome !== 'downloaded') throw new Error('download')
  const [row] = await opened.db.select().from(job).where(eq(job.id, submitted.jobId))
  const [gen] = row ? await opened.db.select().from(generation).where(eq(generation.id, row.generationId)) : []
  if (!gen?.outputAssetId) throw new Error('no output')
  await opened.db.update(asset).set({ width: 1920, height: 1080, durationS: '5.000' }).where(eq(asset.id, gen.outputAssetId))
  const stillPath = path.join(env.STUDIO_MEDIA_DIR, 'still.jpg')
  writeFileSync(stillPath, minimalJpeg)
  const [still] = await opened.db.insert(asset).values({
    role: 'keyframe',
    sha256: createHash('sha256').update(minimalJpeg).digest('hex'),
    mime: 'image/jpeg',
    bytes: minimalJpeg.byteLength,
    width: 8,
    height: 8,
    localPath: stillPath,
  }).returning()
  if (!still) throw new Error('still')
  await opened.db.insert(generationInput).values({ generationId: gen.id, assetId: still.id, role: 'first' })
  if ((await opened.studio.keep(submitted.jobId, CHECKLIST_LINES.map((line) => ({ line, answer: 'clear' as const, by: 'operator' })))).outcome !== 'kept') {
    throw new Error('keep')
  }
  await opened.close()
  return submitted.jobId
}

async function recordGate(admin: AdminServer, cookie: string): Promise<void> {
  const gate = JSON.parse((await ask(admin, {
    path: '/api/gate',
    method: 'POST',
    headers: { cookie, origin: admin.origin, 'content-type': 'application/json' },
    body: JSON.stringify({
      answer: 'Recorded for the R2 test.',
      disclosure: 'The Generated label stays.',
      recordedBy: 'operator',
      source: 'test',
    }),
  })).body) as { outcome: string }
  expect(gate.outcome).toBe('gate-recorded')
}

describe('live R2', () => {
  it('prints storage=r2 and shows the publish confirmation', async () => {
    const env = folders()
    const admin = await startAdmin({
      live: true,
      env,
      port: 0,
      fetchImpl: async () => {
        throw new Error('storage fetch ran before a publish')
      },
    })
    servers.push(admin)
    expect(admin.storage).toBe('r2')
    expect(admin.transport).toBe('live')
    expect(admin.databaseEngine).toBe('pglite')
    const cookie = await cookieFor(admin)
    const shell = JSON.parse((await ask(admin, { path: '/api/shell', headers: { cookie } })).body) as ShellView
    expect(shell.transport).toBe('live')
    expect(shell.databaseEngine).toBe('pglite')
    expect(shell.storage).toBe('r2')
    expect(shell.fal).toBe('refused')
    const html = renderToStaticMarkup(
      <StudioShell shell={{ ...shell, port: 5176 }} tab="publish" theme="light" onTab={() => undefined} onTheme={() => undefined} />,
    )
    expect(html).toContain('transport=live')
    expect(html).toContain('database=pglite')
    expect(html).toContain('storage=r2')
    const card = renderToStaticMarkup(
      <PublishCard
        view={{ outcome: 'publish', status: 'kept', gateRecorded: true, gateReason: null, refusals: [], assetId: null }}
        publicId="fenway-live"
        title="Fenway"
        onPublicId={() => undefined}
        onTitle={() => undefined}
        gateAnswer=""
        gateDisclosure=""
        gateBy=""
        gateSource=""
        position="1"
        onGateAnswer={() => undefined}
        onGateDisclosure={() => undefined}
        onGateBy={() => undefined}
        onGateSource={() => undefined}
        onPosition={() => undefined}
        onGate={() => undefined}
        onPublish={() => undefined}
        onUnpublish={() => undefined}
        onRetryDelete={() => undefined}
        onRetryRemoval={() => undefined}
        confirm={shell.storage === 'refused' ? STORAGE_REFUSAL : DRAFT.publishConfirm}
      />,
    )
    expect(card).toContain(DRAFT.publishConfirm)
    expect(card).not.toContain(STORAGE_REFUSAL)
  })

  it('uploads both objects before the catalog row, then deletes through the adapter', async () => {
    const env = folders()
    const jobId = await keptClip(env)
    const during: (string | null)[] = []
    let admin: AdminServer | undefined
    let cookie = ''
    const { fetchImpl, seen } = capturing(async (item) => {
      if (!admin) throw new Error('admin is not listening')
      if (item.method === 'PUT') {
        const preview = JSON.parse((await ask(admin, {
          path: `/api/publish/${jobId}?publicId=fenway-live`,
          headers: { cookie },
        })).body) as { publicId: string | null }
        during.push(preview.publicId)
      }
      return new Response(null, { status: item.method === 'DELETE' ? 204 : 200 })
    })
    admin = await startAdmin({ live: true, env, port: 0, fetchImpl })
    servers.push(admin)
    cookie = await cookieFor(admin)
    const headers = { cookie, origin: admin.origin, 'content-type': 'application/json' }
    await recordGate(admin, cookie)
    const published = JSON.parse((await ask(admin, {
      path: `/api/publish/${jobId}/go`,
      method: 'POST',
      headers,
      body: JSON.stringify({ publicId: 'fenway-live', title: 'Fenway', position: 1, confirm: true }),
    })).body) as { outcome: string; live?: boolean }
    expect(published.outcome).toBe('published')
    expect(published.live).toBe(true)
    expect(JSON.stringify(published)).not.toContain(SECRET)
    expect(during).toEqual([null, null])
    expect(seen.map((item) => item.method)).toEqual(['PUT', 'PUT'])
    expect(seen[0]?.url).toContain('https://accountid123.r2.cloudflarestorage.com/moments-live/moments/fenway-live/video-')
    expect(seen[1]?.url).toContain('https://accountid123.r2.cloudflarestorage.com/moments-live/moments/fenway-live/thumbnail-')
    const listed = JSON.parse((await ask(admin, { path: '/api/jobs', headers: { cookie } })).body) as { id: string; status: string }[]
    expect(listed.find((item) => item.id === jobId)?.status).toBe('published')

    const withdrawn = JSON.parse((await ask(admin, {
      path: `/api/publish/${jobId}/unpublish`,
      method: 'POST',
      headers,
      body: JSON.stringify({ deleteFiles: true }),
    })).body) as { outcome: string; filesReadable: boolean; videoRemoved: boolean; thumbnailRemoved: boolean; removal: string }
    expect(withdrawn).toMatchObject({
      outcome: 'withdrawn',
      filesReadable: false,
      videoRemoved: true,
      thumbnailRemoved: true,
      removal: 'merged',
    })
    expect(seen.map((item) => item.method)).toEqual(['PUT', 'PUT', 'DELETE', 'DELETE'])
    const retried = JSON.parse((await ask(admin, {
      path: `/api/publish/${jobId}/retry-delete`,
      method: 'POST',
      headers,
      body: '{}',
    })).body) as { outcome: string; idempotent: boolean; filesReadable: boolean }
    expect(retried).toMatchObject({ outcome: 'delete-retried', idempotent: true, filesReadable: false })
    expect(seen.filter((item) => item.method === 'DELETE')).toHaveLength(2)
    const removal = JSON.parse((await ask(admin, {
      path: `/api/publish/${jobId}/retry-removal`,
      method: 'POST',
      headers,
      body: '{}',
    })).body) as { outcome: string; idempotent: boolean }
    expect(removal).toMatchObject({ outcome: 'merged', idempotent: true })
    await admin.close()
    servers.pop()
    const check = await openAdmin(env, true, { fetchImpl: async () => new Response(null, { status: 200 }) })
    expect(await check.db.select().from(videos)).toHaveLength(1)
    expect((await check.db.select().from(videos))[0]?.publishedAt).toBeNull()
    await check.close()
  })

  it('writes no catalog row when the upload fails, and names status and code', async () => {
    const env = folders()
    const jobId = await keptClip(env)
    const { fetchImpl, seen } = capturing(() => new Response(
      '<?xml version="1.0"?><Error><Code>AccessDenied</Code><Message>body-must-not-leak</Message></Error>',
      { status: 403 },
    ))
    const admin = await startAdmin({ live: true, env, port: 0, fetchImpl })
    servers.push(admin)
    const cookie = await cookieFor(admin)
    const headers = { cookie, origin: admin.origin, 'content-type': 'application/json' }
    await recordGate(admin, cookie)
    const failed = JSON.parse((await ask(admin, {
      path: `/api/publish/${jobId}/go`,
      method: 'POST',
      headers,
      body: JSON.stringify({ publicId: 'fenway-live', title: 'Fenway', position: 1, confirm: true }),
    })).body) as { outcome: string; status?: number; code?: string; object?: string }
    expect(failed).toMatchObject({ outcome: 'upload-failed', object: 'video', status: 403, code: 'AccessDenied' })
    expect(JSON.stringify(failed)).not.toContain('body-must-not-leak')
    expect(JSON.stringify(failed)).not.toContain(SECRET)
    expect(statusLine(failed)).toBe(`${DRAFT.uploadFailed} status=403 code=AccessDenied`)
    expect(seen).toHaveLength(1)
    expect(seen[0]?.method).toBe('PUT')
    const listed = JSON.parse((await ask(admin, { path: '/api/jobs', headers: { cookie } })).body) as { id: string; status: string }[]
    expect(listed.find((item) => item.id === jobId)?.status).toBe('kept')
    await admin.close()
    servers.pop()
    const check = await openAdmin(env, true, { fetchImpl: async () => new Response(null, { status: 200 }) })
    expect(await check.db.select().from(videos)).toEqual([])
    await check.close()
  })

  it('fails a 404 delete and keeps the file recorded', async () => {
    const env = folders()
    const jobId = await keptClip(env)
    let method = 'PUT'
    const { fetchImpl, seen } = capturing(() => {
      if (method === 'DELETE') {
        return new Response(
          '<?xml version="1.0"?><Error><Code>NoSuchBucket</Code><Message>body-must-not-leak</Message></Error>',
          { status: 404 },
        )
      }
      return new Response(null, { status: 200 })
    })
    const admin = await startAdmin({ live: true, env, port: 0, fetchImpl })
    servers.push(admin)
    const cookie = await cookieFor(admin)
    const headers = { cookie, origin: admin.origin, 'content-type': 'application/json' }
    await recordGate(admin, cookie)
    const published = JSON.parse((await ask(admin, {
      path: `/api/publish/${jobId}/go`,
      method: 'POST',
      headers,
      body: JSON.stringify({ publicId: 'fenway-live', title: 'Fenway', position: 1, confirm: true }),
    })).body) as { outcome: string }
    expect(published.outcome).toBe('published')
    method = 'DELETE'
    const withdrawn = JSON.parse((await ask(admin, {
      path: `/api/publish/${jobId}/unpublish`,
      method: 'POST',
      headers,
      body: JSON.stringify({ deleteFiles: true }),
    })).body) as { outcome: string; filesReadable: boolean; status: number; code: string; videoRemoved: boolean }
    expect(withdrawn).toMatchObject({
      outcome: 'withdrawn',
      filesReadable: true,
      videoRemoved: false,
      status: 404,
      code: 'NoSuchBucket',
    })
    expect(JSON.stringify(withdrawn)).not.toContain('body-must-not-leak')
    expect(statusLine(withdrawn)).toBe(`${DRAFT.deleteFailed} status=404 code=NoSuchBucket`)
    const again = JSON.parse((await ask(admin, {
      path: `/api/publish/${jobId}/retry-delete`,
      method: 'POST',
      headers,
      body: '{}',
    })).body) as { outcome: string; filesReadable: boolean; status: number; code: string; idempotent: boolean }
    expect(again).toMatchObject({
      outcome: 'delete-retried',
      filesReadable: true,
      status: 404,
      code: 'NoSuchBucket',
      idempotent: false,
    })
    expect(seen.filter((item) => item.method === 'DELETE').length).toBeGreaterThan(0)
    expect(seen.every((item) => item.url.startsWith('https://accountid123.r2.cloudflarestorage.com/'))).toBe(true)
  })
})
