/** Pure visit state. No browser, storage, clock, random or provider side effects. */
export type MediaStatus = 'ready' | 'loading' | 'playing' | 'paused' | 'ended' | 'blocked' | 'timeout' | 'failed'
export type MediaFailure = { kind: 'owner-blocked' | 'unknown' | 'unavailable'; providerError?: number }
export type ItemMedia = {
  status: MediaStatus
  position: number
  completed: boolean
  attempt: number
  failure?: MediaFailure
}
type OrderMode = 'editorial' | 'custom' | 'shuffle'
type OrderSnapshot = { remainder: readonly string[]; mode: OrderMode; seed: string | null }
export type MomentsQueue = OrderSnapshot & {
  canonical: readonly string[]
  pool: readonly string[]
  saved: readonly string[]
  savedOnly: boolean
  history: readonly string[]
  active: string | null
  surface: 'gallery' | 'stage' | 'cinema'
  media: Readonly<Record<string, ItemMedia>>
  undo: OrderSnapshot | null
}
export type QueueAction =
  | { type: 'open'; id: string }
  | { type: 'next' | 'previous' | 'restore' | 'undo' }
  | { type: 'shuffle'; seed: string }
  | { type: 'order'; ids: readonly string[] }
  | { type: 'filter'; ids: readonly string[]; savedOnly: boolean }
  | { type: 'saved'; ids: readonly string[] }
  | { type: 'surface'; surface: MomentsQueue['surface'] }
  | { type: 'leave' }
  | { type: 'play'; replay?: boolean }
  | { type: 'provider'; id: string; attempt: number; event: 'playing' | 'paused' | 'ended' | 'position'; position?: number }
  | { type: 'failure'; id: string; attempt: number; failure: MediaFailure }

const unique = (ids: readonly string[]) => [...new Set(ids)]
const initialMedia = (): ItemMedia => ({ status: 'ready', position: 0, completed: false, attempt: 0 })
export function createMomentsQueue(ids: readonly string[]): MomentsQueue {
  const canonical = unique(ids)
  return { canonical, pool: canonical, saved: [], savedOnly: false, history: [], remainder: canonical,
    active: null, surface: 'gallery', media: Object.fromEntries(canonical.map(id => [id, initialMedia()])), undo: null, seed: null, mode: 'editorial' }
}
export function eligibleIds(state: MomentsQueue): string[] {
  return state.pool.filter(id => !state.savedOnly || state.saved.includes(id))
}
/** History remains in first-open order. An excluded active selection remains reachable. */
export function queueIds(state: MomentsQueue): string[] {
  const eligible = new Set(eligibleIds(state))
  return [...state.history.filter(id => eligible.has(id) || id === state.active),
    ...state.remainder.filter(id => eligible.has(id))]
}
/** Transport AND recovery copy must consume this result; null means do not name a target. */
export function queueNeighbours(state: MomentsQueue): { previous: string | null; next: string | null } {
  const ids = queueIds(state)
  const index = state.active === null ? -1 : ids.indexOf(state.active)
  return { previous: index > 0 ? ids[index - 1]! : null, next: ids[index + 1] ?? null }
}

// Stable seeded Fisher-Yates over canonical membership, never over yesterday's shuffle.
function shuffled(ids: readonly string[], seed: string): string[] {
  let hash = 2166136261
  for (const c of seed) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619) >>> 0
  const out = [...ids]
  for (let i = out.length - 1; i > 0; i--) {
    hash = (Math.imul(hash, 1664525) + 1013904223) >>> 0
    const j = Math.floor((hash / 4294967296) * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}
function suspend(state: MomentsQueue): MomentsQueue {
  if (!state.active) return state
  const prior = state.media[state.active] ?? initialMedia()
  // Invalidate late callbacks on navigation; even playing at zero becomes paused.
  const media = { ...prior, attempt: prior.attempt + 1,
    status: prior.status === 'playing' ? 'paused' as const : prior.status }
  return { ...state, media: { ...state.media, [state.active]: media } }
}
function open(state: MomentsQueue, id: string): MomentsQueue {
  if (!state.canonical.includes(id)) return state
  const surface = state.surface === 'gallery' ? 'stage' : state.surface
  if (state.active === id) return { ...state, surface }
  const next = suspend(state)
  return { ...next, active: id, surface,
    history: next.history.includes(id) ? next.history : [...next.history, id],
    remainder: next.remainder.filter(item => item !== id),
    media: { ...next.media, [id]: next.media[id] ?? initialMedia() } }
}
function snapshot(state: MomentsQueue): OrderSnapshot {
  return { remainder: state.remainder, mode: state.mode, seed: state.seed }
}
function sameOrder(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id, i) => id === b[i])
}
export function momentsQueueReducer(state: MomentsQueue, action: QueueAction): MomentsQueue {
  switch (action.type) {
    case 'open': return open(state, action.id)
    case 'next':
    case 'previous': {
      const id = queueNeighbours(state)[action.type]
      return id === null ? state : open(state, id)
    }
    case 'filter': return { ...state, pool: state.canonical.filter(id => action.ids.includes(id)), savedOnly: action.savedOnly }
    case 'saved': return { ...state, saved: unique(action.ids).filter(id => state.canonical.includes(id)) }
    case 'order': {
      const remainder = unique([...action.ids, ...state.canonical])
        .filter(id => state.canonical.includes(id) && !state.history.includes(id))
      return { ...state, remainder, mode: 'custom', seed: null, undo: null }
    }
    case 'shuffle': {
      const eligible = new Set(eligibleIds(state))
      const pool = state.canonical.filter(id => eligible.has(id) && !state.history.includes(id))
      if (pool.length < 2) return state
      const result = shuffled(pool, action.seed)
      let index = 0
      const remainder = state.remainder.map(id => eligible.has(id) ? result[index++]! : id)
      if (state.mode === 'shuffle' && state.seed === action.seed && sameOrder(remainder, state.remainder)) return state
      return { ...state, remainder, mode: 'shuffle', seed: action.seed, undo: snapshot(state) }
    }
    case 'undo': {
      if (!state.undo) return state
      // Undo is order-only: newly opened IDs stay in history, not in the restored remainder.
      const remainder = unique([...state.undo.remainder, ...state.canonical]).filter(id => !state.history.includes(id))
      return { ...state, ...state.undo, remainder, undo: null }
    }
    case 'restore': return { ...state, remainder: state.canonical.filter(id => !state.history.includes(id)),
      mode: 'editorial', seed: null, undo: null }
    case 'leave': return { ...suspend(state), surface: 'gallery' }
    case 'surface': return { ...(action.surface === 'gallery' ? suspend(state) : state), surface: action.surface }
    case 'play': {
      if (!state.active || state.surface === 'gallery') return state
      const prior = state.media[state.active] ?? initialMedia()
      return { ...state, media: { ...state.media, [state.active]: { ...prior, status: 'loading',
        attempt: prior.attempt + 1, position: action.replay ? 0 : prior.position } } }
    }
    case 'provider':
    case 'failure': {
      const prior = state.media[action.id]
      if (!prior || state.active !== action.id || state.surface === 'gallery' || prior.attempt !== action.attempt) return state
      if (prior.status === 'ready' || prior.status === 'ended') return state
      if (action.type === 'failure') {
        const failure = action.failure.providerError === 150 ? { ...action.failure, kind: 'owner-blocked' as const } : action.failure
        if (failure.kind === 'unknown' && prior.failure?.kind === 'owner-blocked') {
          return { ...state, media: { ...state.media, [action.id]: { ...prior, status: 'blocked' } } }
        }
        return { ...state, media: { ...state.media, [action.id]: { ...prior, failure,
          status: failure.kind === 'owner-blocked' ? 'blocked' : failure.kind === 'unknown' ? 'timeout' : 'failed' } } }
      }
      // Terminal/error callbacks cannot revive an item; only a new explicit play can.
      if (!['loading', 'playing', 'paused'].includes(prior.status)) return state
      const position = action.position !== undefined && Number.isFinite(action.position) && action.position >= 0
        ? action.position : prior.position
      const status = action.event === 'position' ? prior.status : action.event
      return { ...state, media: { ...state.media, [action.id]: { ...prior, position, status,
        completed: prior.completed || action.event === 'ended' } } }
    }
  }
}
