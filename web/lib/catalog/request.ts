import type { DemoSocial } from '@kickoff/demo'
import { socialByVideo } from '../demo/join'
import { CatalogReadError, type MomentsPayload } from './types'
import type { CatalogSuccess } from './read'
import { thumbnailFor, videoFor } from './addresses'
export { previewAllowed } from './types'

export function tabIsMoments(search: string): boolean {
  const query = search.startsWith('?') ? search.slice(1) : search
  return new URLSearchParams(query).get('tab') === 'moments'
}

export function watchIdFrom(search: string): string | null {
  const query = search.startsWith('?') ? search.slice(1) : search
  return new URLSearchParams(query).get('watch')
}

/** Ids that are published on this list, in the given order. Scores are not accepted. */
export function similarForPayload(
  watchId: string | null,
  list: readonly { id: string }[],
  similar: readonly string[] | undefined,
): string[] | undefined {
  if (watchId === null || !similar) return undefined
  const allowed = new Set(list.map(row => row.id))
  const ids: string[] = []
  const seen = new Set<string>()
  for (const id of similar) {
    if (typeof id !== 'string' || id === watchId || !allowed.has(id) || seen.has(id)) continue
    seen.add(id)
    ids.push(id)
  }
  return ids.length > 0 ? ids : undefined
}

/** Fixtures and Table never call `load`. Moments calls it once per request. */
export function momentsFor(
  search: string,
  load: () => CatalogSuccess,
  storageOrigin: string | null,
  demo: DemoSocial | null = null,
  similar?: readonly string[],
): MomentsPayload {
  if (!tabIsMoments(search)) return { state: 'skipped' }
  try {
    const read = load()
    const watchId = watchIdFrom(search)
    const detail = watchId === null ? null : read.details.find(row => row.id === watchId) ?? null
    const neighbours = similarForPayload(watchId, read.list, similar)
    return {
      state: 'ready',
      preview: read.preview,
      list: read.list,
      detail,
      watchId,
      thumbnails: Object.fromEntries(read.list.map(row => [row.id, thumbnailFor(row, storageOrigin, read.preview)])),
      videoAddress: videoFor(detail, storageOrigin),
      videos: Object.fromEntries(read.details.map(row => [row.id, videoFor(row, storageOrigin)])),
      ...(demo ? { social: socialByVideo(demo, read.list.map(row => row.id)) } : {}),
      ...(neighbours ? { similar: neighbours } : {}),
    }
  } catch (error) {
    const watchId = watchIdFrom(search)
    const preview = error instanceof CatalogReadError ? error.preview : false
    return { state: 'unavailable', preview, watchId }
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
  // Local-only convenience. Forwarded headers cannot redirect media requests.
  // Remote previews must supply an explicit origin, including /stub-storage.
  const host = header.get('host')
  if (!host || !/^(?:127\.0\.0\.1|localhost|\[::1\])(?::\d{1,5})?$/.test(host)) return null
  return `http://${host}/stub-storage`
}
