import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FixturesPage } from '../../src/components/FixturesPage'
import { BY_DATE } from '../../src/lib/fixtures'
import { addDays, startOfWeek } from '../../src/lib/time'
import { restingBook, type MatchdayBook } from '../../src/lib/lensSelectors'
import { act } from '@testing-library/react'
import { CoverBand } from '../../src/components/CoverBand'
import { edgeFixture, cannotClose } from '../fixtures/edgeFixtures'
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
    render(<PosterWeek blocks={[{ kind: 'big', date: '2026-09-05', isToday: true, dominant: 'pl', fixtures }]} />)
    expect(screen.getByText('3 MATCHES')).toBeTruthy()
    expect(screen.getByText('3 kickoffs, times not yet set by the league').dataset.voice).toBe('amber')
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
    view.rerender(<CoverBand shown={[edgeFixture({ status: 'full_time' })]} now={now} />)
    expect(screen.getByText('FT').textContent).toBe('FT')
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
