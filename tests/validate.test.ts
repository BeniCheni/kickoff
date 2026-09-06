import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { validateFixtures } from '../scripts/validate'
import { normalizeEvent } from '../scripts/providers/espn'
import type { Fixture } from '../src/lib/schema'

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
