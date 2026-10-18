import path from 'node:path'
import { contentTypeFor, mappedMediaName } from './media'

export type StubEnv = {
  catalog: string | undefined
  vercelEnv: string | undefined
  stubFile: string | undefined
}

/** Reads a mapped media file only in stub mode. Returns null, which the route turns into 404. */
export function openMapped(
  env: StubEnv,
  key: string,
  readText: (file: string) => string,
  readBytes: (file: string) => Buffer,
): { bytes: Buffer; type: string } | null {
  if (env.catalog !== 'stub' || env.vercelEnv === 'production' || !env.stubFile) return null
  let catalog: unknown
  try {
    catalog = JSON.parse(readText(env.stubFile))
  } catch {
    return null
  }
  const name = mappedMediaName(catalog, key)
  const type = name ? contentTypeFor(name) : null
  if (!name || !type) return null
  const mediaDir = path.resolve(path.dirname(env.stubFile), 'media')
  const full = path.resolve(mediaDir, name)
  if (full !== path.join(mediaDir, name)) return null
  try {
    return { bytes: readBytes(full), type }
  } catch {
    return null
  }
}

export function bytesResponse(bytes: Buffer, type: string, rangeHeader: string | null): Response {
  const body = new Uint8Array(bytes)
  const total = body.byteLength
  const headers = {
    'content-type': type,
    'accept-ranges': 'bytes',
    'cache-control': 'no-store',
  }
  if (!rangeHeader) {
    return new Response(body, { status: 200, headers: { ...headers, 'content-length': String(total) } })
  }
  const match = /^bytes=(\d+)-(\d*)$/.exec(rangeHeader)
  if (!match) return new Response(null, { status: 416, headers })
  const start = Number(match[1])
  const end = match[2] === '' ? total - 1 : Number(match[2])
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || start > end || start >= total) {
    return new Response(null, { status: 416, headers })
  }
  const last = Math.min(end, total - 1)
  const slice = body.subarray(start, last + 1)
  return new Response(slice, {
    status: 206,
    headers: {
      ...headers,
      'content-length': String(slice.byteLength),
      'content-range': `bytes ${start}-${last}/${total}`,
    },
  })
}
