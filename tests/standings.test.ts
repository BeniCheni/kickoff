import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { currentSeasonStartYear, normalizeStandingEntry } from '../scripts/providers/espn-standings'
import { standingRowSchema, type Fixture, type StandingRow } from '../src/lib/schema'
import type { CompetitionKey } from '../src/lib/competitions'
import { tableFor } from '../src/lib/standings'
import { normalizeEvent } from '../scripts/providers/espn'
import { planSlate } from '../src/lib/fixtures'

const entries = JSON.parse(
  readFileSync(resolve(import.meta.dirname, 'fixtures', 'espn-laliga-standings.json'), 'utf8'),
).entries

describe('provider team identities at the fixture/table join', () => {
  it('rejects an array that would borrow a valid row identity and invent form or a next opponent', () => {
    const event = JSON.parse(readFileSync(new URL('./fixtures/espn-ligue1-md1.json', import.meta.url), 'utf8')).events[0]
    const row = normalizeStandingEntry(entries[0])!
    const home = event.competitions[0].competitors.find((c: any) => c.homeAway === 'home')
    const away = event.competitions[0].competitors.find((c: any) => c.homeAway === 'away')
    home.team.id = [row.teamId] // JSON-valid; String([id]) falsely matches the table row.
    expect(home.team.displayName).not.toBe(row.name)
    for (const status of ['STATUS_SCHEDULED', 'STATUS_FULL_TIME']) {
      event.status.type.name = status
      home.score = '2'
      away.score = '1'
      const fixture = normalizeEvent(event, 'laliga', '2026-08-21T12:00:00.000Z')
      const joined = tableFor('laliga', '2026-08-01', '2026-08-01T00:00:00.000Z', [row], fixture ? [fixture] : [])[0]!
      expect(joined.next).toBeNull()
      expect(joined.form).toEqual([])
      expect(fixture).toBeNull()
    }
    // A scalar provider identity still supports the legitimate join.
    home.team.id = row.teamId
    const valid = normalizeEvent(event, 'laliga', '2026-08-21T12:00:00.000Z')!
    expect(tableFor('laliga', '2026-08-01', '2026-08-01T00:00:00.000Z', [row], [valid])[0]!.form).toEqual(['W'])
  })
})

describe('normalizeStandingEntry', () => {
  it('produces schema-valid rows from a real payload', () => {
    for (const e of entries) {
      const row = normalizeStandingEntry(e)
      expect(row).not.toBeNull()
      expect(() => standingRowSchema.parse(row)).not.toThrow()
    }
  })

  it('maps the ESPN stat names onto the table columns', () => {
    const row = normalizeStandingEntry(entries[0])!
    expect(row.rank).toBe(1)
    expect(row.played).toBe(row.w + row.d + row.l)
    expect(row.pts).toBeGreaterThanOrEqual(row.w * 3)
  })

  it('rejects an entry missing a required stat instead of guessing', () => {
    const broken = structuredClone(entries[0])
    broken.stats = broken.stats.filter((s: { name: string }) => s.name !== 'points')
    expect(normalizeStandingEntry(broken)).toBeNull()
  })
})

describe('currentSeasonStartYear', () => {
  it('rolls the season in July, not January', () => {
    expect(currentSeasonStartYear(new Date('2026-08-29T12:00:00Z'))).toBe(2026)
    expect(currentSeasonStartYear(new Date('2027-03-01T12:00:00Z'))).toBe(2026)
    expect(currentSeasonStartYear(new Date('2027-07-15T12:00:00Z'))).toBe(2027)
  })
})

describe('tableFor — "next" tracks a caller-supplied today, not the system clock', () => {
  function row(teamId: string, overrides: Partial<StandingRow> = {}): StandingRow {
    return {
      teamId,
      name: `Team ${teamId}`,
      shortName: `T${teamId}`,
      abbrev: teamId.padEnd(3, 'X').toUpperCase(),
      rank: 1,
      rankChange: 0,
      played: 3,
      w: 2,
      d: 1,
      l: 0,
      gf: 5,
      ga: 2,
      pts: 7,
      ...overrides,
    }
  }

  let seq = 0
  function fx(over: Partial<Fixture> & { competition: CompetitionKey }): Fixture {
    seq += 1
    return {
      id: `${over.competition}:${seq}`,
      kickoffUtc: '2026-09-06T19:00:00.000Z',
      venueTz: 'Europe/Madrid',
      home: { name: 'Home Team', sourceId: 'A' },
      away: { name: 'Away Team', sourceId: 'B' },
      status: 'scheduled',
      timeConfidence: 'exact',
      source: { provider: 'espn', sourceId: String(seq), fetchedAt: '2026-09-01T00:00:00.000Z' },
      ...over,
    }
  }

  it('shows the fixture as next while today is still before its Brooklyn kickoff date', () => {
    const rows = [row('A'), row('B')]
    const fixtures = [fx({ competition: 'laliga' })]
    const teamA = tableFor('laliga', '2026-09-05', '2026-09-05T00:00:00.000Z', rows, fixtures).find((r) => r.teamId === 'A')
    expect(teamA?.next?.opponent).toBe('Away Team')
  })

  it('uses next only while the fixture is still to kick off by instant and shows it as underway after kickoff', () => {
    const rows = [row('A'), row('B')]
    const fixtures = [fx({ competition: 'laliga' })]
    const before = tableFor('laliga', '2026-09-06', '2026-09-06T18:59:00.000Z', rows, fixtures).find((r) => r.teamId === 'A')
    const mid = tableFor('laliga', '2026-09-06', '2026-09-06T19:10:00.000Z', rows, fixtures).find((r) => r.teamId === 'A')
    expect(before?.next?.opponent).toBe('Away Team')
    expect(before?.underway).toBeNull()
    expect(mid?.next).toBeNull()
    expect(mid?.underway?.opponent).toBe('Away Team')
    expect(mid?.underway?.timeConfidence).toBe('exact')
  })

  it('aligns Table with planSlate at four critical instants for an unstabilized scheduled fixture', () => {
    const rows = [row('A'), row('B')]
    const match = fx({ competition: 'laliga', kickoffUtc: '2026-09-06T19:00:00.000Z' })
    const active = new Set<CompetitionKey>(['laliga'])
    const cases: Array<{ now: string; underway: boolean }> = [
      { now: '2026-09-06T18:59:00.000Z', underway: false },
      { now: '2026-09-06T19:10:00.000Z', underway: true },
      { now: '2026-09-06T20:20:00.000Z', underway: true },
      { now: '2026-09-06T23:59:00.000Z', underway: true },
    ]

    for (const c of cases) {
      const rowA = tableFor('laliga', '2026-09-06', c.now, rows, [match]).find((r) => r.teamId === 'A')
      const tableIsFuture = Boolean(rowA?.next)
      expect(tableIsFuture).toBe(!c.underway)
      expect(Boolean(rowA?.underway)).toBe(c.underway)
      const plan = planSlate('2026-09-06', c.now, active, [match])
      expect(tableIsFuture).toBe(plan.slate.length > 0 && plan.date === '2026-09-06')
    }
  })

  it('can explicitly retire next and underway when the league reports full-time', () => {
    const rows = [row('A'), row('B')]
    const fixture = fx({ competition: 'laliga', status: 'full_time' })
    const rowA = tableFor('laliga', '2026-09-06', '2026-09-06T23:30:00.000Z', rows, [fixture]).find((r) => r.teamId === 'A')
    expect(rowA?.next).toBeNull()
    expect(rowA?.underway).toBeNull()
  })

  it('drops the fixture from next once today has moved past its Brooklyn kickoff date', () => {
    const rows = [row('A'), row('B')]
    const fixtures = [fx({ competition: 'laliga' })]
    const teamA = tableFor('laliga', '2026-09-08', '2026-09-08T00:00:00.000Z', rows, fixtures).find((r) => r.teamId === 'A')
    expect(teamA?.next).toBeNull()
  })

  it('returns [] for a league with no standings rows, regardless of today', () => {
    expect(tableFor('laliga', '2026-09-05', '2026-09-05T00:00:00.000Z', [], [])).toEqual([])
  })
})
