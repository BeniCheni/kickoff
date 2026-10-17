import { CatalogReadError, type MomentsPayload } from './types'
import type { CatalogSuccess } from './read'

export function tabIsMoments(search: string): boolean {
  const query = search.startsWith('?') ? search.slice(1) : search
  return new URLSearchParams(query).get('tab') === 'moments'
}

export function watchIdFrom(search: string): string | null {
  const query = search.startsWith('?') ? search.slice(1) : search
  return new URLSearchParams(query).get('watch')
}

/** Fixtures and Table never call `load`. Moments calls it once per request. */
export function momentsFor(
  search: string,
  load: () => CatalogSuccess,
  storageOrigin: string | null,
): MomentsPayload {
  if (!tabIsMoments(search)) return { state: 'skipped' }
  try {
    const read = load()
    const watchId = watchIdFrom(search)
    const detail = watchId === null ? null : read.details.find(row => row.id === watchId) ?? null
    return {
      state: 'ready',
      preview: true,
      list: read.list,
      detail,
      watchId,
      storageOrigin,
    }
  } catch (error) {
    const preview = error instanceof CatalogReadError ? error.preview : false
    return { state: 'unavailable', preview }
  }
}

export function storageOriginFrom(
  header: { get(name: string): string | null },
  env: { KICKOFF_CATALOG?: string; VERCEL_ENV?: string; KICKOFF_STUB_STORAGE_ORIGIN?: string },
): string | null {
  if (env.KICKOFF_CATALOG !== 'stub' || env.VERCEL_ENV === 'production') return null
  const configured = env.KICKOFF_STUB_STORAGE_ORIGIN
  if (configured) {
    if (!/^https?:\/\/[^/?#\s@]+(\/[^?#\s]*)?$/.test(configured)) return null
    return configured.endsWith('/') ? configured.slice(0, -1) : configured
  }
  const host = header.get('x-forwarded-host') ?? header.get('host')
  if (!host || /[\s/]/.test(host)) return null
  const proto = header.get('x-forwarded-proto') ?? 'http'
  if (proto !== 'http' && proto !== 'https') return null
  return `${proto}://${host}/stub-storage`
}

/** A preview payload is shown only while the process is actually in stub mode. */
export function previewAllowed(preview: boolean, mode: 'stub' | 'closed'): boolean {
  if (preview && mode !== 'stub') return false
  return true
}
