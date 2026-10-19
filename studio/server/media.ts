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
  const match = range ? /^bytes=(\d*)-(\d*)$/.exec(range) : null
  const suffixOnly = Boolean(match && match[1] === '' && match[2] !== '')
  const openRange = !range || (match?.[1] === '' && match[2] === '')
  if (openRange) {
    response.writeHead(200, { ...common, 'content-length': size })
    if (request.method === 'HEAD') {
      response.end()
      return
    }
    createReadStream(file).pipe(response)
    return
  }
  if (!match) {
    response.writeHead(416, { 'content-range': `bytes */${size}` })
    response.end()
    return
  }
  const suffix = suffixOnly ? Number(match[2]) : 0
  const start = suffixOnly ? Math.max(0, size - suffix) : Number(match[1])
  const end = suffixOnly ? size - 1 : (match[2] ? Number(match[2]) : size - 1)
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= size || (suffixOnly && suffix <= 0)) {
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
