import { describe, expect, it } from 'vitest'
import { bookWeek, groupWeekDays, inCoverage, shelfGaps, weekCoverage, type Coverage } from '../src/lib/lensSelectors'
import { addDays } from '../src/lib/time'
import { edgeFixture } from './fixtures/edgeFixtures'

/**
 * PR #387's Pass 1 (F1): a saved `?date=` link whose week aged out of the snapshot read
 * "NO FIXTURES", as if the matches had never been played. A date outside `meta.json`'s
 * inclusive `window` was never fetched, so it is not an empty day.
 *
 * Every date and coverage range here is synthetic (the week of Mon 7 Jan 2030), so no future
 * sync can make these pass or fail by moving the committed snapshot's window.
 */
const MONDAY = '2030-01-07'
const week = (coverage: Coverage, byDate = new Map()) => bookWeek(MONDAY, byDate, coverage)
const TAIL: Coverage = { from: '2029-06-01', to: '2030-01-10' } // Mon–Thu fetched, Fri–Sun not
const HEAD: Coverage = { from: '2030-01-10', to: '2030-06-01' } // Mon–Wed not fetched, Thu–Sun fetched
const NONE: Coverage = { from: '2030-02-01', to: '2030-06-01' }
const FULL: Coverage = { from: '2029-06-01', to: '2030-06-01' }

describe('snapshot coverage: an unfetched date is never an empty one', () => {
  it('treats both ends of the window as covered and the days beside them as not', () => {
    expect(inCoverage('2030-01-10', TAIL)).toBe(true)
    expect(inCoverage('2030-01-11', TAIL)).toBe(false)
    expect(inCoverage('2030-01-10', HEAD)).toBe(true)
    expect(inCoverage('2030-01-09', HEAD)).toBe(false)
  })

  it('marks each day of the week covered or not, in both directions of a partial week', () => {
    expect(week(TAIL).map(day => day.covered)).toEqual([true, true, true, true, false, false, false])
    expect(week(HEAD).map(day => day.covered)).toEqual([false, false, false, true, true, true, true])
    expect(weekCoverage(week(FULL))).toBe('full')
    expect(weekCoverage(week(TAIL))).toBe('partial')
    expect(weekCoverage(week(HEAD))).toBe('partial')
    expect(weekCoverage(week(NONE))).toBe('none')
  })

  it('never merges a covered empty day into an uncovered run', () => {
    const groups = groupWeekDays(week(TAIL)).map(group => group.map(day => day.date))
    expect(groups).toEqual([
      ['2030-01-07', '2030-01-08', '2030-01-09', '2030-01-10'],
      ['2030-01-11', '2030-01-12', '2030-01-13'],
    ])
  })

  it('names the shelf gaps for what they are', () => {
    const fixture = edgeFixture({ id: 'synthetic:tue', kickoffUtc: '2030-01-08T20:00:00.000Z' })
    const byDate = new Map([['2030-01-08', [fixture]]])
    expect(shelfGaps(week(TAIL, byDate))).toEqual([
      'MON 7 · no books this week',
      'WED 9 – THU 10 · no books this week',
      'FRI 11 – SUN 13 · outside the snapshot',
    ])
    expect(shelfGaps(week(HEAD))).toEqual([
      'MON 7 – WED 9 · outside the snapshot',
      'THU 10 – SUN 13 · no books this week',
    ])
    expect(shelfGaps(week(NONE))).toEqual(['MON 7 – SUN 13 · outside the snapshot'])
    expect(shelfGaps(week(FULL))).toEqual(['MON 7 – SUN 13 · no books this week'])
  })

  it('still counts a fetched day from the snapshot, whatever the coverage says about its neighbours', () => {
    const fixture = edgeFixture({ id: 'synthetic:thu', kickoffUtc: addDays('2030-01-10', 0) + 'T20:00:00.000Z' })
    const days = week(TAIL, new Map([['2030-01-10', [fixture]]]))
    expect(days[3]).toMatchObject({ date: '2030-01-10', total: 1, covered: true })
  })
})
