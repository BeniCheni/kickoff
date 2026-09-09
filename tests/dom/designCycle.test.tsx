import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { BY_DATE, FIXTURES, META } from '../../src/lib/fixtures'
import type { Fixture } from '../../src/lib/schema'
import { COMPETITION_KEYS } from '../../src/lib/competitions'
import { brooklynDate, fixtureTimes, niceDate, posterDayTitle, startOfWeek } from '../../src/lib/time'
import { LIVE_WINDOW_MS } from '../../src/lib/lensSelectors'
import { WeekView } from '../../src/components/WeekView'
import { MonthView } from '../../src/components/MonthView'
import { TickerStrip } from '../../src/components/TickerStrip'
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
 * (`includes` alone would) and a venue string from answering for a pairing. The month grid's
 * day cells are buttons too, but their aria-label names a date and competitions, never a club.
 * Placeholder rows render "—" in the time slot and are not this helper's job.
 */
function fixtureRowFor(fixture: Fixture) {
  const { brooklyn } = fixtureTimes(fixture.kickoffUtc, fixture.venueTz)
  return screen.getByRole('button', {
    name: (name) => name.startsWith(brooklyn.time) && name.includes(`${fixture.home.name} vs ${fixture.away.name}`),
  })
}

describe('synthetic frozen snapshot through the real selector and clock wiring', () => {
  for (const lens of ['ledger', 'poster', 'broadcast'] as const) {
    for (const view of ['week', 'month']) {
      it(`${lens} ${view}: LIVE expires through parent selection, without changing the snapshot`, () => {
        const fixture = FIXTURES.find((f) => f.timeConfidence === 'exact' && !f.result)!
        fixture.status = 'in_play'
        fixture.result = { home: 1, away: 0 } // ILLUSTRATIVE; in-memory only.
        const kickoff = Date.parse(fixture.kickoffUtc)
        const today = brooklynDate(fixture.kickoffUtc)
        release = primeClock(new Date(kickoff + LIVE_WINDOW_MS))
        if (view === 'week') {
          render(<WeekView weekStart={startOfWeek(today)} active={active} today={today} lens={lens} />)
        } else {
          render(<MonthView monthStart={`${today.slice(0, 7)}-01`} active={active} today={today} />)
          // The fixture's own day, by its aria-label — not the month's first match-day, which
          // only coincides with it while the snapshot's first exact fixture opens the window.
          const cell = screen.getByRole('button', { name: (n) => n.startsWith(`${niceDate(today)}, `) })
          fireEvent.click(cell)
        }
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

describe('ticker mounted/static contract', () => {
  it('preserves the strip node when the final exact kickoff expires; no duplicate or pause control', () => {
    FIXTURES.forEach((f) => { f.status = 'cancelled' })
    const fixture = FIXTURES[0]!
    fixture.status = 'scheduled'
    fixture.timeConfidence = 'exact'
    const kickoff = Date.parse(fixture.kickoffUtc)
    release = primeClock(new Date(kickoff - 1))
    const { container } = render(<TickerStrip />)
    const strip = container.firstElementChild
    expect(screen.getByRole('button', { name: 'Pause ticker' })).toBeTruthy()
    wake(new Date(kickoff))
    expect(container.firstElementChild).toBe(strip)
    expect(strip?.getAttribute('data-ticker')).toBe('empty')
    expect(strip?.textContent).toBe(`NEXT — nothing scheduled in this snapshot · window ends ${posterDayTitle(META.window.to)}`)
    expect(screen.queryByRole('button')).toBeNull()
    expect(container.querySelector('.ticker-track')).toBeNull()
    // The static line is a Tab stop: it must expose a role and a name, not a nameless generic.
    expect(screen.getByRole('region', { name: 'Ticker' })).toBe(strip?.firstElementChild)
    expect(strip?.firstElementChild?.getAttribute('tabindex')).toBe('0')
  })
  it('renders one italic TBC time slot per track for a placeholder NEXT', () => {
    FIXTURES.forEach((f) => { f.status = 'cancelled' })
    const fixture = FIXTURES[0]!
    fixture.status = 'scheduled'
    fixture.timeConfidence = 'round_placeholder'
    release = primeClock(new Date(fixture.kickoffUtc))
    const { container } = render(<TickerStrip />)
    expect(container.querySelector('[data-ticker="active"]')).toBeTruthy()
    expect(container.querySelector('i')?.textContent).toBe('TBC')
    expect(container.querySelector('i')?.className).toContain('text-floodlight-strong')
  })
})

it('renders empty NEXT provenance on the moving track alongside FT', () => {
  FIXTURES.forEach((f) => { f.status = 'cancelled' })
  const fixture = FIXTURES[0]!
  fixture.status = 'full_time'
  fixture.result = { home: 1, away: 0 }
  release = primeClock(new Date(fixture.kickoffUtc))
  const { container } = render(<TickerStrip />)
  expect(container.querySelector('[data-ticker="active"]')).toBeTruthy()
  const track = container.querySelector('.ticker-track > span')!
  expect(track.textContent).toContain(`window ends ${posterDayTitle(META.window.to)}`)
  expect(track.textContent).toContain('FT')
  expect(container.querySelector('.ticker-track > span:nth-child(2)')?.getAttribute('aria-hidden')).toBe('true')
  expect(screen.getByRole('button', { name: 'Pause ticker' })).toBeTruthy()
})
