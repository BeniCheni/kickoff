import { LEAGUE_TABLES, SYNCABLE } from '../../src/lib/competitions'
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

  // The five leagues are independent requests — fetch them concurrently. Any failure
  // rejects the whole batch: a partial standings file is worse than keeping the previous
  // committed snapshot, and the caller treats standings as non-fatal to the fixture sync.
  const perLeague = await Promise.all(
    SYNCABLE.filter(({ key }) => key in LEAGUE_TABLES).map(async ({ key, code }) => {
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

      // Fail loudly on the two silent-corruption paths: a payload reshape upstream (zero
      // entries still satisfies the schema) and a dropped row (which would skew
      // games-in-hand and the matchday label). The previous snapshot survives either way,
      // because the throw happens before anything is written.
      const expected = LEAGUE_TABLES[key]!.teams
      if (rows.length !== expected) {
        throw new Error(
          `ESPN standings ${code}: got ${rows.length} rows, expected ${expected} — ` +
            `payload shape changed or rows failed validation; keeping the previous snapshot`,
        )
      }

      rows.sort((a, b) => a.rank - b.rank)
      return [key, rows] as const
    }),
  )

  return standingsFileSchema.parse({
    fetchedAt,
    provider: 'espn',
    season,
    leagues: Object.fromEntries(perLeague),
  })
}
