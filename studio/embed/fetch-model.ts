import { createHash } from 'node:crypto'
import { createReadStream, existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CLIP_DTYPE, CLIP_MODEL, CLIP_REVISION } from './model.ts'

export type ManifestFile = {
  path: string
  bytes: number
  sha256: string
}

export type ModelManifest = {
  model: string
  revision: string
  dtype: typeof CLIP_DTYPE
  files: ManifestFile[]
}

const here = path.dirname(fileURLToPath(import.meta.url))

export function readManifest(): ModelManifest {
  return JSON.parse(readFileSync(path.join(here, 'manifest.json'), 'utf8')) as ModelManifest
}

export function resolveModelDir(env: NodeJS.ProcessEnv, repoRoot: string): string {
  const raw = env.STUDIO_MODEL_DIR
  if (!raw?.trim()) {
    throw new Error('STUDIO_MODEL_DIR is not set. Point it at a directory outside the worktree.')
  }
  const resolved = path.resolve(raw)
  const relative = path.relative(repoRoot, resolved)
  const inside = relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
  if (inside) throw new Error('model directory must sit outside the worktree')
  return resolved
}

export function modelFileUrl(model: string, revision: string, file: string): string {
  return `https://huggingface.co/${model}/resolve/${revision}/${file}`
}

export function hashFile(file: string): Promise<{ sha256: string; bytes: number }> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    let bytes = 0
    const stream = createReadStream(file)
    stream.on('data', (chunk) => {
      const buffer = typeof chunk === 'string' ? Buffer.from(chunk) : chunk
      bytes += buffer.length
      hash.update(buffer)
    })
    stream.on('error', reject)
    stream.on('end', () => resolve({ sha256: hash.digest('hex'), bytes }))
  })
}

async function matches(file: string, entry: ManifestFile): Promise<boolean> {
  const found = await hashFile(file)
  return found.bytes === entry.bytes && found.sha256 === entry.sha256
}

/**
 * Checks each listed file, then downloads only the ones that are missing.
 * A file that is already there and does not match is left in place, and nothing is downloaded.
 * A download that does not match is left as `<path>.partial` and is not moved into place.
 */
export async function fetchModelFiles(input: {
  directory: string
  manifest?: ModelManifest
  fetchFile?: (entry: ManifestFile) => Promise<Uint8Array>
}): Promise<{ downloaded: number; skipped: number }> {
  const manifest = input.manifest ?? readManifest()
  if (manifest.model !== CLIP_MODEL || manifest.revision !== CLIP_REVISION || manifest.dtype !== CLIP_DTYPE) {
    throw new Error('manifest does not match the pinned CLIP model')
  }
  const missing: ManifestFile[] = []
  let skipped = 0
  for (const entry of manifest.files) {
    if (entry.path.includes('..') || path.isAbsolute(entry.path)) {
      throw new Error(`manifest path is not relative: ${entry.path}`)
    }
    const destination = path.join(input.directory, entry.path)
    if (!existsSync(destination)) {
      missing.push(entry)
      continue
    }
    if (!(await matches(destination, entry))) {
      throw new Error(`manifest mismatch ${entry.path}`)
    }
    skipped += 1
  }
  const fetchFile = input.fetchFile ?? (async (entry: ManifestFile) => {
    const response = await fetch(modelFileUrl(manifest.model, manifest.revision, entry.path))
    if (!response.ok) throw new Error(`could not download ${entry.path}`)
    return new Uint8Array(await response.arrayBuffer())
  })
  for (const entry of missing) {
    const destination = path.join(input.directory, entry.path)
    const partial = `${destination}.partial`
    mkdirSync(path.dirname(destination), { recursive: true })
    const bytes = await fetchFile(entry)
    writeFileSync(partial, bytes)
    if (!(await matches(partial, entry))) {
      throw new Error(`manifest mismatch ${entry.path}`)
    }
    renameSync(partial, destination)
    if (statSync(destination).size !== entry.bytes) throw new Error(`manifest mismatch ${entry.path}`)
  }
  return { downloaded: missing.length, skipped }
}
