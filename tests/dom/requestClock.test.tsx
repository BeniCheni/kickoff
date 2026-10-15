import { StrictMode } from 'react'
import { act, render, screen } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StalenessBanner } from '../../src/components/StalenessBanner'
import { clockSnapshotAt, type ClockSnapshot } from '../../src/lib/clock'
import { META, hoursSinceSync } from '../../src/lib/fixtures'
import { ClockProvider, RequestClock } from '../../src/lib/RequestClock'
import { useNow } from '../../src/lib/useNow'
import { mountRequestClock, tick } from './rig'

let release: (() => void) | null = null
afterEach(() => {
  release?.()
  release = null
})

function Probe() {
  const now = useNow()
  return <time dateTime={now.nowUtcIso}>{now.today}</time>
}

function crossing(hours: number): ClockSnapshot {
  const target = Date.parse(META.lastSyncAt) + hours * 3_600_000
  const floored = target - (target % 60_000)
  return clockSnapshotAt(floored >= target ? floored : floored + 60_000)
}

function beforeCrossing(hours: number): ClockSnapshot {
  return clockSnapshotAt(Date.parse(crossing(hours).nowUtcIso) - 60_000)
}

describe('server and client share one request snapshot', () => {
  it('hydrates the request minute, then catches up when the browser minute has moved', async () => {
    const served = clockSnapshotAt(Date.parse('2026-10-27T03:30:00.000Z'))
    const html = renderToString(<RequestClock snapshot={served}><Probe /></RequestClock>)
    expect(html).toContain('2026-10-27T03:30:00.000Z')
    expect(html).toContain('2026-10-26')

    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'], now: Date.parse('2026-10-27T03:31:10.000Z') })
    release = () => vi.useRealTimers()
    const host = document.createElement('div')
    host.innerHTML = html
    const recoverable: unknown[] = []
    await act(async () => {
      hydrateRoot(host, <RequestClock snapshot={served}><Probe /></RequestClock>, {
        onRecoverableError(error) { recoverable.push(error) },
      })
    })
    expect(recoverable).toEqual([])
    expect(host.querySelector('time')?.dateTime).toBe('2026-10-27T03:31:00.000Z')
    expect(host.textContent).toContain('2026-10-26')
  })

  it('rolls forward on the armed minute timer and across Brooklyn midnight', () => {
    const held = mountRequestClock(new Date('2026-09-01T03:59:10.000Z'))
    release = held.release
    render(<ClockProvider clock={held.store}><Probe /></ClockProvider>)
    expect(screen.getByRole('time').textContent).toBe('2026-08-31')
    tick(51_000)
    expect(screen.getByRole('time').getAttribute('datetime')).toBe('2026-09-01T04:00:00.000Z')
    expect(screen.getByRole('time').textContent).toBe('2026-09-01')
  })

  it('a hidden tab does not catch up, and becoming visible or restoring from bfcache does', () => {
    const held = mountRequestClock(new Date('2026-09-01T03:59:00.000Z'))
    release = held.release
    render(<ClockProvider clock={held.store}><Probe /></ClockProvider>)
    expect(screen.getByRole('time').getAttribute('datetime')).toBe('2026-09-01T03:59:00.000Z')

    vi.setSystemTime(Date.parse('2026-09-01T04:01:00.000Z'))
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
    act(() => { document.dispatchEvent(new Event('visibilitychange')) })
    expect(screen.getByRole('time').getAttribute('datetime')).toBe('2026-09-01T03:59:00.000Z')

    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' })
    act(() => { document.dispatchEvent(new Event('visibilitychange')) })
    expect(screen.getByRole('time').getAttribute('datetime')).toBe('2026-09-01T04:01:00.000Z')
    expect(screen.getByRole('time').textContent).toBe('2026-09-01')

    vi.setSystemTime(Date.parse('2026-09-01T05:02:00.000Z'))
    act(() => { window.dispatchEvent(new Event('pageshow')) })
    expect(screen.getByRole('time').getAttribute('datetime')).toBe('2026-09-01T05:02:00.000Z')
  })

  it('StrictMode leaves a single subscriber after the double mount', () => {
    const held = mountRequestClock(new Date('2026-09-01T12:00:00.000Z'))
    release = held.release
    render(<StrictMode><ClockProvider clock={held.store}><Probe /></ClockProvider></StrictMode>)
    expect(held.store.subscriberCount()).toBe(1)
  })
})

describe('freshness boundaries use the snapshot, not the request instant', () => {
  function banner(snapshot: ClockSnapshot) {
    release?.()
    const held = mountRequestClock(new Date(snapshot.nowUtcIso), snapshot)
    release = held.release
    return render(<ClockProvider clock={held.store}><StalenessBanner /></ClockProvider>)
  }

  it('is quiet at 23:59 hours and advisory at 24:00', () => {
    const quiet = beforeCrossing(24)
    const advisory = crossing(24)
    expect(hoursSinceSync(new Date(quiet.nowUtcIso))).toBeLessThan(24)
    expect(hoursSinceSync(new Date(advisory.nowUtcIso))).toBeGreaterThanOrEqual(24)
    expect(hoursSinceSync(new Date(advisory.nowUtcIso))).toBeLessThan(72)
    const quietView = banner(quiet)
    expect(screen.queryByText(/Data may have moved|Data is stale/)).toBeNull()
    quietView.unmount()
    banner(advisory)
    expect(screen.getByText(/Data may have moved/)).toBeTruthy()
    expect(screen.queryByText(/Data is stale/)).toBeNull()
  })

  it('stays advisory at 71:59 hours and turns stale at 72:00', () => {
    const advisory = beforeCrossing(72)
    const stale = crossing(72)
    expect(hoursSinceSync(new Date(advisory.nowUtcIso))).toBeGreaterThanOrEqual(24)
    expect(hoursSinceSync(new Date(advisory.nowUtcIso))).toBeLessThan(72)
    expect(hoursSinceSync(new Date(stale.nowUtcIso))).toBeGreaterThanOrEqual(72)
    const advisoryView = banner(advisory)
    expect(screen.getByText(/Data may have moved/)).toBeTruthy()
    advisoryView.unmount()
    banner(stale)
    expect(screen.getByText(/Data is stale/)).toBeTruthy()
  })
})
