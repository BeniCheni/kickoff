import { addDays, weekdayShort, niceDate } from '../lib/time'
import { fixturesOn, totalOn } from '../lib/fixtures'
import { FixtureRow } from './FixtureRow'
import type { CompetitionKey } from '../lib/competitions'

export function WeekView({
  weekStart,
  active,
  today,
}: {
  weekStart: string
  active: ReadonlySet<CompetitionKey>
  today: string
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  return (
    <div>
      {days.map((date) => {
        const shown = fixturesOn(date, active)
        const total = totalOn(date)
        const isToday = date === today
        return (
          <div
            key={date}
            className={[
              'mb-2 rounded border bg-surface px-3.5 py-3',
              isToday ? 'border-pitch ring-1 ring-pitch/30' : 'border-line',
            ].join(' ')}
          >
            <div className="flex items-baseline gap-3">
              <span className="w-9 text-[11px] tracking-wide text-ink-muted uppercase">
                {weekdayShort(date)}
              </span>
              <span className="font-display text-[18px] font-semibold">{Number(date.slice(8))}</span>
              {isToday && (
                <span className="rounded bg-pitch px-1.5 py-px text-[9px] font-bold tracking-wide text-white uppercase">
                  Today
                </span>
              )}
              {shown.length > 0 && (
                <span className="ml-auto text-[11px] text-ink-muted">
                  {shown.length} {shown.length === 1 ? 'match' : 'matches'}
                </span>
              )}
            </div>

            {shown.length > 0 ? (
              shown.map((f) => <FixtureRow key={f.id} fixture={f} />)
            ) : total > 0 ? (
              <div className="mt-1 text-[13px] text-ink-muted">
                🔎 {total} {total === 1 ? 'match' : 'matches'} hidden by your filters.
              </div>
            ) : (
              <div className="mt-1 text-[13px] text-ink-muted">
                No fixtures on {niceDate(date)}.
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
