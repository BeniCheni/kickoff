import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { TablePage } from '../../src/components/TablePage'
import { edt, primeClock, tick } from './rig'

/**
 * The ordinary case, not the edge one: a club is mid-match *and* has its next fixture set.
 * Getafe play Celta on Monday 7 Sep at 1:00 PM EDT and Deportivo on Sunday 13 Sep. Every
 * layout — the desktop NEXT lane, the phone row closed and the phone row opened — and the
 * row's accessible name must draw opponent and state from the same fixture. The cell prints
 * the Brooklyn clock and the stadium's 24-hour clock from that one instant, and no zone
 * abbreviation; once the match has kicked off it prints neither clock.
 */
vi.mock('../../src/lib/fixtures', async (importOriginal) => ({
  ...await importOriginal<typeof import('../../src/lib/fixtures')>(),
  FIXTURES: [
    {
      id: 'laliga:getafe-celta',
      kickoffUtc: '2026-09-07T17:00:00.000Z',
      venueTz: 'Europe/Madrid',
      competition: 'laliga',
      venue: 'Home Stadium',
      home: { name: 'Getafe', sourceId: 'team-getafe' },
      away: { name: 'Celta Vigo', sourceId: 'team-celta' },
      status: 'scheduled',
      timeConfidence: 'exact',
      source: { provider: 'espn', sourceId: 'fixture-1', fetchedAt: '2026-09-06T00:00:00.000Z' },
    },
    {
      id: 'laliga:getafe-deportivo',
      kickoffUtc: '2026-09-13T16:30:00.000Z',
      venueTz: 'Europe/Madrid',
      competition: 'laliga',
      venue: 'Home Stadium',
      home: { name: 'Getafe', sourceId: 'team-getafe' },
      away: { name: 'Deportivo La Coruña', sourceId: 'team-deportivo' },
      status: 'scheduled',
      timeConfidence: 'exact',
      source: { provider: 'espn', sourceId: 'fixture-2', fetchedAt: '2026-09-06T00:00:00.000Z' },
    },
  ],
  __esModule: true,
}))

vi.mock('../../src/data/standings.json', () => {
  const base = { rankChange: 0, played: 3, w: 2, d: 1, l: 0, gf: 5, ga: 2, pts: 7 }
  return {
    default: {
      fetchedAt: '2026-09-06T00:00:00.000Z',
      provider: 'espn',
      season: 2026,
      leagues: {
        laliga: [
          { teamId: 'team-getafe', name: 'Getafe', shortName: 'Getafe', abbrev: 'GET', rank: 1, ...base },
          { teamId: 'team-celta', name: 'Celta Vigo', shortName: 'Celta', abbrev: 'CEL', rank: 2, ...base },
          { teamId: 'team-deportivo', name: 'Deportivo La Coruña', shortName: 'Deportivo', abbrev: 'DEP', rank: 3, ...base },
        ],
      },
    },
  }
})

const CLOCK = /\d{1,2}:\d{2}/
let release: (() => void) | null = null

afterEach(() => {
  release?.()
  release = null
})

/** The desktop row for a club: the name cell that is not inside the mobile `<button>`, then its
 *  grid. Captured once — React keeps the element across re-renders — so it can be read after the
 *  expanded card adds a second non-button "Getafe" to the document. */
function desktopRowOf(club: string): HTMLElement {
  const name = screen.getAllByText(club).find((el) => !el.closest('button'))!
  return name.closest('div.grid') as HTMLElement
}

describe('TablePage — NEXT lane', () => {
  it('shows the kicked-off fixture, not the following one, in every layout once kickoff has passed', () => {
    release = primeClock(edt('2026-09-07T12:59:00'))
    render(<TablePage />)
    const row = screen.getByRole('button', { name: /1\. Getafe, 7 points from 3 played/ })
    const mobile = within(row)
    const desktop = within(desktopRowOf('Getafe'))

    // One minute before kickoff: Celta is next in the desktop lane and the collapsed row, at its time.
    expect(row.getAttribute('aria-label')).toContain('Next match: CEL H')
    expect(desktop.getByText('Mon · CEL (H)')).toBeTruthy()
    expect(desktop.getByText('1:00 PM')).toBeTruthy()
    expect(desktop.getByText('19:00 local')).toBeTruthy()
    expect(desktop.queryByText('KICKED OFF')).toBeNull()
    expect(mobile.getByText('Mon · CEL (H)')).toBeTruthy()
    expect(mobile.getByText('1:00 PM')).toBeTruthy()
    expect(mobile.getByText('19:00 local')).toBeTruthy()
    expect(screen.queryByText('Sun · DEP (H)')).toBeNull()
    // "Brooklyn · ET" is the band's; a Table cell carries no zone abbreviation and no offset.
    for (const cell of document.querySelectorAll('[data-next-cell]')) expect(cell.textContent).not.toMatch(/E[SD]T|UTC|GMT|CES?T|[+-]\d{1,2}(:\d{2})?\b/)

    // Two minutes after kickoff, snapshot still `scheduled`: the same match, now KICKED OFF —
    // never Sunday's opponent over today's marker, in either layout.
    tick(3 * 60 * 1000)
    expect(desktop.getByText('Mon · CEL (H)')).toBeTruthy()
    expect(desktop.getByText('KICKED OFF')).toBeTruthy()
    expect(desktop.queryByText('1:00 PM')).toBeNull()
    expect(mobile.getByText('Mon · CEL (H)')).toBeTruthy()
    expect(mobile.getByText('KICKED OFF')).toBeTruthy()
    expect(screen.queryByText('Sun · DEP (H)')).toBeNull()
    // KICKED OFF stands alone: no clock and no score, in either layout.
    const kicked = [...document.querySelectorAll('[data-next-cell="kicked-off"]')].filter((cell) => cell.textContent?.includes('CEL'))
    expect(kicked).toHaveLength(2)
    for (const cell of kicked) expect(cell.textContent).toBe('Mon · CEL (H)KICKED OFF')

    // The accessible name says what the eye sees: the same opponent, the same state word.
    const label = row.getAttribute('aria-label') ?? ''
    expect(label).toMatch(/Kicked off: CEL H/)
    expect(label).not.toMatch(/in-progress|DEP/)

    // The opened row agrees with the closed one: it adds W-D-L and PPG under the same cell,
    // and brings no second fixture, no clock and no emoji with it.
    expect(row.querySelector('[data-row-more]')).toBeNull()
    fireEvent.click(row)
    expect(row.getAttribute('aria-expanded')).toBe('true')
    expect(mobile.getByText('Mon · CEL (H)')).toBeTruthy()
    expect(mobile.getByText('KICKED OFF')).toBeTruthy()
    expect(row.querySelector('[data-row-more]')!.textContent).toBe('W-D-L 2-1-0PPG 2.33')
    expect(row.textContent).not.toMatch(CLOCK)
    expect(row.textContent).not.toMatch(/🗽|DEP|Deportivo/)
  })
})
