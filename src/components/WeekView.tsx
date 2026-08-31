import { addDays } from '../lib/time'
import { fixturesOn, totalOn } from '../lib/fixtures'
import { planPosterWeek, type DayInfo } from '../lib/lensSelectors'
import { LedgerWeek } from './LedgerWeek'
import { PosterWeek } from './PosterWeek'
import type { CompetitionKey } from '../lib/competitions'
import type { Lens } from '../lib/lens'

/**
 * The weekly calendar. Computes the seven days' fixture lists once, then hands them to a
 * per-lens renderer — Poster gets its own; Ledger's date spine also serves Broadcast,
 * whose deltas are CSS-only.
 */
export function WeekView({
  weekStart,
  active,
  today,
  lens,
}: {
  weekStart: string
  active: ReadonlySet<CompetitionKey>
  today: string
  lens: Lens
}) {
  const days: DayInfo[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i)
    return { date, shown: fixturesOn(date, active), total: totalOn(date), isToday: date === today }
  })

  if (lens === 'poster') return <PosterWeek blocks={planPosterWeek(days)} />
  return <LedgerWeek days={days} />
}
