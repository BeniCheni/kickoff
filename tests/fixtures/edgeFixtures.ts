import type { Fixture } from '../../src/lib/schema'

/**
 * Statuses and venues the committed snapshot does not contain. Shared by the root
 * hydration test and the web server-render test so both React copies see the same rows.
 */
export function edgeFixture(patch: Partial<Fixture> = {}): Fixture {
  return {
    id: 'synthetic:1',
    competition: 'laliga',
    kickoffUtc: '2026-11-22T20:00:00.000Z',
    venue: 'Ramón Sánchez-Pizjuán',
    venueTz: 'Europe/Madrid',
    home: { name: 'Sevilla', sourceId: '1' },
    away: { name: 'Levante', sourceId: '2' },
    status: 'scheduled',
    timeConfidence: 'exact',
    source: { provider: 'espn', sourceId: '1', fetchedAt: '2026-10-15T22:27:12.832Z' },
    ...patch,
  }
}
