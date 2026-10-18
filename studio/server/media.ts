import { createReadStream, statSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'

export function serveFile(
  request: IncomingMessage,
  response: ServerResponse,
  file: string,
  type: string,
): void {
  const size = statSync(file).size
  const range = request.headers.range
  const common = {
    'content-type': type,
    'accept-ranges': 'bytes',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  }
  if (!range) {
    response.writeHead(200, { ...common, 'content-length': size })
    if (request.method === 'HEAD') {
      response.end()
      return
    }
    createReadStream(file).pipe(response)
    return
  }
  const match = /^bytes=(\d*)-(\d*)$/.exec(range)
  if (!match) {
    response.writeHead(416, { 'content-range': `bytes */${size}` })
    response.end()
    return
  }
  const start = match[1] ? Number(match[1]) : 0
  const end = match[2] ? Number(match[2]) : size - 1
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= size) {
    response.writeHead(416, { 'content-range': `bytes */${size}` })
    response.end()
    return
  }
  const last = Math.min(end, size - 1)
  response.writeHead(206, {
    ...common,
    'content-length': last - start + 1,
    'content-range': `bytes ${start}-${last}/${size}`,
  })
  if (request.method === 'HEAD') {
    response.end()
    return
  }
  createReadStream(file, { start, end: last }).pipe(response)
}
