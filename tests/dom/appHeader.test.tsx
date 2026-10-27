import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../../src/App'
import { AppHeader } from '../../src/components/AppHeader'
import { edt, installMatchMedia, primeClock } from './rig'

describe('the header is one module', () => {
  it('Vite’s header outerHTML is the shared header in both themes', () => {
    installMatchMedia({ dark: false })
    const release = primeClock(edt('2026-09-05T12:00:00'))
    try {
      render(<App />)
      const light = document.querySelector('header')!.outerHTML
      const lightSlot = render(
        <AppHeader version="0.5.3" themeLabel="Dark mode" onToggleTheme={() => {}} />,
      )
      expect(lightSlot.container.querySelector('header')!.outerHTML).toBe(light)
      lightSlot.unmount()

      fireEvent.click(screen.getByRole('button', { name: 'Dark mode' }))
      const dark = document.querySelector('header')!.outerHTML
      const darkSlot = render(
        <AppHeader version="0.5.3" themeLabel="Light mode" onToggleTheme={() => {}} />,
      )
      expect(darkSlot.container.querySelector('header')!.outerHTML).toBe(dark)
      expect(dark).toContain('>Light mode</button>')
      expect(light).toContain('>Dark mode</button>')
    } finally {
      release()
    }
  })
})
