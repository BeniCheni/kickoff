import { vi } from 'vitest'
import { act } from '@testing-library/react'
import { clock } from '../../src/lib/clock'

/**
 * The rig: what a component test needs that jsdom does not give it, each piece reaching the
 * app's own objects (the clock store in `src/lib/clock.ts`, `window.history`, `globalThis`)
 * rather than a stand-in. These are the five affordances v0.2.5 inherits
 * (`docs/v0.2.4-proposal.md`, "The five affordances") — extend them here, don't re-invent
 * them in a test file.
 */

/** Brooklyn wall-clock → instant. Every date used in this suite is in September, so the
 *  offset is EDT and written explicitly; the host machine's zone never enters. */
export function edt(local: string): Date {
  return new Date(`${local}-04:00`)
}

/**
 * jsdom has no `matchMedia`. The stub answers the two queries the app asks —
 * `prefers-color-scheme: dark` (theme.ts) and `prefers-reduced-motion: reduce` (App's lens
 * cross-fade) — and nothing else matches. The returned controls dispatch changes to the
 * same MediaQueryLists the app subscribed to; listenerCount checks cleanup.
 */
export function installMatchMedia({ dark = false, reducedMotion = false } = {}) {
  const queries = new Map<string, MediaQueryList>()
  const listeners = new Map<string, Set<EventListenerOrEventListenerObject>>()
  const matches = (query: string) => query.includes('prefers-color-scheme: dark')
    ? dark : query.includes('prefers-reduced-motion') ? reducedMotion : false
  const stub = (query: string): MediaQueryList => {
    const existing = queries.get(query)
    if (existing) return existing
    const callbacks = new Set<EventListenerOrEventListenerObject>()
    listeners.set(query, callbacks)
    const media = {
      get matches() { return matches(query) },
      media: query,
      onchange: null,
      addEventListener(type: string, fn: EventListenerOrEventListenerObject) { if (type === 'change') callbacks.add(fn) },
      removeEventListener(type: string, fn: EventListenerOrEventListenerObject) { if (type === 'change') callbacks.delete(fn) },
      addListener() {},
      removeListener() {},
      dispatchEvent(event: Event) {
        for (const fn of callbacks) typeof fn === 'function' ? fn.call(media, event) : fn.handleEvent(event)
        media.onchange?.call(media, event as MediaQueryListEvent)
        return true
      },
    } as unknown as MediaQueryList
    queries.set(query, media)
    return media
  }
  Object.defineProperty(globalThis, 'matchMedia', { value: stub, configurable: true, writable: true })
  const change = (update: () => void) => {
    act(() => {
      const before = new Map([...queries].map(([q, m]) => [q, m.matches]))
      update()
      for (const [query, media] of queries) {
        if (media.matches === before.get(query)) continue
        media.dispatchEvent(Object.assign(new Event('change'), { matches: media.matches, media: query }))
      }
    })
  }
  return {
    setDark: (value: boolean) => change(() => { dark = value }),
    setReducedMotion: (value: boolean) => change(() => { reducedMotion = value }),
    listenerCount: () => [...listeners.values()].reduce((n, list) => n + list.size, 0),
  }
}

/**
 * A `localStorage` that throws on mere access — Safari private mode, a storage-blocked
 * embed. Replaces the global and returns the restore function; call it in `finally`, because
 * setup.ts clears storage after every test and a leaked hostile one fails that step loudly
 * (on purpose: a leaked stub is a test-ordering bug).
 */
export function throwingStorage(): () => void {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const deny = (): never => {
    throw new DOMException('The operation is insecure.', 'SecurityError')
  }
  const hostile = { getItem: deny, setItem: deny, removeItem: deny, clear: deny, key: deny, length: 0 }
  Object.defineProperty(globalThis, 'localStorage', { value: hostile, configurable: true })
  return () => {
    if (original) Object.defineProperty(globalThis, 'localStorage', original)
    else delete (globalThis as { localStorage?: unknown }).localStorage
  }
}

/**
 * Drive the clock the app actually reads. Fake timers take over `Date` and `setTimeout` —
 * only those; React's scheduler keeps its own primitives — then one subscription is held for
 * the test's life so the store re-reads the faked instant now, not when App's first
 * `useNow()` arrives (the store resyncs on its first subscriber, so without this the first
 * render would see the instant the module loaded and correct itself a render later).
 * Returns the release function; call it in `afterEach`. `subscriberCount()` reads one higher
 * than the mounted tree while the primer is held — compare counts, don't assume zero.
 */
export function primeClock(at: Date): () => void {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'], now: at })
  const release = clock.subscribe(() => {})
  return () => {
    release()
    vi.useRealTimers()
  }
}

/** Let `ms` of fake time pass; the clock's armed timer fires 50 ms past each minute. */
export function tick(ms: number): void {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

/** A tab waking after a sleep: time has moved with no timer having fired, and the
 *  environment signals `focus` — the catch-up path in clock.ts's `listen`. */
export function wake(at: Date): void {
  act(() => {
    vi.setSystemTime(at)
    window.dispatchEvent(new Event('focus'))
  })
}

/** URL state without navigating: the method the browser matrix prescribes
 *  (`browser-matrix.md`, "URL state without navigating"), verbatim. */
export function popTo(url: string): void {
  window.history.replaceState(null, '', url)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
