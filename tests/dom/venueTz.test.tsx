import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { FixtureRow } from '../../src/components/FixtureRow'
import { NextUpStrip } from '../../src/components/NextUpStrip'
import { TonightSlate } from '../../src/components/TonightSlate'
import type { Fixture } from '../../src/lib/schema'
import { primeClock } from './rig'

const state = vi.hoisted(() => ({ fixtures: [] as Fixture[] }))
vi.mock('../../src/lib/fixtures', async (original) => ({
  ...await original<typeof import('../../src/lib/fixtures')>(),
  upcoming: () => state.fixtures,
  planSlate: () => ({ date: '2026-09-10', slate: state.fixtures, isTonight: true }),
}))
const f: Fixture = {
  id: 'ucl:synthetic-sabah', competition: 'ucl', kickoffUtc: '2026-09-10T16:45:00.000Z',
  home: { name: 'Sabah FK' }, away: { name: 'Synthetic opponent' }, status: 'scheduled', timeConfidence: 'exact',
  source: { provider: 'espn', sourceId: 'synthetic-sabah', fetchedAt: '2026-09-10T12:00:00.000Z' },
}
let release: (() => void) | undefined
afterEach(() => { release?.(); release = undefined })
describe('missing venue UI', () => {
  it('renders amber unknown-local and the real Brooklyn pill without a spurious next-day label', () => {
    render(<FixtureRow fixture={f} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('local time not known').className).toContain('text-floodlight-strong')
    expect(screen.getByText(/12:45 PM EDT/)).toBeTruthy()
    expect(screen.queryByText(/next day|prev\./)).toBeNull()
  })
  it.each([NextUpStrip, TonightSlate])('%s keeps its Brooklyn-only output when the venue zone disappears', (Hero) => {
    release = primeClock(new Date('2026-09-10T12:00:00Z'))
    state.fixtures = [{ ...f, venueTz: 'Europe/London' }]
    const active = new Set(['ucl'] as const)
    const view = render(<Hero today="2026-09-10" active={active} />)
    const before = view.container.textContent
    state.fixtures = [f]
    view.rerender(<Hero today="2026-09-10" active={new Set(active)} />)
    expect(view.container.textContent).toBe(before)
    expect(view.container.textContent).toContain('12:45')
  })
})
