import type { CatalogListRow } from '@kickoff/catalog'

export type SubjectFilter = 'all' | 'Fenway' | 'Frankenstein'
export type BrowseOrder = 'beni' | 'newest'

export function beniOrder(rows: readonly CatalogListRow[]): CatalogListRow[] {
  return [...rows].sort((a, b) => a.position - b.position || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
}

export function newestOrder(rows: readonly CatalogListRow[]): CatalogListRow[] {
  return [...rows].sort((a, b) => {
    if (a.generated_at !== b.generated_at) return a.generated_at < b.generated_at ? 1 : -1
    return a.position - b.position || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  })
}

export function matchingRows(
  rows: readonly CatalogListRow[],
  subject: SubjectFilter,
  savedOnly: boolean,
  savedIds: ReadonlySet<string>,
): CatalogListRow[] {
  return rows.filter(row => {
    if (subject !== 'all' && !row.subjects.includes(subject)) return false
    if (savedOnly && !savedIds.has(row.id)) return false
    return true
  })
}

/** Permute `ids`. The caller passes the current filtered order. */
export function shuffleIds(ids: readonly string[], random: () => number = Math.random): string[] {
  const next = [...ids]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1))
    const current = next[index]!
    next[index] = next[swap]!
    next[swap] = current
  }
  return next
}

export function applyOrder(
  rows: readonly CatalogListRow[],
  order: BrowseOrder,
  permutation: readonly string[] | null,
): CatalogListRow[] {
  const base = order === 'newest' ? newestOrder(rows) : beniOrder(rows)
  if (!permutation) return base
  const byId = new Map(base.map(row => [row.id, row]))
  const ordered = permutation.flatMap(id => {
    const row = byId.get(id)
    return row ? [row] : []
  })
  const seen = new Set(ordered.map(row => row.id))
  return [...ordered, ...base.filter(row => !seen.has(row.id))]
}
