import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { eq } from 'drizzle-orm'
import { afterEach, describe, expect, it } from 'vitest'
import { CHECKLIST_LINES, event, videos } from '../db/schema.ts'
import { createStudio } from '../engine.ts'
import { createFalStub } from '../fal/stub.ts'
import { sha256 } from '../hash.ts'
import { redact } from '../log/redact.ts'
import { syntheticMp4 } from '../media/mp4.ts'
import { createR2Storage, missingR2, s3ErrorCode } from '../storage/r2.ts'
import { ObjectStoreError } from '../storage/port.ts'
import type { DatabaseFactory } from '../cli.ts'
import { sha256Hex } from '../storage/sigv4.ts'
import { runCli } from '../cli.ts'
import { freshDatabase, type StudioClient } from './harness.ts'
import { minimalJpeg } from './jpeg.ts'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const clients: StudioClient[] = []
const MAC_EPOCH_SECONDS = 2_082_844_800
const SECRET = ['super', '-secret-value'].join('')
const ACCOUNT = ['R2', '_ACCOUNT_ID'].join('')
const ACCESS = ['R2', '_ACCESS_KEY_ID'].join('')
const SECRET_NAME = ['R2', '_SECRET_ACCESS_KEY'].join('')
const BUCKET = ['R2', '_BUCKET'].join('')

afterEach(async () => {
  await Promise.all(clients.splice(0).map((client) => client.close()))
})

function r2Env(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  return {
    [ACCOUNT]: 'accountid123',
    [ACCESS]: 'AKIAEXAMPLEKEY',
    [SECRET_NAME]: SECRET,
    [BUCKET]: 'moments-live',
    ...extra,
  }
}

type Seen = { method: string; url: string; headers: Record<string, string>; bodyHash: string; redirect: string }

function capturing(respond: (seen: Seen) => Response) {
  const seen: Seen[] = []
  const fetchImpl: typeof fetch = async (input, init) => {
    const body = init?.body
    const bytes = body instanceof Uint8Array ? body : new Uint8Array()
    const headers: Record<string, string> = {}
    new Headers(init?.headers).forEach((value, key) => {
      headers[key] = value
    })
    const item: Seen = {
      method: init?.method ?? 'GET',
      url: String(input),
      headers,
      bodyHash: sha256Hex(bytes),
      redirect: String(init?.redirect ?? ''),
    }
    seen.push(item)
    return respond(item)
  }
  return { fetchImpl, seen }
}

function logOf(seen: Seen[]): string {
  return seen.map((item) => `${item.method} ${item.url} ${JSON.stringify(item.headers)} ${item.bodyHash}`).join('\n')
}

describe('R2 storage', () => {
  it('puts and deletes through a stubbed fetch, with the secret nowhere in the capture', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'kickoff-r2-'))
    const file = path.join(dir, 'clip.mp4')
    const bytes = Buffer.from('a synthetic clip')
    writeFileSync(file, bytes)
    const digest = sha256(bytes)
    const { fetchImpl, seen } = capturing(() => new Response(null, { status: 200 }))
    const port = createR2Storage({ env: r2Env(), fetchImpl, now: () => new Date('2026-10-18T16:00:00.000Z') })
    const stored = await port.putVideo({ localPath: file, sha256: digest, publicId: 'fenway', mime: 'video/mp4' })
    expect(stored).toEqual({ bucket: 'moments', objectPath: `fenway/video-${digest.slice(0, 8)}.mp4` })
    expect(seen).toHaveLength(1)
    const [put] = seen
    expect(put?.method).toBe('PUT')
    expect(put?.redirect).toBe('manual')
    expect(put?.url).toBe(`https://accountid123.r2.cloudflarestorage.com/moments-live/moments/fenway/video-${digest.slice(0, 8)}.mp4`)
    expect(put?.headers['content-type']).toBe('video/mp4')
    expect(put?.headers['content-length']).toBe(String(bytes.byteLength))
    expect(put?.headers['x-amz-content-sha256']).toBe(sha256Hex(bytes))
    expect(put?.bodyHash).toBe(sha256Hex(bytes))
    expect(put?.headers.authorization).toContain('/auto/s3/aws4_request')
    expect(put?.headers.authorization).toContain('AKIAEXAMPLEKEY')
    expect(logOf(seen)).not.toContain(SECRET)
    expect(redact(logOf(seen))).not.toContain(SECRET)
    expect(redact(`${SECRET_NAME}=${SECRET}`)).not.toContain(SECRET)

    seen.length = 0
    const gone = capturing((item) => new Response(null, { status: item.method === 'DELETE' ? 204 : 200 }))
    const deleting = createR2Storage({ env: r2Env(), fetchImpl: gone.fetchImpl, now: () => new Date('2026-10-18T16:00:00.000Z') })
    await deleting.remove(stored)
    expect(gone.seen[0]?.method).toBe('DELETE')
    expect(gone.seen[0]?.url).toBe(put?.url)
    expect(logOf(gone.seen)).not.toContain(SECRET)
    const missingBucket = capturing(() => new Response(
      '<?xml version="1.0"?><Error><Code>NoSuchBucket</Code><Message>body-must-not-leak</Message></Error>',
      { status: 404 },
    ))
    await expect(createR2Storage({ env: r2Env(), fetchImpl: missingBucket.fetchImpl }).remove(stored)).rejects.toMatchObject({
      status: 404,
      code: 'NoSuchBucket',
    })

    const missing = capturing(() => new Response('no', { status: 500 }))
    const failing = createR2Storage({ env: r2Env(), fetchImpl: missing.fetchImpl })
    await expect(failing.putThumbnail({
      localPath: file,
      sha256: digest,
      publicId: 'fenway',
      mime: 'image/jpeg',
    })).rejects.toThrow('thumbnail upload failed (500)')
    expect(String(await failing.putThumbnail({
      localPath: file,
      sha256: digest,
      publicId: 'fenway',
      mime: 'image/jpeg',
    }).catch((error: unknown) => error instanceof Error ? error.message : ''))).not.toContain(SECRET)
  })

  it('records status and the S3 code, and never the body', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'kickoff-r2-code-'))
    const file = path.join(dir, 'clip.mp4')
    writeFileSync(file, Buffer.from('clip'))
    const digest = sha256(Buffer.from('clip'))
    const input = { localPath: file, sha256: digest, publicId: 'fenway', mime: 'video/mp4' }
    const object = { bucket: 'moments', objectPath: 'fenway/video-aaaaaaaa.mp4' }
    const xml = (code: string) => `<?xml version="1.0"?><Error><Code>${code}</Code><Message>body-must-not-leak</Message></Error>`
    const take = async (response: Response | Error) => {
      const port = createR2Storage({
        env: r2Env(),
        fetchImpl: async () => {
          if (response instanceof Error) throw response
          return response
        },
      })
      return port.putVideo(input).then(() => {
        throw new Error('expected a failure')
      }, (error: unknown) => error)
    }

    const forbidden = await take(new Response(xml('SignatureDoesNotMatch'), { status: 403 }))
    expect(forbidden).toBeInstanceOf(ObjectStoreError)
    expect(forbidden).toMatchObject({ status: 403, code: 'SignatureDoesNotMatch' })
    expect(String((forbidden as Error).message)).not.toContain('body-must-not-leak')

    const missing = await take(new Response(xml('NoSuchBucket'), { status: 404 }))
    expect(missing).toMatchObject({ status: 404, code: 'NoSuchBucket' })
    expect(String((missing as Error).message)).not.toContain('<Message>')

    const offline = await take(new Error('connect ECONNREFUSED secret-host'))
    expect(offline).toMatchObject({ status: null, code: 'network' })
    expect(String((offline as Error).message)).not.toContain('secret-host')

    const removed = createR2Storage({
      env: r2Env(),
      fetchImpl: async () => new Response(xml('SignatureDoesNotMatch'), { status: 403 }),
    })
    await expect(removed.remove(object)).rejects.toMatchObject({ status: 403, code: 'SignatureDoesNotMatch' })

    const planted = ['R2_SECRET', '_ACCESS_KEY'].join('')
    expect(s3ErrorCode(xml(`${planted}=${SECRET}`))).not.toContain(SECRET)
    expect(s3ErrorCode(xml(`${planted}=${SECRET}`))).toContain('[redacted]')
  })

  it('honours each STUDIO_STORAGE_FAIL token without a request', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'kickoff-r2-fail-'))
    const file = path.join(dir, 'clip.mp4')
    writeFileSync(file, Buffer.from('clip'))
    const digest = sha256(Buffer.from('clip'))
    const input = { localPath: file, sha256: digest, publicId: 'fenway', mime: 'video/mp4' }
    const object = { bucket: 'moments', objectPath: 'fenway/video-aaaaaaaa.mp4' }
    const thumb = { bucket: 'moments', objectPath: 'fenway/thumbnail-aaaaaaaa.jpg' }

    const video = capturing(() => new Response(null, { status: 200 }))
    await expect(createR2Storage({ env: r2Env({ STUDIO_STORAGE_FAIL: 'video' }), fetchImpl: video.fetchImpl }).putVideo(input)).rejects.toThrow('video upload failed')
    expect(video.seen).toHaveLength(0)

    const thumbnail = capturing(() => new Response(null, { status: 200 }))
    await expect(createR2Storage({ env: r2Env({ STUDIO_STORAGE_FAIL: 'thumbnail' }), fetchImpl: thumbnail.fetchImpl }).putThumbnail({ ...input, mime: 'image/jpeg' })).rejects.toThrow('thumbnail upload failed')
    expect(thumbnail.seen).toHaveLength(0)

    const remove = capturing(() => new Response(null, { status: 200 }))
    await expect(createR2Storage({ env: r2Env({ STUDIO_STORAGE_FAIL: 'remove' }), fetchImpl: remove.fetchImpl }).remove(object)).rejects.toThrow('video remove failed')
    await expect(createR2Storage({ env: r2Env({ STUDIO_STORAGE_FAIL: 'video-remove' }), fetchImpl: remove.fetchImpl }).remove(object)).rejects.toThrow('video remove failed')
    await expect(createR2Storage({ env: r2Env({ STUDIO_STORAGE_FAIL: 'thumbnail-remove' }), fetchImpl: remove.fetchImpl }).remove(thumb)).rejects.toThrow('thumbnail remove failed')
    expect(remove.seen).toHaveLength(0)

    const site = createR2Storage({ env: r2Env({ STUDIO_STORAGE_FAIL: 'fallback,removal' }), fetchImpl: remove.fetchImpl })
    expect(await site.deliverFallback({ publicId: 'fenway', sourceSha256: digest })).toMatchObject({ outcome: 'checks-failed' })
    expect(await site.removeSiteCopy({ publicId: 'fenway' })).toMatchObject({ outcome: 'checks-failed' })

    const absent = capturing(() => new Response(null, { status: 204 }))
    await createR2Storage({ env: r2Env(), fetchImpl: absent.fetchImpl }).remove(object)
    expect(absent.seen).toHaveLength(1)
    const bounced = capturing(() => new Response(null, { status: 302 }))
    await expect(createR2Storage({ env: r2Env(), fetchImpl: bounced.fetchImpl }).putVideo(input)).rejects.toThrow('video upload failed (302)')
    expect(bounced.seen).toHaveLength(1)
    await expect(createR2Storage({ env: r2Env(), fetchImpl: video.fetchImpl }).putVideo({ ...input, localPath: path.join(dir, 'missing.mp4') })).rejects.toThrow('video upload failed')
  })

  it('retries only the object that failed, then deletes, and leaves the secret out of the log', async () => {
    const { client, db } = await freshDatabase()
    clients.push(client)
    const mediaDir = mkdtempSync(path.join(tmpdir(), 'kickoff-r2-media-'))
    let thumbnails = 0
    const { fetchImpl, seen } = capturing((item) => {
      if (item.method === 'PUT' && item.url.includes('/thumbnail-') && thumbnails++ === 0) return new Response('no', { status: 500 })
      if (item.method === 'DELETE') {
        return new Response(
          '<?xml version="1.0"?><Error><Code>NoSuchBucket</Code><Message>body-must-not-leak</Message></Error>',
          { status: 404 },
        )
      }
      return new Response(null, { status: 200 })
    })
    const studio = createStudio({
      db,
      fal: createFalStub('queued-then-completed'),
      storage: createR2Storage({ env: r2Env(), fetchImpl, now: () => new Date('2026-10-18T16:00:00.000Z') }),
      mediaDir,
      repoRoot,
      clock: () => new Date('2026-10-18T16:00:00.000Z'),
    })
    const created = Math.floor(Date.parse('2026-10-18T15:00:00.000Z') / 1000) + MAC_EPOCH_SECONDS
    const imported = await studio.importClip({
      video: syntheticMp4({ width: 1920, height: 1080, durationS: 5, frameRate: 24, audio: true, creationTime: created }),
      keyframe: minimalJpeg,
      source: 'grok-imagine',
      prompt: 'A cat scores',
      subjects: ['Fenway'],
      title: 'Fenway',
    })
    expect(imported.outcome).toBe('imported')
    if (imported.outcome !== 'imported') return
    expect((await studio.keep(imported.jobId, CHECKLIST_LINES.map((line) => ({ line, answer: 'clear' as const, by: 'operator' })))).outcome).toBe('kept')
    expect((await studio.recordGate({
      answer: 'recorded',
      disclosure: 'pending a named answer',
      recordedBy: 'unspecified',
      source: 'A-06',
    })).outcome).toBe('gate-recorded')
    const failed = await studio.publish({ jobId: imported.jobId, publicId: 'fenway', title: 'Fenway', position: 1 })
    expect(failed).toMatchObject({ outcome: 'upload-failed', object: 'thumbnail', live: false, status: 500, code: 'unknown' })
    expect(await db.select().from(videos)).toHaveLength(0)
    const failedEvents = await db.select().from(event).where(eq(event.jobId, imported.jobId))
    expect(failedEvents.filter((row) => row.type === 'upload-failed').map((row) => row.detail)).toEqual([{ object: 'thumbnail', status: 500, code: 'unknown' }])
    expect(seen.filter((item) => item.method === 'PUT' && item.url.includes('/video-'))).toHaveLength(1)
    expect(seen.filter((item) => item.method === 'PUT' && item.url.includes('/thumbnail-'))).toHaveLength(1)

    const published = await studio.publish({ jobId: imported.jobId, publicId: 'fenway', title: 'Fenway', position: 1 })
    expect(published).toMatchObject({ outcome: 'published', live: true })
    expect(seen.filter((item) => item.method === 'PUT' && item.url.includes('/video-'))).toHaveLength(1)
    expect(seen.filter((item) => item.method === 'PUT' && item.url.includes('/thumbnail-'))).toHaveLength(2)
    const withdrawn = await studio.unpublish(imported.jobId, { deleteFiles: true })
    expect(withdrawn).toMatchObject({
      outcome: 'withdrawn',
      videoRemoved: false,
      thumbnailRemoved: false,
      filesReadable: true,
      status: 404,
      code: 'NoSuchBucket',
    })
    expect(JSON.stringify(withdrawn)).not.toContain('body-must-not-leak')
    expect(seen.filter((item) => item.method === 'DELETE')).toHaveLength(2)
    expect(logOf(seen)).not.toContain(SECRET)
    expect(redact(logOf(seen))).not.toContain(SECRET)
  })

  it('refuses a live publish by the missing name, and leaves the fal commands alone', async () => {
    const planted = 'planted-account-value'
    const err: string[] = []
    const io = { stdout: () => undefined, stderr: (line: string) => err.push(line) }
    const env: NodeJS.ProcessEnv = { STUDIO_LIVE: '1', [ACCOUNT]: planted }
    expect(await runCli(['publish', '--live', '--job', 'x', '--public-id', 'fenway', '--title', 'Fenway', '--position', '1'], env, io)).toBe(1)
    expect(err.join('\n')).toContain('R2_ACCESS_KEY_ID')
    expect(err.join('\n')).toContain('R2_SECRET_ACCESS_KEY')
    expect(err.join('\n')).toContain('R2_BUCKET')
    expect(err.join('\n')).toContain('DATABASE_URL')
    expect(err.join('\n')).not.toContain(planted)
    const databaseOnly: string[] = []
    expect(await runCli(['publish', '--live', '--job', 'x', '--public-id', 'fenway', '--title', 'Fenway', '--position', '1'], {
      ...r2Env(),
      STUDIO_LIVE: '1',
    }, { stdout: () => undefined, stderr: (line) => databaseOnly.push(line) })).toBe(1)
    expect(databaseOnly).toEqual(['refused: --live needs DATABASE_URL'])
    expect(databaseOnly.join('\n')).not.toContain(SECRET)
    expect(missingR2({})).toEqual(['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET'])

    const falErr: string[] = []
    expect(await runCli(['submit', '--live', '--endpoint', 'x', '--prompt', 'x'], { STUDIO_LIVE: '1' }, {
      stdout: () => undefined,
      stderr: (line) => falErr.push(line),
    })).toBe(1)
    expect(falErr.join('\n')).toContain('FAL_KEY')
    expect(falErr.join('\n')).not.toContain('R2_')

    const listed: string[] = []
    expect(await runCli(['list', '--live'], { STUDIO_LIVE: '1' }, {
      stdout: (line) => listed.push(line),
      stderr: (line) => listed.push(line),
    })).toBe(1)
    expect(listed).toEqual(['refused: --live needs DATABASE_URL'])
    expect(listed.join('\n')).not.toContain('R2_')
  })

  it('prints status and code for a failed upload and a failed delete', async () => {
    const { client, db } = await freshDatabase()
    clients.push(client)
    const factory: DatabaseFactory = async ({ live }) => {
      if (!live) throw new Error('pglite')
      return { db, kind: 'postgres', close: async () => undefined }
    }
    const media = mkdtempSync(path.join(tmpdir(), 'kickoff-r2-print-'))
    const data = mkdtempSync(path.join(tmpdir(), 'kickoff-r2-print-data-'))
    const video = path.join(media, 'clip.mp4')
    const still = path.join(media, 'k0.jpg')
    const prompt = path.join(media, 'prompt.txt')
    const created = Math.floor(Date.parse('2026-10-18T15:00:00.000Z') / 1000) + MAC_EPOCH_SECONDS
    writeFileSync(video, syntheticMp4({ width: 1920, height: 1080, durationS: 5, frameRate: 24, audio: true, creationTime: created }))
    writeFileSync(still, minimalJpeg)
    writeFileSync(prompt, 'A cat scores\n')
    const databaseUrl = ['postgres', '://', 'example.invalid/studio'].join('')
    const env = {
      ...r2Env(),
      STUDIO_LIVE: '1',
      DATABASE_URL: databaseUrl,
      STUDIO_DATA_DIR: data,
      STUDIO_MEDIA_DIR: media,
      STUDIO_NOW: '2026-10-21T16:00:00.000Z',
    }
    const xml = (code: string) => `<?xml version="1.0"?><Error><Code>${code}</Code><Message>body-must-not-leak</Message></Error>`
    let puts = 0
    const { fetchImpl } = capturing((item) => {
      if (item.method === 'PUT' && puts++ === 0) return new Response(xml('SignatureDoesNotMatch'), { status: 403 })
      if (item.method === 'DELETE') return new Response(xml('NoSuchBucket'), { status: 500 })
      return new Response(null, { status: 200 })
    })
    const options = { openDatabase: factory, fetchImpl }
    const say = () => {
      const out: string[] = []
      const err: string[] = []
      return { out, err, stdout: (line: string) => out.push(line), stderr: (line: string) => err.push(line) }
    }
    const imported = say()
    expect(await runCli([
      'import', '--live', '--file', video, '--keyframe', still, '--source', 'grok-imagine',
      '--prompt-file', prompt, '--subjects', 'Fenway', '--title', 'Fenway', '--made-on', '2026-10-21',
    ], env, imported, options)).toBe(0)
    const job = /job=([0-9a-f-]{36})/.exec(imported.out[0] ?? '')?.[1] ?? ''
    expect(await runCli(['keep', '--live', '--job', job, '--answers', CHECKLIST_LINES.map(() => 'clear').join(',')], env, say(), options)).toBe(0)
    expect(await runCli(['record-gate', '--live', '--answer', 'recorded', '--disclosure', 'pending', '--by', 'unspecified', '--source', 'A-06'], env, say(), options)).toBe(0)

    const failed = say()
    expect(await runCli(['publish', '--live', '--job', job, '--public-id', 'fenway', '--title', 'Fenway', '--position', '1'], env, failed, options)).toBe(0)
    expect(failed.out[0]).toBe('upload-failed live=false object=video status=403 code=SignatureDoesNotMatch database=postgres storage=r2')
    expect(failed.out.join('\n')).not.toContain('body-must-not-leak')
    const failedEvents = await db.select().from(event).where(eq(event.jobId, job))
    expect(failedEvents.filter((row) => row.type === 'upload-failed').map((row) => row.detail)).toEqual([
      { object: 'video', status: 403, code: 'SignatureDoesNotMatch' },
    ])

    expect(await runCli(['publish', '--live', '--job', job, '--public-id', 'fenway', '--title', 'Fenway', '--position', '1'], env, say(), options)).toBe(0)
    const withdrawn = say()
    expect(await runCli(['unpublish', '--live', '--delete', '--job', job], env, withdrawn, options)).toBe(0)
    expect(withdrawn.out[0]).toContain('status=500')
    expect(withdrawn.out[0]).toContain('code=NoSuchBucket')
    expect(withdrawn.out.join('\n')).not.toContain('body-must-not-leak')
    const deleted = await db.select().from(event).where(eq(event.jobId, job))
    expect(deleted.filter((row) => row.type === 'delete-failed').map((row) => row.detail)).toEqual([
      { object: 'video', status: 500, code: 'NoSuchBucket' },
      { object: 'thumbnail', status: 500, code: 'NoSuchBucket' },
    ])
  })
})
