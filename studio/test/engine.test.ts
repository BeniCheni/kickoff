import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { eq } from 'drizzle-orm'
import { afterEach, describe, expect, it } from 'vitest'
import { CHECKLIST_LINES, asset, event, generation, generationInput, job, ledger, videos } from '../db/schema.ts'
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
  const flags: StudioFlags = {
    breakLedgerWrite: false,
    breakAfterAccept: false,
    breakRecordWrite: false,
  }
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
    expect(call?.headers[FAL_HEADER.disableFallback]).toBe('true')
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
    const { studio, advance, fal } = await openStudio('timeout')
    const submitted = await studio.submit(videoInput('slow'))
    expect(submitted.outcome).toBe('submitted')
    if (submitted.outcome !== 'submitted') return
    expect((await studio.poll(submitted.jobId)).outcome).toBe('queued')
    const before = fal.calls.filter((call) => call.kind === 'status').length
    advance(10 * 60 * 1000 + 1)
    const timed = await studio.poll(submitted.jobId)
    expect(timed).toMatchObject({ outcome: 'timed-out', label: 'proposal', ceilingMs: 600_000 })
    expect(fal.calls.filter((call) => call.kind === 'status').length).toBe(before + 1)
  })

  it('reconciles a job that completed after the ceiling instead of marking it timed out', async () => {
    const { db, studio, advance, fal } = await openStudio()
    const submitted = await studio.submit(videoInput('late'))
    if (submitted.outcome !== 'submitted') throw new Error('not submitted')
    expect((await studio.poll(submitted.jobId)).outcome).toBe('queued')
    expect((await studio.poll(submitted.jobId)).outcome).toBe('in-progress')
    advance(10 * 60 * 1000 + 1)
    const done = await studio.poll(submitted.jobId)
    expect(done.outcome).toBe('completed')
    expect(fal.calls.filter((call) => call.kind === 'status')).toHaveLength(3)
    const lines = await db.select().from(ledger).where(eq(ledger.jobId, submitted.jobId))
    expect(lines.some((line) => line.settlement === 'reconciled' && line.amountUsd === '0.225000')).toBe(true)
  })

  it('lands a provider 504 in failed and records the timeout type', async () => {
    const { studio, fal } = await openStudio()
    const submitted = await studio.submit(videoInput('start-timeout'))
    if (submitted.outcome !== 'submitted') throw new Error('not submitted')
    expect((await studio.poll(submitted.jobId)).outcome).toBe('queued')
    fal.status = async () => ({ httpStatus: 504, timeoutType: 'user' })
    const failed = await studio.poll(submitted.jobId)
    expect(failed).toMatchObject({ outcome: 'failed', httpStatus: 504, timeoutType: 'user' })
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

  it('cancels only on the documented 202', async () => {
    const { db, studio, fal } = await openStudio()
    const submitted = await studio.submit(videoInput('cancel-202'))
    if (submitted.outcome !== 'submitted') throw new Error('not submitted')
    expect((await studio.poll(submitted.jobId)).outcome).toBe('queued')
    fal.cancel = async () => ({ httpStatus: 202, body: { status: 'CANCELLATION_REQUESTED' } })
    const cancelled = await studio.cancel(submitted.jobId)
    expect(cancelled).toMatchObject({ outcome: 'cancelled', chargeRetained: true })
    const [row] = await db.select().from(job).where(eq(job.id, submitted.jobId))
    expect(row?.status).toBe('cancelled')
  })

  it('keeps polling when cancel says the request already completed', async () => {
    const { db, studio, fal } = await openStudio()
    const submitted = await studio.submit(videoInput('cancel-400'))
    if (submitted.outcome !== 'submitted') throw new Error('not submitted')
    expect((await studio.poll(submitted.jobId)).outcome).toBe('queued')
    fal.cancel = async () => ({ httpStatus: 400, body: { status: 'ALREADY_COMPLETED' } })
    const result = await studio.cancel(submitted.jobId)
    expect(result).toMatchObject({ outcome: 'cancel-already-completed', jobId: submitted.jobId })
    const [row] = await db.select().from(job).where(eq(job.id, submitted.jobId))
    expect(row?.status).toBe('queued')
    expect((await studio.poll(submitted.jobId)).outcome).toBe('in-progress')
    const done = await studio.poll(submitted.jobId)
    expect(done.outcome).toBe('completed')
    const lines = await db.select().from(ledger).where(eq(ledger.jobId, submitted.jobId))
    expect(lines.some((line) => line.settlement === 'reconciled')).toBe(true)
  })

  it('names a cancel that fal cannot find', async () => {
    const { db, studio, fal } = await openStudio()
    const submitted = await studio.submit(videoInput('cancel-404'))
    if (submitted.outcome !== 'submitted') throw new Error('not submitted')
    expect((await studio.poll(submitted.jobId)).outcome).toBe('queued')
    fal.cancel = async () => ({ httpStatus: 404, body: { status: 'NOT_FOUND' } })
    const result = await studio.cancel(submitted.jobId)
    expect(result).toMatchObject({ outcome: 'cancel-not-found', jobId: submitted.jobId })
    const [row] = await db.select().from(job).where(eq(job.id, submitted.jobId))
    expect(row?.status).toBe('queued')
  })

  it('leaves the job unchanged when cancel returns another status', async () => {
    const { db, studio, fal } = await openStudio()
    const submitted = await studio.submit(videoInput('cancel-500'))
    if (submitted.outcome !== 'submitted') throw new Error('not submitted')
    expect((await studio.poll(submitted.jobId)).outcome).toBe('queued')
    fal.cancel = async () => ({ httpStatus: 500, body: { status: 'INTERNAL' } })
    const result = await studio.cancel(submitted.jobId)
    expect(result).toMatchObject({ outcome: 'cancel-unconfirmed', jobId: submitted.jobId })
    const [row] = await db.select().from(job).where(eq(job.id, submitted.jobId))
    expect(row?.status).toBe('queued')
  })

  it('does not cancel when the cancel response has no status', async () => {
    const { db, studio, fal } = await openStudio()
    const submitted = await studio.submit(videoInput('bad-cancel'))
    if (submitted.outcome !== 'submitted') throw new Error('not submitted')
    expect((await studio.poll(submitted.jobId)).outcome).toBe('queued')
    fal.cancel = (async () => ({ unexpected: true })) as unknown as typeof fal.cancel
    const result = await studio.cancel(submitted.jobId)
    expect(result).toMatchObject({ outcome: 'cancel-unconfirmed', jobId: submitted.jobId })
    const [row] = await db.select().from(job).where(eq(job.id, submitted.jobId))
    expect(row?.status).toBe('queued')
  })

  it('does not resubmit when the request id was never stored', async () => {
    const { db, studio, fal, flags } = await openStudio()
    flags.breakAfterAccept = true
    const crashed = await studio.submit(videoInput('crash'))
    expect(crashed).toMatchObject({ outcome: 'database-unavailable' })
    if (crashed.outcome !== 'database-unavailable' || !('jobId' in crashed) || !crashed.jobId) {
      throw new Error('crash did not name the job')
    }
    const rows = await db.select().from(job)
    expect(rows).toHaveLength(1)
    expect(rows[0]?.providerRequestId).toBeNull()
    flags.breakAfterAccept = false
    const second = await studio.submit(videoInput('crash'))
    expect(second).toMatchObject({ outcome: 'submit-unconfirmed', jobId: crashed.jobId })
    expect(fal.calls.filter((call) => call.kind === 'submit')).toHaveLength(1)
    expect(await db.select().from(ledger)).toHaveLength(1)
    const resumed = await studio.resume(crashed.jobId)
    expect(resumed).toMatchObject({ outcome: 'submit-unconfirmed', jobId: crashed.jobId })
    const blocked = await studio.closeSession()
    expect(blocked).toMatchObject({ outcome: 'close-refused', jobIds: [crashed.jobId] })
    const attached = await studio.attachRequest({
      jobId: crashed.jobId,
      requestId: 'req-from-fal',
    })
    expect(attached).toMatchObject({ outcome: 'attached', jobId: crashed.jobId })
    const [stored] = await db.select().from(job).where(eq(job.id, crashed.jobId))
    expect(stored?.statusUrl).toBe('https://queue.fal.run/minimax/h3-max-turbo/image-to-video/requests/req-from-fal/status')
    expect(stored?.responseUrl).toBe('https://queue.fal.run/minimax/h3-max-turbo/image-to-video/requests/req-from-fal/response')
    expect(stored?.cancelUrl).toBe('https://queue.fal.run/minimax/h3-max-turbo/image-to-video/requests/req-from-fal/cancel')
    expect(fal.calls.filter((call) => call.kind === 'submit')).toHaveLength(1)
    expect(await db.select().from(ledger)).toHaveLength(1)
    const polled = await studio.poll(crashed.jobId)
    expect(polled.outcome).toBe('queued')
    expect(fal.calls.some((call) => call.kind === 'status' && call.url === stored?.statusUrl)).toBe(true)
  })

  it('fails a 422 submit that has no request id and keeps the estimate pending', async () => {
    const { db, studio, fal } = await openStudio()
    fal.submit = async () => ({ httpStatus: 422, body: { detail: 'bad input', error_type: 'validation' } })
    const refused = await studio.submit(videoInput('422'))
    expect(refused).toMatchObject({ outcome: 'failed', httpStatus: 422, errorType: 'validation' })
    if (refused.outcome !== 'failed') throw new Error('no job')
    const [row] = await db.select().from(job).where(eq(job.id, refused.jobId))
    expect(row?.status).toBe('failed')
    expect(row?.providerRequestId).toBeNull()
    const lines = await db.select().from(ledger).where(eq(ledger.jobId, refused.jobId))
    expect(lines.some((line) => line.settlement === 'pending')).toBe(true)
    expect(lines.some((line) => line.settlement === 'reconciled')).toBe(false)
    const notes = await db.select().from(event).where(eq(event.jobId, refused.jobId))
    expect(notes.some((note) => note.type === 'provider-submit' && note.detail !== null && typeof note.detail === 'object' && (note.detail as { httpStatus?: number }).httpStatus === 422 && (note.detail as { errorType?: string }).errorType === 'validation')).toBe(true)
  })

  it('refuses a 422 safety submit that has no request id', async () => {
    const { db, studio, fal } = await openStudio()
    fal.submit = async () => ({
      httpStatus: 422,
      body: { detail: 'content_policy_violation: likeness', error_type: 'content_policy_violation' },
    })
    const refused = await studio.submit(videoInput('safety-submit'))
    expect(refused).toMatchObject({ outcome: 'refused', httpStatus: 422, errorType: 'content_policy_violation' })
    if (refused.outcome !== 'refused') throw new Error('no job')
    const [row] = await db.select().from(job).where(eq(job.id, refused.jobId))
    expect(row?.status).toBe('refused')
    const lines = await db.select().from(ledger).where(eq(ledger.jobId, refused.jobId))
    expect(lines.some((line) => line.settlement === 'reconciled')).toBe(false)
  })

  it('reconciles a 5xx submit at zero because fal does not bill it', async () => {
    const { db, studio, fal } = await openStudio()
    fal.submit = async () => ({ httpStatus: 500, body: { error_type: 'internal_server_error' } })
    const failed = await studio.submit(videoInput('500'))
    expect(failed).toMatchObject({ outcome: 'failed', httpStatus: 500, errorType: 'internal_server_error' })
    if (failed.outcome !== 'failed') throw new Error('no job')
    const lines = await db.select().from(ledger).where(eq(ledger.jobId, failed.jobId))
    expect(lines.some((line) => line.settlement === 'reconciled' && line.amountUsd === '0.000000')).toBe(true)
    const notes = await db.select().from(event).where(eq(event.jobId, failed.jobId))
    expect(notes.some((note) => note.type === 'provider-submit' && note.detail !== null && typeof note.detail === 'object' && (note.detail as { billing?: string }).billing === 'https://fal.ai/docs/model-apis/model-endpoints/reliability')).toBe(true)
  })

  it('leaves a thrown submit unconfirmed and does not resubmit it', async () => {
    const { db, studio, fal } = await openStudio()
    let submits = 0
    fal.submit = async () => {
      submits += 1
      throw new Error('socket hang up')
    }
    const first = await studio.submit(videoInput('thrown'))
    expect(first).toMatchObject({ outcome: 'submit-unconfirmed' })
    if (!('jobId' in first) || !first.jobId) throw new Error('no job')
    const second = await studio.submit(videoInput('thrown'))
    expect(second).toMatchObject({ outcome: 'submit-unconfirmed', jobId: first.jobId })
    expect(submits).toBe(1)
    expect(await db.select().from(ledger)).toHaveLength(1)
    const [row] = await db.select().from(job).where(eq(job.id, first.jobId))
    expect(row?.status).toBe('draft')
    expect(row?.providerRequestId).toBeNull()
  })

  it('stores a request id that came back with foreign URLs and does not resubmit', async () => {
    const { db, studio, fal } = await openStudio()
    let submits = 0
    fal.submit = async () => {
      submits += 1
      return {
        httpStatus: 200,
        body: {
          request_id: 'req-foreign',
          status_url: 'https://evil.example/status',
          response_url: 'https://evil.example/response',
          cancel_url: 'https://evil.example/cancel',
        },
      }
    }
    const first = await studio.submit(videoInput('foreign'))
    expect(first).toMatchObject({ outcome: 'urls-unusable', requestId: 'req-foreign' })
    if (first.outcome !== 'urls-unusable') throw new Error('no job')
    const [row] = await db.select().from(job).where(eq(job.id, first.jobId))
    expect(row?.providerRequestId).toBe('req-foreign')
    expect(row?.statusUrl).toBeNull()
    expect(row?.status).toBe('draft')
    const second = await studio.submit(videoInput('foreign'))
    expect(second).toMatchObject({ outcome: 'urls-unusable', jobId: first.jobId })
    expect(submits).toBe(1)
    expect((await studio.closeSession()).outcome).toBe('close-refused')
    const attached = await studio.attachRequest({ jobId: first.jobId, requestId: 'req-foreign' })
    expect(attached).toMatchObject({ outcome: 'attached' })
    const [stored] = await db.select().from(job).where(eq(job.id, first.jobId))
    expect(stored?.statusUrl).toBe('https://queue.fal.run/minimax/h3-max-turbo/image-to-video/requests/req-foreign/status')
    expect(stored?.statusUrl).not.toContain('evil.example')
    expect((await studio.poll(first.jobId)).outcome).toBe('queued')
    expect(fal.calls.some((call) => call.kind === 'status' && call.url === stored?.statusUrl)).toBe(true)
  })

  it('polls the status URL stored at submit', async () => {
    const { db, studio, fal } = await openStudio()
    const submitted = await studio.submit(videoInput('stored-url'))
    if (submitted.outcome !== 'submitted') throw new Error('not submitted')
    const [row] = await db.select().from(job).where(eq(job.id, submitted.jobId))
    expect((await studio.poll(submitted.jobId)).outcome).toBe('queued')
    expect(fal.calls.some((call) => call.kind === 'status' && call.url === row?.statusUrl)).toBe(true)
  })

  it('allows another submit after a definitive refusal', async () => {
    const { db, studio, fal } = await openStudio()
    const real = fal.submit.bind(fal)
    let submits = 0
    fal.submit = async (input) => {
      submits += 1
      if (submits === 1) return { httpStatus: 422, body: { detail: 'bad input', error_type: 'validation' } }
      return real(input)
    }
    const first = await studio.submit(videoInput('again'))
    expect(first).toMatchObject({ outcome: 'failed' })
    const second = await studio.submit(videoInput('again'))
    expect(second).toMatchObject({ outcome: 'submitted' })
    expect(submits).toBe(2)
    expect(await db.select().from(job)).toHaveLength(2)
  })

  it('closes the session after a definitive refusal and after settle-unconfirmed', async () => {
    const refused = await openStudio()
    refused.fal.submit = async () => ({ httpStatus: 422, body: { detail: 'bad input' } })
    const failed = await refused.studio.submit(videoInput('close-refused'))
    expect(failed).toMatchObject({ outcome: 'failed' })
    expect((await refused.studio.closeSession()).outcome).toBe('closed')

    const ambiguous = await openStudio()
    ambiguous.fal.submit = async () => {
      throw new Error('socket hang up')
    }
    const hung = await ambiguous.studio.submit(videoInput('settle'))
    expect(hung).toMatchObject({ outcome: 'submit-unconfirmed' })
    if (!('jobId' in hung) || !hung.jobId) throw new Error('no job')
    expect((await ambiguous.studio.closeSession()).outcome).toBe('close-refused')
    const settled = await ambiguous.studio.settleUnconfirmed({
      jobId: hung.jobId,
      notAccepted: true,
      evidence: 'the fal dashboard shows no request',
    })
    expect(settled).toMatchObject({ outcome: 'failed', estimatePending: true })
    const [row] = await ambiguous.db.select().from(job).where(eq(job.id, hung.jobId))
    expect(row?.status).toBe('failed')
    const lines = await ambiguous.db.select().from(ledger).where(eq(ledger.jobId, hung.jobId))
    expect(lines.some((line) => line.settlement === 'pending')).toBe(true)
    expect(lines.some((line) => line.settlement === 'reconciled')).toBe(false)
    const notes = await ambiguous.db.select().from(event).where(eq(event.jobId, hung.jobId))
    expect(notes.some((note) => note.type === 'submit-not-accepted' && note.detail !== null && typeof note.detail === 'object' && (note.detail as { evidence?: string }).evidence === 'the fal dashboard shows no request')).toBe(true)
    expect((await ambiguous.studio.closeSession()).outcome).toBe('closed')

    const priced = await openStudio()
    priced.fal.submit = async () => {
      throw new Error('socket hang up')
    }
    const pricedJob = await priced.studio.submit(videoInput('priced'))
    if (!('jobId' in pricedJob) || !pricedJob.jobId) throw new Error('no job')
    const entered = await priced.studio.settleUnconfirmed({
      jobId: pricedJob.jobId,
      notAccepted: true,
      evidence: 'fal support quoted this',
      amountUsd: '0.100000',
    })
    expect(entered).toMatchObject({ outcome: 'failed', estimatePending: false })
    const pricedLines = await priced.db.select().from(ledger).where(eq(ledger.jobId, pricedJob.jobId))
    expect(pricedLines.some((line) => line.settlement === 'reconciled' && line.amountUsd === '0.100000' && line.basis === 'reconciled')).toBe(true)
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
    const { db, studio, fal } = await openStudio('out-of-credit')
    const locked = await studio.submit(videoInput('credit'))
    expect(locked.outcome).toBe('out-of-credit')
    const lines = await db.select().from(ledger)
    expect(lines.some((line) => line.settlement === 'reconciled' && line.amountUsd === '0.000000')).toBe(true)
    const again = await studio.submit(videoInput('credit'))
    expect(again.outcome).toBe('out-of-credit')
    expect(again).not.toMatchObject({ outcome: 'submit-unconfirmed' })
    expect(fal.calls.filter((call) => call.kind === 'submit')).toHaveLength(2)
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

  it('sends a photograph only after stripping it, and the video endpoint refuses one', async () => {
    const refused = await openStudio()
    const blocked = await refused.studio.submit({
      ...videoInput('photo'),
      photograph: taggedJpeg(),
    })
    expect(blocked).toMatchObject({ outcome: 'param-not-allowed', param: 'image_urls' })
    expect(refused.fal.calls).toHaveLength(0)

    const { studio, fal } = await openStudio()
    const tagged = taggedJpeg()
    const submitted = await studio.submit({
      endpoint: 'openai/gpt-image-2/edit',
      params: { prompt: 'a fictional cat', image_size: '1024x1024', quality: 'low' },
      prompt: 'a fictional cat',
      photograph: tagged,
    })
    expect(submitted.outcome).toBe('submitted')
    if (submitted.outcome !== 'submitted') return
    expect(submitted.sentSha256).toBe(sha256(minimalJpeg))
    const body = fal.calls[0]?.body
    const encoded = body && Array.isArray(body.image_urls) ? String(body.image_urls[0]) : ''
    expect(encoded.startsWith('data:image/jpeg;base64,')).toBe(true)
    const sent = Buffer.from(encoded.slice('data:image/jpeg;base64,'.length), 'base64')
    expect(sent.equals(Buffer.from(minimalJpeg))).toBe(true)
    expect(fal.calls[0]?.headers[FAL_HEADER.storeIo]).toBe('0')
    expect(fal.calls[0]?.headers[FAL_HEADER.objectLifecycle]).toContain('86400')
    expect(fal.calls.some((call) => call.url?.includes('fal.media') || call.endpoint?.includes('storage'))).toBe(false)
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
    expect(uploaded).toMatchObject({ outcome: 'published', live: true, fallback: 'merged' })
    const videoPut = upload.storage.puts.find((put) => put.kind === 'video')
    const thumbPut = upload.storage.puts.find((put) => put.kind === 'thumbnail')
    const stored = await upload.client.query<{
      id: string
      video_bucket: string
      video_object_path: string
      thumbnail_object_path: string
    }>('SELECT id, video_bucket, video_object_path, thumbnail_object_path FROM catalog.video')
    expect(stored.rows[0]?.id).toBe('fenway')
    expect(stored.rows[0]?.video_bucket).toBe(videoPut?.object.bucket)
    expect(stored.rows[0]?.video_object_path).toBe(videoPut?.object.objectPath)
    expect(stored.rows[0]?.video_object_path.endsWith('.mp4')).toBe(true)
    expect(stored.rows[0]?.thumbnail_object_path).toBe(thumbPut?.object.objectPath)
    expect(stored.rows[0]?.thumbnail_object_path.endsWith('.jpg')).toBe(true)
    expect(videoPut?.mime).toBe('video/mp4')
    expect(thumbPut?.mime).toBe('image/jpeg')
    expect(JSON.stringify(stored.rows)).not.toContain(upload.jobId)
    const listed = await upload.client.query<{ thumbnail_bucket: string; thumbnail_object_path: string }>(
      'SELECT thumbnail_bucket, thumbnail_object_path FROM catalog.videos',
    )
    expect(listed.rows[0]?.thumbnail_bucket).toBe(thumbPut?.object.bucket)
    expect(listed.rows[0]?.thumbnail_object_path).toBe(thumbPut?.object.objectPath)
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
    expect(missing).toMatchObject({ outcome: 'checks-failed', live: true, retryable: true })
    expect(await publishedCount(fallback.client)).toBe(1)
    const marked = await fallback.db.select().from(videos)
    expect(marked[0]?.fallbackStatus).toBe('failed')
    fallback.storageScript.failFallback = false
    const retried = await fallback.studio.publish({
      jobId: fallback.jobId,
      publicId: 'fenway',
      title: 'Fenway',
      position: 1,
    })
    expect(retried).toMatchObject({ outcome: 'published', live: true, fallbackRetried: true, fallback: 'merged' })
    const delivered = await fallback.db.select().from(videos)
    expect(delivered[0]?.fallbackStatus).toBe('merged')

    const live = await keptClip()
    await live.studio.recordGate({
      answer: 'recorded',
      disclosure: 'pending a named answer',
      recordedBy: 'unspecified',
      source: 'A-06',
    })
    await live.studio.publish({ jobId: live.jobId, publicId: 'fenway', title: 'Fenway', position: 1 })
    const withdrawn = await live.studio.unpublish(live.jobId)
    expect(withdrawn).toMatchObject({ outcome: 'withdrawn', listed: false, deleteRequested: false, removal: 'merged' })
    expect(live.storage.calls.some((call) => call.startsWith('remove:'))).toBe(false)
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

  it('maps each site-copy outcome onto pending, failed, or merged', async () => {
    const cases = [
      ['pr-opened', 'pending'],
      ['checks-running', 'pending'],
      ['merged', 'merged'],
      ['checks-failed', 'failed'],
    ] as const
    for (const [outcome, status] of cases) {
      const opened = await keptClip()
      await opened.studio.recordGate({
        answer: 'recorded',
        disclosure: 'pending a named answer',
        recordedBy: 'unspecified',
        source: 'A-06',
      })
      opened.storageScript.fallback = outcome
      const result = await opened.studio.publish({
        jobId: opened.jobId,
        publicId: 'fenway',
        title: 'Fenway',
        position: 1,
      })
      if (outcome === 'checks-failed') expect(result).toMatchObject({ outcome: 'checks-failed', live: true, retryable: true })
      else expect(result).toMatchObject({ outcome: 'published', live: true, fallback: outcome })
      const [row] = await opened.db.select().from(videos)
      expect(row?.fallbackStatus).toBe(status)
    }
  }, 30_000)

  it('closes a session only when nothing is in flight, and the next session has a fresh cap', async () => {
    const { studio, fal } = await openStudio()
    const accepted: string[] = []
    for (const seed of ['a', 'b', 'c', 'd']) {
      const submitted = await studio.submit(videoInput(seed, 100))
      expect(submitted.outcome).toBe('submitted')
      if (submitted.outcome !== 'submitted') return
      accepted.push(submitted.jobId)
    }
    expect((await studio.submit(videoInput('e', 100))).outcome).toBe('budget-refused')
    expect((await studio.closeSession()).outcome).toBe('close-refused')
    for (const jobId of accepted) {
      expect((await studio.cancel(jobId)).outcome).toBe('cancelled')
    }
    expect((await studio.submit(videoInput('still', 100))).outcome).toBe('budget-refused')
    const closed = await studio.closeSession()
    expect(closed.outcome).toBe('closed')
    if (closed.outcome !== 'closed') return
    expect(closed.totalUsd).toBe('6.000000')
    const fresh = await studio.submit(videoInput('f', 100))
    expect(fresh.outcome).toBe('submitted')
    expect(fal.calls.filter((call) => call.kind === 'submit')).toHaveLength(5)
  })

  it('refuses cancel on a published job and leaves the catalog unchanged', async () => {
    const live = await keptClip()
    await live.studio.recordGate({
      answer: 'recorded',
      disclosure: 'pending a named answer',
      recordedBy: 'unspecified',
      source: 'A-06',
    })
    await live.studio.publish({ jobId: live.jobId, publicId: 'fenway', title: 'Fenway', position: 1 })
    const cancelled = await live.studio.cancel(live.jobId)
    expect(cancelled).toMatchObject({ outcome: 'cancel-refused', hint: 'use unpublish' })
    expect(await publishedCount(live.client)).toBe(1)
    const [row] = await live.db.select().from(job).where(eq(job.id, live.jobId))
    expect(row?.status).toBe('published')
  })

  it('names a taken position and a taken public id', async () => {
    const first = await keptClip()
    await first.studio.recordGate({
      answer: 'recorded',
      disclosure: 'pending a named answer',
      recordedBy: 'unspecified',
      source: 'A-06',
    })
    await first.studio.publish({ jobId: first.jobId, publicId: 'fenway', title: 'Fenway', position: 1 })
    const secondDone = await settle(first.studio, 'other')
    await first.studio.download(secondDone.jobId)
    await first.studio.keep(secondDone.jobId, clears())
    const [row] = await first.db.select().from(job).where(eq(job.id, secondDone.jobId))
    if (!row) throw new Error('missing second job')
    const [k0] = await first.db.insert(asset).values({
      role: 'keyframe',
      sha256: 'k0-hash-2',
      mime: 'image/jpeg',
      bytes: 4,
      localPath: path.join(first.mediaDir, 'k0-2.jpg'),
    }).returning()
    if (!k0) throw new Error('missing keyframe')
    await first.db.insert(generationInput).values({ generationId: row.generationId, assetId: k0.id, role: 'first' })
    const taken = await first.studio.publish({
      jobId: secondDone.jobId,
      publicId: 'other',
      title: 'Other',
      position: 1,
    })
    expect(taken).toMatchObject({ outcome: 'record-failed', live: false, listedAgain: true, reason: 'position-taken' })
    const sameId = await first.studio.publish({
      jobId: secondDone.jobId,
      publicId: 'fenway',
      title: 'Other',
      position: 2,
    })
    expect(sameId).toMatchObject({ outcome: 'record-failed', reason: 'public-id-taken' })
    const [still] = await first.db.select().from(job).where(eq(job.id, secondDone.jobId))
    expect(still?.status).toBe('kept')
  })

  it('rejects an empty Article 50 answer and names a second one', async () => {
    const opened = await keptClip()
    for (const answer of ['   ', '\t', '\n', '\r', ' \t\n\r', '\u00A0']) {
      const empty = await opened.studio.recordGate({
        answer,
        disclosure: 'pending',
        recordedBy: 'unspecified',
        source: 'A-06',
      })
      expect(empty).toEqual({ outcome: 'gate-empty' })
    }
    const closed = await opened.studio.publish({
      jobId: opened.jobId,
      publicId: 'fenway',
      title: 'Fenway',
      position: 1,
    })
    expect(closed).toMatchObject({ outcome: 'gate-closed', live: false })
    const recorded = await opened.studio.recordGate({
      answer: ' recorded ',
      disclosure: 'pending',
      recordedBy: 'unspecified',
      source: 'A-06',
    })
    expect(recorded.outcome).toBe('gate-recorded')
    if (recorded.outcome !== 'gate-recorded') return
    const second = await opened.studio.recordGate({
      answer: 'a later answer',
      disclosure: 'pending',
      recordedBy: 'unspecified',
      source: 'A-06',
    })
    expect(second).toEqual({ outcome: 'gate-already-recorded', recordedOn: recorded.recordedOn })
  })

  it('withdraws before deleting files, and each failure stays unlisted', async () => {
    async function counts(client: StudioClient) {
      const list = await client.query('SELECT id FROM catalog.videos')
      const detail = await client.query('SELECT id FROM catalog.video')
      return { list: list.rows.length, detail: detail.rows.length }
    }

    const blocked = await keptClip()
    await blocked.studio.recordGate({ answer: 'recorded', disclosure: 'x', recordedBy: 'a', source: 'A-06' })
    await blocked.studio.publish({ jobId: blocked.jobId, publicId: 'fenway', title: 'Fenway', position: 1 })
    await blocked.client.exec(`
      CREATE FUNCTION studio.reject_unpublished_event() RETURNS trigger
      LANGUAGE plpgsql AS $$
      BEGIN
        IF NEW.type = 'unpublished' THEN
          RAISE EXCEPTION 'unpublished rejected';
        END IF;
        RETURN NEW;
      END;
      $$;
      CREATE TRIGGER reject_unpublished_event
      BEFORE INSERT ON studio.event
      FOR EACH ROW EXECUTE FUNCTION studio.reject_unpublished_event();
    `)
    async function snapshot(client: StudioClient) {
      const jobs = await client.query('SELECT * FROM studio.job ORDER BY id')
      const generations = await client.query('SELECT * FROM studio.generation ORDER BY id')
      const clips = await client.query('SELECT * FROM studio.videos ORDER BY id')
      const notes = await client.query('SELECT * FROM studio.event ORDER BY id')
      return JSON.stringify({ jobs: jobs.rows, generations: generations.rows, clips: clips.rows, notes: notes.rows })
    }
    const calls = [...blocked.storage.calls]
    const before = await snapshot(blocked.client)
    const withdrawFailed = await blocked.studio.unpublish(blocked.jobId, { deleteFiles: true })
    expect(withdrawFailed).toMatchObject({ outcome: 'withdraw-failed', live: true, filesTouched: false })
    expect(await counts(blocked.client)).toEqual({ list: 1, detail: 1 })
    expect(blocked.storage.calls).toEqual(calls)
    expect(await snapshot(blocked.client)).toBe(before)

    const videoFails = await keptClip()
    await videoFails.studio.recordGate({ answer: 'recorded', disclosure: 'x', recordedBy: 'a', source: 'A-06' })
    await videoFails.studio.publish({ jobId: videoFails.jobId, publicId: 'fenway', title: 'Fenway', position: 1 })
    videoFails.storageScript.failRemoveVideo = true
    const videoFailed = await videoFails.studio.unpublish(videoFails.jobId, { deleteFiles: true })
    expect(videoFailed).toMatchObject({
      outcome: 'withdrawn',
      listed: false,
      videoRemoved: false,
      thumbnailRemoved: true,
      filesReadable: true,
    })
    expect(await counts(videoFails.client)).toEqual({ list: 0, detail: 0 })
    videoFails.storageScript.failRemoveVideo = false
    const videoRetried = await videoFails.studio.retryDelete(videoFails.jobId)
    expect(videoRetried).toMatchObject({ videoRemoved: true, thumbnailRemoved: true, filesReadable: false, idempotent: false })
    const videoAgain = await videoFails.studio.retryDelete(videoFails.jobId)
    expect(videoAgain).toMatchObject({ idempotent: true, filesReadable: false })

    const thumbFails = await keptClip()
    await thumbFails.studio.recordGate({ answer: 'recorded', disclosure: 'x', recordedBy: 'a', source: 'A-06' })
    await thumbFails.studio.publish({ jobId: thumbFails.jobId, publicId: 'fenway', title: 'Fenway', position: 1 })
    thumbFails.storageScript.failRemoveThumbnail = true
    const thumbFailed = await thumbFails.studio.unpublish(thumbFails.jobId, { deleteFiles: true })
    expect(thumbFailed).toMatchObject({
      outcome: 'withdrawn',
      listed: false,
      videoRemoved: true,
      thumbnailRemoved: false,
      filesReadable: true,
    })
    expect(await counts(thumbFails.client)).toEqual({ list: 0, detail: 0 })
    thumbFails.storageScript.failRemoveThumbnail = false
    expect(await thumbFails.studio.retryDelete(thumbFails.jobId)).toMatchObject({
      videoRemoved: true,
      thumbnailRemoved: true,
      filesReadable: false,
    })

    const checksFail = await keptClip()
    await checksFail.studio.recordGate({ answer: 'recorded', disclosure: 'x', recordedBy: 'a', source: 'A-06' })
    await checksFail.studio.publish({ jobId: checksFail.jobId, publicId: 'fenway', title: 'Fenway', position: 1 })
    checksFail.storageScript.removal = 'checks-failed'
    const removalFailed = await checksFail.studio.unpublish(checksFail.jobId)
    expect(removalFailed).toMatchObject({ outcome: 'withdrawn', listed: false, deleteRequested: false, removal: 'checks-failed' })
    expect(checksFail.storage.calls.some((call) => call.startsWith('remove:'))).toBe(false)
    expect(await counts(checksFail.client)).toEqual({ list: 0, detail: 0 })
    const [marked] = await checksFail.db.select().from(videos)
    expect(marked?.removalStatus).toBe('failed')
    checksFail.storageScript.removal = 'merged'
    expect(await checksFail.studio.retryRemoval(checksFail.jobId)).toMatchObject({ outcome: 'merged', idempotent: false })
    expect(await checksFail.studio.retryRemoval(checksFail.jobId)).toMatchObject({ outcome: 'merged', idempotent: true })

    const plain = await keptClip()
    await plain.studio.recordGate({ answer: 'recorded', disclosure: 'x', recordedBy: 'a', source: 'A-06' })
    await plain.studio.publish({ jobId: plain.jobId, publicId: 'fenway', title: 'Fenway', position: 1 })
    const removedBefore = plain.storage.calls.filter((call) => call.startsWith('remove:')).length
    expect(await plain.studio.unpublish(plain.jobId)).toMatchObject({
      outcome: 'withdrawn',
      deleteRequested: false,
      removal: 'merged',
    })
    expect(plain.storage.calls.filter((call) => call.startsWith('remove:')).length).toBe(removedBefore)
    expect(await counts(plain.client)).toEqual({ list: 0, detail: 0 })
  }, 30_000)
})
