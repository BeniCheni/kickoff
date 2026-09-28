// Copied into tests/dom only in the disposable archive by pass2-reproduce.mjs.
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import App from '../../src/App'
import MainApp from '../../src/Pass2MainApp'
import { MomentCard as MainCard } from '../../src/components/Pass2MainMomentsPage'
import { MomentsPage } from '../../src/components/MomentsPage'
import { MomentsSessionBoundary, MomentsSessionProvider, useMomentsSession } from '../../src/components/MomentsSessionProvider'
import { archivalEdition, fictionalEdition } from '../fixtures/moments/gallery'
import { parseMoments } from '../../src/lib/moments'
import { installMatchMedia, installSelectionScroll, primeClock, referenceStorageRig } from './rig'

const fault = vi.hoisted(() => ({ fixtures: false, table: false, shell: false }))
vi.mock('../../src/components/FixturesPage', async original => {
  const module = await original<typeof import('../../src/components/FixturesPage')>()
  return { FixturesPage: (props: Parameters<typeof module.FixturesPage>[0]) => {
    if (fault.fixtures) throw new Error('fixture fault')
    return <module.FixturesPage {...props} />
  } }
})
vi.mock('../../src/components/TablePage', async original => {
  const module = await original<typeof import('../../src/components/TablePage')>()
  return { TablePage: () => {
    if (fault.table) throw new Error('table fault')
    return <module.TablePage />
  } }
})
vi.mock('../../src/components/LensSwitcher', async original => {
  const module = await original<typeof import('../../src/components/LensSwitcher')>()
  return { LensSwitcher: (props: Parameters<typeof module.LensSwitcher>[0]) => {
    if (fault.shell) throw new Error('shell fault')
    return <module.LensSwitcher {...props} />
  } }
})
let release: () => void
beforeEach(() => {
  installMatchMedia(); installSelectionScroll()
  release = primeClock(new Date('2026-09-27T18:00:00Z'))
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  cleanup(); release(); vi.restoreAllMocks()
  Object.assign(fault, { fixtures: false, table: false, shell: false })
})
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
function Probe() {
  const session = useMomentsSession()!
  return <>
    <output data-testid="visit">{JSON.stringify(session.queue)}</output>
    <button onClick={() => session.dispatch({ type: 'open', id: '1' })}>Probe open</button>
    <button onClick={() => session.toggleSave('1', 'probe')}>Probe save</button>
  </>
}
const state = () => JSON.parse(screen.getByTestId('visit').textContent!)

for (const lens of ['ledger', 'poster', 'broadcast']) for (const theme of ['light', 'dark']) {
  for (const tab of ['fixtures', 'table', 'moments']) {
    it(`main vs head: exact shell outerHTML, ${lens}/${theme}/${tab}`, () => {
      window.history.replaceState(null, '', `/?tab=${tab}&lens=${lens}`)
      localStorage.setItem('kickoff-theme', theme); localStorage.setItem('kickoff-theme-broadcast', theme)
      const baseline = render(<MainApp />)
      const html = baseline.container.firstElementChild!.outerHTML
      baseline.unmount()
      const head = render(<App />)
      expect(head.container.firstElementChild!.outerHTML).toBe(html)
    })
  }
  for (const tab of ['fixtures', 'table'] as const) {
    it(`main vs head: exact route-error shell outerHTML, ${lens}/${theme}/${tab}`, () => {
      window.history.replaceState(null, '', `/?tab=${tab}&lens=${lens}`)
      localStorage.setItem('kickoff-theme', theme); localStorage.setItem('kickoff-theme-broadcast', theme)
      fault[tab] = true
      const baseline = render(<MainApp />)
      const html = baseline.container.firstElementChild!.outerHTML
      expect(baseline.container.querySelector('[role="alert"]')).toBeTruthy()
      baseline.unmount()
      const head = render(<App />)
      expect(head.container.firstElementChild!.outerHTML).toBe(html)
      expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull()
    })
  }
}

it('a shell error empties the root for both main and head', () => {
  for (const Component of [MainApp, App]) {
    const view = render(<Component />)
    fault.shell = true
    expect(() => view.rerender(<Component />)).toThrow('shell fault')
    expect(view.container.innerHTML).toBe('')
    fault.shell = false; view.unmount()
  }
})

it.each([false, true])('owner loss then Retry visit rebuilds only disk state; refused write = %s', refuseWrite => {
  const storage = referenceStorageRig(); storage.refuseWrite(refuseWrite)
  let fail = false
  function Bomb() { if (fail) throw new Error('owner subtree fault'); return null }
  const tree = () => <MomentsSessionBoundary><MomentsSessionProvider edition={fictionalEdition} storage={storage.access}>
    <Probe /><Bomb />
  </MomentsSessionProvider></MomentsSessionBoundary>
  const view = render(tree())
  click('Probe open'); click('Probe save')
  expect(state().active).toBe('1'); expect(state().saved).toEqual(['1'])
  fail = true; view.rerender(tree())
  expect(screen.getByRole('alert').textContent).toContain('Your Moments visit may be lost')
  fail = false; click('Retry visit')
  expect(state().active).toBeNull(); expect(state().history).toEqual([])
  expect(state().saved).toEqual(refuseWrite ? [] : ['1'])
  expect(storage.storage.getItem).toHaveBeenCalledTimes(2)
})

it.each(['postponed', 'cancelled'] as const)('row 59: valid %s curation renders the dead Brooklyn date in main and head', status => {
  const seed = archivalEdition[0]!
  const [moment] = parseMoments([{ ...seed, category: 'prematch', fixture: { ...seed.fixture, status } }], [])
  expect(moment!.fixture.status).toBe(status)
  const baseline = render(<MainCard moment={moment!} />)
  const date = screen.getByText(/Brooklyn date/).textContent
  expect(screen.getByText('Kickoff time not confirmed at curation')).toBeTruthy()
  baseline.unmount()
  render(<MomentsSessionProvider edition={[moment!]}><MomentsPage /></MomentsSessionProvider>)
  expect(screen.getByText(/Brooklyn date/).textContent).toBe(date)
  expect(screen.getByText('Kickoff time not confirmed at curation')).toBeTruthy()
})

it('row 60: the same pool and history shuffle identically across independent visits and repeated presses', () => {
  const orders: string[][] = []
  for (let visit = 0; visit < 2; visit++) {
    const view = render(<MomentsSessionProvider edition={fictionalEdition}><MomentsPage /><Probe /></MomentsSessionProvider>)
    click('Probe open'); click('Shuffle remaining')
    orders.push(state().remainder)
    click('Shuffle remaining'); expect(state().remainder).toEqual(orders[visit])
    view.unmount()
  }
  expect(orders[1]).toEqual(orders[0])
})

it.each(['read-refused', 'invalid-data'])('row 61: %s followed by write replaces the unreadable stored set', reason => {
  let value = reason === 'invalid-data' ? 'broken JSON' : '["old-reference"]'
  const storage = { getItem: () => { if (reason === 'read-refused') throw new Error('read refused'); return value },
    setItem: (_key: string, next: string) => { value = next } }
  render(<MomentsSessionProvider edition={fictionalEdition} storage={() => storage}><Probe /></MomentsSessionProvider>)
  expect(state().saved).toEqual([])
  click('Probe save')
  expect(value).toBe('["1"]'); expect(state().saved).toEqual(['1'])
})
