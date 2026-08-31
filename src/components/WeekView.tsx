import { addDays } from '../lib/time'
import { fixturesOn, totalOn } from '../lib/fixtures'
import { LedgerWeek, type DayInfo } from './LedgerWeek'
import type { CompetitionKey } from '../lib/competitions'

/**
 * The weekly calendar. Computes the seven days' fixture lists once, then hands them to a
 * per-lens renderer (Ledger's date spine also serves Broadcast; Poster gets its own).
 */
export function WeekView({
  weekStart,
  active,
  today,
}: {
  weekStart: string
  active: ReadonlySet<CompetitionKey>
  today: string
}) {
  const days: DayInfo[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i)
    return { date, shown: fixturesOn(date, active), total: totalOn(date), isToday: date === today }
  })

  return <LedgerWeek days={days} />
}
