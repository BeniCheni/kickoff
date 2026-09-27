import type { Lens } from '../../src/lib/lens'
import { themeStorageKey } from '../../src/lib/theme'
import type { Theme } from '../../src/lib/theme'

/**
 * Runs before any page script, including the theme bootstrap in `index.html`.
 * Clears storage first so a previous cell in the same Chrome profile cannot leak,
 * then writes only the key a visitor's toggle would write for this lens.
 * Broadcast's key is `kickoff-theme-broadcast`; every other lens shares `kickoff-theme`.
 * Limited to the top window so a child frame cannot wipe the choice just written.
 */
export function themeInitScript(lens: Lens, theme: Theme): string {
  const key = JSON.stringify(themeStorageKey(lens))
  const value = JSON.stringify(theme)
  return `try{if(window===window.top){localStorage.clear();localStorage.setItem(${key},${value});}}catch(e){}`
}
