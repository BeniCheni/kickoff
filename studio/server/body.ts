import type { IncomingMessage } from 'node:http'

const JSON_LIMIT = 1_000_000
const PHOTO_LIMIT = 20_000_000

async function readChunks(request: IncomingMessage, limit: number): Promise<Buffer> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > limit) throw new Error('refused')
    chunks.push(buffer)
  }
  return Buffer.concat(chunks)
}

export async function readJson(request: IncomingMessage): Promise<unknown> {
  const body = await readChunks(request, JSON_LIMIT)
  if (body.length === 0) return {}
  try {
    return JSON.parse(body.toString('utf8')) as unknown
  } catch {
    throw new Error('refused')
  }
}

export async function readBytes(request: IncomingMessage, limit = PHOTO_LIMIT): Promise<Buffer> {
  return readChunks(request, limit)
}
