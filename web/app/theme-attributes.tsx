'use client'

import { useLayoutEffect } from 'react'
import { readBootTheme } from '../../src/lib/theme'

/** Re-applies the bootstrap decision before paint if hydration resets the root
 *  attributes. The decision is readBootTheme, the same function the head script runs. */
export function ThemeAttributes() {
  useLayoutEffect(() => {
    const apply = () => {
      const decision = readBootTheme(window.location.search)
      document.documentElement.dataset.lens = decision.lens
      document.documentElement.dataset.theme = decision.theme
    }
    apply()
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [])
  return null
}
