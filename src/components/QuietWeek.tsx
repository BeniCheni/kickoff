import { useContext } from 'react'
import { SearchContext } from '../lib/useUrlState'
import { encodeOnly } from '../lib/urlCodecs'
import { BY_DATE } from '../lib/fixtures'
import type { CompetitionKey } from '../lib/competitions'
import { addDays, bookCalendar, weekRange } from '../lib/time'
import { COVER_LIBRARY } from '../lib/lensSelectors'
import { CoverBand } from './CoverBand'

export function QuietWeek({ start, today, active, now }: { start: string; today: string; active: ReadonlySet<CompetitionKey>; now: string }) {
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
  return <section className="quiet-week" data-stock="black">
    <div className="quiet-art" aria-hidden="true" />
    <div className="quiet-block">
      <h2 className="book-title">{title}</h2>
      <p className="book-date">{range.toUpperCase().replace('–', ' – ')}{year} · NO FIXTURES</p>
      {upcoming && <p>Nothing to stake until {bookCalendar(next).longDate}.</p>}
      <p className="book-tagline">{tagline}</p>
      <p>Nothing on the rack this week</p>
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
