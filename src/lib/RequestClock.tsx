'use client'

import { useRef, type ReactNode } from 'react'
import { browserClockEnv, createClock, type Clock, type ClockSnapshot } from './clock'
import { ClockContext } from './useNow'

export function ClockProvider({ clock: store, children }: { clock: Clock; children: ReactNode }) {
  return <ClockContext.Provider value={store}>{children}</ClockContext.Provider>
}

/** One store for this mounted app. The snapshot is the request's; subscribe samples
 *  the browser clock. A second mount gets its own store. */
export function RequestClock({ snapshot, children }: { snapshot: ClockSnapshot; children: ReactNode }) {
  const store = useRef<Clock | null>(null)
  if (!store.current) store.current = createClock(browserClockEnv(), snapshot)
  return <ClockProvider clock={store.current}>{children}</ClockProvider>
}
