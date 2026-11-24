import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MatchdayLines } from '../../src/components/MatchdayLines'
import { LedgerWeek } from '../../src/components/LedgerWeek'
import { PosterWeek } from '../../src/components/PosterWeek'
import { FixtureRow } from '../../src/components/FixtureRow'
import { normalizeEvent } from '../../scripts/providers/espn'
import { fixtureSchema } from '../../src/lib/schema'
import { bookDateLine } from '../../src/lib/lensSelectors'
import payload from '../fixtures/espn/ucl-md1.json'
const f = fixtureSchema.parse(normalizeEvent(payload.events[0], 'ucl', '2026-09-10T12:00:00Z'))

describe('day-level matchday provenance', () => {
  it('labels the baseline computed and names the source window', () => {
    render(<MatchdayLines fixtures={[f]} />)
    expect(screen.getByText('MATCHDAY 1 · COMPUTED — UEFA WINDOW 8–10 SEP').dataset.voice).toBe('ink')
  })
  it('a move into MD2 renders RESCHEDULED from MD1, never a computed MD2', () => {
    render(<MatchdayLines fixtures={[{ ...f, kickoffUtc: '2026-10-13T19:00:00Z' }]} />)
    expect(screen.getByText('MATCHDAY 1 · RESCHEDULED — NOW OUTSIDE ITS UEFA WINDOW').dataset.voice).toBe('amber')
    expect(screen.queryByText(/MATCHDAY 2/)).toBeNull()
  })
  it('admits the out-of-window first sighting and distinguishes its later in-window move', () => {
    const view = render(<MatchdayLines fixtures={[{ ...f, round: undefined, kickoffUtc: '2026-09-30T19:00:00Z' }]} />)
    expect(screen.getByText("MATCHDAY — · DATE OUTSIDE UEFA'S PUBLISHED WINDOWS").dataset.voice).toBe('amber')
    view.rerender(<MatchdayLines fixtures={[{ ...f, round: undefined, kickoffUtc: '2026-10-13T19:00:00Z' }]} />)
    expect(screen.getByText("MATCHDAY — · FIRST SEEN OUTSIDE UEFA'S PUBLISHED WINDOWS")).toBeTruthy()
  })
  it('shows two baselines on one day and collapses duplicate provenance lines', () => {
    const moved = { ...f, kickoffUtc: '2026-10-13T19:00:00Z' }
    const { container } = render(<MatchdayLines fixtures={[moved, moved, { ...moved, id: 'ucl:other', round: '2' }]} />)
    expect(container.querySelectorAll('[data-matchday-state]')).toHaveLength(2)
    expect(screen.getByText(/MATCHDAY 1 · RESCHEDULED/)).toBeTruthy()
    expect(screen.getByText(/MATCHDAY 2 · COMPUTED/)).toBeTruthy()
  })
  it('keeps the provenance above Ledger rows and on both Poster headers', () => {
    const { container } = render(<>
      <LedgerWeek days={[{ date: '2026-09-08', shown: [f], total: 1, isToday: false }]} />
      <PosterWeek days={[{ date: '2026-09-08', shown: [f], total: 1, isToday: false }, { date: '2026-09-09', shown: [f], total: 1, isToday: false }]} />
    </>)
    expect(container.querySelectorAll('[data-matchday-state]')).toHaveLength(3)
    expect(container.querySelector('.ledger-week [data-matchday-state]')?.parentElement?.nextElementSibling?.getAttribute('data-fixture-id')).toBe(f.id)
  })
  it('counts European and mixed days without calling a cup a league', () => {
    expect(bookDateLine('2026-09-08', [f], false).count).toBe('1 MATCH')
    expect(bookDateLine('2026-09-08', [f, { ...f, competition: 'pl' }], false).count).toBe('2 MATCHES')
  })
  it('keeps the competition name in readable muted ink while the glyph retains its hue', () => {
    render(<FixtureRow fixture={f} />)
    const meta = screen.getByText(/Champions League/)
    expect(meta.closest('.fixture-meta')?.getAttribute('data-voice')).toBe('muted')
    expect(meta.getAttribute('style')).toBeNull()
    expect(meta.querySelector('i')!.style.backgroundColor).toBe('rgb(139, 111, 232)')
  })
})

it('starts each distinct UEFA line at its first governed row in a mixed day', () => {
  const other = { ...f, id: 'other', competition: 'uel' as const }
  const moved = { ...f, id: 'moved', kickoffUtc: '2026-10-13T19:00:00Z' }
  const fixtures = [other, f, { ...f, id: 'same' }, moved]
  const { container } = render(<>
    <LedgerWeek days={[{ date: '2026-10-13', shown: fixtures, total: 4, isToday: false }]} />
    <PosterWeek days={[{ date: '2026-10-13', shown: fixtures, total: fixtures.length, isToday: false }]} />
  </>)
  for (const section of container.querySelectorAll('section')) {
    const lines = [...section.querySelectorAll('[data-matchday-state]')]
    expect(lines.map(line => line.parentElement?.nextElementSibling?.getAttribute('data-fixture-id'))).toEqual([f.id, moved.id])
  }
})
