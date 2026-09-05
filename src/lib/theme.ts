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
 * The shared stored/default theme decision for the generated bootstrap and App.
 * App also retains explicit session choices when storage is unavailable.
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

type ThemeKey = ReturnType<typeof themeStorageKey>

// This module is imported by the node test suite (no DOM lib), so browser globals are
// reached through globalThis and typed structurally rather than via lib.dom.
type ThemeEnvironment = {
  localStorage?: { getItem(k: string): string | null; setItem(k: string, v: string): void }
  matchMedia?: (query: string) => { matches: boolean }
}
const env = globalThis as ThemeEnvironment

/**
 * localStorage can throw on mere access (Safari private mode, storage-blocked embeds). A
 * theme preference is never worth a blank page: reads fall back to "no stored choice",
 * writes fail silently — a lost preference beats a crashed toggle.
 */
export function readStoredTheme(key: ThemeKey): Theme | null {
  try {
    return parseTheme(env.localStorage?.getItem(key) ?? null)
  } catch {
    return null
  }
}

export function writeStoredTheme(key: ThemeKey, theme: Theme): void {
  try {
    env.localStorage?.setItem(key, theme)
  } catch {
    // storage is unavailable; the in-page theme still applied
  }
}

/**
 * resolveTheme fed from the live environment — the single call both the inline
 * bootstrap and App's lens effect use, with the storage keys coming from
 * themeStorageKey so no caller ever spells a key literal again.
 */
export function resolveThemeFromEnvironment(lens: Lens): Theme {
  return resolveTheme(
    lens,
    // The shared non-Broadcast key (Ledger's and Poster's alike), not "Ledger's key" — spelled
    // through a lens so no caller spells the literal; the key name itself is never renamed,
    // that would drop every existing reader's stored theme.
    readStoredTheme(themeStorageKey('ledger')),
    readStoredTheme(themeStorageKey('broadcast')),
    env.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false,
  )
}
