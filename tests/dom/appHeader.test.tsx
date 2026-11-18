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
      for (const line of document.querySelectorAll('[data-provenance]')) {
        expect(line.getAttribute('data-voice')).toBe('amber')
      }
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
      expect(dark).toContain('>Light mode</span>')
      expect(light).toContain('>Dark mode</span>')
    } finally {
      release()
    }
  })

  it('every foot repeats the count and the stamp', () => {
    installMatchMedia({ dark: false })
    const release = primeClock(edt('2026-09-05T12:00:00'))
    try {
      render(<App />)
      const footText = () => (document.querySelector('footer')?.textContent ?? '').toLowerCase()
      expect(footText()).toContain(`${META.total} fixtures`)
      expect(footText()).toContain(SYNC_STAMP.toLowerCase())
      expect(document.querySelector('.page-measure')?.getAttribute('data-measure')).toBe('poster')
      expect(footText()).toContain('fixtures from the snapshot synced')
      fireEvent.click(screen.getByRole('radio', { name: 'Ledger' }))
      expect(document.querySelector('.page-measure')?.getAttribute('data-measure')).toBe('poster')
      expect(footText()).toContain('always verify in the book before staking.')
      expect(footText()).not.toContain('fixtures from the snapshot synced')
      fireEvent.click(screen.getByRole('button', { name: 'Table' }))
      expect(footText()).toContain(`${META.total} fixtures`)
      expect(footText()).toContain(SYNC_STAMP.toLowerCase())
      expect(document.querySelector('footer')?.getAttribute('data-stock')).toBe('black')
      expect(document.querySelector('.page-measure')?.getAttribute('data-measure')).toBe('register')
      expect(footText()).toContain('never recomputed locally')
      fireEvent.click(screen.getByRole('button', { name: 'Moments' }))
      expect(document.querySelector('footer')).toBeNull()
      expect(document.querySelector('.page-measure')?.getAttribute('data-measure')).toBe('moments')
    } finally {
      release()
    }
  })
})
