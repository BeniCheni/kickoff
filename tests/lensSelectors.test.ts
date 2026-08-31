import { describe, expect, it } from 'vitest'
import type { Fixture } from '../src/lib/schema'
import type { CompetitionKey } from '../src/lib/competitions'
import {
  dominantCompetition,
  hotFixtureIds,
  kickoffBounds,
  nextKickoffId,
  planPosterWeek,
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
