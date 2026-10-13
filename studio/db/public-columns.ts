/**
 * Columns the public app is allowed to see. The read-only views in `catalog`
 * must match these lists. `id` is the public slug. `position` is authored order.
 * The Next.js app reads `catalog.videos` ordered by `position`.
 */

export const publishedListColumns = [
  'id',
  'title',
  'position',
  'published_at',
  'thumbnail_bucket',
  'thumbnail_object_path',
  'mime',
  'width',
  'height',
  'duration_s',
] as const

export const publishedDetailColumns = [
  'id',
  'title',
  'editorial_note',
  'position',
  'published_at',
  'endpoint',
  'pinned_on',
  'prompt',
  'prompt_expansion',
  'seed',
  'parent',
  'generated_at',
  'attestation_summary',
  'video_bucket',
  'video_object_path',
  'sha256',
  'mime',
  'bytes',
  'width',
  'height',
  'duration_s',
  'thumbnail_bucket',
  'thumbnail_object_path',
] as const
