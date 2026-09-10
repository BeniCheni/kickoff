import { MATCHDAY_WINDOWS, MATCHDAY_WINDOWS_SEASON, type CompetitionKey } from './competitions'
import { brooklynDate } from './time'

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
