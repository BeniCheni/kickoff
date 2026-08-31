import { describe, expect, it } from 'vitest'
import type { Fixture } from '../src/lib/schema'
import type { CompetitionKey } from '../src/lib/competitions'
import {
  dominantCompetition,
  kickoffBounds,
  planPosterWeek,
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
