import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { normalizeEvent } from '../scripts/providers/espn'
import { COMPETITIONS, VENUE_TZ_BY_COUNTRY, venueTimeZone } from '../src/lib/competitions'
import { fixtureSchema, fixturesFileSchema, venueTzSchema } from '../src/lib/schema'
import { fixtureTimes, tzOffsetMinutes } from '../src/lib/time'
import { diffFixtures, formatReportLine } from '../scripts/diff'

const payload = JSON.parse(readFileSync(new URL('./fixtures/espn/ucl-md1.json', import.meta.url), 'utf8'))
const fixtures = payload.events.map((e: unknown) => fixtureSchema.parse(normalizeEvent(e, 'ucl', '2026-09-10T15:35:00.000Z')))

describe('stadium clocks follow the venue, never the competition or viewer', () => {
  it.each([
    ['401915452', 'Europe/Athens', '7:45 PM'],
    ['401915425', 'Europe/Lisbon', '8:00 PM'],
    ['401915446', 'Europe/London', '8:00 PM'],
    ['401915447', 'Europe/Lisbon', '8:00 PM'],
    ['401915444', 'Europe/Istanbul', '7:45 PM'],
    ['401915442', 'Europe/London', '8:00 PM'],
  ])('%s corrects the recorded MD1 counterexample', (id, zone, time) => {
    const f = fixtures.find((f: { source: { sourceId: string } }) => f.source.sourceId === id)!
    expect(f.venueTz).toBe(zone)
    expect(fixtureTimes(f.kickoffUtc, f.venueTz).local?.time).toBe(time)
  })
  it('keeps Brooklyn unchanged through the real normalizer for all eighteen recorded events', () => {
    expect(fixtures).toHaveLength(18) // recorded payload, never a live snapshot count
    for (const f of fixtures) expect(fixtureTimes(f.kickoffUtc, f.venueTz).brooklyn)
      .toEqual(fixtureTimes(f.kickoffUtc, 'Europe/Zurich').brooklyn)
  })
  it('validates every reference zone and Kazakhstan after its unification', () => {
    for (const zone of Object.values(VENUE_TZ_BY_COUNTRY)) expect(venueTzSchema.safeParse(zone).success).toBe(true)
    expect(tzOffsetMinutes(VENUE_TZ_BY_COUNTRY.Kazakhstan!, new Date('2026-09-10T12:00:00Z'))).toBe(300)
  })
  it('admits missing or unmapped countries without treating object properties as zones', () => {
    for (const country of [undefined, 'Unknown', '__proto__']) expect(venueTimeZone(country)).toBeUndefined()
    const event = structuredClone(payload.events[0]); event.competitions[0].venue = null
    const f = fixtureSchema.parse(normalizeEvent(event, 'ucl', '2026-09-10T15:35:00.000Z'))
    expect(fixtureTimes(f.kickoffUtc, f.venueTz)).toMatchObject({ local: null, dayDelta: null })
    expect(fixtureTimes(f.kickoffUtc, f.venueTz).brooklyn.time).toBeTruthy()
    expect(formatReportLine({ changes: 0, urgent: 0, standings: 'unchanged', rankMoves: 0, merge: 'auto', zonesUnknown: [f].filter(f => !f.venueTz).length })).toContain('zones-unknown=1')
  })
  it.each(['', 'Europe/Nonsense'])('rejects %j before rendering', (venueTz) => {
    expect(fixtureSchema.safeParse({ ...fixtures[0], venueTz }).success).toBe(false)
  })
  it('remembers only the zones Intl accepted: a bad zone after a good one still fails, in either order', () => {
    expect(venueTzSchema.safeParse('Europe/London').success).toBe(true)
    expect(venueTzSchema.safeParse('Europe/Nonsense').success).toBe(false)
    expect(venueTzSchema.safeParse('Europe/Nonsense').success).toBe(false)
    expect(venueTzSchema.safeParse('Europe/London').success).toBe(true)
    expect(venueTzSchema.safeParse('europe/london').success).toBe(venueTzSchema.safeParse('europe/london').success) // stable across calls
  })
  it('reports a zone change as non-urgent even at kickoff', () => {
    const before = fixtures[0]!
    const after = { ...before, venueTz: undefined }
    expect(diffFixtures([before], [after], { now: new Date(before.kickoffUtc) })).toEqual([
      expect.objectContaining({ kind: 'VENUE_TZ_CHANGED', urgent: false }),
    ])
  })
  it('audits retained venue evidence and preserves every domestic snapshot clock', () => {
    const snapshot = fixturesFileSchema.parse(JSON.parse(readFileSync(new URL('../src/data/fixtures.json', import.meta.url), 'utf8')))
    for (const f of snapshot) {
      if (f.venueCountry || f.venueId) {
        expect(venueTimeZone(f.venueCountry, f.venueId), `${f.id}: unmapped ${f.venueCountry}`).toBeDefined()
        expect(f.venueTz, f.id).toBe(venueTimeZone(f.venueCountry, f.venueId))
      }
      if (COMPETITIONS[f.competition].group === 'domestic') expect(f.venueTz, f.id).toBe(COMPETITIONS[f.competition].tz)
    }
  })
  it('matches the workflow regex rather than maintaining a second grammar', () => {
    const workflow = readFileSync(new URL('../.github/workflows/sync.yml', import.meta.url), 'utf8')
    const grammar = workflow.match(/grep -Eqx '([^']+)'/)![1]!
    const regex = new RegExp(`^${grammar}$`)
    for (const standingsDegraded of [[], ['ucl'], ['uel', 'ucl']]) {
      expect(formatReportLine({ changes: 1, urgent: 0, standings: 'changed', rankMoves: 2, merge: 'auto', zonesUnknown: 1, standingsDegraded })).toMatch(regex)
    }
  })
})
