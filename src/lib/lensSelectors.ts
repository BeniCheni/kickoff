import type { Fixture } from './schema'
import { COMPETITIONS, competitionRank, type CompetitionKey } from './competitions'
import { brooklynDate, fixtureTimes, posterDayTitle } from './time'

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
}

/** Marquee = any non-domestic competition; there is no per-fixture importance signal. */
export function isMarquee(key: CompetitionKey): boolean {
  return COMPETITIONS[key].group !== 'domestic'
}

/** Tie-break order: marquee beats domestic, then display rank, then key — deterministic. */
function beats(a: CompetitionKey, b: CompetitionKey): boolean {
  if (isMarquee(a) !== isMarquee(b)) return isMarquee(a)
  const ra = competitionRank(a)
  const rb = competitionRank(b)
  if (ra !== rb) return ra < rb
  return a < b
}

/**
 * The day's dominant competition — the one with the most fixtures, ties breaking toward
 * the marquee (non-domestic) one. Drives Poster's duotone header and hero rails.
 */
export function dominantCompetition(list: readonly Fixture[]): CompetitionKey | null {
  const counts = new Map<CompetitionKey, number>()
  for (const f of list) counts.set(f.competition, (counts.get(f.competition) ?? 0) + 1)
  let best: CompetitionKey | null = null
  let bestCount = 0
  for (const [key, count] of counts) {
    if (best === null || count > bestCount || (count === bestCount && beats(key, best))) {
      best = key
      bestCount = count
    }
  }
  return best
}

/**
 * Earliest and latest fixtures with a league-set kickoff time. Placeholder times are
 * excluded — a sub-line must never derive "FIRST 3:00 PM" from a provider filler — and so
 * are postponed/cancelled fixtures, whose old kickoff instants are no longer promises.
 */
export function kickoffBounds(
  fixtures: readonly Fixture[],
): { first: Fixture; last: Fixture } | null {
  let first: Fixture | null = null
  let last: Fixture | null = null
  for (const f of fixtures) {
    if (f.timeConfidence !== 'exact') continue
    if (f.status === 'postponed' || f.status === 'cancelled') continue
    if (!first || f.kickoffUtc < first.kickoffUtc) first = f
    if (!last || f.kickoffUtc > last.kickoffUtc) last = f
  }
  return first && last ? { first, last } : null
}

/**
 * The Poster hero's mono sub-line. A one-kickoff slate collapses the range to a single
 * `KICKOFF h:mm` — FIRST and LAST wearing the same time is a range that isn't one. A
 * future matchday's slate counts `MATCHES`, not `REMAINING`: nothing about a day that
 * hasn't started is remaining. The count is every fixture on the slate; the FIRST/LAST
 * range can only be drawn from league-set times, so when the two disagree the gap is named
 * — `N TBC` — rather than left for the reader to notice that the count outruns the range
 * (docs/v0.3.0-ideas.md row 13, on the front door since v0.2.2). A slate of only TBC times
 * gets the count, the TBC count and no times.
 */
export function slateSubLine(slate: readonly Fixture[], isTonight: boolean): string {
  const parts = [`${slate.length} ${isTonight ? 'REMAINING' : 'MATCHES'}`]
  const tbc = slate.filter((f) => f.timeConfidence !== 'exact').length
  if (tbc > 0) parts.push(`${tbc} TBC`)
  const bounds = kickoffBounds(slate)
  if (bounds) {
    const time = (f: Fixture) => fixtureTimes(f.kickoffUtc, f.venueTz).brooklyn.time
    if (bounds.first.id === bounds.last.id) parts.push(`KICKOFF ${time(bounds.first)}`)
    else parts.push(`FIRST ${time(bounds.first)}`, `LAST ${time(bounds.last)}`)
  }
  return parts.join(' · ')
}

/** Poster day headers count all shown fixtures, while FIRST can only name a league-set
 * time. State the TBC count explicitly, using the same confidence rule as the hero. */
export function posterSubLine(fixtures: readonly Fixture[]): string {
  const leagues = new Set(fixtures.map((f) => f.competition)).size
  const parts = [
    `${fixtures.length} ${fixtures.length === 1 ? 'MATCH' : 'MATCHES'}`,
    `${leagues} ${leagues === 1 ? 'LEAGUE' : 'LEAGUES'}`,
  ]
  const tbc = fixtures.filter((f) => f.timeConfidence !== 'exact').length
  if (tbc > 0) parts.push(`${tbc} TBC`)
  const bounds = kickoffBounds(fixtures)
  if (bounds) parts.push(`FIRST KICKOFF ${fixtureTimes(bounds.first.kickoffUtc, bounds.first.venueTz).brooklyn.time}`)
  return parts.join(' · ')
}

/**
 * The one gate for "not yet kicked off", shared by every hero (v0.2.2): Ledger's Next-up
 * strip through `upcoming`, Poster's Tonight's slate through `planSlate`. Two heroes with two
 * clocks was the bug (docs/v0.3.0-ideas.md row 3); two copies of one gate would be the same
 * bug in disguise. Scheduled only — a postponed or cancelled match has no honest kickoff to
 * promise, and an in-play match (a snapshot's or a real one) has kicked off. A league-set
 * time must still be ahead of `nowUtcIso`, so a fixture drops out at its kickoff minute; a
 * placeholder (TBC) time is trusted only to the day and is never evicted by arithmetic on an
 * instant the league never set — the caller's date filter is what retires it.
 */
export function stillToKickOff(f: Fixture, nowUtcIso: string): boolean {
  return f.status === 'scheduled' && (f.timeConfidence !== 'exact' || f.kickoffUtc > nowUtcIso)
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

/** The marquee and glow share the earliest eligible Brooklyn date. An all-TBC day
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
 * Broadcast's hot rows: everything believably LIVE in the snapshot plus the exact NEXT
 * on the first eligible date. These are the only rows that glow — nothing else does.
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

/**
 * The Broadcast ticker's content, from the loaded snapshot: live fixtures, the next
 * kickoff, today's full-time scores. The snapshot carries no live match minute, so none
 * is rendered — inventing one would break the data-honesty rule.
 */
export type TickerSegment = { keyword: 'LIVE' | 'NEXT' | 'FT'; text: string; tbc?: { date: string }; emptyNext?: true }

export function tickerSegments(
  fixtures: readonly Fixture[],
  todayBrooklyn: string,
  nowUtcIso: string,
  windowTo: string,
): TickerSegment[] {
  const segments: TickerSegment[] = []
  for (const f of fixtures) {
    if (!believablyLive(f, nowUtcIso)) continue
    segments.push({
      keyword: 'LIVE',
      text: f.result
        ? `${f.home.name} ${f.result.home}–${f.result.away} ${f.away.name}`
        : `${f.home.name} v ${f.away.name}`,
    })
  }
  const { date, exact: next, placeholders } = nextMatchdaySelection(fixtures, todayBrooklyn, nowUtcIso)
  if (next) {
    const { time, isoDate } = fixtureTimes(next.kickoffUtc, next.venueTz).brooklyn
    const when = isoDate === todayBrooklyn ? time : `${posterDayTitle(isoDate)} · ${time}`
    segments.push({ keyword: 'NEXT', text: `${when} ${next.home.name} v ${next.away.name}${placeholders.length ? ` · +${placeholders.length} TBC` : ''}` })
  } else if (date && placeholders.length) {
    const only = placeholders[0]!
    segments.push({
      keyword: 'NEXT',
      tbc: { date: posterDayTitle(date) },
      text: placeholders.length === 1
        ? `${only.home.name} v ${only.away.name}`
        : `· ${placeholders.length} kickoffs, times not yet set by the league`,
    })
  } else {
    segments.push({
      keyword: 'NEXT', emptyNext: true,
      text: `— nothing scheduled in this snapshot · window ends ${posterDayTitle(windowTo)}`,
    })
  }
  for (const f of fixtures) {
    if (f.status !== 'full_time' || !f.result) continue
    if (brooklynDate(f.kickoffUtc) !== todayBrooklyn) continue
    segments.push({
      keyword: 'FT',
      text: `${f.home.name} ${f.result.home}–${f.result.away} ${f.away.name}`,
    })
  }
  return segments
}

/**
 * One month-grid cell: the match count, up to three competition bars (most fixtures
 * first, ties toward the marquee competition, then display rank), and whether the day
 * has a marquee fixture at all (the ⭐). Dots-aren't-data; counts and bars are.
 */
export function monthCellSummary(list: readonly Fixture[]): {
  count: number
  bars: CompetitionKey[]
  marquee: boolean
} {
  const counts = new Map<CompetitionKey, number>()
  let marquee = false
  for (const f of list) {
    counts.set(f.competition, (counts.get(f.competition) ?? 0) + 1)
    if (isMarquee(f.competition)) marquee = true
  }
  const bars = [...counts.keys()]
    .sort((a, b) => {
      const diff = (counts.get(b) ?? 0) - (counts.get(a) ?? 0)
      if (diff !== 0) return diff
      return beats(a, b) ? -1 : 1
    })
    .slice(0, 3)
  return { count: list.length, bars, marquee }
}

/**
 * Poster's proportional-loudness fold: days with more than two shown matches get the
 * full-bleed duotone header, one or two matches an inline header, and consecutive empty
 * days merge into a single hairline line (carrying the filtered-away count so a merged
 * gap never lies about hidden matches).
 */
export type PosterBlock =
  | { kind: 'big'; date: string; isToday: boolean; fixtures: Fixture[]; dominant: CompetitionKey }
  | { kind: 'small'; date: string; isToday: boolean; fixtures: Fixture[] }
  | { kind: 'gap'; dates: string[]; hiddenTotal: number }

export function planPosterWeek(days: readonly DayInfo[]): PosterBlock[] {
  const blocks: PosterBlock[] = []
  for (const day of days) {
    if (day.shown.length === 0) {
      const last = blocks[blocks.length - 1]
      if (last && last.kind === 'gap') {
        last.dates.push(day.date)
        last.hiddenTotal += day.total
      } else {
        blocks.push({ kind: 'gap', dates: [day.date], hiddenTotal: day.total })
      }
      continue
    }
    const dominant = dominantCompetition(day.shown)
    if (day.shown.length > 2 && dominant !== null) {
      blocks.push({ kind: 'big', date: day.date, isToday: day.isToday, fixtures: day.shown, dominant })
    } else {
      blocks.push({ kind: 'small', date: day.date, isToday: day.isToday, fixtures: day.shown })
    }
  }
  return blocks
}
