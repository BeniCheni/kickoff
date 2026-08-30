import rawStandings from '../data/standings.json'
import { standingsFileSchema, type Fixture, type StandingRow } from './schema'
import { zoneFor, type CompetitionKey, type Zone } from './competitions'
import { FIXTURES } from './fixtures'
import { brooklynDate, fixtureTimes, hoursSince, todayIso, weekdayShort, type FixtureTimes } from './time'

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

export type TableRow = StandingRow & {
  gd: number
  /** Points per game to 2dp — the honest comparator while clubs have games in hand. */
  ppg: string
  /** Games fewer than the league's most-played club. 0 when level. */
  gamesInHand: number
  zone: Zone | null
  /** Last league results, oldest -> newest, at most 5. Only fixtures inside the sync window. */
  form: FormResult[]
  next: {
    opponent: string
    /** The opponent's table code ("OSA") when they are in the same table; else a short name. */
    opponentAbbrev: string
    /** True when this club is at home. */
    home: boolean
    weekday: string
    times: FixtureTimes
    timeConfidence: Fixture['timeConfidence']
  } | null
}

/** One league's fixtures grouped by team id, in kickoff order — one pass, reused per row. */
function fixturesByTeam(key: CompetitionKey): Map<string, Fixture[]> {
  const byTeam = new Map<string, Fixture[]>()
  const add = (id: string | undefined, f: Fixture) => {
    if (!id) return
    const list = byTeam.get(id)
    if (list) list.push(f)
    else byTeam.set(id, [f])
  }
  for (const f of FIXTURES) {
    if (f.competition !== key) continue
    add(f.home.sourceId, f)
    add(f.away.sourceId, f)
  }
  for (const list of byTeam.values()) {
    list.sort((a, b) => a.kickoffUtc.localeCompare(b.kickoffUtc))
  }
  return byTeam
}

/** The table for one league, or [] when the snapshot has none (non-domestic keys). */
export function tableFor(key: CompetitionKey): TableRow[] {
  const rows = STANDINGS.leagues[key]
  if (!rows?.length) return []

  const byTeam = fixturesByTeam(key)
  const today = todayIso()
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

    // Compare Brooklyn calendar dates on both sides — slicing the raw UTC string would
    // keep advertising a Saturday-night kickoff as "next" through Sunday (see time.ts).
    const upcoming = mine.find(
      (f) => f.status === 'scheduled' && brooklynDate(f.kickoffUtc) >= today,
    )

    const isHome = upcoming?.home.sourceId === r.teamId
    const nextTimes = upcoming ? fixtureTimes(upcoming.kickoffUtc, upcoming.venueTz) : null
    return {
      ...r,
      gd: r.gf - r.ga,
      ppg: r.played ? (r.pts / r.played).toFixed(2) : '—',
      gamesInHand: maxPlayed - r.played,
      zone: zoneFor(key, r.rank),
      form,
      next: upcoming && nextTimes
        ? {
            opponent: isHome ? upcoming.away.name : upcoming.home.name,
            opponentAbbrev:
              abbrevById.get((isHome ? upcoming.away.sourceId : upcoming.home.sourceId) ?? '') ??
              (isHome ? upcoming.away.name : upcoming.home.name).slice(0, 3).toUpperCase(),
            home: isHome,
            weekday: weekdayShort(nextTimes.brooklyn.isoDate),
            times: nextTimes,
            timeConfidence: upcoming.timeConfidence,
          }
        : null,
    }
  })
}

/** "3 of 38" style progress: most-played club vs a double round-robin season. */
export function matchdayProgress(rows: TableRow[]): { played: number; of: number } | null {
  if (!rows.length) return null
  const teams = rows.length
  return { played: Math.max(...rows.map((r) => r.played)), of: (teams - 1) * 2 }
}

/** Clubs a game (or more) behind the league's most-played — drives the callout. */
export function clubsInHand(rows: TableRow[]): number {
  return rows.filter((r) => r.gamesInHand > 0).length
}

export function hoursSinceStandingsSync(now = new Date()): number {
  return hoursSince(STANDINGS.fetchedAt, now)
}
