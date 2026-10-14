/**
 * Spellings read 13 Oct 2026:
 * https://fal.ai/docs/model-apis/model-endpoints/reliability
 * https://fal.ai/docs/documentation/model-apis/common-parameters
 */
export const FAL_HEADER = {
  noRetry: 'X-Fal-No-Retry',
  disableFallback: 'x-app-fal-disable-fallback',
  requestTimeout: 'X-Fal-Request-Start-Timeout',
  storeIo: 'X-Fal-Store-IO',
  objectLifecycle: 'X-Fal-Object-Lifecycle-Preference',
} as const

const PHOTO_LIFETIME_SECONDS = 86_400

export function falHeaders(options: {
  requestTimeoutSeconds: number
  carriesPhotograph: boolean
  key?: string
}): Record<string, string> {
  const headers: Record<string, string> = {
    [FAL_HEADER.noRetry]: '1',
    [FAL_HEADER.disableFallback]: 'true',
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
