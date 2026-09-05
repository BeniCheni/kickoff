import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
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
    expect(screen.getByText('3 MATCHES · 1 LEAGUE · 3 TBC')).toBeTruthy()
    expect(screen.queryByText(/FIRST KICKOFF/)).toBeNull()
    expect(screen.queryByText(/3:00 PM/)).toBeNull()
  })
})
