import { useSyncExternalStore } from 'react'
import { clock } from './clock'

/**
 * The one ticking clock every component reads. Re-renders its caller once a minute (or
 * immediately on a visibility/focus catch-up tick) — see clock.ts for the mechanism.
 */
export function useNow() {
  return useSyncExternalStore(clock.subscribe, clock.getSnapshot)
}
