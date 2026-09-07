import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { TablePage } from '../../src/components/TablePage'
import { edt, primeClock, tick } from './rig'

/**
 * The ordinary case, not the edge one: a club is mid-match *and* has its next fixture set.
 * Getafe play Celta on Monday 7 Sep at 1:00 PM EDT and Deportivo on Sunday 13 Sep. Every
 * layout — the desktop NEXT lane, the collapsed mobile row, the expanded mobile card — and
 * the row's accessible name must draw opponent and state from the same fixture.
 */
vi.mock('../../src/lib/fixtures', () => ({
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
    expect(desktop.getByText('1:00 PM EDT')).toBeTruthy()
    expect(desktop.queryByText('KICKED OFF')).toBeNull()
    expect(mobile.getByText('Mon · CEL (H)')).toBeTruthy()
    expect(screen.queryByText('Sun · DEP (H)')).toBeNull()

    // Two minutes after kickoff, snapshot still `scheduled`: the same match, now KICKED OFF —
    // never Sunday's opponent over today's marker, in either layout.
    tick(3 * 60 * 1000)
    expect(desktop.getByText('Mon · CEL (H)')).toBeTruthy()
    expect(desktop.getByText('KICKED OFF')).toBeTruthy()
    expect(desktop.queryByText('1:00 PM EDT')).toBeNull()
    expect(mobile.getByText('Mon · CEL (H)')).toBeTruthy()
    expect(screen.queryByText('Sun · DEP (H)')).toBeNull()

    // The accessible name says what the eye sees: the same opponent, the same state word.
    const label = row.getAttribute('aria-label') ?? ''
    expect(label).toMatch(/Kicked off: CEL H/)
    expect(label).not.toMatch(/in-progress|DEP/)

    // The expanded card agrees with the collapsed row above it.
    fireEvent.click(row)
    expect(row.getAttribute('aria-expanded')).toBe('true')
    const card = within(row.nextElementSibling as HTMLElement)
    expect(card.getByText(/vs Celta Vigo · Mon/)).toBeTruthy()
    expect(card.getByText('KICKED OFF')).toBeTruthy()
    expect(card.queryByText(/🗽/)).toBeNull()
    expect(card.queryByText(/Deportivo/)).toBeNull()
  })
})
