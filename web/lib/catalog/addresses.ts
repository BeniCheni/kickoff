import { siteCopyPath, storageAddress, type CatalogListRow, type CatalogDetailRow } from '@kickoff/catalog'
import type { ThumbnailSources } from './types'

/** The stub route, off the real site-copy address. */
export function stubSiteCopyPath(id: string): string | null {
  if (siteCopyPath(id) === null) return null
  return `/moments/stub-site/${id}.jpg`
}

function loopbackHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '[::1]'
}

/**
 * An https origin with no userinfo, path, query, or fragment.
 * Loopback http is the local proof. Anything else that is not https is no address.
 */
export function hostedStorageOrigin(value: string | undefined): string | null {
  if (!value) return null
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return null
  }
  if (url.username || url.password) return null
  if (url.pathname !== '/' && url.pathname !== '') return null
  if (url.search || url.hash) return null
  if (url.protocol === 'https:') return url.origin
  if (url.protocol === 'http:' && loopbackHost(url.hostname)) return url.origin
  return null
}

/** Resolved on the server: the client receives addresses, not the schema runtime. */
export function thumbnailFor(row: CatalogListRow, origin: string | null, preview = false): ThumbnailSources {
  return {
    storage: row.thumbnail_bucket && row.thumbnail_object_path && origin
      ? storageAddress(row.thumbnail_bucket, row.thumbnail_object_path, origin) : null,
    site: preview ? stubSiteCopyPath(row.id) : siteCopyPath(row.id),
  }
}

export function videoFor(row: CatalogDetailRow | null, origin: string | null): string | null {
  return row && origin && row.video_bucket && row.video_object_path
    ? storageAddress(row.video_bucket, row.video_object_path, origin) : null
}
