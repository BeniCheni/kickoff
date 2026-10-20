import { similarMomentRowSchema } from '@kickoff/catalog'
import { CatalogReadError } from './types'

/** How many neighbours the watch page asks for. The function caps that request at 12. */
export const SIMILAR_PAGE_LIMIT = 6

/**
 * Ids only, in the function's order.
 * Every row is parsed strictly before any id is kept. An extra column,
 * a missing score, or a non-finite score fails the whole similarity read.
 * The watched id, an id outside the list, and a repeat are dropped.
 * Under the contract the function never returns the watched id or an unpublished id,
 * and it already applies least(p_limit, 12), so those drops do not shrink a
 * contract-following result. They stay for a function that ignores its limit.
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
