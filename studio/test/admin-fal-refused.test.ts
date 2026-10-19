import { mkdtempSync } from 'node:fs'
import { request as httpRequest, type IncomingHttpHeaders } from 'node:http'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { eq } from 'drizzle-orm'
import { afterEach, describe, expect, it } from 'vitest'
import { asset, event, job, ledger } from '../db/schema.ts'
import { openAdmin } from '../server/open.ts'
import { startAdmin, type AdminServer } from '../server/http.ts'

const VIDEO = 'minimax/h3-max-turbo/image-to-video'
const servers: AdminServer[] = []

afterEach(async () => {
  while (servers.length > 0) await servers.pop()?.close()
})

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

function addresses(requestId: string) {
  const base = `https://queue.fal.run/${VIDEO}/requests/${requestId}`
  return {
    providerRequestId: requestId,
    statusUrl: `${base}/status`,
    responseUrl: `${base}/response`,
    cancelUrl: `${base}/cancel`,
  }
}

async function fingerprint(db: Awaited<ReturnType<typeof openAdmin>>['db']) {
  const jobs = await db.select().from(job)
  const ledgers = await db.select().from(ledger)
  const events = await db.select().from(event)
  const assets = await db.select().from(asset)
  return {
    jobs: jobs.map((row) => `${row.id}:${row.status}:${row.completedSubstate ?? ''}`).sort(),
    ledger: ledgers.length,
    events: events.length,
    assets: assets.length,
  }
}

describe('live fal refusal', () => {
  it('does not let poll, download, cancel, or attach mutate live records when FAL_KEY is absent', async () => {
    const data = mkdtempSync(path.join(tmpdir(), 'kickoff-studio-data-'))
    const media = mkdtempSync(path.join(tmpdir(), 'kickoff-studio-media-'))
    const env = {
      STUDIO_DATA_DIR: data,
      STUDIO_MEDIA_DIR: media,
      STUDIO_NOW: '2026-10-18T18:00:00.000Z',
      STUDIO_LIVE: '1',
      DATABASE_URL: ['postgres', '://127.0.0.1:1/studio'].join(''),
      STUDIO_ADMIN_LIVE_PGLITE: '1',
    }
    const opened = await openAdmin(env, false)
    const submit = (seed: string) => opened.studio.submit({
      endpoint: VIDEO,
      params: { prompt: 'a fictional cat', duration: 15, resolution: '480P', seed },
      prompt: 'a fictional cat',
      seed,
    })
    const pending = await submit('pending')
    const progress = await submit('progress')
    const done = await submit('done')
    expect(pending.outcome).toBe('submitted')
    expect(progress.outcome).toBe('submitted')
    expect(done.outcome).toBe('submitted')
    if (pending.outcome !== 'submitted' || progress.outcome !== 'submitted' || done.outcome !== 'submitted') return
    await opened.db.update(job).set({ status: 'queued', ...addresses('synthetic-pending') }).where(eq(job.id, pending.jobId))
    await opened.db.update(job).set({ status: 'in-progress', ...addresses('synthetic-progress') }).where(eq(job.id, progress.jobId))
    for (let step = 0; step < 4; step += 1) {
      const polled = await opened.studio.poll(done.jobId)
      if (polled.outcome === 'completed') break
    }
    expect((await opened.db.select().from(job).where(eq(job.id, done.jobId)))[0]?.status).toBe('completed')
    const before = await fingerprint(opened.db)
    await opened.close()

    const admin = await startAdmin({ live: true, env, port: 0 })
    servers.push(admin)
    const ticket = await ask(admin, { path: `/?ticket=${encodeURIComponent(admin.token)}` })
    const cookie = (Array.isArray(ticket.headers['set-cookie']) ? ticket.headers['set-cookie'][0] : ticket.headers['set-cookie'])?.split(';')[0] ?? ''
    const headers = { cookie, origin: admin.origin, 'content-type': 'application/json' }
    const shell = JSON.parse((await ask(admin, { path: '/api/shell', headers: { cookie } })).body) as { transport: string; fal?: string }
    expect(shell.transport).toBe('live')
    const calls: [string, string][] = [
      ['/api/jobs/poll', JSON.stringify({ ids: [pending.jobId, progress.jobId, done.jobId] })],
      [`/api/jobs/${done.jobId}/download`, '{}'],
      [`/api/jobs/${done.jobId}/download`, '{}'],
    ]
    const outcomes: string[] = []
    for (const [pathName, body] of calls) {
      const response = JSON.parse((await ask(admin, { path: pathName, method: 'POST', headers, body })).body) as { outcome?: string }
      outcomes.push(`${pathName} ${response.outcome ?? 'no-outcome'}`)
    }
    const dropped: string[] = []
    for (const pathName of [`/api/jobs/${pending.jobId}/cancel`, `/api/jobs/${pending.jobId}/attach`]) {
      const response = await ask(admin, {
        path: pathName,
        method: 'POST',
        headers,
        body: pathName.endsWith('/attach') ? JSON.stringify({ requestId: 'synthetic-attach' }) : '{}',
      })
      dropped.push(`${response.status} ${response.body}`)
    }
    await admin.close()
    servers.pop()
    const check = await openAdmin(env, false)
    const after = await fingerprint(check.db)
    await check.close()
    expect({ outcomes, dropped, after, fal: shell.fal }).toEqual({
      outcomes: calls.map(([pathName]) => `${pathName} fal-key-missing`),
      dropped: [
        '404 {"error":"not-found"}',
        '404 {"error":"not-found"}',
      ],
      after: before,
      fal: 'refused',
    })
  })

  it('answers 404 for cancel and attach in live mode when a key is set', async () => {
    const env = {
      STUDIO_DATA_DIR: mkdtempSync(path.join(tmpdir(), 'kickoff-studio-data-')),
      STUDIO_MEDIA_DIR: mkdtempSync(path.join(tmpdir(), 'kickoff-studio-media-')),
      STUDIO_NOW: '2026-10-18T18:00:00.000Z',
      STUDIO_LIVE: '1',
      DATABASE_URL: ['postgres', '://127.0.0.1:1/studio'].join(''),
      STUDIO_ADMIN_LIVE_PGLITE: '1',
      [['FAL', '_KEY'].join('')]: 'present-for-the-404',
    }
    const admin = await startAdmin({ live: true, env, port: 0 })
    servers.push(admin)
    expect(admin.fal).toBe('live')
    const ticket = await ask(admin, { path: `/?ticket=${encodeURIComponent(admin.token)}` })
    const cookie = (Array.isArray(ticket.headers['set-cookie']) ? ticket.headers['set-cookie'][0] : ticket.headers['set-cookie'])?.split(';')[0] ?? ''
    const headers = { cookie, origin: admin.origin, 'content-type': 'application/json' }
    const id = '00000000-0000-4000-8000-000000000001'
    for (const pathName of [`/api/jobs/${id}/cancel`, `/api/jobs/${id}/attach`]) {
      const response = await ask(admin, { path: pathName, method: 'POST', headers, body: '{}' })
      expect(response.status).toBe(404)
      expect(response.body).toBe('{"error":"not-found"}')
    }
  })

  it('answers 404 for cancel and attach in stub mode', async () => {
    const env = {
      STUDIO_DATA_DIR: mkdtempSync(path.join(tmpdir(), 'kickoff-studio-data-')),
      STUDIO_MEDIA_DIR: mkdtempSync(path.join(tmpdir(), 'kickoff-studio-media-')),
      STUDIO_NOW: '2026-10-18T18:00:00.000Z',
    }
    const admin = await startAdmin({ live: false, env, port: 0 })
    servers.push(admin)
    const ticket = await ask(admin, { path: `/?ticket=${encodeURIComponent(admin.token)}` })
    const cookie = (Array.isArray(ticket.headers['set-cookie']) ? ticket.headers['set-cookie'][0] : ticket.headers['set-cookie'])?.split(';')[0] ?? ''
    const headers = { cookie, origin: admin.origin, 'content-type': 'application/json' }
    const id = '00000000-0000-4000-8000-000000000001'
    for (const pathName of [`/api/jobs/${id}/cancel`, `/api/jobs/${id}/attach`]) {
      const response = await ask(admin, { path: pathName, method: 'POST', headers, body: '{}' })
      expect(response.status).toBe(404)
      expect(response.body).toBe('{"error":"not-found"}')
    }
  })
})
