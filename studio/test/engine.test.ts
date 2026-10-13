import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { eq } from 'drizzle-orm'
import { afterEach, describe, expect, it } from 'vitest'
import { CHECKLIST_LINES, asset, generation, generationInput, job, ledger, videos } from '../db/schema.ts'
import { createStudio, type Studio, type StudioFlags } from '../engine.ts'
import { FAL_HEADER } from '../fal/headers.ts'
import type { ScriptName } from '../fal/stub.ts'
import { createFalStub } from '../fal/stub.ts'
import { sha256 } from '../hash.ts'
import { createStorageStub, type StorageScript } from '../storage/stub.ts'
import { freshDatabase, type StudioClient, type StudioDatabase } from './harness.ts'
import { minimalJpeg, taggedJpeg } from './jpeg.ts'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const clients: StudioClient[] = []

afterEach(async () => {
  await Promise.all(clients.splice(0).map((client) => client.close()))
})

const VIDEO = 'minimax/h3-max-turbo/image-to-video'

function clears(answer: 'clear' | 'present' | 'unsure' = 'clear') {
  return CHECKLIST_LINES.map((line) => ({ line, answer, by: 'operator' }))
}

async function openStudio(script: ScriptName = 'queued-then-completed') {
  const { client, db } = await freshDatabase()
  clients.push(client)
  const mediaDir = mkdtempSync(path.join(tmpdir(), 'kickoff-studio-'))
  const fal = createFalStub(script)
  const storageScript: StorageScript = {}
  const storage = createStorageStub(storageScript)
  const flags: StudioFlags = { breakLedgerWrite: false, breakAfterAccept: false, breakRecordWrite: false }
  let now = new Date('2026-10-12T16:00:00.000Z')
  const studio = createStudio({
    db,
    fal,
    storage: storage.port,
    mediaDir,
    repoRoot,
    clock: () => now,
    flags,
  })
  return {
    client,
    db,
    studio,
    fal,
    storage,
    storageScript,
    flags,
    mediaDir,
    advance(ms: number) {
      now = new Date(now.getTime() + ms)
    },
  }
}

function videoInput(seed = '1', duration = 15) {
  return {
    endpoint: VIDEO,
    params: { prompt: 'a fictional cat', duration, resolution: '480P', seed },
    prompt: 'a fictional cat',
    seed,
  }
}

async function settle(studio: Studio, seed = '1', duration = 15) {
  const submitted = await studio.submit(videoInput(seed, duration))
  expect(submitted.outcome).toBe('submitted')
  if (submitted.outcome !== 'submitted') throw new Error('not submitted')
  const seen: string[] = []
  let last: Awaited<ReturnType<Studio['poll']>> | undefined
  for (let step = 0; step < 4; step += 1) {
    last = await studio.poll(submitted.jobId)
    seen.push(last.outcome)
    if (last.outcome === 'completed' || last.outcome === 'failed' || last.outcome === 'refused' || last.outcome === 'timed-out') {
      return { jobId: submitted.jobId, requestId: submitted.requestId, last, seen }
    }
  }
  throw new Error(seen.join(','))
}

async function keptClip(script: ScriptName = 'queued-then-completed') {
  const opened = await openStudio(script)
  const done = await settle(opened.studio)
  expect(done.last.outcome).toBe('completed')
  const downloaded = await opened.studio.download(done.jobId)
  expect(downloaded.outcome).toBe('downloaded')
  const kept = await opened.studio.keep(done.jobId, clears())
  expect(kept.outcome).toBe('kept')
  const [row] = await opened.db.select().from(job).where(eq(job.id, done.jobId))
  if (!row) throw new Error('missing job')
  const [k0] = await opened.db.insert(asset).values({
    role: 'keyframe',
    sha256: 'k0-hash',
    mime: 'image/jpeg',
    bytes: 4,
    localPath: path.join(opened.mediaDir, 'k0.jpg'),
  }).returning()
  if (!k0) throw new Error('missing keyframe')
  await opened.db.insert(generationInput).values({
    generationId: row.generationId,
    assetId: k0.id,
    role: 'first',
  })
  return { ...opened, jobId: done.jobId, generationId: row.generationId }
}

async function publishedCount(client: StudioClient): Promise<number> {
  const result = await client.query<{ id: string }>('SELECT id FROM catalog.videos')
  return result.rows.length
}

describe('state machine', () => {
  it('refuses a media directory inside the worktree', () => {
    expect(() => createStudio({
      db: {} as StudioDatabase,
      fal: createFalStub('timeout'),
      storage: createStorageStub().port,
      mediaDir: repoRoot,
      repoRoot,
    })).toThrow(/outside the worktree/)
  })

  it('writes the estimate before the request and reconciles billable units', async () => {
    const { db, studio, fal } = await openStudio()
    const estimate = await studio.estimate(videoInput())
    expect(estimate).toMatchObject({ outcome: 'estimate', usd: '0.225000' })
    const submitted = await studio.submit(videoInput())
    expect(submitted.outcome).toBe('submitted')
    if (submitted.outcome !== 'submitted') return
    const pending = await db.select().from(ledger)
    expect(pending).toHaveLength(1)
    expect(pending[0]?.settlement).toBe('pending')
    expect(pending[0]?.amountUsd).toBeNull()
    expect(fal.calls.filter((call) => call.kind === 'submit')).toHaveLength(1)
    const call = fal.calls[0]
    expect(call?.headers[FAL_HEADER.noRetry]).toBe('1')
    expect(call?.headers[FAL_HEADER.disableFallback]).toBe('1')
    expect(call?.headers[FAL_HEADER.requestTimeout]).toBe('120')
    expect(call?.headers.authorization).toBeUndefined()

    const queued = await studio.poll(submitted.jobId)
    expect(queued.outcome).toBe('queued')
    const running = await studio.poll(submitted.jobId)
    expect(running.outcome).toBe('in-progress')
    const done = await studio.poll(submitted.jobId)
    expect(done.outcome).toBe('completed')
    const lines = await db.select().from(ledger).where(eq(ledger.jobId, submitted.jobId))
    const reconciled = lines.find((line) => line.settlement === 'reconciled')
    expect(reconciled?.amountUsd).toBe('0.225000')
    expect(reconciled?.billableUnits).toBe('15.000000')

    const again = await studio.poll(submitted.jobId)
    expect(again.outcome).toBe('duplicate-delivery')
    expect(fal.calls.filter((item) => item.kind === 'result')).toHaveLength(1)
    const afterDuplicate = await db.select().from(ledger).where(eq(ledger.jobId, submitted.jobId))
    expect(afterDuplicate.filter((line) => line.settlement === 'reconciled')).toHaveLength(1)
  })

  it('records budget-refused and does not call fal', async () => {
    const { db, studio, fal } = await openStudio()
    const refused = await studio.submit(videoInput('over', 101))
    expect(refused.outcome).toBe('budget-refused')
    expect(fal.calls).toHaveLength(0)
    expect(await db.select().from(ledger)).toHaveLength(0)
    const listed = await studio.list()
    expect(listed[0]?.status).toBe('budget-refused')
    expect(listed[0]?.publishable).toBe(false)
  })

  it('stops the fifth job when the session reaches $6', async () => {
    const { studio, fal } = await openStudio()
    for (const seed of ['a', 'b', 'c', 'd']) {
      const submitted = await studio.submit(videoInput(seed, 100))
      expect(submitted.outcome).toBe('submitted')
    }
    const fifth = await studio.submit(videoInput('e', 100))
    expect(fifth.outcome).toBe('budget-refused')
    expect(fal.calls.filter((call) => call.kind === 'submit')).toHaveLength(4)
  })

  it('maps a 422 error to failed and a safety body to refused, and does not retry refused', async () => {
    const failed = await openStudio('error-payload')
    const error = await settle(failed.studio, 'err')
    expect(error.last.outcome).toBe('failed')

    const safety = await openStudio('safety-refusal')
    const refused = await settle(safety.studio, 'safe')
    expect(refused.last.outcome).toBe('refused')
    const second = await safety.studio.submit(videoInput('safe'))
    expect(second).toMatchObject({ outcome: 'refused', retried: false })
    expect(safety.fal.calls.filter((call) => call.kind === 'submit')).toHaveLength(1)
  })

  it('times out on the proposal ceiling and keeps the label', async () => {
    const { studio, advance } = await openStudio('timeout')
    const submitted = await studio.submit(videoInput('slow'))
    expect(submitted.outcome).toBe('submitted')
    if (submitted.outcome !== 'submitted') return
    expect((await studio.poll(submitted.jobId)).outcome).toBe('queued')
    advance(10 * 60 * 1000 + 1)
    const timed = await studio.poll(submitted.jobId)
    expect(timed).toMatchObject({ outcome: 'timed-out', label: 'proposal', ceilingMs: 600_000 })
  })

  it('keeps the estimate when a cancel does not stop the provider', async () => {
    const { db, studio } = await openStudio()
    const submitted = await studio.submit(videoInput('cancel'))
    if (submitted.outcome !== 'submitted') throw new Error('not submitted')
    await studio.poll(submitted.jobId)
    const cancelled = await studio.cancel(submitted.jobId)
    expect(cancelled).toMatchObject({ outcome: 'cancelled', chargeRetained: true, exposure: '0.225000' })
    const lines = await db.select().from(ledger).where(eq(ledger.jobId, submitted.jobId))
    expect(lines).toHaveLength(1)
    expect(lines[0]?.settlement).toBe('pending')
  })

  it('does not resubmit when the request id was never stored', async () => {
    const { db, studio, fal, flags } = await openStudio()
    flags.breakAfterAccept = true
    const crashed = await studio.submit(videoInput('crash'))
    expect(crashed.outcome).toBe('database-unavailable')
    const rows = await db.select().from(job)
    expect(rows).toHaveLength(1)
    expect(rows[0]?.providerRequestId).toBeNull()
    const resumed = await studio.resume(rows[0]?.id ?? '')
    expect(resumed.outcome).toBe('not-resubmitted')
    expect(fal.calls.filter((call) => call.kind === 'submit')).toHaveLength(1)
  })

  it('refuses the submit when the estimate cannot be written', async () => {
    const { db, studio, fal, flags } = await openStudio()
    flags.breakLedgerWrite = true
    const blocked = await studio.submit(videoInput('db'))
    expect(blocked).toEqual({ outcome: 'database-unavailable' })
    expect(fal.calls).toHaveLength(0)
    expect(await db.select().from(job)).toHaveLength(0)
  })

  it('reconciles an exhausted balance to zero and does not keep the estimate', async () => {
    const { db, studio } = await openStudio('out-of-credit')
    const locked = await studio.submit(videoInput('credit'))
    expect(locked.outcome).toBe('out-of-credit')
    const lines = await db.select().from(ledger)
    expect(lines.some((line) => line.settlement === 'reconciled' && line.amountUsd === '0.000000')).toBe(true)
    const next = await openStudio()
    const balance = await next.studio.recordBalance('9.370000')
    expect(balance).toEqual({ amountUsd: '9.370000', aboveCeiling: false, readFromFal: false })
    const over = await next.studio.recordBalance('9.370001')
    expect(over.aboveCeiling).toBe(true)
    expect(over.readFromFal).toBe(false)
  })

  it('downloads once, retries a failed download without a new charge, and leaves an expired result billed', async () => {
    const first = await openStudio()
    const done = await settle(first.studio, 'dl')
    let fail = true
    const original = first.fal.download.bind(first.fal)
    first.fal.download = async (input) => {
      if (fail) {
        fail = false
        throw new Error('disk')
      }
      return original(input)
    }
    const failed = await first.studio.download(done.jobId)
    expect(failed).toMatchObject({ outcome: 'download-failed', retryWithoutCharge: true })
    const before = await first.db.select().from(ledger).where(eq(ledger.jobId, done.jobId))
    const retried = await first.studio.download(done.jobId)
    expect(retried.outcome).toBe('downloaded')
    const after = await first.db.select().from(ledger).where(eq(ledger.jobId, done.jobId))
    expect(after).toHaveLength(before.length)
    expect((await first.studio.submit(videoInput('dl'))).outcome).toBe('cache-hit')

    const expired = await openStudio('expired-result')
    const finished = await settle(expired.studio, 'old')
    const gone = await expired.studio.download(finished.jobId)
    expect(gone).toMatchObject({ outcome: 'result-expired', chargeStands: true })
    const billed = await expired.db.select().from(ledger).where(eq(ledger.jobId, finished.jobId))
    expect(billed.some((line) => line.settlement === 'reconciled' && line.amountUsd === '0.225000')).toBe(true)
  })

  it('sends a photograph only after stripping it', async () => {
    const { studio, fal } = await openStudio()
    const tagged = taggedJpeg()
    const submitted = await studio.submit({
      ...videoInput('photo'),
      photograph: tagged,
    })
    expect(submitted.outcome).toBe('submitted')
    if (submitted.outcome !== 'submitted') return
    expect(submitted.sentSha256).toBe(sha256(minimalJpeg))
    const body = fal.calls[0]?.body
    const encoded = body && Array.isArray(body.image_urls) ? body.image_urls[0] : ''
    const sent = Buffer.from(String(encoded), 'base64')
    expect(sent.equals(Buffer.from(minimalJpeg))).toBe(true)
    expect(fal.calls[0]?.headers[FAL_HEADER.storeIo]).toBe('0')
    expect(fal.calls[0]?.headers[FAL_HEADER.objectLifecycle]).toContain('86400')
  })

  it('keeps only when all five answers are Clear', async () => {
    const { studio } = await openStudio()
    const done = await settle(studio, 'keep')
    await studio.download(done.jobId)
    const blocked = await studio.keep(done.jobId, clears('present'))
    expect(blocked.outcome).toBe('keep-unavailable')
    const listed = await studio.list()
    expect(listed.find((row) => row.id === done.jobId)?.status).toBe('downloaded')
    const kept = await studio.keep(done.jobId, clears())
    expect(kept.outcome).toBe('kept')
  })

  it('publishes through the four steps and leaves a withdrawn clip unlisted', async () => {
    const gate = await keptClip()
    const closed = await gate.studio.publish({
      jobId: gate.jobId,
      publicId: 'fenway',
      title: 'Fenway',
      position: 1,
    })
    expect(closed).toMatchObject({ outcome: 'gate-closed', live: false })
    expect(gate.storage.calls).toEqual([])
    expect(await publishedCount(gate.client)).toBe(0)

    const upload = await keptClip()
    await upload.studio.recordGate({
      answer: 'recorded',
      disclosure: 'pending a named answer',
      recordedBy: 'unspecified',
      source: 'A-06',
    })
    upload.storageScript.failThumbnail = true
    const failedUpload = await upload.studio.publish({
      jobId: upload.jobId,
      publicId: 'fenway',
      title: 'Fenway',
      position: 1,
    })
    expect(failedUpload).toMatchObject({ outcome: 'upload-failed', live: false, listedAgain: true })
    expect(await publishedCount(upload.client)).toBe(0)
    upload.storageScript.failThumbnail = false
    const uploaded = await upload.studio.publish({
      jobId: upload.jobId,
      publicId: 'fenway',
      title: 'Fenway',
      position: 1,
    })
    expect(uploaded).toMatchObject({ outcome: 'published', live: true })
    expect(upload.storage.calls.filter((call) => call === 'video')).toHaveLength(1)
    expect(upload.storage.calls.filter((call) => call === 'thumbnail')).toHaveLength(2)

    const record = await keptClip()
    await record.studio.recordGate({
      answer: 'recorded',
      disclosure: 'pending a named answer',
      recordedBy: 'unspecified',
      source: 'A-06',
    })
    record.flags.breakRecordWrite = true
    const failedRecord = await record.studio.publish({
      jobId: record.jobId,
      publicId: 'fenway',
      title: 'Fenway',
      position: 1,
    })
    expect(failedRecord).toMatchObject({ outcome: 'record-failed', live: false, listedAgain: true })
    record.flags.breakRecordWrite = false
    const written = await record.studio.publish({
      jobId: record.jobId,
      publicId: 'fenway',
      title: 'Fenway',
      position: 1,
    })
    expect(written).toMatchObject({ outcome: 'published', live: true })
    expect(record.storage.calls.filter((call) => call === 'video')).toHaveLength(1)
    expect(record.storage.calls.filter((call) => call === 'thumbnail')).toHaveLength(1)
    const detail = await record.client.query<{ prompt: string }>('SELECT prompt FROM catalog.video')
    expect(detail.rows[0]?.prompt).toBe('a fictional cat')

    const fallback = await keptClip()
    await fallback.studio.recordGate({
      answer: 'recorded',
      disclosure: 'pending a named answer',
      recordedBy: 'unspecified',
      source: 'A-06',
    })
    fallback.storageScript.failFallback = true
    const missing = await fallback.studio.publish({
      jobId: fallback.jobId,
      publicId: 'fenway',
      title: 'Fenway',
      position: 1,
    })
    expect(missing).toMatchObject({ outcome: 'fallback-missing', live: true, retryable: true })
    expect(await publishedCount(fallback.client)).toBe(1)
    const marked = await fallback.db.select().from(videos)
    expect(marked[0]?.fallbackStatus).toBe('missing')
    fallback.storageScript.failFallback = false
    const retried = await fallback.studio.publish({
      jobId: fallback.jobId,
      publicId: 'fenway',
      title: 'Fenway',
      position: 1,
    })
    expect(retried).toMatchObject({ outcome: 'published', live: true, fallbackRetried: true })
    const delivered = await fallback.db.select().from(videos)
    expect(delivered[0]?.fallbackStatus).toBe('delivered')

    const live = await keptClip()
    await live.studio.recordGate({
      answer: 'recorded',
      disclosure: 'pending a named answer',
      recordedBy: 'unspecified',
      source: 'A-06',
    })
    await live.studio.publish({ jobId: live.jobId, publicId: 'fenway', title: 'Fenway', position: 1 })
    const withdrawn = await live.studio.unpublish(live.jobId)
    expect(withdrawn.outcome).toBe('withdrawn')
    expect(await publishedCount(live.client)).toBe(0)
    const [row] = await live.db.select().from(videos)
    expect(row?.publishedAt).toBeNull()
    expect(row?.unpublishedAt).not.toBeNull()
    const relist = await live.studio.publish({
      jobId: live.jobId,
      publicId: 'fenway',
      title: 'Fenway',
      position: 1,
    })
    expect(relist.outcome).toBe('not-relisted')
    const child = await live.studio.submit({ ...videoInput('child'), parentGenerationId: live.generationId })
    expect(child.outcome).toBe('submitted')
    const parents = await live.db.select().from(generation)
    expect(parents.some((item) => item.id === live.generationId && item.status === 'withdrawn')).toBe(true)
  }, 30_000)
})
