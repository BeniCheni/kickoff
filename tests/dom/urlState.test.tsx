import { StrictMode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, renderHook, screen } from '@testing-library/react'
import App from '../../src/App'
import { useUrlState } from '../../src/lib/useUrlState'
import { COMPETITION_KEYS } from '../../src/lib/competitions'
import { edt, popTo, primeClock, tick, wake } from './rig'

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
  it('keeps the setter and popstate subscription stable across unrelated renders', () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    try {
      const hook = renderHook(() => useUrlState<Tab>('tab', 'fixtures', encodeTab, decodeTab), { wrapper: StrictMode })
      const setter = hook.result.current[1]
      const subscriptions = add.mock.calls.filter(([name]) => name === 'popstate').length
      hook.rerender()
      hook.rerender()
      expect(hook.result.current[1]).toBe(setter)
      expect(add.mock.calls.filter(([name]) => name === 'popstate')).toHaveLength(subscriptions)
      hook.unmount()
      expect(remove.mock.calls.filter(([name]) => name === 'popstate')).toHaveLength(subscriptions)
    } finally { add.mockRestore(); remove.mockRestore() }
  })

  it('reads the latest initial and decoder without resubscribing', () => {
    const { result, rerender } = renderHook(({ initial }) => useUrlState('n', initial, String, (raw) => {
      if (raw === 'bad') throw new Error('bad')
      return Number(raw) + initial
    }), { initialProps: { initial: 10 } })
    rerender({ initial: 20 })
    act(() => popTo('/?n=2'))
    expect(result.current[0]).toBe(22)
    act(() => popTo('/?n=bad'))
    expect(result.current[0]).toBe(20)
    act(() => popTo('/'))
    expect(result.current[0]).toBe(20)
  })

  it('preserves the pathname and hash when a query is present and when it empties', () => {
    window.history.replaceState(null, '', '/kickoff/?tab=table#fixtures')
    const { result } = renderHook(() => useUrlState<Tab>('tab', 'fixtures', encodeTab, decodeTab))
    act(() => result.current[1]('table'))
    expect(window.location.pathname + window.location.search + window.location.hash).toBe('/kickoff/?tab=table#fixtures')
    act(() => result.current[1]('fixtures'))
    expect(window.location.pathname + window.location.search + window.location.hash).toBe('/kickoff/#fixtures')
  })
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

describe('App normalizes once on load', () => {
  it('normalizes junk and inactive-page keys, preserving the hash and unknown query values without a push', () => {
    release = primeClock(edt('2026-09-05T12:00:00'))
    window.history.replaceState(null, '', '/kickoff/?lens=BROADCAST&date=2026-13-45&league=bad&only=&ref=friend#fixtures')
    const before = window.history.length
    render(<StrictMode><App /></StrictMode>)
    expect(window.location.pathname + window.location.search + window.location.hash).toBe('/kickoff/?only=&ref=friend#fixtures')
    expect(window.history.length).toBe(before)
    expect(document.documentElement.dataset.lens).toBe('poster')
    expect(screen.getByText(`0 of ${COMPETITION_KEYS.length} competitions shown`)).toBeTruthy()
  })

  it('?date=<today> unpins on load and follows the next midnight', () => {
    release = primeClock(edt('2026-09-13T23:59:00'))
    window.history.replaceState(null, '', '/?date=2026-09-13#keep')
    render(<App />)
    expect(window.location.search).toBe('')
    tick(61_000)
    expect(screen.getByText('Sep 14 – September 20, 2026')).toBeTruthy()
    expect(window.location.hash).toBe('#keep')
  })

  it('Back to an absent or invalid date after rollover uses the new today', () => {
    release = primeClock(edt('2026-09-13T23:59:00'))
    render(<App />)
    wake(edt('2026-09-14T08:00:00'))
    act(() => popTo('/?date=2026-10-07'))
    expect(screen.getByText('Oct 5 – October 11, 2026')).toBeTruthy()
    act(() => popTo('/?date=bad'))
    expect(screen.getByText('Sep 14 – September 20, 2026')).toBeTruthy()
    act(() => popTo('/'))
    expect(screen.getByText('Sep 14 – September 20, 2026')).toBeTruthy()
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
