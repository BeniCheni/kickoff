import { SYNCABLE, COMPETITIONS, type CompetitionKey } from '../../src/lib/competitions'
import { fixtureId, type Fixture, type FixtureStatus } from '../../src/lib/schema'
import { addDays } from '../../src/lib/time'
import { identityContext, providerIdentity } from './identity'

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

/**
 * A status name ESPN sent that this map doesn't cover — including a missing one. Thrown by
 * `normalizeEvent` rather than falling back to `scheduled`, because a fallback here is exactly
 * the failure class this project exists to kill: inventing scheduledness for a fixture whose
 * real state (delayed, suspended, abandoned, gone to penalties) the sync simply doesn't know.
 * `fetchWindow` catches these, collects every offender across the whole run, and throws once
 * so a single sync reports everything it doesn't understand rather than dying on the first.
 */
export class UnmappedStatusError extends Error {
  constructor(
    public readonly statusName: string | undefined,
    public readonly eventId: string,
  ) {
    super(`unmapped ESPN status ${statusName ?? '(missing)'} for event ${eventId}`)
    this.name = 'UnmappedStatusError'
  }
}

/**
 * Deliberately NOT mapped: STATUS_FINAL_AET / STATUS_FINAL_PEN / STATUS_SHOOTOUT. ESPN's score
 * after extra time (or a penalty shootout) is not the 90-minute result the books settle a
 * Moneyline/Match Result market on — mapping either straight to `full_time` would render a
 * confident, wrong score. None of the five leagues and four cups this app syncs can currently
 * reach extra time inside the fetched window (the cups have already been played), so this earns
 * its own design the day a synced fixture actually needs it, rather than a guess today.
 */
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

function eventProblem(event: any): string | null {
  if (providerIdentity(event?.id) === null) return 'missing or invalid event id'
  const comp = event?.competitions?.[0]
  if (!comp) return 'missing competition'
  if (!Array.isArray(comp.competitors)) return 'missing competitors array'
  for (const role of ['home', 'away']) {
    const competitor = comp.competitors.find((c: any) => c?.homeAway === role)
    if (!competitor) return `missing ${role} competitor`
    if (typeof competitor.team?.displayName !== 'string' || !competitor.team.displayName.trim()) {
      return `missing or invalid ${role} team name`
    }
  }
  return null
}

/** Pure transform: one ESPN event -> one Fixture. Exported so tests can pin it. */
export function normalizeEvent(
  event: any,
  competition: CompetitionKey,
  fetchedAt: string,
): Fixture | null {
  if (eventProblem(event)) return null
  const comp = event?.competitions?.[0]
  const competitors = comp?.competitors
  const sourceId = providerIdentity(event.id)!
  const homeC = competitors.find((c: any) => c?.homeAway === 'home')
  const awayC = competitors.find((c: any) => c?.homeAway === 'away')

  const rawHome = homeC.team?.displayName
  const rawAway = awayC.team?.displayName

  const home = ALIAS[rawHome] ?? rawHome
  const away = ALIAS[rawAway] ?? rawAway
  const statusName = event.status?.type?.name
  const status = STATUS[statusName]
  if (!status) throw new UnmappedStatusError(statusName, String(event?.id))

  // `timeValid: false` is ESPN telling us the kickoff time is a round placeholder and the
  // league has only fixed the date. Honouring this flag is what stops the dashboard from
  // presenting an unscheduled Clásico as a confirmed 16:15 kickoff.
  const timeConfidence = comp.timeValid === false ? 'round_placeholder' : 'exact'

  const fixture: Fixture = {
    id: fixtureId(competition, sourceId),
    competition,
    kickoffUtc: new Date(event.date).toISOString(),
    venueTz: COMPETITIONS[competition].tz,
    home: { name: home, sourceId: homeC.team?.id ? String(homeC.team.id) : undefined },
    away: { name: away, sourceId: awayC.team?.id ? String(awayC.team.id) : undefined },
    status,
    timeConfidence,
    source: { provider: 'espn', sourceId, fetchedAt },
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
    // Collect normalization failures across the window; no offender may disappear just
    // because it was new, or because enough other events normalized successfully.
    const rejected: string[] = []

    const seen = new Set<string>()

    for (const { key, code } of SYNCABLE) {
      let ok = 0
      for (const [chunkFrom, chunkTo] of chunkWindow(from, to)) {
        const url = `${BASE}/${code}/scoreboard?dates=${compact(chunkFrom)}-${compact(chunkTo)}`
        let body: any
        try {
          const res = await fetch(url)
          if (!res.ok) throw new Error(`responded ${res.status}`)
          body = await res.json()
        } catch (err) {
          throw new Error(`ESPN ${code} ${chunkFrom}..${chunkTo}: ${err instanceof Error ? err.message : err}`)
        }
        if (!Array.isArray(body?.events)) {
          throw new Error(`ESPN ${code} ${chunkFrom}..${chunkTo}: missing or invalid events array`)
        }
        const events: any[] = body.events

        if (events.length >= ESPN_PAGE_CAP) {
          // A warning nobody reads is the same as no warning once this runs unattended —
          // a chunk at the cap may be silently missing rows, so refuse to write from it.
          throw new Error(
            `${code} ${chunkFrom}..${chunkTo} returned ${events.length} events — at or above ` +
              `ESPN's ${ESPN_PAGE_CAP}-event cap, so this chunk may be truncated. Lower CHUNK_DAYS ` +
              `and re-run; refusing to write a fixture list that might be missing rows.`,
          )
        }

        for (const [index, event] of events.entries()) {
          const context = `${code} ${chunkFrom}..${chunkTo} entry ${index + 1}, event ` +
            `${identityContext(event?.id)} (${event?.date ?? 'no date'})`
          let fixture: Fixture | null
          try {
            fixture = normalizeEvent(event, key, fetchedAt)
          } catch (err) {
            rejected.push(`  ! ${context}: ${err instanceof Error ? err.message : err}`)
            continue
          }
          if (!fixture) {
            rejected.push(`  ! ${context}: ${eventProblem(event)}`)
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

    if (rejected.length > 0) {
      throw new Error(
        `ESPN sent ${rejected.length} fixture(s) this sync could not normalize — ` +
          `refusing to write:\n${rejected.join('\n')}`,
      )
    }

    return { fixtures, counts }
  },
}
