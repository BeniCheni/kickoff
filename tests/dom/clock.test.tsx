import { afterEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from '../../src/App'
import { clock } from '../../src/lib/clock'
import { edt, primeClock, tick, wake } from './rig'

/**
 * Affordance 1 — drive the clock — and the pinned-date rollover regression the v0.2.0 review
 * found in a browser (`docs/v0.2.0-proposal.md`, "Found and fixed by this pass"). The week
 * label is the observable: `startOfWeek` is Monday, so a Sunday → Monday midnight moves it.
 */

let release: (() => void) | null = null
afterEach(() => {
  release?.()
  release = null
})

const WEEK_OF_SEP_7 = 'Sep 7 – September 13, 2026'
const WEEK_OF_SEP_14 = 'Sep 14 – September 20, 2026'

describe('useNow reads the clock the test drives (affordance 1)', () => {
  it('a minute tick across Sunday midnight re-anchors an unpinned view to the new week', () => {
    release = primeClock(edt('2026-09-13T23:59:00'))
    render(<App />)
    expect(screen.getByText(WEEK_OF_SEP_7)).toBeTruthy()
    expect(window.location.search).toBe('')

    tick(61_000)

    expect(clock.getSnapshot().today).toBe('2026-09-14')
    expect(screen.getByText(WEEK_OF_SEP_14)).toBeTruthy()
    // Unpinned: today is the default and the default is omitted, so nothing is written down.
    expect(window.location.search).toBe('')
  })

  it('a focus after a long sleep catches up in one step — no timer fired', () => {
    release = primeClock(edt('2026-09-13T23:59:00'))
    render(<App />)
    expect(screen.getByText(WEEK_OF_SEP_7)).toBeTruthy()

    wake(edt('2026-09-15T08:00:00'))

    expect(clock.getSnapshot().today).toBe('2026-09-15')
    expect(screen.getByText(WEEK_OF_SEP_14)).toBeTruthy()
  })
})

describe('the pinned-date rollover (v0.2.0 review; the effect tests the URL, not the anchor)', () => {
  it('?date=<the day that is ending> survives midnight — a pin is navigation, not a stale default', () => {
    release = primeClock(edt('2026-09-12T23:59:00'))
    window.history.replaceState(null, '', '/?date=2026-09-12')
    render(<App />)
    expect(screen.getByText(WEEK_OF_SEP_7)).toBeTruthy()

    tick(61_000)

    expect(clock.getSnapshot().today).toBe('2026-09-13')
    expect(new URLSearchParams(window.location.search).get('date')).toBe('2026-09-12')
    expect(screen.getByText(WEEK_OF_SEP_7)).toBeTruthy()
  })

  it('…and the second midnight, into a new week, still does not move a pinned reader', () => {
    release = primeClock(edt('2026-09-12T23:59:00'))
    window.history.replaceState(null, '', '/?date=2026-09-12')
    render(<App />)

    tick(61_000)
    wake(edt('2026-09-14T00:00:00'))

    expect(clock.getSnapshot().today).toBe('2026-09-14')
    expect(new URLSearchParams(window.location.search).get('date')).toBe('2026-09-12')
    expect(screen.getByText(WEEK_OF_SEP_7)).toBeTruthy()
  })

  it('"Jump to today" un-pins it again', () => {
    release = primeClock(edt('2026-09-14T09:00:00'))
    window.history.replaceState(null, '', '/?date=2026-09-12')
    render(<App />)
    expect(screen.getByText(WEEK_OF_SEP_7)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Jump to today' }))

    expect(window.location.search).toBe('')
    expect(screen.getByText(WEEK_OF_SEP_14)).toBeTruthy()
  })
})
