import { afterEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from '../../src/App'
import { readStoredTheme, resolveThemeFromEnvironment, writeStoredTheme } from '../../src/lib/theme'
import { edt, installMatchMedia, primeClock, throwingStorage } from './rig'

/**
 * Affordance 4 — `matchMedia` and a `localStorage` that throws. The node suite proves the
 * guards when storage is *absent*; only a DOM can prove them when storage is present and
 * hostile, and only a DOM has a `prefers-color-scheme` to read.
 */

let release: (() => void) | null = null
afterEach(() => {
  release?.()
  release = null
})

describe('theme.ts in a browser-shaped environment (affordance 4)', () => {
  it('follows prefers-color-scheme when nothing is stored; Broadcast is dark regardless', () => {
    installMatchMedia({ dark: true })
    expect(resolveThemeFromEnvironment('poster')).toBe('dark')
    expect(resolveThemeFromEnvironment('ledger')).toBe('dark')
    expect(resolveThemeFromEnvironment('broadcast')).toBe('dark')

    installMatchMedia({ dark: false })
    expect(resolveThemeFromEnvironment('poster')).toBe('light')
    expect(resolveThemeFromEnvironment('broadcast')).toBe('dark')
  })

  it('a stored choice beats the system preference, and Broadcast reads only its own key', () => {
    installMatchMedia({ dark: true })
    window.localStorage.setItem('kickoff-theme', 'light')
    expect(resolveThemeFromEnvironment('poster')).toBe('light')
    expect(resolveThemeFromEnvironment('broadcast')).toBe('dark')
    window.localStorage.setItem('kickoff-theme-broadcast', 'light')
    expect(resolveThemeFromEnvironment('broadcast')).toBe('light')
  })

  it('a localStorage that throws on access reads as "no stored choice"; writes give up silently', () => {
    installMatchMedia({ dark: true })
    const restore = throwingStorage()
    try {
      expect(() => window.localStorage.getItem('kickoff-theme')).toThrow()
      expect(readStoredTheme('kickoff-theme')).toBeNull()
      expect(() => writeStoredTheme('kickoff-theme', 'dark')).not.toThrow()
      expect(resolveThemeFromEnvironment('poster')).toBe('dark')
    } finally {
      restore()
    }
  })

  it('App boots and toggles under a throwing storage — the theme applies in-page, nothing crashes', () => {
    installMatchMedia({ dark: true })
    release = primeClock(edt('2026-09-05T12:00:00'))
    const restore = throwingStorage()
    try {
      render(<App />)
      expect(document.documentElement.dataset.theme).toBe('dark')
      fireEvent.click(screen.getByRole('button', { name: 'Light mode' }))
      expect(document.documentElement.dataset.theme).toBe('light')
      expect(screen.getByRole('button', { name: 'Dark mode' })).toBeTruthy()
    } finally {
      restore()
    }
  })
})
