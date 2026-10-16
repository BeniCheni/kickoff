import { useEffect, useRef, useState } from 'react'
import type { Lens } from './lens'
import { readStoredTheme, resolveThemeFromEnvironment, themeStorageKey, writeStoredTheme, type Theme } from './theme'

/**
 * Lens and theme for the persistent shell. Vite and the unreleased Next app both
 * call this. The initializer reads the boot script's root attribute in the browser.
 * A server render has no document, so it starts at light and the client effect
 * applies the same decision before the user can toggle.
 */
export function useThemeController(lens: Lens) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === 'undefined') return 'light'
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  })

  const prevLens = useRef<Lens | null>(null)
  const fadeTimer = useRef<number | undefined>(undefined)
  // Explicit choices remain authoritative in this session even if storage is blocked.
  const sessionThemes = useRef<Partial<Record<ReturnType<typeof themeStorageKey>, Theme>>>({})

  // The single lens → DOM sync point. Covers switcher clicks and Back/Forward alike
  // (useUrlState's popstate handler re-renders us). Re-resolving the theme here is what
  // makes Broadcast dark-by-default on entry and restores the prior choice on exit.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.lens = lens
    const next = sessionThemes.current[themeStorageKey(lens)] ?? resolveThemeFromEnvironment(lens)
    root.dataset.theme = next
    setTheme(next)
    if (
      prevLens.current !== null &&
      prevLens.current !== lens &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      // Transient cross-fade: token-driven colours transition for 220ms, then the
      // class comes off so no global transitions are left permanently enabled.
      root.classList.add('lens-switching')
      window.clearTimeout(fadeTimer.current)
      fadeTimer.current = window.setTimeout(() => root.classList.remove('lens-switching'), 240)
    }
    prevLens.current = lens
    return () => {
      // Drop the class too — a cleared timer must not strand `.lens-switching` (and its
      // document-wide transitions) on <html>.
      window.clearTimeout(fadeTimer.current)
      root.classList.remove('lens-switching')
    }
  }, [lens])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const key = themeStorageKey(lens)
    const onChange = () => {
      if (sessionThemes.current[key] || readStoredTheme(key)) return
      const next = resolveThemeFromEnvironment(lens)
      document.documentElement.dataset.theme = next
      setTheme(next)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [lens])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    sessionThemes.current[themeStorageKey(lens)] = next
    writeStoredTheme(themeStorageKey(lens), next)
    setTheme(next)
  }

  return { theme, toggle }
}
