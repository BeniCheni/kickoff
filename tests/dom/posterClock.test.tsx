import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FixturesPage } from '../../src/components/FixturesPage'
import { useNow } from '../../src/lib/useNow'
import { primeClock, tick } from './rig'

vi.mock('../../src/data/fixtures.json', async () => {
  const { edgeFixture } = await import('../fixtures/edgeFixtures')
  return { default: [
    edgeFixture({ id: 'fri', competition: 'pl', kickoffUtc: '2026-11-20T19:00:00.000Z' }),
    edgeFixture({ id: 'mon-pl', competition: 'pl', kickoffUtc: '2026-11-23T17:00:00.000Z' }),
    edgeFixture({ id: 'mon-es', kickoffUtc: '2026-11-23T19:00:00.000Z' }),
    edgeFixture({ id: 'tue-early', competition: 'ucl', kickoffUtc: '2026-11-24T18:00:00.000Z' }),
    edgeFixture({ id: 'tue-last', competition: 'ucl', kickoffUtc: '2026-11-24T20:00:00.000Z' }),
    edgeFixture({ id: 'wed', competition: 'ucl', kickoffUtc: '2026-11-25T20:00:00.000Z' }),
  ] }
})

function ClockedPoster() {
  return <FixturesPage today={useNow().today} lens="poster" />
}

it('keeps the next volume link when its matchday becomes yesterday in Brooklyn', () => {
  const release = primeClock(new Date('2026-11-21T04:59:59Z'))
  try {
    window.history.replaceState(null, '', '?date=2026-11-09&only=pl&league=pl')
    const { container } = render(<ClockedPoster />)
    const href = () => new URL((screen.getByRole('link', { name: 'NEXT VOLUME ›' }) as HTMLAnchorElement).href)
    expect(href().searchParams.get('date')).toBe('2026-11-20')
    expect(href().searchParams.get('only')).toBe('pl')
    expect(href().searchParams.get('league')).toBe('pl')
    expect(screen.getByText('Nothing to stake until Friday 20 November.')).toBeTruthy()
    expect(screen.getByText('COMING NEXT')).toBeTruthy()
    expect(container.querySelector('.quiet-next .cover-band')).toBeTruthy()
    tick(1050)
    expect(screen.queryByText(/Nothing to stake until/)).toBeNull()
    expect(screen.queryByText('COMING NEXT')).toBeNull()
    expect(container.querySelector('.quiet-next .cover-band')).toBeNull()
    expect(href().searchParams.get('date')).toBe('2026-11-20')
    expect(href().searchParams.get('only')).toBe('pl')
  } finally {
    release()
  }
})

it('counts only visible fixtures on the next-week spine', () => {
  window.history.replaceState(null, '', '?date=2026-11-16&only=pl')
  const { container } = render(<FixturesPage today="2026-11-16" lens="poster" />)
  expect(container.querySelector('[data-upcoming] .spine-next')?.textContent).toBe('Next week · Mon 23 Nov · 1 match')
})

it('moves the resting cover, marker and reading spine together at the last kickoff with motion off', () => {
  const release = primeClock(new Date('2026-11-24T17:59:59Z'))
  try {
    document.documentElement.dataset.motion = 'off'
    const { container } = render(<ClockedPoster />)
    const resting = () => [
      container.querySelector<HTMLElement>('.rack-slide[data-position="center"]')?.dataset.date,
      container.querySelector('.rack-marker[data-resting] b')?.textContent,
      container.querySelector<HTMLElement>('.book-spine[data-reading]')?.dataset.date,
    ]
    const tuesday = ['2026-11-24', 'The First Night', '2026-11-24']
    expect(resting()).toEqual(tuesday)
    tick(1050)
    expect(resting()).toEqual(tuesday)
    tick(2 * 60 * 60 * 1000)
    expect(resting()).toEqual(['2026-11-25', 'The Second Night', '2026-11-25'])
  } finally {
    release()
  }
})
