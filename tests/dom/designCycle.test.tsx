import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { FIXTURES, META } from '../../src/lib/fixtures'
import { COMPETITION_KEYS } from '../../src/lib/competitions'
import { brooklynDate, niceDate, posterDayTitle, startOfWeek } from '../../src/lib/time'
import { LIVE_WINDOW_MS } from '../../src/lib/lensSelectors'
import { WeekView } from '../../src/components/WeekView'
import { MonthView } from '../../src/components/MonthView'
import { TickerStrip } from '../../src/components/TickerStrip'
import { primeClock, wake } from './rig'

let release: (() => void) | undefined
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
})
const active = new Set(COMPETITION_KEYS)

describe('synthetic frozen snapshot through the real selector and clock wiring', () => {
  for (const lens of ['ledger', 'poster', 'broadcast'] as const) {
    for (const view of ['week', 'month']) {
      it(`${lens} ${view}: LIVE expires through parent selection, without changing the snapshot`, () => {
        const fixture = FIXTURES.find((f) => f.timeConfidence === 'exact')!
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
        expect(screen.getByText('LIVE')).toBeTruthy()
        wake(new Date(kickoff + LIVE_WINDOW_MS + 1))
        // The app's existing clock floors to minutes; the pure selector tests pin +1ms.
        expect(screen.getByText('LIVE')).toBeTruthy()
        wake(new Date(kickoff + LIVE_WINDOW_MS + 60_000))
        expect(screen.queryByText('LIVE')).toBeNull()
        const pill = screen.getByText('KICKED OFF')
        expect(pill.className).toContain('border-floodlight-strong')
        expect(pill.closest('[data-hot]')).toBeNull()
        expect(within(pill.closest('button')!).getByText('1–0').className).toContain('text-pitch')
        expect(fixture.status).toBe('in_play')
        fireEvent.click(pill.closest('button')!)
        expect(pill.closest('button')?.getAttribute('aria-expanded')).toBe('true')
      })
    }
  }
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
