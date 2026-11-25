import { weekdayShort } from '../lib/time'
import { groupWeekDays, type DayInfo } from '../lib/lensSelectors'
import { FixtureRows } from './FixtureRow'

const EMPTY: ReadonlySet<string> = new Set()

export function LedgerWeek({ days, hot = EMPTY, stale = EMPTY, nowUtcIso }: {
  days: DayInfo[]; hot?: ReadonlySet<string>; stale?: ReadonlySet<string>; nowUtcIso?: string
}) {
  const count = days.reduce((sum, day) => sum + day.shown.length, 0)
  // A day the snapshot never fetched is not a day with nothing on: say so instead of counting it.
  const outside = days.filter(day => day.covered === false).length
  return <div className="ledger-week">
    {groupWeekDays(days).map(group => {
      const { date, shown, total, isToday } = group[0]!
      if (total === 0) {
        return <p key={date} className="week-gap">
          {group.map((day, i) => <span key={day.date} data-week-date={day.date} data-hidden={day.total}>
            {i > 0 && ' · '}{weekdayShort(day.date).toUpperCase()} {Number(day.date.slice(8))}
          </span>)}{group[0]!.covered === false ? ' — OUTSIDE THE SNAPSHOT' : ' — NO FIXTURES'}
        </p>
      }
      const hidden = total - shown.length
      return <section key={date} data-week-date={date} data-hidden={hidden}>
        <h3 className="ledger-date">{weekdayShort(date)} {Number(date.slice(8))} · {shown.length} {shown.length === 1 ? 'match' : 'matches'}{isToday && ' · Today'}</h3>
        {hidden > 0 && <p className="week-hidden">{hidden} hidden by filters</p>}
        <FixtureRows fixtures={shown} lens="ledger" nowUtcIso={nowUtcIso} hot={hot} stale={stale} />
      </section>
    })}
    <p className="week-count">END OF WEEK · {outside === days.length ? 'OUTSIDE THE SNAPSHOT' : <>
      {count} {count === 1 ? 'FIXTURE' : 'FIXTURES'}
      {days.filter(day => day.shown.length).map(day =>
        <span key={day.date}> · {weekdayShort(day.date).toUpperCase()} {day.shown.length}</span>)}
      {outside > 0 && <span> · {outside} {outside === 1 ? 'DAY' : 'DAYS'} OUTSIDE THE SNAPSHOT</span>}
    </>}</p>
  </div>
}
