import { BROOKLYN_TZ } from './competitions'

/**
 * Timezone rendering.
 *
 * Everything here takes an absolute instant and formats it in some zone. There is
 * deliberately no "parse a local wall-clock time into an instant" function: the prototype
 * had one, and needing it was a symptom of storing local dates as the source of truth.
 * Fixtures now arrive as UTC instants from the provider, so this module only ever formats.
 *
 * Correctness hazard this exists to handle: Europe and the US change clocks on different
 * dates (EU 25 Oct 2026, US 1 Nov 2026). For the week in between, the usual 6-hour
 * Madrid/Brooklyn gap is 5 hours. Intl with an explicit IANA zone gets this right;
 * any hardcoded offset does not. See tests/time.test.ts.
 */

export type ZonedParts = {
  /** "8:45 PM" */
  time: string
  /** "2026-08-21" — the calendar date *in that zone*, which may differ from the UTC date. */
  isoDate: string
  /** "Fri" */
  weekday: string
}

const cache = new Map<string, Intl.DateTimeFormat>()
function formatter(tz: string, opts: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = tz + JSON.stringify(opts)
  let f = cache.get(key)
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone: tz, ...opts })
    cache.set(key, f)
  }
  return f
}

export function zonedParts(instant: Date, tz: string): ZonedParts {
  const parts = Object.fromEntries(
    formatter(tz, {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: 'numeric', minute: '2-digit', hour12: true, weekday: 'short',
    })
      .formatToParts(instant)
      .map((p) => [p.type, p.value]),
  )
  return {
    time: `${parts.hour}:${parts.minute} ${parts.dayPeriod}`,
    isoDate: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: parts.weekday ?? '',
  }
}

/** UTC offset in minutes for `tz` at `instant`. Positive is east of Greenwich. */
export function tzOffsetMinutes(tz: string, instant: Date): number {
  const p = Object.fromEntries(
    formatter(tz, {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    })
      .formatToParts(instant)
      .map((x) => [x.type, x.value]),
  )
  const asUTC = Date.UTC(+p.year!, +p.month! - 1, +p.day!, +p.hour!, +p.minute!, +p.second!)
  return (asUTC - instant.getTime()) / 60_000
}

/** "EDT" or "EST" — derived from the actual offset, never assumed from the month. */
export function brooklynAbbrev(instant: Date): 'EDT' | 'EST' {
  return tzOffsetMinutes(BROOKLYN_TZ, instant) === -240 ? 'EDT' : 'EST'
}

export type FixtureTimes = {
  local: ZonedParts
  brooklyn: ZonedParts
  abbrev: 'EDT' | 'EST'
  /** -1, 0 or +1: Brooklyn's calendar date relative to the stadium's. */
  dayDelta: -1 | 0 | 1
}

export function fixtureTimes(kickoffUtc: string, venueTz: string): FixtureTimes {
  const instant = new Date(kickoffUtc)
  const local = zonedParts(instant, venueTz)
  const brooklyn = zonedParts(instant, BROOKLYN_TZ)
  const dayDelta =
    brooklyn.isoDate > local.isoDate ? 1 : brooklyn.isoDate < local.isoDate ? -1 : 0
  return { local, brooklyn, abbrev: brooklynAbbrev(instant), dayDelta }
}

/** The Brooklyn-local calendar date a fixture belongs to — how Beni actually reads a slate. */
export function brooklynDate(kickoffUtc: string): string {
  return zonedParts(new Date(kickoffUtc), BROOKLYN_TZ).isoDate
}

/* ---------- calendar helpers (all operate on YYYY-MM-DD strings in Brooklyn terms) ------- */

export function todayIso(now = new Date()): string {
  return zonedParts(now, BROOKLYN_TZ).isoDate
}

export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** Monday of the week containing `iso`. */
export function startOfWeek(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`)
  const dow = d.getUTCDay()
  return addDays(iso, dow === 0 ? -6 : 1 - dow)
}

export function addMonths(iso: string, n: number): string {
  const [y, m] = iso.split('-').map(Number)
  const d = new Date(Date.UTC(y!, m! - 1 + n, 1, 12))
  return d.toISOString().slice(0, 10)
}

export function niceDate(iso: string): string {
  return formatter('UTC', { month: 'long', day: 'numeric', year: 'numeric' }).format(
    new Date(`${iso}T12:00:00Z`),
  )
}

export function shortDate(iso: string): string {
  return formatter('UTC', { month: 'short', day: 'numeric' }).format(new Date(`${iso}T12:00:00Z`))
}

export function weekdayShort(iso: string): string {
  return formatter('UTC', { weekday: 'short' }).format(new Date(`${iso}T12:00:00Z`))
}

export function daysUntil(iso: string, from = todayIso()): number {
  return Math.round(
    (Date.parse(`${iso}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000,
  )
}
