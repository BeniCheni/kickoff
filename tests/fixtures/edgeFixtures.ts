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

/** Illustrative rows shared by the states sheet and both applications' test suites. */
export const rowStates = [
  ['Next', edgeFixture({ id: 'next' }), 'NEXT'],
  ['Live', edgeFixture({ id: 'live', status: 'in_play', result: { home: 1, away: 0 } }), 'LIVE'],
  ['Last seen live', edgeFixture({ id: 'stale', status: 'in_play', result: { home: 1, away: 0 } }), 'KICKED OFF'],
  ['Scheduled past kickoff', edgeFixture({ id: 'elapsed', result: { home: 0, away: 0 } }), 'KICKED OFF'],
  ['Full time', edgeFixture({ id: 'ft', status: 'full_time', result: { home: 2, away: 1 } }), 'FT'],
  ['Extra time', edgeFixture({ id: 'aet', status: 'after_extra_time', result: { home: 2, away: 1 } }), 'AET'],
  ['Penalties', edgeFixture({ id: 'pens', status: 'after_penalties', result: { home: 3, away: 3 }, shootout: { home: 2, away: 4 } }), 'PENS'],
  ...(['postponed', 'cancelled', 'suspended', 'abandoned'] as const)
    .map(status => [status, edgeFixture({ id: status, status }), status.toUpperCase()] as const),
  ['Time not set', edgeFixture({ id: 'unset', timeConfidence: 'tbd' }), ''],
  ['Unknown stadium clock', edgeFixture({ id: 'no-zone', venueTz: undefined }), ''],
  ['Previous day', edgeFixture({ id: 'prev-day', kickoffUtc: '2026-11-22T23:30:00Z' }), ''],
  ['Next day', edgeFixture({ id: 'next-day', venueTz: 'America/Los_Angeles', kickoffUtc: '2026-11-22T05:30:00Z' }), ''],
  ['Fixture note', edgeFixture({ id: 'note', note: 'Illustrative fixture note in full.' }), ''],
] as const

export function specimenRowProps(fixture: Fixture) {
  return {
    fixture, next: fixture.id === 'next', stale: fixture.id === 'stale',
    nowUtcIso: fixture.id === 'elapsed' ? '2026-11-23T00:00:00Z' : '2026-11-01T00:00:00Z',
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

/** A single Brooklyn matchday with three different stored finals. */
export const bookFinals = ['ft', 'aet', 'pens'].map((id, i) => ({
  ...rowStates.find(([, f]) => f.id === id)![1], kickoffUtc: `2026-11-22T${14 + i}:00:00Z`,
}))

export const cannotClose = [...bookFinals, edgeFixture({ id: 'abandoned', status: 'abandoned' })]

const unsetBookFixture = edgeFixture({ id: 'unset-book', timeConfidence: 'round_placeholder' })
const liveBookFixture = edgeFixture({ id: 'live-book', status: 'in_play', result: { home: 1, away: 0 } })
export const coverSpecimens = [
  { name: 'singular', fixtures: [edgeFixture()], now: '2026-11-22T12:00:00Z' },
  { name: 'unset', fixtures: [unsetBookFixture], now: '2026-11-22T12:00:00Z' },
  { name: 'mixed', fixtures: [unsetBookFixture, edgeFixture()], now: '2026-11-22T12:00:00Z' },
  { name: 'closed', fixtures: bookFinals, now: '2026-11-22T23:00:00Z' },
  { name: 'cannot-close', fixtures: cannotClose, now: '2026-11-22T23:00:00Z' },
  { name: 'live', fixtures: [bookFinals[0]!, liveBookFixture], now: '2026-11-22T21:00:00Z' },
  { name: 'kicked-off', fixtures: [bookFinals[1]!, bookFinals[2]!, liveBookFixture], now: '2026-11-23T01:00:00Z' },
]
export const heavyBookDay = Array.from({ length: 8 }, (_, i) => edgeFixture({ id: 'book-row-' + i }))
