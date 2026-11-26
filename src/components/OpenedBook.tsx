import { useEffectEvent, useLayoutEffect, useRef, type RefObject } from 'react'
import { bookCalendar } from '../lib/time'
import { COVER_LIBRARY, matchCount, nextKickoffId, staleLiveIds, type MatchdayBook } from '../lib/lensSelectors'
import { FIXTURES, totalOn } from '../lib/fixtures'
import { BookCover } from './BookCover'
import { PosterPart } from './PosterPart'

/** Scale only the empty stock. The separate live cover translates without scaling its type. */
export function OpeningShell({ book, now, bounds, target, duration, finish }: {
  book: MatchdayBook; now: string; bounds: DOMRect; target: RefObject<HTMLDivElement | null>; duration: number; finish: () => void
}) {
  const stock = useRef<HTMLDivElement>(null)
  const ink = useRef<HTMLDivElement>(null)
  const complete = useEffectEvent(finish)
  useLayoutEffect(() => {
    const dest = target.current!.getBoundingClientRect()
    const dx = dest.left - bounds.left
    const dy = dest.top - bounds.top
    const timing = { duration, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' as const }
    const shell = stock.current?.animate?.([
      { transform: 'none' },
      { transform: `translate(${dx}px, ${dy}px) scale(${dest.width / Math.max(1,bounds.width)}, ${156 / Math.max(1,bounds.height)})` },
    ], timing)
    const glyphs = ink.current?.animate?.([
      { transform: 'none', opacity: 1 }, { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 },
    ], timing)
    if (shell) shell.onfinish = () => complete()
    const timer = shell ? undefined : window.setTimeout(() => complete(), duration)
    return () => { window.clearTimeout(timer); shell?.cancel(); glyphs?.cancel() }
  }, [bounds, duration, target])
  const box = { left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height }
  return <div aria-hidden="true" className="book-growth">
    <div ref={stock} className="opening-stock" style={box} />
    <div ref={ink} className="opening-ink" style={box}><BookCover book={book} now={now} league="" /></div>
  </div>
}

function backLine(book?: MatchdayBook) {
  if (!book) return '‹ Back to the week'
  const day = Number(book.date.slice(8))
  const suffix = day >= 11 && day <= 13 ? 'th' : ({1: 'st', 2: 'nd', 3: 'rd'}[day % 10] ?? 'th')
  const title = COVER_LIBRARY[book.closed ? 'closed' : book.slot][0]
  return `‹ ${bookCalendar(book.date).weekday} the ${day}${suffix} · ${matchCount(book.shown.length).toLowerCase()} · in ${title}`
}

export function OpenedBook({ book, back, now, close }: {
  book: MatchdayBook; back?: MatchdayBook; now: string; close: () => void
}) {
  const heading = useRef<HTMLHeadingElement>(null)
  useLayoutEffect(() => { heading.current?.focus() }, [book.date])
  return <div className="opened-book">
    <button type="button" className="book-back" onClick={close}>{backLine(back)}</button>
    <PosterPart {...book} hidden={totalOn(book.date) - book.shown.length} volumeHeading={heading}
      nowUtcIso={now} next={nextKickoffId(FIXTURES, now)} stale={staleLiveIds(FIXTURES, now)} />
  </div>
}
