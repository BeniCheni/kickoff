import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { LedgerWeek } from '../../src/components/LedgerWeek'
import { PosterWeek } from '../../src/components/PosterWeek'
import { quietCopy } from '../../src/components/QuietWeek'
import { addDays } from '../../src/lib/time'
import type { DayInfo } from '../../src/lib/lensSelectors'
import { edgeFixture } from '../fixtures/edgeFixtures'

/**
 * PR #387's Pass 1 (F1), at the component seam: a week the snapshot never fetched must not
 * read "NO FIXTURES" in either lens, and a fetched day beside it keeps its own claims. Dates
 * and coverage are synthetic (Mon 7 – Sun 13 Jan 2030), never read from the committed window.
 */
const MONDAY = '2030-01-07'
const SNAPSHOT = { from: '2029-06-01', to: '2030-01-10' }

function days(covered: (i: number) => boolean, patch: (i: number) => Partial<DayInfo> = () => ({})): DayInfo[] {
  return Array.from({ length: 7 }, (_, i) => ({
    date: addDays(MONDAY, i), shown: [], total: 0, isToday: false, covered: covered(i), ...patch(i),
  }))
}

describe('the Ledger week says when the snapshot did not reach a day', () => {
  it('a fully uncovered week makes no count and no claim of an empty week', () => {
    const { container } = render(<LedgerWeek days={days(() => false)} />)
    expect([...container.querySelectorAll('.week-gap')].map(el => el.textContent))
      .toEqual(['MON 7 · TUE 8 · WED 9 · THU 10 · FRI 11 · SAT 12 · SUN 13 — OUTSIDE THE SNAPSHOT'])
    expect(container.querySelector('.week-count')?.textContent).toBe('END OF WEEK · OUTSIDE THE SNAPSHOT')
    expect(container.textContent).not.toMatch(/NO FIXTURES|0 FIXTURES/)
  })

  it('a partial week keeps an honest empty day, a filtered day and a visible result apart from the uncovered ones', () => {
    const result = edgeFixture({ id: 'synthetic:tue', kickoffUtc: '2030-01-08T20:00:00.000Z', status: 'full_time', result: { home: 2, away: 1 } })
    const week = days(i => i < 4, i => i === 1 ? { shown: [result], total: 1 } : i === 2 ? { total: 3 } : {})
    const { container } = render(<LedgerWeek days={week} />)
    const gaps = [...container.querySelectorAll('p.week-gap')].map(el => el.textContent)
    expect(gaps).toEqual(['MON 7 — NO FIXTURES', 'THU 10 — NO FIXTURES', 'FRI 11 · SAT 12 · SUN 13 — OUTSIDE THE SNAPSHOT'])
    expect(container.querySelectorAll('[data-fixture-id]')).toHaveLength(1)
    expect(container.querySelector('[data-week-date="2030-01-09"] .week-hidden')?.textContent).toBe('3 hidden by filters')
    expect(container.querySelector('.week-count')?.textContent)
      .toBe('END OF WEEK · 1 FIXTURE · TUE 1 · 3 DAYS OUTSIDE THE SNAPSHOT')
  })
})

describe('the Poster week and quiet cover say the same', () => {
  it('splits a covered empty run from an uncovered run', () => {
    const { container } = render(<PosterWeek days={days(i => i < 4)} />)
    expect([...container.querySelectorAll('.week-gap')].map(el => el.textContent)).toEqual([
      'MON 7 · TUE 8 · WED 9 · THU 10 — NO FIXTURES',
      'FRI 11 · SAT 12 · SUN 13 — OUTSIDE THE SNAPSHOT',
    ])
  })

  it('words the quiet cover by how much of the week was fetched', () => {
    expect(quietCopy('full', SNAPSHOT)).toEqual({
      title: 'A Quiet Week', tagline: 'A no-bet week is a successful outcome.',
      suffix: 'NO FIXTURES', body: 'Nothing on the rack this week',
    })
    expect(quietCopy('none', SNAPSHOT)).toEqual({
      title: 'Beyond the Snapshot', tagline: null,
      suffix: 'OUTSIDE THE SNAPSHOT', body: 'The snapshot covers June 1, 2029 to January 10, 2030',
    })
    expect(quietCopy('partial', SNAPSHOT)).toEqual({
      title: 'Beyond the Snapshot', tagline: null, suffix: 'PARTLY OUTSIDE THE SNAPSHOT',
      body: 'Nothing on the rack on the days the snapshot covers, June 1, 2029 to January 10, 2030',
    })
  })
})
