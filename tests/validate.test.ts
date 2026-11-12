import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { validateFixtures } from '../scripts/validate'
import { normalizeEvent } from '../scripts/providers/espn'
import { fixtureSchema, type Fixture } from '../src/lib/schema'

const AT = '2026-08-21T10:00:00.000Z'

function fx(over: Partial<Fixture> & { id: string }): Fixture {
  return {
    competition: 'ligue1',
    kickoffUtc: '2026-08-21T18:45:00.000Z',
    venueTz: 'Europe/Paris',
    home: { name: 'Home' },
    away: { name: 'Away' },
    status: 'scheduled',
    timeConfidence: 'exact',
    source: { provider: 'espn', sourceId: 'x', fetchedAt: AT },
    ...over,
  }
}

describe('validateFixtures — a rejected row is a reason to stop, not a line to skip', () => {
  it('passes rows that satisfy the schema, untouched', () => {
    const rows = [fx({ id: 'a' }), fx({ id: 'b', status: 'full_time', result: { home: 2, away: 1 } })]
    const out = validateFixtures(rows)
    expect(out.rejected).toEqual([])
    expect(out.valid).toEqual(rows)
  })

  it('rejects a non-integer score, naming the row and the field', () => {
    const bad = fx({ id: 'ligue1:bad', status: 'full_time', result: { home: 1.5, away: 0 } })
    const out = validateFixtures([fx({ id: 'ok' }), bad])
    expect(out.valid.map((f) => f.id)).toEqual(['ok'])
    expect(out.rejected).toHaveLength(1)
    expect(out.rejected[0]).toMatch(/ligue1:bad/)
    expect(out.rejected[0]).toMatch(/result\.home/)
  })

  it.each(['', ' ', 'undefined', 'null'])('rejects a missing or coerced source identity %j at the schema boundary too', (sourceId) => {
    const out = validateFixtures([fx({ id: 'ligue1:bad-id', source: { provider: 'espn', sourceId, fetchedAt: AT } })])
    expect(out.valid).toEqual([])
    expect(out.rejected[0]).toMatch(/ligue1:bad-id: source.sourceId/)
  })

  it('reports every offender, not just the first, so one run shows them all', () => {
    const out = validateFixtures([
      fx({ id: 'x', kickoffUtc: 'not an instant' }),
      fx({ id: 'ok' }),
      { id: 'y' },
      null,
    ])
    expect(out.valid.map((f) => f.id)).toEqual(['ok'])
    expect(out.rejected).toHaveLength(3)
    expect(out.rejected[0]).toMatch(/^ {2}! x: kickoffUtc/)
    expect(out.rejected[1]).toMatch(/^ {2}! y: /)
    expect(out.rejected[2]).toMatch(/^ {2}! \(no id\)/)
  })

  it('the concrete path: an ESPN score of "1.5" clears normalizeEvent and is caught here', () => {
    // normalizeEvent checks Number.isFinite, which 1.5 passes; the schema wants an int.
    // Before this guard, sync.ts logged a console.warn and wrote the snapshot without the row.
    const events: any[] = JSON.parse(
      readFileSync(resolve(import.meta.dirname, 'fixtures', 'espn-ligue1-md1.json'), 'utf8'),
    ).events
    const template = events.find((e: any) => e.name.includes('Marseille'))
    const comp = template.competitions[0]
    const event = {
      ...template,
      status: { type: { name: 'STATUS_FULL_TIME' } },
      competitions: [
        {
          ...comp,
          competitors: comp.competitors.map((c: any) => ({ ...c, score: c.homeAway === 'home' ? '1.5' : '0' })),
        },
      ],
    }
    const fixture = normalizeEvent(event, 'ligue1', AT)
    expect(fixture?.result).toEqual({ home: 1.5, away: 0 })
    const out = validateFixtures([fixture])
    expect(out.valid).toEqual([])
    expect(out.rejected[0]).toMatch(/result\.home/)
  })
})

describe('extra-time and penalty finals', () => {
  const issues = (row: Fixture) => {
    const parsed = fixtureSchema.safeParse(row)
    return parsed.success ? [] : parsed.error.issues.map((issue) => issue.path.join('.'))
  }

  it('accepts an extra-time final with a nonnegative result and no shootout', () => {
    const parsed = fixtureSchema.safeParse(fx({ id: 'a', status: 'after_extra_time', result: { home: 4, away: 3 } }))
    expect(parsed.success, parsed.success ? '' : JSON.stringify(parsed.error.issues)).toBe(true)
    expect(fixtureSchema.safeParse(fx({ id: 'a', status: 'after_extra_time', result: { home: 0, away: 0 } })).success).toBe(true)
  })

  it('accepts a penalty final with a result and a nonnegative shootout', () => {
    const parsed = fixtureSchema.safeParse(fx({
      id: 'a', status: 'after_penalties', result: { home: 3, away: 3 }, shootout: { home: 2, away: 4 },
    }))
    expect(parsed.success, parsed.success ? '' : JSON.stringify(parsed.error.issues)).toBe(true)
    expect(fixtureSchema.safeParse(fx({
      id: 'a', status: 'after_penalties', result: { home: 0, away: 0 }, shootout: { home: 0, away: 0 },
    })).success).toBe(true)
  })

  it('refuses either new status when the result is missing', () => {
    for (const status of ['after_extra_time', 'after_penalties'] as const) {
      const row = fx({
        id: status,
        status,
        ...(status === 'after_penalties' ? { shootout: { home: 1, away: 0 } } : {}),
      })
      expect(issues(row), status).toContain('result')
    }
  })

  it('refuses a penalty final with no shootout', () => {
    const row = fx({ id: 'pens', status: 'after_penalties', result: { home: 1, away: 1 } })
    expect(issues(row)).toContain('shootout')
  })

  it('refuses a shootout on every status except after_penalties', () => {
    for (const status of ['scheduled', 'in_play', 'full_time', 'postponed', 'cancelled', 'suspended', 'abandoned', 'after_extra_time'] as const) {
      const row = fx({
        id: status,
        status,
        result: status === 'full_time' || status === 'after_extra_time' ? { home: 1, away: 0 } : undefined,
        shootout: { home: 1, away: 0 },
      })
      expect(issues(row), status).toContain('shootout')
    }
  })

  it('refuses a negative goal count on either new status, on each side', () => {
    expect(issues(fx({ id: 'a', status: 'after_extra_time', result: { home: -1, away: 0 } }))).toContain('result.home')
    expect(issues(fx({ id: 'a', status: 'after_extra_time', result: { home: 0, away: -1 } }))).toContain('result.away')
    const pens = { status: 'after_penalties' as const, result: { home: 1, away: 1 }, shootout: { home: 1, away: 1 } }
    expect(issues(fx({ id: 'a', ...pens, result: { home: -1, away: 1 } }))).toContain('result.home')
    expect(issues(fx({ id: 'a', ...pens, result: { home: 1, away: -1 } }))).toContain('result.away')
    expect(issues(fx({ id: 'a', ...pens, shootout: { home: -1, away: 1 } }))).toContain('shootout.home')
    expect(issues(fx({ id: 'a', ...pens, shootout: { home: 1, away: -1 } }))).toContain('shootout.away')
  })

  it('still parses a negative full_time result, which ideas row 2 owns', () => {
    expect(fixtureSchema.safeParse(fx({ id: 'ft', status: 'full_time', result: { home: -1, away: 0 } })).success).toBe(true)
  })

  it('still parses the snapshot on main', () => {
    const snapshot = JSON.parse(readFileSync(resolve(import.meta.dirname, '../src/data/fixtures.json'), 'utf8'))
    expect(fixtureSchema.array().safeParse(snapshot).success).toBe(true)
  })
})
