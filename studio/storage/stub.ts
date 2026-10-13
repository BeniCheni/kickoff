import { fallbackDestination, type SiteCopyOutcome, type StoragePort, type StoredObject } from './port.ts'

export type StorageScript = {
  failVideo?: boolean
  failThumbnail?: boolean
  failFallback?: boolean
  failRemoval?: boolean
  failRemove?: boolean
  failRemoveVideo?: boolean
  failRemoveThumbnail?: boolean
  fallback?: SiteCopyOutcome
  removal?: SiteCopyOutcome
}

export type StoragePut = { kind: 'video' | 'thumbnail'; mime: string; object: StoredObject }

export function createStorageStub(script: StorageScript = {}) {
  const calls: string[] = []
  const objects = new Map<string, StoredObject>()
  const puts: StoragePut[] = []

  function put(kind: 'video' | 'thumbnail', publicId: string, sha256: string, mime: string): StoredObject {
    const extension = kind === 'video' ? 'mp4' : 'jpg'
    const object = { bucket: 'moments', objectPath: `${publicId}/${kind}-${sha256.slice(0, 8)}.${extension}` }
    objects.set(object.objectPath, object)
    puts.push({ kind, mime, object })
    return object
  }

  function copyOutcome(kind: 'fallback' | 'removal'): SiteCopyOutcome {
    if (kind === 'fallback') {
      if (script.failFallback) return 'checks-failed'
      return script.fallback ?? 'merged'
    }
    if (script.failRemoval) return 'checks-failed'
    return script.removal ?? 'merged'
  }

  const port: StoragePort = {
    async putVideo(input) {
      calls.push('video')
      if (script.failVideo) throw new Error('video upload failed')
      return put('video', input.publicId, input.sha256, input.mime)
    },
    async putThumbnail(input) {
      calls.push('thumbnail')
      if (script.failThumbnail) throw new Error('thumbnail upload failed')
      return put('thumbnail', input.publicId, input.sha256, input.mime)
    },
    async remove(object) {
      calls.push(`remove:${object.objectPath}`)
      if (!objects.has(object.objectPath)) return
      const video = object.objectPath.includes('/video-')
      if (video && (script.failRemove || script.failRemoveVideo)) throw new Error('video remove failed')
      if (!video && (script.failRemove || script.failRemoveThumbnail)) throw new Error('thumbnail remove failed')
      objects.delete(object.objectPath)
    },
    async deliverFallback(input) {
      calls.push('fallback')
      return { outcome: copyOutcome('fallback'), destination: fallbackDestination(input.publicId) }
    },
    async removeSiteCopy(input) {
      calls.push('removal')
      return { outcome: copyOutcome('removal'), destination: fallbackDestination(input.publicId) }
    },
  }

  return { port, calls, objects, puts }
}
