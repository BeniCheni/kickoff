import { CLIP_DIMS } from './model.ts'

/** L2-normalise a 512-number vector. Cosine similarity then matches the dot product. */
export function unitVector(values: ArrayLike<number>): number[] {
  if (values.length !== CLIP_DIMS) {
    throw new Error(`expected ${CLIP_DIMS} dimensions, got ${values.length}`)
  }
  const out = new Array<number>(CLIP_DIMS)
  let sum = 0
  for (let index = 0; index < CLIP_DIMS; index += 1) {
    const value = Number(values[index])
    if (!Number.isFinite(value)) throw new Error('embedding component is not finite')
    out[index] = value
    sum += value * value
  }
  const norm = Math.sqrt(sum)
  if (!Number.isFinite(norm) || norm === 0) throw new Error('embedding norm is zero')
  for (let index = 0; index < CLIP_DIMS; index += 1) {
    const scaled = out[index]
    if (scaled === undefined) throw new Error('embedding component is missing')
    out[index] = scaled / norm
  }
  return out
}

export function vectorNorm(values: readonly number[]): number {
  let sum = 0
  for (const value of values) sum += value * value
  return Math.sqrt(sum)
}
