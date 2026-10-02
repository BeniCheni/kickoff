import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from '../../src/App'
import { mockPlayability } from '../fixtures/moments/mockPlayability'
import { MomentsPage } from '../../src/components/MomentsPage'
import { useMomentsSession } from '../../src/components/MomentsSessionProvider'
import { SAVED_MOMENTS_KEY } from '../../src/lib/momentsSaved'
import { archivalEdition, fictionalEdition } from '../fixtures/moments/gallery'
import { createMockMomentsPlayer, currentMockPlayer } from './momentsPlayerMock'
import type { PlayerNotice } from '../../src/lib/momentsPlayer'
import '../../src/index.css'

// Separate Vite HTML entry, reachable only on the dev server. No production import.
const query = new URLSearchParams(location.search)
const scenario = query.get('scenario') ?? 'gallery'
const playback = query.get('playback') ?? 'ready'
const surface = query.get('surface') ?? 'stage'
const edition = scenario === 'empty' ? [] : scenario === 'fictional' ? fictionalEdition : archivalEdition
const theme = query.get('theme') ?? 'light'
localStorage.setItem('kickoff-theme', theme)
localStorage.setItem('kickoff-theme-broadcast', theme)
localStorage.removeItem(SAVED_MOMENTS_KEY)
if (scenario === 'failed-unsave') localStorage.setItem(SAVED_MOMENTS_KEY, JSON.stringify([edition[0]!.id]))
let refuseWrites = scenario === 'save-refused' || scenario === 'failed-unsave'
let refuseReads = scenario === 'read-refused'
const originalSet = Storage.prototype.setItem
const originalGet = Storage.prototype.getItem
Storage.prototype.setItem = function(key, value) {
  if (key === SAVED_MOMENTS_KEY && refuseWrites) throw new DOMException('Harness storage refusal', 'SecurityError')
  originalSet.call(this, key, value)
}
Storage.prototype.getItem = function(key) {
  if (key === SAVED_MOMENTS_KEY && refuseReads) throw new DOMException('Harness read refusal', 'SecurityError')
  return originalGet.call(this, key)
}
let throwRoute = false
let booted = false
function Route() {
  const session = useMomentsSession()!
  const [, rerender] = useState(0)
  useEffect(() => {
    if (booted) return
    let cancelled = false
    const id = window.setTimeout(() => {
      if (cancelled || booted) return
      booted = true
      if ((scenario === 'selected' || scenario === 'fictional' || scenario === 'player') && edition[0]) {
        session.dispatch({ type: 'open', id: edition[0].id })
      }
      if (scenario === 'player' && edition[0] && playback !== 'ready') {
        session.play()
        const mock = currentMockPlayer()
        const request = mock?.reads.plays.at(-1)
        if (mock && request) {
          const base = { itemId: request.itemId, attempt: request.attempt }
          if (playback === 'playing') mock.emit({ ...base, event: 'playing', position: 1 })
          else if (playback === 'playing0') mock.emit({ ...base, event: 'playing', position: 0 })
          else if (playback === 'paused') mock.emit({ ...base, event: 'paused', position: 4 })
          else if (playback === 'ended') mock.emit({ ...base, event: 'ended', position: 9 })
          else if (playback === 'blocked') mock.emit({ ...base, event: 'failure', failure: { kind: 'owner-blocked', providerError: 150 } })
          else if (playback === 'timeout') mock.emit({ ...base, event: 'failure', failure: { kind: 'unknown', providerError: 153 } })
        }
      }
      if (scenario === 'player' && surface === 'cinema' && edition[0]) {
        const opener = document.querySelector<HTMLElement>('header button') ?? document.body
        session.enterCinema(opener)
      }
      if (scenario === 'no-results') session.setFilters({ competition: 'all', category: 'prematch', savedOnly: false })
      if (scenario === 'spoiler-light') session.setSpoiler(true)
    }, 0)
    return () => { cancelled = true; window.clearTimeout(id) }
    // Once per document, after StrictMode's effect replay. A later lens or tab remount must not play again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  if (throwRoute) { throw new Error('Contained Moments harness route failure') }
  return <><MomentsPage /><div style={{ marginTop: 48, fontSize: 12, display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: '100%' }} data-harness-tools>
    <p>Isolated verification harness · archival examples are not a production edition.</p>
    <button onClick={() => { refuseWrites = false; refuseReads = false }}>Allow storage writes</button>{' · '}
    <button onClick={() => { refuseWrites = true }}>Refuse storage writes</button>{' · '}
    <button onClick={() => { throwRoute = true; setTimeout(() => { throwRoute = false }, 1000); rerender(n => n + 1) }}>Throw route</button>
    <p>Player simulation, deterministic mock only.</p>
    {(['playing', 'playing0', 'paused', 'ended', 'blocked', 'timeout', 'autoplay'] as const).map(kind =>
      <button type="button" key={kind} data-sim={kind} onClick={() => emitSim(kind)}>{kind}</button>)}
    <output hidden data-visit-state>{JSON.stringify({ queue: session.queue, saved: session.saved, plays: currentMockPlayer()?.reads.plays.length ?? 0 })}</output>
  </div></>
}
function emitSim(kind: 'playing' | 'playing0' | 'paused' | 'ended' | 'blocked' | 'timeout' | 'autoplay') {
  const mock = currentMockPlayer()
  const request = mock?.reads.plays.at(-1)
  if (!mock || !request) return
  const base = { itemId: request.itemId, attempt: request.attempt }
  const notice: PlayerNotice | { event: 'autoplay-blocked' } = kind === 'playing' ? { ...base, event: 'playing', position: 1 }
    : kind === 'playing0' ? { ...base, event: 'playing', position: 0 }
    : kind === 'paused' ? { ...base, event: 'paused', position: 4 }
    : kind === 'ended' ? { ...base, event: 'ended', position: 9 }
    : kind === 'blocked' ? { ...base, event: 'failure', failure: { kind: 'owner-blocked', providerError: 150 } }
    : kind === 'timeout' ? { ...base, event: 'failure', failure: { kind: 'unknown', providerError: 153 } }
    : { event: 'autoplay-blocked' }
  mock.emit(notice)
}
createRoot(document.getElementById('root')!).render(<StrictMode><App momentsEdition={edition} momentsPlayer={createMockMomentsPlayer} momentsPlayability={mockPlayability} momentsRoute={<Route />} /></StrictMode>)
