import { afterEach, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { FixturesPage } from '../../src/components/FixturesPage'
import { COMPETITION_KEYS } from '../../src/lib/competitions'
import { META } from '../../src/lib/fixtures'
import { primeClock } from './rig'

let release: (() => void) | undefined
afterEach(() => release?.())

it.each(['ledger', 'poster'] as const)('%s filters expose the action and toggle states', lens => {
  release = primeClock(new Date(META.lastSyncAt))
  render(<FixturesPage lens={lens} today={META.window.from} />)
  const previous = screen.getByRole<HTMLButtonElement>('button', { name: 'Previous' })
  expect(previous.disabled).toBe(true)
  expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Next' }).disabled).toBe(false)
  const filters = screen.getByRole('button', { name: 'Filters, 14 of 14 competitions shown' })
  expect(filters.getAttribute('aria-expanded')).toBe('false')
  fireEvent.click(filters)
  expect(filters.getAttribute('aria-expanded')).toBe('true')
  const panel = within(document.getElementById(filters.getAttribute('aria-controls')!)!)
  const showAll = panel.getByRole<HTMLButtonElement>('button', { name: 'Show all' })
  expect(showAll.disabled).toBe(true)
  expect(panel.getAllByRole('button', { pressed: true })).toHaveLength(COMPETITION_KEYS.length)
  const pl = panel.getByRole('button', { name: 'Premier League', pressed: true })
  fireEvent.click(pl)
  expect(panel.getByRole('button', { name: 'Premier League', pressed: false })).toBe(pl)
  expect(pl.querySelector('i')!.style.backgroundColor).toBe('')
  expect(showAll.disabled).toBe(false)
  fireEvent.click(panel.getByRole('button', { name: 'Show all Big 5 Leagues' }))
  const hide = panel.getByRole('button', { name: 'Hide all Big 5 Leagues' })
  expect(hide.hasAttribute('aria-pressed')).toBe(false)
  for (const group of ['Big 5 Leagues', 'European Cups', 'Domestic Supercups']) {
    fireEvent.click(panel.getByRole('button', { name: `Hide all ${group}` }))
  }
  expect(screen.getByRole('button', { name: 'Filters, 0 of 14 competitions shown' })).toBe(filters)
  fireEvent.click(showAll)
  expect(showAll.disabled).toBe(true)
  fireEvent.click(filters)
  expect(screen.queryByRole('button', { name: 'Premier League' })).toBeNull()
})

it('stops at the last week in the snapshot', () => {
  release = primeClock(new Date(META.lastSyncAt))
  render(<FixturesPage lens="ledger" today={META.window.to} />)
  expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Next' }).disabled).toBe(true)
  expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Previous' }).disabled).toBe(false)
})

