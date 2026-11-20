'use client'

import { useLayoutEffect } from 'react'
import { readBootMotion } from '../../src/lib/motion'
import { readBootTheme } from '../../src/lib/theme'

/** Re-applies the bootstrap decision before paint if hydration resets the root
 *  attributes. Ongoing lens and system changes belong to the shell. */
export function ThemeAttributes() {
  useLayoutEffect(() => {
    const decision = readBootTheme(window.location.search)
    document.documentElement.dataset.lens = decision.lens
    document.documentElement.dataset.theme = decision.theme
    document.documentElement.dataset.motion = readBootMotion()
  }, [])
  return null
}
