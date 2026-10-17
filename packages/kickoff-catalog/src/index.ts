import { z } from 'zod'

/**
 * Public labels the catalog views may project. A title is not a subject.
 * The view orders these names; this schema does not.
 */
export const SUBJECT_LABELS = ['Fenway', 'Frankenstein'] as const

export type SubjectLabel = (typeof SUBJECT_LABELS)[number]

const subjectLabelSchema = z.enum(SUBJECT_LABELS)
const subjectsSchema = z.array(subjectLabelSchema)
const instantSchema = z.iso.datetime({ offset: true })
const storedNumericSchema = z.string().regex(/^-?\d+(\.\d+)?$/)

/**
 * `catalog.videos`, in view order, after migration 0002.
 * Nullable fields are present and null when the Studio did not record them.
 * `subjects` is always an array, possibly empty.
 * `duration_s` is the stored numeric text, not a JSON number.
 */
export const catalogListRowSchema = z.strictObject({
  id: z.string(),
  title: z.string(),
  position: z.number().int(),
  published_at: instantSchema,
  thumbnail_bucket: z.string().nullable(),
  thumbnail_object_path: z.string().nullable(),
  mime: z.string(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  duration_s: storedNumericSchema.nullable(),
  generated_at: instantSchema,
  editorial_note: z.string().nullable(),
  subjects: subjectsSchema,
})

/**
 * `catalog.video`, in view order, after migration 0002.
 * The same null rule as the list. `kept_at` and `thumbnail_is_keyframe`
 * are null when the view cannot state them. `thumbnail_mime` is the
 * thumbnail asset's mime, which that table requires.
 */
export const catalogDetailRowSchema = z.strictObject({
  id: z.string(),
  title: z.string(),
  editorial_note: z.string().nullable(),
  position: z.number().int(),
  published_at: instantSchema,
  endpoint: z.string(),
  pinned_on: z.string(),
  prompt: z.string(),
  prompt_expansion: z.string().nullable(),
  seed: z.string().nullable(),
  parent: z.string().nullable(),
  generated_at: instantSchema,
  attestation_summary: z.string(),
  video_bucket: z.string().nullable(),
  video_object_path: z.string().nullable(),
  sha256: z.string(),
  mime: z.string(),
  bytes: z.number().int(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  duration_s: storedNumericSchema.nullable(),
  thumbnail_bucket: z.string().nullable(),
  thumbnail_object_path: z.string().nullable(),
  subjects: subjectsSchema,
  kept_at: instantSchema.nullable(),
  thumbnail_mime: z.string(),
  thumbnail_is_keyframe: z.boolean().nullable(),
})

export type CatalogListRow = z.infer<typeof catalogListRowSchema>
export type CatalogDetailRow = z.infer<typeof catalogDetailRowSchema>

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
] as const satisfies readonly (keyof CatalogListRow)[]

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
] as const satisfies readonly (keyof CatalogDetailRow)[]

const PUBLIC_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/

const HTTP_ORIGIN = /^(https?:\/\/)([^/?#\s@]+)(\/[^?#\s]*)?$/

function httpOrigin(origin: string): string | null {
  if (!HTTP_ORIGIN.test(origin)) return null
  return origin.endsWith('/') ? origin.slice(0, -1) : origin
}

function encodedBucket(bucket: string): string | null {
  if (bucket.length === 0 || bucket === '.' || bucket === '..') return null
  if (bucket.includes('/') || bucket.includes('\\') || bucket.includes('\0')) return null
  return encodeURIComponent(bucket)
}

function encodedObjectKey(objectPath: string): string | null {
  if (objectPath.length === 0 || objectPath.startsWith('/') || objectPath.startsWith('\\')) return null
  if (objectPath.includes('\\') || objectPath.includes('\0') || objectPath.includes('://')) return null
  const encoded: string[] = []
  for (const segment of objectPath.split('/')) {
    if (segment.length === 0 || segment === '.' || segment === '..') return null
    encoded.push(encodeURIComponent(segment))
  }
  return encoded.join('/')
}

/**
 * Public Storage address for one stored object.
 * Returns null when the bucket, the key, or the origin is not usable.
 * Does not read the environment and does not substitute a bucket.
 */
export function storageAddress(bucket: string, objectPath: string, origin: string): string | null {
  const base = httpOrigin(origin)
  const bucketSegment = encodedBucket(bucket)
  const key = encodedObjectKey(objectPath)
  if (base === null || bucketSegment === null || key === null) return null
  return `${base}/${bucketSegment}/${key}`
}

/**
 * Site-copy path for a public id. Null when the id is not a safe token,
 * so the thumbnail chain skips to the cover without building a path.
 */
export function siteCopyPath(id: string): string | null {
  if (!PUBLIC_ID.test(id)) return null
  return `/moments/thumbnails/${id}.jpg`
}
