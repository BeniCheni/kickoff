import type { CatalogDetailRow, CatalogListRow } from '@kickoff/catalog'

export type ThumbnailSources = { storage: string | null; site: string | null }

/** What the Moments region may render. A skipped read means this request is not Moments. */
export type MomentsPayload =
  | { state: 'skipped' }
  | { state: 'unavailable'; preview: boolean; watchId: string | null }
  | {
      state: 'ready'
      preview: true
      list: CatalogListRow[]
      detail: CatalogDetailRow | null
      watchId: string | null
      thumbnails: Record<string, ThumbnailSources>
      videoAddress: string | null
    }

export type CatalogMode = 'stub' | 'closed'

/** Shared without importing the server's schema or address resolvers. */
export function previewAllowed(preview: boolean, mode: CatalogMode): boolean {
  return !preview || mode === 'stub'
}

export class CatalogReadError extends Error {
  readonly preview: boolean
  constructor(message: string, preview: boolean) {
    super(message)
    this.name = 'CatalogReadError'
    this.preview = preview
  }
}
