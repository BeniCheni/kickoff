import { afterEach, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { FilterBar } from '../../src/components/FilterBar'
import { FixturesPage } from '../../src/components/FixturesPage'
import { COMPETITION_KEYS } from '../../src/lib/competitions'
import { META } from '../../src/lib/fixtures'
import { primeClock } from './rig'

let release: (() => void) | undefined
afterEach(() => release?.())

function expectUnavailable(button: HTMLButtonElement) {
  expect(button.disabled).toBe(false)
  expect(button.getAttribute('aria-disabled')).toBe('true')
  button.focus()
  const url = location.href
  const state = document.querySelector('.week-range')?.textContent
  const filters = document.querySelector('.week-filters')?.getAttribute('aria-label')
  const stillUnavailable = () => {
    expect(document.activeElement).toBe(button)
    expect(location.href).toBe(url)
    expect(document.querySelector('.week-range')?.textContent).toBe(state)
    expect(document.querySelector('.week-filters')?.getAttribute('aria-label')).toBe(filters)
  }
  fireEvent.click(button, { detail: 1 })
  stillUnavailable()
  const enter = { key: 'Enter', code: 'Enter' }
  // jsdom dispatches key events but omits the native button's keyboard-generated click.
  if (fireEvent.keyDown(button, enter)) fireEvent.click(button, { detail: 0 })
  fireEvent.keyUp(button, enter)
  stillUnavailable()
}

it.each(['ledger', 'poster'] as const)('%s filters expose the action and toggle states', lens => {
  release = primeClock(new Date(META.lastSyncAt))
  render(<FixturesPage lens={lens} today={META.window.from} />)
  const previous = screen.getByRole<HTMLButtonElement>('button', { name: 'Previous' })
  expectUnavailable(previous)
  expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Next' }).disabled).toBe(false)
  expect(screen.getByRole('button', { name: 'Next' }).getAttribute('aria-disabled')).toBe('false')
  const filters = screen.getByRole('button', { name: 'Filters, 14 of 14 competitions shown' })
  expect(filters.getAttribute('aria-expanded')).toBe('false')
  const disclosure = document.getElementById(filters.getAttribute('aria-controls')!)!
  expect(disclosure.hasAttribute('inert')).toBe(true)
  fireEvent.click(filters)
  expect(disclosure.hasAttribute('inert')).toBe(false)
  expect(filters.getAttribute('aria-expanded')).toBe('true')
  const panel = within(document.getElementById(filters.getAttribute('aria-controls')!)!)
  const showAll = panel.getByRole<HTMLButtonElement>('button', { name: 'Show all' })
  expectUnavailable(showAll)
  expect(panel.getAllByRole('button', { pressed: true })).toHaveLength(COMPETITION_KEYS.length)
  const pl = panel.getByRole('button', { name: 'Premier League', pressed: true })
  fireEvent.click(pl)
  expect(panel.getByRole('button', { name: 'Premier League', pressed: false })).toBe(pl)
  expect(pl.querySelector('i')!.style.backgroundColor).toBe('')
  expect(showAll.disabled).toBe(false)
  expect(showAll.getAttribute('aria-disabled')).toBe('false')
  fireEvent.click(panel.getByRole('button', { name: 'Show all Big 5 Leagues' }))
  const hide = panel.getByRole('button', { name: 'Hide all Big 5 Leagues' })
  expect(hide.hasAttribute('aria-pressed')).toBe(false)
  for (const group of ['Big 5 Leagues', 'European Cups', 'Domestic Supercups']) {
    fireEvent.click(panel.getByRole('button', { name: `Hide all ${group}` }))
  }
  expect(screen.getByRole('button', { name: 'Filters, 0 of 14 competitions shown' })).toBe(filters)
  fireEvent.click(showAll)
  expectUnavailable(showAll)
  fireEvent.click(filters)
  expect(disclosure.hasAttribute('inert')).toBe(true)
  expect(screen.queryByRole('button', { name: 'Premier League' })).toBeNull()
})

it('stops at the last week in the snapshot', () => {
  release = primeClock(new Date(META.lastSyncAt))
  render(<FixturesPage lens="ledger" today={META.window.to} />)
  expectUnavailable(screen.getByRole<HTMLButtonElement>('button', { name: 'Next' }))
  expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Previous' }).disabled).toBe(false)
  expect(screen.getByRole('button', { name: 'Previous' }).getAttribute('aria-disabled')).toBe('false')
})

it('the unavailable Show all never calls the action, even if setting all again would look identical', () => {
  const onShowAll = vi.fn()
  render(<FilterBar lens="ledger" open active={new Set(COMPETITION_KEYS)}
    onShowAll={onShowAll} onSetGroup={vi.fn()} onToggle={vi.fn()} />)
  expectUnavailable(screen.getByRole<HTMLButtonElement>('button', { name: 'Show all' }))
  expect(onShowAll).not.toHaveBeenCalled()
})
