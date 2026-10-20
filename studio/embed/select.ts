import { createClipEmbedder } from './clip.ts'
import { createFakeEmbedder } from './fake.ts'
import { resolveModelDir } from './fetch-model.ts'
import { EmbedError, type Embedder } from './model.ts'

function absentEmbedder(): Embedder {
  return {
    async keyframe() {
      throw new EmbedError('model-absent', 'the CLIP model is not on this Mac')
    },
    async text() {
      throw new EmbedError('model-absent', 'the CLIP model is not on this Mac')
    },
  }
}

/** The fake is for tests. A usable STUDIO_MODEL_DIR selects the local CLIP model. Otherwise publish records the vectors as missing. */
export function selectEmbedder(env: NodeJS.ProcessEnv, repoRoot: string): Embedder {
  if (env.STUDIO_EMBED === 'fake') return createFakeEmbedder()
  if (!env.STUDIO_MODEL_DIR?.trim()) return absentEmbedder()
  try {
    return createClipEmbedder(resolveModelDir(env, repoRoot))
  } catch {
    return absentEmbedder()
  }
}
