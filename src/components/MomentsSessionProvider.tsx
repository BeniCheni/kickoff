import { Component, createContext, useContext, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { MOMENTS } from '../lib/moments'
import { ALL_MOMENTS, matchesMoment, newestMoments, type GalleryFilters, type GalleryMoment } from '../lib/momentsGallery'
import { createMomentsQueue, momentsQueueReducer, queueNeighbours, type MomentsQueue, type QueueAction } from '../lib/momentsQueue'
import type { PlayRequest } from '../lib/momentsPlayer'
import { readSavedReferences, writeSavedReferences, type SavedReferences, type StorageAccess } from '../lib/momentsSaved'
import type { Tab } from './TabNav'

type Notice = { target: string; text: string } | null
export type PlayerNoticeState = { resume: boolean; autoplayBlocked: boolean }
type Visit = {
  edition: readonly GalleryMoment[]
  queue: MomentsQueue
  saved: SavedReferences
  /** The stored set could not be read at the start of the visit and no write has replaced it
   * yet. Kept apart from `saved.reason`, which a refused write overwrites. */
  unread: boolean
  filters: GalleryFilters
  spoiler: boolean
  notice: Notice
  playerNotice: PlayerNoticeState
}
type PlayerBridge = {
  play: (request: PlayRequest) => void
  pause: () => void
  retire: () => void
  focus: (from: EventTarget | null) => void
}
type Session = Visit & {
  dispatch: (action: QueueAction) => void
  setFilters: (filters: GalleryFilters) => void
  setSpoiler: (spoiler: boolean) => void
  setOrder: (order: string) => void
  toggleSave: (id: string, target: string) => void
  play: (replay?: boolean) => void
  pausePlayback: () => void
  enterCinema: (opener: HTMLElement) => void
  exitCinema: () => void
  registerPlayer: (bridge: PlayerBridge | null) => void
  setPlayerNotice: (partial: Partial<PlayerNoticeState>) => void
  setPlayerLive: (live: boolean) => void
  playerLive: boolean
  focusPlayer: (from: EventTarget | null) => void
  cinemaOpener: () => HTMLElement | null
}
const Context = createContext<Session | null>(null)
export const useMomentsSession = () => useContext(Context)

const quietNotice: PlayerNoticeState = { resume: false, autoplayBlocked: false }

/** Sample the live attempt before the reducer invalidates it. */
function changesAttempt(prior: Visit, action: QueueAction): boolean {
  const queue = prior.queue
  if (!queue.active) return false
  if (action.type === 'leave') return true
  if (action.type === 'surface') return action.surface === 'gallery' && queue.surface !== 'gallery'
  if (action.type === 'open') return action.id !== queue.active && queue.canonical.includes(action.id)
  if (action.type === 'next' || action.type === 'previous') {
    const id = queueNeighbours(queue)[action.type]
    return id !== null && id !== queue.active
  }
  return false
}

/** No key, global singleton, effect-driven writes or remount-based visit lifecycle. */
export function MomentsSessionProvider({ children, edition = MOMENTS, tab = 'moments', storage }: {
  children: ReactNode
  edition?: readonly GalleryMoment[]
  tab?: Tab
  storage?: StorageAccess
}) {
  const [visit, setVisit] = useState<Visit>(() => {
    const saved = readSavedReferences(storage)
    return { edition, saved, unread: saved.reason === 'read-refused' || saved.reason === 'invalid-data',
      filters: ALL_MOMENTS, spoiler: false, notice: saved.reason ? { target: 'initial-read', text: '' } : null,
      playerNotice: quietNotice,
      queue: momentsQueueReducer(createMomentsQueue(edition.map(m => m.id)), { type: 'saved', ids: saved.ids }) }
  })
  const [playerLive, setPlayerLive] = useState(false)
  // The event handler writes once, outside a React updater (StrictMode may replay updaters).
  // This ref also makes two same-turn controls consume the latest full saved set.
  const current = useRef(visit)
  const bridge = useRef<PlayerBridge | null>(null)
  const opener = useRef<HTMLElement | null>(null)
  const update = (next: Visit) => { current.current = next; setVisit(next) }
  const dispatch = (action: QueueAction) => {
    if (changesAttempt(current.current, action)) bridge.current?.retire()
    const prior = current.current
    const queue = momentsQueueReducer(prior.queue, action)
    const selectionChanged = queue.active !== prior.queue.active
    const playing = action.type === 'provider' && action.event === 'playing'
    const settled = action.type === 'failure' || (action.type === 'provider' && (action.event === 'playing' || action.event === 'ended'))
    update({ ...prior, queue,
      notice: action.type === 'player-lost' || selectionChanged || (settled && prior.notice?.target === 'playback') ? null : prior.notice,
      playerNotice: {
        resume: action.type === 'player-lost' || selectionChanged ? false : prior.playerNotice.resume,
        autoplayBlocked: action.type === 'player-lost' || selectionChanged || playing ? false : prior.playerNotice.autoplayBlocked,
      } })
  }
  const setPlayerNotice = (partial: Partial<PlayerNoticeState>) => {
    const prior = current.current
    update({ ...prior, playerNotice: { ...prior.playerNotice, ...partial } })
  }
  const previousTab = useRef(tab)
  // Before paint: a passive effect left one frame in which the player's box, still placed on
  // the stage, was drawn over Fixtures or Table.
  useLayoutEffect(() => {
    if (previousTab.current === 'moments' && tab !== 'moments') {
      dispatch({ type: 'leave' })
      const prior = current.current
      if (prior.notice || prior.playerNotice.resume || prior.playerNotice.autoplayBlocked) {
        update({ ...prior, notice: null, playerNotice: quietNotice })
      }
    }
    previousTab.current = tab
  }, [tab])
  const setFilters = (filters: GalleryFilters) => {
    const prior = current.current
    const ids = prior.edition.filter(m => matchesMoment(m, filters)).map(m => m.id)
    update({ ...prior, filters, notice: null,
      queue: momentsQueueReducer(prior.queue, { type: 'filter', ids, savedOnly: filters.savedOnly }) })
  }
  const setOrder = (order: string) => dispatch(order === 'newest'
    ? { type: 'order', ids: newestMoments(current.current.edition) } : { type: 'restore' })
  const toggleSave = (id: string, target: string) => {
    const prior = current.current
    const wasSaved = prior.queue.saved.includes(id)
    const ids = wasSaved ? prior.queue.saved.filter(value => value !== id) : [...prior.queue.saved, id]
    const saved = writeSavedReferences(ids, storage)
    const replacedUnreadable = saved.persistence === 'local' && prior.unread
    const text = saved.persistence === 'local'
      ? `${wasSaved ? 'Reference removed from this browser.' : 'Reference saved in this browser.'}${replacedUnreadable ? ' This write replaces the unreadable stored set.' : ''}`
      : saved.reason === 'invalid-data' ? 'Invalid reference refused. Changes are visit-only; stored references were not changed.'
      : wasSaved ? 'Removed for this visit only. The stored reference may return next visit.'
      : 'Saved for this visit only. Browser storage refused the update.'
    update({ ...prior, saved, unread: prior.unread && saved.persistence !== 'local',
      queue: momentsQueueReducer(prior.queue, { type: 'saved', ids: saved.ids }), notice: { target, text } })
  }
  const play = (replay = false) => {
    const prior = current.current
    const active = prior.queue.active
    if (!active || prior.queue.surface === 'gallery') return
    const before = prior.queue.media[active]
    if (!before) return
    bridge.current?.retire()
    const base = current.current
    const queue = momentsQueueReducer(base.queue, { type: 'play', ...(replay ? { replay: true } : {}) })
    const moment = base.edition.find(item => item.id === active)
    const videoId = moment?.source?.identity?.videoId
    const retrying = before.status === 'blocked' || before.status === 'timeout' || before.status === 'failed'
    update({ ...base, queue, playerNotice: quietNotice,
      notice: retrying ? { target: 'playback', text: 'Retrying this selection.' } : base.notice })
    if (!videoId) return
    const media = queue.media[active]
    if (!media) return
    bridge.current?.play({
      itemId: active, attempt: media.attempt, videoId, position: media.position, replay,
      resume: !replay && before.position > 0,
    })
  }
  const enterCinema = (control: HTMLElement) => {
    const prior = current.current
    if (!prior.queue.active || prior.queue.surface === 'gallery') return
    opener.current = control
    update({ ...prior, queue: momentsQueueReducer(prior.queue, { type: 'surface', surface: 'cinema' }) })
  }
  const exitCinema = () => {
    const prior = current.current
    if (prior.queue.surface !== 'cinema') return
    update({ ...prior, queue: momentsQueueReducer(prior.queue, { type: 'surface', surface: 'stage' }) })
  }
  return <Context.Provider value={{ ...visit, playerLive, dispatch, setFilters, setOrder, toggleSave, play,
    pausePlayback: () => bridge.current?.pause(), enterCinema, exitCinema, setPlayerNotice, setPlayerLive,
    registerPlayer: next => { bridge.current = next },
    focusPlayer: from => bridge.current?.focus(from),
    cinemaOpener: () => opener.current,
    setSpoiler: spoiler => update({ ...current.current, spoiler, notice: null }) }}>{children}</Context.Provider>
}

/** Owner failures are outside route recovery. Never promise retention after owner loss.
 * The fallback shows only while the Moments tab is active (`active`); on any other tab a failed
 * owner renders nothing, so Fixtures and Table stay reachable and unchanged. */
export class MomentsSessionBoundary extends Component<{ children: ReactNode; active?: boolean }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (!this.state.failed) return this.props.children
    if (this.props.active === false) return null
    return <div role="alert" className="rounded border border-line-strong bg-surface p-4 text-ink">
      <p className="font-display text-[22px] font-semibold">This visit couldn’t be restored.</p>
      <p className="mt-1 text-[13px] text-ink-secondary">Your Moments visit may be lost. Browser-saved references will be read again when you retry.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button className="label-caps cursor-pointer rounded border border-ink px-3 py-2 text-[12px]" onClick={() => this.setState({ failed: false })}>Retry visit</button>
      </div>
    </div>
  }
}
