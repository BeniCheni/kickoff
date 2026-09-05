import { StrictMode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from '../../src/App'
import { edt, primeClock } from './rig'

const fault = vi.hoisted(() => ({ target: '', lens: '' }))
vi.mock('../../src/components/FixturesPage', () => ({ FixturesPage: ({ lens }: { lens: string }) => {
  if (fault.target === 'page' && fault.lens === lens) throw new Error('deliberate page failure')
  return <p>Healthy fixtures</p>
} }))
vi.mock('../../src/components/TablePage', () => ({ TablePage: () => <p>Healthy table</p> }))
vi.mock('../../src/components/TickerStrip', () => ({ TickerStrip: () => {
  if (fault.target === 'ticker') throw new Error('deliberate ticker failure')
  return null
} }))
vi.mock('../../src/components/StalenessBanner', () => ({ StalenessBanner: () => {
  if (fault.target === 'banner') throw new Error('deliberate banner failure')
  return null
} }))

let release: (() => void) | undefined
afterEach(() => { release?.(); fault.target = ''; fault.lens = '' })

describe('App keeps navigation outside the keyed boundary', () => {
  it.each(['ledger', 'poster', 'broadcast'].flatMap((lens) => ['light', 'dark'].map((theme) => ({ lens, theme }))))('contains a page throw in $lens / $theme and recovers by navigation', ({ lens, theme }) => {
    release = primeClock(edt('2026-09-05T12:00:00'))
    window.localStorage.setItem('kickoff-theme', theme)
    window.localStorage.setItem('kickoff-theme-broadcast', theme)
    window.history.replaceState(null, '', `/kickoff/?lens=${lens}&date=2026-10-07#keep`)
    fault.target = 'page'; fault.lens = lens
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      render(<StrictMode><App /></StrictMode>)
      expect(screen.getByRole('alert').textContent).toContain('This view couldn’t load.')
      expect(screen.getByText('Kickoff')).toBeTruthy()
      expect(document.documentElement.dataset.theme).toBe(theme)
      expect(screen.getByRole('link', { name: 'Reset view' }).getAttribute('href')).toBe('/kickoff/')
      expect(errors.mock.calls.flat().some((v) => String(v).includes('deliberate page failure'))).toBe(true)
      fireEvent.click(screen.getByRole('button', { name: 'Table' }))
      expect(screen.getByText('Healthy table')).toBeTruthy()
      expect(screen.queryByRole('alert')).toBeNull()
      fireEvent.click(screen.getByRole('button', { name: 'Fixtures' }))
      expect(screen.getByRole('alert')).toBeTruthy()
      fireEvent.click(screen.getByRole('radio', { name: lens === 'ledger' ? 'Poster' : 'Ledger' }))
      expect(screen.getByText('Healthy fixtures')).toBeTruthy()
      expect(screen.queryByRole('alert')).toBeNull()
    } finally { errors.mockRestore() }
  })

  it.each(['ticker', 'banner'])('also contains a %s throw beneath the seam', (target) => {
    release = primeClock(edt('2026-09-05T12:00:00'))
    window.history.replaceState(null, '', '/?lens=broadcast')
    fault.target = target
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      render(<App />)
      expect(screen.getByRole('alert')).toBeTruthy()
      expect(screen.getByRole('button', { name: 'Table' })).toBeTruthy()
      expect(errors.mock.calls.flat().some((v) => String(v).includes(`deliberate ${target} failure`))).toBe(true)
    } finally { errors.mockRestore() }
  })
})
