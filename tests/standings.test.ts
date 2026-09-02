import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { currentSeasonStartYear, normalizeStandingEntry } from '../scripts/providers/espn-standings'
import { standingRowSchema, type Fixture, type StandingRow } from '../src/lib/schema'
import type { CompetitionKey } from '../src/lib/competitions'
import { tableFor } from '../src/lib/standings'

const entries = JSON.parse(
  readFileSync(resolve(import.meta.dirname, 'fixtures', 'espn-laliga-standings.json'), 'utf8'),
).entries

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
    const teamA = tableFor('laliga', '2026-09-05', rows, fixtures).find((r) => r.teamId === 'A')
    expect(teamA?.next?.opponent).toBe('Away Team')
  })

  it('drops the fixture from next once today has moved past its Brooklyn kickoff date', () => {
    const rows = [row('A'), row('B')]
    const fixtures = [fx({ competition: 'laliga' })]
    const teamA = tableFor('laliga', '2026-09-08', rows, fixtures).find((r) => r.teamId === 'A')
    expect(teamA?.next).toBeNull()
  })

  it('a kickoff stays "next" for the rest of its own Brooklyn day, even once it has actually started', () => {
    // The comparison is brooklynDate(kickoffUtc) >= today — date-based, not instant-based —
    // so a still-`scheduled` snapshot row keeps showing the match as next through the rest of
    // that Brooklyn day even well after the real kickoff instant (e.g. 11pm ET the same day).
    // 2026-09-06T19:00:00.000Z is 3:00 PM ET; "today" here is that same Brooklyn date.
    const rows = [row('A'), row('B')]
    const fixtures = [fx({ competition: 'laliga' })]
    const teamA = tableFor('laliga', '2026-09-06', rows, fixtures).find((r) => r.teamId === 'A')
    expect(teamA?.next?.opponent).toBe('Away Team')
  })

  it('returns [] for a league with no standings rows, regardless of today', () => {
    expect(tableFor('laliga', '2026-09-05', [], [])).toEqual([])
  })
})
