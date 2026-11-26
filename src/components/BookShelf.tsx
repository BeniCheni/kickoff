import { catalogueNumber, COVER_LIBRARY, matchCount, type MatchdayBook } from '../lib/lensSelectors'
import { posterDayTitle } from '../lib/time'

function Spine({ book, reading, upcoming = false, onSelect }: { book: MatchdayBook; reading: boolean; upcoming?: boolean; onSelect?: (book: MatchdayBook, source: HTMLButtonElement) => void }) {
  const title = COVER_LIBRARY[book.closed ? 'closed' : book.slot][0]
  const count = matchCount(book.shown.length)
  return <button type="button" onClick={event => onSelect?.(book, event.currentTarget)} className="book-spine" data-date={book.date} data-reading={reading || undefined} data-upcoming={upcoming || undefined}>
    <span className="spine-head">FT{reading && <small>NOW READING</small>}</span>
    {upcoming ? <span className="spine-next">Next week · {posterDayTitle(book.date)} · {count.toLowerCase()}</span>
      : <span className="spine-title">{title}</span>}
    <span className="spine-foot">{catalogueNumber(book.date)}{!upcoming && <>{' '}<span>{count}</span></>}</span>
  </button>
}

export function BookShelf({ books, resting, next, gaps, onOpen, onNext }: {
  books: MatchdayBook[]; resting: string; next?: MatchdayBook; gaps: string[]
  onOpen?: (book: MatchdayBook, source: HTMLButtonElement) => void; onNext?: (date: string) => void
}) {
  return <section className="book-shelf" data-stock="black">
    <h2>ON THE SHELF THIS WEEK</h2>
    {books.length ? <>
      <div className="shelf-spines">
        {books.map(book => <Spine onSelect={onOpen} key={book.date} book={book} reading={book.date === resting} />)}
        {next && <Spine onSelect={book => onNext?.(book.date)} book={next} reading={false} upcoming />}
      </div>
      {gaps.map(line => <p className="shelf-note" key={line}>{line}</p>)}
    </> : <p className="shelf-note">All matchday books are hidden by filters.</p>}
  </section>
}
