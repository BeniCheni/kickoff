import type { Fixture } from './schema'
import { COMPETITIONS, competitionRank, type CompetitionKey } from './competitions'

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
