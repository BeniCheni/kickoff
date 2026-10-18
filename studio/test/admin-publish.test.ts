import { mkdtempSync } from 'node:fs'
import { request as httpRequest, type IncomingHttpHeaders } from 'node:http'
import { tmpdir } from 'node:os'
import { afterEach, describe, expect, it } from 'vitest'
import { CHECKLIST_LINES, generationSubject, subject } from '../db/schema.ts'
import { DRAFT } from '../shared/admin-copy.ts'
import { openAdmin } from '../server/open.ts'
import { startAdmin, type AdminServer } from '../server/http.ts'

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

describe('publish', () => {
  it('refuses a publish that lacks width, height, and duration, in plain words', async () => {
    const folders = {
      STUDIO_DATA_DIR: mkdtempSync(`${tmpdir()}/kickoff-studio-data-`),
      STUDIO_MEDIA_DIR: mkdtempSync(`${tmpdir()}/kickoff-studio-media-`),
      STUDIO_NOW: '2026-10-18T18:00:00.000Z',
    }
    const opened = await openAdmin(folders, false)
    const [who] = await opened.db.insert(subject).values({ name: 'Fenway' }).returning()
    if (!who) throw new Error('no subject')
    const submitted = await opened.studio.submit({
      endpoint: 'minimax/h3-max-turbo/image-to-video',
      params: { prompt: 'a fictional cat', duration: 15, resolution: '480P', seed: 'publish' },
      prompt: 'a fictional cat',
      seed: 'publish',
      subjectId: who.id,
    })
    expect(submitted.outcome).toBe('submitted')
    if (submitted.outcome !== 'submitted') return
    for (let step = 0; step < 4; step += 1) {
      const polled = await opened.studio.poll(submitted.jobId)
      if (polled.outcome === 'completed') break
    }
    expect((await opened.studio.download(submitted.jobId)).outcome).toBe('downloaded')
    const kept = await opened.studio.keep(submitted.jobId, CHECKLIST_LINES.map((line) => ({ line, answer: 'clear' as const, by: 'operator' })))
    expect(kept.outcome).toBe('kept')
    const linked = await opened.db.select().from(generationSubject)
    expect(linked.length).toBe(1)
    await opened.close()

    const admin = await startAdmin({ env: folders, port: 0 })
    servers.push(admin)
    const ticket = await ask(admin, { path: `/?ticket=${encodeURIComponent(admin.token)}` })
    const header = ticket.headers['set-cookie']
    const cookie = (Array.isArray(header) ? header[0] : header)?.split(';')[0] ?? ''
    const preview = JSON.parse((await ask(admin, {
      path: `/api/publish/${submitted.jobId}?publicId=fenway-1`,
      headers: { cookie },
    })).body) as { gateRecorded: boolean; refusals: string[]; status: string }
    expect(preview.gateRecorded).toBe(false)
    expect(preview.refusals).toEqual(expect.arrayContaining([DRAFT.cardWidth, DRAFT.cardHeight, DRAFT.cardDuration]))
    expect(preview.refusals).not.toContain(DRAFT.cardSubject)
    expect(preview.refusals).not.toContain(DRAFT.cardPublicId)
    const refused = JSON.parse((await ask(admin, {
      path: `/api/publish/${submitted.jobId}/go`,
      method: 'POST',
      headers: { cookie, origin: admin.origin, 'content-type': 'application/json' },
      body: JSON.stringify({ publicId: 'fenway-1', title: 'Fenway', position: 1, confirm: true }),
    })).body) as { outcome: string }
    expect(refused.outcome).toBe('gate-closed')
    const recorded = JSON.parse((await ask(admin, {
      path: '/api/gate',
      method: 'POST',
      headers: { cookie, origin: admin.origin, 'content-type': 'application/json' },
      body: JSON.stringify({
        answer: 'Article 50 is recorded for this test.',
        disclosure: 'The Generated label stays.',
        recordedBy: 'operator',
        source: 'test',
      }),
    })).body) as { outcome: string }
    expect(recorded.outcome).toBe('gate-recorded')
    const blocked = JSON.parse((await ask(admin, {
      path: `/api/publish/${submitted.jobId}/go`,
      method: 'POST',
      headers: { cookie, origin: admin.origin, 'content-type': 'application/json' },
      body: JSON.stringify({ publicId: 'fenway-1', title: 'Fenway', position: 1, confirm: true }),
    })).body) as { outcome: string; refusals: string[] }
    expect(blocked.outcome).toBe('card-refused')
    expect(blocked.refusals).toEqual(expect.arrayContaining([DRAFT.cardWidth, DRAFT.cardHeight, DRAFT.cardDuration]))
    const listed = JSON.parse((await ask(admin, { path: '/api/jobs', headers: { cookie } })).body) as { status: string }[]
    expect(listed[0]?.status).toBe('kept')
  })
})
