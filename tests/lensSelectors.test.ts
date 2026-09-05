import { describe, expect, it } from 'vitest'
import type { Fixture } from '../src/lib/schema'
import type { CompetitionKey } from '../src/lib/competitions'
import {
  dominantCompetition,
  hotFixtureIds,
  kickoffBounds,
  monthCellSummary,
  nextKickoffId,
  planPosterWeek,
  posterSubLine,
  slateSubLine,
  tickerSegments,
  type DayInfo,
} from '../src/lib/lensSelectors'

let seq = 0
function fx(over: Partial<Fixture> & { competition: CompetitionKey }): Fixture {
  seq += 1
  return {
    id: `${over.competition}:${seq}`,
    kickoffUtc: '2026-08-30T17:00:00.000Z',
    venueTz: 'Europe/Madrid',
    home: { name: 'Home' },
    away: { name: 'Away' },
    status: 'scheduled',
    timeConfidence: 'exact',
    source: { provider: 'espn', sourceId: String(seq), fetchedAt: '2026-08-30T00:00:00.000Z' },
    ...over,
  }
}

function day(shown: Fixture[], over: Partial<DayInfo> = {}): DayInfo {
  return { date: '2026-08-30', shown, total: shown.length, isToday: false, ...over }
}

describe('Poster day-header count versus league-set times', () => {
  it('names mixed exact/TBC counts and ignores the placeholder instant for FIRST', () => {
    const exact = fx({ competition: 'pl', kickoffUtc: '2026-09-05T19:30:00.000Z' })
    const tbc = fx({ competition: 'laliga', kickoffUtc: '2026-09-05T12:00:00.000Z', timeConfidence: 'round_placeholder' })
    expect(posterSubLine([tbc, exact])).toBe('2 MATCHES · 2 LEAGUES · 1 TBC · FIRST KICKOFF 3:30 PM')
  })
  it('an all-TBC day has counts but no invented FIRST time', () => {
    const tbc = fx({ competition: 'pl', timeConfidence: 'round_placeholder' })
    const tbd = fx({ competition: 'pl', timeConfidence: 'tbd' })
    expect(posterSubLine([tbc, tbd])).toBe('2 MATCHES · 1 LEAGUE · 2 TBC')
  })
  it('postponed and cancelled exact times do not become FIRST or get counted as TBC', () => {
    expect(posterSubLine([
      fx({ competition: 'pl', status: 'postponed' }),
      fx({ competition: 'pl', status: 'cancelled' }),
    ])).toBe('2 MATCHES · 1 LEAGUE')
  })
  it('retains singular labels for a one-fixture input', () => {
    expect(posterSubLine([fx({ competition: 'pl' })])).toBe('1 MATCH · 1 LEAGUE · FIRST KICKOFF 1:00 PM')
  })
})

describe('NEXT carries its Brooklyn date when it is not today', () => {
  it('qualifies tomorrow with an actual date, not the stadium date', () => {
    const next = fx({ competition: 'pl', kickoffUtc: '2026-09-07T00:30:00.000Z' })
    expect(tickerSegments([next], '2026-09-05', '2026-09-05T23:00:00.000Z')).toEqual([
      { keyword: 'NEXT', text: 'Sun 6 Sep · 8:30 PM Home v Away' },
    ])
  })
  it('qualifies a later week as well, while UTC tomorrow can still be Brooklyn today', () => {
    const next = fx({ competition: 'pl', kickoffUtc: '2026-09-14T00:30:00.000Z' })
    expect(tickerSegments([next], '2026-09-05', '2026-09-05T23:00:00.000Z')[0]?.text).toBe('Sun 13 Sep · 8:30 PM Home v Away')
    expect(tickerSegments([next], '2026-09-13', '2026-09-13T23:00:00.000Z')[0]?.text).toBe('8:30 PM Home v Away')
  })
})

describe('dominantCompetition', () => {
  it('picks the competition with the most fixtures that day', () => {
    const list = [fx({ competition: 'pl' }), fx({ competition: 'pl' }), fx({ competition: 'laliga' })]
    expect(dominantCompetition(list)).toBe('pl')
  })

  it('breaks a tie toward the marquee (non-domestic) competition', () => {
    const list = [
      fx({ competition: 'pl' }),
      fx({ competition: 'pl' }),
      fx({ competition: 'ucl' }),
      fx({ competition: 'ucl' }),
    ]
    expect(dominantCompetition(list)).toBe('ucl')
    // ...regardless of which side of the list the marquee sits on.
    expect(dominantCompetition([...list].reverse())).toBe('ucl')
  })

  it('is deterministic on an all-domestic tie (display rank, then key)', () => {
    const list = [fx({ competition: 'pl' }), fx({ competition: 'laliga' })]
    expect(dominantCompetition(list)).toBe(dominantCompetition([...list].reverse()))
  })

  it('returns null for an empty day', () => {
    expect(dominantCompetition([])).toBeNull()
  })
})

describe('kickoffBounds', () => {
  it('finds earliest and latest league-set kickoffs, ignoring placeholder times', () => {
    const early = fx({ competition: 'pl', kickoffUtc: '2026-08-30T13:00:00.000Z' })
    const late = fx({ competition: 'laliga', kickoffUtc: '2026-08-30T19:30:00.000Z' })
    const filler = fx({
      competition: 'seriea',
      kickoffUtc: '2026-08-30T23:00:00.000Z',
      timeConfidence: 'round_placeholder',
    })
    const bounds = kickoffBounds([late, filler, early])
    expect(bounds?.first).toBe(early)
    expect(bounds?.last).toBe(late)
  })

  it('returns null when no fixture has a league-set time', () => {
    expect(kickoffBounds([fx({ competition: 'pl', timeConfidence: 'tbd' })])).toBeNull()
  })

  it('never derives a bound from a postponed or cancelled fixture', () => {
    const post = fx({
      competition: 'pl',
      status: 'postponed',
      kickoffUtc: '2026-08-30T12:00:00.000Z',
    })
    const gone = fx({
      competition: 'laliga',
      status: 'cancelled',
      kickoffUtc: '2026-08-30T22:00:00.000Z',
    })
    const real = fx({ competition: 'seriea', kickoffUtc: '2026-08-30T17:00:00.000Z' })
    const bounds = kickoffBounds([post, real, gone])
    expect(bounds?.first).toBe(real)
    expect(bounds?.last).toBe(real)
    expect(kickoffBounds([post, gone])).toBeNull()
  })

  it('returns the same fixture as first and last for a one-kickoff slate', () => {
    const only = fx({ competition: 'pl', kickoffUtc: '2026-08-30T19:00:00.000Z' })
    const bounds = kickoffBounds([only])
    expect(bounds?.first).toBe(only)
    expect(bounds?.last).toBe(only)
  })
})

describe('slateSubLine', () => {
  it('renders the FIRST/LAST range for a multi-kickoff slate', () => {
    const early = fx({ competition: 'pl', kickoffUtc: '2026-08-30T17:00:00.000Z' })
    const late = fx({ competition: 'laliga', kickoffUtc: '2026-08-30T19:30:00.000Z' })
    expect(slateSubLine([early, late], true)).toBe('2 REMAINING · FIRST 1:00 PM · LAST 3:30 PM')
  })

  it('collapses a one-kickoff slate to a single time — never FIRST and LAST of the same match', () => {
    const only = fx({ competition: 'pl', kickoffUtc: '2026-08-31T00:00:00.000Z' })
    expect(slateSubLine([only], true)).toBe('1 REMAINING · KICKOFF 8:00 PM')
  })

  it('says MATCHES, not REMAINING, about a future matchday', () => {
    const a = fx({ competition: 'pl', kickoffUtc: '2026-09-01T17:00:00.000Z' })
    const b = fx({ competition: 'pl', kickoffUtc: '2026-09-01T19:00:00.000Z' })
    expect(slateSubLine([a, b], false)).toBe('2 MATCHES · FIRST 1:00 PM · LAST 3:00 PM')
  })

  it('gives an all-TBC slate its count, its TBC count and no invented times', () => {
    const tbc = fx({ competition: 'ligue1', timeConfidence: 'round_placeholder' })
    expect(slateSubLine([tbc], true)).toBe('1 REMAINING · 1 TBC')
    const tbd = fx({ competition: 'ligue1', timeConfidence: 'tbd', kickoffUtc: '2026-09-01T12:00:00.000Z' })
    expect(slateSubLine([tbc, tbd], false)).toBe('2 MATCHES · 2 TBC')
  })

  // v0.2.2 review: the count includes every fixture, the range only the league-set ones, so a
  // mixed slate read "3 REMAINING · FIRST … · LAST …" over a range that covered two. The gap
  // is now named instead of left for the reader to notice.
  it('names the TBC fixtures the FIRST/LAST range cannot cover, on tonight and on a future matchday', () => {
    const early = fx({ competition: 'pl', kickoffUtc: '2026-08-30T17:00:00.000Z' })
    const late = fx({ competition: 'laliga', kickoffUtc: '2026-08-30T19:30:00.000Z' })
    const tbc = fx({ competition: 'ligue1', timeConfidence: 'round_placeholder', kickoffUtc: '2026-08-30T12:00:00.000Z' })
    expect(slateSubLine([early, tbc, late], true)).toBe('3 REMAINING · 1 TBC · FIRST 1:00 PM · LAST 3:30 PM')
    expect(slateSubLine([early, tbc, late], false)).toBe('3 MATCHES · 1 TBC · FIRST 1:00 PM · LAST 3:30 PM')
    // …and the placeholder's filler instant never becomes FIRST or LAST, whichever side it sits on.
    expect(slateSubLine([tbc, late], true)).toBe('2 REMAINING · 1 TBC · KICKOFF 3:30 PM')
  })
})

describe('hot rows (LIVE + next kickoff)', () => {
  const NOW = '2026-08-30T17:00:00.000Z'
  const live = fx({ competition: 'pl', status: 'in_play', kickoffUtc: '2026-08-30T15:30:00.000Z' })
  const soon = fx({ competition: 'laliga', kickoffUtc: '2026-08-30T19:30:00.000Z' })
  const later = fx({ competition: 'seriea', kickoffUtc: '2026-08-31T19:00:00.000Z' })
  const done = fx({
    competition: 'pl',
    status: 'full_time',
    kickoffUtc: '2026-08-30T13:00:00.000Z',
    result: { home: 2, away: 1 },
  })
  const filler = fx({
    competition: 'ligue1',
    kickoffUtc: '2026-08-30T18:00:00.000Z',
    timeConfidence: 'round_placeholder',
  })

  it('marks every LIVE fixture plus the next league-set kickoff — and nothing else', () => {
    const hot = hotFixtureIds([done, live, filler, soon, later], NOW)
    expect(hot).toEqual(new Set([live.id, soon.id]))
  })

  it('never treats a placeholder time as the next kickoff', () => {
    expect(nextKickoffId([filler, later], NOW)).toBe(later.id)
  })

  it('with no live fixtures, only the next kickoff is hot; with nothing upcoming, nothing is', () => {
    expect(hotFixtureIds([done, soon], NOW)).toEqual(new Set([soon.id]))
    expect(hotFixtureIds([done], NOW)).toEqual(new Set())
  })

  it('ignores fixtures already kicked off when picking next', () => {
    const started = fx({ competition: 'pl', kickoffUtc: '2026-08-30T16:00:00.000Z' })
    expect(nextKickoffId([started, soon], NOW)).toBe(soon.id)
  })

  it('stops believing a frozen in_play once its kickoff is hours old — a stale snapshot must not glow LIVE', () => {
    const frozen = fx({
      competition: 'pl',
      status: 'in_play',
      kickoffUtc: '2026-08-30T11:00:00.000Z', // 6h before NOW
    })
    expect(hotFixtureIds([frozen, soon], NOW)).toEqual(new Set([soon.id]))
    // A day later — the committed-snapshot case — nothing about it is hot.
    expect(hotFixtureIds([live], '2026-08-31T17:00:00.000Z')).toEqual(new Set())
  })
})

describe('tickerSegments', () => {
  const NOW = '2026-08-30T17:00:00.000Z'
  const TODAY = '2026-08-30'

  it('orders live, then next kickoff, then today’s FT scores — with no invented minute', () => {
    const live = fx({
      competition: 'pl',
      status: 'in_play',
      kickoffUtc: '2026-08-30T15:30:00.000Z',
      result: { home: 1, away: 0 },
      home: { name: 'Man Utd' },
      away: { name: 'Ipswich' },
    })
    const liveNoScore = fx({
      competition: 'ligue1',
      status: 'in_play',
      kickoffUtc: '2026-08-30T15:15:00.000Z',
      home: { name: 'Rennes' },
      away: { name: 'Le Mans' },
    })
    const next = fx({
      competition: 'laliga',
      kickoffUtc: '2026-08-30T17:30:00.000Z',
      home: { name: 'Deportivo' },
      away: { name: 'Valencia' },
    })
    const ft = fx({
      competition: 'pl',
      status: 'full_time',
      kickoffUtc: '2026-08-30T13:00:00.000Z',
      result: { home: 4, away: 3 },
      home: { name: 'Chelsea' },
      away: { name: 'Brighton' },
    })
    const ftYesterday = fx({
      competition: 'pl',
      status: 'full_time',
      kickoffUtc: '2026-08-29T13:00:00.000Z',
      result: { home: 0, away: 0 },
    })

    const segments = tickerSegments([ft, next, live, liveNoScore, ftYesterday], TODAY, NOW)
    expect(segments.map((s) => s.keyword)).toEqual(['LIVE', 'LIVE', 'NEXT', 'FT'])
    expect(segments[0]?.text).toBe('Man Utd 1–0 Ipswich')
    expect(segments[1]?.text).toBe('Rennes v Le Mans')
    expect(segments[2]?.text).toBe('1:30 PM Deportivo v Valencia')
    expect(segments[3]?.text).toBe('Chelsea 4–3 Brighton')
  })

  it('yields only NEXT when nothing is live and nothing finished today', () => {
    const later = fx({ competition: 'seriea', kickoffUtc: '2026-08-31T19:00:00.000Z' })
    expect(tickerSegments([later], TODAY, NOW).map((s) => s.keyword)).toEqual(['NEXT'])
  })

  it('drops LIVE segments whose kickoff is hours behind now — yesterday’s frozen matches stay silent', () => {
    const frozen = fx({
      competition: 'pl',
      status: 'in_play',
      kickoffUtc: '2026-08-30T15:30:00.000Z',
      home: { name: 'Man Utd' },
      away: { name: 'Ipswich' },
    })
    const later = fx({ competition: 'seriea', kickoffUtc: '2026-09-01T19:00:00.000Z' })
    // A day after the sync (the committed-snapshot case): no LIVE, only NEXT.
    const dayLater = tickerSegments([frozen, later], '2026-08-31', '2026-08-31T17:00:00.000Z')
    expect(dayLater.map((s) => s.keyword)).toEqual(['NEXT'])
    // Within the window it still reads LIVE.
    const fresh = tickerSegments([frozen, later], TODAY, NOW)
    expect(fresh.map((s) => s.keyword)).toEqual(['LIVE', 'NEXT'])
  })
})

describe('monthCellSummary', () => {
  it('reports the full count and one bar per competition, most fixtures first', () => {
    const cell = monthCellSummary([
      fx({ competition: 'laliga' }),
      fx({ competition: 'pl' }),
      fx({ competition: 'pl' }),
    ])
    expect(cell.count).toBe(3)
    expect(cell.bars).toEqual(['pl', 'laliga'])
    expect(cell.marquee).toBe(false)
  })

  it('trims to the top three bars when more competitions play', () => {
    const cell = monthCellSummary([
      fx({ competition: 'pl' }),
      fx({ competition: 'pl' }),
      fx({ competition: 'laliga' }),
      fx({ competition: 'laliga' }),
      fx({ competition: 'seriea' }),
      fx({ competition: 'bundesliga' }),
    ])
    expect(cell.count).toBe(6)
    expect(cell.bars).toHaveLength(3)
    expect(cell.bars.slice(0, 2).sort()).toEqual(['laliga', 'pl'])
  })

  it('flags marquee days and ranks the marquee competition first on a tie', () => {
    const cell = monthCellSummary([fx({ competition: 'ucl' }), fx({ competition: 'pl' })])
    expect(cell.marquee).toBe(true)
    expect(cell.bars[0]).toBe('ucl')
  })

  it('handles an empty day', () => {
    expect(monthCellSummary([])).toEqual({ count: 0, bars: [], marquee: false })
  })
})

describe('planPosterWeek', () => {
  const big = [
    fx({ competition: 'pl' }),
    fx({ competition: 'pl' }),
    fx({ competition: 'laliga' }),
  ]

  it('classifies by slate size: >2 big, 1–2 small, 0 gap', () => {
    const blocks = planPosterWeek([
      day(big, { date: '2026-08-30' }),
      day([fx({ competition: 'pl' }), fx({ competition: 'pl' })], { date: '2026-08-31' }),
      day([], { date: '2026-09-01' }),
    ])
    expect(blocks.map((b) => b.kind)).toEqual(['big', 'small', 'gap'])
  })

  it('carries the dominant competition on big days', () => {
    const blocks = planPosterWeek([day(big)])
    expect(blocks[0]).toMatchObject({ kind: 'big', dominant: 'pl' })
  })

  it('merges consecutive empty days into one gap and sums the filtered-away count', () => {
    const blocks = planPosterWeek([
      day(big, { date: '2026-08-30' }),
      day([], { date: '2026-08-31', total: 0 }),
      day([], { date: '2026-09-01', total: 3 }),
      day(big, { date: '2026-09-02' }),
      day([], { date: '2026-09-03', total: 0 }),
    ])
    expect(blocks.map((b) => b.kind)).toEqual(['big', 'gap', 'big', 'gap'])
    expect(blocks[1]).toMatchObject({
      kind: 'gap',
      dates: ['2026-08-31', '2026-09-01'],
      hiddenTotal: 3,
    })
  })
})
