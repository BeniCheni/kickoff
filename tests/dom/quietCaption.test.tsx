import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { QuietWeek } from '../../src/components/QuietWeek'
import type { Fixture } from '../../src/lib/schema'
import { BY_DATE } from '../../src/lib/fixtures'
import { primeClock } from './rig'

/**
 * PR #387's Pass 2.5: the quiet cover said "Nothing to stake until <next fixture>" for a week
 * the snapshot never fetched, ruling out days that may have held matches. The caption belongs
 * to fully covered weeks only; COMING NEXT and NEXT VOLUME still point at the known fixture.
 * Dates are synthetic (Mon 7 – Sun 13 Jan 2030, next fixture Mon 14), never the committed data.
 */
vi.mock('../../src/lib/fixtures', async (original) => {
  const real = await original<typeof import('../../src/lib/fixtures')>()
  const { edgeFixture } = await import('../fixtures/edgeFixtures')
  const next = edgeFixture({ id: 'synthetic:mon14', kickoffUtc: '2030-01-14T20:00:00.000Z' })
  return { ...real, BY_DATE: new Map([['2030-01-14', [next]]]), META: { ...real.META, window: { from: '2029-06-01', to: '2030-06-01' } } }
})
const NEXT: Fixture = BY_DATE.get('2030-01-14')![0]!

let release: (() => void) | undefined
afterEach(() => { release?.(); release = undefined })

function cover(coverage: 'full' | 'partial' | 'none') {
  release = primeClock(new Date('2030-01-06T17:00:00Z'))
  const { container } = render(<QuietWeek start="2030-01-07" today="2030-01-06" active={new Set([NEXT.competition])}
    now="2030-01-06T17:00:00Z" coverage={coverage} />)
  return container
}

describe('the quiet cover rules out days only when the snapshot fetched them', () => {
  it('a fully covered empty week keeps its staking caption', () => {
    const container = cover('full')
    expect(container.textContent).toContain('Nothing to stake until Monday 14 January.')
    expect(container.textContent).toContain('COMING NEXT')
  })

  it.each(['none', 'partial'] as const)('a %s-coverage week drops it but still points at the next fixture', coverage => {
    const container = cover(coverage)
    expect(container.textContent).not.toMatch(/Nothing to stake/)
    expect(container.textContent).toContain('COMING NEXT')
    expect(container.querySelector('.quiet-next a')?.getAttribute('href')).toContain('date=2030-01-14')
  })
})
