const MEDIA_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/

/** Mapped file name for one stub address. Never a path. A traversal value is rejected. */
export function mappedMediaName(catalog: unknown, key: string): string | null {
  if (catalog === null || typeof catalog !== 'object' || Array.isArray(catalog)) return null
  const media = (catalog as { media?: unknown }).media
  if (media === null || typeof media !== 'object' || Array.isArray(media)) return null
  const name = (media as Record<string, unknown>)[key]
  if (typeof name !== 'string' || !MEDIA_NAME.test(name)) return null
  return name
}

export function contentTypeFor(name: string): string | null {
  if (name.endsWith('.jpg')) return 'image/jpeg'
  if (name.endsWith('.mp4')) return 'video/mp4'
  return null
}
