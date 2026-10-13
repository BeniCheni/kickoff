import { fallbackDestination, type StoragePort, type StoredObject } from './port.ts'

export type StorageScript = {
  failVideo?: boolean
  failThumbnail?: boolean
  failFallback?: boolean
  failRemove?: boolean
}

export function createStorageStub(script: StorageScript = {}) {
  const calls: string[] = []
  const objects = new Map<string, StoredObject>()

  function put(kind: 'video' | 'thumbnail', publicId: string, sha256: string): StoredObject {
    const object = { bucket: 'moments', objectPath: `${publicId}/${kind}-${sha256.slice(0, 8)}` }
    objects.set(`${kind}:${publicId}`, object)
    return object
  }

  const port: StoragePort = {
    async putVideo(input) {
      calls.push('video')
      if (script.failVideo) throw new Error('video upload failed')
      return put('video', input.publicId, input.sha256)
    },
    async putThumbnail(input) {
      calls.push('thumbnail')
      if (script.failThumbnail) throw new Error('thumbnail upload failed')
      return put('thumbnail', input.publicId, input.sha256)
    },
    async remove(object) {
      calls.push(`remove:${object.objectPath}`)
      if (script.failRemove) throw new Error('remove failed')
    },
    async deliverFallback(input) {
      calls.push('fallback')
      if (script.failFallback) throw new Error('fallback delivery failed')
      return { destination: fallbackDestination(input.publicId) }
    },
  }

  return { port, calls, objects }
}
