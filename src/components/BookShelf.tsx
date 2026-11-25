import { catalogueNumber, COVER_LIBRARY, matchCount, type MatchdayBook } from '../lib/lensSelectors'
import { posterDayTitle } from '../lib/time'

function Spine({ book, reading, upcoming = false }: { book: MatchdayBook; reading: boolean; upcoming?: boolean }) {
  const title = COVER_LIBRARY[book.closed ? 'closed' : book.slot][0]
  const count = matchCount(book.shown.length)
  return <div className="book-spine" data-date={book.date} data-reading={reading || undefined} data-upcoming={upcoming || undefined}>
    <p className="spine-head">FT{reading && <small>NOW READING</small>}</p>
    {upcoming ? <p className="spine-next">Next week · {posterDayTitle(book.date)} · {count.toLowerCase()}</p>
      : <p className="spine-title">{title}</p>}
    <p className="spine-foot">{catalogueNumber(book.date)}{!upcoming && <>{' '}<span>{count}</span></>}</p>
  </div>
}

export function BookShelf({ books, resting, next, gaps }: {
  books: MatchdayBook[]; resting: string; next?: MatchdayBook; gaps: string[]
}) {
  return <section className="book-shelf" data-stock="black">
    <h2>ON THE SHELF THIS WEEK</h2>
    {books.length ? <>
      <div className="shelf-spines">
        {books.map(book => <Spine key={book.date} book={book} reading={book.date === resting} />)}
        {next && <Spine book={next} reading={false} upcoming />}
      </div>
      {gaps.map(line => <p className="shelf-note" key={line}>{line}</p>)}
    </> : <p className="shelf-note">All matchday books are hidden by filters.</p>}
  </section>
}
