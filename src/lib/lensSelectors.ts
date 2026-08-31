import type { Fixture } from './schema'
import { COMPETITIONS, competitionRank, type CompetitionKey } from './competitions'
import { brooklynDate, fixtureTimes } from './time'

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
 * excluded — a sub-line must never derive "FIRST 3:00 PM" from a provider filler.
 */
export function kickoffBounds(
  fixtures: readonly Fixture[],
): { first: Fixture; last: Fixture } | null {
  let first: Fixture | null = null
  let last: Fixture | null = null
  for (const f of fixtures) {
    if (f.timeConfidence !== 'exact') continue
    if (!first || f.kickoffUtc < first.kickoffUtc) first = f
    if (!last || f.kickoffUtc > last.kickoffUtc) last = f
  }
  return first && last ? { first, last } : null
}

/**
 * The next kickoff: the earliest still-scheduled fixture after `nowUtcIso` whose time the
 * league has actually set. Placeholder times are never "next" — that would be a guess.
 */
export function nextKickoffId(fixtures: readonly Fixture[], nowUtcIso: string): string | null {
  let best: Fixture | null = null
  for (const f of fixtures) {
    if (f.status !== 'scheduled' || f.timeConfidence !== 'exact') continue
    if (f.kickoffUtc <= nowUtcIso) continue
    if (!best || f.kickoffUtc < best.kickoffUtc) best = f
  }
  return best ? best.id : null
}

/**
 * Broadcast's hot rows: everything LIVE in the snapshot plus the next kickoff. These are
 * the only rows that glow — nothing else does.
 */
export function hotFixtureIds(
  fixtures: readonly Fixture[],
  nowUtcIso: string,
): ReadonlySet<string> {
  const hot = new Set<string>()
  for (const f of fixtures) {
    if (f.status === 'in_play') hot.add(f.id)
  }
  const next = nextKickoffId(fixtures, nowUtcIso)
  if (next !== null) hot.add(next)
  return hot
}

/**
 * The Broadcast ticker's content, from the loaded snapshot: live fixtures, the next
 * kickoff, today's full-time scores. The snapshot carries no live match minute, so none
 * is rendered — inventing one would break the data-honesty rule.
 */
export type TickerSegment = { keyword: 'LIVE' | 'NEXT' | 'FT'; text: string }

export function tickerSegments(
  fixtures: readonly Fixture[],
  todayBrooklyn: string,
  nowUtcIso: string,
): TickerSegment[] {
  const segments: TickerSegment[] = []
  for (const f of fixtures) {
    if (f.status !== 'in_play') continue
    segments.push({
      keyword: 'LIVE',
      text: f.result
        ? `${f.home.name} ${f.result.home}–${f.result.away} ${f.away.name}`
        : `${f.home.name} v ${f.away.name}`,
    })
  }
  const nextId = nextKickoffId(fixtures, nowUtcIso)
  const next = nextId !== null ? fixtures.find((f) => f.id === nextId) : undefined
  if (next) {
    const time = fixtureTimes(next.kickoffUtc, next.venueTz).brooklyn.time
    segments.push({ keyword: 'NEXT', text: `${time} ${next.home.name} v ${next.away.name}` })
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
