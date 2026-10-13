export type StoredObject = { bucket: string; objectPath: string }

/** Addendum outcomes for the site's thumbnail copy and for its removal. */
export const SITE_COPY_OUTCOMES = ['pr-opened', 'checks-running', 'merged', 'checks-failed'] as const

export type SiteCopyOutcome = (typeof SITE_COPY_OUTCOMES)[number]

export type SiteCopyResult = { outcome: SiteCopyOutcome; destination: string }

export function siteCopyStatus(outcome: SiteCopyOutcome): 'pending' | 'failed' | 'merged' {
  if (outcome === 'merged') return 'merged'
  if (outcome === 'checks-failed') return 'failed'
  return 'pending'
}

export type StoragePort = {
  putVideo(input: { localPath: string; sha256: string; publicId: string; mime: string }): Promise<StoredObject>
  putThumbnail(input: { localPath: string; sha256: string; publicId: string; mime: string }): Promise<StoredObject>
  remove(object: StoredObject): Promise<void>
  deliverFallback(input: { publicId: string; sourceSha256: string }): Promise<SiteCopyResult>
  removeSiteCopy(input: { publicId: string }): Promise<SiteCopyResult>
}

/** Where the site's fallback thumbnail would be copied from: keyframe K0, already on disk. */
export function fallbackDestination(publicId: string): string {
  return `public/moments/thumbnails/${publicId}.jpg`
}
