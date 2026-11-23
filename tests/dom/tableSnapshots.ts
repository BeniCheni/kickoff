import { LEAGUE_TABLES, type CompetitionKey } from '../../src/lib/competitions'
import { FIXTURES, META } from '../../src/lib/fixtures'
import type { Fixture, StandingRow } from '../../src/lib/schema'
import { STANDINGS } from '../../src/lib/standings'
import { edgeFixture } from '../fixtures/edgeFixtures'

/**
 * Snapshots a sync can legitimately write that the committed files may not hold on the day a
 * test runs. Each is set in module memory, and `holdSnapshot` puts the committed one back. No
 * generated file is read from or written to here.
 *
 * Two facts decide what the Table draws and neither is the code's: whether the provider still
 * supplies a Champions League table (once the league phase ends it returns none, and the sync
 * records `ucl` as degraded in both files), and how many finished results a club has inside
 * the window. A test of what the Table does may not lean on either being so today (the review
 * of PR #352, finding 2).
 */
export function holdSnapshot(): () => void {
  const leagues = { ...STANDINGS.leagues }
  const hadDegraded = 'degraded' in STANDINGS
  const degraded = STANDINGS.degraded
  const metaDegraded = META.standingsDegraded
  const fixtures = [...FIXTURES]
  return () => {
    for (const key of Object.keys(STANDINGS.leagues)) delete STANDINGS.leagues[key]
    Object.assign(STANDINGS.leagues, leagues)
    if (hadDegraded) STANDINGS.degraded = degraded
    else delete STANDINGS.degraded
    META.standingsDegraded = metaDegraded
    FIXTURES.splice(0, FIXTURES.length, ...fixtures)
  }
}

/** What the sync writes once the league phase has ended: no Champions League table, and both files say why. */
export function withoutUclTable(): void {
  delete STANDINGS.leagues.ucl
  STANDINGS.degraded = ['ucl']
  META.standingsDegraded = ['ucl']
}

export const specimenId = (rank: number) => `specimen-${rank}`

/**
 * A full table for `league` whose clubs no committed fixture belongs to: as many rows as the
 * league has clubs, in rank order, each under an id the snapshot does not use. Its strips and
 * its next cells are therefore whatever a test adds to FIXTURES, and nothing else.
 */
export function specimenTable(league: CompetitionKey): StandingRow[] {
  return Array.from({ length: LEAGUE_TABLES[league]!.teams }, (_, i) => ({
    teamId: specimenId(i + 1), name: `Specimen ${i + 1}`, shortName: `Specimen ${i + 1}`, abbrev: `S${String(i + 1).padStart(2, '0')}`,
    rank: i + 1, rankChange: 0, played: 10, w: 5, d: 3, l: 2, gf: 12, ga: 8, pts: 18,
  }))
}

/** `results` as full-time fixtures in `competition` for one club, oldest first, a day apart, each against a club in no table. */
export function finishedFor(teamId: string, competition: CompetitionKey, results: readonly ('W' | 'D' | 'L')[]): Fixture[] {
  return results.map((result, i) => edgeFixture({
    id: `specimen:${competition}:${teamId}:${i}`, competition,
    home: { name: teamId, sourceId: teamId }, away: { name: `Visitor ${i}`, sourceId: `visitor:${competition}:${teamId}:${i}` },
    kickoffUtc: new Date(Date.parse('2026-09-01T15:00:00.000Z') + i * 86_400_000).toISOString(),
    status: 'full_time', result: result === 'W' ? { home: 1, away: 0 } : result === 'D' ? { home: 1, away: 1 } : { home: 0, away: 1 },
  }))
}

/**
 * Five more finished rounds for every club of every table the snapshot holds: the day no strip
 * is short. Each round pairs the table top against bottom and turns it by one place.
 */
export function withFiveFinishedRoundsEach(): void {
  for (const [competition, rows] of Object.entries(STANDINGS.leagues) as [CompetitionKey, StandingRow[]][]) {
    const order = [...rows]
    for (let round = 0; round < 5; round += 1) {
      for (let i = 0; i < order.length / 2; i += 1) {
        const home = order[i]!, away = order[order.length - i - 1]!
        FIXTURES.push(edgeFixture({
          id: `specimen:${competition}:round-${round}:${i}`, competition,
          home: { name: home.name, sourceId: home.teamId }, away: { name: away.name, sourceId: away.teamId },
          kickoffUtc: new Date(Date.parse(META.lastSyncAt) - (6 - round) * 86_400_000).toISOString(),
          status: 'full_time', result: { home: 1, away: 0 },
        }))
      }
      order.splice(1, 0, order.pop()!)
    }
  }
}
