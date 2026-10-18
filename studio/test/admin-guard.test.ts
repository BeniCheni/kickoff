import { describe, expect, it } from 'vitest'
import { assertLoopbackBind, isLoopbackHost } from '../server/bind.ts'
import { guardRequest, oneTimeUrl, sessionCookie } from '../server/guard.ts'
import { publicError } from '../server/public-error.ts'
import { findSecrets } from '../secrets/scan.ts'

const token = 'token-value-for-the-run'

function decide(over: Partial<Parameters<typeof guardRequest>[0]> = {}) {
  return guardRequest({
    method: 'GET',
    host: '127.0.0.1:5176',
    origin: undefined,
    cookieToken: token,
    ticket: undefined,
    token,
    expectedOrigin: 'http://127.0.0.1:5176',
    port: 5176,
    loopbackHost: true,
    ...over,
  })
}

describe('admin guard', () => {
  it('refuses to bind off loopback', () => {
    expect(() => assertLoopbackBind('0.0.0.0')).toThrow(/127\.0\.0\.1/)
    expect(() => assertLoopbackBind('localhost')).toThrow(/127\.0\.0\.1/)
    expect(() => assertLoopbackBind('127.0.0.1')).not.toThrow()
    expect(isLoopbackHost('evil.example', 5176)).toBe(false)
    expect(isLoopbackHost('localhost:5176', 5176)).toBe(false)
    expect(isLoopbackHost('127.0.0.1:5176', 5176)).toBe(true)
    expect(isLoopbackHost('[::1]:5176', 5176)).toBe(true)
  })

  it('requires this run’s token and, on a write, this server’s origin', () => {
    expect(decide()).toEqual({ ok: true, setCookie: false })
    expect(decide({ cookieToken: undefined, ticket: undefined }).ok).toBe(false)
    expect(decide({ cookieToken: 'wrong', ticket: undefined }).ok).toBe(false)
    expect(decide({ cookieToken: undefined, ticket: token })).toEqual({ ok: true, setCookie: true })
    expect(decide({ method: 'POST', origin: 'http://evil.example' }).ok).toBe(false)
    expect(decide({ method: 'POST', origin: undefined }).ok).toBe(false)
    expect(decide({ method: 'POST', origin: 'http://127.0.0.1:5176' })).toEqual({ ok: true, setCookie: false })
    expect(decide({ loopbackHost: false }).ok).toBe(false)
    expect(oneTimeUrl('http://127.0.0.1:5176', token)).toBe(`http://127.0.0.1:5176/?ticket=${token}`)
    expect(sessionCookie(token)).toContain('HttpOnly')
    expect(sessionCookie(token)).toContain('SameSite=Strict')
  })

  it('drops a secret from an error path', () => {
    const url = ['postgres', '://user:secret@localhost/db'].join('')
    const key = ['FAL_KEY=', 'present'].join('')
    const body = publicError(new Error(`${url} ${key}`))
    expect(body).toBe('refused')
    expect(findSecrets(body)).toEqual([])
    expect(body).not.toContain('secret')
  })
})
