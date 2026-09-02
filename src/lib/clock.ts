import { todayIso } from './time'

/**
 * The one ticking clock the app reads from. A minute-aligned timer, re-armed after every
 * tick (never `setInterval`, which drifts), plus an immediate tick when the environment
 * says the page came back into view — the mechanism a suspended or backgrounded tab uses
 * to catch up in one step instead of skipping a rollover. Injectable so the tick logic is
 * unit-testable with fake timers; `clock` below is the one real-environment instance the
 * app actually uses, via `useNow()`.
 */

export type ClockSnapshot = {
  /** The current *minute*, as an ISO instant (seconds and milliseconds always zero) — what
   *  every `nowUtcIso` parameter wants. The clock ticks in minutes, so the snapshot is the
   *  minute: two reads inside the same minute are the same snapshot, by identity. */
  nowUtcIso: string
  /** The current instant's Brooklyn calendar date. */
  today: string
}

export type ClockEnv = {
  now: () => number
  setTimeout: (cb: () => void, ms: number) => number
  clearTimeout: (id: number) => void
  /** Subscribes to whatever the environment considers "we might be behind, check now" —
   *  visibility change, window focus, a bfcache restore. Returns an unsubscribe function. */
  listen: (fire: () => void) => () => void
}

export type Clock = {
  subscribe: (onChange: () => void) => () => void
  getSnapshot: () => ClockSnapshot
  /** Test/debug hook: how many subscribers are currently holding the clock running. */
  subscriberCount: () => number
}

const MINUTE_MS = 60_000
/** A small settle margin so the armed timer reliably fires just after the boundary, never
 *  a hair before it (which would re-read the same, not-yet-rolled minute). */
const SETTLE_MS = 50

function snapshotAt(instant: number): ClockSnapshot {
  // Floored to the minute. Every consumer compares against kickoff instants that sit on
  // :00 seconds, or measures hours since a sync — none can tell :00.050 from :23.456 —
  // while a catch-up tick (focus, visibilitychange) inside the minute the armed timer
  // already covers *must* come out identical, or every alt-tab re-renders the app.
  const d = new Date(instant - (instant % MINUTE_MS))
  return { nowUtcIso: d.toISOString(), today: todayIso(d) }
}

function msToNextMinute(instant: number): number {
  return MINUTE_MS - (instant % MINUTE_MS) + SETTLE_MS
}

export function createClock(env: ClockEnv): Clock {
  let snapshot = snapshotAt(env.now())
  const subscribers = new Set<() => void>()
  let timerId: number | null = null
  let unlisten: (() => void) | null = null

  function notifyIfChanged() {
    const next = snapshotAt(env.now())
    // A visibility-triggered tick can land in the same minute the armed timer already
    // covers — the snapshot is minute-floored, so "same minute" is literally "same string",
    // and keeping the old object's identity is what stops a spurious re-render.
    if (next.nowUtcIso === snapshot.nowUtcIso) return
    snapshot = next
    for (const fn of subscribers) fn()
  }

  function armTimer() {
    if (timerId !== null) return
    timerId = env.setTimeout(() => {
      timerId = null
      notifyIfChanged()
      armTimer()
    }, msToNextMinute(env.now()))
  }

  function disarmTimer() {
    if (timerId !== null) {
      env.clearTimeout(timerId)
      timerId = null
    }
  }

  return {
    subscribe(onChange) {
      subscribers.add(onChange)
      if (subscribers.size === 1) {
        // A subscriber can arrive after real time has moved on since this module loaded
        // (or since the last unsubscribe) — resync before arming so the first tick's delay
        // is measured from now, not from a stale snapshot.
        snapshot = snapshotAt(env.now())
        armTimer()
        unlisten = env.listen(notifyIfChanged)
      }
      return () => {
        subscribers.delete(onChange)
        if (subscribers.size === 0) {
          disarmTimer()
          unlisten?.()
          unlisten = null
        }
      }
    },
    getSnapshot() {
      return snapshot
    },
    subscriberCount() {
      return subscribers.size
    },
  }
}

// This module is imported by the node test suite (no DOM lib, via tests/clock.test.ts
// reaching for `createClock`) — same reason `theme.ts` reaches `window`/`document` through
// a structural `globalThis` view instead of referencing the DOM lib types directly.
type BrowserGlobals = {
  window: {
    setTimeout: (cb: () => void, ms: number) => number
    clearTimeout: (id: number) => void
    addEventListener: (type: string, listener: () => void) => void
    removeEventListener: (type: string, listener: () => void) => void
  }
  document: {
    visibilityState: string
    addEventListener: (type: string, listener: () => void) => void
    removeEventListener: (type: string, listener: () => void) => void
  }
}
const browser = globalThis as unknown as BrowserGlobals

/** The live environment's clock — what `useNow()` reads by default. */
export const clock: Clock = createClock({
  now: () => Date.now(),
  setTimeout: (cb, ms) => browser.window.setTimeout(cb, ms),
  clearTimeout: (id) => browser.window.clearTimeout(id),
  listen: (fire) => {
    const onVisibility = () => {
      if (browser.document.visibilityState === 'visible') fire()
    }
    browser.document.addEventListener('visibilitychange', onVisibility)
    browser.window.addEventListener('focus', fire)
    browser.window.addEventListener('pageshow', fire)
    return () => {
      browser.document.removeEventListener('visibilitychange', onVisibility)
      browser.window.removeEventListener('focus', fire)
      browser.window.removeEventListener('pageshow', fire)
    }
  },
})
