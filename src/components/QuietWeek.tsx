import { useContext } from 'react'
import { SearchContext } from '../lib/useUrlState'
import { encodeOnly } from '../lib/urlCodecs'
import { BY_DATE, META } from '../lib/fixtures'
import type { CompetitionKey } from '../lib/competitions'
import { addDays, bookCalendar, niceDate, weekRange } from '../lib/time'
import { COVER_LIBRARY, type Coverage } from '../lib/lensSelectors'
import { CoverBand } from './CoverBand'

/**
 * The quiet cover's two claims about the week: the date line's suffix and the body line.
 * `coverage` says how much of the week the snapshot fetched (`weekCoverage`); `snapshot` is
 * the snapshot's inclusive Brooklyn range. A covered empty week really had no fixtures; an
 * uncovered day was never fetched, so it must not be called empty.
 */
export function quietCopy(coverage: 'full' | 'partial' | 'none', snapshot: Coverage): { suffix: string; body: string } {
  const span = `${niceDate(snapshot.from)} to ${niceDate(snapshot.to)}`
  if (coverage === 'none') return { suffix: 'OUTSIDE THE SNAPSHOT', body: `The snapshot covers ${span}` }
  if (coverage === 'partial') return {
    suffix: 'PARTLY OUTSIDE THE SNAPSHOT',
    body: `Nothing on the rack on the days the snapshot covers, ${span}`,
  }
  return { suffix: 'NO FIXTURES', body: 'Nothing on the rack this week' }
}

export function QuietWeek({ start, today, active, now, coverage = 'full' }: {
  start: string; today: string; active: ReadonlySet<CompetitionKey>; now: string; coverage?: 'full' | 'partial' | 'none'
}) {
  const search = useContext(SearchContext)
  const end = addDays(start, 6)
  const next = [...BY_DATE.keys()].sort().find(date => date > end && BY_DATE.get(date)!.some(f => active.has(f.competition)))
  const upcoming = next && next >= today
  const range = weekRange(start, start)
  const year = start.slice(0, 4) === end.slice(0, 4) ? ', ' + end.slice(0, 4) : ''
  const params = new URLSearchParams(typeof window === 'undefined' ? search ?? '' : window.location.search)
  if (next) params.set('date', next)
  const only = encodeOnly(active)
  if (only === null) params.delete('only')
  else params.set('only', only)
  const [title, tagline] = COVER_LIBRARY.quiet
  const { suffix, body } = quietCopy(coverage, META.window)
  return <section className="quiet-week" data-stock="black">
    <div className="quiet-art" aria-hidden="true" />
    <div className="quiet-block">
      <h2 className="book-title">{title}</h2>
      <p className="book-date">{range.toUpperCase().replace('–', ' – ')}{year} · {suffix}</p>
      {upcoming && <p>Nothing to stake until {bookCalendar(next).longDate}.</p>}
      <p className="book-tagline">{tagline}</p>
      <p>{body}</p>
      {next && <div className="quiet-next">
        {upcoming && <>
          <h3>COMING NEXT</h3>
          <CoverBand shown={BY_DATE.get(next)!.filter(f => active.has(f.competition))} now={now} />
        </>}
        <a href={'?' + params.toString()}>NEXT VOLUME ›</a>
      </div>}
    </div>
  </section>
}
