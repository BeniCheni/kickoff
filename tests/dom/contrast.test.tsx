import { afterEach, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { META } from '../../src/lib/fixtures'
import { TABLE_LEAGUES } from '../../src/lib/competitions'
import { StalenessBanner } from '../../src/components/StalenessBanner'
import { TablePage } from '../../src/components/TablePage'
import { primeClock } from './rig'

let release: (() => void) | undefined
afterEach(() => { cleanup(); release?.(); release = undefined })

// Class/inheritance inventory, not a jsdom contrast measurement. The node test locks the
// three source sites; these mounts exercise both conditional Table callouts too.
function checkTint(container: HTMLElement, count: number) {
  const grounds = container.querySelectorAll('.bg-floodlight-bg')
  expect(grounds).toHaveLength(count)
  for (const ground of grounds) {
    expect(ground.closest('[class*="text-ink-muted"]')).toBeNull()
    expect(ground.querySelector('[class*="text-ink-muted"]')).toBeNull()
  }
}
it('the 24h banner never renders muted text on its floodlight tint', () => {
  release = primeClock(new Date(Date.parse(META.lastSyncAt) + 25 * 60 * 60 * 1000))
  const { container } = render(<StalenessBanner />)
  checkTint(container, 1)
})
it.each(TABLE_LEAGUES)('%s callouts and the sorted banner use readable roles on the tint', (league) => {
  window.history.replaceState(null, '', `/?league=${league}`)
  release = primeClock(new Date(META.lastSyncAt))
  const { container } = render(<TablePage />)
  checkTint(container, 1)
  fireEvent.click(screen.getByRole('button', { name: 'PPG' }))
  checkTint(container, 2)
  expect(screen.getByText(/Sorted by/)).toBeTruthy()
})
