import { describe, expect, it } from 'vitest'
import { sortForDisplay } from '../src/lib/fixtures'
import { competitionRank, type CompetitionKey } from '../src/lib/competitions'
import type { Fixture } from '../src/lib/schema'
import { edgeFixture } from './fixtures/edgeFixtures'

/**
 * Group, then kickoff, and a tie keeps the input order. Names, competition keys and
 * venues must not break it. The UEFA Super Cup's group is europe, so it sorts with the
 * cups, not with the domestic supercups.
 */
function row(
  id: string,
  competition: CompetitionKey,
  kickoffUtc: string,
  name: string,
  venue: string,
): Fixture {
  return edgeFixture({
    id,
    competition,
    kickoffUtc,
    venue,
    home: { name, sourceId: id },
    away: { name: 'Away', sourceId: `${id}-away` },
  })
}

const EARLY = '2026-11-21T12:00:00.000Z'
const LATER = '2026-11-21T18:00:00.000Z'
const LATEST = '2026-11-21T20:00:00.000Z'

describe('sortForDisplay', () => {
  it('orders supercups, then European cups, then domestic leagues, and keeps ties in input order', () => {
    expect(competitionRank('shield')).toBeLessThan(competitionRank('supercup'))
    expect(competitionRank('supercup')).toBe(competitionRank('ucl'))
    expect(competitionRank('ucl')).toBe(competitionRank('uel'))
    expect(competitionRank('ucl')).toBeLessThan(competitionRank('pl'))

    // Deliberately not the display order. "Alpha" is after "Zebra" in the input wherever
    // the group and the kickoff tie, and an alphabetically earlier venue sits on the later row.
    const input = [
      row('pl-late', 'pl', LATER, 'Middle', 'Zurich'),
      row('ucl-late', 'ucl', LATEST, 'Late Europe', 'Zurich'),
      row('shield', 'shield', LATEST, 'Community', 'Zurich'),
      row('supercup-early', 'supercup', EARLY, 'Zebra Cup', 'Zurich'),
      row('uel-early', 'uel', EARLY, 'Alpha Cup', 'Amsterdam'),
      row('pl-early', 'pl', EARLY, 'Zebra', 'Zurich'),
      row('seriea-early', 'seriea', EARLY, 'Alpha', 'Amsterdam'),
    ]
    const sorted = sortForDisplay([...input])

    expect(sorted.map((fixture) => fixture.id)).toEqual([
      'shield',
      'supercup-early',
      'uel-early',
      'ucl-late',
      'pl-early',
      'seriea-early',
      'pl-late',
    ])
    expect(input.map((fixture) => fixture.id)).not.toEqual(sorted.map((fixture) => fixture.id))
  })

  it('keeps a tie in whatever order it arrived, for every arrival order', () => {
    // One group, one instant, and every other field different. A tie-break on any field,
    // in either direction, settles on one order, so it cannot agree with all six.
    const tied = [
      row('b-ucl', 'ucl', EARLY, 'Zebra', 'Madrid'),
      row('c-uel', 'uel', EARLY, 'Alpha', 'Zurich'),
      row('a-uecl', 'uecl', EARLY, 'Middle', 'Amsterdam'),
    ]
    for (const order of [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]) {
      const arrived = order.map((index) => tied[index]!.id)
      const input = order.map((index) => tied[index]!)
      expect(sortForDisplay(input).map((fixture) => fixture.id)).toEqual(arrived)
    }
  })
})
