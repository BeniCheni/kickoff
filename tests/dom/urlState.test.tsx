import { afterEach, describe, expect, it } from 'vitest'
import { act, render, renderHook, screen } from '@testing-library/react'
import App from '../../src/App'
import { useUrlState } from '../../src/lib/useUrlState'
import { COMPETITION_KEYS } from '../../src/lib/competitions'
import { edt, popTo, primeClock } from './rig'

/**
 * Affordance 2 — URL state without navigating — and the `?date=` crash the v0.1.0 review
 * found in a browser (commit e253a45: `?date=2026-13-45` passed a shape-only regex, then
 * `startOfWeek` sent NaN into a render-time RangeError; no boundary, empty #root).
 */

let release: (() => void) | null = null
afterEach(() => {
  release?.()
  release = null
})

type Tab = 'fixtures' | 'table'
const encodeTab = (v: Tab) => (v === 'fixtures' ? null : v)
const decodeTab = (s: string): Tab => (s === 'table' ? 'table' : 'fixtures')

describe('useUrlState — the popstate handler (affordance 2)', () => {
  it('re-reads its key on a synthetic PopStateEvent; a missing key means the initial', () => {
    window.history.replaceState(null, '', '/?tab=table')
    const { result } = renderHook(() => useUrlState<Tab>('tab', 'fixtures', encodeTab, decodeTab, 'push'))
    expect(result.current[0]).toBe('table')

    act(() => popTo('/'))
    expect(result.current[0]).toBe('fixtures')

    act(() => popTo('/?lens=broadcast&tab=table'))
    expect(result.current[0]).toBe('table')
  })

  it('a decoder that throws on popstate lands on the initial, never on a crash', () => {
    const decode = (s: string): number => {
      if (s === 'boom') throw new Error('unparseable')
      return Number(s)
    }
    const { result } = renderHook(() => useUrlState<number>('n', 0, (v) => String(v), decode))
    act(() => popTo('/?n=7'))
    expect(result.current[0]).toBe(7)
    act(() => popTo('/?n=boom'))
    expect(result.current[0]).toBe(0)
  })

  it('set() writes the URL — push for navigation, replace for a view preference, default omitted', () => {
    const before = window.history.length
    const pushed = renderHook(() => useUrlState<Tab>('tab', 'fixtures', encodeTab, decodeTab, 'push'))
    act(() => pushed.result.current[1]('table'))
    expect(window.location.search).toBe('?tab=table')
    expect(window.history.length).toBe(before + 1)
    act(() => pushed.result.current[1]('fixtures'))
    expect(window.location.search).toBe('')
    expect(window.history.length).toBe(before + 2)

    const replaced = renderHook(() => useUrlState<string>('view', 'week', (v) => (v === 'week' ? null : v), (s) => s))
    act(() => replaced.result.current[1]('month'))
    expect(window.location.search).toBe('?view=month')
    expect(window.history.length).toBe(before + 2)
  })
})

describe('the ?date= crash (v0.1.0 review, e253a45)', () => {
  it('date-shaped junk renders today’s week instead of throwing a RangeError', () => {
    release = primeClock(edt('2026-09-05T12:00:00'))
    window.history.replaceState(null, '', '/?date=2026-13-45')
    expect(() => render(<App />)).not.toThrow()
    expect(screen.getByText('Aug 31 – September 6, 2026')).toBeTruthy()
  })

  it('an impossible calendar date falls back the same way', () => {
    release = primeClock(edt('2026-09-05T12:00:00'))
    window.history.replaceState(null, '', '/?date=2026-02-30')
    expect(() => render(<App />)).not.toThrow()
    expect(screen.getByText('Aug 31 – September 6, 2026')).toBeTruthy()
  })
})

describe('the Step 0 contract: ?only= and &date= arriving without a reload', () => {
  it('&date= re-anchors the week and ?only= narrows the filter on one popstate', () => {
    release = primeClock(edt('2026-09-05T12:00:00'))
    render(<App />)
    expect(screen.getByText('Aug 31 – September 6, 2026')).toBeTruthy()
    expect(screen.getByText(`All ${COMPETITION_KEYS.length} competitions shown`)).toBeTruthy()

    act(() => popTo('/?only=laliga&date=2026-10-07'))

    expect(screen.getByText('Oct 5 – October 11, 2026')).toBeTruthy()
    expect(screen.getByText(`1 of ${COMPETITION_KEYS.length} competitions shown`)).toBeTruthy()
  })

  it('a popstate to ?tab=table swaps the page — Back reaches the Table without a click', () => {
    release = primeClock(edt('2026-09-05T12:00:00'))
    render(<App />)
    expect(screen.getByRole('button', { name: 'Fixtures' }).getAttribute('aria-current')).toBe('page')

    act(() => popTo('/?tab=table'))

    expect(screen.getByRole('button', { name: 'Table' }).getAttribute('aria-current')).toBe('page')
    expect(screen.queryByRole('button', { name: 'Jump to today' })).toBeNull()
  })
})
