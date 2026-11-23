import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { NextFixtureCell } from '../../src/components/NextFixtureCell'
import { tableFor, type TableLane } from '../../src/lib/standings'
import { fixtureTimes, todayIso } from '../../src/lib/time'
import type { Fixture } from '../../src/lib/schema'
import { edgeFixture, edgeStandingRows } from '../fixtures/edgeFixtures'

/**
 * The Table's next-fixture cell, asked the way the Table asks: a fixture goes through
 * tableFor and the lane it returns is drawn. Nothing here builds a lane by hand, so a cell
 * that printed a clock the pure layer never gave it would have nowhere to get one.
 *
 * The edge fixture is Sevilla v Levante, Sunday 22 Nov 2026, 20:00 UTC: 3:00 PM in Brooklyn
 * and 21:00 in Madrid.
 */
const BEFORE = '2026-11-22T12:00:00.000Z'
const AFTER = '2026-11-22T20:02:00.000Z'
const CLOCK = /\d{1,2}:\d{2}/
const ZONE = /E[SD]T|UTC|GMT|CES?T|[+-]\d{1,2}(:\d{2})?\b/

function sevilla(patch: Partial<Fixture> = {}, now = BEFORE) {
  const [row] = tableFor('laliga', todayIso(new Date(now)), now, edgeStandingRows, [edgeFixture(patch)])
  return row!
}

function drawn(lane: TableLane, options: { kickedOff?: boolean; compact?: boolean } = {}) {
  const { container } = render(<NextFixtureCell lane={lane} kickedOff={options.kickedOff ?? false} compact={options.compact} />)
  const cell = container.querySelector('[data-next-cell]')!
  const units = [...cell.children]
  return {
    state: cell.getAttribute('data-next-cell'),
    text: cell.textContent ?? '',
    units: units.map((unit) => unit.textContent),
    voices: units.map((unit) => unit.getAttribute('data-voice')),
  }
}

describe('the Table’s next-fixture cell', () => {
  it('prints the Brooklyn clock in pitch and the stadium’s 24-hour clock in muted ink, both from one instant', () => {
    const fixture = edgeFixture()
    const cell = drawn(sevilla().next!)
    expect(cell.state).toBe('set')
    expect(cell.units).toEqual(['Sun · LEV (H)', '3:00 PM', '21:00 local'])
    expect(cell.voices).toEqual(['ink', 'pitch', 'muted'])
    // Both clocks are the one UTC instant, formatted twice by the pure layer.
    const times = fixtureTimes(fixture.kickoffUtc, fixture.venueTz)
    expect(cell.units.slice(1)).toEqual([times.brooklyn.time, `${times.local!.clock24} local`])
  })

  it('zero-pads the stadium clock and reads midnight as 00, never 24', () => {
    expect(drawn(sevilla({ kickoffUtc: '2026-11-22T08:05:00.000Z' }, '2026-11-22T01:00:00.000Z').next!).units).toEqual(['Sun · LEV (H)', '3:05 AM', '09:05 local'])
    expect(drawn(sevilla({ kickoffUtc: '2026-11-22T23:05:00.000Z' }).next!).units).toEqual(['Sun · LEV (H)', '6:05 PM', '00:05 local'])
  })

  it('carries no zone abbreviation and no offset, in either layout', () => {
    for (const compact of [false, true]) {
      expect(drawn(sevilla().next!, { compact }).text).not.toMatch(ZONE)
      expect(drawn(sevilla({ venueTz: undefined }).next!, { compact }).text).not.toMatch(ZONE)
    }
  })

  it('says “local time not known” in amber where the stadium clock would stand', () => {
    const cell = drawn(sevilla({ venueTz: undefined }).next!)
    expect(cell.units).toEqual(['Sun · LEV (H)', '3:00 PM', 'local time not known'])
    expect(cell.voices).toEqual(['ink', 'pitch', 'amber'])
    expect(cell.text.match(new RegExp(CLOCK, 'g'))).toEqual(['3:00'])
  })

  it('prints no clock for a kickoff the league has not set: an amber line takes both clocks’ place', () => {
    const lane = sevilla({ timeConfidence: 'tbd' }).next!
    const phone = drawn(lane)
    expect(phone.state).toBe('unset')
    // String 24, word for word: the weekday, the date, an em dash, and who has not set it.
    expect(phone.units).toEqual(['Sun · LEV (H)', 'Sun 2026-11-22 — kickoff time not yet set by the league'])
    expect(phone.voices).toEqual(['ink', 'amber'])
    const desktop = drawn(lane, { compact: true })
    expect(desktop.units).toEqual(['Sun · LEV (H)', 'time TBC'])
    expect(desktop.voices).toEqual(['ink', 'amber'])
    for (const cell of [phone, desktop]) expect(cell.text.replace('2026-11-22', '')).not.toMatch(CLOCK)
  })

  it('takes the not-set line’s weekday and date from the fixture’s own instant, in Brooklyn, and prints neither clock', () => {
    // 01:00 UTC on Monday 23 Nov is 8:00 PM on Sunday 22 Nov in Brooklyn and 02:00 on Monday in Madrid.
    const fixture = edgeFixture({ kickoffUtc: '2026-11-23T01:00:00.000Z', timeConfidence: 'tbd' })
    const times = fixtureTimes(fixture.kickoffUtc, fixture.venueTz)
    expect([times.brooklyn.weekday, times.brooklyn.isoDate, times.brooklyn.time, times.local!.clock24]).toEqual(['Sun', '2026-11-22', '8:00 PM', '02:00'])
    const phone = drawn(sevilla({ kickoffUtc: fixture.kickoffUtc, timeConfidence: 'tbd' }).next!)
    expect(phone.units[1]).toBe(`${times.brooklyn.weekday} ${times.brooklyn.isoDate} — kickoff time not yet set by the league`)
    expect(phone.units[1]).toBe('Sun 2026-11-22 — kickoff time not yet set by the league')
    // Neither clock of that instant, in any form, and no stadium date.
    for (const cell of [phone, drawn(sevilla({ kickoffUtc: fixture.kickoffUtc, timeConfidence: 'tbd' }).next!, { compact: true })]) {
      expect(cell.text).not.toMatch(/8:00|20:00|02:00|2:00|local|Mon|2026-11-23/)
      expect(cell.text.replace('2026-11-22', '')).not.toMatch(CLOCK)
    }
  })

  it('says KICKED OFF in amber with no clock and no score once the kickoff has passed', () => {
    const row = sevilla({}, AFTER)
    expect(row.next).toBeNull()
    for (const compact of [false, true]) {
      const cell = drawn(row.underway!, { kickedOff: true, compact })
      expect(cell.state).toBe('kicked-off')
      expect(cell.units).toEqual(['Sun · LEV (H)', 'KICKED OFF'])
      expect(cell.voices).toEqual(['ink', 'amber'])
      expect(cell.text).not.toMatch(CLOCK)
      expect(cell.text).not.toMatch(/\d\s*[-–]\s*\d/)
    }
  })
})
