import { StrictMode } from 'react'
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
  it('follows OS changes in both directions and cleans up under StrictMode', () => {
    const media = installMatchMedia()
    release = primeClock(edt('2026-09-05T12:00:00'))
    const { unmount } = render(<StrictMode><App /></StrictMode>)
    expect(media.listenerCount()).toBe(1)
    media.setDark(true)
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(screen.getByRole('button', { name: 'Light mode' })).toBeTruthy()
    media.setDark(false)
    expect(document.documentElement.dataset.theme).toBe('light')
    fireEvent.click(screen.getByRole('radio', { name: 'Broadcast' }))
    media.setDark(true)
    media.setDark(false)
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(media.listenerCount()).toBe(1)
    fireEvent.click(screen.getByRole('radio', { name: 'Ledger' }))
    expect(document.documentElement.dataset.theme).toBe('light')
    unmount()
    expect(media.listenerCount()).toBe(0)
  })

  it('OS changes respect each lens family’s stored choice', () => {
    const media = installMatchMedia()
    window.localStorage.setItem('kickoff-theme', 'light')
    window.localStorage.setItem('kickoff-theme-broadcast', 'light')
    release = primeClock(edt('2026-09-05T12:00:00'))
    render(<App />)
    media.setDark(true)
    expect(document.documentElement.dataset.theme).toBe('light')
    fireEvent.click(screen.getByRole('radio', { name: 'Broadcast' }))
    media.setDark(false)
    media.setDark(true)
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('blocked storage does not let an OS change undo an explicit in-session choice', () => {
    const media = installMatchMedia({ dark: true })
    release = primeClock(edt('2026-09-05T12:00:00'))
    const restore = throwingStorage()
    try {
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: 'Light mode' }))
      media.setDark(false)
      media.setDark(true)
      expect(document.documentElement.dataset.theme).toBe('light')
      fireEvent.click(screen.getByRole('radio', { name: 'Broadcast' }))
      expect(document.documentElement.dataset.theme).toBe('dark')
      fireEvent.click(screen.getByRole('radio', { name: 'Poster' }))
      expect(document.documentElement.dataset.theme).toBe('light')
    } finally { restore() }
  })
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
