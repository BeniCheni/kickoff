import { createHash } from 'node:crypto'

export function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex')
}

export function cacheKey(input: {
  registryId: string
  params: Record<string, unknown>
  inputHashes: readonly string[]
  seed: string | null
}): string {
  const params = Object.fromEntries(Object.entries(input.params).sort(([left], [right]) => left.localeCompare(right)))
  return sha256(JSON.stringify({
    registryId: input.registryId,
    params,
    inputHashes: [...input.inputHashes].sort(),
    seed: input.seed,
  }))
}
