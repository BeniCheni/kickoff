import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from '../../src/App'
import { MomentsPage } from '../../src/components/MomentsPage'
import { useMomentsSession } from '../../src/components/MomentsSessionProvider'
import { SAVED_MOMENTS_KEY } from '../../src/lib/momentsSaved'
import { archivalEdition, fictionalEdition } from '../fixtures/moments/gallery'
import '../../src/index.css'

// Separate Vite HTML entry, reachable only on the dev server. No production import.
const query = new URLSearchParams(location.search)
const scenario = query.get('scenario') ?? 'gallery'
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
let setupDone = false
function Route() {
  const session = useMomentsSession()!
  const [, rerender] = useState(0)
  useEffect(() => {
    if (setupDone) return
    setupDone = true
    if (scenario === 'selected' || scenario === 'fictional') session.dispatch({ type: 'open', id: edition[0]!.id })
    if (scenario === 'no-results') session.setFilters({ competition: 'all', category: 'prematch', savedOnly: false })
    if (scenario === 'spoiler-light') session.setSpoiler(true)
    // Initial setup only; the controls below exercise subsequent state through the app UI.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  if (throwRoute) { throw new Error('Contained Moments harness route failure') }
  return <><MomentsPage /><div style={{ marginTop: 48, fontSize: 12 }} data-harness-tools>
    <p>Isolated verification harness · archival examples are not a production edition.</p>
    <button onClick={() => { refuseWrites = false; refuseReads = false }}>Allow storage writes</button>{' · '}
    <button onClick={() => { refuseWrites = true }}>Refuse storage writes</button>{' · '}
    <button onClick={() => { throwRoute = true; setTimeout(() => { throwRoute = false }, 1000); rerender(n => n + 1) }}>Throw route</button>
    <output hidden data-visit-state>{JSON.stringify({ queue: session.queue, saved: session.saved })}</output>
  </div></>
}
createRoot(document.getElementById('root')!).render(<StrictMode><App momentsEdition={edition} momentsRoute={<Route />} /></StrictMode>)
