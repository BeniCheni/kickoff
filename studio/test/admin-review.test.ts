import { mkdtempSync } from 'node:fs'
import { request as httpRequest, type IncomingHttpHeaders } from 'node:http'
import { tmpdir } from 'node:os'
import { afterEach, describe, expect, it } from 'vitest'
import { CHECKLIST_LINES } from '../db/schema.ts'
import { openAdmin } from '../server/open.ts'
import { startAdmin, type AdminServer } from '../server/http.ts'
import { CHECKLIST } from '../shared/review.ts'

const servers: AdminServer[] = []

afterEach(async () => {
  while (servers.length > 0) await servers.pop()?.close()
})

function env(): NodeJS.ProcessEnv {
  return {
    STUDIO_DATA_DIR: mkdtempSync(`${tmpdir()}/kickoff-studio-data-`),
    STUDIO_MEDIA_DIR: mkdtempSync(`${tmpdir()}/kickoff-studio-media-`),
    STUDIO_NOW: '2026-10-18T18:00:00.000Z',
  }
}

function ask(admin: AdminServer, options: {
  path: string
  method?: string
  headers?: IncomingHttpHeaders
  body?: string
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
    if (options.body) req.write(options.body)
    req.end()
  })
}

async function cookieFor(admin: AdminServer): Promise<string> {
  const ticket = await ask(admin, { path: `/?ticket=${encodeURIComponent(admin.token)}` })
  const header = ticket.headers['set-cookie']
  const value = Array.isArray(header) ? header[0] : header
  if (!value) throw new Error('no cookie')
  return value.split(';')[0] ?? ''
}

describe('review', () => {
  it('names the five checklist lines from the schema', () => {
    expect(CHECKLIST.map((item) => item.line)).toEqual([...CHECKLIST_LINES])
  })

  it('serves only a recorded file, and Keep waits for five Clear answers', async () => {
    const folders = env()
    const opened = await openAdmin(folders, false)
    const submitted = await opened.studio.submit({
      endpoint: 'minimax/h3-max-turbo/image-to-video',
      params: { prompt: 'a fictional cat', duration: 15, resolution: '480P', seed: 'review' },
      prompt: 'a fictional cat',
      seed: 'review',
    })
    expect(submitted.outcome).toBe('submitted')
    if (submitted.outcome !== 'submitted') return
    let done = ''
    for (let step = 0; step < 4; step += 1) {
      const polled = await opened.studio.poll(submitted.jobId)
      done = polled.outcome
      if (done === 'completed') break
    }
    expect(done).toBe('completed')
    expect((await opened.studio.download(submitted.jobId)).outcome).toBe('downloaded')
    await opened.close()

    const admin = await startAdmin({ env: folders, port: 0 })
    servers.push(admin)
    const cookie = await cookieFor(admin)
    const review = JSON.parse((await ask(admin, { path: `/api/review/${submitted.jobId}`, headers: { cookie } })).body) as {
      assetId: string
      file: { sha256: string; width: number | null }
      parents: string[]
    }
    if (!review.file) throw new Error(JSON.stringify(review))
    expect(review.file.width).toBeNull()
    expect(review.parents).toEqual([])
    const media = await ask(admin, {
      path: `/media/assets/${review.assetId}`,
      headers: { cookie, range: 'bytes=0-3' },
    })
    expect(media.status).toBe(206)
    const missing = await ask(admin, {
      path: '/media/assets/00000000-0000-0000-0000-000000000000',
      headers: { cookie },
    })
    expect(missing.status).toBe(404)
    const partial = await ask(admin, {
      path: `/api/review/${submitted.jobId}/keep`,
      method: 'POST',
      headers: { cookie, origin: admin.origin, 'content-type': 'application/json' },
      body: JSON.stringify({ answers: CHECKLIST_LINES.map((line) => ({ line, answer: line === 'soundtrack' ? 'unsure' : 'clear' })) }),
    })
    expect(JSON.parse(partial.body).outcome).toBe('keep-unavailable')
    const kept = await ask(admin, {
      path: `/api/review/${submitted.jobId}/keep`,
      method: 'POST',
      headers: { cookie, origin: admin.origin, 'content-type': 'application/json' },
      body: JSON.stringify({ answers: CHECKLIST_LINES.map((line) => ({ line, answer: 'clear' })) }),
    })
    expect(JSON.parse(kept.body).outcome).toBe('kept')
  })
})
