import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, within } from '@testing-library/react'
import { LEAGUE_TABLES, type CompetitionKey } from '../../src/lib/competitions'
import { META } from '../../src/lib/fixtures'
import { STANDINGS, tableFor, type TableRow } from '../../src/lib/standings'
import { todayIso } from '../../src/lib/time'
import { TablePage } from '../../src/components/TablePage'
import { primeClock } from './rig'
import { holdSnapshot, specimenTable, withoutUclTable } from './tableSnapshots'

/**
 * The desktop table's head. Fifteen columns; six of them sort and each of those is a button;
 * W, D and L sort nothing and are text. A sort re-orders the snapshot's own figures and
 * computes none, and the Pos column keeps the league position while it does.
 */
let release: (() => void) | undefined
let restore: (() => void) | undefined
afterEach(() => { cleanup(); release?.(); release = undefined; restore?.(); restore = undefined })

function mount(league: CompetitionKey) {
  window.history.replaceState(null, '', `/?league=${league}`)
  const now = new Date(META.lastSyncAt)
  release = primeClock(now)
  const rows = tableFor(league, todayIso(now), now.toISOString())
  const { container } = render(<TablePage />)
  const desktop = container.querySelector('[data-table="desktop"]') as HTMLElement
  return { container, desktop, rows, head: desktop.querySelector(':scope > .sticky') as HTMLElement }
}
/** The clubs of the desktop table, top to bottom, by the id each row carries. */
const order = (desktop: HTMLElement) => [...desktop.querySelectorAll('[data-table-row]')].map((row) => row.getAttribute('data-table-row'))
/** What the app's sort is owed: the figure, best first, and league position between equals. */
const ranked = (rows: TableRow[], figure: (row: TableRow) => number) => [...rows].sort((a, b) => figure(b) - figure(a) || a.rank - b.rank).map((row) => row.teamId)

describe('the desktop table’s head', () => {
  it('has fifteen columns, and every row under it has the same fifteen', () => {
    const { desktop, head } = mount('pl')
    expect([...head.children].map((cell) => cell.textContent)).toEqual(['', 'Pos', '', 'Club', 'Pl', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts', 'PPG', 'Form →', 'Next'])
    const rows = [...desktop.querySelectorAll('[data-table-row] > .register-row')]
    expect(rows).toHaveLength(20)
    for (const row of rows) expect(row.children).toHaveLength(15)
    // One grid template for the head and the rows, so a column cannot drift from its label.
    const template = [...head.classList].find((name) => name.startsWith('grid-cols-'))
    expect(template?.match(/_/g)).toHaveLength(14)
    for (const row of rows) expect(row.classList.contains(template!)).toBe(true)
  })

  it('makes a button of each column that sorts, and text of W, D and L', () => {
    const { head } = mount('pl')
    const buttons = within(head).getAllByRole('button')
    expect(buttons.map((button) => button.textContent)).toEqual(['Pl', 'GF', 'GA', 'GD', 'Pts', 'PPG'])
    for (const button of buttons) expect(button.getAttribute('type')).toBe('button')
    for (const label of ['W', 'D', 'L']) {
      const cell = [...head.children].find((child) => child.textContent === label)!
      expect(cell.tagName, label).toBe('DIV')
      expect(cell.getAttribute('role'), label).toBeNull()
      expect(cell.getAttribute('tabindex'), label).toBeNull()
    }
    // No control in the table does nothing: every button in the head changes what is sorted.
    for (const button of buttons) {
      fireEvent.click(button)
      expect(within(head).getAllByRole('button').filter((each) => each.hasAttribute('data-sorted')).map((each) => each.textContent)).toEqual([button.textContent])
    }
  })

  // The long table is a specimen of 36: a snapshot without a Champions League table is a valid
  // one (the review of PR #352, finding 2), and this is a claim about the rows, not the provider.
  it.each(['pl', 'ucl'] as const)('holds no control in a desktop row (%s)', (league) => {
    restore = holdSnapshot()
    if (league === 'ucl') STANDINGS.leagues.ucl = specimenTable('ucl')
    const { desktop } = mount(league)
    expect(desktop.querySelectorAll('[data-table-row]')).toHaveLength(league === 'ucl' ? 36 : 20)
    expect(desktop.querySelector('[data-table-row] button, [data-table-row] a, [data-table-row] [tabindex]')).toBeNull()
  })

  it('draws no desktop table, and so no head, where the provider no longer supplies one', () => {
    restore = holdSnapshot()
    withoutUclTable()
    window.history.replaceState(null, '', '/?league=ucl')
    release = primeClock(new Date(META.lastSyncAt))
    const { container } = render(<TablePage />)
    expect(container.querySelector('[data-table], button.register-sort')).toBeNull()
    expect(container.querySelector('[data-empty-table]')).not.toBeNull()
  })
})

describe('the desktop sort', () => {
  it('starts in league order, marked on Pts, with every zone header in place', () => {
    const { desktop, head, rows } = mount('pl')
    expect(order(desktop)).toEqual(rows.map((row) => row.teamId))
    expect(head.querySelector('[data-sorted]')!.textContent).toBe('Pts')
    expect(desktop.querySelector('[data-sorted-note]')).toBeNull()
    expect([...desktop.querySelectorAll('[data-zone-divider]')].map((divider) => divider.getAttribute('data-zone-divider'))).toEqual(LEAGUE_TABLES.pl!.zones.map((zone) => zone.name))
  })

  it.each([
    ['Pl', 'matches played', (row: TableRow) => row.played],
    ['GF', 'goals for', (row: TableRow) => row.gf],
    ['GA', 'goals against', (row: TableRow) => -row.ga],
    ['GD', 'goal difference', (row: TableRow) => row.gd],
    ['PPG', 'points per game', (row: TableRow) => (row.played ? row.pts / row.played : -1)],
  ] as const)('by %s re-orders the snapshot’s own figures and says so', (label, words, figure) => {
    const { desktop, head, rows } = mount('pl')
    fireEvent.click(within(head).getByRole('button', { name: label }))
    expect(order(desktop)).toEqual(ranked(rows, figure))
    expect(desktop.querySelector('[data-sorted-note]')!.textContent).toBe(`Sorted by ${words}. The Pos column still shows league position, and zone bands are hidden because they only describe the canonical order.`)
    // The Pos column is the league's, whatever the order: each row still shows its own rank.
    const byId = new Map(rows.map((row) => [row.teamId, row]))
    for (const row of desktop.querySelectorAll('[data-table-row]')) {
      const club = byId.get(row.getAttribute('data-table-row')!)!
      expect(row.querySelector('.register-pos span')!.textContent).toBe(String(club.rank))
      // And each figure is the snapshot's, not one the sort worked out.
      expect([...row.querySelectorAll('.register-num')].map((cell) => cell.textContent)).toEqual([
        String(club.played), String(club.w), String(club.d), String(club.l), String(club.gf), String(club.ga),
        club.gd > 0 ? `+${club.gd}` : String(club.gd), String(club.pts), club.ppg,
      ])
    }
    // Zone bands describe league order alone, so they and their headers are off the table.
    expect(desktop.querySelector('[data-zone-divider]')).toBeNull()
    expect([...desktop.querySelectorAll('[data-table-row] .zone-mark-band')].every((mark) => mark.getAttribute('data-band') === null)).toBe(true)
  })

  it('returns to league order on Pts, and a league tab resets it', () => {
    const { container, desktop, head, rows } = mount('pl')
    fireEvent.click(within(head).getByRole('button', { name: 'GD' }))
    fireEvent.click(within(head).getByRole('button', { name: 'Pts' }))
    expect(order(desktop)).toEqual(rows.map((row) => row.teamId))
    expect(desktop.querySelector('[data-sorted-note]')).toBeNull()

    fireEvent.click(within(head).getByRole('button', { name: 'GF' }))
    fireEvent.click(within(container.querySelector('[data-table-picker]') as HTMLElement).getByRole('button', { name: 'Serie A' }))
    const next = container.querySelector('[data-table="desktop"]') as HTMLElement
    expect(next.querySelector(':scope > .sticky [data-sorted]')!.textContent).toBe('Pts')
    expect(next.querySelector('[data-sorted-note]')).toBeNull()
  })

  it('leaves the phone table in league order with its zones, since the sort is the desktop’s', () => {
    const { container, head, rows } = mount('pl')
    fireEvent.click(within(head).getByRole('button', { name: 'GA' }))
    const phone = container.querySelector('[data-table="mobile"]') as HTMLElement
    expect(order(phone)).toEqual(rows.map((row) => row.teamId))
    expect(phone.querySelectorAll('[data-zone-divider]')).toHaveLength(LEAGUE_TABLES.pl!.zones.length)
    expect(phone.querySelector('button.register-sort')).toBeNull()
  })
})
