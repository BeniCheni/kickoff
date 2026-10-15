import { createHash } from 'node:crypto'

/** Committed snapshot files, in this order. */
export const SNAPSHOT_FILES = ['fixtures.json', 'meta.json', 'standings.json'] as const

/**
 * SHA-256 over the committed bytes. Each file is framed as
 * `name + "\n" + byteLength + "\n" + bytes + "\n"` so a boundary cannot slide.
 */
export function snapshotDigest(files: readonly { name: string; bytes: Uint8Array }[]): string {
  const hash = createHash('sha256')
  for (const file of files) {
    hash.update(file.name)
    hash.update('\n')
    hash.update(String(file.bytes.length))
    hash.update('\n')
    hash.update(file.bytes)
    hash.update('\n')
  }
  return hash.digest('hex')
}
