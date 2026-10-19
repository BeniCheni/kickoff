import { existsSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { and, eq } from 'drizzle-orm'
import { asset } from '../db/schema.ts'
import { sha256 } from '../hash.ts'
import { containedPath } from './contain.ts'
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

function incoming(mediaDir: string, id: string, extension: 'mp4' | 'jpg'): string | null {
  if (!ID.test(id)) return null
  return containedPath(mediaDir, path.join(mediaDir, 'incoming', `${id}.${extension}`))
}

function discardUploads(mediaDir: string, clipId?: string, stillId?: string): void {
  for (const [id, extension] of [[clipId, 'mp4'], [stillId, 'jpg']] as const) {
    if (!id) continue
    const file = incoming(mediaDir, id, extension)
    if (file) rmSync(file, { force: true })
  }
}

export function storeImport(mediaDir: string, kind: 'clip' | 'still', bytes: Uint8Array): { id: string } | { outcome: 'inside-worktree' } {
  const id = randomBytes(16).toString('hex')
  const dir = path.join(mediaDir, 'incoming')
  mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `${id}.${kind === 'clip' ? 'mp4' : 'jpg'}`)
  writeFileSync(file, bytes)
  if (!containedPath(mediaDir, file) || pathInsideWorktree(file)) {
    rmSync(file, { force: true })
    return { outcome: 'inside-worktree' }
  }
  return { id }
}

export async function previewImport(opened: OpenedAdmin, body: unknown) {
  const record = body && typeof body === 'object' ? body as { clipId?: unknown; stillId?: unknown } : {}
  if (typeof record.clipId !== 'string' || typeof record.stillId !== 'string') return { outcome: 'missing' as const }
  const clipPath = incoming(opened.mediaDir, record.clipId, 'mp4')
  const stillPath = incoming(opened.mediaDir, record.stillId, 'jpg')
  if (!clipPath || !stillPath) return { outcome: 'missing' as const }
  if (pathInsideWorktree(clipPath) || pathInsideWorktree(stillPath)) {
    discardUploads(opened.mediaDir, record.clipId, record.stillId)
    return { outcome: 'inside-worktree' as const }
  }
  const video = new Uint8Array(readFileSync(clipPath))
  const keyframe = new Uint8Array(readFileSync(stillPath))
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
  const record = body && typeof body === 'object' ? body as {
    clipId?: unknown
    stillId?: unknown
    prompt?: unknown
    subjects?: unknown
    title?: unknown
    note?: unknown
    madeOn?: unknown
  } : {}
  if (typeof record.clipId !== 'string' || typeof record.stillId !== 'string') return { outcome: 'missing' as const }
  if (typeof record.prompt !== 'string' || typeof record.title !== 'string' || !Array.isArray(record.subjects)) {
    return { outcome: 'refused' as const }
  }
  const subjects = record.subjects.filter((name): name is string => typeof name === 'string')
  const clipPath = incoming(opened.mediaDir, record.clipId, 'mp4')
  const stillPath = incoming(opened.mediaDir, record.stillId, 'jpg')
  if (!clipPath || !stillPath) return { outcome: 'missing' as const }
  if (pathInsideWorktree(clipPath) || pathInsideWorktree(stillPath)) {
    discardUploads(opened.mediaDir, record.clipId, record.stillId)
    return { outcome: 'inside-worktree' as const }
  }
  const result = await opened.studio.importClip({
    video: new Uint8Array(readFileSync(clipPath)),
    keyframe: new Uint8Array(readFileSync(stillPath)),
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
