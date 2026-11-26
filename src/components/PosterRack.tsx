import { useRef, useState, type PointerEvent, type CSSProperties } from 'react'
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

type RackProps = {
  books: MatchdayBook[]
  resting: string
  now: string
  motion?: Motion
  toggleMotion?: () => void
  locked?: boolean
  opening?: boolean
  onOpen?: (book: MatchdayBook, source: HTMLButtonElement) => void
  onRegister?: () => void
}

export function PosterRack({
  books, resting, now, motion = 'off', toggleMotion, locked = false, opening = false, onOpen, onRegister,
}: RackProps) {
  const [league] = useUrlState<CompetitionKey>('league', 'laliga', encodeLeague, parseLeague)
  const slides = [...books, null]
  const rest = slides.findIndex(book => (book?.date ?? 'register') === resting)
  const root = useRef<HTMLDivElement>(null)
  const rotation = useRackRotation(root, slides.length, rest, motion, locked || opening)
  const index = locked ? rest : rotation.index
  const crossing = locked ? undefined : rotation.crossing
  const paused = !locked && motion === 'on' && (rotation.held !== null || (slides.length > 1 && !rotation.auto))
  function toggle() {
    if (locked || motion === 'off' || !paused) toggleMotion?.()
    rotation.restart()
  }
  const drag = useRef<{ id: number; x: number; y: number; start: number; horizontal: boolean } | null>(null)
  const suppressTap = useRef(false)
  const [travel, setTravel] = useState(0)
  function down(event: PointerEvent<HTMLDivElement>) {
    if (locked || opening || !event.isPrimary || event.button !== 0) return
    rotation.pause()
    suppressTap.current = false
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, start: event.timeStamp, horizontal: false }
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    const touch = drag.current
    if (!touch || touch.id !== event.pointerId || slides.length < 2) return
    const dx = event.clientX - touch.x
    const dy = event.clientY - touch.y
    if (!touch.horizontal) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return
      if (Math.abs(dy) >= Math.abs(dx)) { drag.current = null; return }
      touch.horizontal = true
      event.currentTarget.setPointerCapture?.(event.pointerId)
      suppressTap.current = true
    }
    setTravel(dx)
  }
  function release(event: PointerEvent<HTMLDivElement>) {
    const touch = drag.current
    if (!touch || touch.id !== event.pointerId) return
    drag.current = null
    setTravel(0)
    if (!touch.horizontal || event.type === 'pointercancel') return
    const dx = event.clientX - touch.x
    const distance = Math.abs(dx)
    const velocity = distance / Math.max(1, event.timeStamp - touch.start)
    if (distance >= 48 || (distance >= 12 && velocity >= .5)) {
      rotation.select((index - Math.sign(dx) + slides.length) % slides.length)
    }
  }
  const names = slides.map((book, i) => book
    ? `${COVER_LIBRARY[book.closed ? 'closed' : book.slot][0]}, ${bookCalendar(book.date).longDate}, ${i + 1} of ${slides.length}`
    : `The Register, ${COMPETITIONS[league].name} table`)
  return <div ref={root} onFocusCapture={rotation.pause} onPointerEnter={rotation.pause} onTouchStart={rotation.pause}
    className="poster-rack" role="region" aria-roledescription="carousel" aria-label="The Rack">
    <div className="rack-controls" data-many={slides.length > 4 || undefined}>
      <button type="button" className="rack-stop" onClick={toggle}>
        <span className="rack-stop-label">{paused ? 'Start rotation' : <>
          <span className="motion-when-on">Stop rotation</span><span className="motion-when-off">Start rotation</span>
        </>}</span>
      </button>
      <div className="rack-markers">{slides.map((book, i) =>
        <button type="button" className="rack-marker" aria-label={names[i]} disabled={locked && i !== rest}
          onClick={() => rotation.select(i)} aria-current={i === index || undefined}
          data-resting={i === index || undefined} key={book?.date ?? 'register'}>
          <span><b>{COVER_LIBRARY[book ? book.closed ? 'closed' : book.slot : 'register'][0]}</b></span>
        </button>)}</div>
      {!locked && !paused && slides.length > 1 && <em className="rack-hint motion-when-on">Tap to open · swipe</em>}
    </div>
    <div className="rack-faces" onPointerDown={down} onPointerMove={move} onPointerUp={release} onPointerCancel={release}
      onClickCapture={event => { if (suppressTap.current && event.detail) { event.stopPropagation(); suppressTap.current = false } }}
      style={{ '--drag': travel + 'px' } as CSSProperties} data-reader={rotation.held !== null || undefined} data-dragging={travel !== 0 || undefined}
      aria-live={rotation.held !== null ? 'polite' : 'off'} data-crossing={crossing ? 'auto' : undefined}>
      <span className="sr-only">{rotation.held !== null ? names[index] : ''}</span>
      {crossing && slides.map((book, i) => {
        const from = lane(i, crossing.from, slides.length)
        const to = lane(i, crossing.to, slides.length)
        // The old left edge leaves to the left, the new right edge enters from the right.
        const startLane = from === 2 && to === -1 ? -2 : from
        const endLane = to === 2 && from === -1 ? -2 : to
        const x = startLane + (endLane - startLane) * crossing.progress
        return <div aria-hidden="true" className="rack-moving-stock" key={book?.date ?? 'register'}
          style={{ '--lane': x, '--depth': Math.min(1, Math.abs(x)) } as CSSProperties} />
      })}
      {slides.map((book, i) => {
        const position = positions[lane(i, crossing?.text ?? index, slides.length) + 1]
        return <div className="rack-slide" role="group" aria-roledescription="slide" aria-label={names[i]} style={crossing ? { opacity: position === 'center' ? crossing.opacity : 0 } : undefined}
          data-position={position} data-date={book?.date ?? 'register'} key={book?.date ?? 'register'}>
          <button type="button" className="rack-face-hit" tabIndex={position === 'center' ? 0 : -1}
            aria-label={(position === 'center' ? 'Open ' : 'Show ') + names[i]}
            disabled={locked && position !== 'center'}
            onClick={event => {
              rotation.select(i)
              if (position !== 'center') return
              if (book) onOpen?.(book, event.currentTarget)
              else onRegister?.()
            }} />
          <BookCover book={book} now={now} league={COMPETITIONS[league].name} />
        </div>
      })}
    </div>
  </div>
}
