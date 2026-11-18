import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../../src/App'
import { ImprintBand } from '../../src/components/ImprintBand'
import { META, SYNC_STAMP } from '../../src/lib/fixtures'
import { edt, installMatchMedia, primeClock } from './rig'

function band(themeLabel: string) {
  return (
    <ImprintBand
      version={__APP_VERSION__}
      tab="fixtures"
      lens="poster"
      onSelectTab={() => {}}
      onSelectLens={() => {}}
      onToggleTheme={() => {}}
      themeLabel={themeLabel}
      onToggleMotion={() => {}}
      motionLabel="Stop motion"
    />
  )
}

describe('the band is one module', () => {
  it('prints the fixture count and the sync stamp', () => {
    installMatchMedia({ dark: false })
    const release = primeClock(edt('2026-09-05T12:00:00'))
    try {
      render(<App />)
      const text = (document.querySelector('header')!.textContent ?? '').toLowerCase()
      expect(text).toContain(`${META.total} fixtures`)
      expect(text).toContain(SYNC_STAMP.toLowerCase())
      expect(document.querySelector('header')!.dataset.stock).toBe('black')
      fireEvent.click(screen.getByRole('radio', { name: 'Ledger' }))
      expect(document.querySelector('header')!.dataset.stock).toBe('paper')
      expect(document.querySelector('header')!.dataset.ground).toBe('typescript')
      fireEvent.click(screen.getByRole('button', { name: 'Table' }))
      expect(document.querySelector('header')!.dataset.stock).toBe('black')
    } finally {
      release()
    }
  })

  it('Vite’s band outerHTML is the shared band in both themes', () => {
    installMatchMedia({ dark: false })
    const release = primeClock(edt('2026-09-05T12:00:00'))
    try {
      render(<App />)
      const light = document.querySelector('header')!.outerHTML
      const lightSlot = render(band('Dark mode'))
      expect(lightSlot.container.querySelector('header')!.outerHTML).toBe(light)
      lightSlot.unmount()

      fireEvent.click(screen.getByRole('button', { name: 'Dark mode' }))
      const dark = document.querySelector('header')!.outerHTML
      const darkSlot = render(band('Light mode'))
      expect(darkSlot.container.querySelector('header')!.outerHTML).toBe(dark)
      expect(dark).toContain('>Light mode</button>')
      expect(light).toContain('>Dark mode</button>')
    } finally {
      release()
    }
  })
})
