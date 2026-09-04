import { describe, expect, it } from 'vitest'
import type { Fixture } from '../src/lib/schema'
import { COMPETITION_KEYS, type CompetitionKey } from '../src/lib/competitions'
import { nextMatchday, planSlate, stillToKickOff, upcoming } from '../src/lib/fixtures'

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

describe('stillToKickOff — the one gate both heroes share (v0.2.2)', () => {
  it('a league-set kickoff is still to come only while it is ahead of now — it drops at the kickoff minute', () => {
    const f = fx({ competition: 'pl', kickoffUtc: '2026-08-30T16:00:00.000Z' })
    expect(stillToKickOff(f, '2026-08-30T15:59:00.000Z')).toBe(true)
    expect(stillToKickOff(f, '2026-08-30T16:00:00.000Z')).toBe(false)
    expect(stillToKickOff(f, '2026-08-30T16:01:00.000Z')).toBe(false)
  })

  it('a snapshot in_play fixture has kicked off — it is on, not remaining', () => {
    const f = fx({ competition: 'pl', status: 'in_play', kickoffUtc: '2026-08-30T19:00:00.000Z' })
    expect(stillToKickOff(f, NOON)).toBe(false)
  })

  it('postponed, cancelled and full-time fixtures are never still to come, whatever their instant', () => {
    for (const status of ['postponed', 'cancelled', 'full_time'] as const) {
      const f = fx({ competition: 'pl', status, kickoffUtc: '2026-08-30T19:00:00.000Z' })
      expect(stillToKickOff(f, NOON)).toBe(false)
    }
  })

  it('a placeholder (TBC) time is trusted to the day — its filler instant passing does not evict it', () => {
    const tbc = fx({
      competition: 'ligue1', timeConfidence: 'round_placeholder',
      kickoffUtc: '2026-08-30T12:00:00.000Z',
    })
    expect(stillToKickOff(tbc, NOON)).toBe(true)
    expect(stillToKickOff(tbc, '2026-08-31T03:00:00.000Z')).toBe(true)
  })
})

describe('planSlate — Poster\'s hero, decided on the clock', () => {
  const early = () => fx({ competition: 'pl', kickoffUtc: '2026-08-30T11:00:00.000Z' })
  const late = () => fx({ competition: 'laliga', kickoffUtc: '2026-08-30T19:00:00.000Z' })
  const tomorrow = () => fx({ competition: 'seriea', kickoffUtc: '2026-08-31T18:45:00.000Z' })

  it("tonight's slate is today's fixtures still to kick off, in kickoff order", () => {
    const [a, b, c] = [late(), early(), tomorrow()]
    const plan = planSlate(TODAY, '2026-08-30T08:00:00.000Z', ALL, [a, b, c])
    expect(plan).toEqual({ date: TODAY, slate: [b, a], isTonight: true })
  })

  it('a fixture leaves the slate at its kickoff minute — the same tick Next-up drops it', () => {
    const [a, b] = [early(), late()]
    const atKickoff = '2026-08-30T11:00:00.000Z'
    expect(planSlate(TODAY, atKickoff, ALL, [a, b]).slate).toEqual([b])
    expect(upcoming(TODAY, atKickoff, ALL, 10, [a, b])).toEqual([b])
  })

  it('the "nothing left today" flip fires at the last kickoff, not at the next snapshot', () => {
    const [a, b, c] = [early(), late(), tomorrow()]
    const beforeLast = planSlate(TODAY, '2026-08-30T18:59:00.000Z', ALL, [a, b, c])
    expect(beforeLast.isTonight).toBe(true)
    expect(beforeLast.slate).toEqual([b])
    const atLast = planSlate(TODAY, '2026-08-30T19:00:00.000Z', ALL, [a, b, c])
    expect(atLast).toEqual({ date: '2026-08-31', slate: [c], isTonight: false })
  })

  it('a snapshot in_play fixture is not remaining, so a day of only kicked-off matches shows the next matchday', () => {
    const live = fx({ competition: 'pl', status: 'in_play', kickoffUtc: '2026-08-30T19:00:00.000Z' })
    const next = tomorrow()
    expect(planSlate(TODAY, NOON, ALL, [live, next])).toEqual({
      date: '2026-08-31', slate: [next], isTonight: false,
    })
  })

  it("a TBC fixture stays in tonight's slate all day, even after its filler instant", () => {
    const tbc = fx({
      competition: 'ligue1', timeConfidence: 'round_placeholder',
      kickoffUtc: '2026-08-30T12:00:00.000Z',
    })
    expect(planSlate(TODAY, '2026-08-31T02:00:00.000Z', ALL, [tbc])).toEqual({
      date: TODAY, slate: [tbc], isTonight: true,
    })
  })

  it('honours the competition filter for both tonight and the next matchday', () => {
    const [a, b, c] = [early(), late(), tomorrow()]
    const onlySerieA = new Set<CompetitionKey>(['seriea'])
    expect(planSlate(TODAY, '2026-08-30T08:00:00.000Z', onlySerieA, [a, b, c])).toEqual({
      date: '2026-08-31', slate: [c], isTonight: false,
    })
  })

  it('reports no date at all when nothing is ahead under the filters', () => {
    expect(planSlate(TODAY, NOON, ALL, [])).toEqual({ date: null, slate: [], isTonight: false })
    const gone = fx({ competition: 'pl', status: 'full_time', kickoffUtc: '2026-08-30T11:00:00.000Z' })
    expect(planSlate(TODAY, NOON, ALL, [gone])).toEqual({ date: null, slate: [], isTonight: false })
  })

  it('the next matchday is the earliest later Brooklyn date with a fixture surviving the filters', () => {
    const far = fx({ competition: 'pl', kickoffUtc: '2026-09-05T18:00:00.000Z' })
    const near = fx({ competition: 'laliga', kickoffUtc: '2026-09-01T18:00:00.000Z' })
    expect(nextMatchday(TODAY, ALL, [far, near])).toBe('2026-09-01')
    expect(nextMatchday(TODAY, new Set<CompetitionKey>(['pl']), [far, near])).toBe('2026-09-05')
    expect(nextMatchday(TODAY, ALL, [])).toBeNull()
  })

  // Found in the v0.2.2 review: the planner's date came from a scan over every status, so a
  // date holding only a postponed fixture was "the next matchday", its slate was empty, and
  // the hero showed "No upcoming fixtures" with a real matchday waiting behind it.
  it('a date that holds only postponed or cancelled fixtures is not a matchday — the hero skips to the one behind it', () => {
    const postponed = fx({ competition: 'pl', status: 'postponed', kickoffUtc: '2026-09-01T18:00:00.000Z' })
    const cancelled = fx({ competition: 'laliga', status: 'cancelled', kickoffUtc: '2026-09-01T20:00:00.000Z' })
    const real = fx({ competition: 'seriea', kickoffUtc: '2026-09-03T18:45:00.000Z' })
    expect(nextMatchday(TODAY, ALL, [postponed, cancelled, real])).toBe('2026-09-03')
    expect(planSlate(TODAY, NOON, ALL, [postponed, cancelled, real])).toEqual({
      date: '2026-09-03', slate: [real], isTonight: false,
    })
    // …and when nothing scheduled is behind it, the answer is "nothing ahead", not an empty day.
    expect(planSlate(TODAY, NOON, ALL, [postponed, cancelled])).toEqual({
      date: null, slate: [], isTonight: false,
    })
  })

  it('a non-null date always comes with a non-empty slate', () => {
    const postponed = fx({ competition: 'pl', status: 'postponed', kickoffUtc: '2026-09-01T18:00:00.000Z' })
    const tbcLater = fx({
      competition: 'ligue1', timeConfidence: 'round_placeholder', kickoffUtc: '2026-09-02T12:00:00.000Z',
    })
    for (const list of [[postponed], [postponed, tbcLater], [tbcLater], []]) {
      const plan = planSlate(TODAY, NOON, ALL, list)
      expect(plan.date === null).toBe(plan.slate.length === 0)
    }
  })
})

