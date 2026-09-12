import { MATCHDAY_WINDOWS, MATCHDAY_WINDOWS_SEASON, type CompetitionKey } from './competitions'
import { brooklynDate } from './time'
import type { Fixture } from './schema'

/** A future provider's round string outranks this derived window; ESPN exposes none.
 * The sync keeps the first-seen result by fixture id, including an absent result.
 */
export function resolveMatchday(competition: CompetitionKey, kickoffUtc: string, season: number): number | null {
  if (season !== MATCHDAY_WINDOWS_SEASON) return null
  const day = brooklynDate(kickoffUtc)
  return MATCHDAY_WINDOWS[competition]?.find((w) => day >= w.from && day <= w.to)?.md ?? null
}

/** The ended-phase exception requires both a structural change and a date after the last
 * configured window. Unknown seasons have no such evidence and must still fail closed. */
export function afterPhaseWindows(competition: CompetitionKey, season: number, now: Date): boolean {
  const end = MATCHDAY_WINDOWS[competition]?.at(-1)?.to
  return season === MATCHDAY_WINDOWS_SEASON && !!end && brooklynDate(now.toISOString()) > end
}

export type MatchdayLine = { key: string; state: 'computed' | 'absent' | 'rescheduled'; text: string }

export function matchdayLines(fixtures: readonly Fixture[]): MatchdayLine[] {
  const lines = new Map<string, MatchdayLine>()
  for (const f of fixtures) {
    if (f.phase !== 'league-phase' || f.season !== MATCHDAY_WINDOWS_SEASON || !MATCHDAY_WINDOWS[f.competition]) continue
    const current = resolveMatchday(f.competition, f.kickoffUtc, f.season)
    const baseline = MATCHDAY_WINDOWS[f.competition]!.find(w => String(w.md) === f.round)
    const state = !baseline ? 'absent' : baseline.md === current ? 'computed' : 'rescheduled'
    const key = `${f.competition}:${baseline?.md ?? 'unknown'}:${state}`
    const month = baseline ? new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }).format(new Date(`${baseline.to}T12:00:00Z`)).toUpperCase() : ''
    const range = baseline ? `${Number(baseline.from.slice(8))}${baseline.from === baseline.to ? '' : `–${Number(baseline.to.slice(8))}`} ${month}` : ''
    const text = !baseline
      ? `MATCHDAY — · ${current === null ? 'DATE' : 'FIRST SEEN'} OUTSIDE UEFA'S PUBLISHED WINDOWS`
      : state === 'rescheduled'
        ? `MATCHDAY ${baseline.md} · RESCHEDULED — NOW OUTSIDE ITS UEFA WINDOW`
        : `MATCHDAY ${baseline.md} · COMPUTED — UEFA WINDOW ${range}`
    lines.set(key, { key, state, text })
  }
  return [...lines.values()]
}
