/** Header names follow fal's `x-fal-*` family named in the architecture review §8.1. */
export const FAL_HEADER = {
  noRetry: 'x-fal-no-retry',
  disableFallback: 'x-fal-disable-fallback',
  requestTimeout: 'x-fal-request-timeout',
  storeIo: 'x-fal-store-io',
  objectLifecycle: 'x-fal-object-lifecycle-preference',
} as const

const PHOTO_LIFETIME_SECONDS = 86_400

export function falHeaders(options: {
  requestTimeoutSeconds: number
  carriesPhotograph: boolean
  key?: string
}): Record<string, string> {
  const headers: Record<string, string> = {
    [FAL_HEADER.noRetry]: '1',
    [FAL_HEADER.disableFallback]: '1',
    [FAL_HEADER.requestTimeout]: String(options.requestTimeoutSeconds),
  }
  if (options.key) headers.authorization = `Key ${options.key}`
  if (options.carriesPhotograph) {
    headers[FAL_HEADER.storeIo] = '0'
    headers[FAL_HEADER.objectLifecycle] = JSON.stringify({
      expiration_duration_seconds: PHOTO_LIFETIME_SECONDS,
    })
  }
  return headers
}
