import { REQUEST_START_TIMEOUT_SECONDS } from '../caps.ts'
import { falHeaders } from './headers.ts'
import { createNetworkGuard } from './guard.ts'
import type { SubmitEnvelope } from './schemas.ts'
import { OutOfCreditError, type FalTransport } from './stub.ts'
import { assertQueueUrl, QUEUE_ORIGIN } from './urls.ts'

export function liveFalArmed(argv: readonly string[], env: NodeJS.ProcessEnv): boolean {
  return argv.includes('--live') && env.STUDIO_LIVE === '1' && Boolean(env.FAL_KEY)
}

export function missingLivePieces(env: NodeJS.ProcessEnv): string[] {
  const missing: string[] = []
  if (env.STUDIO_LIVE !== '1') missing.push('STUDIO_LIVE')
  if (!env.FAL_KEY) missing.push('FAL_KEY')
  return missing
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
    requestTimeoutSeconds: REQUEST_START_TIMEOUT_SECONDS,
    carriesPhotograph,
    key,
  })

  function authorized(inputHeaders: Record<string, string>, extra: Record<string, string> = {}) {
    return { ...inputHeaders, ...headersFor(false), ...extra }
  }

  return {
    calls: [],
    async submit(input) {
      const response = await send(`${QUEUE_ORIGIN}/${input.endpoint}`, {
        method: 'POST',
        headers: authorized(input.headers, { 'content-type': 'application/json' }),
        body: JSON.stringify(input.body),
      })
      const text = await response.text()
      if (response.status === 403 && text.includes('Exhausted balance')) throw new OutOfCreditError()
      let body: unknown = null
      if (text) {
        try {
          body = JSON.parse(text) as unknown
        } catch {
          body = text
        }
      }
      return { httpStatus: response.status, body } satisfies SubmitEnvelope
    },
    async status(input) {
      const url = assertQueueUrl(input.statusUrl ?? '')
      const response = await send(url, { headers: authorized(input.headers) })
      if (response.status === 504) {
        return {
          httpStatus: 504,
          timeoutType: response.headers.get('X-Fal-Request-Timeout-Type'),
        }
      }
      return await response.json() as { status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' }
    },
    async result(input) {
      const url = assertQueueUrl(input.responseUrl ?? '')
      const response = await send(url, { headers: authorized(input.headers) })
      const units = response.headers.get('x-fal-billable-units')
      return {
        httpStatus: response.status,
        billableUnits: units,
        body: await response.json() as unknown,
      }
    },
    async cancel(input) {
      const url = assertQueueUrl(input.cancelUrl ?? '')
      const response = await send(url, {
        method: 'PUT',
        headers: authorized(input.headers),
      })
      return { httpStatus: response.status, body: await response.json() as unknown }
    },
    async download(input) {
      throw new Error(`live download is not used in this slice (${input.requestId})`)
    },
  }
}
