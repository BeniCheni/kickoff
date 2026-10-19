import { catalogDetailRowSchema, catalogListRowSchema, type CatalogDetailRow, type CatalogListRow } from '@kickoff/catalog'
import { CatalogReadError, type CatalogSuccess } from './types'

const INSTANT_KEY = /^(?:published_at|generated_at|kept_at)$/

function instant(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/.test(value)) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function normalize(value: unknown, key = ''): unknown {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string' && INSTANT_KEY.test(key)) return instant(value) ?? value
  if (Array.isArray(value)) return value.map(item => normalize(item))
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [child, item] of Object.entries(value)) out[child] = normalize(item, child)
    return out
  }
  return value
}

/**
 * Every returned row is parsed strictly. An extra column, a repeated id,
 * or a list that does not match the detail rows fails the whole read.
 */
export function catalogFromRows(listRows: readonly unknown[], detailRows: readonly unknown[]): CatalogSuccess {
  const list: CatalogListRow[] = []
  const listIds = new Set<string>()
  for (const raw of listRows) {
    const parsed = catalogListRowSchema.safeParse(normalize(raw))
    if (!parsed.success) throw new CatalogReadError('catalog list row failed validation', false)
    if (listIds.has(parsed.data.id)) throw new CatalogReadError('catalog list repeated an id', false)
    listIds.add(parsed.data.id)
    list.push(parsed.data)
  }
  const details: CatalogDetailRow[] = []
  const detailIds = new Set<string>()
  for (const raw of detailRows) {
    const parsed = catalogDetailRowSchema.safeParse(normalize(raw))
    if (!parsed.success) throw new CatalogReadError('catalog detail row failed validation', false)
    if (detailIds.has(parsed.data.id)) throw new CatalogReadError('catalog detail repeated an id', false)
    detailIds.add(parsed.data.id)
    details.push(parsed.data)
  }
  if (listIds.size !== detailIds.size || [...listIds].some((id) => !detailIds.has(id))) {
    throw new CatalogReadError('catalog list and detail do not match', false)
  }
  return { preview: false, list, details }
}

export function asCatalogRows(result: unknown): unknown[] {
  if (Array.isArray(result)) return result
  throw new CatalogReadError('catalog database read failed', false)
}
