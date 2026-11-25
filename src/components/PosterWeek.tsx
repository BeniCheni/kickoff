import { groupWeekDays, isFinal, type DayInfo } from '../lib/lensSelectors'
import { weekdayShort } from '../lib/time'
import { BookDateLine } from './BookDateLine'
import { PosterPart } from './PosterPart'

export function PosterWeek({ days, stale, next, nowUtcIso }: {
  days: DayInfo[]; next?: string | null; nowUtcIso?: string; stale?: ReadonlySet<string>
}) {
  let part = 0
  return <div className="poster-week">{groupWeekDays(days).map(group => {
    const { date, total, shown, closed } = group[0]!
    if (!total) return <p className="week-gap" key={date}>
      {group.map(day => weekdayShort(day.date).toUpperCase() + ' ' + Number(day.date.slice(8))).join(' · ')} — NO FIXTURES
    </p>
    if (!shown.length) return <section key={date} data-week-date={date} className="poster-hidden week-gap">
      <BookDateLine date={date} shown={shown} closed={false} />
      <p className="week-hidden">{total} hidden by filters</p>
    </section>
    return <PosterPart key={date} date={date} shown={shown} hidden={total - shown.length}
      part={++part} closed={closed ?? (total === shown.length && shown.every(isFinal))}
      next={next} stale={stale} nowUtcIso={nowUtcIso} />
  })}</div>
}
