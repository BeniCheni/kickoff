import { BY_DATE, stillToKickOff as snapshotGate } from '../src/lib/fixtures'
import { describe, expect, it } from 'vitest'
import type { Fixture } from '../src/lib/schema'
import { COMPETITION_KEYS, type CompetitionKey } from '../src/lib/competitions'
import {
  COVER_LIBRARY,
  catalogueNumber,
  posterBooks,
  LIVE_WINDOW_MS,
  nextMatchdaySelection,
  stillToKickOff,
  hasKickedOff,
  believablyLive,
  staleLiveIds,
  hotFixtureIds,
  kickoffBounds,
  nextKickoffId,
  groupWeekDays,
  bookDateLine,
  type DayInfo,
} from '../src/lib/lensSelectors'

import { startOfWeek, weekdayShort } from '../src/lib/time'
import { edgeFixture } from './fixtures/edgeFixtures'

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

function dateLine(shown: Fixture[], closed = false) {
  return bookDateLine('2026-08-30', shown, closed)
}

describe('Poster day-header count versus league-set times', () => {
  it('names mixed exact/TBC counts and ignores the placeholder instant for FIRST', () => {
    const exact = fx({ competition: 'pl', kickoffUtc: '2026-09-05T19:30:00.000Z' })
    const tbc = fx({ competition: 'laliga', kickoffUtc: '2026-09-05T12:00:00.000Z', timeConfidence: 'round_placeholder' })
    expect(dateLine([tbc, exact])).toMatchObject({ count: '2 MATCHES', unset: 1, ending: 'FIRST 3:30 PM ET' })
  })
  it('an all-TBC day has counts but no invented FIRST time', () => {
    const tbc = fx({ competition: 'pl', timeConfidence: 'round_placeholder' })
    const tbd = fx({ competition: 'pl', timeConfidence: 'tbd' })
    expect(dateLine([tbc, tbd])).toMatchObject({ count: '2 MATCHES', unset: 2, ending: 'FIRST KICKOFF NOT SET' })
  })
  it('postponed, cancelled, suspended and abandoned exact times do not become FIRST or get counted as TBC', () => {
    expect(dateLine([
      fx({ competition: 'pl', status: 'postponed' }),
      fx({ competition: 'pl', status: 'cancelled' }),
      fx({ competition: 'pl', status: 'suspended' }),
      fx({ competition: 'pl', status: 'abandoned' }),
    ])).toMatchObject({ count: '4 MATCHES', unset: 0, ending: '' })
  })
  it('retains singular labels for a one-fixture input', () => {
    expect(dateLine([fx({ competition: 'pl' })])).toMatchObject({ count: '1 MATCH', ending: 'FIRST 1:00 PM ET' })
  })
})

describe('a matchday owns one slot whatever the competition counts', () => {
  const all = new Set(COMPETITION_KEYS)
  function slot(fixtures: Fixture[]) {
    return posterBooks([{ date: '2026-08-30', fixtures }], all)[0]?.slot
  }
  it('lets one European fixture determine the slot even on a mainly domestic day', () => {
    const leagues = [fx({ competition: 'pl' }), fx({ competition: 'pl' })]
    expect(slot(leagues)).toBe('sun')
    expect(slot([...leagues, fx({ competition: 'uecl' })])).toBe('europa')
    const mixed = [...leagues, fx({ competition: 'ucl' }), fx({ competition: 'uel' })]
    expect(slot(mixed)).toBe('firstNight')
    expect(slot(mixed.reverse())).toBe('firstNight')
    expect(slot(leagues.reverse())).toBe('sun')
    expect(slot([])).toBeUndefined()
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

  it('never derives a bound from a postponed, cancelled, suspended or abandoned fixture', () => {
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
    const stopped = fx({
      competition: 'bundesliga',
      status: 'suspended',
      kickoffUtc: '2026-08-30T11:00:00.000Z',
    })
    const abandoned = fx({
      competition: 'ligue1',
      status: 'abandoned',
      kickoffUtc: '2026-08-30T23:00:00.000Z',
    })
    const real = fx({ competition: 'seriea', kickoffUtc: '2026-08-30T17:00:00.000Z' })
    const bounds = kickoffBounds([post, real, gone, stopped, abandoned])
    expect(bounds?.first).toBe(real)
    expect(bounds?.last).toBe(real)
    expect(kickoffBounds([post, gone, stopped, abandoned])).toBeNull()
  })

  it('returns the same fixture as first and last for a one-kickoff slate', () => {
    const only = fx({ competition: 'pl', kickoffUtc: '2026-08-30T19:00:00.000Z' })
    const bounds = kickoffBounds([only])
    expect(bounds?.first).toBe(only)
    expect(bounds?.last).toBe(only)
  })
})

describe('cover date lines', () => {
  it('names only the first kickoff on a multi-kickoff day', () => {
    const early = fx({ competition: 'pl', kickoffUtc: '2026-08-30T17:00:00.000Z' })
    const late = fx({ competition: 'laliga', kickoffUtc: '2026-08-30T19:30:00.000Z' })
    expect(dateLine([early, late])).toMatchObject({ count: '2 MATCHES', unset: 0, ending: 'FIRST 1:00 PM ET' })
  })

  it('names the single kickoff in Brooklyn time', () => {
    const only = fx({ competition: 'pl', kickoffUtc: '2026-08-31T00:00:00.000Z' })
    expect(dateLine([only])).toMatchObject({ count: '1 MATCH', unset: 0, ending: 'FIRST 8:00 PM ET' })
  })

  it('says MATCHES, not REMAINING, about a future matchday', () => {
    const a = fx({ competition: 'pl', kickoffUtc: '2026-09-01T17:00:00.000Z' })
    const b = fx({ competition: 'pl', kickoffUtc: '2026-09-01T19:00:00.000Z' })
    expect(dateLine([a, b])).toMatchObject({ count: '2 MATCHES', unset: 0, ending: 'FIRST 1:00 PM ET' })
  })

  it('gives an all-TBC slate its count, its TBC count and no invented times', () => {
    const tbc = fx({ competition: 'ligue1', timeConfidence: 'round_placeholder' })
    expect(dateLine([tbc])).toMatchObject({ count: '1 MATCH', unset: 1, ending: 'FIRST KICKOFF NOT SET' })
    const tbd = fx({ competition: 'ligue1', timeConfidence: 'tbd', kickoffUtc: '2026-09-01T12:00:00.000Z' })
    expect(dateLine([tbc, tbd])).toMatchObject({ count: '2 MATCHES', unset: 2, ending: 'FIRST KICKOFF NOT SET' })
  })

  // v0.2.2 review: the count includes every fixture, the range only the league-set ones, so a
  // mixed slate read "3 REMAINING · FIRST … · LAST …" over a range that covered two. The gap
  // is now named instead of left for the reader to notice.
  it('names the TBC fixtures the FIRST/LAST range cannot cover, on tonight and on a future matchday', () => {
    const early = fx({ competition: 'pl', kickoffUtc: '2026-08-30T17:00:00.000Z' })
    const late = fx({ competition: 'laliga', kickoffUtc: '2026-08-30T19:30:00.000Z' })
    const tbc = fx({ competition: 'ligue1', timeConfidence: 'round_placeholder', kickoffUtc: '2026-08-30T12:00:00.000Z' })
    expect(dateLine([early, tbc, late])).toMatchObject({ count: '3 MATCHES', unset: 1, ending: 'FIRST 1:00 PM ET' })
    expect(bookDateLine('2026-09-01', [tbc, early, late], false)).toMatchObject({ date: 'TUE 1 SEP', count: '3 MATCHES', unset: 1, ending: 'FIRST 1:00 PM ET' })
    // …and the placeholder's filler instant never becomes FIRST or LAST, whichever side it sits on.
    expect(dateLine([tbc, late])).toMatchObject({ count: '2 MATCHES', unset: 1, ending: 'FIRST 3:30 PM ET' })
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

describe('the Poster week groups only genuinely empty dates', () => {
  const matches = [fx({ competition: 'pl' }), fx({ competition: 'pl' }), fx({ competition: 'laliga' })]
  it('keeps both heavy and light matchdays intact', () => {
    const days = [day(matches), day(matches.slice(0, 2)), day([])]
    const groups = groupWeekDays(days)
    expect(groups).toEqual(days.map(d => [d]))
    expect(groups[0]?.[0]?.shown).toEqual(matches)
  })
  it('keeps a hidden date between the two runs of genuinely empty dates', () => {
    const days = [day(matches), day([], { date: '2026-08-31' }), day([], { date: '2026-09-01' }),
      day([], { date: '2026-09-02', total: 3 }), day([], { date: '2026-09-03' })]
    const groups = groupWeekDays(days)
    expect(groups.map(g => g.map(d => d.date))).toEqual([
      ['2026-08-30'], ['2026-08-31', '2026-09-01'], ['2026-09-02'], ['2026-09-03'],
    ])
    expect(groups[2]?.[0]).toMatchObject({ total: 3, shown: [] })
  })
})

describe('stale LIVE exact boundary (synthetic, never a snapshot edit)', () => {
  it.each([-1, 0, 1])('at LIVE_WINDOW_MS %+d ms, stale is the in_play complement', (delta) => {
    const fixture = fx({ competition: 'pl', status: 'in_play' })
    const now = new Date(Date.parse(fixture.kickoffUtc) + LIVE_WINDOW_MS + delta).toISOString()
    const stale = staleLiveIds([fixture], now).has(fixture.id)
    expect(stale).toBe(delta > 0)
    expect(stale).toBe(!believablyLive(fixture, now))
    expect(hotFixtureIds([fixture], now).has(fixture.id)).toBe(!stale)
    expect(fixture.status).toBe('in_play')
  })
  it('does not call any other stored status stale LIVE', () => {
    const fixtures = (['scheduled', 'full_time', 'postponed', 'cancelled', 'suspended', 'abandoned'] as const)
      .map((status) => fx({ competition: 'pl', status }))
    expect(staleLiveIds(fixtures, '2026-09-01T00:00:00.000Z').size).toBe(0)
  })
})

describe('next matchday selection uses days, never filler-time ordering', () => {
  const NOW = '2026-10-10T21:00:00.000Z'
  const TODAY = '2026-10-10'
  const tbc = () => fx({ competition: 'pl', kickoffUtc: '2026-10-10T12:00:00.000Z', timeConfidence: 'round_placeholder' })
  const exact = () => fx({ competition: 'pl', kickoffUtc: '2026-10-13T22:00:00.000Z' })
  it('retains today’s placeholder after its filler instant instead of skipping to a timed later day', () => {
    const a = tbc(), b = exact()
    expect(nextMatchdaySelection([b, a], TODAY, NOW)).toEqual({ date: TODAY, exact: null, placeholders: [a] })
    expect(hotFixtureIds([a, b], NOW)).toEqual(new Set())
  })
  it('counts placeholders independently of input order and filler instants', () => {
    const a = tbc(), b = { ...tbc(), kickoffUtc: '2026-10-11T03:00:00.000Z', timeConfidence: 'tbd' as const }
    for (const list of [[exact(), a, b], [b, a, exact()]]) {
      const selection = nextMatchdaySelection(list, TODAY, NOW)
      expect(selection.date).toBe(TODAY)
      expect(selection.exact).toBeNull()
      expect(new Set(selection.placeholders)).toEqual(new Set([a, b]))
    }
  })
  it('chooses the earliest exact kickoff on a mixed day and retains the placeholders', () => {
    const a = { ...exact(), kickoffUtc: '2026-10-10T23:00:00.000Z' }
    const b = { ...exact(), kickoffUtc: '2026-10-11T00:00:00.000Z' }
    const placeholder = tbc()
    expect(nextMatchdaySelection([b, placeholder, a], TODAY, NOW)).toEqual({ date: TODAY, exact: a, placeholders: [placeholder] })
  })
  it('retires TBC by Brooklyn midnight and excludes unsettled and expired exact fixtures', () => {
    const list = [tbc(), ...(['postponed', 'cancelled', 'suspended', 'abandoned'] as const).map(status => ({ ...exact(), status })),
      { ...exact(), kickoffUtc: '2026-10-11T04:00:00.000Z' }]
    expect(nextMatchdaySelection(list, '2026-10-11', '2026-10-11T04:00:00.000Z')).toEqual({ date: null, exact: null, placeholders: [] })
  })
})

it('exports the same gate to the snapshot module without a cycle', () => {
  expect(snapshotGate).toBe(stillToKickOff)
  const tbc = fx({ competition: 'pl', timeConfidence: 'round_placeholder' })
  expect(snapshotGate(tbc, '2026-09-01T00:00:00.000Z')).toBe(true)
})

it('switches the next selection and hot rows at Brooklyn midnight, including shuffled mixed dates', () => {
  const tbc = fx({ competition: 'pl', kickoffUtc: '2026-10-10T12:00:00.000Z', timeConfidence: 'round_placeholder' })
  const first = fx({ competition: 'pl', kickoffUtc: '2026-10-11T12:00:00.000Z' })
  const later = fx({ competition: 'pl', kickoffUtc: '2026-10-11T13:00:00.000Z' })
  const nextTbc = fx({ competition: 'pl', kickoffUtc: '2026-10-11T14:00:00.000Z', timeConfidence: 'tbd' })
  for (const list of [[later, tbc, first, nextTbc], [nextTbc, first, tbc, later]]) {
    const before = '2026-10-11T03:59:59.999Z'
    expect(nextMatchdaySelection(list, '2026-10-10', before).exact).toBeNull()
    expect(hotFixtureIds(list, before)).toEqual(new Set())
    const after = '2026-10-11T04:00:00.000Z'
    expect(nextMatchdaySelection(list, '2026-10-11', after).exact).toBe(first)
    expect(nextMatchdaySelection(list, '2026-10-11', after).placeholders).toEqual([nextTbc])
    expect(hotFixtureIds(list, after)).toEqual(new Set([first.id]))
  }
})

describe('hasKickedOff — the complement of stillToKickOff over scheduled fixtures', () => {
  const K = '2026-09-07T17:00:00.000Z'
  const instants = ['2026-09-07T16:59:59.999Z', K, '2026-09-07T17:00:00.001Z']

  it('flips at the kickoff instant for a league-set time: −1 ms is next, 0 and +1 ms have kicked off', () => {
    const f = fx({ competition: 'laliga', kickoffUtc: K })
    for (const now of instants) {
      expect(hasKickedOff(f, now)).toBe(now >= K)
      expect(stillToKickOff(f, now)).toBe(now < K)
      expect(stillToKickOff(f, now)).not.toBe(hasKickedOff(f, now))
    }
  })

  it('never treats a placeholder as kicked off — a filler instant cannot say a match started', () => {
    for (const timeConfidence of ['round_placeholder', 'tbd'] as const) {
      const f = fx({ competition: 'laliga', kickoffUtc: K, timeConfidence })
      for (const now of [...instants, '2026-12-25T12:00:00.000Z']) {
        expect(hasKickedOff(f, now)).toBe(false)
        expect(stillToKickOff(f, now)).toBe(true)
      }
    }
  })

  it('is scheduled-only: a stored in_play, full_time, postponed, cancelled, suspended or abandoned status is never re-derived from the clock', () => {
    for (const status of ['in_play', 'full_time', 'postponed', 'cancelled', 'suspended', 'abandoned'] as const) {
      expect(hasKickedOff(fx({ competition: 'laliga', kickoffUtc: K, status }), '2026-09-07T17:40:00.000Z')).toBe(false)
    }
  })
})

describe('matchday cover slots', () => {
  const all = new Set(COMPETITION_KEYS)
  it('places every matchday of each Brooklyn week in exactly one cover slot', () => {
    const weeks = new Map<string, [string, Fixture[]][]>()
    for (const entry of BY_DATE) {
      const monday = startOfWeek(entry[0])
      const days = weeks.get(monday) ?? []
      days.push(entry)
      weeks.set(monday, days)
    }
    const dates = new Set<string>()
    for (const days of weeks.values()) {
      const week = days.map(([date, fixtures]) => ({ date, fixtures }))
      const books = posterBooks(week, all)
      const nights = days.filter(([, fs]) => fs.some(f => f.competition === 'ucl')).map(([d]) => d).sort()
      for (const book of books) {
        const comps = book.shown.map(f => f.competition)
        const day = weekdayShort(book.date).toLowerCase()
        const domestic = ['mon', 'fri', 'sat', 'sun'].includes(day) ? day : 'midweek'
        expect(book.slot).toBe(comps.includes('ucl') ? (book.date === nights[0] ? 'firstNight' : 'secondNight')
          : comps.includes('uel') || comps.includes('uecl') ? 'europa' : domestic)
        expect(dates.has(book.date)).toBe(false)
        dates.add(book.date)
      }
    }
    expect([...dates].sort()).toEqual([...BY_DATE.keys()].sort())
  })
  it('retains an invisible first night and a hidden unsettled match when assigning covers', () => {
    const ucl = edgeFixture({ competition: 'ucl', status: 'abandoned' })
    const pl = edgeFixture({ competition: 'pl', status: 'full_time' })
    const week = [{ date: '2026-11-25', fixtures: [pl, ucl] }, { date: '2026-11-24', fixtures: [ucl] }]
    const books = posterBooks(week, new Set(['pl']))
    expect(books).toEqual([{ date: '2026-11-25', shown: [pl], closed: false, slot: 'secondNight' }])
    expect(posterBooks(week.slice(0, 1), all)[0]?.slot).toBe('firstNight')
    expect(posterBooks([{ date: '2026-12-22', fixtures: [edgeFixture({ competition: 'supercoppa' })] }], all)[0]?.slot).toBe('midweek')
    expect(posterBooks([], all)).toEqual([])
  })
  it('uses the date for the catalogue and the approved library for the eleven distinct covers', () => {
    expect(catalogueNumber('2026-11-20')).toBe('FT-1120')
    expect(Object.values(COVER_LIBRARY).map(([title]) => title)).toEqual([
      'The Fifth Minute', 'The Valley Doors', 'The Tower Counts', 'The Empty Hallways',
      'The Night Between', 'The First Night', 'The Second Night', 'The Far Windows',
      'The Long Whistle', 'A Quiet Week', 'The Register',
    ])
    expect(new Set(Object.values(COVER_LIBRARY).map(([, line]) => line)).size).toBe(11)
  })
})
