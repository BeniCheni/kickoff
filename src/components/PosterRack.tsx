import { useUrlState } from '../lib/useUrlState'
import { COMPETITIONS, type CompetitionKey } from '../lib/competitions'
import { encodeLeague, parseLeague } from '../lib/urlCodecs'
import { COVER_LIBRARY, type MatchdayBook } from '../lib/lensSelectors'
import { bookCalendar } from '../lib/time'
import { BookCover } from './BookCover'

/** Flat stock in reading order. Only the resting cover and its neighbours are in view. */
export function PosterRack({ books, resting, now }: { books: MatchdayBook[]; resting: string; now: string }) {
  const [league] = useUrlState<CompetitionKey>('league', 'laliga', encodeLeague, parseLeague)
  const slides = [...books, null]
  const index = slides.findIndex(book => (book?.date ?? 'register') === resting)
  const names = slides.map((book, i) => book
    ? `${COVER_LIBRARY[book.closed ? 'closed' : book.slot][0]}, ${bookCalendar(book.date).longDate}, ${i + 1} of ${slides.length}`
    : `The Register, ${COMPETITIONS[league].name} table`)
  return <div className="poster-rack" role="region" aria-roledescription="carousel" aria-label="The Rack">
    <div className="rack-faces" aria-live="off">
      {slides.map((book, i) => {
        const offset = (i - index + slides.length) % slides.length
        const position = offset === 0 ? 'center' : offset === 1 ? 'right' : offset === slides.length - 1 ? 'left' : 'outside'
        return <div className="rack-slide" role="group" aria-roledescription="slide" aria-label={names[i]} data-position={position} data-date={book?.date ?? 'register'} key={book?.date ?? 'register'}>
          <BookCover book={book} now={now} league={COMPETITIONS[league].name} />
        </div>
      })}
    </div>
    <div className="rack-markers">{slides.map((book, i) =>
      <button type="button" aria-label={names[i]} aria-current={i === index || undefined} className="rack-marker" data-resting={i === index || undefined} key={book?.date ?? 'register'}>
        <span><b>{COVER_LIBRARY[book ? book.closed ? 'closed' : book.slot : 'register'][0]}</b></span>
      </button>)}</div>
  </div>
}
