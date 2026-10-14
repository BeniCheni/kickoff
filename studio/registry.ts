import { mulUsd } from './money.ts'

export type PriceTag = 'DOCUMENTED' | 'OBSERVED'

export type RegistryRow = {
  id: string
  endpoint: string
  task: 'image' | 'edit' | 'video' | 'train'
  allowedParams: readonly string[]
  price: {
    kind: 'per_request' | 'per_second'
    usd: string
    resolution?: '480P'
    tag: PriceTag
  }
  /** Calendar date the price was read, Brooklyn. */
  priceReadOn: string
  /** Inclusive calendar date, Brooklyn. */
  validFrom: string
  /** Inclusive last day, Brooklyn. Null means open. */
  validUntil: string | null
  /** Calendar date the row was pinned, Brooklyn. Ruling 15.9, 5 Oct 2026. */
  pinnedOn: string
}

const videoParams = [
  'prompt',
  'image_url',
  'end_image_url',
  'duration',
  'resolution',
  'seed',
  'prompt_expansion',
] as const

/**
 * Recipe v0, ruling 15.9 (5 Oct 2026, wording amended 6 Oct).
 * Two endpoints. H3 Max Turbo at 480P has two price rows because the
 * documented rate changes on 15 Oct 2026. The review's "three endpoints"
 * is these two model endpoints plus the reference-photo step, which is not a call.
 */
export const registry: readonly RegistryRow[] = [
  {
    id: 'openai-gpt-image-2-edit',
    endpoint: 'openai/gpt-image-2/edit',
    task: 'edit',
    allowedParams: ['prompt', 'image_urls', 'image_size', 'quality'],
    price: { kind: 'per_request', usd: '0.051000', tag: 'OBSERVED' },
    priceReadOn: '2026-10-05',
    validFrom: '2026-10-04',
    validUntil: null,
    pinnedOn: '2026-10-05',
  },
  {
    id: 'minimax-h3-max-turbo-i2v-480p-through-2026-10-14',
    endpoint: 'minimax/h3-max-turbo/image-to-video',
    task: 'video',
    allowedParams: videoParams,
    price: { kind: 'per_second', usd: '0.015000', resolution: '480P', tag: 'DOCUMENTED' },
    priceReadOn: '2026-10-04',
    validFrom: '2026-10-04',
    validUntil: '2026-10-14',
    pinnedOn: '2026-10-05',
  },
  {
    id: 'minimax-h3-max-turbo-i2v-480p-from-2026-10-15',
    endpoint: 'minimax/h3-max-turbo/image-to-video',
    task: 'video',
    allowedParams: videoParams,
    price: { kind: 'per_second', usd: '0.025000', resolution: '480P', tag: 'DOCUMENTED' },
    priceReadOn: '2026-10-04',
    validFrom: '2026-10-15',
    validUntil: null,
    pinnedOn: '2026-10-05',
  },
]

export function brooklynDate(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function selectRegistry(endpoint: string, params: Record<string, unknown>, now: Date): RegistryRow | null {
  const day = brooklynDate(now)
  const resolution = typeof params.resolution === 'string' ? params.resolution : undefined
  return registry.find((row) => {
    if (row.endpoint !== endpoint) return false
    if (day < row.validFrom) return false
    if (row.validUntil !== null && day > row.validUntil) return false
    if (row.price.kind === 'per_second' && row.price.resolution !== resolution) return false
    return true
  }) ?? null
}

export function unknownParam(row: RegistryRow, params: Record<string, unknown>): string | null {
  for (const key of Object.keys(params)) {
    if (!row.allowedParams.includes(key)) return key
  }
  return null
}

export function estimateUsd(row: RegistryRow, params: Record<string, unknown>): string | null {
  if (row.price.kind === 'per_request') return row.price.usd
  const duration = params.duration
  if (typeof duration !== 'number' || !Number.isFinite(duration) || duration <= 0) return null
  return mulUsd(duration.toFixed(6), row.price.usd)
}
