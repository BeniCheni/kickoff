/**
 * Columns the public app is allowed to see. The read-only views
 * `catalog.videos` (list) and `catalog.video` (detail) must match these lists.
 * `id` is the public slug. `position` is authored order. The app reads
 * `catalog.videos` ordered by `position`. The views do not apply that order.
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
  'generated_at',
  'editorial_note',
  'subjects',
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
  'subjects',
  'kept_at',
  'thumbnail_mime',
  'thumbnail_is_keyframe',
] as const
