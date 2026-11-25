import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FixturesPage } from '../../src/components/FixturesPage'
import { useNow } from '../../src/lib/useNow'
import { primeClock, tick } from './rig'

vi.mock('../../src/data/fixtures.json', async () => {
  const { edgeFixture } = await import('../fixtures/edgeFixtures')
  return { default: [
    edgeFixture({ id: 'fri', competition: 'pl', kickoffUtc: '2026-11-20T19:00:00.000Z' }),
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
