/** Only reference IDs cross reloads; visit queues and provider state never do. */
export const SAVED_MOMENTS_KEY = 'kickoff-moments-saved-v1'
export type SavedReferences = {
  ids: readonly string[]
  persistence: 'local' | 'visit-only'
  reason: 'read-refused' | 'write-refused' | 'invalid-data' | null
}
export type ReferenceStorage = { getItem(key: string): string | null; setItem(key: string, value: string): void }
// Access the property inside try: even the localStorage getter can throw.
type StorageAccess = () => ReferenceStorage | undefined
const browserStorage: StorageAccess = () => (globalThis as { localStorage?: ReferenceStorage }).localStorage
const validIds = (value: unknown): value is string[] => Array.isArray(value)
  && value.every(id => typeof id === 'string' && id.trim().length > 0 && id === id.trim())

export function readSavedReferences(access: StorageAccess = browserStorage): SavedReferences {
  try {
    const storage = access()
    if (!storage) return { ids: [], persistence: 'visit-only', reason: 'read-refused' }
    const raw = storage.getItem(SAVED_MOMENTS_KEY)
    if (raw === null) return { ids: [], persistence: 'local', reason: null }
    let data: unknown
    try { data = JSON.parse(raw) } catch { return { ids: [], persistence: 'visit-only', reason: 'invalid-data' } }
    if (!validIds(data)) return { ids: [], persistence: 'visit-only', reason: 'invalid-data' }
    return { ids: [...new Set(data)], persistence: 'local', reason: null }
  } catch { return { ids: [], persistence: 'visit-only', reason: 'read-refused' } }
}

/** Persist the full current set. A refused unsave changes the visit, not the stored copy. */
export function writeSavedReferences(ids: readonly string[], access: StorageAccess = browserStorage): SavedReferences {
  if (!validIds(ids)) throw new Error('Saved references must be nonempty, trimmed IDs')
  const next = [...new Set(ids)]
  try {
    const storage = access()
    if (!storage) return { ids: next, persistence: 'visit-only', reason: 'write-refused' }
    storage.setItem(SAVED_MOMENTS_KEY, JSON.stringify(next))
    return { ids: next, persistence: 'local', reason: null }
  } catch { return { ids: next, persistence: 'visit-only', reason: 'write-refused' } }
}
