import type { CatalogDetailRow, CatalogListRow } from '@kickoff/catalog'

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
      storageOrigin: string | null
    }

export type CatalogMode = 'stub' | 'closed'

export class CatalogReadError extends Error {
  readonly preview: boolean
  constructor(message: string, preview: boolean) {
    super(message)
    this.name = 'CatalogReadError'
    this.preview = preview
  }
}
