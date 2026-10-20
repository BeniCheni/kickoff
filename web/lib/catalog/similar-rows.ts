import { similarMomentRowSchema } from './similar'
import { CatalogReadError } from './types'

/** How many neighbours the watch page keeps. The function's own cap is higher. */
export const SIMILAR_PAGE_LIMIT = 6

/**
 * Ids only, in the function's order.
 * Every row is parsed strictly before any id is kept. An extra column,
 * a missing score, or a non-finite score fails the whole similarity read.
 * The watched id, an id outside the list, and a repeat are dropped.
 * The score is not returned.
 */
export function similarIdsFromRows(rows: readonly unknown[], listIds: ReadonlySet<string>, watchId: string): string[] {
  const ids: string[] = []
  const seen = new Set<string>()
  for (const raw of rows) {
    const parsed = similarMomentRowSchema.safeParse(raw)
    if (!parsed.success) throw new CatalogReadError('similar row failed validation', false, 'failed validation')
    const id = parsed.data.id
    if (id === watchId || !listIds.has(id) || seen.has(id)) continue
    seen.add(id)
    ids.push(id)
  }
  return ids.slice(0, SIMILAR_PAGE_LIMIT)
}
