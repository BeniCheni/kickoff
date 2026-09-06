import { LEAGUE_TABLES, SYNCABLE } from '../../src/lib/competitions'
import { standingRowSchema, standingsFileSchema, type StandingRow, type StandingsFile } from '../../src/lib/schema'
import { identityContext, providerIdentity } from './identity'

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

const REQUIRED_STATS = ['gamesPlayed', 'wins', 'ties', 'losses', 'pointsFor', 'pointsAgainst', 'points', 'rank']

function entryProblem(entry: any): string | null {
  if (providerIdentity(entry?.team?.id) === null) return 'missing or invalid team id'
  if (typeof entry.team.displayName !== 'string' || !entry.team.displayName.trim()) return 'missing or invalid team name'
  if (!Array.isArray(entry.stats)) return 'missing stats array'
  const available = new Set(entry.stats.filter((s: any) => Number.isFinite(s?.value)).map((s: any) => s.name))
  const missing = REQUIRED_STATS.filter((name) => !available.has(name))
  return missing.length ? `missing or nonnumeric required stats: ${missing.join(', ')}` : null
}

/** Pure transform: one ESPN standings entry -> one row. Exported so tests can pin it. */
export function normalizeStandingEntry(entry: any): StandingRow | null {
  if (entryProblem(entry)) return null
  const team = entry?.team

  const stats = new Map<string, number>(
    (entry.stats ?? [])
      .filter((s: any) => typeof s?.name === 'string' && Number.isFinite(s.value))
      .map((s: any) => [s.name, Number(s.value)]),
  )

  return {
    teamId: providerIdentity(team.id)!,
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

  // Await every league so one rejection does not hide diagnostics from the others.
  // A failure aborts the fixtures + standings snapshot before publication.
  const perLeague = await Promise.allSettled(
    SYNCABLE.filter(({ key }) => key in LEAGUE_TABLES).map(async ({ key, code }) => {
      let body: any
      try {
        const res = await fetch(`${BASE}/${code}/standings?season=${season}`)
        if (!res.ok) throw new Error(`responded ${res.status}`)
        body = await res.json()
      } catch (err) {
        throw new Error(`ESPN standings ${code}: ${err instanceof Error ? err.message : err}`)
      }

      const entries: unknown = body?.children?.[0]?.standings?.entries
      if (!Array.isArray(entries)) throw new Error(`ESPN standings ${code}: missing entries array`)
      const rows: StandingRow[] = []
      const rejected: string[] = []
      for (const [index, entry] of entries.entries()) {
        const context = `${code} entry ${index + 1}, team ${identityContext(entry?.team?.id)}`
        const row = normalizeStandingEntry(entry)
        if (!row) {
          rejected.push(`  ! ${context}: ${entryProblem(entry)}`)
          continue
        }
        const parsed = standingRowSchema.safeParse(row)
        if (parsed.success) rows.push(parsed.data)
        else rejected.push(`  ! ${context}: ${parsed.error.issues.map((i) => `${i.path.join('.')} — ${i.message}`).join('; ')}`)
      }
      if (rejected.length) throw new Error(`ESPN standings: ${rejected.length} rejected entries:\n${rejected.join('\n')}`)

      // Fail loudly on the two silent-corruption paths: a payload reshape upstream (zero
      // entries still satisfies the schema) and a dropped row (which would skew
      // games-in-hand and the matchday label). The previous snapshot survives either way,
      // because the throw happens before anything is written.
      const expected = LEAGUE_TABLES[key]!.teams
      if (rows.length !== expected) {
        throw new Error(
          `ESPN standings ${code}: got ${rows.length} rows, expected ${expected} — ` +
            `payload shape changed; refusing to publish the authoritative snapshot`,
        )
      }

      rows.sort((a, b) => a.rank - b.rank)
      return [key, rows] as const
    }),
  )

  const failures = perLeague.filter((r) => r.status === 'rejected')
  if (failures.length) {
    throw new Error(failures.map((r) => r.reason instanceof Error ? r.reason.message : String(r.reason)).join('\n'))
  }

  return standingsFileSchema.parse({
    fetchedAt,
    provider: 'espn',
    season,
    leagues: Object.fromEntries(perLeague.filter((r) => r.status === 'fulfilled').map((r) => r.value)),
  })
}
