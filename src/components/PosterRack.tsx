import { useRef, type CSSProperties } from 'react'
import { useRackRotation } from '../lib/useRackRotation'
import { useUrlState } from '../lib/useUrlState'
import { COMPETITIONS, type CompetitionKey } from '../lib/competitions'
import { encodeLeague, parseLeague } from '../lib/urlCodecs'
import { COVER_LIBRARY, type MatchdayBook } from '../lib/lensSelectors'
import type { Motion } from '../lib/motion'
import { bookCalendar } from '../lib/time'
import { BookCover } from './BookCover'

function lane(slide: number, center: number, count: number) {
  const offset = (slide - center + count) % count
  if (offset <= 1) return offset
  return offset === count - 1 ? -1 : 2
}
const positions = ['left', 'center', 'right', 'outside'] as const
export function PosterRack({ books, resting, now, motion = 'off', toggleMotion }: { books: MatchdayBook[]; resting: string; now: string; motion?: Motion; toggleMotion?: () => void }) {
  const [league] = useUrlState<CompetitionKey>('league', 'laliga', encodeLeague, parseLeague)
  const slides = [...books, null]
  const rest = slides.findIndex(book => (book?.date ?? 'register') === resting)
  const root = useRef<HTMLDivElement>(null)
  const rotation = useRackRotation(root, slides.length, rest, motion)
  const { index, crossing } = rotation
  const paused = rotation.held !== null || (slides.length > 1 && !rotation.auto && motion === 'on')
  function toggle() {
    if (motion === 'off' || !paused) toggleMotion?.()
    rotation.restart()
  }
  const names = slides.map((book, i) => book
    ? `${COVER_LIBRARY[book.closed ? 'closed' : book.slot][0]}, ${bookCalendar(book.date).longDate}, ${i + 1} of ${slides.length}`
    : `The Register, ${COMPETITIONS[league].name} table`)
  return <div ref={root} onFocusCapture={rotation.pause} onPointerEnter={rotation.pause} onTouchStart={rotation.pause}
    className="poster-rack" role="region" aria-roledescription="carousel" aria-label="The Rack">
    <div className="rack-controls" data-many={slides.length > 4 || undefined}>
      <button type="button" className="rack-stop" onClick={toggle}>
        {paused ? <span>Start rotation</span> : <>
          <span className="motion-when-on">Stop rotation</span><span className="motion-when-off">Start rotation</span>
        </>}
      </button>
      <div className="rack-markers">{slides.map((book, i) =>
        <button type="button" aria-label={names[i]} aria-current={i === index || undefined} className="rack-marker" data-resting={i === index || undefined} key={book?.date ?? 'register'}>
          <span><b>{COVER_LIBRARY[book ? book.closed ? 'closed' : book.slot : 'register'][0]}</b></span>
        </button>)}</div>
      {!paused && slides.length > 1 && <em className="rack-hint motion-when-on">Tap to open · swipe</em>}
    </div>
    <div className="rack-faces" aria-live={rotation.held !== null ? 'polite' : 'off'} data-crossing={crossing ? 'auto' : undefined}>
      {crossing && slides.map((book, i) => {
        const from = lane(i, crossing.from, slides.length)
        const to = lane(i, crossing.to, slides.length)
        // The old left edge leaves to the left, the new right edge enters from the right.
        const a = from === 2 && to === -1 ? -2 : from
        const b = to === 2 && from === -1 ? -2 : to
        const x = a + (b - a) * crossing.progress
        return <div aria-hidden="true" className="rack-moving-stock" key={book?.date ?? 'register'}
          style={{ '--lane': x, '--depth': Math.min(1, Math.abs(x)) } as CSSProperties} />
      })}
      {slides.map((book, i) => {
        const position = positions[lane(i, crossing?.text ?? index, slides.length) + 1]
        return <div className="rack-slide" role="group" aria-roledescription="slide" aria-label={names[i]} style={crossing ? { opacity: position === 'center' ? crossing.opacity : 0 } : undefined}
          data-position={position} data-date={book?.date ?? 'register'} key={book?.date ?? 'register'}>
          <BookCover book={book} now={now} league={COMPETITIONS[league].name} />
        </div>
      })}
    </div>
  </div>
}
