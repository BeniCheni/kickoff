import { describe, it, expect } from 'vitest'
import { diffFixtures, hasUrgentChanges } from '../scripts/diff'
import type { Fixture } from '../src/lib/schema'

/**
 * Every case here is a real defect found in the hand-maintained prototype on 21 Aug 2026.
 * The diff engine exists so that none of them can ever again go unnoticed between syncs.
 */

const NOW = new Date('2026-08-21T12:00:00.000Z')

function fx(over: Partial<Fixture> & { id: string }): Fixture {
  return {
    competition: 'ligue1',
    kickoffUtc: '2026-08-21T18:45:00.000Z',
    venueTz: 'Europe/Paris',
    home: { name: 'Home' },
    away: { name: 'Away' },
    status: 'scheduled',
    timeConfidence: 'exact',
    source: { provider: 'espn', sourceId: 'x', fetchedAt: NOW.toISOString() },
    ...over,
  }
}

describe('bug class 1 — a whole matchday shifted a day', () => {
  it('reports DATE_MOVED and marks it urgent', () => {
    const before = [fx({ id: 'a', kickoffUtc: '2026-08-20T18:45:00.000Z' })]
    const after = [fx({ id: 'a', kickoffUtc: '2026-08-21T18:45:00.000Z' })]
    const [c] = diffFixtures(before, after, { now: NOW })
    expect(c!.kind).toBe('DATE_MOVED')
    expect(c!.detail).toBe('2026-08-20 -> 2026-08-21 (ET)')
    expect(c!.urgent).toBe(true)
    expect(hasUrgentChanges([c!])).toBe(true)
  })
})

describe('bug class 2 — home and away inverted', () => {
  // The provider keeps its event id through a relocation, so the roles swap in place.
  const before = [
    fx({
      id: 'ligue1:401876487',
      home: { name: 'Paris Saint-Germain' }, away: { name: 'Stade Rennais' },
      venue: 'Parc des Princes', kickoffUtc: '2026-08-22T18:45:00.000Z',
    }),
  ]
  const after = [
    fx({
      id: 'ligue1:401876487',
      home: { name: 'Stade Rennais' }, away: { name: 'Paris Saint-Germain' },
      venue: 'Roazhon Park', kickoffUtc: '2026-08-23T18:45:00.000Z',
    }),
  ]

  it('reports the inversion alongside the date move', () => {
    const changes = diffFixtures(before, after, { now: NOW })
    expect(changes.map((c) => c.kind)).toEqual(['HOME_AWAY_INVERTED', 'DATE_MOVED', 'VENUE_CHANGED'])
    expect(changes[0]!.urgent).toBe(true)
  })

  it('names both the swap and the venue move', () => {
    const [c] = diffFixtures(before, after, { now: NOW })
    expect(c!.detail).toContain('was Paris Saint-Germain at home, now Stade Rennais at home')
    expect(c!.detail).toContain('Parc des Princes -> Roazhon Park')
  })

  it('still catches an inversion when the provider recreates the event', () => {
    const recreatedBefore = [fx({ ...before[0]!, id: 'ligue1:401876487' })]
    const recreatedAfter = [fx({ ...after[0]!, id: 'ligue1:999999999' })]
    const changes = diffFixtures(recreatedBefore, recreatedAfter, { now: NOW })
    expect(changes).toHaveLength(1)
    expect(changes[0]!.kind).toBe('HOME_AWAY_INVERTED')
  })

  it('does NOT call the reverse leg of a season an inversion', () => {
    // Elche v Barcelona in August and Barcelona v Elche in February are two real fixtures.
    // A name-derived identity reported this as an inversion; kickoff proximity rules it out.
    const augustLeg = [
      fx({ id: 'laliga:1', competition: 'laliga', venueTz: 'Europe/Madrid',
        home: { name: 'Elche' }, away: { name: 'Barcelona' },
        kickoffUtc: '2026-08-23T19:30:00.000Z' }),
    ]
    const februaryLeg = [
      fx({ id: 'laliga:2', competition: 'laliga', venueTz: 'Europe/Madrid',
        home: { name: 'Barcelona' }, away: { name: 'Elche' },
        kickoffUtc: '2027-02-14T20:00:00.000Z' }),
    ]
    const kinds = diffFixtures(augustLeg, februaryLeg, { now: NOW }).map((c) => c.kind)
    expect(kinds).not.toContain('HOME_AWAY_INVERTED')
    expect(kinds.sort()).toEqual(['DISAPPEARED', 'NEW'])
  })
})

describe('bug class 3 — wrong kickoff time on the right day', () => {
  it('reports TIME_CHANGED, not DATE_MOVED', () => {
    // Bundesliga opener: listed 14:30, actually 20:30 CEST.
    const before = [fx({ id: 'b', competition: 'bundesliga', venueTz: 'Europe/Berlin',
      kickoffUtc: '2026-08-28T12:30:00.000Z' })]
    const after = [fx({ id: 'b', competition: 'bundesliga', venueTz: 'Europe/Berlin',
      kickoffUtc: '2026-08-28T18:30:00.000Z' })]
    const [c] = diffFixtures(before, after, { now: NOW })
    expect(c!.kind).toBe('TIME_CHANGED')
  })
})

describe('bug class 4 — a fixture that never existed', () => {
  it('reports DISAPPEARED when a phantom row drops out', () => {
    const before = [
      fx({ id: 'real' }),
      fx({ id: 'phantom', competition: 'bundesliga', home: { name: 'Borussia Dortmund' },
        away: { name: 'RB Leipzig' }, kickoffUtc: '2026-08-29T13:30:00.000Z' }),
    ]
    const after = [fx({ id: 'real' })]
    const changes = diffFixtures(before, after, { now: NOW })
    expect(changes).toHaveLength(1)
    expect(changes[0]!.kind).toBe('DISAPPEARED')
    expect(changes[0]!.label).toContain('Borussia Dortmund')
  })
})

describe('other transitions', () => {
  it('treats a postponement as urgent even when kickoff is far off', () => {
    const before = [fx({ id: 'c', kickoffUtc: '2026-12-01T18:45:00.000Z' })]
    const after = [fx({ id: 'c', kickoffUtc: '2026-12-01T18:45:00.000Z', status: 'postponed' })]
    const [c] = diffFixtures(before, after, { now: NOW })
    expect(c!.kind).toBe('STATUS_CHANGED')
    expect(c!.urgent).toBe(true)
  })

  it('does not treat a newly-published fixture as urgent', () => {
    const changes = diffFixtures([], [fx({ id: 'd' })], { now: NOW })
    expect(changes[0]!.kind).toBe('NEW')
    expect(hasUrgentChanges(changes)).toBe(false)
  })

  it('notes a placeholder kickoff firming up, without raising an alarm', () => {
    const before = [fx({ id: 'e', timeConfidence: 'round_placeholder' })]
    const after = [fx({ id: 'e', timeConfidence: 'exact' })]
    const [c] = diffFixtures(before, after, { now: NOW })
    expect(c!.kind).toBe('TIME_CONFIDENCE_CHANGED')
    expect(c!.urgent).toBe(false)
  })

  it('reports nothing when nothing moved', () => {
    const same = [fx({ id: 'f' }), fx({ id: 'g' })]
    expect(diffFixtures(same, structuredClone(same), { now: NOW })).toHaveLength(0)
  })

  it('sorts urgent changes above the rest', () => {
    const before = [fx({ id: 'far', kickoffUtc: '2027-01-01T18:45:00.000Z' }), fx({ id: 'near' })]
    const after = [
      fx({ id: 'far', kickoffUtc: '2027-01-02T18:45:00.000Z' }),
      fx({ id: 'near', kickoffUtc: '2026-08-22T18:45:00.000Z' }),
    ]
    const changes = diffFixtures(before, after, { now: NOW })
    expect(changes[0]!.id).toBe('near')
    expect(changes[0]!.urgent).toBe(true)
  })
})
