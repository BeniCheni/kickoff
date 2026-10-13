import { falHeaders } from './headers.ts'
import { createNetworkGuard } from './guard.ts'
import { OutOfCreditError, type FalTransport } from './stub.ts'

const QUEUE_ORIGIN = 'https://queue.fal.run'

export function liveFalArmed(argv: readonly string[], env: NodeJS.ProcessEnv): boolean {
  return argv.includes('--live') && env.STUDIO_LIVE === '1' && Boolean(env.FAL_KEY)
}

export function selectFalTransport(options: {
  argv: readonly string[]
  env: NodeJS.ProcessEnv
  stub: FalTransport
  fetchImpl?: typeof fetch
}): FalTransport {
  if (!liveFalArmed(options.argv, options.env)) return options.stub
  return createLiveTransport(options.env.FAL_KEY ?? '', options.fetchImpl ?? globalThis.fetch, true)
}

export function createLiveTransport(key: string, fetchImpl: typeof fetch, allowLive = false): FalTransport {
  const send = allowLive ? fetchImpl : createNetworkGuard(fetchImpl)
  const headersFor = (carriesPhotograph: boolean) => falHeaders({
    requestTimeoutSeconds: 120,
    carriesPhotograph,
    key,
  })

  return {
    calls: [],
    async submit(input) {
      const response = await send(`${QUEUE_ORIGIN}/${input.endpoint}`, {
        method: 'POST',
        headers: { ...headersFor(false), ...input.headers, 'content-type': 'application/json' },
        body: JSON.stringify(input.body),
      })
      if (response.status === 403) {
        const text = await response.text()
        if (text.includes('Exhausted balance')) throw new OutOfCreditError()
      }
      return await response.json() as { request_id: string }
    },
    async status(input) {
      const response = await send(`${QUEUE_ORIGIN}/requests/${input.requestId}/status`, {
        headers: input.headers,
      })
      return await response.json() as { status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' }
    },
    async result(input) {
      const response = await send(`${QUEUE_ORIGIN}/requests/${input.requestId}`, {
        headers: input.headers,
      })
      const units = response.headers.get('x-fal-billable-units')
      return {
        httpStatus: response.status,
        billableUnits: units,
        body: await response.json() as unknown,
      }
    },
    async cancel(input) {
      const response = await send(`${QUEUE_ORIGIN}/requests/${input.requestId}/cancel`, {
        method: 'PUT',
        headers: input.headers,
      })
      return { httpStatus: response.status, body: await response.json() as unknown }
    },
    async download(input) {
      throw new Error(`live download is not used in this slice (${input.requestId})`)
    },
  }
}
