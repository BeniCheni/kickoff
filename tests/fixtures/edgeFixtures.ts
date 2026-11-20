import type { Fixture, StandingRow } from '../../src/lib/schema'

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

/**
 * The two clubs of edgeFixture as standings rows, so the Table can be asked for the row
 * and the cell a synthetic fixture produces. Levante have played one match fewer.
 */
export const edgeStandingRows: StandingRow[] = [
  { teamId: '1', name: 'Sevilla', shortName: 'Sevilla', abbrev: 'SEV', rank: 1, rankChange: 0, played: 12, w: 8, d: 2, l: 2, gf: 21, ga: 9, pts: 26 },
  { teamId: '2', name: 'Levante', shortName: 'Levante', abbrev: 'LEV', rank: 2, rankChange: 0, played: 11, w: 6, d: 3, l: 2, gf: 15, ga: 10, pts: 21 },
]
