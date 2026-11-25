import { catalogueNumber, COVER_LIBRARY, type MatchdayBook } from '../lib/lensSelectors'
import { BookDateLine } from './BookDateLine'
import { CoverBand } from './CoverBand'
import { MatchdayLines } from './MatchdayLines'

export function BookCover({ book, now, league }: { book: MatchdayBook | null; now: string; league: string }) {
  const slot = book ? book.closed ? 'closed' : book.slot : 'register'
  const [title, tagline] = COVER_LIBRARY[slot]
  return <div className="book-cover" data-stock="black" data-slot={slot}>
    <div className="book-scrim">
      <div className="book-title-block">
        <h2 className="book-title">{title}</h2>
        {book ? <>
          <BookDateLine {...book} />
          <MatchdayLines fixtures={book.shown} />
        </> : <p className="book-date">{league}</p>}
        <p className="book-tagline">{tagline}</p>
        {book && <CoverBand shown={book.shown} now={now} />}
      </div>
      <p className="book-imprint">FERGIE TIME BOOKS{book && <span>{catalogueNumber(book.date)}</span>}</p>
    </div>
  </div>
}
