import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { currentSeasonStartYear, normalizeStandingEntry } from '../scripts/providers/espn-standings'
import { standingRowSchema } from '../src/lib/schema'

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
