import { describe, expect, it } from 'vitest'
import { parseTheme, readStoredTheme, resolveTheme, themeStorageKey, writeStoredTheme } from '../src/lib/theme'

describe('resolveTheme — the Broadcast dark-default decision', () => {
  it('entering Broadcast with no stored Broadcast choice defaults to dark', () => {
    expect(resolveTheme('broadcast', null, null, false)).toBe('dark')
    // ...even when the user's ordinary choice is light — Broadcast has its own memory.
    expect(resolveTheme('broadcast', 'light', null, false)).toBe('dark')
  })

  it('entering Broadcast after toggling it to light stays light (choice remembered)', () => {
    expect(resolveTheme('broadcast', null, 'light', true)).toBe('light')
    expect(resolveTheme('broadcast', 'dark', 'light', true)).toBe('light')
  })

  it('leaving Broadcast restores the non-Broadcast stored choice', () => {
    expect(resolveTheme('ledger', 'light', 'dark', true)).toBe('light')
    expect(resolveTheme('poster', 'dark', 'light', false)).toBe('dark')
  })

  it('with nothing stored, non-Broadcast lenses follow the system preference', () => {
    expect(resolveTheme('ledger', null, null, true)).toBe('dark')
    expect(resolveTheme('ledger', null, null, false)).toBe('light')
    expect(resolveTheme('poster', null, 'dark', false)).toBe('light')
  })
})

describe('theme storage', () => {
  it('Broadcast writes its own key; the other lenses share the original', () => {
    expect(themeStorageKey('broadcast')).toBe('kickoff-theme-broadcast')
    expect(themeStorageKey('ledger')).toBe('kickoff-theme')
    expect(themeStorageKey('poster')).toBe('kickoff-theme')
  })

  it('parseTheme treats junk as "no stored choice"', () => {
    expect(parseTheme(null)).toBeNull()
    expect(parseTheme('')).toBeNull()
    expect(parseTheme('DARK')).toBeNull()
    expect(parseTheme('light')).toBe('light')
    expect(parseTheme('dark')).toBe('dark')
  })
})

describe('storage guards', () => {
  it('reads as "no stored choice" when localStorage itself throws — a blank page is never the fallback', () => {
    // The node test env has no localStorage at all, so the access throws; the guard
    // must swallow it exactly as it swallows Safari private mode.
    expect(readStoredTheme('kickoff-theme')).toBeNull()
    expect(readStoredTheme('kickoff-theme-broadcast')).toBeNull()
  })

  it('writes silently give up when storage is unavailable', () => {
    expect(() => writeStoredTheme('kickoff-theme', 'dark')).not.toThrow()
  })
})
