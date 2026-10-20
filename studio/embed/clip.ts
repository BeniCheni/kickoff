import { existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { CLIP_DTYPE, CLIP_MODEL, CLIP_REVISION, EmbedError, type Embedder } from './model.ts'
import { hashFile, readManifest, type ModelManifest } from './fetch-model.ts'
import { unitVector } from './vector.ts'

type LoadedClip = {
  keyframe: (localPath: string) => Promise<number[]>
  text: (value: string) => Promise<number[]>
}

/** Milliseconds spent hashing a directory the first time this process verified it. */
const verifiedMs = new Map<string, number>()

export function modelVerifyMs(modelDir: string): number | undefined {
  return verifiedMs.get(path.resolve(modelDir))
}

function present(modelDir: string, manifest: ModelManifest): void {
  for (const entry of manifest.files) {
    const file = path.join(modelDir, entry.path)
    if (!existsSync(file) || statSync(file).size !== entry.bytes) {
      throw new EmbedError('model-absent', 'the CLIP model files are not in STUDIO_MODEL_DIR')
    }
  }
}

/** Hashes the manifest once per directory for this process. A same-size mismatch is model-corrupt. */
export async function verifyModelDir(modelDir: string, manifest?: ModelManifest): Promise<number> {
  const listed = manifest ?? readManifest()
  const resolved = path.resolve(modelDir)
  const key = manifest
    ? `${resolved}\0${listed.files.map((entry) => `${entry.path}:${entry.bytes}:${entry.sha256}`).join('|')}`
    : resolved
  const cached = verifiedMs.get(key)
  if (cached !== undefined) return cached
  const started = performance.now()
  for (const entry of listed.files) {
    const file = path.join(resolved, entry.path)
    let found: { sha256: string; bytes: number }
    try {
      found = await hashFile(file)
    } catch {
      throw new EmbedError('model-absent', 'the CLIP model files are not in STUDIO_MODEL_DIR')
    }
    if (found.bytes !== entry.bytes) {
      throw new EmbedError('model-absent', 'the CLIP model files are not in STUDIO_MODEL_DIR')
    }
    if (found.sha256 !== entry.sha256) {
      throw new EmbedError('model-corrupt', 'a CLIP model file does not match its manifest hash')
    }
  }
  const elapsed = performance.now() - started
  verifiedMs.set(key, elapsed)
  return elapsed
}

/**
 * The real CLIP adapter. It reads only the files fetch-model checked.
 * Remote model loads stay off. Tests use the fake and never call this.
 */
export function createClipEmbedder(modelDir: string): Embedder {
  let loading: Promise<LoadedClip> | undefined
  const load = () => {
    let manifest
    try {
      manifest = readManifest()
    } catch {
      throw new EmbedError('model-absent', 'the CLIP manifest is missing')
    }
    present(modelDir, manifest)
    if (!loading) {
      loading = (async () => {
        await verifyModelDir(modelDir)
        return loadClip(modelDir)
      })().catch((error: unknown) => {
        loading = undefined
        if (error instanceof EmbedError) throw error
        throw new EmbedError('embed-failed', 'could not load the CLIP model')
      })
    }
    return loading
  }
  return {
    identity: { model: CLIP_MODEL, revision: CLIP_REVISION, dtype: CLIP_DTYPE },
    async keyframe(localPath: string) {
      const clip = await load()
      return clip.keyframe(localPath)
    },
    async text(value: string) {
      const clip = await load()
      return clip.text(value)
    },
  }
}

async function loadClip(modelDir: string): Promise<LoadedClip> {
  const transformers = await import('@huggingface/transformers')
  transformers.env.allowRemoteModels = false
  transformers.env.allowLocalModels = true
  const options = { local_files_only: true, dtype: 'fp32' as const, device: 'cpu' as const }
  const local = { local_files_only: true }
  const [vision, textModel, processor, tokenizer] = await Promise.all([
    transformers.CLIPVisionModelWithProjection.from_pretrained(modelDir, options),
    transformers.CLIPTextModelWithProjection.from_pretrained(modelDir, options),
    transformers.AutoProcessor.from_pretrained(modelDir, local),
    transformers.AutoTokenizer.from_pretrained(modelDir, local),
  ])
  return {
    async keyframe(localPath: string) {
      let image
      try {
        image = await transformers.RawImage.read(localPath)
      } catch {
        throw new EmbedError('read-failed', 'could not read the keyframe')
      }
      try {
        const pixels = await processor(image)
        const output = await vision(pixels)
        return unitVector(output.image_embeds.data)
      } catch (error) {
        if (error instanceof EmbedError) throw error
        throw new EmbedError('embed-failed', 'could not embed the keyframe')
      }
    },
    async text(value: string) {
      try {
        const tokens = await tokenizer(value, { padding: true, truncation: true })
        const output = await textModel(tokens)
        return unitVector(output.text_embeds.data)
      } catch (error) {
        if (error instanceof EmbedError) throw error
        throw new EmbedError('embed-failed', 'could not embed the text')
      }
    },
  }
}
