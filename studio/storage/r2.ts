import { readFileSync } from 'node:fs'
import { createStorageStub } from './stub.ts'
import { sha256Hex, signAwsV4, uriEncode } from './sigv4.ts'
import type { StoragePort, StoredObject } from './port.ts'

/** Catalog bucket. The public address is origin/moments/<object path>. */
export const CATALOG_BUCKET = 'moments'

/**
 * Read from the env file named by STUDIO_ENV_FILE. Never printed.
 * STUDIO_STORAGE_ORIGIN is the public web address the Next app will use at N6.
 * Upload does not need it.
 */
export const R2_VARIABLES = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET'] as const

const EMPTY_PAYLOAD = sha256Hex('')

export function missingR2(env: NodeJS.ProcessEnv): string[] {
  return R2_VARIABLES.filter((name) => {
    const value = env[name]
    return typeof value !== 'string' || value.trim() === ''
  })
}

function failSet(env: NodeJS.ProcessEnv): Set<string> {
  return new Set((env.STUDIO_STORAGE_FAIL ?? '').split(',').map((item) => item.trim()).filter(Boolean))
}

function objectFor(kind: 'video' | 'thumbnail', publicId: string, digest: string): StoredObject {
  const extension = kind === 'video' ? 'mp4' : 'jpg'
  return { bucket: CATALOG_BUCKET, objectPath: `${publicId}/${kind}-${digest.slice(0, 8)}.${extension}` }
}

/**
 * Path-style address. The object key starts with `moments/` so a custom domain
 * on the bucket serves storageAddress(moments, objectPath, origin).
 */
export function r2ObjectUrl(accountId: string, bucket: string, key: string): URL {
  const pathName = [bucket, ...key.split('/')].map((segment) => uriEncode(segment)).join('/')
  return new URL(`https://${accountId}.r2.cloudflarestorage.com/${pathName}`)
}

export function createR2Storage(options: {
  env: NodeJS.ProcessEnv
  fetchImpl?: typeof fetch
  now?: () => Date
}): StoragePort {
  const accountId = options.env.R2_ACCOUNT_ID ?? ''
  const accessKeyId = options.env.R2_ACCESS_KEY_ID ?? ''
  const secretAccessKey = options.env.R2_SECRET_ACCESS_KEY ?? ''
  const bucket = options.env.R2_BUCKET ?? ''
  const fetchImpl = options.fetchImpl ?? fetch
  const now = options.now ?? (() => new Date())
  const fail = failSet(options.env)
  const site = createStorageStub({
    failFallback: fail.has('fallback'),
    failRemoval: fail.has('removal'),
  })

  async function put(kind: 'video' | 'thumbnail', input: {
    localPath: string
    sha256: string
    publicId: string
    mime: string
  }): Promise<StoredObject> {
    if (fail.has(kind)) throw new Error(`${kind} upload failed`)
    const object = objectFor(kind, input.publicId, input.sha256)
    let body: Buffer
    try {
      body = readFileSync(input.localPath)
    } catch {
      throw new Error(`${kind} upload failed`)
    }
    const payloadHash = sha256Hex(body)
    const url = r2ObjectUrl(accountId, bucket, `${object.bucket}/${object.objectPath}`)
    const headers = {
      'content-type': input.mime,
      'content-length': String(body.byteLength),
      'x-amz-content-sha256': payloadHash,
    }
    const signed = signAwsV4({
      method: 'PUT',
      url,
      headers,
      payloadHash,
      accessKeyId,
      secretAccessKey,
      region: 'auto',
      service: 's3',
      now: now(),
    })
    let response: Response
    try {
      response = await fetchImpl(url, {
        method: 'PUT',
        redirect: 'manual',
        headers: {
          ...headers,
          'x-amz-date': signed.amzDate,
          authorization: signed.authorization,
        },
        body,
      })
    } catch {
      throw new Error(`${kind} upload failed`)
    }
    if (!response.ok) {
      await response.arrayBuffer().catch(() => undefined)
      throw new Error(`${kind} upload failed (${response.status})`)
    }
    return object
  }

  return {
    putVideo: (input) => put('video', input),
    putThumbnail: (input) => put('thumbnail', input),
    async remove(object) {
      const video = object.objectPath.includes('/video-')
      const label = video ? 'video' : 'thumbnail'
      if (fail.has('remove') || (video && fail.has('video-remove')) || (!video && fail.has('thumbnail-remove'))) {
        throw new Error(`${label} remove failed`)
      }
      const url = r2ObjectUrl(accountId, bucket, `${object.bucket}/${object.objectPath}`)
      const signed = signAwsV4({
        method: 'DELETE',
        url,
        headers: { 'x-amz-content-sha256': EMPTY_PAYLOAD },
        payloadHash: EMPTY_PAYLOAD,
        accessKeyId,
        secretAccessKey,
        region: 'auto',
        service: 's3',
        now: now(),
      })
      let response: Response
      try {
        response = await fetchImpl(url, {
          method: 'DELETE',
          redirect: 'manual',
          headers: {
            'x-amz-content-sha256': EMPTY_PAYLOAD,
            'x-amz-date': signed.amzDate,
            authorization: signed.authorization,
          },
        })
      } catch {
        throw new Error(`${label} remove failed`)
      }
      // AWS DeleteObject documents success when the key is already absent (HTTP 204).
      // 204 and 404 are both treated as removed. That was not verified against a live bucket.
      if (response.status === 200 || response.status === 204 || response.status === 404) {
        await response.arrayBuffer().catch(() => undefined)
        return
      }
      await response.arrayBuffer().catch(() => undefined)
      throw new Error(`${label} remove failed (${response.status})`)
    },
    deliverFallback: site.port.deliverFallback,
    removeSiteCopy: site.port.removeSiteCopy,
  }
}
