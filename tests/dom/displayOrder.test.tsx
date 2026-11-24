import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import { WeekView } from '../../src/components/WeekView'
import { COMPETITION_KEYS, competitionRank } from '../../src/lib/competitions'
import { FIXTURES } from '../../src/lib/fixtures'
import type { Fixture } from '../../src/lib/schema'
import { brooklynDate, startOfWeek } from '../../src/lib/time'

/**
 * One synthetic Saturday, in a file order that is not the display order. The committed
 * snapshot is not the subject: on 15 Nov 2026 it held two days with more than one
 * competition group, and each leaves the rolling window with a sync.
 */
const DATE = '2026-11-21'
vi.mock('../../src/data/fixtures.json', () => {
  const row = (id: string, competition: string, hour: number, home: string) => ({
    id: `synthetic:${id}`,
    competition,
    kickoffUtc: `2026-11-21T${hour}:00:00.000Z`,
    venue: `${home} Ground`,
    venueTz: 'Europe/Madrid',
    home: { name: home, sourceId: `${id}-home` },
    away: { name: `${home} Visitors`, sourceId: `${id}-away` },
    status: 'scheduled',
    timeConfidence: 'exact',
    source: { provider: 'espn', sourceId: id, fetchedAt: '2026-11-15T00:00:00.000Z' },
  })
  return {
    default: [
      row('f-league-late', 'pl', 20, 'Late League'),
      // The tie: same group, same instant. File order is Zebra then Alpha, against the
      // name, the competition key, the venue and the id.
      row('e-tie-first', 'uel', 18, 'Zebra'),
      row('d-supercup', 'supercopa', 20, 'Trophy'),
      { ...row('c-tie-second', 'ucl', 18, 'Alpha'), status: 'postponed' },
      row('b-league-early', 'laliga', 12, 'Early League'),
      row('a-europe-early', 'uecl', 12, 'Early Europe'),
    ],
  }
})

const active = new Set(COMPETITION_KEYS)

/** The rule, computed here rather than by calling sortForDisplay, so a lens that
 *  reorders rows fails even when the helper itself is right. Sort is stable. */
function expectedOrder(date: string): Fixture[] {
  return FIXTURES.filter((fixture) => brooklynDate(fixture.kickoffUtc) === date).sort(
    (a, b) =>
      competitionRank(a.competition) - competitionRank(b.competition) ||
      a.kickoffUtc.localeCompare(b.kickoffUtc),
  )
}

function pairing(fixture: Fixture): string {
  return `${fixture.home.name} v ${fixture.away.name}`
}

/** Longest contained pairing wins, so "Arsenal vs Chelsea" does not claim "Arsenal vs Chelsea B". */
function renderedIds(section: HTMLElement, expected: Fixture[]): string[] {
  const remaining = [...expected]
  const found: string[] = []
  for (const row of section.querySelectorAll('[data-fixture-id]')) {
    const text = row.textContent ?? ''
    const hits = remaining.filter((fixture) => text.includes(pairing(fixture)))
    hits.sort((a, b) => pairing(b).length - pairing(a).length)
    const hit = hits[0]
    if (!hit) continue
    found.push(hit.id)
    remaining.splice(remaining.indexOf(hit), 1)
  }
  return found
}

describe('a day renders in display order in both lenses', () => {
  it('keeps group, then kickoff, then file order, in Poster and Ledger', () => {
    const expected = expectedOrder(DATE)
    expect(expected.map((fixture) => fixture.id)).toEqual([
      'synthetic:d-supercup',
      'synthetic:a-europe-early',
      'synthetic:e-tie-first',
      'synthetic:c-tie-second',
      'synthetic:b-league-early',
      'synthetic:f-league-late',
    ])

    for (const lens of ['poster', 'ledger'] as const) {
      const view = render(
        <WeekView weekStart={startOfWeek(DATE)} active={active} today="2026-01-01" lens={lens} />,
      )
      const section = view.container.querySelector<HTMLElement>(`section[data-week-date="${DATE}"]`)
      expect(section, `${lens} section for ${DATE}`).toBeTruthy()
      if (lens === 'poster') fireEvent.click(view.getByRole('button', { name: /More stories/ }))
      expect(renderedIds(section!, expected)).toEqual(expected.map((fixture) => fixture.id))
      expect(section!.querySelector('[data-fixture-id="synthetic:c-tie-second"]')!.textContent).not.toMatch(/\d:\d\d|local/)
      view.unmount()
    }
  })
})
