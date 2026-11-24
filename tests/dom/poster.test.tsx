import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FixturesPage } from '../../src/components/FixturesPage'
import { BY_DATE } from '../../src/lib/fixtures'
import { addDays, startOfWeek } from '../../src/lib/time'
import { restingBook, type MatchdayBook } from '../../src/lib/lensSelectors'
import { act, fireEvent } from '@testing-library/react'
import { CoverBand } from '../../src/components/CoverBand'
import { edgeFixture, cannotClose } from '../fixtures/edgeFixtures'
import { BookShelf } from '../../src/components/BookShelf'
import { PosterPart } from '../../src/components/PosterPart'
import { PosterWeek } from '../../src/components/PosterWeek'
import type { Fixture } from '../../src/lib/schema'

describe('Poster day-header wiring', () => {
  it('renders the extracted TBC segment without promoting filler times', () => {
    const fixtures: Fixture[] = Array.from({ length: 3 }, (_, i) => ({
      id: `pl:synthetic-${i}`, competition: 'pl',
      home: { name: `Home ${i}` }, away: { name: `Away ${i}` },
      kickoffUtc: '2026-09-05T19:00:00.000Z', venueTz: 'Europe/London',
      status: 'scheduled', timeConfidence: 'round_placeholder',
      source: { provider: 'espn', sourceId: `synthetic-${i}`, fetchedAt: '2026-09-05T12:00:00.000Z' },
    }))
    render(<PosterWeek days={[{ date: '2026-09-05', isToday: true, shown: fixtures, total: fixtures.length }]} />)
    expect(screen.getByText('3 MATCHES')).toBeTruthy()
    expect(screen.getByText('SAT 5 SEP')).toBeTruthy()
    expect(screen.getByText('FIRST KICKOFF NOT SET').dataset.voice).toBe('amber')
    expect(screen.queryByText(/3:00 PM/)).toBeNull()
  })
})

describe('the lower band', () => {
  const now = '2026-11-22T20:15:00Z'
  it('prints each stored final, including the shootout, with no invented result', () => {
    const view = render(<CoverBand shown={cannotClose} now={now} />)
    expect([...view.container.querySelectorAll('.band-result')].map(el => el.textContent)).toEqual(['2–1 FT', '2–1 AET', '3–3 (2–4) PENS'])
    expect(view.container.querySelector('[data-band-fixture="abandoned"]')).toBeNull()
    expect(view.container.querySelector('.band-summary')).toBeNull()
    view.rerender(<CoverBand shown={[edgeFixture({ status: 'full_time' })]} now={now} />)
    expect(screen.getByText('FT').textContent).toBe('FT')
  })
  it('caps unique kickoffs at three and keeps the count open when a remaining match is scheduled', () => {
    const day = Array.from({ length: 5 }, (_, i) => edgeFixture({
      id: 'held-' + i, kickoffUtc: '2026-11-22T' + (14 + i) + ':00:00Z',
      status: i === 4 ? 'scheduled' : 'full_time',
    }))
    const view = render(<CoverBand shown={day} now={now} />)
    expect(view.container.querySelectorAll('[data-band-fixture]')).toHaveLength(3)
    expect(screen.getByText('+ 2 more, from 12:00 PM ET')).toBeTruthy()
  })
  it('keeps a live score in ink and the last seen score with KICKED OFF', () => {
    const f = edgeFixture({ status: 'in_play', result: { home: 1, away: 0 } })
    const view = render(<CoverBand shown={[f]} now={now} />)
    expect(screen.getByText('LIVE').dataset.voice).toBe('alarm')
    expect(screen.getByText('LIVE').parentElement?.textContent).toBe('1–0 LIVE')
    view.rerender(<CoverBand shown={[f]} now="2026-11-23T02:00:00Z" />)
    expect(screen.getByText('1–0 KICKED OFF').dataset.voice).toBe('amber')
    view.rerender(<CoverBand shown={[{ ...f, status: 'scheduled' }]} now={now} />)
    expect(screen.getByText('KICKED OFF').textContent).toBe('KICKED OFF')
  })
  it('names unique instants across groups, stopping before the first tie, and accounts for unset kickoffs separately', () => {
    const later = edgeFixture({ id: 'later', competition: 'ucl' })
    const first = edgeFixture({ id: 'first', kickoffUtc: '2026-11-22T14:30:00Z' })
    const same = { ...later, id: 'same', kickoffUtc: '2026-11-22T20:00:00Z' }
    const unset = edgeFixture({ id: 'unset', timeConfidence: 'round_placeholder', kickoffUtc: '2026-11-22T10:00:00Z' })
    const view = render(<CoverBand shown={[later, unset, same, first]} now="2026-11-21T12:00:00Z" />)
    expect([...view.container.querySelectorAll('[data-band-fixture]')].map(el => el.getAttribute('data-band-fixture'))).toEqual(['first'])
    expect(screen.getByText('+ 2 more, from 3:00 PM ET')).toBeTruthy()
    expect(screen.getByText('1 kickoff, time not yet set by the league').dataset.voice).toBe('amber')
    expect(screen.getByText('9:30 AM ET')).toBeTruthy()
    expect(screen.getByText('15:30 local')).toBeTruthy()
    expect(view.container.textContent).not.toContain('5:00 AM')
    view.rerender(<CoverBand shown={[{ ...later, status: 'full_time' }, { ...same, status: 'after_extra_time' }]} now={now} />)
    expect(screen.getByText('+ 2 more results')).toBeTruthy()
    expect(view.container.querySelector('[data-band-fixture]')).toBeNull()
  })
})

it('reads the Rack week, shown counts and Register league from URL state, including popstate', () => {
  const uclDate = [...BY_DATE].find(([, day]) => day.some(f => f.competition === 'ucl'))![0]
  const monday = startOfWeek(uclDate)
  const query = '?date=' + monday + '&only=ucl&league=pl'
  window.history.replaceState(null, '', query)
  const view = render(<FixturesPage today={addDays(monday, 14)} lens="poster" />)
  const expected = Array.from({ length: 7 }, (_, i) => addDays(monday, i)).filter(d => BY_DATE.get(d)?.some(f => f.competition === 'ucl'))
  const slides = () => [...view.container.querySelectorAll<HTMLElement>('.rack-slide')]
  expect(slides().map(el => el.dataset.date)).toEqual([...expected, 'register'])
  for (const el of slides().slice(0, -1)) {
    const count = BY_DATE.get(el.dataset.date!)!.filter(f => f.competition === 'ucl').length
    expect(el.querySelector('.book-date')?.textContent).toContain(count + (count === 1 ? ' MATCH ·' : ' MATCHES ·'))
  }
  expect(slides().at(-1)?.textContent).toContain('Premier League')
  act(() => {
    window.history.replaceState(null, '', query.replace('only=ucl', 'only='))
    window.dispatchEvent(new PopStateEvent('popstate'))
  })
  expect(slides().map(el => el.dataset.date)).toEqual(['register'])
  expect(view.container.querySelector('.poster-rack button, .poster-rack [tabindex], .poster-rack [role]')).toBeNull()
  window.history.replaceState(null, '', '/')
})

it('rests on the next eligible matchday this week, the first open book elsewhere, or the last closed one', () => {
  const books: MatchdayBook[] = ['2026-11-23', '2026-11-24', '2026-11-25'].map(date => ({
    date, shown: [edgeFixture({ kickoffUtc: date + 'T20:00:00Z' })], closed: false, slot: 'midweek',
  }))
  const now = '2026-11-24T21:00:00Z'
  expect(restingBook(books, '2026-11-23', '2026-11-24', now)).toBe('2026-11-25')
  books[0]!.closed = true
  expect(restingBook(books, '2026-11-23', '2026-11-30', now)).toBe('2026-11-24')
  expect(restingBook(books.map(b => ({ ...b, closed: true })), '2026-11-23', '2026-11-30', now)).toBe('2026-11-25')
})

it.each([4, 5, 6, 26])('opens every shown row in place when a part contains %i matches', count => {
  const fixtures = Array.from({ length: count }, (_, i) => edgeFixture({ id: 'row-' + i }))
  const view = render(<PosterPart date="2026-11-21" shown={fixtures} hidden={3} closed={false} part={2} />)
  expect(screen.getByText('PART TWO')).toBeTruthy()
  const ids = () => [...view.container.querySelectorAll<HTMLElement>('[data-fixture-id]')].map(el => el.dataset.fixtureId)
  expect(ids()).toEqual(fixtures.slice(0, count >= 6 ? 4 : count).map(f => f.id))
  if (count <= 5) return expect(screen.queryByRole('button')).toBeNull()
  const button = screen.getByRole('button', { name: 'More stories · ' + (count - 4) + ' MATCHES · SAT · SHOW' })
  expect(button.getAttribute('aria-expanded')).toBe('false')
  fireEvent.click(button)
  expect(button.getAttribute('aria-expanded')).toBe('true')
  expect(button.textContent).toContain('HIDE')
  expect(ids()).toEqual(fixtures.map(f => f.id))
  expect(view.container.querySelectorAll('.stadium-clock')).toHaveLength(count)
  fireEvent.click(button)
  expect(ids()).toHaveLength(4)
})

it('keeps an all-hidden today in one dated account and skips it in the part numbers', () => {
  const fixture = edgeFixture()
  const view = render(<PosterWeek days={[
    { date: '2026-11-21', total: 1, shown: [fixture], isToday: false },
    { date: '2026-11-22', total: 2, shown: [], isToday: true },
    { date: '2026-11-23', total: 1, shown: [fixture], isToday: false },
  ]} />)
  expect([...view.container.querySelectorAll('.part-plate span')].map(el => el.textContent)).toEqual(['PART ONE', 'PART TWO'])
  const hidden = view.container.querySelector('.poster-hidden')!
  expect(hidden.querySelector('.book-date')?.textContent).toBe('SUN 22 NOV · 0 MATCHES')
  expect(hidden.querySelector('.week-hidden')?.textContent).toBe('2 hidden by filters')
  expect(hidden.querySelector('.part-plate, [data-fixture-id]')).toBeNull()
  expect(view.container.textContent).not.toMatch(/today/i)
})

it('keeps only visible date spines and labels the next week with its filtered count', () => {
  const book: MatchdayBook = { date: '2026-11-20', slot: 'fri', closed: false, shown: [edgeFixture()] }
  const view = render(<BookShelf books={[book]} resting={book.date} next={{ ...book, date: '2026-11-23' }}
    gaps={['MON 16 – THU 19 · no books this week']} />)
  expect(screen.getByText('NOW READING').closest('[data-date]')?.getAttribute('data-date')).toBe(book.date)
  expect(screen.getByText('1 MATCH')).toBeTruthy()
  expect(screen.getByText('Next week · Mon 23 Nov · 1 match')).toBeTruthy()
  expect(screen.getByText('MON 16 – THU 19 · no books this week')).toBeTruthy()
  expect(view.container.querySelector('button, a, [tabindex], [role]')).toBeNull()
  view.rerender(<BookShelf books={[]} resting="register" next={book} gaps={[]} />)
  expect(view.container.querySelector('.book-spine')).toBeNull()
  expect(screen.getByText('All matchday books are hidden by filters.')).toBeTruthy()
})

it('gives a genuinely empty week its quiet edition, a real next-volume link and the illustrative foot', () => {
  const dates = [...BY_DATE.keys()].sort()
  const next = dates.find((date, i) => i > 0 && startOfWeek(date) > addDays(startOfWeek(dates[i - 1]!), 7))!
  const start = addDays(startOfWeek(next), -7)
  window.history.replaceState(null, '', '?date=' + start + '&league=pl')
  const view = render(<FixturesPage today={start} lens="poster" />)
  expect(screen.getByText('A Quiet Week')).toBeTruthy()
  expect(screen.getByText('Nothing on the rack this week')).toBeTruthy()
  expect(screen.getByText('A no-bet week is a successful outcome.')).toBeTruthy()
  const link = screen.getByRole('link', { name: 'NEXT VOLUME ›' }) as HTMLAnchorElement
  expect(new URL(link.href).searchParams.get('date')).toBe(next)
  expect(new URL(link.href).searchParams.get('league')).toBe('pl')
  expect(view.container.querySelector('.poster-rack, .week-gap, .book-shelf')).toBeNull()
  expect(screen.getByText('Titles and taglines are ILLUSTRATIVE.')).toBeTruthy()
  window.history.replaceState(null, '', '/')
})
