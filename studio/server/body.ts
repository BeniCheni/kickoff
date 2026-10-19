import type { IncomingMessage } from 'node:http'

const JSON_LIMIT = 1_000_000
export const PHOTO_LIMIT = 20_000_000
/** A 1080p clip posted to the local admin. Larger bodies are refused. */
export const CLIP_LIMIT = 100_000_000

export class BodyError extends Error {
  constructor(readonly status: 400 | 413 | 415) {
    super('refused')
  }
}

async function readChunks(request: IncomingMessage, limit: number): Promise<Buffer> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > limit) throw new BodyError(413)
    chunks.push(buffer)
  }
  return Buffer.concat(chunks)
}

export async function readJson(request: IncomingMessage): Promise<unknown> {
  const type = request.headers['content-type']
  const header = Array.isArray(type) ? type[0] : type
  if (!header || !header.toLowerCase().startsWith('application/json')) throw new BodyError(415)
  const body = await readChunks(request, JSON_LIMIT)
  if (body.length === 0) return {}
  try {
    return JSON.parse(body.toString('utf8')) as unknown
  } catch {
    throw new BodyError(400)
  }
}

export async function readBytes(request: IncomingMessage, limit = PHOTO_LIMIT): Promise<Buffer> {
  return readChunks(request, limit)
}
