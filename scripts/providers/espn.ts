import { SYNCABLE, venueTimeZone, type CompetitionKey } from '../../src/lib/competitions'
import { fixtureId, type Fixture, type FixtureStatus } from '../../src/lib/schema'
import { addDays } from '../../src/lib/time'
import { resolveMatchday } from '../../src/lib/matchdays'
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
 * real state (delayed, forfeited, or an extra-time name this map does not list) the sync
 * simply doesn't know. `fetchWindow` catches these, collects every offender across the whole
 * run, and throws
 * once so a single sync reports everything it doesn't understand rather than dying on the
 * first. The price is deliberate and it is steep: one unknown name in one league refuses the
 * whole snapshot, every other league's table included — which is what froze 10–12 Oct 2026.
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
 * A required score or shootout on a decided final was missing, or was not a nonnegative
 * whole number in the shape ESPN uses. `score` is a numeric string. `shootoutScore` is a
 * number. Thrown like an unmapped status: `fetchWindow` collects it and refuses the fetch.
 * The raw value is kept on the error so a caller can see it was not coerced to 0.
 */
export class InvalidFinalScoreError extends Error {
  constructor(
    public readonly field: 'score' | 'shootoutScore',
    public readonly side: 'home' | 'away',
    public readonly raw: unknown,
    public readonly eventId: string,
  ) {
    const shown = raw === undefined ? '(missing)' : JSON.stringify(raw)
    super(`invalid ${field} for ${side} (${shown}) on event ${eventId}`)
    this.name = 'InvalidFinalScoreError'
  }
}

/**
 * `STATUS_FINAL_AET` and `STATUS_FINAL_PEN` are stored as `after_extra_time` and
 * `after_penalties`, not `full_time`. ESPN's `score` on those finals includes extra time
 * and never the shootout, so it is not the 90-minute result a Match Result market settles
 * on. `shootoutScore` is read only for `after_penalties`.
 *
 * `STATUS_SHOOTOUT` stays unmapped: the 11 Nov 2026 receipts did not contain it. An
 * in-progress extra-time or shootout name stays unmapped until a receipt shows it; adding
 * one later is a single entry in the map below, plus a receipt test. `STATUS_DELAYED`,
 * `STATUS_FORFEIT`, `STATUS_RAIN_DELAY` and any other unnamed value still abort.
 *
 * STATUS_SUSPENDED and STATUS_ABANDONED are mapped. ESPN sent both for La Liga event
 * 401882849 on 10 Oct 2026 (Rayo Vallecano v Athletic Club), and the unmapped name aborted
 * the snapshot before any league's table could update.
 */
const STATUS: Record<string, FixtureStatus> = {
  STATUS_SCHEDULED: 'scheduled',
  STATUS_IN_PROGRESS: 'in_play',
  STATUS_FIRST_HALF: 'in_play',
  STATUS_SECOND_HALF: 'in_play',
  STATUS_HALFTIME: 'in_play',
  STATUS_FULL_TIME: 'full_time',
  STATUS_FINAL: 'full_time',
  STATUS_FINAL_AET: 'after_extra_time',
  STATUS_FINAL_PEN: 'after_penalties',
  STATUS_POSTPONED: 'postponed',
  STATUS_CANCELED: 'cancelled',
  STATUS_CANCELLED: 'cancelled',
  STATUS_SUSPENDED: 'suspended',
  STATUS_ABANDONED: 'abandoned',
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
 * ESPN caps a scoreboard response at 100 events per day and gives NO indication that it
 * truncated. A day with 100+ events silently returns only the first 100. If this happens,
 * refuse to write from that day's fetch — a loud error is better than silent data loss.
 */
const ESPN_PAGE_CAP = 100

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
  // Both sides of the fixture/table join must validate before coercion. An array such as
  // ["123"] would otherwise borrow team "123"'s identity, not merely miss the join.
  for (const role of ['home', 'away']) {
    const id = comp.competitors.find((c: any) => c?.homeAway === role).team.id
    if (providerIdentity(id) === null) return `${role} team id ${identityContext(id)} is missing or invalid`
  }
  return null
}

/**
 * `score` is a numeric string ("4"). The shape is checked before `Number`, which turns
 * null, "", " ", false and [] into 0. A string of digits that is not a safe integer is
 * refused rather than rounded.
 */
function numericStringGoals(value: unknown): number | null {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) ? parsed : null
}

/** `shootoutScore` is a number (3). `Number.isSafeInteger` does not coerce. */
function numericShootoutGoals(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) return null
  return value
}

function requireNumericString(value: unknown, side: 'home' | 'away', eventId: string): number {
  const parsed = numericStringGoals(value)
  if (parsed === null) throw new InvalidFinalScoreError('score', side, value, eventId)
  return parsed
}

function requireShootoutNumber(value: unknown, side: 'home' | 'away', eventId: string): number {
  const parsed = numericShootoutGoals(value)
  if (parsed === null) throw new InvalidFinalScoreError('shootoutScore', side, value, eventId)
  return parsed
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

  const venueId = providerIdentity(comp.venue?.id) ?? undefined
  const country = comp.venue?.address?.country
  const venueCountry = typeof country === 'string' && country.trim() ? country : undefined

  const fixture: Fixture = {
    id: fixtureId(competition, sourceId),
    competition,
    kickoffUtc: new Date(event.date).toISOString(),
    venueTz: venueTimeZone(venueCountry, venueId),
    ...(venueId ? { venueId } : {}),
    ...(venueCountry ? { venueCountry } : {}),
    home: { name: home, sourceId: providerIdentity(homeC.team.id)! },
    away: { name: away, sourceId: providerIdentity(awayC.team.id)! },
    status,
    timeConfidence,
    source: { provider: 'espn', sourceId, fetchedAt },
  }

  const venue = comp.venue?.fullName
  if (venue) fixture.venue = venue

  // A suspension or abandonment can carry a score (often 0-0). That number is not a
  // full-time result, so only `full_time` stores one, and it keeps this parse on purpose
  // (ideas row 2). Decided finals below check the raw value, because `Number` turns
  // null, "", " ", false and [] into 0.
  if (status === 'full_time') {
    const h = Number(homeC.score)
    const a = Number(awayC.score)
    if (Number.isFinite(h) && Number.isFinite(a)) fixture.result = { home: h, away: a }
  } else if (status === 'after_extra_time' || status === 'after_penalties') {
    const eventId = String(event?.id)
    fixture.result = {
      home: requireNumericString(homeC.score, 'home', eventId),
      away: requireNumericString(awayC.score, 'away', eventId),
    }
    // An extra-time final does not read `shootoutScore`, even when the field is present.
    if (status === 'after_penalties') {
      fixture.shootout = {
        home: requireShootoutNumber(homeC.shootoutScore, 'home', eventId),
        away: requireShootoutNumber(awayC.shootoutScore, 'away', eventId),
      }
    }
  }

  // Only phase-window consumers need this evidence; domestic season slugs are unused.
  if (event.season?.slug === 'league-phase') {
    fixture.phase = event.season.slug
    if (Number.isInteger(event.season.year)) fixture.season = event.season.year
  }
  // Only league-phase fixtures have these windows. Domestic rounds remain unset.
  // This candidate is used once; sync's preserve step carries the stored baseline by id.
  if (fixture.phase === 'league-phase' && fixture.season !== undefined) {
    const md = resolveMatchday(competition, fixture.kickoffUtc, fixture.season)
    if (md !== null) fixture.round = String(md)
  }

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
      let current = from
      while (current <= to) {
        const url = `${BASE}/${code}/scoreboard?dates=${compact(current)}`
        let body: any
        try {
          const res = await fetch(url)
          if (!res.ok) throw new Error(`responded ${res.status}`)
          body = await res.json()
        } catch (err) {
          throw new Error(`ESPN ${code} ${current}: ${err instanceof Error ? err.message : err}`)
        }
        if (!Array.isArray(body?.events)) {
          throw new Error(`ESPN ${code} ${current}: missing or invalid events array`)
        }
        const events: any[] = body.events

        if (events.length >= ESPN_PAGE_CAP) {
          // A warning nobody reads is the same as no warning once this runs unattended —
          // a single day at the cap may be silently missing rows, so refuse to write from it.
          throw new Error(
            `${code} ${current} returned ${events.length} events — at or above ` +
              `ESPN's ${ESPN_PAGE_CAP}-event cap, so this day may be truncated. ` +
              `refusing to write a fixture list that might be missing rows.`,
          )
        }

        for (const [index, event] of events.entries()) {
          const context = `${code} ${current} entry ${index + 1}, event ` +
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
          // Same fixture can arrive on multiple days if it's listed in upcoming matches.
          if (seen.has(fixture.id)) continue
          seen.add(fixture.id)
          fixtures.push(fixture)
          ok++
        }
        current = addDays(current, 1)
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
