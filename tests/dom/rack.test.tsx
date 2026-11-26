import { act, fireEvent, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { FixturesPage } from '../../src/components/FixturesPage'
import { PosterRack } from '../../src/components/PosterRack'
import { useMotionController } from '../../src/lib/useMotionController'
import { bookWeek, posterBooks } from '../../src/lib/lensSelectors'
import { BY_DATE, META } from '../../src/lib/fixtures'
import { COMPETITION_KEYS } from '../../src/lib/competitions'
import { addDays, startOfWeek, weekdayShort } from '../../src/lib/time'
import { hiddenTabRig, installMatchMedia, intersectionRig, popTo } from './rig'

const all = new Set(COMPETITION_KEYS)
const date = [...BY_DATE].find(([, day]) => day.length >= 26 && new Set(day.map(f => f.competition)).size > 1)![0]
const books = posterBooks(bookWeek(startOfWeek(date), BY_DATE, META.window), all)
function Rack() {
  const { motion, toggle } = useMotionController()
  return <><button onClick={toggle}>Band {motion}</button><PosterRack books={books} now={META.lastSyncAt}
    resting={books[0]!.date} motion={motion} toggleMotion={toggle} /></>
}
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms))
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

it.each(['hover', 'focus', 'touch'])('only an explicit Start releases a %s pause', method => {
  vi.useFakeTimers()
  const v = render(<Rack />)
  const rack = v.getByRole('region')
  const marker = rack.querySelector<HTMLElement>('.rack-marker')!
  if (method === 'hover') { fireEvent.pointerOver(rack); fireEvent.pointerOut(rack) }
  if (method === 'focus') { fireEvent.focus(marker); fireEvent.blur(marker) }
  if (method === 'touch') fireEvent.touchStart(rack)
  expect(rack.querySelector('.rack-hint')).toBeNull()
  expect(rack.querySelector('.rack-faces')?.getAttribute('aria-live')).toBe('polite')
  advance(20000)
  expect(marker.getAttribute('aria-current')).toBe('true')
  expect(document.documentElement.dataset.motion).toBe('on')
  fireEvent.click(v.getByRole('button', { name: 'Start rotation' }))
  advance(10600)
  expect(marker.hasAttribute('aria-current')).toBe(false)
})

it('suspends mid-crossing while hidden or outside the viewport, resuming without catch-up', () => {
  vi.useFakeTimers()
  const visibility = hiddenTabRig()
  const intersection = intersectionRig()
  const v = render(<Rack />)
  const rack = v.getByRole('region')
  const marker = rack.querySelector('.rack-marker')!
  intersection.set(rack, true)
  advance(9900)
  expect(rack.querySelector('[data-crossing="auto"]')).toBeTruthy()
  visibility.set(true)
  advance(60000)
  intersection.set(rack, false)
  visibility.set(false)
  advance(60000)
  expect(marker.getAttribute('aria-current')).toBe('true')
  intersection.set(rack, true)
  advance(510)
  expect(marker.getAttribute('aria-current')).toBe('true')
  advance(90)
  expect(marker.hasAttribute('aria-current')).toBe(false)
  visibility.restore()
  intersection.restore()
})

it('draws hold progress from active time and suspends the line outside the viewport', () => {
  vi.useFakeTimers()
  const visibility = hiddenTabRig()
  const intersection = intersectionRig()
  const v = render(<Rack />)
  const rack = v.getByRole('region')
  const line = () => rack.querySelector<HTMLElement>('.rack-marker[aria-current] .rack-hold')
  intersection.set(rack, true)
  expect(line()?.style.animationDuration).toBe('9000ms')
  advance(3000)
  intersection.set(rack, false)
  expect(line()?.style.animationPlayState).toBe('paused')
  advance(60000)
  intersection.set(rack, true)
  expect(line()?.style.animationDelay).toBe('-3000ms')
  advance(6100)
  expect(line()).toBeNull()
  advance(1800)
  expect(line()?.style.animationDuration).toBe('7000ms')
  fireEvent.focus(rack.querySelector('.rack-marker')!)
  expect(line()).toBeNull()
  visibility.restore()
  intersection.restore()
})

it.each([false, true])('mirrors motion in both directions and respects reduced motion (%s)', reduced => {
  installMatchMedia({ reducedMotion: reduced })
  vi.useFakeTimers()
  const v = render(<Rack />)
  const stop = v.container.querySelector('.rack-stop')!
  expect(stop.hasAttribute('aria-pressed')).toBe(false)
  if (reduced) {
    advance(18000)
    expect(v.container.querySelector('.rack-marker')?.getAttribute('aria-current')).toBe('true')
    fireEvent.click(stop)
    expect(localStorage.getItem('kickoff-motion')).toBeNull()
  }
  expect(v.getByText('Band on')).toBeTruthy()
  fireEvent.click(stop)
  expect(localStorage.getItem('kickoff-motion')).toBe('off')
  fireEvent.click(v.getByText('Band off'))
  expect(document.documentElement.dataset.motion).toBe('on')
  advance(10600)
  expect(v.container.querySelector('.rack-marker')?.hasAttribute('aria-current')).toBe(false)
})

it('commits a horizontal drag, springs back below threshold, and ignores vertical travel', () => {
  const v = render(<Rack />)
  const faces = v.container.querySelector('.rack-faces')!
  const first = v.container.querySelector('.rack-marker')!
  function drag(dx: number, dy: number) {
    const at = (x: number, y: number) => ({ pointerType: 'touch', pointerId: 1, isPrimary: true, button: 0, clientX: x, clientY: y })
    fireEvent.pointerDown(faces, at(100,100))
    fireEvent.pointerMove(faces, at(100 + dx,100 + dy))
    fireEvent.pointerUp(faces, at(100 + dx,100 + dy))
  }
  drag(-9, 0)
  expect(first.getAttribute('aria-current')).toBe('true')
  drag(-80, 180)
  expect(first.getAttribute('aria-current')).toBe('true')
  drag(-60, 0)
  expect(first.hasAttribute('aria-current')).toBe(false)
})

it('opens all rows, keeps the resting marker, focuses the heading and restores the opener', () => {
  window.history.replaceState(null, '', '?date=' + date)
  const v = render(<FixturesPage lens="poster" today={date} motion="off" />)
  const spine = v.container.querySelector<HTMLButtonElement>(`.book-spine[data-date="${date}"]`)!
  const marker = v.container.querySelector('[aria-current="true"]')
  fireEvent.click(spine)
  expect(document.activeElement).toBe(v.container.querySelector('.opened-book h2'))
  expect(v.container.querySelectorAll('.opened-book [data-fixture-id]')).toHaveLength(BY_DATE.get(date)!.length)
  expect(v.container.querySelector('.more-stories,.week-gap,.shelf-note')).toBeNull()
  expect(spine.dataset.reading).toBe('true')
  expect(v.container.querySelector('[aria-current="true"]')).toBe(marker)
  expect(location.search).toBe('?date=' + date)
  fireEvent.click(v.container.querySelector('.book-back')!)
  expect(document.activeElement).toBe(spine)
})

it('follows a corrected request clock during the first hold and starts from that cover', () => {
  vi.useFakeTimers()
  const renderRack = (rest: number) => <PosterRack books={books} now={META.lastSyncAt} resting={books[rest]!.date} motion="on" />
  const v = render(renderRack(0))
  advance(300)
  v.rerender(renderRack(1))
  const center = () => v.container.querySelector<HTMLElement>('.rack-slide[data-position="center"]')!.dataset.date
  expect(center()).toBe(books[1]!.date)
  advance(8800)
  expect(center()).toBe(books[1]!.date)
  advance(1600)
  expect(center()).toBe(books[2]?.date ?? 'register')
})

it('holds the opened week across an unpinned Sunday rollover, and gives focus back on closing', () => {
  const sunday = [...BY_DATE.keys()].find(d => weekdayShort(d) === 'Sun')!
  const v = render(<FixturesPage lens="poster" today={sunday} motion="off" />)
  const spine = v.container.querySelector<HTMLButtonElement>(`.book-spine[data-date="${sunday}"]`)!
  fireEvent.click(spine)
  v.rerender(<FixturesPage lens="poster" today={addDays(sunday, 1)} motion="off" />)
  expect(v.container.querySelector('.opened-book [data-week-date]')?.getAttribute('data-week-date')).toBe(sunday)
  expect(location.search).toBe('')
  fireEvent.click(v.container.querySelector('.book-back')!)
  expect(document.activeElement).toBe(spine)
})

it('takes the muted spine to its real date with the current filters and league', () => {
  const start = [...BY_DATE.keys()].find(d => {
    const week = bookWeek(startOfWeek(d), BY_DATE, META.window)
    const next = bookWeek(addDays(startOfWeek(d), 7), BY_DATE, META.window)
    return [week, next].every(w => posterBooks(w, new Set(['pl'])).length > 0)
  })!
  window.history.replaceState(null, '', '?only=pl&league=ucl&date=' + start)
  const v = render(<FixturesPage lens="poster" today={start} motion="off" />)
  const next = v.container.querySelector<HTMLButtonElement>('.book-spine[data-upcoming]')!
  const expected = next.dataset.date
  fireEvent.click(next)
  const params = new URLSearchParams(location.search)
  expect([params.get('date'), params.get('only'), params.get('league')]).toEqual([expected,'pl','ucl'])
  expect(v.container.querySelector('.opened-book')).toBeNull()
})

it('waits for growth, keeps a surviving filtered volume and closes on removal, navigation or lens change', () => {
  vi.useFakeTimers()
  const url = '?date=' + date
  window.history.replaceState(null, '', url)
  const v = render(<FixturesPage lens="poster" today={date} motion="on" />)
  const open = () => fireEvent.click(v.container.querySelector(`.book-spine[data-date="${date}"]`)!)
  const opened = () => v.container.querySelector('.opened-book')
  const faceBounds = new DOMRect(30, 70, 330, 413)
  vi.spyOn(v.container.querySelector('.rack-slide[data-position="center"]')!, 'getBoundingClientRect').mockReturnValue(faceBounds)
  open()
  const stock = v.container.querySelector<HTMLElement>('.opening-stock')!
  expect([stock.style.left, stock.style.top, stock.style.width, stock.style.height]).toEqual(['30px','70px','330px','413px'])
  advance(219)
  expect(opened()).toBeNull()
  advance(1)
  expect(opened()).toBeTruthy()
  v.rerender(<FixturesPage lens="poster" today={date.slice(0,8) + '28'} motion="on" />)
  expect(opened()).toBeTruthy()
  act(() => popTo(url + '&only=' + BY_DATE.get(date)![0]!.competition))
  expect(opened()?.querySelector('.week-hidden')).toBeTruthy()
  act(() => popTo(url + '&only='))
  expect(opened()).toBeNull()
  act(() => popTo(url))
  expect(opened()).toBeNull()
  open(); advance(220)
  act(() => popTo('?date=2000-01-01'))
  expect(opened()).toBeNull()
  act(() => popTo(url))
  open(); advance(220)
  v.rerender(<FixturesPage lens="ledger" today={date} motion="on" />)
  v.rerender(<FixturesPage lens="poster" today={date} motion="on" />)
  expect(opened()).toBeNull()
})
