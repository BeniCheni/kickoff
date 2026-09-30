import { StrictMode } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import App from '../../src/App'
import { MomentsPage } from '../../src/components/MomentsPage'
import { MomentsSessionBoundary, MomentsSessionProvider, useMomentsSession } from '../../src/components/MomentsSessionProvider'
import { archivalEdition, fictionalEdition } from '../fixtures/moments/gallery'
import { type MomentsQueue } from '../../src/lib/momentsQueue'
import { installMatchMedia, installSelectionScroll, popTo, primeClock, referenceStorageRig } from './rig'

let release: () => void
beforeEach(() => {
  installMatchMedia(); installSelectionScroll(); release = primeClock(new Date('2026-09-27T18:00:00Z'))
  window.history.replaceState(null, '', '/?tab=moments')
})
afterEach(() => { cleanup(); release(); vi.restoreAllMocks() })
function Probe() {
  const session = useMomentsSession()!
  return <output data-testid="visit">{JSON.stringify(session.queue)}</output>
}
const state = (): MomentsQueue => JSON.parse(screen.getByTestId('visit').textContent!)
function renderQueue() {
  return render(<MomentsSessionProvider edition={fictionalEdition}><MomentsPage /><Probe /></MomentsSessionProvider>)
}
const openCard = (id: string) => fireEvent.click(within(document.querySelector<HTMLElement>(`[data-moment-id="${id}"]`)!).getByRole('button', { name: 'Open selection' }))
const queueOrder = () => [...document.querySelectorAll('[data-queue-id]')].map(e => e.getAttribute('data-queue-id'))
const galleryOrder = () => [...document.querySelectorAll('[data-moment-id]')].map(e => e.getAttribute('data-moment-id'))
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }))
const setOrder = (value: string) => fireEvent.change(screen.getByLabelText('Browse order'), { target: { value } })

it('inert: the empty main DOM equals the pre-gallery banner and sentence with no new controls or live regions', () => {
  const { container } = render(<App momentsEdition={[]} />)
  const main = container.querySelector('main')!
  expect(main.innerHTML).toBe('<div class="rounded-[5px] border border-line border-l-3 border-l-floodlight bg-floodlight-bg px-2.5 py-2"><p class="label-caps text-[9.5px] text-floodlight-strong">Hand-curated · linked to rights holders · never played here</p></div><p class="mt-5 text-[13px] text-ink-muted">No moments curated yet.</p>')
  expect(main.querySelectorAll('button,select,input,[role="status"],[aria-live],[data-moments-gallery],iframe,video,audio')).toHaveLength(0)
  expect(document.querySelector('dialog, [data-moments-player-host], [data-moments-player-dialog], iframe, video, audio, script[data-moments-youtube-api]')).toBeNull()
  expect(screen.getByText(/v0.5.2/)).toBeTruthy()
})
it('D-02: save and unsave preserve shuffled order and Undo through the actual control', () => {
  renderQueue(); openCard('1'); click('Shuffle remaining')
  const before = state()
  const save = screen.getByRole('button', { name: 'Save reference: Fictional selection 1' })
  for (const pressed of ['true', 'false']) {
    fireEvent.click(save)
    expect(save.getAttribute('aria-pressed')).toBe(pressed)
    expect(state().remainder).toEqual(before.remainder)
    expect(state().undo).toEqual(before.undo)
    expect(state().history).toEqual(before.history)
  }
})
it('D-03: Newest sixth → Restore gives 6,1,2,3,4,5 and editorial label', () => {
  renderQueue(); setOrder('newest'); expect(galleryOrder()).toEqual(['6', '5', '4', '3', '2', '1'])
  openCard('6'); click('Restore Beni’s order')
  expect(queueOrder()).toEqual(['6', '1', '2', '3', '4', '5'])
  expect(screen.getByText('Beni’s order for the remainder')).toBeTruthy()
})
it('D-05/D-10: newest third → repeat Shuffle → Restore gives 4,1,2,3,5,6', () => {
  renderQueue(); setOrder('newest'); openCard('4'); click('Shuffle remaining')
  const first = state(); click('Shuffle remaining')
  expect(state().remainder).toEqual(first.remainder); expect(state().undo).toEqual(first.undo)
  click('Restore Beni’s order'); expect(queueOrder()).toEqual(['4', '1', '2', '3', '5', '6'])
})
it('D-10: a jump 1→5 leaves 2–4 unvisited and reorderable; Undo preserves first-open history', () => {
  renderQueue(); openCard('1'); fireEvent.click(document.querySelector('[data-queue-id="5"]')!)
  expect(state().history).toEqual(['1', '5'])
  expect(state().remainder).toEqual(['2', '3', '4', '6'])
  click('Shuffle remaining'); click(/^Next:/); const opened = state().history
  click('Undo shuffle'); expect(state().history).toEqual(opened)
  expect(state().remainder).not.toContain(state().active)
  expect(document.querySelector('[data-queue-id="2"]')?.getAttribute('data-visited')).toBe(String(opened.includes('2')))
})
it('D-08/D-12: disabled neighbours name no destination; excluded active selection remains reachable', () => {
  render(<MomentsSessionProvider edition={archivalEdition}><MomentsPage /><Probe /></MomentsSessionProvider>)
  openCard(archivalEdition[0]!.id)
  expect(screen.getByRole('button', { name: 'Previous' }).hasAttribute('disabled')).toBe(true)
  fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'prematch' } })
  expect(screen.getByRole('button', { name: 'Next' }).hasAttribute('disabled')).toBe(true)
  expect(screen.getByText('Your active selection is kept, even outside these filters.')).toBeTruthy()
  click('← Gallery'); click('Return to selection')
  expect(state().active).toBe(archivalEdition[0]!.id)
  expect(screen.getByLabelText('Selected reference')).toBeTruthy()
})
it('D-12: no-results copy makes no active-selection claim before any open', () => {
  renderQueue(); fireEvent.click(screen.getByLabelText('Saved only'))
  expect(screen.getByText('No selection is active. Clear filters to browse this edition.')).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Return to selection' })).toBeNull()
  click('Clear filters'); expect(galleryOrder()).toHaveLength(6)
})
it('D-07/D-17/D-19: actual read and write refusal and failed unsave use adjacent, single feedback; a later write clears it', () => {
  const storage = referenceStorageRig(); storage.refuseRead(true)
  render(<MomentsSessionProvider edition={archivalEdition} storage={storage.access}><MomentsPage /><Probe /></MomentsSessionProvider>)
  let save = screen.getByRole('button', { name: 'Save reference: The voices of that night.' })
  expect(save.closest('.moments-actions')!.textContent).toContain('could not be read')
  storage.refuseRead(false); storage.refuseWrite(true); fireEvent.click(save)
  expect(save.getAttribute('aria-pressed')).toBe('true')
  expect(save.textContent).toBe('Save reference')
  expect(save.getAttribute('aria-label')).toContain(save.textContent)
  expect(save.closest('.moments-actions')!.textContent).toContain('Saved for this visit only')
  expect([...document.querySelectorAll('[role="status"]')].filter(e => e.textContent)).toHaveLength(1)
  openCard(archivalEdition[1]!.id)
  expect(document.querySelector('[role="status"]')!.textContent).toBe('')
  click('← Gallery'); storage.refuseWrite(false)
  save = screen.getByRole('button', { name: 'Save reference: The voices of that night.' })
  fireEvent.click(save); expect(save.getAttribute('aria-pressed')).toBe('false')
  expect(save.closest('.moments-actions')!.textContent).not.toContain('visit only')
  fireEvent.click(save); storage.refuseWrite(true); fireEvent.click(save)
  expect(save.closest('.moments-actions')!.textContent).toContain('stored reference may return next visit')
  expect(JSON.parse(storage.disk()!)).toContain(archivalEdition[0]!.id)
  expect(state().saved).not.toContain(archivalEdition[0]!.id)
  storage.refuseWrite(false); fireEvent.click(save)
  expect(save.closest('.moments-actions')!.textContent).not.toContain('visit only')
})
it('D-11: spoiler-light hides titles, descriptions, notes, evidence and art; fixture identity remains', () => {
  const { container } = render(<MomentsSessionProvider edition={archivalEdition}><MomentsPage /></MomentsSessionProvider>)
  fireEvent.click(screen.getByLabelText('Spoiler-light'))
  for (const item of archivalEdition) {
    expect(container.textContent).not.toContain(item.title)
    expect(container.textContent).not.toContain(item.source.content!.description)
    expect(container.textContent).not.toContain(item.editorial!.note)
  }
  expect(container.querySelectorAll('[data-cover="neutral"]')).toHaveLength(3)
  expect(container.querySelector('[data-moment-id="sXAkBsEcXSo"] .moments-eyebrow')!.textContent).toBe('Selection')
  expect(screen.getByText('Liverpool v Manchester United · Premier League')).toBeTruthy()
  expect(screen.getByText(/External source pages are outside this control/)).toBeTruthy()
  openCard(archivalEdition[1]!.id)
  expect(screen.getByText('Revealing source evidence is hidden.')).toBeTruthy()
  expect(container.textContent).not.toContain('error 150')
})
it.each(['Ends.', 'Ends?', 'Ends!', 'Ends.”'])('D-18: punctuation is never appended to title %s', title => {
  const edition = fictionalEdition.map(m => ({ ...m, title }))
  render(<MomentsSessionProvider edition={edition}><MomentsPage /><Probe /></MomentsSessionProvider>)
  openCard('1'); click('Shuffle remaining'); click('Restore Beni’s order')
  expect(document.querySelector('main')!.textContent).not.toMatch(/\.\.|\?\.|!\.|”\./)
  expect(screen.getByRole('button', { name: `Next: ${title}` })).toBeTruthy()
})
it('D-13: facts, source lines and messages are string-equal through every lens', () => {
  const { container } = render(<App momentsEdition={archivalEdition} />)
  const text = () => container.querySelector('main')!.textContent
  const initial = text()
  for (const name of ['Ledger', 'Broadcast', 'Poster']) {
    fireEvent.click(screen.getByRole('radio', { name })); expect(text()).toBe(initial)
  }
})
it('visit owner survives tab/lens URL remounts, leaves exactly once, and never marks a source link watched', () => {
  render(<App momentsEdition={archivalEdition} momentsRoute={<><MomentsPage /><Probe /></>} />)
  openCard(archivalEdition[0]!.id); click('Save reference: The voices of that night.')
  const before = state(); fireEvent.click(screen.getByRole('link', { name: /Open at/ }))
  expect(Object.values(state().media).every(m => !m.completed)).toBe(true)
  click('Fixtures'); click('Moments')
  expect(state().history).toEqual(before.history); expect(state().saved).toEqual(before.saved); expect(state().active).toBe(before.active)
  expect(state().media[before.active!]!.attempt).toBe(1)
  fireEvent.click(screen.getByRole('radio', { name: 'Ledger' }))
  expect(state().media[before.active!]!.attempt).toBe(1)
  act(() => popTo('/?tab=moments&lens=broadcast&only=pl&date=2026-09-29'))
  expect(state().history).toEqual(before.history); expect(state().saved).toEqual(before.saved)
})
it('a contained route throw and Retry preserve active item, history and saved references', () => {
  let fail = false
  function Route() { if (fail) throw new Error('contained test failure'); return <><MomentsPage /><Probe /></> }
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const view = render(<App momentsEdition={fictionalEdition} momentsRoute={<Route />} />)
  openCard('5'); click('Save reference: Fictional selection 5'); const before = state()
  fail = true; view.rerender(<App momentsEdition={fictionalEdition} momentsRoute={<Route />} />)
  expect(screen.getByText('This view couldn’t load.')).toBeTruthy()
  fail = false; click('Retry')
  expect(state().history).toEqual(before.history); expect(state().active).toBe('5'); expect(state().saved).toEqual(['5'])
  expect(error).toHaveBeenCalled()
})
it('StrictMode does not duplicate history or writes; two app mounts own independent visits', () => {
  const storage = referenceStorageRig()
  const first = render(<StrictMode><App momentsEdition={fictionalEdition} momentsStorage={storage.access} /></StrictMode>)
  openCard('1'); click('Save reference: Fictional selection 1')
  expect(storage.storage.setItem).toHaveBeenCalledTimes(1)
  const second = render(<StrictMode><App momentsEdition={fictionalEdition} momentsStorage={referenceStorageRig().access} /></StrictMode>)
  expect(first.container.querySelector('[data-moments-stage-anchor]')).toBeTruthy()
  expect(second.container.querySelector('[data-moments-stage-anchor]')).toBeNull()
  expect(second.container.querySelector('[data-save="1"]')!.getAttribute('aria-pressed')).toBe('false')
  expect(first.container.querySelectorAll('[data-visited="true"]')).toHaveLength(1)
})
it('owner failure has a safe fallback that does not promise the lost visit', () => {
  let fail = true
  function OwnerFault() { if (fail) throw new Error('owner failure'); return <MomentsSessionProvider><MomentsPage /></MomentsSessionProvider> }
  vi.spyOn(console, 'error').mockImplementation(() => {})
  render(<MomentsSessionBoundary><OwnerFault /></MomentsSessionBoundary>)
  expect(screen.getByText(/Your Moments visit may be lost/)).toBeTruthy()
  fail = false; click('Retry visit'); expect(screen.getByText('No moments curated yet.')).toBeTruthy()
})
it('an owner failure never takes the shell or another tab down; only the Moments tab shows the fallback', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  // A poisoned edition makes the owner's lazy initializer throw. Fixtures is the betting
  // pipeline's Step 0 source: it and the header must render exactly as if Moments did not exist.
  window.history.replaceState(null, '', '/?tab=fixtures')
  const view = render(<App momentsEdition={null as unknown as []} />)
  expect(screen.getByText('Kickoff')).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Fixtures' }).getAttribute('aria-current')).toBe('page')
  expect(screen.queryByRole('alert')).toBeNull()
  click('Moments')
  expect(screen.getByRole('alert').textContent).toContain('Your Moments visit may be lost')
  expect(screen.getByRole('button', { name: 'Table' })).toBeTruthy()
  click('Table'); expect(screen.queryByRole('alert')).toBeNull()
  click('Moments'); expect(screen.getByRole('alert')).toBeTruthy()
  view.rerender(<App momentsEdition={[]} />)
  click('Retry visit'); expect(screen.getByText('No moments curated yet.')).toBeTruthy()
})
