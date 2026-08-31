import { describe, expect, it } from 'vitest'
import { parseTheme, resolveTheme, themeStorageKey } from '../src/lib/theme'

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
