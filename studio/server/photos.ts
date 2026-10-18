import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import path from 'node:path'
import { preparePhotograph } from '../photos/strip.ts'

export type StoredPhoto = {
  id: string
  sha256: string
  relativePath: string
}

type IndexFile = { photos: StoredPhoto[] }

function indexPath(mediaDir: string): string {
  return path.join(mediaDir, 'photo-index.json')
}

export function loadPhotos(mediaDir: string): StoredPhoto[] {
  const file = indexPath(mediaDir)
  if (!existsSync(file)) return []
  const parsed = JSON.parse(readFileSync(file, 'utf8')) as Partial<IndexFile>
  if (!Array.isArray(parsed.photos)) return []
  return parsed.photos.filter((photo) => photo && /^[a-f0-9]{32}$/.test(photo.id) && photo.relativePath === `photos/${photo.id}.jpg`)
}

function savePhotos(mediaDir: string, photos: readonly StoredPhoto[]): void {
  writeFileSync(indexPath(mediaDir), JSON.stringify({ photos }))
}

export function photoPath(mediaDir: string, photo: StoredPhoto): string | null {
  const full = path.resolve(mediaDir, photo.relativePath)
  const relative = path.relative(mediaDir, full)
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null
  if (!existsSync(full)) return null
  return full
}

export function findPhoto(mediaDir: string, id: string): StoredPhoto | null {
  if (!/^[a-f0-9]{32}$/.test(id)) return null
  return loadPhotos(mediaDir).find((photo) => photo.id === id) ?? null
}

export function storePhoto(mediaDir: string, bytes: Uint8Array): StoredPhoto | { outcome: 'not-a-jpeg' } {
  let prepared: { bytes: Uint8Array; sha256: string }
  try {
    prepared = preparePhotograph(bytes)
  } catch (error) {
    if (error instanceof Error && error.message === 'not a jpeg') return { outcome: 'not-a-jpeg' }
    throw error
  }
  const id = randomBytes(16).toString('hex')
  const relativePath = `photos/${id}.jpg`
  mkdirSync(path.join(mediaDir, 'photos'), { recursive: true })
  writeFileSync(path.join(mediaDir, relativePath), prepared.bytes)
  const photo = { id, sha256: prepared.sha256, relativePath }
  savePhotos(mediaDir, [...loadPhotos(mediaDir), photo])
  return photo
}

export function photoBytes(mediaDir: string, id: string): Uint8Array | null {
  const photo = findPhoto(mediaDir, id)
  if (!photo) return null
  const full = photoPath(mediaDir, photo)
  if (!full) return null
  return new Uint8Array(readFileSync(full))
}
