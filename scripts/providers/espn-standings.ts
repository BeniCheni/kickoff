import { COMPETITIONS, TABLE_LEAGUES, type CompetitionKey } from '../../src/lib/competitions'
import { standingsFileSchema, type StandingRow, type StandingsFile } from '../../src/lib/schema'

/**
 * ESPN's public standings API — the same host and posture as the scoreboard provider.
 *   GET site.api.espn.com/apis/v2/sports/soccer/{code}/standings?season=YYYY
 *
 * The table is taken from the provider, never recomputed from results: league order depends
 * on per-competition tie-breakers (La Liga breaks level clubs on head-to-head first), and
 * re-deriving it locally is exactly the plausible-but-unverified data this project bans.
 * Like the scoreboard feed it is undocumented, so every row goes through Zod before it is
 * written and a shape change fails loudly instead of laundering bad rows.
 */

const BASE = 'https://site.api.espn.com/apis/v2/sports/soccer'

/** Season start year for European leagues: July onwards belongs to the new season. */
export function currentSeasonStartYear(now = new Date()): number {
  return now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1
}

/** Pure transform: one ESPN standings entry -> one row. Exported so tests can pin it. */
export function normalizeStandingEntry(entry: any): StandingRow | null {
  const team = entry?.team
  if (!team?.id || !team.displayName) return null

  const stats = new Map<string, number>(
    (entry.stats ?? [])
      .filter((s: any) => typeof s?.name === 'string' && Number.isFinite(s.value))
      .map((s: any) => [s.name, Number(s.value)]),
  )
  const need = ['gamesPlayed', 'wins', 'ties', 'losses', 'pointsFor', 'pointsAgainst', 'points', 'rank']
  if (need.some((n) => !stats.has(n))) return null

  return {
    teamId: String(team.id),
    name: team.displayName,
    shortName: team.shortDisplayName ?? team.displayName,
    abbrev: team.abbreviation ?? team.displayName.slice(0, 3).toUpperCase(),
    rank: stats.get('rank')!,
    rankChange: stats.get('rankChange') ?? 0,
    played: stats.get('gamesPlayed')!,
    w: stats.get('wins')!,
    d: stats.get('ties')!,
    l: stats.get('losses')!,
    gf: stats.get('pointsFor')!,
    ga: stats.get('pointsAgainst')!,
    pts: stats.get('points')!,
  }
}

export async function fetchStandings(season = currentSeasonStartYear()): Promise<StandingsFile> {
  const fetchedAt = new Date().toISOString()
  const leagues: Record<string, StandingRow[]> = {}

  for (const key of TABLE_LEAGUES as CompetitionKey[]) {
    const code = COMPETITIONS[key].espnCode
    if (!code) continue
    const res = await fetch(`${BASE}/${code}/standings?season=${season}`)
    if (!res.ok) throw new Error(`ESPN standings ${code} responded ${res.status}`)
    const body: any = await res.json()

    const entries: any[] = body?.children?.[0]?.standings?.entries ?? []
    const rows: StandingRow[] = []
    for (const entry of entries) {
      const row = normalizeStandingEntry(entry)
      if (row) rows.push(row)
      else console.warn(`  ! ${code} standings: skipped an entry that could not be normalized`)
    }
    rows.sort((a, b) => a.rank - b.rank)
    leagues[key] = rows
  }

  return standingsFileSchema.parse({ fetchedAt, provider: 'espn', season, leagues })
}
