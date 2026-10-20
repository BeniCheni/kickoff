import type { CatalogDetailRow, CatalogListRow } from '@kickoff/catalog'

export type ThumbnailSources = { storage: string | null; site: string | null }

export type MomentReactionKey = 'heart_eyes_cat' | 'joy_cat' | 'soccer' | 'fire' | 'clap'

/** Plain rows for the client. The demo package, and zod, stay on the server. */
export type MomentComment = {
  id: string
  handle: string
  displayName: string
  emoji: string
  palette: number
  body: string
  postedAt: string
  likes: number
  parentId: string | null
}

export type MomentSocial = {
  views: number
  reactions: Record<MomentReactionKey, number>
  commentCount: number
  comments: MomentComment[]
}

/** What the Moments region may render. A skipped read means this request is not Moments. */
export type MomentsPayload =
  | { state: 'skipped' }
  | { state: 'unavailable'; preview: boolean; watchId: string | null }
  | {
      state: 'ready'
      preview: boolean
      list: CatalogListRow[]
      detail: CatalogDetailRow | null
      watchId: string | null
      thumbnails: Record<string, ThumbnailSources>
      videoAddress: string | null
      videos?: Record<string, string | null>
      social?: Record<string, MomentSocial>
      /** Published ids, in neighbour order. Absent when this request has no watch id. Scores stay on the server. */
      similar?: string[]
    }

export type CatalogSuccess = {
  preview: boolean
  list: CatalogListRow[]
  details: CatalogDetailRow[]
  /** Stub files only. The hosted read resolves one watch id and does not carry this map. */
  similarById?: Readonly<Record<string, readonly string[]>>
}

export type CatalogMode = 'stub' | 'closed'

/** Shared without importing the server's schema or address resolvers. */
export function previewAllowed(preview: boolean, mode: CatalogMode): boolean {
  return !preview || mode === 'stub'
}

export class CatalogReadError extends Error {
  readonly preview: boolean
  /** A fixed class. Never an address, a host, or a query. */
  readonly failure: string
  constructor(message: string, preview: boolean, failure = message) {
    super(message)
    this.name = 'CatalogReadError'
    this.preview = preview
    this.failure = failure
  }
}
