import { describe, it, expect } from 'vitest'
import { fixtureTimes, brooklynAbbrev, brooklynDate, startOfWeek, addDays, syncStamp, posterDayTitle, zonedParts } from '../src/lib/time'

describe('structured display time', () => {
  it.each([
    ['2026-09-05T04:00:00Z', '12:00', 'AM'],
    ['2026-09-05T16:00:00Z', '12:00', 'PM'],
    ['2026-09-05T18:45:00Z', '2:45', 'PM'],
  ])('exposes clock and meridiem for %s without parsing display whitespace', (instant, clock, meridiem) => {
    const parts = zonedParts(new Date(instant), 'America/New_York')
    expect(parts.clock).toBe(clock)
    expect(parts.meridiem).toBe(meridiem)
    expect(parts.time).toBe(`${clock} ${meridiem}`)
  })

  it('formats Poster titles at calendar boundaries', () => {
    expect(posterDayTitle('2026-08-30')).toBe('Sun 30 Aug')
    expect(posterDayTitle('2027-01-01')).toBe('Fri 1 Jan')
    expect(posterDayTitle('2028-02-29')).toBe('Tue 29 Feb')
  })
})

describe('syncStamp', () => {
  it('renders the sync instant in UTC, not a local zone', () => {
    expect(syncStamp('2026-08-30T17:02:26.000Z')).toBe('2026-08-30 17:02 UTC')
    // A late-evening UTC sync must not slip to the next or previous local day.
    expect(syncStamp('2026-08-30T23:59:00.000Z')).toBe('2026-08-30 23:59 UTC')
    expect(syncStamp('2026-08-30T00:01:00.000Z')).toBe('2026-08-30 00:01 UTC')
  })
})

/**
 * Europe and the US do not change clocks on the same day. In 2026 the EU falls back on
 * 25 October and the US on 1 November, so for that one week the usual six-hour
 * Madrid/Brooklyn gap is five. The prototype flagged this in a comment and never tested it.
 */
describe('DST boundaries', () => {
  it('renders a Madrid kickoff correctly before either clock change', () => {
    // 21:00 CEST (UTC+2) on 20 Oct -> 15:00 EDT (UTC-4)
    const t = fixtureTimes('2026-10-20T19:00:00.000Z', 'Europe/Madrid')
    expect(t.local.time).toBe('9:00 PM')
    expect(t.brooklyn.time).toBe('3:00 PM')
    expect(t.abbrev).toBe('EDT')
  })

  it('handles the week when Europe has fallen back but the US has not', () => {
    // 27 Oct: Madrid is CET (UTC+1), Brooklyn still EDT (UTC-4) -> a five-hour gap.
    const t = fixtureTimes('2026-10-27T20:00:00.000Z', 'Europe/Madrid')
    expect(t.local.time).toBe('9:00 PM')
    expect(t.brooklyn.time).toBe('4:00 PM')
    expect(t.abbrev).toBe('EDT')
  })

  it('returns to a six-hour gap once the US has also fallen back', () => {
    // 3 Nov: Madrid CET (UTC+1), Brooklyn EST (UTC-5).
    const t = fixtureTimes('2026-11-03T20:00:00.000Z', 'Europe/Madrid')
    expect(t.local.time).toBe('9:00 PM')
    expect(t.brooklyn.time).toBe('3:00 PM')
    expect(t.abbrev).toBe('EST')
  })

  it('labels the zone from the real offset, not the month', () => {
    expect(brooklynAbbrev(new Date('2026-10-31T12:00:00Z'))).toBe('EDT')
    expect(brooklynAbbrev(new Date('2026-11-02T12:00:00Z'))).toBe('EST')
  })
})

describe('day rollover', () => {
  it('reports the previous Brooklyn day for a late European kickoff', () => {
    // 00:30 CET on 5 Nov in Rome is 6:30 PM EST on 4 Nov in Brooklyn.
    const t = fixtureTimes('2026-11-04T23:30:00.000Z', 'Europe/Rome')
    expect(t.local.isoDate).toBe('2026-11-05')
    expect(t.brooklyn.isoDate).toBe('2026-11-04')
    expect(t.dayDelta).toBe(-1)
  })

  it('keeps a normal afternoon kickoff on the same day in both zones', () => {
    const t = fixtureTimes('2026-08-21T18:45:00.000Z', 'Europe/Paris')
    expect(t.local.time).toBe('8:45 PM')
    expect(t.brooklyn.time).toBe('2:45 PM')
    expect(t.dayDelta).toBe(0)
    expect(brooklynDate('2026-08-21T18:45:00.000Z')).toBe('2026-08-21')
  })
})

describe('calendar helpers', () => {
  it('anchors a week to Monday', () => {
    expect(startOfWeek('2026-08-21')).toBe('2026-08-17') // Friday -> Monday
    expect(startOfWeek('2026-08-23')).toBe('2026-08-17') // Sunday -> the Monday before
    expect(startOfWeek('2026-08-24')).toBe('2026-08-24') // Monday -> itself
  })

  it('crosses month and DST boundaries without drifting', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(addDays('2026-11-01', -1)).toBe('2026-10-31')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })
})
