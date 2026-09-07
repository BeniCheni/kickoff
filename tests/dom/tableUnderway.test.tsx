import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { TablePage } from '../../src/components/TablePage'
import { edt, primeClock, tick } from './rig'

vi.mock('../../src/lib/fixtures', () => ({
  FIXTURES: [
    {
      id: 'laliga:getafe-celta',
      kickoffUtc: '2026-09-06T17:00:00.000Z',
      venueTz: 'Europe/Madrid',
      competition: 'laliga',
      venue: 'Home Stadium',
      home: { name: 'Getafe', sourceId: 'team-getafe' },
      away: { name: 'Celta Vigo', sourceId: 'team-celta' },
      status: 'scheduled',
      timeConfidence: 'exact',
      source: { provider: 'espn', sourceId: 'fixture-1', fetchedAt: '2026-09-06T00:00:00.000Z' },
    },
  ],
  __esModule: true,
}))

vi.mock('../../src/data/standings.json', () => ({
  default: {
    fetchedAt: '2026-09-06T00:00:00.000Z',
    provider: 'espn',
    season: 2026,
    leagues: {
      laliga: [
        {
          teamId: 'team-getafe',
          name: 'Getafe',
          shortName: 'Getafe',
          abbrev: 'GET',
          rank: 1,
          rankChange: 0,
          played: 3,
          w: 2,
          d: 1,
          l: 0,
          gf: 5,
          ga: 2,
          pts: 7,
        },
      ],
    },
  },
}))

let release: (() => void) | null = null

afterEach(() => {
  release?.()
  release = null
})

describe('TablePage — NEXT lane', () => {
  it('replaces a stale scheduled kickoff time with KICKED OFF once kickoff has passed', () => {
    release = primeClock(edt('2026-09-06T12:59:00'))
    render(<TablePage />)

    const row = screen.getByRole('button', { name: /1\. Getafe, 7 points from 3 played/ })
    fireEvent.click(row)

    const rowLabel = row.getAttribute('aria-label') ?? ''
    const wasUnderway = rowLabel.includes('in-progress league fixture')
    const beforeNextToken = screen.queryByText(/KICKOFF|🗽/)
    if (!wasUnderway) {
      expect(beforeNextToken).toBeTruthy()
    }

    tick(3 * 60 * 1000)
    expect(screen.getAllByText('KICKED OFF').length).toBeGreaterThan(0)
    expect(screen.queryByText(/🗽|KICKOFF/)).toBeNull()
  })
})
