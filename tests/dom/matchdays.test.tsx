import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MatchdayLines } from '../../src/components/MatchdayLines'
import { LedgerWeek } from '../../src/components/LedgerWeek'
import { PosterWeek } from '../../src/components/PosterWeek'
import { FixtureRow } from '../../src/components/FixtureRow'
import { normalizeEvent } from '../../scripts/providers/espn'
import { fixtureSchema } from '../../src/lib/schema'
import { posterSubLine } from '../../src/lib/lensSelectors'
import payload from '../fixtures/espn/ucl-md1.json'
const f = fixtureSchema.parse(normalizeEvent(payload.events[0], 'ucl', '2026-09-10T12:00:00Z'))

describe('day-level matchday provenance', () => {
  it('labels the baseline computed and names the source window', () => {
    render(<MatchdayLines fixtures={[f]} />)
    expect(screen.getByText('MATCHDAY 1 · COMPUTED — UEFA WINDOW 8–10 SEP')).toBeTruthy()
  })
  it('a move into MD2 renders RESCHEDULED from MD1, never a computed MD2', () => {
    render(<MatchdayLines fixtures={[{ ...f, kickoffUtc: '2026-10-13T19:00:00Z' }]} />)
    expect(screen.getByText('MATCHDAY 1 · RESCHEDULED — NOW OUTSIDE ITS UEFA WINDOW')).toBeTruthy()
    expect(screen.queryByText(/MATCHDAY 2/)).toBeNull()
  })
  it('admits the out-of-window first sighting and distinguishes its later in-window move', () => {
    const view = render(<MatchdayLines fixtures={[{ ...f, round: undefined, kickoffUtc: '2026-09-30T19:00:00Z' }]} />)
    expect(screen.getByText("MATCHDAY — · DATE OUTSIDE UEFA'S PUBLISHED WINDOWS").className).toContain('italic')
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
  it('keeps the provenance above Ledger/Broadcast rows and on both Poster headers', () => {
    const { container } = render(<>
      <LedgerWeek days={[{ date: '2026-09-08', shown: [f], total: 1, isToday: false }]} />
      <PosterWeek blocks={[{ kind: 'big', date: '2026-09-08', fixtures: [f], isToday: false, dominant: 'ucl' }, { kind: 'small', date: '2026-09-09', fixtures: [f], isToday: false }]} />
    </>)
    expect(container.querySelectorAll('[data-matchday-state]')).toHaveLength(3)
    expect(container.querySelector('.pb-\\[5px\\]')?.nextElementSibling?.classList.contains('border-t')).toBe(true)
  })
  it('says competition for an entirely European day while preserving mixed/domestic wording', () => {
    expect(posterSubLine([f])).toContain('1 COMPETITION')
    expect(posterSubLine([f, { ...f, competition: 'pl' }])).toContain('2 LEAGUES')
  })
  it('keeps the competition name in readable muted ink while the glyph retains its hue', () => {
    render(<FixtureRow fixture={f} />)
    const meta = screen.getByText(/Champions League/)
    expect(meta.className).toBe('text-ink-muted')
    expect(meta.getAttribute('style')).toBeNull()
    expect(meta.querySelector('span')!.style.color).toBe('rgb(139, 111, 232)')
  })
})
