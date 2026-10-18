import { siteCopyPath, storageAddress, type CatalogListRow, type CatalogDetailRow } from '@kickoff/catalog'
import type { ThumbnailSources } from './types'

/** Resolved on the server: the client receives addresses, not the schema runtime. */
export function thumbnailFor(row: CatalogListRow, origin: string | null): ThumbnailSources {
  return {
    storage: row.thumbnail_bucket && row.thumbnail_object_path && origin
      ? storageAddress(row.thumbnail_bucket, row.thumbnail_object_path, origin) : null,
    site: siteCopyPath(row.id),
  }
}

export function videoFor(row: CatalogDetailRow | null, origin: string | null): string | null {
  return row && origin && row.video_bucket && row.video_object_path
    ? storageAddress(row.video_bucket, row.video_object_path, origin) : null
}
