import { describe, it, expect } from 'vitest'
import {
  diffFixtures,
  diffStandings,
  formatReportLine,
  hasUrgentChanges,
  implausibleShrink,
  reportSaysChanged,
  type SyncReport,
} from '../scripts/diff'
import type { Fixture, StandingRow, StandingsFile } from '../src/lib/schema'

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

describe('implausibleShrink — a truncated or broken response, not a real collapse', () => {
  it('flags a league that came back empty', () => {
    const offenders = implausibleShrink({ pl: 20, laliga: 18 }, { pl: 0, laliga: 18 })
    expect(offenders).toEqual([{ competition: 'pl', previous: 20, fetched: 0 }])
  })

  it('flags a league fetched at under half its previous in-window count', () => {
    const offenders = implausibleShrink({ ligue1: 40 }, { ligue1: 15 })
    expect(offenders).toEqual([{ competition: 'ligue1', previous: 40, fetched: 15 }])
  })

  it('does not flag a healthy fetch, even a modest real dip', () => {
    // A window shrinking as time passes and past fixtures roll out is normal, not a bug.
    expect(implausibleShrink({ pl: 20 }, { pl: 20 })).toEqual([])
    expect(implausibleShrink({ pl: 20 }, { pl: 11 })).toEqual([])
    expect(implausibleShrink({ pl: 20 }, { pl: 25 })).toEqual([])
  })

  it('exempts a competition with no previous in-window count — first sync, or a cup that fully rolled out of the window', () => {
    expect(implausibleShrink({ supercup: 0 }, { supercup: 0 })).toEqual([])
    expect(implausibleShrink({}, { pl: 20 })).toEqual([])
  })

  it('treats a missing competition in the fetched counts as zero', () => {
    const offenders = implausibleShrink({ seriea: 30 }, {})
    expect(offenders).toEqual([{ competition: 'seriea', previous: 30, fetched: 0 }])
  })

  it('reports every offender, sorted by competition, not just the first', () => {
    const offenders = implausibleShrink({ pl: 20, laliga: 20, seriea: 20 }, { pl: 0, laliga: 20, seriea: 5 })
    expect(offenders.map((o) => o.competition)).toEqual(['pl', 'seriea'])
  })

  it('respects a custom ratio', () => {
    expect(implausibleShrink({ pl: 20 }, { pl: 15 }, 0.9)).toEqual([
      { competition: 'pl', previous: 20, fetched: 15 },
    ])
    expect(implausibleShrink({ pl: 20 }, { pl: 15 }, 0.5)).toEqual([])
  })
})

describe('the sync report — "changed" is decided here, never by git diff', () => {
  const quiet: SyncReport = { changes: 0, urgent: 0, standings: 'unchanged', rankMoves: 0 }

  it('a run that only rewrote fetchedAt stamps is not a change', () => {
    expect(reportSaysChanged(quiet)).toBe(false)
  })

  it('one diff-engine line of any kind is a change — NEW and TIME_CONFIDENCE_CHANGED included', () => {
    expect(reportSaysChanged({ ...quiet, changes: 1 })).toBe(true)
  })

  it('standings rows moving is a change even with no fixture lines', () => {
    expect(reportSaysChanged({ ...quiet, standings: 'changed' })).toBe(true)
  })

  it('a failed standings fetch is never a reason to commit', () => {
    expect(reportSaysChanged({ ...quiet, standings: 'failed' })).toBe(false)
    expect(reportSaysChanged({ ...quiet, standings: 'failed', changes: 2 })).toBe(true)
  })

  it('formats the one stable line sync.yml greps — pinned verbatim, because the workflow parses it', () => {
    expect(formatReportLine({ changes: 3, urgent: 1, standings: 'changed', rankMoves: 2 })).toBe(
      'report: changed=true changes=3 urgent=1 standings=changed rank-moves=2',
    )
    expect(formatReportLine(quiet)).toBe(
      'report: changed=false changes=0 urgent=0 standings=unchanged rank-moves=0',
    )
  })

  it("matches the exact regex the workflow validates it against, and the fields it extracts", () => {
    // Mirror of sync.yml's `grep -Eqx` and its two `sed` extractions — if this drifts, the
    // workflow's "Read the sync report" step fails loudly rather than guessing.
    const shape = /^report: changed=(true|false) changes=[0-9]+ urgent=[0-9]+ standings=(changed|unchanged|failed) rank-moves=[0-9]+$/
    for (const r of [quiet, { ...quiet, changes: 12, urgent: 4, standings: 'failed' as const }]) {
      const line = formatReportLine(r)
      expect(line).toMatch(shape)
      expect(/\schanged=([a-z]*)/.exec(line)?.[1]).toBe(String(reportSaysChanged(r)))
      expect(/\sstandings=([a-z]*)/.exec(line)?.[1]).toBe(r.standings)
    }
  })
})

describe('diffStandings — rows move on every matchday, ranks only sometimes', () => {
  function row(teamId: string, over: Partial<StandingRow> = {}): StandingRow {
    return {
      teamId, name: `Team ${teamId}`, shortName: teamId, abbrev: teamId.padEnd(3, 'X'),
      rank: 1, rankChange: 0, played: 3, w: 3, d: 0, l: 0, gf: 9, ga: 1, pts: 9,
      ...over,
    }
  }
  function file(leagues: Record<string, StandingRow[]>): StandingsFile {
    return { fetchedAt: '2026-09-01T00:00:00.000Z', provider: 'espn', season: 2026, leagues }
  }
  const table = () => [row('A', { rank: 1 }), row('B', { rank: 2, pts: 6, w: 2, l: 1, gf: 5 })]

  it('a first sync (no previous file) counts every row as new and no rank as moved', () => {
    expect(diffStandings(null, file({ pl: table() }))).toEqual({ rowsChanged: 2, moves: [] })
  })

  it('an identical table — a different fetchedAt only — changed nothing', () => {
    const prev = file({ pl: table() })
    const next = { ...file({ pl: table() }), fetchedAt: '2026-09-02T00:00:00.000Z' }
    expect(diffStandings(prev, next)).toEqual({ rowsChanged: 0, moves: [] })
  })

  it('the leader winning again holds every rank and still changes a row', () => {
    const prev = file({ pl: table() })
    const next = file({ pl: [row('A', { rank: 1, played: 4, w: 4, gf: 12, pts: 12 }), table()[1]!] })
    expect(diffStandings(prev, next)).toEqual({ rowsChanged: 1, moves: [] })
  })

  it('a rank move is a changed row and a named move', () => {
    const prev = file({ pl: table() })
    const next = file({ pl: [row('B', { rank: 1, pts: 10, played: 4, w: 3, d: 1 }), row('A', { rank: 2 })] })
    const out = diffStandings(prev, next)
    expect(out.rowsChanged).toBe(2)
    expect(out.moves).toEqual(['  pl           Team B: 2 -> 1', '  pl           Team A: 1 -> 2'])
  })

  it('a row or a league that vanished from the table counts as changed', () => {
    const prev = file({ pl: table(), laliga: [row('C')] })
    const next = file({ pl: [table()[0]!] })
    expect(diffStandings(prev, next).rowsChanged).toBe(2) // B gone from pl, laliga gone
  })
})
