import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { installMatchMedia } from './rig'

/**
 * Runs before every DOM test file (vite.config.ts → the `dom` project's `setupFiles`).
 *
 * jsdom ships no `matchMedia` at all, and App's lens effect calls it on every lens change,
 * so a default stub (nothing matches: light scheme, motion allowed) is installed here; a test
 * that wants dark or reduced motion calls `installMatchMedia` itself. Testing Library's
 * automatic unmount only fires when `afterEach` is a global, and this suite imports vitest
 * explicitly, so `cleanup` is wired by hand — a leaked tree would keep the app's clock
 * subscribed across tests and make every subscriber-count assertion a lie.
 */
installMatchMedia()

afterEach(() => {
  cleanup()
  window.history.replaceState(null, '', '/')
  window.localStorage.clear()
  delete document.documentElement.dataset.lens
  delete document.documentElement.dataset.theme
  document.documentElement.className = ''
  installMatchMedia()
})
