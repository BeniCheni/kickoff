import type { Lens } from './lens'
import { parseLens } from './lens'

export type Theme = 'light' | 'dark'

/** Total decoder for localStorage values: anything unexpected reads as "no stored choice". */
export function parseTheme(raw: string | null): Theme | null {
  return raw === 'light' || raw === 'dark' ? raw : null
}

/** Both lenses share the same stored preference. */
export function themeStorageKey(): 'kickoff-theme' {
  return 'kickoff-theme'
}

/** Stored preference wins; otherwise follow the operating system. */
export function resolveTheme(storedTheme: Theme | null, prefersDark: boolean): Theme {
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
 * The one theme and lens decision. Callers pass what they read; this function does not
 * touch storage, matchMedia or the document.
 */
export function decideThemeAndLens(
  lensRaw: string | null,
  storedTheme: Theme | null,
  prefersDark: boolean,
): { lens: Lens; theme: Theme } {
  const lens = parseLens(lensRaw)
  return {
    lens,
    theme: resolveTheme(storedTheme, prefersDark),
  }
}

/** The same live preference supplies both React and the pre-paint bootstrap. */
export function resolveThemeFromEnvironment(): Theme {
  return resolveTheme(
    readStoredTheme(themeStorageKey()),
    env.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false,
  )
}

/** The bootstrap's read of the URL plus the live environment. */
export function readBootTheme(search: string): { lens: Lens; theme: Theme } {
  return decideThemeAndLens(
    new URLSearchParams(search).get('lens'),
    readStoredTheme(themeStorageKey()),
    env.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false,
  )
}
