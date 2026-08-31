import { describe, expect, it } from 'vitest'
import type { Fixture } from '../src/lib/schema'
import { COMPETITION_KEYS, type CompetitionKey } from '../src/lib/competitions'
import { upcoming } from '../src/lib/fixtures'

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

const ALL: ReadonlySet<CompetitionKey> = new Set(COMPETITION_KEYS)
// 2026-08-30 in Brooklyn (EDT, UTC-4) runs 04:00Z Aug 30 → 03:59Z Aug 31.
const TODAY = '2026-08-30'
const NOON = '2026-08-30T16:00:00.000Z'

describe('upcoming', () => {
  it('never surfaces a postponed or cancelled fixture, even with a confident time', () => {
    const post = fx({ competition: 'pl', status: 'postponed', kickoffUtc: '2026-08-30T19:00:00.000Z' })
    const gone = fx({ competition: 'laliga', status: 'cancelled', kickoffUtc: '2026-08-30T20:00:00.000Z' })
    const ok = fx({ competition: 'seriea', kickoffUtc: '2026-08-30T21:00:00.000Z' })
    expect(upcoming(TODAY, NOON, ALL, 10, [post, gone, ok])).toEqual([ok])
  })

  it('excludes full-time and in-play fixtures — next up means not yet kicked off', () => {
    const done = fx({ competition: 'pl', status: 'full_time', kickoffUtc: '2026-08-30T13:00:00.000Z' })
    const live = fx({ competition: 'pl', status: 'in_play', kickoffUtc: '2026-08-30T15:30:00.000Z' })
    const next = fx({ competition: 'pl', kickoffUtc: '2026-08-30T19:00:00.000Z' })
    expect(upcoming(TODAY, NOON, ALL, 10, [done, live, next])).toEqual([next])
  })

  it('drops a league-set kickoff that is already behind `now`, even when still scheduled in a stale snapshot', () => {
    const missed = fx({ competition: 'pl', kickoffUtc: '2026-08-30T11:00:00.000Z' })
    const ahead = fx({ competition: 'pl', kickoffUtc: '2026-08-30T19:00:00.000Z' })
    expect(upcoming(TODAY, NOON, ALL, 10, [missed, ahead])).toEqual([ahead])
  })

  it("trusts a placeholder (TBC) time only to the day — today's TBC fixture stays even after its filler instant", () => {
    const tbc = fx({
      competition: 'ligue1',
      timeConfidence: 'round_placeholder',
      kickoffUtc: '2026-08-30T12:00:00.000Z',
    })
    expect(upcoming(TODAY, NOON, ALL, 10, [tbc])).toEqual([tbc])
    // ...but a placeholder on a past Brooklyn date is gone.
    const yesterday = fx({
      competition: 'ligue1',
      timeConfidence: 'round_placeholder',
      kickoffUtc: '2026-08-29T12:00:00.000Z',
    })
    expect(upcoming(TODAY, NOON, ALL, 10, [yesterday])).toEqual([])
  })

  it('sorts by kickoff, honours the filter set and the limit', () => {
    const a = fx({ competition: 'pl', kickoffUtc: '2026-08-30T19:00:00.000Z' })
    const b = fx({ competition: 'laliga', kickoffUtc: '2026-08-30T18:00:00.000Z' })
    const c = fx({ competition: 'seriea', kickoffUtc: '2026-08-30T20:00:00.000Z' })
    const onlyTwo: ReadonlySet<CompetitionKey> = new Set(['pl', 'laliga'])
    expect(upcoming(TODAY, NOON, onlyTwo, 10, [a, b, c])).toEqual([b, a])
    expect(upcoming(TODAY, NOON, ALL, 1, [a, b, c])).toEqual([b])
  })
})
