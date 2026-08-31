import type { Lens } from './lens'

export type Theme = 'light' | 'dark'

/** Total decoder for localStorage values: anything unexpected reads as "no stored choice". */
export function parseTheme(raw: string | null): Theme | null {
  return raw === 'light' || raw === 'dark' ? raw : null
}

/**
 * Broadcast keeps its own theme memory: entering it with no stored Broadcast choice
 * defaults to dark, but a toggle made while inside Broadcast is remembered under this
 * separate key and never re-forced back to dark. The other lenses share the original key.
 */
export function themeStorageKey(lens: Lens): 'kickoff-theme' | 'kickoff-theme-broadcast' {
  return lens === 'broadcast' ? 'kickoff-theme-broadcast' : 'kickoff-theme'
}

/**
 * The one theme decision, used identically by the pre-paint bootstrap in main.tsx and
 * by App's lens-change effect so the two can never disagree.
 */
export function resolveTheme(
  lens: Lens,
  storedTheme: Theme | null,
  storedBroadcastTheme: Theme | null,
  prefersDark: boolean,
): Theme {
  if (lens === 'broadcast') return storedBroadcastTheme ?? 'dark'
  return storedTheme ?? (prefersDark ? 'dark' : 'light')
}
