/** Queue host read 13 Oct 2026 from https://fal.ai/docs/model-apis/model-endpoints/queue */
export const QUEUE_ORIGIN = 'https://queue.fal.run'

export class QueueUrlError extends Error {
  constructor() {
    super('refused a queue URL whose origin is not https://queue.fal.run')
    this.name = 'QueueUrlError'
  }
}

export function isQueueOrigin(url: string): boolean {
  try {
    return new URL(url).origin === QUEUE_ORIGIN
  } catch {
    return false
  }
}

export function assertQueueUrl(url: string): string {
  if (!isQueueOrigin(url)) throw new QueueUrlError()
  return url
}

const REQUEST_ID = /^[A-Za-z0-9_-]+$/

/**
 * The three queue addresses, built the way the submit response lists them.
 * Read 13 Oct 2026 from https://fal.ai/docs/model-apis/model-endpoints/queue :
 * status_url, response_url and cancel_url are
 * `https://queue.fal.run/<endpoint>/requests/<request_id>/{status,response,cancel}`.
 * The page's example endpoint is `fal-ai/flux/schnell`, which includes a subpath.
 * The same page's "Get the Result" curl omits `/response`; recovery uses the
 * submit-response shape, which is what a normal poll stores.
 * `openai/gpt-image-2/edit` and `minimax/h3-max-turbo/image-to-video` are not
 * on that page. Recovery for those two is not verified until a live run.
 */
export function queueAddresses(endpoint: string, requestId: string): { statusUrl: string; responseUrl: string; cancelUrl: string } {
  if (!REQUEST_ID.test(requestId) || endpoint.length === 0 || endpoint.startsWith('/') || endpoint.includes('..') || endpoint.includes('://')) {
    throw new QueueUrlError()
  }
  const base = `${QUEUE_ORIGIN}/${endpoint}/requests/${requestId}`
  return {
    statusUrl: `${base}/status`,
    responseUrl: `${base}/response`,
    cancelUrl: `${base}/cancel`,
  }
}
