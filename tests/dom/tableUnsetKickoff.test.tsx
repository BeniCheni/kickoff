import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { TablePage } from '../../src/components/TablePage'
import { primeClock } from './rig'

/**
 * A club whose next fixture has no league-set time. The mobile sentence and the desktop
 * "time TBC" are the cell; the colour is not part of the rule (PR 4 sets the amber).
 */
vi.mock('../../src/lib/fixtures', async (importOriginal) => ({
  ...await importOriginal<typeof import('../../src/lib/fixtures')>(),
  FIXTURES: [
    {
      id: 'laliga:unset',
      kickoffUtc: '2026-12-06T20:00:00.000Z',
      venueTz: 'Europe/Madrid',
      competition: 'laliga',
      venue: 'Specimen Ground',
      home: { name: 'Specimen Club', sourceId: 'team-specimen' },
      away: { name: 'Away Club', sourceId: 'team-away' },
      status: 'scheduled',
      timeConfidence: 'tbd',
      source: { provider: 'espn', sourceId: 'fixture-unset', fetchedAt: '2026-12-01T00:00:00.000Z' },
    },
  ],
  __esModule: true,
}))

vi.mock('../../src/data/standings.json', () => ({
  default: {
    fetchedAt: '2026-12-01T00:00:00.000Z',
    provider: 'espn',
    season: 2026,
    leagues: {
      laliga: [
        {
          teamId: 'team-specimen',
          name: 'Specimen Club',
          shortName: 'Specimen',
          abbrev: 'SPC',
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

const CLOCK = /\d{1,2}:\d{2}/
let release: (() => void) | null = null

afterEach(() => {
  release?.()
  release = null
})

describe('Table next-fixture cell when the league has not set the kickoff', () => {
  it('shows the not-set words and no clock in either layout', () => {
    release = primeClock(new Date('2026-12-01T15:00:00.000Z'))
    render(<TablePage />)

    const desktop = holding('desktop', 'time TBC')
    expect(desktop.textContent ?? '').not.toMatch(CLOCK)

    const row = screen.getByRole('button', { name: /Specimen Club/ })
    expect(row.textContent ?? '').not.toMatch(CLOCK)
    fireEvent.click(row)
    const mobile = holding('mobile', /kickoff time not yet set/)
    expect(mobile.textContent ?? '').not.toMatch(CLOCK)
  })
})

/**
 * The club's whole row or card in one layout: the smallest element that holds both the
 * not-set words and the club's name. A clock anywhere in it is a clock for that fixture,
 * whether it sits inside the words' own element or beside it.
 */
function holding(layout: 'desktop' | 'mobile', words: string | RegExp): HTMLElement {
  const root = document.querySelector(`[data-table="${layout}"]`) as HTMLElement
  let element = within(root).getByText(words)
  while (element !== root && !(element.textContent ?? '').includes('Specimen Club')) {
    element = element.parentElement!
  }
  return element
}
