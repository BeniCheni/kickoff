import { sha256 } from '../hash.ts'

const METADATA_MARKERS = new Set<number>([
  0xfe,
  ...Array.from({ length: 15 }, (_, index) => 0xe1 + index),
])

export function stripMetadata(input: Uint8Array): Uint8Array {
  if (input.length < 2 || input[0] !== 0xff || input[1] !== 0xd8) throw new Error('not a jpeg')
  const chunks: Uint8Array[] = [input.subarray(0, 2)]
  let index = 2
  while (index < input.length) {
    if (input[index] !== 0xff) throw new Error('bad jpeg')
    while (index < input.length && input[index] === 0xff) index += 1
    if (index >= input.length) break
    const marker = input[index]!
    const markerStart = index - 1
    index += 1
    if (marker === 0xd9) {
      chunks.push(input.subarray(markerStart, index))
      break
    }
    if (marker === 0xda) {
      chunks.push(input.subarray(markerStart))
      break
    }
    if (index + 1 >= input.length) throw new Error('bad jpeg')
    const length = ((input[index] ?? 0) << 8) | (input[index + 1] ?? 0)
    if (length < 2 || index + length > input.length) throw new Error('bad jpeg')
    if (!METADATA_MARKERS.has(marker)) chunks.push(input.subarray(markerStart, index + length))
    index += length
  }
  const size = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const out = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.length
  }
  return out
}

export function preparePhotograph(input: Uint8Array): { bytes: Uint8Array; sha256: string } {
  const bytes = stripMetadata(input)
  return { bytes, sha256: sha256(bytes) }
}
