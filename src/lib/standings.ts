import rawStandings from '../data/standings.json'
import { standingsFileSchema, type Fixture, type StandingRow } from './schema'
import { zoneFor, type LeagueTableMeta, type CompetitionKey, type Zone } from './competitions'
import { FIXTURES } from './fixtures'
import { brooklynDate, fixtureTimes, hoursSince, weekdayShort, type FixtureTimes } from './time'
import { hasKickedOff, stillToKickOff } from './lensSelectors'

/**
 * The league table plus everything the Table view derives around it.
 *
 * Division of labour: position, points and the W/D/L record come from the provider's
 * official table (standings.json) — never recomputed, because league order depends on
 * per-competition tie-breakers. Form, next fixture, PPG and games-in-hand are derived
 * here, from data whose provenance we already trust: form and next-fixture join to the
 * fixtures snapshot on ESPN's team id, PPG and games-in-hand are arithmetic on the
 * official row.
 */
export const STANDINGS = standingsFileSchema.parse(rawStandings)

export type FormResult = 'W' | 'D' | 'L'

/** One league fixture as the Table's NEXT lane shows it — the same shape for both lanes, so a
 *  renderer holds one of these and never mixes an opponent from one with a state from another. */
export type TableLane = {
  opponent: string
  /** The opponent's table code ("OSA") when they are in the same table; else a short name. */
  opponentAbbrev: string
  /** True when this club is at home. */
  home: boolean
  weekday: string
  times: FixtureTimes
  timeConfidence: Fixture['timeConfidence']
}

export type TableRow = StandingRow & {
  gd: number
  /** Points per game to 2dp — the honest comparator while clubs have games in hand. */
  ppg: string
  /** Games fewer than the league's most-played club. 0 when level. */
  gamesInHand: number
  zone: Zone | null
  /** Last league results, oldest -> newest, at most 5. Only fixtures inside the sync window. */
  form: FormResult[]
  /** The club's next league match: still to kick off on the shared gate, on or after today. */
  next: TableLane | null
  /** The club's most recent league match whose league-set kickoff has passed while the snapshot
   *  still says `scheduled` — kicked off, outcome unknown to this snapshot. Stays until a sync
   *  resolves it: KICKED OFF is the state LIVE expires into (FixtureRow), not one that expires. */
  underway: TableLane | null
}

/** One league's fixtures grouped by team id, in kickoff order — one pass, reused per row. */
function fixturesByTeam(key: CompetitionKey, fixtures: readonly Fixture[]): Map<string, Fixture[]> {
  const byTeam = new Map<string, Fixture[]>()
  const add = (id: string | undefined, f: Fixture) => {
    if (!id) return
    const list = byTeam.get(id)
    if (list) list.push(f)
    else byTeam.set(id, [f])
  }
  for (const f of fixtures) {
    if (f.competition !== key) continue
    add(f.home.sourceId, f)
    add(f.away.sourceId, f)
  }
  for (const list of byTeam.values()) {
    list.sort((a, b) => a.kickoffUtc.localeCompare(b.kickoffUtc))
  }
  return byTeam
}

/**
 * The table for one league, or [] when the snapshot has none (non-domestic keys). `today` and
 * `nowUtcIso` decide "next" and "underway" — one caller-supplied instant in two shapes, never
 * read internally (no default reads the clock), so this stays exactly as ticking as the app
 * around it (see useNow()) and exactly as testable with synthetic data as the rest of the pure
 * layer. `rows`/`fixtures` default to the loaded snapshot; tests inject their own.
 */
export function tableFor(
  key: CompetitionKey,
  today: string,
  nowUtcIso: string,
  rows: readonly StandingRow[] = STANDINGS.leagues[key] ?? [],
  fixtures: readonly Fixture[] = FIXTURES,
): TableRow[] {
  if (!rows.length) return []

  const byTeam = fixturesByTeam(key, fixtures)
  const maxPlayed = Math.max(...rows.map((r) => r.played))
  const abbrevById = new Map(rows.map((r) => [r.teamId, r.abbrev]))

  return rows.map((r) => {
    const mine = byTeam.get(r.teamId) ?? []

    const form: FormResult[] = mine
      .filter((f) => f.status === 'full_time' && f.result)
      .slice(-5)
      .map((f) => {
        const isHome = f.home.sourceId === r.teamId
        const us = isHome ? f.result!.home : f.result!.away
        const them = isHome ? f.result!.away : f.result!.home
        return us > them ? 'W' : us === them ? 'D' : 'L'
      })

    // Next: the shared gate retires a league-set time at its kickoff minute; only a placeholder
    // reaches the date floor. Compare Brooklyn calendar dates on both sides — a UTC-midnight
    // floor would keep advertising a Sunday-night placeholder as "next" through Monday (see
    // time.ts).
    const upcoming = mine.find(
      (f) => stillToKickOff(f, nowUtcIso) && brooklynDate(f.kickoffUtc) >= today,
    )
    // Underway: the *last* qualifying fixture — `mine` is in kickoff order, and a stale row an
    // outage left `scheduled` weeks ago must not outrank the match that kicked off today.
    let underwayFixture: Fixture | undefined
    for (const f of mine) if (hasKickedOff(f, nowUtcIso)) underwayFixture = f
    const nextTimes = upcoming ? fixtureTimes(upcoming.kickoffUtc, upcoming.venueTz) : null
    const underwayTimes = underwayFixture ? fixtureTimes(underwayFixture.kickoffUtc, underwayFixture.venueTz) : null

    const nextIsHome = upcoming?.home.sourceId === r.teamId
    const underwayIsHome = underwayFixture?.home.sourceId === r.teamId
    const opponentAbbrev = (f: Fixture, isHome: boolean | undefined) =>
      isHome
        ? abbrevById.get(f.away.sourceId ?? '') ?? f.away.name.slice(0, 3).toUpperCase()
        : abbrevById.get(f.home.sourceId ?? '') ?? f.home.name.slice(0, 3).toUpperCase()
    return {
      ...r,
      gd: r.gf - r.ga,
      ppg: r.played ? (r.pts / r.played).toFixed(2) : '—',
      gamesInHand: maxPlayed - r.played,
      zone: zoneFor(key, r.rank),
      form,
      next: upcoming && nextTimes
        ? {
            opponent: nextIsHome ? upcoming!.away.name : upcoming!.home.name,
            opponentAbbrev: opponentAbbrev(upcoming!, nextIsHome),
            home: nextIsHome,
            weekday: weekdayShort(nextTimes.brooklyn.isoDate),
            times: nextTimes,
            timeConfidence: upcoming.timeConfidence,
          }
        : null,
      underway: underwayFixture && underwayTimes
        ? {
            opponent: underwayIsHome ? underwayFixture.away.name : underwayFixture.home.name,
            opponentAbbrev: opponentAbbrev(underwayFixture, underwayIsHome),
            home: underwayIsHome,
            weekday: weekdayShort(underwayTimes.brooklyn.isoDate),
            times: underwayTimes,
            timeConfidence: underwayFixture.timeConfidence,
          }
        : null,
    }
  })
}

/** "3 of 38" style progress: most-played club vs a double round-robin season. */
export function matchdayProgress(rows: TableRow[], meta?: LeagueTableMeta): { played: number; of: number } | null {
  if (!rows.length) return null
  const teams = rows.length
  return { played: Math.max(...rows.map((r) => r.played)), of: meta?.matches ?? (teams - 1) * 2 }
}

/** Clubs a game (or more) behind the league's most-played — drives the callout. */
export function clubsInHand(rows: TableRow[]): number {
  return rows.filter((r) => r.gamesInHand > 0).length
}

export function hoursSinceStandingsSync(now = new Date()): number {
  return hoursSince(STANDINGS.fetchedAt, now)
}
