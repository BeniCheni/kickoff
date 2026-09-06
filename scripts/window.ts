import type { Fixture } from '../src/lib/schema'
import { brooklynDate } from '../src/lib/time'

/** Inclusive Brooklyn calendar-date window, matching the sync's from/to dates.
 * Keep this predicate in scripts/: the app formats time but does not own sync windows. */
export function inWindow(fixture: Pick<Fixture, 'kickoffUtc'>, from: string, to: string): boolean {
  const date = brooklynDate(fixture.kickoffUtc)
  return date >= from && date <= to
}
