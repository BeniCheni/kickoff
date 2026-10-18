import { createHash, createHmac, type BinaryLike } from 'node:crypto'

/** Encode a URI component the way AWS Signature Version 4 requires. Slash stays only when asked. */
export function uriEncode(value: string, encodeSlash = true): string {
  let out = ''
  for (const byte of Buffer.from(value, 'utf8')) {
    const char = String.fromCharCode(byte)
    if (/[A-Za-z0-9._~-]/.test(char) || (!encodeSlash && char === '/')) out += char
    else out += `%${byte.toString(16).toUpperCase().padStart(2, '0')}`
  }
  return out
}

export function sha256Hex(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex')
}

function hmac(key: BinaryLike, data: string): Buffer {
  return createHmac('sha256', key).update(data, 'utf8').digest()
}

export type SignedRequest = {
  authorization: string
  amzDate: string
  canonicalRequest: string
  stringToSign: string
  signature: string
  signedHeaders: string
}

function canonicalQuery(params: URLSearchParams): string {
  const pairs: [string, string][] = []
  for (const [key, value] of params.entries()) {
    pairs.push([uriEncode(key), uriEncode(value)])
  }
  pairs.sort((left, right) => left[0] < right[0] ? -1 : left[0] > right[0] ? 1 : left[1] < right[1] ? -1 : left[1] > right[1] ? 1 : 0)
  return pairs.map(([key, value]) => `${key}=${value}`).join('&')
}

function canonicalPath(pathname: string): string {
  if (pathname === '' || pathname === '/') return '/'
  return pathname.split('/').map((segment, index) => (index === 0 ? '' : uriEncode(decodeURIComponent(segment)))).join('/')
}

function amzTimestamp(now: Date): string {
  return now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

/**
 * Header signing for AWS Signature Version 4.
 * `headers` are the headers to sign, other than `host` and `x-amz-date`, which are added here.
 */
export function signAwsV4(input: {
  method: string
  url: URL
  headers: Record<string, string>
  payloadHash: string
  accessKeyId: string
  secretAccessKey: string
  region: string
  service: string
  now: Date
}): SignedRequest {
  const amzDate = amzTimestamp(input.now)
  const dateStamp = amzDate.slice(0, 8)
  const headers = new Map<string, string>()
  for (const [name, value] of Object.entries(input.headers)) {
    headers.set(name.toLowerCase(), value.trim().replace(/\s+/g, ' '))
  }
  headers.set('host', input.url.host)
  headers.set('x-amz-date', amzDate)
  if (!headers.has('x-amz-content-sha256')) headers.set('x-amz-content-sha256', input.payloadHash)
  const names = [...headers.keys()].sort()
  const canonicalHeaders = names.map((name) => `${name}:${headers.get(name) ?? ''}\n`).join('')
  const signedHeaders = names.join(';')
  const canonicalRequest = [
    input.method.toUpperCase(),
    canonicalPath(input.url.pathname),
    canonicalQuery(input.url.searchParams),
    canonicalHeaders,
    signedHeaders,
    input.payloadHash,
  ].join('\n')
  const scope = `${dateStamp}/${input.region}/${input.service}/aws4_request`
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256Hex(canonicalRequest)].join('\n')
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${input.secretAccessKey}`, dateStamp), input.region), input.service), 'aws4_request')
  const signature = createHmac('sha256', signingKey).update(stringToSign, 'utf8').digest('hex')
  const authorization = `AWS4-HMAC-SHA256 Credential=${input.accessKeyId}/${scope},SignedHeaders=${signedHeaders},Signature=${signature}`
  return { authorization, amzDate, canonicalRequest, stringToSign, signature, signedHeaders }
}
