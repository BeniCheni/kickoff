import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { BY_DATE, FIXTURES } from '../../src/lib/fixtures'
import type { Fixture } from '../../src/lib/schema'
import { COMPETITION_KEYS } from '../../src/lib/competitions'
import { brooklynDate, fixtureTimes, startOfWeek } from '../../src/lib/time'
import { LIVE_WINDOW_MS } from '../../src/lib/lensSelectors'
import { WeekView } from '../../src/components/WeekView'
import { NextUpStrip } from '../../src/components/NextUpStrip'
import { TonightSlate } from '../../src/components/TonightSlate'
import { primeClock, wake } from './rig'

let release: (() => void) | undefined
const pristine = structuredClone(FIXTURES)
const originals = FIXTURES.map((f) => ({ ...f }))
afterEach(() => {
  cleanup()
  release?.()
  release = undefined
  // Object.assign alone leaves behind any key a test added (a `result` on a fixture that had
  // none); strip those first so the restore is the original object, not a superset of it.
  FIXTURES.forEach((f, i) => {
    const original = originals[i]!
    for (const key of Object.keys(f)) if (!(key in original)) delete (f as unknown as Record<string, unknown>)[key]
    Object.assign(f, original)
  })
  expect(FIXTURES).toEqual(pristine)
})
const active = new Set(COMPETITION_KEYS)

/**
 * The row for one exact-time fixture, by its accessible name: a FixtureRow's button carries no
 * aria-label, so the name is its content in render order — the Brooklyn time first, then
 * "home vs away". Anchoring on both keeps a 12:30 PM row from answering for a 2:30 PM one
 * (`includes` alone would) and a venue string from answering for a pairing.
 * Placeholder rows render "—" in the time slot and are not this helper's job.
 */
function fixtureRowFor(fixture: Fixture) {
  const { brooklyn } = fixtureTimes(fixture.kickoffUtc, fixture.venueTz)
  return screen.getByRole('button', {
    name: (name) => name.startsWith(brooklyn.time) && name.includes(`${fixture.home.name} vs ${fixture.away.name}`),
  })
}

describe('synthetic frozen snapshot through the real selector and clock wiring', () => {
  for (const lens of ['poster', 'ledger'] as const) {
    it(`${lens} week: LIVE expires through parent selection, without changing the snapshot`, () => {
      const fixture = FIXTURES.find((f) => f.timeConfidence === 'exact' && !f.result)!
      fixture.status = 'in_play'
      fixture.result = { home: 1, away: 0 } // ILLUSTRATIVE; in-memory only.
      const kickoff = Date.parse(fixture.kickoffUtc)
      const today = brooklynDate(fixture.kickoffUtc)
      release = primeClock(new Date(kickoff + LIVE_WINDOW_MS))
      render(<WeekView weekStart={startOfWeek(today)} active={active} today={today} lens={lens} />)
      const row = fixtureRowFor(fixture)
      const scope = within(row)
      expect(scope.getByText('LIVE')).toBeTruthy()
      wake(new Date(kickoff + LIVE_WINDOW_MS + 1))
      // The app's existing clock floors to minutes; the pure selector tests pin +1ms.
      expect(scope.getByText('LIVE')).toBeTruthy()
      wake(new Date(kickoff + LIVE_WINDOW_MS + 60_000))
      expect(scope.queryByText('LIVE')).toBeNull()
      const pill = scope.getByText('KICKED OFF')
      expect(pill.className).toContain('border-floodlight-strong')
      expect(pill.closest('[data-hot]')).toBeNull()
      expect(within(pill.closest('button')!).getByText('1–0').className).toContain('text-pitch')
      expect(fixture.status).toBe('in_play')
      fireEvent.click(pill.closest('button')!)
      expect(pill.closest('button')?.getAttribute('aria-expanded')).toBe('true')
    })
  }

  it('two in-play rows on one kickoff: the document-wide query throws, the row-scoped one resolves each row', () => {
    // The input is fixed by construction, not by what the sync last wrote: the snapshot's first
    // Brooklyn date carrying two league-set kickoffs, whatever their stored states, both
    // overridden in memory. A pair picked by `status` or `result` moves with every sync, and on
    // a Sunday-evening snapshot — or with a postponed row anywhere in the file — the second pick
    // lands in another week and no row renders (docs/v0.2.6-ideas.md row 28, the review of #33).
    const day = [...BY_DATE.values()]
      .map((list) => list.filter((f) => f.timeConfidence === 'exact'))
      .find((list) => list.length >= 2)!
    const preexisting = day[0]!
    const fixture = day[1]!
    preexisting.status = 'in_play'
    preexisting.result = { home: 0, away: 0 }
    fixture.status = 'in_play'
    fixture.result = { home: 1, away: 0 }
    fixture.kickoffUtc = preexisting.kickoffUtc // the time no longer discriminates; only the clubs do
    const kickoff = Date.parse(preexisting.kickoffUtc)
    const today = brooklynDate(preexisting.kickoffUtc)
    release = primeClock(new Date(kickoff + LIVE_WINDOW_MS))
    render(<WeekView weekStart={startOfWeek(today)} active={active} today={today} lens="ledger" />)
    // The query row 28 broke on must still be ambiguous here, or this case proves nothing.
    expect(() => screen.getByText('LIVE')).toThrow(/multiple elements/)
    const row = fixtureRowFor(fixture)
    expect(row).not.toBe(fixtureRowFor(preexisting))
    const scope = within(row)
    expect(scope.getByText('LIVE')).toBeTruthy()
    expect(scope.getByText('1–0')).toBeTruthy()
    expect(within(fixtureRowFor(preexisting)).getByText('0–0')).toBeTruthy()
    wake(new Date(kickoff + LIVE_WINDOW_MS + 60_000))
    expect(() => screen.getByText('KICKED OFF')).toThrow(/multiple elements/)
    expect(scope.queryByText('LIVE')).toBeNull()
    expect(scope.getByText('KICKED OFF').className).toContain('border-floodlight-strong')
  })
})

// The ticker's DOM case was the only one that rendered a hero with a league-unset NEXT. With it
// gone, a hero that printed the filler instant as a clock passed every test in both suites
// (PR #320 review). The two surviving heroes carry the rule now, on the same real selectors
// (`upcoming`, `planSlate`) and the same clock.
describe('an unset kickoff is never a clock on a hero', () => {
  const CLOCK = /\d{1,2}:\d{2}/

  /** Only the snapshot's first `count` rows stay scheduled, all on one league-unset instant.
   *  Picked by position and overridden in memory, never by `status` or `result`. */
  function placeholderDay(count: number) {
    FIXTURES.forEach((f) => { f.status = 'cancelled' })
    const day = FIXTURES.slice(0, count)
    for (const f of day) {
      f.status = 'scheduled'
      f.timeConfidence = 'round_placeholder'
      f.kickoffUtc = day[0]!.kickoffUtc // ILLUSTRATIVE; a filler instant, in memory only.
      delete f.result
    }
    return day
  }

  it('Ledger: every Next-up card reads TBC, and the overflow line names no time', () => {
    const day = placeholderDay(5)
    const filler = day[0]!.kickoffUtc
    // Primed on the filler instant itself: the day still holds, the minute means nothing.
    release = primeClock(new Date(filler))
    const { container } = render(<NextUpStrip today={brooklynDate(filler)} active={active} />)
    const slots = screen.getAllByText('TBC')
    expect(slots).toHaveLength(4)
    for (const slot of slots) {
      expect(slot.className).toContain('italic')
      expect(slot.className).toContain('text-floodlight-strong')
    }
    expect(container.textContent).toContain(`+1 more today · ${day[4]!.home.name} v ${day[4]!.away.name}`)
    expect(container.textContent).not.toMatch(CLOCK)
  })

  it('Poster: the slate row reads TBC, and the sub-line counts it without a FIRST or KICKOFF time', () => {
    const [only] = placeholderDay(1)
    release = primeClock(new Date(only!.kickoffUtc))
    const { container } = render(<TonightSlate today={brooklynDate(only!.kickoffUtc)} active={active} />)
    const slot = screen.getByText('TBC')
    expect(slot.className).toContain('italic')
    expect(slot.className).toContain('text-floodlight-strong')
    expect(screen.getByText('1 REMAINING · 1 TBC')).toBeTruthy()
    expect(container.textContent).toContain(`${only!.home.name} v ${only!.away.name}`)
    expect(container.textContent).not.toMatch(CLOCK)
  })
})

// The ticker's "NEXT carries its Brooklyn date" cases went with it. The same rule on the two
// heroes that remain: a kickoff after Brooklyn midnight's UTC date is still tomorrow here.
it('a later-day NEXT carries its Brooklyn day on both heroes, not the UTC or stadium date', () => {
  FIXTURES.forEach((f) => { f.status = 'cancelled' })
  const next = FIXTURES[0]!
  next.status = 'scheduled'
  next.timeConfidence = 'exact'
  next.kickoffUtc = '2026-09-07T00:30:00.000Z' // ILLUSTRATIVE; Sun 6 Sep, 8:30 PM in Brooklyn.
  delete next.result
  release = primeClock(new Date('2026-09-05T23:00:00.000Z')) // Sat 5 Sep, 7:00 PM in Brooklyn.
  const ledger = render(<NextUpStrip today="2026-09-05" active={active} />)
  expect(screen.getByText('Tomorrow')).toBeTruthy()
  expect(ledger.container.textContent).toContain('8:30')
  expect(ledger.container.textContent).not.toMatch(/2 days|Today/)
  ledger.unmount()
  const poster = render(<TonightSlate today="2026-09-05" active={active} />)
  expect(screen.getByText('Next matchday — nothing left today')).toBeTruthy()
  expect(screen.getByText('Sun 6 Sep')).toBeTruthy()
  expect(poster.container.textContent).toContain('KICKOFF 8:30 PM')
})
