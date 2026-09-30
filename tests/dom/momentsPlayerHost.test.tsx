import { StrictMode } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import App from '../../src/App'
import { MomentsPage } from '../../src/components/MomentsPage'
import { useMomentsSession } from '../../src/components/MomentsSessionProvider'
import { archivalEdition } from '../fixtures/moments/gallery'
import type { MomentsQueue } from '../../src/lib/momentsQueue'
import { currentMockPlayer } from '../harness/momentsPlayerMock'
import { createMockMomentsPlayer } from '../harness/momentsPlayerMock'
import { installMatchMedia, installSelectionScroll, popTo, primeClock, referenceStorageRig } from './rig'

let release: () => void
beforeEach(() => {
  installMatchMedia(); installSelectionScroll(); release = primeClock(new Date('2026-09-27T18:00:00Z'))
  window.history.replaceState(null, '', '/?tab=moments')
})
afterEach(() => {
  document.querySelectorAll('script[data-moments-youtube-api]').forEach(node => node.remove())
  cleanup(); release(); vi.restoreAllMocks()
})

function Probe() {
  const session = useMomentsSession()!
  return <output data-testid="visit">{JSON.stringify(session.queue)}</output>
}
const state = (): MomentsQueue => JSON.parse(screen.getByTestId('visit').textContent!)
const media = (id = state().active!) => state().media[id]!
const openCard = (id: string) => fireEvent.click(within(document.querySelector<HTMLElement>(`[data-moment-id="${id}"]`)!).getByRole('button', { name: 'Open selection' }))
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }))
const player = () => currentMockPlayer()!
const lastPlay = () => player().reads.plays.at(-1)!
function emitPlaying(position?: number) {
  const request = lastPlay()
  act(() => player().emit({ itemId: request.itemId, attempt: request.attempt, event: 'playing', ...(position === undefined ? {} : { position }) }))
}
function emitFailure(failure: { kind: 'owner-blocked' | 'unknown' | 'unavailable'; providerError?: number }, request = lastPlay()) {
  act(() => player().emit({ itemId: request.itemId, attempt: request.attempt, event: 'failure', failure }))
}

function renderVisit() {
  return render(<App momentsEdition={archivalEdition} momentsPlayer={createMockMomentsPlayer}
    momentsRoute={<><MomentsPage /><Probe /></>} />)
}

it('intent gate: an empty ready stage makes no provider request, and Play creates one about:blank frame', () => {
  renderVisit()
  expect(document.querySelector('iframe, script[data-moments-youtube-api]')).toBeNull()
  openCard(archivalEdition[0]!.id)
  expect(document.querySelector('iframe, script[data-moments-youtube-api], link[rel="preconnect"]')).toBeNull()
  expect(screen.getByRole('link', { name: /Open at/ }).getAttribute('data-primary-action')).toBeNull()
  click('Play')
  const frame = document.querySelector('iframe')
  expect(document.querySelectorAll('iframe')).toHaveLength(1)
  expect(frame?.getAttribute('src')).toBe('about:blank')
  expect(frame?.closest('[data-moments-player-host]')).toBeTruthy()
  expect(document.querySelector('[data-moments-stage-anchor] iframe')).toBeNull()
  expect(document.querySelector('script[data-moments-youtube-api]')).toBeNull()
  expect(lastPlay()).toMatchObject({ videoId: 'pkEpLtePJm0', replay: false, resume: false, position: 0 })
  expect(document.activeElement?.hasAttribute('data-player-return')).toBe(true)
  expect(frame?.parentElement?.hasAttribute('data-moments-player-host')).toBe(true)
  click('Play')
  expect(document.querySelectorAll('iframe')).toHaveLength(1)
  expect(player().reads.plays).toHaveLength(2)
  const second = player().reads.plays.at(-1)!
  act(() => player().emit({ itemId: second.itemId, attempt: second.attempt, event: 'playing', position: 1 }))
  expect(document.querySelectorAll('iframe')).toHaveLength(1)
  expect(document.querySelector('iframe')?.parentElement?.hasAttribute('data-moments-player-host')).toBe(true)
})

it('D-14: playback states survive the surfaces the reducer keeps, and only playing pauses on gallery return', () => {
  renderVisit(); openCard(archivalEdition[0]!.id)
  expect(media().status).toBe('ready')
  click('Enter Cinema')
  expect(document.querySelector('iframe')).toBeNull()
  expect(media().status).toBe('ready')
  click('Exit Cinema')
  expect(media()).toMatchObject({ status: 'ready', position: 0, attempt: 0 })

  click('Play')
  expect(media()).toMatchObject({ status: 'loading', attempt: 1, position: 0 })
  const loading = media()
  click('Enter Cinema'); click('Exit Cinema')
  expect(media()).toMatchObject(loading)

  act(() => player().emit({ event: 'autoplay-blocked' }))
  expect(screen.getByText('Playback has not started. The control inside the player can start it.')).toBeTruthy()
  expect(media().status).toBe('loading')
  expect(media().failure).toBeUndefined()
  emitPlaying(0)
  expect(media()).toMatchObject({ status: 'playing', position: 0 })
  expect(screen.queryByText('Playback has not started. The control inside the player can start it.')).toBeNull()
  act(() => player().emit({ event: 'resume-label' }))
  expect(screen.getByText('Resuming from the last known position.')).toBeTruthy()
  emitPlaying(0)
  expect(screen.queryByText('Resuming from the last known position.')).toBeNull()

  const playing = media()
  click('Enter Cinema'); click('Exit Cinema')
  expect(media()).toMatchObject(playing)
  click('← Gallery')
  expect(media()).toMatchObject({ status: 'paused', position: 0 })

  click('Return to selection'); click('Play'); emitPlaying(12)
  click('Pause')
  expect(media()).toMatchObject({ status: 'paused', position: 12 })
  const paused = media()
  click('Enter Cinema'); click('Exit Cinema'); click('← Gallery')
  expect(media().status).toBe('paused')
  expect(media().position).toBe(paused.position)

  click('Return to selection'); click('Play'); emitPlaying(4)
  act(() => player().emit({ itemId: lastPlay().itemId, attempt: lastPlay().attempt, event: 'ended', position: 20 }))
  expect(media()).toMatchObject({ status: 'ended', completed: true, position: 20 })
  click('Enter Cinema'); click('Exit Cinema'); click('← Gallery')
  expect(media()).toMatchObject({ status: 'ended', completed: true, position: 20 })
  expect(screen.queryByRole('button', { name: 'Replay' })).toBeNull()
  click('Return to selection')
  click('Replay')
  expect(lastPlay()).toMatchObject({ replay: true, resume: false, position: 0 })
  expect(media().status).toBe('loading')
})

it('D-14: tab away and back leaves once and never autoplays; a lens switch does not leave', () => {
  renderVisit(); openCard(archivalEdition[0]!.id); click('Play'); emitPlaying(6)
  const attempt = media().attempt
  const plays = player().reads.plays.length
  fireEvent.click(screen.getByRole('radio', { name: 'Broadcast' }))
  expect(media()).toMatchObject({ status: 'playing', position: 6, attempt })
  act(() => popTo('/?tab=fixtures'))
  act(() => popTo('/?tab=moments'))
  expect(media()).toMatchObject({ status: 'paused', position: 6, attempt: attempt + 1 })
  expect(player().reads.plays).toHaveLength(plays)
  expect(state().surface).toBe('gallery')
  click('Return to selection')
  expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy()
  expect(player().reads.plays).toHaveLength(plays)
  expect(state().active).toBe(archivalEdition[0]!.id)
  expect(state().history).toEqual([archivalEdition[0]!.id])
})

it('D-09: one terminal failure per attempt, and an owner block survives another item’s unknown outcome', () => {
  renderVisit(); const [first, second] = archivalEdition
  openCard(first!.id); click('Play')
  const attempt = lastPlay()
  emitFailure({ kind: 'owner-blocked', providerError: 150 })
  emitFailure({ kind: 'unavailable', providerError: 5 }, attempt)
  expect(media(first!.id)).toMatchObject({ status: 'blocked', failure: { kind: 'owner-blocked', providerError: 150 } })
  click(/^Next:/); click('Play')
  emitFailure({ kind: 'unknown', providerError: 153 })
  expect(media(second!.id)).toMatchObject({ status: 'timeout', failure: { kind: 'unknown', providerError: 153 } })
  click('← Gallery'); openCard(first!.id)
  expect(media(first!.id)).toMatchObject({ status: 'blocked', failure: { kind: 'owner-blocked', providerError: 150 } })
  expect(media(second!.id).failure?.kind).toBe('unknown')
})

it('D-08/D-18/H-G: recovery names only the real next item, with one Next and no doubled terminal mark', () => {
  renderVisit(); openCard(archivalEdition[0]!.id); click('Play')
  emitFailure({ kind: 'owner-blocked', providerError: 150 })
  const recovery = document.querySelector('[data-playback-recovery]')!
  expect(recovery.textContent).toContain('Keep the story. Choose the next step.')
  expect(recovery.textContent).toContain(`Next opens “${archivalEdition[1]!.title}”`)
  expect(recovery.textContent).not.toContain(archivalEdition[2]!.title)
  expect(recovery.textContent).not.toMatch(/\.\.|\?\.|!\.|”\./)
  expect(recovery.querySelector('button')).toBeNull()
  expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy()
  expect(screen.getAllByRole('button', { name: /^Next/ })).toHaveLength(1)
  click('Retry')
  expect(screen.getByText('Retrying this selection.')).toBeTruthy()
  expect(lastPlay().attempt).toBe(2)

  click('← Gallery'); openCard(archivalEdition[0]!.id); click(/^Next:/); click(/^Next:/); click('Play')
  emitFailure({ kind: 'unknown', providerError: 153 })
  expect(document.querySelector('[data-recovery-copy]')!.textContent).toContain('There is no next selection in this order.')
  expect(document.querySelector('[data-recovery-copy]')!.textContent).toContain('This does not establish a territory restriction.')
  expect(document.querySelector('[data-recovery-copy]')!.textContent).not.toContain(archivalEdition[0]!.title)
  expect(screen.getAllByRole('button', { name: /^Next/ })).toHaveLength(1)
})

it.each(['Ends.', 'Ends?', 'Ends!', 'Ends.”'])('D-18: Cinema and recovery copy do not double the terminal mark in %s', title => {
  const edition = archivalEdition.map(item => ({ ...item, title }))
  render(<App momentsEdition={edition} momentsPlayer={createMockMomentsPlayer} momentsRoute={<><MomentsPage /><Probe /></>} />)
  openCard(edition[0]!.id); click('Play')
  emitFailure({ kind: 'unavailable', providerError: 100 })
  click('Enter Cinema')
  const cinema = screen.getByRole('dialog', { name: 'Cinema' })
  expect(cinema.textContent).not.toMatch(/\.\.|\?\.|!\.|”\./)
  expect(within(cinema).getByRole('button', { name: `Next: ${title}` })).toBeTruthy()
  expect(within(cinema).queryByRole('button', { name: /Next selection/ })).toBeNull()
  expect(within(cinema).getAllByRole('button', { name: /^Next/ })).toHaveLength(1)
  expect(within(cinema).getAllByRole('status')).toHaveLength(1)
})

it('D-19/D-07/H-C: Cinema has one live region, a stable Save name, and no history entry', () => {
  const storage = referenceStorageRig(); storage.refuseWrite(true)
  render(<App momentsEdition={archivalEdition} momentsPlayer={createMockMomentsPlayer} momentsStorage={storage.access}
    momentsRoute={<><MomentsPage /><Probe /></>} />)
  openCard(archivalEdition[0]!.id); click('Play'); emitPlaying(1)
  const before = window.history.length
  const search = window.location.search
  click('Enter Cinema')
  const cinema = screen.getByRole('dialog', { name: 'Cinema' })
  expect(window.history.length).toBe(before)
  expect(window.location.search).toBe(search)
  expect(cinema.getAttribute('closedby')).toBe('closerequest')
  expect(document.activeElement?.hasAttribute('data-cinema-exit')).toBe(true)
  expect(document.querySelector('header')?.hasAttribute('inert')).toBe(true)
  expect(document.querySelector('nav')?.hasAttribute('inert')).toBe(true)
  expect(document.querySelector('[data-moments-background="route"]')?.hasAttribute('inert')).toBe(true)
  expect(document.querySelector('.max-w-\\[780px\\]')?.hasAttribute('inert')).toBe(false)
  expect(document.body.hasAttribute('inert')).toBe(false)
  expect(cinema.closest('[inert]')).toBeNull()
  const save = within(cinema).getByRole('button', { name: /Save reference/ })
  expect(save.textContent).toBe('Save reference')
  expect(save.getAttribute('aria-label')).toContain('Save reference')
  expect(save.getAttribute('aria-pressed')).toBe('false')
  expect(within(cinema).getAllByRole('status')).toHaveLength(1)
  fireEvent.click(save)
  expect(save.getAttribute('aria-pressed')).toBe('true')
  expect(within(cinema).getByRole('status').textContent).toContain('Saved for this visit only')
  fireEvent.click(cinema.querySelector<HTMLElement>('[data-queue-id="iBuTEywEQ6U"]')!)
  expect(within(cinema).getByRole('status').textContent).toBe('')
  expect(document.activeElement?.hasAttribute('data-primary-action')).toBe(true)
  click('Exit Cinema')
  expect(document.activeElement?.textContent).toContain('Enter Cinema')
  expect(document.querySelector('header')?.hasAttribute('inert')).toBe(false)
  expect(state().active).toBe(archivalEdition[1]!.id)
  expect(media(archivalEdition[0]!.id)).toMatchObject({ status: 'paused', position: 1 })
})

const saveSurfaces = ['selected', 'card', 'cinema'] as const
function saveArea(target: typeof saveSurfaces[number], id: string) {
  if (target === 'card') return document.querySelector<HTMLElement>(`[data-moment-id="${id}"]`)!
  openCard(id)
  if (target === 'cinema') { click('Enter Cinema'); return screen.getByRole('dialog', { name: 'Cinema' }) }
  return document.querySelector<HTMLElement>('.moments-stage-main')!
}
const badReadSurfaces = saveSurfaces.flatMap(target => (['read-refused', 'invalid-data'] as const).map(reason => ({ target, reason })))

it.each(badReadSurfaces)('row 61: a $target write after $reason says it replaces the unreadable stored set', ({ target, reason }) => {
  const storage = referenceStorageRig(reason === 'invalid-data' ? 'broken JSON' : '["old-reference"]')
  if (reason === 'read-refused') storage.refuseRead(true)
  render(<App momentsEdition={archivalEdition} momentsPlayer={createMockMomentsPlayer} momentsStorage={storage.access}
    momentsRoute={<><MomentsPage /><Probe /></>} />)
  const cinema = saveArea(target, archivalEdition[0]!.id)
  fireEvent.click(within(cinema).getByRole('button', { name: /Save reference/ }))
  const status = within(cinema).getByRole('status').textContent ?? ''
  expect(status).toBe('Reference saved in this browser. This write replaces the unreadable stored set.')
  expect(status).not.toMatch(/\.\.|\?\.|!\.|”\./)
  expect(storage.disk()).toBe(JSON.stringify([archivalEdition[0]!.id]))
  fireEvent.click(within(cinema).getByRole('button', { name: /Save reference/ }))
  expect(within(cinema).getByRole('status').textContent).toBe('Reference removed from this browser.')
})

it.each(badReadSurfaces)('row 61: $target after $reason, a refused write does not use up the sentence', ({ target, reason }) => {
  const storage = referenceStorageRig(reason === 'invalid-data' ? 'broken JSON' : '["old-reference"]')
  if (reason === 'read-refused') storage.refuseRead(true)
  render(<App momentsEdition={archivalEdition} momentsPlayer={createMockMomentsPlayer} momentsStorage={storage.access}
    momentsRoute={<><MomentsPage /><Probe /></>} />)
  const before = storage.disk()
  storage.refuseWrite(true)
  const cinema = saveArea(target, archivalEdition[0]!.id)
  const save = within(cinema).getByRole('button', { name: /Save reference/ })
  const status = () => within(cinema).getByRole('status').textContent
  fireEvent.click(save)
  expect(status()).toBe('Saved for this visit only. Browser storage refused the update.')
  expect(storage.disk()).toBe(before)
  storage.refuseWrite(false)
  fireEvent.click(save)
  expect(status()).toBe('Reference removed from this browser. This write replaces the unreadable stored set.')
  expect(storage.disk()).toBe('[]')
  fireEvent.click(save)
  expect(status()).toBe('Reference saved in this browser.')
})

it.each(saveSurfaces)('row 61: %s refuses an invalid reference without claiming an unreadable stored set', target => {
  const storage = referenceStorageRig('["old-reference"]')
  const edition = archivalEdition.map((item, index) => index === 0 ? { ...item, id: ' padded ' } : item)
  render(<App momentsEdition={edition} momentsPlayer={createMockMomentsPlayer} momentsStorage={storage.access}
    momentsRoute={<><MomentsPage /><Probe /></>} />)
  let cinema = saveArea(target, ' padded ')
  const status = () => within(cinema).getByRole('status').textContent
  fireEvent.click(within(cinema).getByRole('button', { name: /Save reference/ }))
  expect(status()).toBe('Invalid reference refused. Changes are visit-only; stored references were not changed.')
  expect(storage.disk()).toBe('["old-reference"]')
  if (target === 'card') cinema = saveArea(target, edition[1]!.id)
  else fireEvent.click(within(cinema).getByRole('button', { name: /^Next:/ }))
  fireEvent.click(within(cinema).getByRole('button', { name: /Save reference/ }))
  expect(status()).toBe('Reference saved in this browser.')
  expect(JSON.parse(storage.disk()!)).toEqual(['old-reference', edition[1]!.id])
})

it('H-C/D-15: Escape and cancel leave Cinema, and a lower queue row focuses its primary action', () => {
  renderVisit(); openCard(archivalEdition[0]!.id)
  const opener = screen.getByRole('button', { name: 'Enter Cinema' })
  fireEvent.click(opener)
  fireEvent.keyDown(screen.getByRole('dialog', { name: 'Cinema' }), { key: 'Escape' })
  expect(state().surface).toBe('stage')
  expect(document.activeElement).toBe(opener)
  click('Enter Cinema')
  const cinema = screen.getByRole('dialog', { name: 'Cinema' })
  act(() => { cinema.dispatchEvent(new Event('cancel', { bubbles: true, cancelable: true })) })
  expect(state().surface).toBe('stage')
  expect((cinema as HTMLDialogElement).open).toBe(false)
  click('Play'); click('Enter Cinema')
  const openCinema = screen.getByRole('dialog', { name: 'Cinema' })
  const row = within(openCinema).getByRole('button', { name: /Stay for the celebration/ }) as HTMLElement
  row.focus()
  fireEvent.keyDown(row, { key: 'Enter' })
  fireEvent.click(row)
  expect(document.activeElement?.hasAttribute('data-primary-action')).toBe(true)
  expect(within(openCinema).getByRole('heading', { level: 1 }).textContent).toContain('Stay for the celebration')
  // The frame still holds the first selection, so on this one it is clipped and is no focus stop.
  const lastUnplayed = [...openCinema.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]')].at(-1)!
  lastUnplayed.focus()
  fireEvent.keyDown(lastUnplayed, { key: 'Tab' })
  expect(document.activeElement?.hasAttribute('data-cinema-exit')).toBe(true)
  fireEvent.click(within(openCinema).getByRole('button', { name: 'Play' }))
  const last = [...openCinema.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], iframe')].at(-1)!
  last.focus()
  fireEvent.keyDown(last, { key: 'Tab' })
  expect(document.activeElement?.tagName).toBe('IFRAME')
  fireEvent.keyDown(document.activeElement!, { key: 'Tab', shiftKey: true })
  expect(document.activeElement).toBe(last)
  fireEvent.click(within(openCinema).getByRole('button', { name: '← Gallery' }))
  expect(document.activeElement).toBe(document.querySelector('.moments-edition-head h1'))
  expect(state().surface).toBe('gallery')
})

it('stage focus order reaches the player without leaving the iframe inside the route', () => {
  renderVisit(); openCard(archivalEdition[0]!.id); click('Play')
  const sentinel = document.querySelector<HTMLElement>('[data-player-sentinel]')!
  const primary = document.querySelector<HTMLElement>('.moments-stage-main [data-primary-action]')!
  fireEvent.focus(sentinel)
  expect(document.activeElement?.hasAttribute('data-player-return')).toBe(true)
  fireEvent.focus(sentinel, { relatedTarget: primary })
  expect(document.activeElement?.tagName).toBe('IFRAME')
  const back = document.querySelector<HTMLElement>('[data-player-return]')!
  fireEvent.keyDown(back, { key: 'Tab', shiftKey: true })
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Enter Cinema' }))
  fireEvent.focus(document.querySelector('[data-player-continue]')!)
  expect(document.activeElement).toBe(primary)
  expect(document.querySelector('[data-moments-player-dialog]')?.getAttribute('role')).toBe('region')
  expect(screen.queryByRole('dialog')).toBeNull()
})

it('D-01: mock completion survives shuffle Undo', () => {
  renderVisit(); openCard(archivalEdition[0]!.id); click('Play'); emitPlaying(3)
  act(() => player().emit({ itemId: lastPlay().itemId, attempt: lastPlay().attempt, event: 'ended', position: 15 }))
  expect(media().completed).toBe(true)
  click('Shuffle remaining'); click(/^Next:/)
  const after = state()
  click('Undo shuffle')
  expect(state().history).toEqual(after.history)
  expect(state().active).toBe(after.active)
  expect(state().media[archivalEdition[0]!.id]!.completed).toBe(true)
  expect(state().undo).toBeNull()
})

it('a route throw still pauses through leave; a player throw keeps the shell, tabs, Fixtures and Table', () => {
  let fail = false
  function Route() { if (fail) throw new Error('contained test failure'); return <><MomentsPage /><Probe /></> }
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const view = render(<App momentsEdition={archivalEdition} momentsPlayer={createMockMomentsPlayer} momentsRoute={<Route />} />)
  openCard(archivalEdition[0]!.id); click('Play'); emitPlaying(2)
  fail = true; view.rerender(<App momentsEdition={archivalEdition} momentsPlayer={createMockMomentsPlayer} momentsRoute={<Route />} />)
  expect(screen.getByText('This view couldn’t load.')).toBeTruthy()
  fail = false; click('Retry')
  expect(media()).toMatchObject({ status: 'paused', position: 2 })
  expect(screen.getByText('Kickoff')).toBeTruthy()
  click('Fixtures')
  expect(screen.getByRole('button', { name: 'Fixtures' }).getAttribute('aria-current')).toBe('page')
  click('Table')
  expect(screen.getByRole('button', { name: 'Table' }).getAttribute('aria-current')).toBe('page')

  error.mockClear()
  view.rerender(<App momentsEdition={archivalEdition} momentsPlayer={createMockMomentsPlayer} momentsPlayerFault momentsRoute={<><MomentsPage /><Probe /></>} />)
  expect(screen.getByRole('alert').textContent).toContain('The player could not be shown.')
  expect(screen.queryByText(/visit may be lost/)).toBeNull()
  expect(screen.getByText('Kickoff')).toBeTruthy()
  expect(document.querySelector('[data-table-picker]')).toBeTruthy()
  click('Moments')
  expect(screen.getByRole('main', { name: 'Moments' })).toBeTruthy()
  click('Fixtures')
  expect(screen.getByRole('button', { name: 'Fixtures' }).getAttribute('aria-current')).toBe('page')
  click('Table')
  expect(screen.getByRole('button', { name: 'Table' }).getAttribute('aria-current')).toBe('page')
  click('Moments')
  view.rerender(<App momentsEdition={archivalEdition} momentsPlayer={createMockMomentsPlayer} momentsPlayerFault={false} momentsRoute={<><MomentsPage /><Probe /></>} />)
  click('Retry player')
  expect(screen.queryByText('The player could not be shown.')).toBeNull()
  expect(error).toHaveBeenCalled()
})

it('StrictMode yields one player instance after one Play', () => {
  render(<StrictMode><App momentsEdition={archivalEdition} momentsPlayer={createMockMomentsPlayer}
    momentsRoute={<><MomentsPage /><Probe /></>} /></StrictMode>)
  openCard(archivalEdition[0]!.id); click('Play'); emitPlaying(0)
  expect(document.querySelectorAll('iframe')).toHaveLength(1)
  expect(player().reads.plays).toHaveLength(1)
  expect(player().reads.disposes).toBe(0)
})

it('H-B/H-E: the header shell stays 780 and empty copy is unchanged', () => {
  renderVisit()
  const shell = document.querySelector('.max-w-\\[780px\\]')
  expect(shell?.contains(document.querySelector('header'))).toBe(true)
  expect(shell?.contains(document.querySelector('nav'))).toBe(true)
  cleanup()
  render(<App momentsEdition={[]} momentsPlayer={createMockMomentsPlayer} />)
  expect(screen.getByText('No moments curated yet.')).toBeTruthy()
  expect(screen.getByText(/Hand-curated · linked to rights holders · never played here/)).toBeTruthy()
  expect(screen.queryByText('Choose the archival sample')).toBeNull()
})

it('the frame shows only on the selection it was asked to play', () => {
  renderVisit(); const [first, second] = archivalEdition
  openCard(first!.id); click('Play'); emitPlaying(3)
  const dialog = document.querySelector<HTMLElement>('[data-moments-player-dialog]')!
  const host = document.querySelector<HTMLElement>('[data-moments-player-host]')!
  expect(dialog.getAttribute('data-placement')).toBe('stage')
  expect(document.querySelector('[data-player-sentinel]')).toBeTruthy()

  click(/^Next:/)
  expect(state().active).toBe(second!.id)
  expect(media(second!.id).status).toBe('ready')
  expect(dialog.getAttribute('data-placement')).toBe('parked')
  expect(dialog.hasAttribute('inert')).toBe(true)
  expect(document.querySelector('[data-player-sentinel]')).toBeNull()
  expect(host.querySelectorAll('[data-player-return]:not([hidden]), [data-player-continue]:not([hidden])')).toHaveLength(0)
  expect(document.querySelectorAll('iframe')).toHaveLength(1)

  click('Enter Cinema')
  expect(dialog.getAttribute('data-placement')).toBe('cinema')
  expect(host.hasAttribute('inert')).toBe(true)
  const last = [...dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]')].at(-1)!
  last.focus()
  fireEvent.keyDown(last, { key: 'Tab' })
  expect(document.activeElement?.tagName).not.toBe('IFRAME')
  click('Exit Cinema')

  click(/^Previous:/)
  expect(state().active).toBe(first!.id)
  expect(dialog.getAttribute('data-placement')).toBe('stage')
  expect(document.querySelector('[data-player-sentinel]')).toBeTruthy()

  click(/^Next:/); click('Enter Cinema')
  fireEvent.click(within(dialog).getByRole('button', { name: 'Play' }))
  expect(lastPlay().itemId).toBe(second!.id)
  expect(host.hasAttribute('inert')).toBe(false)
  click('Exit Cinema')
  expect(dialog.getAttribute('data-placement')).toBe('stage')
  click(/^Previous:/)
  expect(dialog.getAttribute('data-placement')).toBe('parked')
})

it('leaving Cinema hands focus to a control that survives, and never to one that is still inert', () => {
  // jsdom lets an inert control take focus; a browser does not. Record the state at the call.
  const taken: Array<{ name: string; inert: boolean }> = []
  const focus = HTMLElement.prototype.focus
  vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(function (this: HTMLElement, options?: FocusOptions) {
    taken.push({ name: this.textContent?.trim() ?? '', inert: !!this.closest('[inert]') })
    focus.call(this, options)
  })
  const enterPlaying = () => { openCard(archivalEdition[0]!.id); click('Play'); emitPlaying(2); click('Enter Cinema'); taken.length = 0 }
  const cinema = () => screen.getByRole('dialog', { name: 'Cinema' })
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})

  // A lens change through history remounts the stage, so the stored opener is detached.
  renderVisit(); enterPlaying()
  act(() => popTo('/?tab=moments&lens=broadcast'))
  expect(state().surface).toBe('cinema')
  fireEvent.click(within(cinema()).getByRole('button', { name: 'Exit Cinema' }))
  expect(document.activeElement?.hasAttribute('data-cinema-enter')).toBe(true)
  expect(document.activeElement?.isConnected).toBe(true)
  cleanup()

  // Back leaves the tab, not Cinema: the tab that is showing takes focus.
  window.history.replaceState(null, '', '/?tab=moments')
  renderVisit(); enterPlaying()
  act(() => popTo('/?tab=table'))
  expect(document.querySelector('[inert][data-moments-background]')).toBeNull()
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Table' }))
  cleanup()

  // A route failure removes the stage and the gallery.
  window.history.replaceState(null, '', '/?tab=moments')
  let fail = false
  function Route() { if (fail) throw new Error('contained test failure'); return <><MomentsPage /><Probe /></> }
  const routed = render(<App momentsEdition={archivalEdition} momentsPlayer={createMockMomentsPlayer} momentsRoute={<Route />} />)
  enterPlaying()
  fail = true; routed.rerender(<App momentsEdition={archivalEdition} momentsPlayer={createMockMomentsPlayer} momentsRoute={<Route />} />)
  expect(screen.getByText('This view couldn’t load.')).toBeTruthy()
  expect(document.querySelector('[inert][data-moments-background]')).toBeNull()
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Moments' }))
  cleanup()

  // A player failure unmounts the host while the background is still marked.
  const faulted = renderVisit(); enterPlaying()
  faulted.rerender(<App momentsEdition={archivalEdition} momentsPlayer={createMockMomentsPlayer} momentsPlayerFault momentsRoute={<><MomentsPage /><Probe /></>} />)
  expect(screen.getByRole('alert').textContent).toContain('The player could not be shown.')
  expect(document.querySelector('[inert][data-moments-background]')).toBeNull()
  expect(document.activeElement?.hasAttribute('data-cinema-enter')).toBe(true)
  expect(document.querySelector('[data-player-sentinel]')).toBeNull()

  expect(taken.filter(call => call.inert)).toEqual([])
  expect(error).toHaveBeenCalled()
})

it('D-18: under spoiler-light the recovery names the neutral title and still ends its sentence', () => {
  renderVisit(); openCard(archivalEdition[0]!.id); click('Play')
  emitFailure({ kind: 'owner-blocked', providerError: 150 })
  fireEvent.click(screen.getByLabelText('Spoiler-light'))
  const neutral = archivalEdition[1]!.editorial!.neutralTitle!
  const stage = document.querySelector('.moments-stage-main [data-recovery-copy]')!.textContent!
  expect(stage).toContain(`Next opens “${neutral}”. The official source is also available.`)
  expect(stage).not.toContain(archivalEdition[1]!.title)
  expect(stage).not.toMatch(/\.\.|\?\.|!\.|[.?!]”\./)
  click('Enter Cinema')
  expect(within(screen.getByRole('dialog', { name: 'Cinema' })).getByText(/Next opens/).textContent).toBe(stage)
})


it.each(['selected', 'card', 'cinema'].flatMap(target => ['read-refused', 'invalid-data'].map(reason => ({ target, reason }))))('row 61: $target after $reason, refused writes and tab departure preserve the first-write notice', ({ target, reason }) => {
  const storage = referenceStorageRig(reason === 'invalid-data' ? 'broken JSON' : '["old-reference"]')
  if (reason === 'read-refused') storage.refuseRead(true)
  render(<App momentsEdition={archivalEdition} momentsPlayer={createMockMomentsPlayer} momentsStorage={storage.access}
    momentsRoute={<><MomentsPage /><Probe /></>} />)
  click('Fixtures'); click('Moments')
  const first = archivalEdition[0]!
  if (target !== 'card') openCard(first.id)
  if (target === 'cinema') click('Enter Cinema')
  const area = target === 'card' ? document.querySelector<HTMLElement>(`[data-moment-id="${first.id}"]`)!
    : target === 'cinema' ? screen.getByRole('dialog', { name: 'Cinema' }) : document.querySelector<HTMLElement>('.moments-stage-main')!
  const save = within(area).getByRole('button', { name: /Save reference/ })
  const before = storage.disk()
  storage.refuseWrite(true); fireEvent.click(save)
  expect(storage.disk()).toBe(before)
  expect(within(area).getByRole('status').textContent).not.toContain('replaces')
  storage.refuseWrite(false); fireEvent.click(save)
  expect(within(area).getByRole('status').textContent).toBe('Reference removed from this browser. This write replaces the unreadable stored set.')
  expect(area.textContent).not.toContain('Saved references could not be read.')
  fireEvent.click(save)
  expect(within(area).getByRole('status').textContent).toBe('Reference saved in this browser.')
})

it('Shift+Tab from Back to selection reaches Enter Cinema', () => {
  renderVisit(); openCard(archivalEdition[0]!.id); click('Play')
  const back = screen.getByRole('button', { name: 'Back to selection' })
  back.focus()
  fireEvent.keyDown(back, { key: 'Tab', shiftKey: true })
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Enter Cinema' }))
})

it.each(['stage', 'cinema'] as const)('player failure on %s invalidates playback and Retry waits for Play', surface => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const app = (fault = false) => <App momentsEdition={archivalEdition} momentsPlayer={createMockMomentsPlayer}
    momentsPlayerFault={fault} momentsRoute={<><MomentsPage /><Probe /></>} />
  const view = render(app())
  openCard(archivalEdition[0]!.id); click('Play'); emitPlaying(7)
  if (surface === 'cinema') click('Enter Cinema')
  const before = state()
  view.rerender(app(true))
  expect(state().surface).toBe('stage')
  expect(media()).toMatchObject({ status: 'paused', position: 7, attempt: before.media[before.active!]!.attempt + 1 })
  expect(state().history).toEqual(before.history)
  expect(state().remainder).toEqual(before.remainder)
  view.rerender(app()); click('Retry player')
  expect(document.querySelectorAll('iframe')).toHaveLength(0)
  expect(screen.queryByRole('dialog', { name: 'Cinema' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Pause' })).toBeNull()
  click('Play')
  expect(lastPlay()).toMatchObject({ position: 7, resume: true })
  expect(document.querySelectorAll('iframe')).toHaveLength(1)
  expect(error).toHaveBeenCalled()
})
