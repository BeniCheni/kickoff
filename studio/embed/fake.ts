import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { sha256 } from '../hash.ts'
import { CLIP_DIMS, EmbedError, type Embedder } from './model.ts'
import { unitVector } from './vector.ts'

/** Not a CLIP label. Rows written by the test double say this, and the functions treat it as another model. */
export const FAKE_MODEL = 'fake/sha256-unit'
export const FAKE_REVISION = 'unit'
export const FAKE_DTYPE = 'sha256'

/** A deterministic stand-in. The same bytes or the same string always return the same unit vector. */
export function fakeVector(seed: string): number[] {
  const bytes = new Uint8Array(CLIP_DIMS)
  let filled = 0
  let counter = 0
  while (filled < CLIP_DIMS) {
    const digest = createHash('sha256').update(`${seed}\0${counter}`).digest()
    const take = Math.min(digest.length, CLIP_DIMS - filled)
    bytes.set(digest.subarray(0, take), filled)
    filled += take
    counter += 1
  }
  const values = Array.from(bytes, (byte) => byte / 127.5 - 1)
  return unitVector(values)
}

export function createFakeEmbedder(): Embedder {
  return {
    identity: { model: FAKE_MODEL, revision: FAKE_REVISION, dtype: FAKE_DTYPE },
    async keyframe(localPath: string) {
      try {
        const bytes = readFileSync(localPath)
        return fakeVector(`${sha256(bytes)}:keyframe`)
      } catch (error) {
        if (error instanceof EmbedError) throw error
        throw new EmbedError('read-failed', 'could not read the keyframe')
      }
    },
    async text(value: string) {
      return fakeVector(`${value}:text`)
    },
  }
}
