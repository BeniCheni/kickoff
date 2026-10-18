import { mkdtempSync } from 'node:fs'
import { request as httpRequest, type IncomingHttpHeaders } from 'node:http'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { COPY } from '../copy.ts'
import { JOB_STATES } from '../db/schema.ts'
import { createStudio, type Studio } from '../engine.ts'
import { createFalStub, type ScriptName } from '../fal/stub.ts'
import { createStorageStub } from '../storage/stub.ts'
import { DOWNLOAD_FAILED_NOTE, jobLabel, jobNote, jobVoice, shouldPoll } from '../shared/jobs.ts'
import { ADMIN_JOB_STATES } from '../shared/jobs.ts'
import { readJobs } from '../server/jobs.ts'
import { openAdmin } from '../server/open.ts'
import { startAdmin, type AdminServer } from '../server/http.ts'
import { freshDatabase, type StudioClient } from './harness.ts'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const VIDEO = 'minimax/h3-max-turbo/image-to-video'
const clients: StudioClient[] = []
const servers: AdminServer[] = []

afterEach(async () => {
  await Promise.all(clients.splice(0).map((client) => client.close()))
  while (servers.length > 0) await servers.pop()?.close()
})

function video(seed: string, duration = 15) {
  return {
    endpoint: VIDEO,
    params: { prompt: 'a fictional cat', duration, resolution: '480P', seed },
    prompt: 'a fictional cat',
    seed,
  }
}

async function studioFor(script: ScriptName, ceilingMs = 10 * 60 * 1000) {
  const { client, db } = await freshDatabase()
  clients.push(client)
  const mediaDir = mkdtempSync(path.join(tmpdir(), 'kickoff-studio-'))
  const fal = createFalStub(script)
  const storage = createStorageStub()
  let now = new Date('2026-10-18T18:00:00.000Z')
  const studio = createStudio({
    db,
    fal,
    storage: storage.port,
    mediaDir,
    repoRoot,
    clock: () => now,
    timeoutCeilingMs: ceilingMs,
  })
  return {
    db,
    studio,
    mediaDir,
    advance(ms: number) {
      now = new Date(now.getTime() + ms)
    },
  }
}

async function untilSettled(studio: Studio, seed: string) {
  const submitted = await studio.submit(video(seed))
  expect(submitted.outcome).toBe('submitted')
  if (submitted.outcome !== 'submitted') throw new Error('not submitted')
  for (let step = 0; step < 4; step += 1) {
    const polled = await studio.poll(submitted.jobId)
    if (polled.outcome === 'completed' || polled.outcome === 'failed' || polled.outcome === 'refused' || polled.outcome === 'timed-out') {
      return submitted.jobId
    }
  }
  throw new Error('not settled')
}

describe('job states', () => {
  it('lists every ledger state, including published and withdrawn', () => {
    expect([...ADMIN_JOB_STATES]).toEqual([...JOB_STATES])
    expect(ADMIN_JOB_STATES).not.toContain('exported')
    expect(jobVoice('published')).toBe('ink')
    expect(jobVoice('withdrawn')).toBe('muted')
    expect(jobVoice('kept')).toBe('pitch')
    expect(jobVoice('failed')).toBe('alarm')
    expect(jobVoice('timed-out')).toBe('alarm')
    expect(jobLabel('completed', 'download-failed')).toBe('Completed · download failed')
    expect(jobLabel('completed', 'result-expired')).toBe('Completed · result expired')
    expect(jobNote('refused', null)).toBe(COPY.refused)
    expect(jobNote('timed-out', null)).toBe(COPY.timedOut)
    expect(jobNote('completed', 'download-failed')).toBe(DOWNLOAD_FAILED_NOTE)
    expect(jobNote('completed', null)).toBe(COPY.completed)
    expect(shouldPoll('visible')).toBe(true)
    expect(shouldPoll('hidden')).toBe(false)
  })

  it('reads billed pending, unknown, and the two completed substates from the engine', async () => {
    const pending = await studioFor('queued-then-completed')
    const submitted = await pending.studio.submit(video('pending'))
    expect(submitted.outcome).toBe('submitted')
    if (submitted.outcome !== 'submitted') return
    const pendingRows = await readJobs(pending.db, pending.studio, new Date('2026-10-18T18:00:00.000Z'))
    expect(pendingRows[0]?.billed).toEqual({ kind: 'pending' })
    expect(pendingRows[0]?.status).toBe('submitted')

    const refused = await studioFor('safety-refusal')
    await untilSettled(refused.studio, 'refused')
    const refusedRows = await readJobs(refused.db, refused.studio, new Date('2026-10-18T18:00:00.000Z'))
    expect(refusedRows[0]?.status).toBe('refused')
    expect(jobNote('refused', null)).toContain('safety checker')

    const timed = await studioFor('timeout', 1000)
    const started = await timed.studio.submit(video('timed'))
    expect(started.outcome).toBe('submitted')
    timed.advance(5000)
    if (started.outcome === 'submitted') {
      expect((await timed.studio.poll(started.jobId)).outcome).toBe('timed-out')
    }
    const timedRows = await readJobs(timed.db, timed.studio, new Date('2026-10-18T18:00:05.000Z'))
    expect(timedRows[0]?.status).toBe('timed-out')
    expect(timedRows[0]?.billed).toEqual({ kind: 'unknown' })

    const cancelled = await studioFor('queued-then-completed')
    const running = await cancelled.studio.submit(video('cancel'))
    expect(running.outcome).toBe('submitted')
    if (running.outcome === 'submitted') {
      expect((await cancelled.studio.cancel(running.jobId)).outcome).toBe('cancelled')
    }
    const cancelledRows = await readJobs(cancelled.db, cancelled.studio, new Date('2026-10-18T18:00:00.000Z'))
    expect(cancelledRows[0]?.billed).toEqual({ kind: 'unknown' })

    const expired = await studioFor('expired-result')
    const expiredId = await untilSettled(expired.studio, 'expired')
    expect((await expired.studio.download(expiredId)).outcome).toBe('result-expired')
    const expiredRows = await readJobs(expired.db, expired.studio, new Date('2026-10-18T18:00:00.000Z'))
    expect(expiredRows[0]?.substate).toBe('result-expired')
    expect(expiredRows[0]?.regenerateEstimateUsd).toMatch(/^\d+\.\d{6}$/)

    const broken = await studioFor('queued-then-completed')
    const base = createFalStub('queued-then-completed')
    const failing = createStudio({
      db: broken.db,
      fal: { ...base, async download() { throw new Error('disk') } },
      storage: createStorageStub().port,
      mediaDir: broken.mediaDir,
      repoRoot,
      clock: () => new Date('2026-10-18T18:00:00.000Z'),
    })
    const failedDownload = await untilSettled(failing, 'download')
    expect((await failing.download(failedDownload)).outcome).toBe('download-failed')
    const failedRows = await readJobs(broken.db, failing, new Date('2026-10-18T18:00:00.000Z'))
    expect(failedRows.find((row) => row.id === failedDownload)?.substate).toBe('download-failed')

    const over = await studioFor('queued-then-completed')
    const refusedBudget = await over.studio.submit(video('over', 80))
    expect(refusedBudget.outcome).toBe('budget-refused')
    const budgetRows = await readJobs(over.db, over.studio, new Date('2026-10-18T18:00:00.000Z'))
    expect(budgetRows[0]?.status).toBe('budget-refused')
    expect(budgetRows[0]?.billed).toEqual({ kind: 'none' })
  })

  it('serves the jobs list and will not poll on a foreign origin', async () => {
    const data = mkdtempSync(path.join(tmpdir(), 'kickoff-studio-data-'))
    const media = mkdtempSync(path.join(tmpdir(), 'kickoff-studio-media-'))
    const env = {
      STUDIO_DATA_DIR: data,
      STUDIO_MEDIA_DIR: media,
      STUDIO_NOW: '2026-10-18T18:00:00.000Z',
    }
    const opened = await openAdmin(env, false)
    const submitted = await opened.studio.submit(video('http'))
    expect(submitted.outcome).toBe('submitted')
    await opened.close()
    const admin = await startAdmin({ env, port: 0 })
    servers.push(admin)
    const ticket = await ask(admin, { path: `/?ticket=${encodeURIComponent(admin.token)}` })
    const cookie = cookieFrom(ticket.headers['set-cookie'])
    const listed = await ask(admin, { path: '/api/jobs', headers: { cookie } })
    const rows = JSON.parse(listed.body) as { status: string; billed: { kind: string } }[]
    expect(rows[0]?.status).toBe('submitted')
    expect(rows[0]?.billed).toEqual({ kind: 'pending' })
    const foreign = await ask(admin, {
      path: '/api/jobs/poll',
      method: 'POST',
      headers: { cookie, origin: 'http://evil.example', 'content-type': 'application/json' },
    })
    expect(foreign.status).toBe(403)
    const polled = await ask(admin, {
      path: '/api/jobs/poll',
      method: 'POST',
      headers: { cookie, origin: admin.origin, 'content-type': 'application/json' },
    })
    expect(polled.status).toBe(200)
    const after = JSON.parse(polled.body) as { status: string }[]
    expect(after[0]?.status).toBe('queued')
    const again = JSON.parse((await ask(admin, { path: '/api/jobs', headers: { cookie } })).body) as { status: string }[]
    expect(again[0]?.status).toBe('queued')
  })
})

function ask(admin: AdminServer, options: {
  path: string
  method?: string
  headers?: IncomingHttpHeaders
}): Promise<{ status: number; headers: IncomingHttpHeaders; body: string }> {
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
    if (options.method === 'POST') req.write('{}')
    req.end()
  })
}

function cookieFrom(header: string | string[] | undefined): string {
  const value = Array.isArray(header) ? header[0] : header
  if (!value) throw new Error('no cookie')
  return value.split(';')[0] ?? ''
}
