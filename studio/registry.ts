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

/**
 * Midnight at the start of a Brooklyn calendar day. Null when `day` is not
 * that day in America/New_York.
 */
function offsetMinutes(instant: Date): number | null {
  const zone = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    timeZoneName: 'shortOffset',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant).find((part) => part.type === 'timeZoneName')?.value ?? ''
  const offset = /^GMT([+-]\d{1,2})(?::(\d{2}))?$/.exec(zone)
  if (!offset || offset[1] === undefined) return null
  const hours = Number(offset[1])
  const minutes = Number(offset[2] ?? '0')
  return hours * 60 + Math.sign(hours || 1) * minutes
}

export function brooklynStart(day: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const date = Number(match[3])
  if (month < 1 || month > 12 || date < 1 || date > 31) return null
  const civil = new Date(Date.UTC(year, month - 1, date))
  if (civil.getUTCFullYear() !== year || civil.getUTCMonth() !== month - 1 || civil.getUTCDate() !== date) return null
  // The offset at noon is the wrong side of a transition day. Read it again at the candidate midnight.
  let total = offsetMinutes(new Date(Date.UTC(year, month - 1, date, 12)))
  if (total === null) return null
  let instant = civil
  for (let step = 0; step < 2; step += 1) {
    instant = new Date(Date.UTC(year, month - 1, date) - total * 60_000)
    const next = offsetMinutes(instant)
    if (next === null) return null
    if (next === total) break
    total = next
  }
  if (brooklynDate(instant) !== day) return null
  return instant
}

/**
 * A clip made by hand in Grok Imagine. Not a fal endpoint and not a price:
 * `selectRegistry` does not return it, and import writes no ledger line.
 * `pinnedOn` here is the day this entry was added; each import records its own date.
 */
export const GROK_IMAGINE = {
  id: 'grok-imagine',
  endpoint: 'xai/grok-imagine (grok.com, made by hand)',
  task: 'video' as const,
  pinnedOn: '2026-10-18',
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
