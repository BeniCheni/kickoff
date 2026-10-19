import { mkdtempSync } from 'node:fs'
import { request as httpRequest, type IncomingHttpHeaders } from 'node:http'
import { tmpdir } from 'node:os'
import { afterEach, describe, expect, it } from 'vitest'
import type { ScriptName } from '../fal/stub.ts'
import { startAdmin, type AdminServer } from '../server/http.ts'
import { composeJobs, submitBlock, type ComposeDraft } from '../shared/compose.ts'
import { DRAFT } from '../shared/admin-copy.ts'
import { minimalJpeg } from './jpeg.ts'

const servers: AdminServer[] = []
const SCRIPTS: readonly ScriptName[] = [
  'queued-then-completed',
  'error-payload',
  'safety-refusal',
  'timeout',
  'expired-result',
  'duplicate-delivery',
  'out-of-credit',
]

afterEach(async () => {
  while (servers.length > 0) await servers.pop()?.close()
})

function env(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  return {
    STUDIO_DATA_DIR: mkdtempSync(pathJoin('data')),
    STUDIO_MEDIA_DIR: mkdtempSync(pathJoin('media')),
    STUDIO_NOW: '2026-10-18T18:00:00.000Z',
    ...extra,
  }
}

function pathJoin(kind: string): string {
  return `${tmpdir()}/kickoff-studio-${kind}-`
}

function draft(over: Partial<ComposeDraft> = {}): ComposeDraft {
  return {
    subjectId: null,
    photoId: null,
    keyframeEndpoint: 'openai/gpt-image-2/edit',
    canvas: '16:10',
    prompts: { k0: '', k1: '', k2: '' },
    clipEndpoint: 'minimax/h3-max-turbo/image-to-video',
    frames: 'k0-k2',
    resolution: '480P',
    duration: 15,
    motion: 'a fictional cat',
    seed: '1',
    expansion: 'off',
    ...over,
  }
}

function ask(admin: AdminServer, options: {
  path: string
  method?: string
  headers?: IncomingHttpHeaders
  body?: string | Buffer
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

describe('compose', () => {
  it('prices the current rule only and refuses a budget or a paused database', async () => {
    const admin = await startAdmin({ env: env(), port: 0 })
    servers.push(admin)
    const cookie = await cookieFor(admin)
    const jobs = composeJobs(draft())
    const estimated = await ask(admin, {
      path: '/api/estimate',
      method: 'POST',
      headers: { cookie, origin: admin.origin, 'content-type': 'application/json' },
      body: JSON.stringify({ jobs }),
    })
    const body = JSON.parse(estimated.body) as { lines: { outcome: string; usd?: string }[]; totalUsd: string; overBudget: boolean }
    expect(body.lines[0]?.outcome).toBe('estimate')
    expect(body.lines[0]?.usd).toBe('0.375000')
    expect(body.totalUsd).toBe('0.375000')
    expect(body.overBudget).toBe(false)
    expect(estimated.body).not.toContain('to 14 Oct')
    expect(estimated.body).not.toContain('From 15 Oct')

    const tooLong = [{
      endpoint: 'minimax/h3-max-turbo/image-to-video',
      params: { prompt: 'a fictional cat', duration: 80, resolution: '480P', seed: 'over' },
      prompt: 'a fictional cat',
    }]
    const refused = JSON.parse((await ask(admin, {
      path: '/api/estimate',
      method: 'POST',
      headers: { cookie, origin: admin.origin, 'content-type': 'application/json' },
      body: JSON.stringify({ jobs: tooLong }),
    })).body) as { overBudget: boolean }
    expect(refused.overBudget).toBe(true)

    const paused = await startAdmin({ env: env({ STUDIO_ADMIN_DATABASE: 'unavailable' }), port: 0 })
    servers.push(paused)
    const pausedCookie = await cookieFor(paused)
    const blocked = JSON.parse((await ask(paused, {
      path: '/api/submit',
      method: 'POST',
      headers: { cookie: pausedCookie, origin: paused.origin, 'content-type': 'application/json' },
      body: JSON.stringify({ confirmTotalUsd: '0.375000', jobs }),
    })).body) as { outcome: string }
    expect(blocked.outcome).toBe('database-unavailable')
    expect(submitBlock({ database: 'unavailable', jobCount: 1, overBudget: false, unpriced: false })).toBe(DRAFT.submitDatabase)
    expect(submitBlock({ database: 'reachable', jobCount: 1, overBudget: true, unpriced: false })).toBe(DRAFT.submitBudget)
  })

  it('reaches every stub script from a submit', async () => {
    for (const script of SCRIPTS) {
      const admin = await startAdmin({ env: env({ STUDIO_STUB: script }), port: 0 })
      servers.push(admin)
      const cookie = await cookieFor(admin)
      const jobs = composeJobs(draft({ seed: script }))
      const estimated = JSON.parse((await ask(admin, {
        path: '/api/estimate',
        method: 'POST',
        headers: { cookie, origin: admin.origin, 'content-type': 'application/json' },
        body: JSON.stringify({ jobs }),
      })).body) as { totalUsd: string }
      const submitted = JSON.parse((await ask(admin, {
        path: '/api/submit',
        method: 'POST',
        headers: { cookie, origin: admin.origin, 'content-type': 'application/json' },
        body: JSON.stringify({ confirmTotalUsd: estimated.totalUsd, jobs }),
      })).body) as { outcome: string; results?: { outcome: string }[] }
      expect(submitted.outcome).toBe('submitted-batch')
      const first = submitted.results?.[0]?.outcome
      if (script === 'out-of-credit') expect(first).toBe('out-of-credit')
      else expect(first).toBe('submitted')
    }
  })

  it('stores a stripped jpeg and will not serve a path', async () => {
    const admin = await startAdmin({ env: env(), port: 0 })
    servers.push(admin)
    const cookie = await cookieFor(admin)
    const uploaded = JSON.parse((await ask(admin, {
      path: '/api/photos',
      method: 'POST',
      headers: { cookie, origin: admin.origin, 'content-type': 'image/jpeg' },
      body: Buffer.from(minimalJpeg),
    })).body) as { id: string }
    expect(uploaded.id).toMatch(/^[a-f0-9]{32}$/)
    const media = await ask(admin, { path: `/media/photos/${uploaded.id}`, headers: { cookie, range: 'bytes=0-3' } })
    expect(media.status).toBe(206)
    expect(media.headers['content-range']).toMatch(/^bytes 0-3\//)
    const escaped = await ask(admin, { path: '/media/photos/..%2F..%2Fpackage.json', headers: { cookie } })
    expect(escaped.status).toBe(403)
    expect(escaped.body).not.toContain('dependencies')
  })
})
