export type StoredObject = { bucket: string; objectPath: string }

export type StoragePort = {
  putVideo(input: { localPath: string; sha256: string; publicId: string }): Promise<StoredObject>
  putThumbnail(input: { localPath: string; sha256: string; publicId: string }): Promise<StoredObject>
  remove(object: StoredObject): Promise<void>
  deliverFallback(input: { publicId: string; sourceSha256: string }): Promise<{ destination: string }>
}

/** Where the site's fallback thumbnail would be copied from: keyframe K0, already on disk. */
export function fallbackDestination(publicId: string): string {
  return `public/moments/thumbnails/${publicId}.jpg`
}
