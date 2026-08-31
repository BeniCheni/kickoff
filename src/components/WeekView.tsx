import { useMemo } from 'react'
import { addDays } from '../lib/time'
import { FIXTURES, fixturesOn, totalOn } from '../lib/fixtures'
import { hotFixtureIds, planPosterWeek, type DayInfo } from '../lib/lensSelectors'
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

  // LIVE + next-kickoff rows carry data-hot; the glow itself only renders under Broadcast.
  const hot = useMemo(() => hotFixtureIds(FIXTURES, new Date().toISOString()), [])

  if (lens === 'poster') return <PosterWeek blocks={planPosterWeek(days)} />
  return <LedgerWeek days={days} hot={hot} />
}
