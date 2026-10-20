import { createClipEmbedder } from './clip.ts'
import { createFakeEmbedder } from './fake.ts'
import { resolveModelDir } from './fetch-model.ts'
import { EmbedError, type Embedder } from './model.ts'

/** Printed on the CLI stderr line and on the admin shell line. */
export const FAKE_EMBED_REFUSAL = 'refused: STUDIO_EMBED=fake needs NODE_ENV=test and a PGlite database'

export function fakeEmbedAllowed(pglite: boolean): boolean {
  return process.env.NODE_ENV === 'test' && pglite
}

function absentEmbedder(): Embedder {
  return {
    identity: { model: 'absent', revision: 'absent', dtype: 'absent' },
    async keyframe() {
      throw new EmbedError('model-absent', 'the CLIP model is not on this Mac')
    },
    async text() {
      throw new EmbedError('model-absent', 'the CLIP model is not on this Mac')
    },
  }
}

/**
 * The fake is for tests on PGlite. A usable STUDIO_MODEL_DIR selects the local CLIP model.
 * Otherwise publish records the vectors as missing.
 * `STUDIO_EMBED=fake` on a live database is refused, including when NODE_ENV is test.
 */
export function selectEmbedder(env: NodeJS.ProcessEnv, repoRoot: string, options: { pglite: boolean }): Embedder {
  if (env.STUDIO_EMBED === 'fake') {
    if (!fakeEmbedAllowed(options.pglite)) throw new Error(FAKE_EMBED_REFUSAL)
    return createFakeEmbedder()
  }
  if (!env.STUDIO_MODEL_DIR?.trim()) return absentEmbedder()
  try {
    return createClipEmbedder(resolveModelDir(env, repoRoot))
  } catch {
    return absentEmbedder()
  }
}
