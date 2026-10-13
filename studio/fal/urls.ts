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
