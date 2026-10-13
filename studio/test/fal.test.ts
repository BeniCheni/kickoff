import { describe, expect, it } from 'vitest'
import { FAL_HEADER, falHeaders } from '../fal/headers.ts'
import { createNetworkGuard, NetworkGuardError, STUB_HOST } from '../fal/guard.ts'
import { createLiveTransport, liveFalArmed, selectFalTransport } from '../fal/live.ts'
import { statusResponseSchema } from '../fal/schemas.ts'
import { createFalStub, OutOfCreditError } from '../fal/stub.ts'

const headers = falHeaders({ requestTimeoutSeconds: 120, carriesPhotograph: false })

describe('fal stub sequences', () => {
  it('walks queued, then in progress, then a completed result', async () => {
    const fal = createFalStub('queued-then-completed')
    await fal.submit({ endpoint: 'minimax/h3-max-turbo/image-to-video', body: {}, headers })
    expect(await fal.status({ requestId: 'req-stub-1', headers })).toEqual({ status: 'IN_QUEUE' })
    expect(await fal.status({ requestId: 'req-stub-1', headers })).toEqual({ status: 'IN_PROGRESS' })
    expect(await fal.status({ requestId: 'req-stub-1', headers })).toEqual({ status: 'COMPLETED' })
    const result = await fal.result({ requestId: 'req-stub-1', headers })
    expect(result.httpStatus).toBe(200)
    expect(result.billableUnits).toBe('15')
  })

  it('returns an error payload, a safety refusal, a timeout, an expired result, and a duplicate delivery', async () => {
    const error = createFalStub('error-payload')
    expect((await error.result({ requestId: 'x', headers })).httpStatus).toBe(422)

    const safety = createFalStub('safety-refusal')
    const refused = await safety.result({ requestId: 'x', headers })
    expect(JSON.stringify(refused.body)).toContain('likeness')

    const timeout = createFalStub('timeout')
    expect(await timeout.status({ requestId: 'x', headers })).toEqual({ status: 'IN_QUEUE' })
    expect(await timeout.status({ requestId: 'x', headers })).toEqual({ status: 'IN_QUEUE' })

    const expired = createFalStub('expired-result')
    await expect(expired.download({ requestId: 'x', headers })).rejects.toThrow(/expired/)

    const duplicate = createFalStub('duplicate-delivery')
    expect((await duplicate.result({ requestId: 'x', headers })).httpStatus).toBe(200)
    expect((await duplicate.result({ requestId: 'x', headers })).httpStatus).toBe(200)
  })

  it('reports out of credit with fal\'s locked-balance sentence', async () => {
    const fal = createFalStub('out-of-credit')
    await expect(fal.submit({ endpoint: 'openai/gpt-image-2/edit', body: {}, headers })).rejects.toBeInstanceOf(OutOfCreditError)
  })

  it('rejects a status the schema does not know', () => {
    expect(statusResponseSchema.safeParse({ status: 'OK' }).success).toBe(false)
  })
})

describe('network guard', () => {
  it('refuses every host except the stub and does not call fetch', async () => {
    const seen: string[] = []
    const inner = (async (input: Parameters<typeof fetch>[0]) => {
      seen.push(String(input))
      throw new Error('fetch was called')
    }) as typeof fetch
    const guarded = createNetworkGuard(inner)
    await expect(guarded('https://queue.fal.run/models')).rejects.toBeInstanceOf(NetworkGuardError)
    await expect(guarded(`https://${STUB_HOST}/clip.mp4`)).rejects.toThrow(/fetch was called/)
    expect(seen).toEqual([`https://${STUB_HOST}/clip.mp4`])
  })

  it('keeps the live transport behind the guard unless the live flag and environment are both set', async () => {
    const stub = createFalStub('timeout')
    expect(selectFalTransport({ argv: ['submit'], env: {}, stub })).toBe(stub)
    expect(selectFalTransport({ argv: ['--live'], env: { STUDIO_LIVE: '1' }, stub })).toBe(stub)
    expect(liveFalArmed(['--live'], { STUDIO_LIVE: '1', FAL_KEY: 'present' })).toBe(true)

    const seen: string[] = []
    const inner = (async (input: Parameters<typeof fetch>[0]) => {
      seen.push(String(input))
      throw new Error('fetch was called')
    }) as typeof fetch
    const blocked = createLiveTransport('present', inner, false)
    await expect(blocked.submit({ endpoint: 'openai/gpt-image-2/edit', body: {}, headers: {} })).rejects.toBeInstanceOf(NetworkGuardError)
    expect(seen).toEqual([])
    expect(blocked.calls).toEqual([])
  })
})

describe('fal headers', () => {
  it('sends no-retry, no fallback, and a timeout on every call, and the photo limits only with a photograph', () => {
    const plain = falHeaders({ requestTimeoutSeconds: 120, carriesPhotograph: false })
    expect(plain[FAL_HEADER.noRetry]).toBe('1')
    expect(plain[FAL_HEADER.disableFallback]).toBe('1')
    expect(plain[FAL_HEADER.requestTimeout]).toBe('120')
    expect(plain[FAL_HEADER.storeIo]).toBeUndefined()

    const photo = falHeaders({ requestTimeoutSeconds: 120, carriesPhotograph: true })
    expect(photo[FAL_HEADER.storeIo]).toBe('0')
    expect(photo[FAL_HEADER.objectLifecycle]).toContain('86400')
    expect(photo.authorization).toBeUndefined()
  })
})
