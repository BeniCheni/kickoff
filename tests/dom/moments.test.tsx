import { afterEach, beforeEach, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import App from '../../src/App'
import { MomentsPage } from '../../src/components/MomentsPage'
import { MOMENTS, type Moment } from '../../src/lib/moments'
import { parseTab } from '../../src/lib/urlCodecs'
import { installMatchMedia, popTo, primeClock } from './rig'

const moment: Moment = {
  id: 'illustrative', category: 'highlights', fixtureId: 'ucl:outside-window', title: 'Illustrative highlights',
  source: { name: 'Rights holder', url: 'https://example.com/highlights' }, curatedAt: '2026-09-09T23:00:00Z',
  fixture: { home: { name: 'Home club' }, away: { name: 'Away club' }, competition: 'ucl', kickoffUtc: '2026-09-08T19:00:00Z', venueTz: 'Europe/London', timeConfidence: 'exact', status: 'full_time' },
}
let release: () => void
beforeEach(() => { installMatchMedia(); release = primeClock(new Date('2026-09-10T16:00:00Z')); MOMENTS.splice(0) })
afterEach(() => { cleanup(); release(); MOMENTS.splice(0) })

it('renders the empty-first banner and one sentence, without cards, categories or a false stamp', () => {
  const { container } = render(<MomentsPage />)
  expect(screen.getByText('No moments curated yet.')).toBeTruthy()
  expect(screen.getByText(/Hand-curated/)).toBeTruthy()
  expect(container.querySelectorAll('[data-moment-card],section,img')).toHaveLength(0)
  expect(screen.queryByText(/Last curated/)).toBeNull()
  const tint = container.querySelector('.bg-floodlight-bg')!
  expect(tint.querySelector('[class*="text-ink-muted"]')).toBeNull()
})
it('renders only populated categories in their fixed order and uses the curation stamp', () => {
  MOMENTS.push(moment, { ...moment, id: 'preview', category: 'prematch', curatedAt: '2026-09-10T01:00:00Z' })
  const { container } = render(<MomentsPage />)
  expect([...container.querySelectorAll('h2')].map(h => h.textContent)).toEqual(['Pre-match', 'Highlights'])
  expect(screen.getByText('Last curated 2026-09-10 01:00 UTC')).toBeTruthy()
  expect(screen.queryByText('Celebrations')).toBeNull()
})
it('keeps the credited still in its frame and the solid link outside, with no playback', () => {
  MOMENTS.push({ ...moment, still: { url: 'https://example.com/still.jpg', credit: 'Rights holder' } }, { ...moment, id: 'without-still' })
  const { container } = render(<MomentsPage />)
  const cards = container.querySelectorAll<HTMLElement>('[data-moment-card]')
  expect(cards).toHaveLength(2)
  for (const frame of container.querySelectorAll('[data-moment-frame]')) expect(frame.textContent?.trim()).toBe('')
  const img = cards[0]!.querySelector('img')!
  expect(img.getAttribute('loading')).toBe('lazy')
  expect(img.classList.contains('object-cover')).toBe(true)
  expect(cards[1]!.querySelector('img')).toBeNull()
  expect(within(cards[0]!).getByText('Still: Rights holder').closest('[data-moment-frame]')).toBeNull()
  const link = within(cards[0]!).getByRole('link', { name: /Open at Rights holder/ })
  expect(link.getAttribute('href')).toBe(moment.source.url)
  expect(link.getAttribute('target')).toBe('_blank')
  expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  expect(link.className).not.toContain('dashed')
  expect(container.querySelectorAll('video,audio,iframe')).toHaveLength(0)
  expect(within(cards[0]!).getByText('Home club v Away club · Champions League')).toBeTruthy()
  expect(within(cards[0]!).getByText('8:00 PM local')).toBeTruthy()
  expect(within(cards[0]!).getByText(/3:00 PM EDT/)).toBeTruthy()
})
it('uses the missing-zone fallback and never dresses a placeholder up as an exact clock', () => {
  MOMENTS.push({ ...moment, fixture: { ...moment.fixture, venueTz: undefined } })
  const view = render(<MomentsPage />)
  expect(screen.getByText('local time not known')).toBeTruthy()
  expect(screen.getByText(/3:00 PM EDT/)).toBeTruthy()
  for (const change of [{ timeConfidence: 'tbd' as const }, { status: 'postponed' as const }]) {
    MOMENTS[0] = { ...moment, fixture: { ...moment.fixture, ...change } }
    view.rerender(<MomentsPage />)
    expect(screen.getByText('Kickoff time not confirmed at curation')).toBeTruthy()
    expect(screen.queryByText(/3:00 PM EDT/)).toBeNull()
  }
})
it('pushes Moments navigation and preserves only/date through a visit and back', () => {
  const start = '/?only=ucl%2Cpl&date=2026-09-12'
  window.history.replaceState(null, '', start)
  render(<App />)
  const length = window.history.length
  fireEvent.click(screen.getByRole('button', { name: 'Moments' }))
  expect(window.history.length).toBe(length + 1)
  const params = new URLSearchParams(window.location.search)
  expect(params.get('tab')).toBe('moments')
  expect(params.get('only')).toBe('ucl,pl')
  expect(params.get('date')).toBe('2026-09-12')
  act(() => popTo(start))
  expect(screen.getByRole('button', { name: 'Fixtures' }).getAttribute('aria-current')).toBe('page')
  expect(new URLSearchParams(window.location.search).get('only')).toBe('ucl,pl')
  expect(new URLSearchParams(window.location.search).get('date')).toBe('2026-09-12')
  expect(parseTab('moments')).toBe('moments')
  expect(parseTab('nonsense')).toBe('fixtures')
})
