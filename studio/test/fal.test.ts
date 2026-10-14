import { describe, expect, it } from 'vitest'
import { FAL_HEADER, falHeaders } from '../fal/headers.ts'
import { createNetworkGuard, NetworkGuardError, STUB_HOST } from '../fal/guard.ts'
import { createLiveTransport, liveFalArmed, selectFalTransport } from '../fal/live.ts'
import { QueueUrlError, queueAddresses } from '../fal/urls.ts'
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

  it('sends the key on submit, status, result and cancel, each to the stored queue URL', async () => {
    const seen: { url: string; authorization: string | null; method: string }[] = []
    const fetchImpl = (async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
      const headers = new Headers(init?.headers)
      const url = String(input)
      seen.push({ url, authorization: headers.get('authorization'), method: init?.method ?? 'GET' })
      if (init?.method === 'POST') {
        return new Response(JSON.stringify({
          request_id: 'req-1',
          status_url: 'https://queue.fal.run/fal-ai/flux/schnell/requests/req-1/status',
          response_url: 'https://queue.fal.run/fal-ai/flux/schnell/requests/req-1/response',
          cancel_url: 'https://queue.fal.run/fal-ai/flux/schnell/requests/req-1/cancel',
        }), { status: 200 })
      }
      if (url.endsWith('/status')) return new Response(JSON.stringify({ status: 'IN_QUEUE' }), { status: 200 })
      if (url.endsWith('/cancel')) return new Response(JSON.stringify({ status: 'CANCELLATION_REQUESTED' }), { status: 202 })
      return new Response(JSON.stringify({ video: { url: 'https://studio-stub.invalid/clip.mp4' } }), {
        status: 200,
        headers: { 'x-fal-billable-units': '15' },
      })
    }) as typeof fetch
    const live = createLiveTransport('SECRET-KEY', fetchImpl, true)
    const submitted = await live.submit({ endpoint: 'fal-ai/flux/schnell', body: { prompt: 'x' }, headers: {} })
    expect(submitted.httpStatus).toBe(200)
    const urls = submitted.body as { status_url: string; response_url: string; cancel_url: string }
    await live.status({ requestId: 'req-1', statusUrl: urls.status_url, headers: {} })
    await live.result({ requestId: 'req-1', responseUrl: urls.response_url, headers: {} })
    await live.cancel({ requestId: 'req-1', cancelUrl: urls.cancel_url, headers: {} })
    expect(seen.map((call) => call.url)).toEqual([
      'https://queue.fal.run/fal-ai/flux/schnell',
      'https://queue.fal.run/fal-ai/flux/schnell/requests/req-1/status',
      'https://queue.fal.run/fal-ai/flux/schnell/requests/req-1/response',
      'https://queue.fal.run/fal-ai/flux/schnell/requests/req-1/cancel',
    ])
    expect(seen.every((call) => call.authorization === 'Key SECRET-KEY')).toBe(true)
  })

  it('refuses a queue URL on another origin and does not send the key', async () => {
    const seen: string[] = []
    const fetchImpl = (async (input: Parameters<typeof fetch>[0]) => {
      seen.push(String(input))
      throw new Error('fetch was called')
    }) as typeof fetch
    const live = createLiveTransport('SECRET-KEY', fetchImpl, true)
    await expect(live.status({
      requestId: 'req-1',
      statusUrl: 'https://evil.example/requests/req-1/status',
      headers: {},
    })).rejects.toBeInstanceOf(QueueUrlError)
    expect(seen).toEqual([])
  })
})

describe('queue addresses', () => {
  it('builds the three routes the queue page lists on the submit response', () => {
    expect(queueAddresses('fal-ai/flux/schnell', '764cabcf-b745-4b3e-ae38-1200304cf45b')).toEqual({
      statusUrl: 'https://queue.fal.run/fal-ai/flux/schnell/requests/764cabcf-b745-4b3e-ae38-1200304cf45b/status',
      responseUrl: 'https://queue.fal.run/fal-ai/flux/schnell/requests/764cabcf-b745-4b3e-ae38-1200304cf45b/response',
      cancelUrl: 'https://queue.fal.run/fal-ai/flux/schnell/requests/764cabcf-b745-4b3e-ae38-1200304cf45b/cancel',
    })
    expect(queueAddresses('minimax/h3-max-turbo/image-to-video', 'req-from-fal').statusUrl).toBe(
      'https://queue.fal.run/minimax/h3-max-turbo/image-to-video/requests/req-from-fal/status',
    )
    expect(() => queueAddresses('minimax/h3-max-turbo/image-to-video', '../other')).toThrow(QueueUrlError)
  })
})

describe('fal headers', () => {
  it('sends no-retry, no fallback, and a timeout on every call, and the photo limits only with a photograph', () => {
    const plain = falHeaders({ requestTimeoutSeconds: 120, carriesPhotograph: false })
    expect(plain[FAL_HEADER.noRetry]).toBe('1')
    expect(plain[FAL_HEADER.disableFallback]).toBe('true')
    expect(plain[FAL_HEADER.requestTimeout]).toBe('120')
    expect(plain[FAL_HEADER.storeIo]).toBeUndefined()

    const photo = falHeaders({ requestTimeoutSeconds: 120, carriesPhotograph: true })
    expect(photo[FAL_HEADER.storeIo]).toBe('0')
    expect(photo[FAL_HEADER.objectLifecycle]).toContain('86400')
    expect(photo.authorization).toBeUndefined()
  })
})
