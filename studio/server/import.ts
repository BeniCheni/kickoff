import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { and, eq } from 'drizzle-orm'
import { asset } from '../db/schema.ts'
import { sha256 } from '../hash.ts'
import type { OpenedAdmin } from './open.ts'
import { isFastStart, readClipFacts, stripClip } from '../media/mp4.ts'
import { preparePhotograph } from '../photos/strip.ts'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '../..')
const ID = /^[a-f0-9]{32}$/

/** True when the real path sits inside the repo. A symlink that lands there counts. */
export function pathInsideWorktree(file: string, root = repoRoot): boolean {
  let full = path.resolve(file)
  let base = path.resolve(root)
  try {
    if (existsSync(file)) full = realpathSync(file)
    if (existsSync(root)) base = realpathSync(root)
  } catch {
    /* a missing path is judged lexically */
  }
  const relative = path.relative(base, full)
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

type UploadExtension = 'mp4' | 'jpg'
type UploadLookup =
  | { kind: 'file'; path: string }
  | { kind: 'folder' }
  | { kind: 'blocked' }
  | { kind: 'missing' }

/** `incoming/` is a real directory whose real path is `realpath(mediaDir)/incoming`. */
function incomingDirectory(mediaDir: string): 'plain' | 'missing' | 'folder' {
  const dir = path.join(mediaDir, 'incoming')
  let info: ReturnType<typeof lstatSync>
  try {
    info = lstatSync(dir)
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? String((error as { code?: string }).code) : ''
    return code === 'ENOENT' ? 'missing' : 'folder'
  }
  if (info.isSymbolicLink() || !info.isDirectory()) return 'folder'
  try {
    if (realpathSync(dir) !== path.join(realpathSync(mediaDir), 'incoming')) return 'folder'
  } catch {
    return 'folder'
  }
  return 'plain'
}

/**
 * The lexical path of one regular upload file. A symlink, directory, or other
 * entry is `blocked` and is not removed. The path is never a realpath.
 */
function plainUpload(mediaDir: string, id: string, extension: UploadExtension): UploadLookup {
  if (!ID.test(id)) return { kind: 'missing' }
  const directory = incomingDirectory(mediaDir)
  if (directory === 'folder') return { kind: 'folder' }
  if (directory === 'missing') return { kind: 'missing' }
  const file = path.join(mediaDir, 'incoming', `${id}.${extension}`)
  let info: ReturnType<typeof lstatSync>
  try {
    info = lstatSync(file)
  } catch {
    return { kind: 'missing' }
  }
  if (info.isSymbolicLink() || !info.isFile()) return { kind: 'blocked' }
  return { kind: 'file', path: file }
}

/** Unlink a regular upload at its lexical path. A link or other entry stays. */
function removePlainUpload(mediaDir: string, id: string | undefined, extension: UploadExtension): void {
  if (!id) return
  const found = plainUpload(mediaDir, id, extension)
  if (found.kind !== 'file') return
  rmSync(found.path)
}

function discardUploads(mediaDir: string, clipId?: string, stillId?: string): void {
  removePlainUpload(mediaDir, clipId, 'mp4')
  removePlainUpload(mediaDir, stillId, 'jpg')
}

/** Delete one unconfirmed upload by its id. A bad id, a path, a link, or a missing file is refused. */
export function discardIncomingUpload(mediaDir: string, body: unknown): { outcome: 'discarded' | 'refused' | 'uploads-folder' } {
  const record = body && typeof body === 'object' ? body as { id?: unknown; kind?: unknown } : {}
  if (record.kind !== 'clip' && record.kind !== 'still') return { outcome: 'refused' }
  if (typeof record.id !== 'string' || !ID.test(record.id)) return { outcome: 'refused' }
  const found = plainUpload(mediaDir, record.id, record.kind === 'clip' ? 'mp4' : 'jpg')
  if (found.kind === 'folder') return { outcome: 'uploads-folder' }
  if (found.kind !== 'file') return { outcome: 'refused' }
  rmSync(found.path)
  return { outcome: 'discarded' }
}

export function storeImport(mediaDir: string, kind: 'clip' | 'still', bytes: Uint8Array): { id: string } | { outcome: 'inside-worktree' | 'uploads-folder' } {
  if (incomingDirectory(mediaDir) === 'folder') return { outcome: 'uploads-folder' }
  if (incomingDirectory(mediaDir) === 'missing') {
    try {
      mkdirSync(path.join(mediaDir, 'incoming'))
    } catch {
      return { outcome: 'uploads-folder' }
    }
  }
  if (incomingDirectory(mediaDir) !== 'plain') return { outcome: 'uploads-folder' }
  const id = randomBytes(16).toString('hex')
  const extension: UploadExtension = kind === 'clip' ? 'mp4' : 'jpg'
  const file = path.join(mediaDir, 'incoming', `${id}.${extension}`)
  writeFileSync(file, bytes)
  const found = plainUpload(mediaDir, id, extension)
  if (found.kind !== 'file') return { outcome: 'uploads-folder' }
  if (pathInsideWorktree(found.path)) {
    rmSync(found.path)
    return { outcome: 'inside-worktree' }
  }
  return { id }
}

export async function previewImport(opened: OpenedAdmin, body: unknown) {
  if (incomingDirectory(opened.mediaDir) === 'folder') return { outcome: 'uploads-folder' as const }
  const record = body && typeof body === 'object' ? body as { clipId?: unknown; stillId?: unknown } : {}
  if (typeof record.clipId !== 'string' || typeof record.stillId !== 'string') return { outcome: 'upload-missing' as const }
  const clip = plainUpload(opened.mediaDir, record.clipId, 'mp4')
  const still = plainUpload(opened.mediaDir, record.stillId, 'jpg')
  if (clip.kind === 'folder' || still.kind === 'folder') return { outcome: 'uploads-folder' as const }
  if (clip.kind === 'blocked' || still.kind === 'blocked') {
    discardUploads(opened.mediaDir, record.clipId, record.stillId)
    return { outcome: 'refused' as const }
  }
  if (clip.kind !== 'file' || still.kind !== 'file') return { outcome: 'upload-missing' as const }
  if (pathInsideWorktree(clip.path) || pathInsideWorktree(still.path)) {
    discardUploads(opened.mediaDir, record.clipId, record.stillId)
    return { outcome: 'inside-worktree' as const }
  }
  const video = new Uint8Array(readFileSync(clip.path))
  const keyframe = new Uint8Array(readFileSync(still.path))
  const stripped = stripClip(video)
  const read = readClipFacts(stripped.bytes)
  if (!read.ok) {
    discardUploads(opened.mediaDir, record.clipId, record.stillId)
    return { outcome: 'clip-refused' as const, reason: read.reason, brand: read.brand }
  }
  try {
    preparePhotograph(keyframe)
  } catch (error) {
    if (error instanceof Error && (error.message === 'not a jpeg' || error.message === 'bad jpeg')) {
      discardUploads(opened.mediaDir, record.clipId, record.stillId)
      return { outcome: 'not-a-jpeg' as const }
    }
    throw error
  }
  const digest = sha256(stripped.bytes)
  const duplicate = await opened.db.select().from(asset).where(and(eq(asset.role, 'video'), eq(asset.sha256, digest)))
  if (duplicate.length > 0) {
    discardUploads(opened.mediaDir, record.clipId, record.stillId)
    return { outcome: 'already-imported' as const, sha256: digest }
  }
  const frameRate = read.facts.frameRate
  return {
    outcome: 'preview' as const,
    width: read.facts.width,
    height: read.facts.height,
    durationS: read.facts.durationS.toFixed(3),
    frameRate: frameRate !== null && Number.isFinite(frameRate) ? Math.round(frameRate * 1000) / 1000 : null,
    audio: read.facts.audio,
    fastStart: isFastStart(stripped.bytes),
    stripped: stripped.stripped,
    needsMadeOn: read.facts.createdAt === null,
  }
}

export async function confirmImport(opened: OpenedAdmin, body: unknown) {
  if (incomingDirectory(opened.mediaDir) === 'folder') return { outcome: 'uploads-folder' as const }
  const record = body && typeof body === 'object' ? body as {
    clipId?: unknown
    stillId?: unknown
    prompt?: unknown
    subjects?: unknown
    title?: unknown
    note?: unknown
    madeOn?: unknown
  } : {}
  if (typeof record.clipId !== 'string' || typeof record.stillId !== 'string') return { outcome: 'upload-missing' as const }
  if (typeof record.prompt !== 'string' || typeof record.title !== 'string' || !Array.isArray(record.subjects)) {
    return { outcome: 'refused' as const }
  }
  const subjects = record.subjects.filter((name): name is string => typeof name === 'string')
  const clip = plainUpload(opened.mediaDir, record.clipId, 'mp4')
  const still = plainUpload(opened.mediaDir, record.stillId, 'jpg')
  if (clip.kind === 'folder' || still.kind === 'folder') return { outcome: 'uploads-folder' as const }
  if (clip.kind === 'blocked' || still.kind === 'blocked') {
    discardUploads(opened.mediaDir, record.clipId, record.stillId)
    return { outcome: 'refused' as const }
  }
  if (clip.kind !== 'file' || still.kind !== 'file') return { outcome: 'upload-missing' as const }
  if (pathInsideWorktree(clip.path) || pathInsideWorktree(still.path)) {
    discardUploads(opened.mediaDir, record.clipId, record.stillId)
    return { outcome: 'inside-worktree' as const }
  }
  const result = await opened.studio.importClip({
    video: new Uint8Array(readFileSync(clip.path)),
    keyframe: new Uint8Array(readFileSync(still.path)),
    source: 'grok-imagine',
    prompt: record.prompt,
    subjects,
    title: record.title,
    note: typeof record.note === 'string' ? record.note : undefined,
    madeOn: typeof record.madeOn === 'string' && record.madeOn.length > 0 ? record.madeOn : undefined,
  })
  discardUploads(opened.mediaDir, record.clipId, record.stillId)
  return result
}
