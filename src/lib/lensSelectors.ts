import { unsettledStatus, type Fixture } from './schema'
import type { CompetitionKey } from './competitions'
import { addDays, brooklynDate, fixtureTimes, posterDayTitle, startOfWeek, weekdayShort } from './time'

/**
 * Pure per-lens data shaping. Everything here takes fixtures as arguments (never importing
 * the snapshot) and touches no DOM, so the node test suite can exercise it directly.
 */

/** One calendar day as the week renderers consume it. */
export type DayInfo = {
  date: string
  /** Fixtures surviving the competition filters, in display order. */
  shown: Fixture[]
  /** Total on the date regardless of filters — distinguishes "hidden" from "nothing on". */
  total: number
  isToday: boolean
  closed?: boolean
  /** False when the date falls outside the snapshot's window, so `total: 0` there means
   * "not fetched", never "no matches". Absent means covered. */
  covered?: boolean
}

/** The snapshot's inclusive Brooklyn date range (`meta.json`'s `window`). */
export type Coverage = { readonly from: string; readonly to: string }

/** Whether the snapshot fetched this Brooklyn date at all. */
export function inCoverage(date: string, coverage: Coverage): boolean {
  return date >= coverage.from && date <= coverage.to
}

/** How much of a week the snapshot fetched: every day, some days, or none. */
export function weekCoverage(days: readonly { covered?: boolean }[]): 'full' | 'partial' | 'none' {
  const covered = days.filter(day => day.covered !== false).length
  return covered === days.length ? 'full' : covered === 0 ? 'none' : 'partial'
}

/**
 * Earliest and latest fixtures with a league-set kickoff time. Placeholder times are
 * excluded — a sub-line must never derive "FIRST 3:00 PM" from a provider filler — and so
 * are unsettled fixtures (postponed, cancelled, suspended, abandoned), whose old kickoff
 * instants are no longer promises.
 */
export function kickoffBounds(
  fixtures: readonly Fixture[],
): { first: Fixture; last: Fixture } | null {
  let first: Fixture | null = null
  let last: Fixture | null = null
  for (const f of fixtures) {
    if (f.timeConfidence !== 'exact') continue
    if (unsettledStatus(f.status)) continue
    if (!first || f.kickoffUtc < first.kickoffUtc) first = f
    if (!last || f.kickoffUtc > last.kickoffUtc) last = f
  }
  return first && last ? { first, last } : null
}

/** The edition date is a Brooklyn calendar day. Only the shown, credible kickoffs
 * contribute a clock, while closure describes the entire unfiltered matchday. */
export function bookDateLine(date: string, shown: readonly Fixture[], closed: boolean) {
  const count = matchCount(shown.length)
  const unset = unsetKickoffs(shown)
  const first = kickoffBounds(shown)?.first
  let ending = ''
  if (closed && shown.length) ending = 'FULL TIME'
  else if (first) ending = 'FIRST ' + fixtureTimes(first.kickoffUtc, first.venueTz).brooklyn.time + ' ET'
  else if (unset) ending = 'FIRST KICKOFF NOT SET'
  return { date: posterDayTitle(date).toUpperCase(), count, ending, unset }
}

export function matchCount(count: number): string {
  return count + (count === 1 ? ' MATCH' : ' MATCHES')
}

export function unsetKickoffs(fixtures: readonly Fixture[]): number {
  return fixtures.filter(f => !unsettledStatus(f.status) && f.timeConfidence !== 'exact').length
}

/**
 * The one gate for "not yet kicked off", shared by every hero (v0.2.2): Ledger's Next-up
 * strip through `upcoming`, Poster's Tonight's slate through `planSlate`. Two heroes with two
 * clocks was the bug (docs/v0.3.0-ideas.md row 3); two copies of one gate would be the same
 * bug in disguise. Scheduled only — a postponed, cancelled, suspended or abandoned match has
 * no honest kickoff to promise, and an in-play match (a snapshot's or a real one) has kicked
 * off. A league-set
 * time must still be ahead of `nowUtcIso`, so a fixture drops out at its kickoff minute; a
 * placeholder (TBC) time is trusted only to the day and is never evicted by arithmetic on an
 * instant the league never set — the caller's date filter is what retires it.
 */
export function stillToKickOff(f: Fixture, nowUtcIso: string): boolean {
  return f.status === 'scheduled' && (f.timeConfidence !== 'exact' || f.kickoffUtc > nowUtcIso)
}

/**
 * A scheduled fixture whose kickoff instant has passed. The snapshot does not yet know the
 * score or whether it has ended — only that it is no longer in the future. The exact
 * complement of stillToKickOff over scheduled fixtures: a placeholder kickoff time can never
 * tell us a match started, so `exact` is required on both sides.
 */
export function hasKickedOff(f: Fixture, nowUtcIso: string): boolean {
  return f.status === 'scheduled' && f.timeConfidence === 'exact' && f.kickoffUtc <= nowUtcIso
}

/**
 * The next kickoff: the earliest still-scheduled fixture after `nowUtcIso` whose time the
 * league has actually set. Placeholder times are never "next" — that would be a guess.
 */
export function nextKickoffId(fixtures: readonly Fixture[], nowUtcIso: string): string | null {
  let best: Fixture | null = null
  for (const f of fixtures) {
    if (f.timeConfidence !== 'exact' || !stillToKickOff(f, nowUtcIso)) continue
    if (!best || f.kickoffUtc < best.kickoffUtc) best = f
  }
  return best ? best.id : null
}

/** Select the earliest eligible Brooklyn date for the retained next-fixture marker. An all-TBC day
 * has no exact selection: a later day's known time must not silently outrank it. */
export function nextMatchdaySelection(
  fixtures: readonly Fixture[], todayBrooklyn: string, nowUtcIso: string,
): { date: string | null; exact: Fixture | null; placeholders: Fixture[] } {
  const upcoming = fixtures.filter((f) => stillToKickOff(f, nowUtcIso)
    && brooklynDate(f.kickoffUtc) >= todayBrooklyn)
  const date = upcoming.map((f) => brooklynDate(f.kickoffUtc)).sort()[0] ?? null
  const firstDay = upcoming.filter((f) => brooklynDate(f.kickoffUtc) === date)
  const nextId = nextKickoffId(firstDay, nowUtcIso)
  return {
    date,
    exact: firstDay.find((f) => f.id === nextId) ?? null,
    placeholders: firstDay.filter((f) => f.timeConfidence !== 'exact'),
  }
}

/**
 * A snapshot `in_play` is believably live only for a few hours after kickoff. The data is
 * a static sync — a match frozen in_play would otherwise claim LIVE forever, long after
 * the staleness banner has given up on it. Four hours clears any amount of stoppage time
 * without promising a liveness the snapshot can no longer know.
 */
export const LIVE_WINDOW_MS = 4 * 60 * 60 * 1000

export function believablyLive(f: Fixture, nowUtcIso: string): boolean {
  return (
    f.status === 'in_play' && Date.parse(nowUtcIso) - Date.parse(f.kickoffUtc) <= LIVE_WINDOW_MS
  )
}

/** Display-only complement for in_play fixtures; stored statuses never change. */
export function staleLiveIds(fixtures: readonly Fixture[], nowUtcIso: string): ReadonlySet<string> {
  return new Set(fixtures.filter((f) => f.status === 'in_play' && !believablyLive(f, nowUtcIso)).map((f) => f.id))
}

/**
 * Hot rows: everything believably LIVE in the snapshot plus the exact NEXT
 * on the first eligible date. Retained as data for the future next-fixture marker.
 */
export function hotFixtureIds(
  fixtures: readonly Fixture[],
  nowUtcIso: string,
): ReadonlySet<string> {
  const hot = new Set<string>()
  for (const f of fixtures) {
    if (believablyLive(f, nowUtcIso)) hot.add(f.id)
  }
  const { exact } = nextMatchdaySelection(fixtures, brooklynDate(nowUtcIso), nowUtcIso)
  if (exact) hot.add(exact.id)
  return hot
}

/** One group per fixture-bearing day, or per uninterrupted run of empty days. */
export function groupWeekDays<T extends { total: number; covered?: boolean }>(days: readonly T[]): T[][] {
  const groups: T[][] = []
  for (const day of days) {
    const previous = groups.at(-1)
    const lead = previous?.[0]
    // An uncovered date never shares a gap with a covered empty one: they say different things.
    if (day.total === 0 && lead?.total === 0 && (lead.covered !== false) === (day.covered !== false)) previous!.push(day)
    else groups.push([day])
  }
  return groups
}

/** Each slot owns its fiction. Counts, dates and match states come from the snapshot. */
export const COVER_LIBRARY = {
  fri: ['The Fifth Minute', 'The lights came back on in the ninety-fifth minute. So did something else.'],
  sat: ['The Valley Doors', 'Every door was left open that Saturday. The whistle did not close them all.'],
  sun: ['The Tower Counts', 'The tower counts its bells every Sunday. It has never been wrong.'],
  mon: ['The Empty Hallways', 'It is only Monday. The week has not finished with you.'],
  midweek: ['The Night Between', 'The weekend is days away. Something could not wait.'],
  firstNight: ['The First Night', 'Grounds lit at once, a continent apart. Something walks between them.'],
  secondNight: ['The Second Night', 'It walked between them all night. It is still walking.'],
  europa: ['The Far Windows', 'Windows lit across the map. Count them again. One is watching back.'],
  closed: ['The Long Whistle', 'Every whistle blew, and every one was answered. You made it to morning.'],
  quiet: ['A Quiet Week', 'A no-bet week is a successful outcome.'],
  register: ['The Register', 'Every name goes in. Some are already falling.'],
} as const

type DaySlot = Exclude<keyof typeof COVER_LIBRARY, 'closed' | 'quiet' | 'register'>
export type MatchdayBook = {
  date: string
  slot: DaySlot
  closed: boolean
  shown: Fixture[]
}

export function isFinal(fixture: Fixture): boolean {
  return fixture.status === 'full_time' || fixture.status === 'after_extra_time' || fixture.status === 'after_penalties'
}

/** The caller supplies one Brooklyn week of unfiltered, display-ordered dates.
 * Hidden UCL nights still determine which cover a later night takes. */
export function posterBooks(
  week: readonly { date: string; fixtures: readonly Fixture[] }[],
  active: ReadonlySet<CompetitionKey>,
): MatchdayBook[] {
  const books: MatchdayBook[] = []
  let seenChampionsLeague = false
  for (const { date, fixtures } of [...week].sort((a, b) => a.date.localeCompare(b.date))) {
    let slot: DaySlot
    if (fixtures.some(f => f.competition === 'ucl')) {
      slot = seenChampionsLeague ? 'secondNight' : 'firstNight'
      seenChampionsLeague = true
    } else if (fixtures.some(f => f.competition === 'uel' || f.competition === 'uecl')) {
      slot = 'europa'
    } else {
      const weekdays: Record<string, DaySlot> = { Fri: 'fri', Sat: 'sat', Sun: 'sun', Mon: 'mon' }
      slot = weekdays[weekdayShort(date)] ?? 'midweek'
    }
    const shown = fixtures.filter(f => active.has(f.competition))
    if (shown.length) books.push({ date, slot, shown, closed: fixtures.every(isFinal) })
  }
  return books
}

export function catalogueNumber(date: string): string {
  return 'FT-' + date.slice(5, 7) + date.slice(8, 10)
}

/** Stop before the first shared instant, even across competitions. All remaining
 * credible kickoffs become one count, while placeholders keep their own count. */
export function coverBand(shown: readonly Fixture[]) {
  const eligible = shown.filter(f => f.timeConfidence === 'exact' && !unsettledStatus(f.status))
    .sort((a, b) => Date.parse(a.kickoffUtc) - Date.parse(b.kickoffUtc))
  let named = 0
  while (named < 3 && named < eligible.length) {
    const next = eligible[named + 1]
    if (next && Date.parse(eligible[named]!.kickoffUtc) === Date.parse(next.kickoffUtc)) break
    named++
  }
  const rest = eligible.slice(named)
  let summary = ''
  const from = rest[0]
  if (from) {
    summary = '+ ' + rest.length + ' more'
    if (rest.every(isFinal)) summary += rest.length === 1 ? ' result' : ' results'
    else summary += ', from ' + fixtureTimes(from.kickoffUtc, from.venueTz).brooklyn.time + ' ET'
  }
  return { named: eligible.slice(0, named), summary, unset: unsetKickoffs(shown) }
}

export function restingBook(books: readonly MatchdayBook[], week: string, today: string, now: string) {
  if (week === startOfWeek(today)) {
    const { date } = nextMatchdaySelection(books.flatMap(book => book.shown), today, now)
    if (date) return date
  }
  return (books.find(book => !book.closed) ?? books.at(-1))?.date ?? 'register'
}

export function bookWeek(start: string, byDate: ReadonlyMap<string, readonly Fixture[]>, coverage: Coverage) {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i)
    const fixtures = byDate.get(date) ?? []
    return { date, fixtures, total: fixtures.length, covered: inCoverage(date, coverage) }
  })
}

export function shelfGaps(week: readonly { date: string; total: number; covered?: boolean }[]) {
  const short = (date: string) => weekdayShort(date).toUpperCase() + ' ' + Number(date.slice(8))
  return groupWeekDays(week).filter(group => group[0]!.total === 0).map(group => {
    const from = short(group[0]!.date)
    return (group.length === 1 ? from : from + ' – ' + short(group.at(-1)!.date))
      + (group[0]!.covered === false ? ' · outside the snapshot' : ' · no books this week')
  })
}
