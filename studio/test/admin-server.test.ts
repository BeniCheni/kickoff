import { mkdtempSync } from 'node:fs'
import { request as httpRequest, type IncomingHttpHeaders } from 'node:http'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { PER_JOB_CAP_USD, PREPAID_CEILING_USD, SESSION_CAP_USD } from '../caps.ts'
import { SESSION_COOKIE } from '../server/guard.ts'
import { startAdmin, type AdminServer } from '../server/http.ts'
import { findSecrets } from '../secrets/scan.ts'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const open: AdminServer[] = []

function env(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  const data = mkdtempSync(path.join(tmpdir(), 'kickoff-studio-data-'))
  const media = mkdtempSync(path.join(tmpdir(), 'kickoff-studio-media-'))
  return {
    STUDIO_DATA_DIR: data,
    STUDIO_MEDIA_DIR: media,
    STUDIO_NOW: '2026-10-18T18:00:00.000Z',
    ...extra,
  }
}

async function boot(extra: Record<string, string> = {}, boom?: string): Promise<AdminServer> {
  const admin = await startAdmin({ env: env(extra), port: 0, boom })
  open.push(admin)
  return admin
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
      headers: {
        host: `127.0.0.1:${admin.port}`,
        ...options.headers,
      },
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

function cookieFrom(header: string | string[] | undefined): string {
  const value = Array.isArray(header) ? header[0] : header
  if (!value) throw new Error('no cookie')
  return value.split(';')[0] ?? ''
}

afterEach(async () => {
  while (open.length > 0) await open.pop()?.close()
})

describe('admin server', () => {
  it('refuses a missing token, a wrong token, a foreign origin, and a non-loopback host', async () => {
    const admin = await boot()
    const bare = await ask(admin, { path: '/api/shell' })
    expect(bare.status).toBe(403)
    expect(bare.body).toBe('{"error":"refused"}')
    expect(bare.headers['access-control-allow-origin']).toBeUndefined()

    const wrong = await ask(admin, {
      path: '/api/shell',
      headers: { cookie: `${SESSION_COOKIE}=not-this-run` },
    })
    expect(wrong.status).toBe(403)

    const ticket = await ask(admin, { path: `/?ticket=${encodeURIComponent(admin.token)}` })
    expect(ticket.status).toBe(302)
    expect(ticket.headers.location).toBe('/')
    const cookie = cookieFrom(ticket.headers['set-cookie'])
    expect(cookie.startsWith(`${SESSION_COOKIE}=`)).toBe(true)
    expect(String(ticket.headers['set-cookie'])).toContain('HttpOnly')
    expect(String(ticket.headers['set-cookie'])).toContain('SameSite=Strict')

    const shell = await ask(admin, { path: '/api/shell', headers: { cookie } })
    expect(shell.status).toBe(200)
    const body = JSON.parse(shell.body) as {
      transport: string
      host: string
      balance: null
      session: null
      database: string
      caps: { perJobUsd: string; sessionUsd: string; prepaidCeilingUsd: string }
    }
    expect(body.transport).toBe('stub')
    expect(JSON.parse(shell.body).databaseEngine).toBe('pglite')
    expect(JSON.parse(shell.body).storage).toBe('stub')
    expect(JSON.parse(shell.body).falConfigured).toBe(true)
    expect(body.host).toBe('127.0.0.1')
    expect(body.balance).toBeNull()
    expect(body.session).toBeNull()
    expect(body.database).toBe('reachable')
    expect(body.caps).toEqual({
      perJobUsd: PER_JOB_CAP_USD,
      sessionUsd: SESSION_CAP_USD,
      prepaidCeilingUsd: PREPAID_CEILING_USD,
    })
    expect(shell.body).not.toContain(admin.token)
    expect(findSecrets(shell.body)).toEqual([])
    expect(shell.headers['access-control-allow-origin']).toBeUndefined()

    const foreign = await ask(admin, {
      path: '/api/shell',
      method: 'POST',
      headers: { cookie, origin: 'http://evil.example' },
    })
    expect(foreign.status).toBe(403)

    const missingOrigin = await ask(admin, {
      path: '/api/shell',
      method: 'POST',
      headers: { cookie },
    })
    expect(missingOrigin.status).toBe(403)

    const rebound = await ask(admin, {
      path: '/api/shell',
      headers: { cookie, host: 'evil.example' },
    })
    expect(rebound.status).toBe(403)

    const named = await ask(admin, {
      path: '/api/shell',
      headers: { cookie, host: `localhost:${admin.port}` },
    })
    expect(named.status).toBe(403)

    const posted = await ask(admin, {
      path: '/api/shell',
      method: 'POST',
      headers: { cookie, origin: admin.origin },
    })
    expect(posted.status).toBe(405)
    const again = await ask(admin, { path: '/api/shell', headers: { cookie } })
    expect(JSON.parse(again.body).transport).toBe('stub')
  })

  it('refuses to start off loopback, inside the repo, or live without the named pieces', async () => {
    await expect(startAdmin({ host: '0.0.0.0', env: env(), port: 0 })).rejects.toThrow(/127\.0\.0\.1/)
    await expect(startAdmin({
      env: { ...env(), STUDIO_DATA_DIR: path.join(repoRoot, 'studio') },
      port: 0,
    })).rejects.toThrow(/worktree/)
    await expect(startAdmin({ live: true, env: env(), port: 0 })).rejects.toThrow(/STUDIO_LIVE/)
    await expect(startAdmin({ live: true, env: env({ STUDIO_LIVE: '1' }), port: 0 })).rejects.toThrow(/DATABASE_URL/)
  })

  it('keeps a secret out of an error response', async () => {
    const secret = ['postgres', '://user:secret@localhost/db'].join('')
    const key = ['FAL', '_KEY=', 'present'].join('')
    const shaped = ['sk-', 'abcdefgh'].join('')
    const admin = await boot({}, `${secret} ${key} ${shaped}`)
    const ticket = await ask(admin, { path: `/?ticket=${encodeURIComponent(admin.token)}` })
    const cookie = cookieFrom(ticket.headers['set-cookie'])
    const boom = await ask(admin, { path: '/api/boom', headers: { cookie } })
    expect(boom.status).toBe(500)
    expect(boom.body).toBe('{"error":"refused"}')
    expect(findSecrets(boom.body)).toEqual([])
    expect(boom.body).not.toContain('secret')
    expect(boom.body).not.toContain('postgres')
    expect(boom.body).not.toContain(shaped)
    expect(boom.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('reports a paused database and an exhausted stub as states, not invented balances', async () => {
    const paused = await boot({ STUDIO_ADMIN_DATABASE: 'unavailable' })
    const ticket = await ask(paused, { path: `/?ticket=${encodeURIComponent(paused.token)}` })
    const cookie = cookieFrom(ticket.headers['set-cookie'])
    const shell = JSON.parse((await ask(paused, { path: '/api/shell', headers: { cookie } })).body) as {
      database: string
      balance: null
    }
    expect(shell.database).toBe('unavailable')
    expect(shell.balance).toBeNull()

    const credit = await boot({ STUDIO_STUB: 'out-of-credit' })
    const creditTicket = await ask(credit, { path: `/?ticket=${encodeURIComponent(credit.token)}` })
    const creditCookie = cookieFrom(creditTicket.headers['set-cookie'])
    const creditShell = JSON.parse((await ask(credit, { path: '/api/shell', headers: { cookie: creditCookie } })).body) as {
      outOfCredit: boolean
      transport: string
    }
    expect(creditShell.outOfCredit).toBe(true)
    expect(creditShell.transport).toBe('stub')
  })

  it('answers a bad body with its status, and spends the one-time URL', async () => {
    const admin = await boot()
    const first = await ask(admin, { path: `/?ticket=${encodeURIComponent(admin.token)}` })
    expect(first.status).toBe(302)
    const cookie = cookieFrom(first.headers['set-cookie'])
    const second = await ask(admin, { path: `/?ticket=${encodeURIComponent(admin.token)}` })
    expect(second.status).toBe(403)
    const still = await ask(admin, { path: '/api/shell', headers: { cookie } })
    expect(still.status).toBe(200)

    const headers = { cookie, origin: admin.origin }
    const malformed = await ask(admin, {
      path: '/api/estimate',
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: '{not json',
    })
    expect(malformed.status).toBe(400)
    const plain = await ask(admin, {
      path: '/api/estimate',
      method: 'POST',
      headers: { ...headers, 'content-type': 'text/plain' },
      body: '{}',
    })
    expect(plain.status).toBe(415)
    const huge = await ask(admin, {
      path: '/api/estimate',
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: Buffer.alloc(1_000_001, 0x20),
    })
    expect(huge.status).toBe(413)
    for (const response of [malformed, plain, huge]) {
      expect(response.body).not.toContain('Failed query')
      expect(findSecrets(response.body)).toEqual([])
    }
  })
})
