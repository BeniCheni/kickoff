import { createContext, useContext, useSyncExternalStore } from 'react'
import { clock, type Clock } from './clock'

/**
 * Set by a request-scoped provider. The Vite app has no provider, so it keeps reading
 * the module clock. On the server a missing provider throws: that clock is one
 * process-wide store and must not render a request.
 */
export const ClockContext = createContext<Clock | null>(null)

export function useNow() {
  const provided = useContext(ClockContext)
  if (!provided && typeof window === 'undefined') {
    throw new Error('Kickoff needs a request clock on the server')
  }
  const store = provided ?? clock
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)
}
