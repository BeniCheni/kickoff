import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { TablePage } from '../../src/components/TablePage'
import { STANDINGS } from '../../src/lib/standings'
import { TABLE_LEAGUES, LEAGUE_TABLES } from '../../src/lib/competitions'
import { META } from '../../src/lib/fixtures'
import { primeClock } from './rig'
import { normalizeStandingEntry } from '../../scripts/providers/espn-standings'
import recorded from '../fixtures/espn/ucl-standings.json'
const original = structuredClone(STANDINGS)
const degraded = META.standingsDegraded
let release: (() => void) | undefined
// The publication gate must also pass when the live provider has degraded UCL out
// of the snapshot. Exercise the populated layout with recorded league-phase rows.
beforeEach(() => {
  STANDINGS.leagues.ucl = recorded.children[0]!.standings.entries.map(entry => normalizeStandingEntry(entry)!)
  META.standingsDegraded = []
})
afterEach(() => { cleanup(); release?.(); release = undefined; Object.assign(STANDINGS, structuredClone(original)); META.standingsDegraded = degraded })
function mount(league = 'ucl') {
  window.history.replaceState(null, '', `/?league=${league}`)
  release = primeClock(new Date('2026-09-10T12:00:00Z'))
  return render(<TablePage />)
}
describe('the league-phase table extends the domestic language', () => {
  it('groups 8, 16 and 12 rows under first-child dividers, with only the deep bands sticky', () => {
    const { container } = mount()
    const tables = container.querySelectorAll('[data-table]')
    expect(tables).toHaveLength(2)
    for (const table of tables) {
      const groups = [...table.querySelectorAll('[data-zone-band]')]
      expect(groups).toHaveLength(3)
      expect(groups.map(g => g.querySelectorAll('[data-table-row]').length)).toEqual([8, 16, 12])
      for (const [i, group] of groups.entries()) {
        expect(group.firstElementChild?.hasAttribute('data-zone-divider')).toBe(true)
        expect(group.firstElementChild?.classList.contains('sticky')).toBe(i > 0)
        expect(group.firstElementChild?.textContent).toContain(['1–8', '9–24', '25–36'][i])
      }
    }
    expect(screen.getByText(/As of matchday .* of 8 · league phase/)).toBeTruthy()
  })
  it.each(TABLE_LEAGUES.filter(k => k !== 'ucl'))('%s retains nonsticky domestic bands', league => {
    const { container } = mount(league)
    const dividers = container.querySelectorAll('[data-zone-divider]')
    expect(dividers).toHaveLength(LEAGUE_TABLES[league]!.zones.length * 2)
    for (const divider of dividers) expect(divider.classList.contains('sticky')).toBe(false)
  })
  it('states the mid-matchday games-in-hand fact without recommending equivalent schedules', () => {
    STANDINGS.leagues.ucl = STANDINGS.leagues.ucl!.map((r, i) => ({ ...r, played: i < 12 ? 1 : 0 }))
    mount()
    expect(screen.getByText('24 clubs have played fewer matches.')).toBeTruthy()
    expect(screen.queryByText(/compare like with like/)).toBeNull()
  })
  it('sorts without zone bands on desktop while mobile stays canonical', () => {
    const { container } = mount()
    fireEvent.click(screen.getByRole('button', { name: 'PPG' }))
    expect(container.querySelector('[data-table="desktop"]')!.querySelectorAll('[data-zone-divider]')).toHaveLength(0)
    expect(container.querySelector('[data-table="mobile"]')!.querySelectorAll('[data-zone-divider]')).toHaveLength(3)
  })
  it('admits a degraded phase and keeps the picker available to return to domestic tables', () => {
    delete STANDINGS.leagues.ucl
    META.standingsDegraded = ['ucl']
    mount()
    expect(screen.getByText(/provider no longer supplies the configured league-phase table/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Premier League/ }))
    expect(screen.getByText(/As of matchday .* of 38/)).toBeTruthy()
  })
})
