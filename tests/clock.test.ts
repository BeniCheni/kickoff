import { describe, it, expect } from 'vitest'
import { createClock, type ClockEnv } from '../src/lib/clock'
import { todayIso } from '../src/lib/time'

/**
 * A fully controlled fake environment: `now` only moves when the test moves it, `setTimeout`
 * records a target instant instead of scheduling anything real, and `listen`'s subscribers
 * are fired manually — the test's stand-in for a visibilitychange/focus event. This is the
 * only way to exercise a minute-aligned re-arming timer and an 8-hour "suspension" without
 * actually waiting.
 */
function fakeEnv(startMs: number) {
  let now = startMs
  let nextId = 1
  const timers = new Map<number, { at: number; cb: () => void }>()
  const listeners = new Set<() => void>()

  const env: ClockEnv = {
    now: () => now,
    setTimeout: (cb, ms) => {
      const id = nextId++
      timers.set(id, { at: now + ms, cb })
      return id
    },
    clearTimeout: (id) => {
      timers.delete(id)
    },
    listen: (fire) => {
      listeners.add(fire)
      return () => listeners.delete(fire)
    },
  }

  return {
    env,
    /** Jumps time forward without firing anything — a suspended tab's timers don't run. */
    jumpSilently(ms: number) {
      now = ms
    },
    /** Advances to the single nearest pending timer's target instant and fires it — a
     *  realistic, undrifted "one real tick happened" step. */
    fireNextTimer() {
      let earliestId: number | null = null
      let earliestAt = Infinity
      for (const [id, t] of timers) {
        if (t.at < earliestAt) {
          earliestAt = t.at
          earliestId = id
        }
      }
      if (earliestId === null) throw new Error('no pending timer to fire')
      now = earliestAt
      const t = timers.get(earliestId)!
      timers.delete(earliestId)
      t.cb()
    },
    /** Simulates the environment's own "check now" signal (visibilitychange, focus, …). */
    fireListeners() {
      for (const l of listeners) l()
    },
    pendingTimerCount: () => timers.size,
    listenerCount: () => listeners.size,
    nowMs: () => now,
  }
}

describe('createClock — the tick', () => {
  it('fires at the next minute boundary, not 60s after subscribing', () => {
    const start = Date.parse('2026-09-01T12:00:23.456Z')
    const h = fakeEnv(start)
    const clock = createClock(h.env)
    clock.subscribe(() => {})

    // Armed for :00:23.456 -> the *next* :01:00.050, an ~36.6s delay, not a flat 60s.
    const expectedAt = Date.parse('2026-09-01T12:01:00.050Z')
    h.fireNextTimer()
    expect(h.nowMs()).toBe(expectedAt)
    expect(clock.getSnapshot().nowUtcIso).toBe(new Date(expectedAt).toISOString())
  })

  it('never drifts across many ticks — always exactly 50ms past the boundary', () => {
    const h = fakeEnv(Date.parse('2026-09-01T12:00:00.000Z'))
    const clock = createClock(h.env)
    clock.subscribe(() => {})

    for (let i = 0; i < 5; i++) {
      h.fireNextTimer()
      expect(h.nowMs() % 60_000).toBe(50)
    }
  })

  it('re-syncs to the real instant when a subscriber arrives after time has already moved', () => {
    const h = fakeEnv(Date.parse('2026-09-01T12:00:00.000Z'))
    const clock = createClock(h.env)
    const unsub = clock.subscribe(() => {})
    unsub()
    h.jumpSilently(Date.parse('2026-09-01T15:30:10.000Z'))

    clock.subscribe(() => {})
    // Armed relative to the NEW now (15:30:10), not the stale one from first subscribe.
    expect(h.pendingTimerCount()).toBe(1)
    h.fireNextTimer()
    expect(h.nowMs()).toBe(Date.parse('2026-09-01T15:31:00.050Z'))
  })
})

describe('createClock — catching up without a separate midnight event', () => {
  it('an 8-hour suspension followed by a visibility tick lands on tomorrow', () => {
    // 2026-09-01T03:59:30Z is 2026-08-31 23:59:30 EDT — one Brooklyn minute before midnight.
    const start = Date.parse('2026-09-01T03:59:30.000Z')
    const h = fakeEnv(start)
    const clock = createClock(h.env)
    expect(clock.getSnapshot().today).toBe('2026-08-31')

    let notified = 0
    clock.subscribe(() => {
      notified++
    })

    // The tab suspends before its armed timer ever fires — jump 8h with nothing firing,
    // exactly what a backgrounded/suspended tab's throttled timers would do.
    h.jumpSilently(start + 8 * 60 * 60 * 1000)
    expect(clock.getSnapshot().today).toBe('2026-08-31') // stale until something ticks

    h.fireListeners() // the tab regains visibility
    expect(notified).toBe(1)
    expect(clock.getSnapshot().today).toBe('2026-09-01')
    expect(clock.getSnapshot().nowUtcIso).toBe(new Date(start + 8 * 60 * 60 * 1000).toISOString())
  })

  it('a visibility tick that lands in the same minute as the last one is a no-op', () => {
    const h = fakeEnv(Date.parse('2026-09-01T12:00:00.100Z'))
    const clock = createClock(h.env)
    let notified = 0
    clock.subscribe(() => {
      notified++
    })

    const before = clock.getSnapshot()
    h.fireListeners() // no real time has passed
    expect(clock.getSnapshot()).toBe(before) // same object — stable identity, no re-render
    expect(notified).toBe(0)
  })
})

describe('createClock — subscriber refcounting', () => {
  it('arms one timer and one listener regardless of subscriber count, and tears down at zero', () => {
    const h = fakeEnv(Date.parse('2026-09-01T12:00:00.000Z'))
    const clock = createClock(h.env)

    const unsubA = clock.subscribe(() => {})
    expect(clock.subscriberCount()).toBe(1)
    expect(h.pendingTimerCount()).toBe(1)
    expect(h.listenerCount()).toBe(1)

    const unsubB = clock.subscribe(() => {})
    expect(clock.subscriberCount()).toBe(2)
    expect(h.pendingTimerCount()).toBe(1) // still just one timer, not one per subscriber
    expect(h.listenerCount()).toBe(1)

    unsubA()
    expect(clock.subscriberCount()).toBe(1)
    expect(h.pendingTimerCount()).toBe(1) // the last subscriber keeps the clock running

    unsubB()
    expect(clock.subscriberCount()).toBe(0)
    expect(h.pendingTimerCount()).toBe(0) // timer cleared
    expect(h.listenerCount()).toBe(0) // listener unsubscribed
  })

  it('notifies every subscriber on a tick', () => {
    const h = fakeEnv(Date.parse('2026-09-01T12:00:00.000Z'))
    const clock = createClock(h.env)
    let a = 0
    let b = 0
    clock.subscribe(() => {
      a++
    })
    clock.subscribe(() => {
      b++
    })
    h.fireNextTimer()
    expect(a).toBe(1)
    expect(b).toBe(1)
  })
})

describe('createClock — the US fall-back night', () => {
  // US clocks fall back 1 Nov 2026 02:00 EDT -> 01:00 EST, i.e. the local hour 1:00-2:00am
  // repeats — but at 06:00Z exactly once, in UTC-ms terms, which never repeats or skips.
  // This module only ever does epoch-ms arithmetic and hands the instant to Intl for local
  // formatting, so there is nothing for it to get wrong at the transition itself; these
  // tests are the regression guard for that staying true.

  it('keeps ticking exactly minute-aligned across Brooklyn midnight on the fall-back date', () => {
    // Brooklyn midnight (still EDT before the 2am transition) is 04:00Z.
    const h = fakeEnv(Date.parse('2026-11-01T03:58:00.000Z'))
    const clock = createClock(h.env)
    clock.subscribe(() => {})

    const seenToday = new Set<string>()
    for (let i = 0; i < 5; i++) {
      h.fireNextTimer()
      expect(h.nowMs() % 60_000).toBe(50)
      const snap = clock.getSnapshot()
      expect(snap.today).toBe(todayIso(new Date(h.nowMs())))
      seenToday.add(snap.today)
    }
    expect(seenToday).toEqual(new Set(['2026-10-31', '2026-11-01']))
  })

  it('resyncs cleanly across the literal fall-back instant (06:00Z) after a suspension-style jump', () => {
    const h = fakeEnv(Date.parse('2026-11-01T05:55:00.000Z'))
    const clock = createClock(h.env)
    clock.subscribe(() => {})

    // A jump the armed timer never fires for, then the visibility signal a resumed tab
    // sends — the same shape as the 8-hour-suspension case above, just straddling the
    // local repeated hour instead of Brooklyn midnight.
    h.jumpSilently(Date.parse('2026-11-01T06:05:00.000Z'))
    h.fireListeners()
    expect(clock.getSnapshot().today).toBe('2026-11-01')
    expect(clock.getSnapshot().nowUtcIso).toBe(new Date(h.nowMs()).toISOString())
  })
})
