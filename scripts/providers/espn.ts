import { SYNCABLE, COMPETITIONS, type CompetitionKey } from '../../src/lib/competitions'
import { fixtureId, type Fixture, type FixtureStatus } from '../../src/lib/schema'
import { addDays } from '../../src/lib/time'

/**
 * ESPN's public scoreboard API. No key, no auth, no rate limit we've hit.
 *   GET site.api.espn.com/apis/site/v2/sports/soccer/{code}/scoreboard?dates=YYYYMMDD-YYYYMMDD
 *
 * It is undocumented and could change shape without notice, which is precisely why every
 * response goes through the Zod schema before being written. A second provider belongs
 * behind this same interface — see FixtureProvider below.
 */

const BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer'

export type FixtureProvider = {
  name: 'espn'
  fetchWindow(from: string, to: string): Promise<{ fixtures: Fixture[]; counts: Record<string, number> }>
}

const STATUS: Record<string, FixtureStatus> = {
  STATUS_SCHEDULED: 'scheduled',
  STATUS_IN_PROGRESS: 'in_play',
  STATUS_FIRST_HALF: 'in_play',
  STATUS_SECOND_HALF: 'in_play',
  STATUS_HALFTIME: 'in_play',
  STATUS_FULL_TIME: 'full_time',
  STATUS_FINAL: 'full_time',
  STATUS_POSTPONED: 'postponed',
  STATUS_CANCELED: 'cancelled',
  STATUS_CANCELLED: 'cancelled',
}

/**
 * ESPN returns short club names ("Marseille", "Deportivo"). These are the fuller forms the
 * dashboard shows. Purely cosmetic — matching and ids use ESPN's team ids, so a missing
 * alias never causes a fixture to be mistaken for a different one.
 */
const ALIAS: Record<string, string> = {
  Deportivo: 'Deportivo La Coruña',
  Internazionale: 'Inter Milan',
  'Hamburg SV': 'Hamburger SV',
  Marseille: 'Olympique de Marseille',
  Strasbourg: 'RC Strasbourg',
  Lens: 'RC Lens',
  Lyon: 'Olympique Lyonnais',
  Brest: 'Stade Brestois',
  Lille: 'LOSC Lille',
  Nice: 'OGC Nice',
  Troyes: 'ESTAC Troyes',
  Toulouse: 'Toulouse FC',
  'Le Mans': 'Le Mans FC',
  Angers: 'Angers SCO',
  Lorient: 'FC Lorient',
  Auxerre: 'AJ Auxerre',
}

const compact = (iso: string) => iso.replace(/-/g, '')

/**
 * ESPN caps a scoreboard response at 100 events and gives NO indication that it truncated —
 * a 4-month range for La Liga silently returns only the first 100 fixtures. Silent truncation
 * is indistinguishable from "there are no more fixtures", which is precisely the kind of
 * quiet data loss this project exists to prevent, so the window is always requested in
 * chunks small enough that a cap is impossible, and a chunk that comes back at the cap is
 * reported loudly.
 */
const CHUNK_DAYS = 28
const ESPN_PAGE_CAP = 100

function chunkWindow(from: string, to: string): Array<[string, string]> {
  const chunks: Array<[string, string]> = []
  let cursor = from
  while (cursor <= to) {
    const end = addDays(cursor, CHUNK_DAYS - 1)
    chunks.push([cursor, end > to ? to : end])
    cursor = addDays(cursor, CHUNK_DAYS)
  }
  return chunks
}

/** Season label from ESPN's start year: 2026 -> "2026-27". */
export function seasonLabel(year: number): string {
  return `${year}-${String((year + 1) % 100).padStart(2, '0')}`
}

/** Pure transform: one ESPN event -> one Fixture. Exported so tests can pin it. */
export function normalizeEvent(
  event: any,
  competition: CompetitionKey,
  fetchedAt: string,
): Fixture | null {
  const comp = event?.competitions?.[0]
  const competitors = comp?.competitors
  if (!comp || !Array.isArray(competitors)) return null

  const homeC = competitors.find((c: any) => c.homeAway === 'home')
  const awayC = competitors.find((c: any) => c.homeAway === 'away')
  if (!homeC || !awayC) return null

  const rawHome = homeC.team?.displayName
  const rawAway = awayC.team?.displayName
  if (!rawHome || !rawAway) return null

  const home = ALIAS[rawHome] ?? rawHome
  const away = ALIAS[rawAway] ?? rawAway
  const statusName = event.status?.type?.name
  const status = STATUS[statusName] ?? 'scheduled'

  // `timeValid: false` is ESPN telling us the kickoff time is a round placeholder and the
  // league has only fixed the date. Honouring this flag is what stops the dashboard from
  // presenting an unscheduled Clásico as a confirmed 16:15 kickoff.
  const timeConfidence = comp.timeValid === false ? 'round_placeholder' : 'exact'

  const fixture: Fixture = {
    id: fixtureId(competition, String(event.id)),
    competition,
    kickoffUtc: new Date(event.date).toISOString(),
    venueTz: COMPETITIONS[competition].tz,
    home: { name: home, sourceId: homeC.team?.id ? String(homeC.team.id) : undefined },
    away: { name: away, sourceId: awayC.team?.id ? String(awayC.team.id) : undefined },
    status,
    timeConfidence,
    source: { provider: 'espn', sourceId: String(event.id), fetchedAt },
  }

  const venue = comp.venue?.fullName
  if (venue) fixture.venue = venue

  if (status === 'full_time') {
    const h = Number(homeC.score)
    const a = Number(awayC.score)
    if (Number.isFinite(h) && Number.isFinite(a)) fixture.result = { home: h, away: a }
  }

  // Deliberately NOT setting `round`: ESPN exposes no matchday number for these leagues,
  // and a round cannot be inferred from the date alone — La Liga's 2026-27 opening round is
  // spread across Aug 15-27 and interleaves with matchday 2. Inventing one would be exactly
  // the kind of plausible-but-unverified data this rewrite exists to eliminate.

  return fixture
}

export const espnProvider: FixtureProvider = {
  name: 'espn',
  async fetchWindow(from: string, to: string) {
    const fetchedAt = new Date().toISOString()
    const fixtures: Fixture[] = []
    const counts: Record<string, number> = {}

    const seen = new Set<string>()

    for (const { key, code } of SYNCABLE) {
      let ok = 0
      for (const [chunkFrom, chunkTo] of chunkWindow(from, to)) {
        const url = `${BASE}/${code}/scoreboard?dates=${compact(chunkFrom)}-${compact(chunkTo)}`
        const res = await fetch(url)
        if (!res.ok) {
          throw new Error(`ESPN ${code} responded ${res.status} for ${chunkFrom}..${chunkTo}`)
        }
        const body: any = await res.json()
        const events: any[] = body?.events ?? []

        if (events.length >= ESPN_PAGE_CAP) {
          console.warn(
            `  ! ${code} ${chunkFrom}..${chunkTo} returned ${events.length} events — at or above ` +
              `ESPN's ${ESPN_PAGE_CAP}-event cap, so this chunk may be truncated. Lower CHUNK_DAYS.`,
          )
        }

        for (const event of events) {
          const fixture = normalizeEvent(event, key, fetchedAt)
          if (!fixture) {
            console.warn(`  ! ${code}: skipped an event that could not be normalized (id ${event?.id})`)
            continue
          }
          // Chunk boundaries are inclusive on both ends, so a fixture can arrive twice.
          if (seen.has(fixture.id)) continue
          seen.add(fixture.id)
          fixtures.push(fixture)
          ok++
        }
      }
      counts[key] = ok
    }

    return { fixtures, counts }
  },
}
