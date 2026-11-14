import { describe, expect, it } from 'vitest'
import { parseTheme, readStoredTheme, resolveTheme, themeStorageKey, writeStoredTheme } from '../src/lib/theme'

describe('shared theme preference', () => {
  it('a stored choice wins over either OS preference', () => {
    for (const dark of [false, true]) {
      expect(resolveTheme('light', dark)).toBe('light')
      expect(resolveTheme('dark', dark)).toBe('dark')
    }
  })
  it('follows the system when no choice is stored', () => {
    expect(resolveTheme(null, true)).toBe('dark')
    expect(resolveTheme(null, false)).toBe('light')
  })
  it('uses one storage key', () => {
    expect(themeStorageKey()).toBe('kickoff-theme')
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
  })

  it('writes silently give up when storage is unavailable', () => {
    expect(() => writeStoredTheme('kickoff-theme', 'dark')).not.toThrow()
  })
})
