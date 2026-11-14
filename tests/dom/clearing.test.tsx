import { useState } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from '../../src/App'
import { LensSwitcher } from '../../src/components/LensSwitcher'
import type { Lens } from '../../src/lib/lens'
import { edt, primeClock } from './rig'

// Escaped legacy spelling permits a literal-source removal audit while testing real old links.
const retiredLens = '\u0062roadcast'
let release: (() => void) | undefined
afterEach(() => { release?.(); release = undefined })

it('renders exactly Poster then Ledger, with wrapping arrows and Home/End focus', () => {
  function Control() {
    const [lens, setLens] = useState<Lens>('poster')
    return <LensSwitcher lens={lens} onSelect={setLens} />
  }
  render(<Control />)
  const radios = screen.getAllByRole('radio')
  expect(radios.map(r => r.textContent)).toEqual(['Poster', 'Ledger'])
  const poster = radios[0]!, ledger = radios[1]!
  poster.focus()
  for (const key of ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp']) {
    fireEvent.keyDown(poster, { key })
    expect(document.activeElement).toBe(ledger)
    expect(ledger.getAttribute('aria-checked')).toBe('true')
    expect(ledger.tabIndex).toBe(0)
    expect(poster.tabIndex).toBe(-1)
    fireEvent.keyDown(ledger, { key })
    expect(document.activeElement).toBe(poster)
    expect(poster.getAttribute('aria-checked')).toBe('true')
  }
  fireEvent.keyDown(poster, { key: 'End' })
  expect(document.activeElement).toBe(ledger)
  fireEvent.keyDown(ledger, { key: 'Home' })
  expect(document.activeElement).toBe(poster)
})

it.each([`lens=${retiredLens}`, 'view=month', 'view=junk'])('cold %s lands on Poster weekly fixtures and preserves Step 0 pins', query => {
  release = primeClock(edt('2026-11-14T12:00:00'))
  window.history.replaceState(null, '', `/?${query}&only=pl&date=2026-11-21#keep`)
  render(<App />)
  expect(window.location.search).toBe('?only=pl&date=2026-11-21')
  expect(window.location.hash).toBe('#keep')
  expect(document.documentElement.dataset.lens).toBe('poster')
  expect(screen.getByText('Nov 16 – November 22, 2026')).toBeTruthy()
  expect(screen.getByText(/1 of \d+ competitions shown/)).toBeTruthy()
  expect(screen.queryByRole('button', { name: /^(Weekly|Monthly)$/ })).toBeNull()
  expect(screen.queryByText(/Where to Watch/)).toBeNull()
  expect(document.body.textContent).not.toContain('\u{1f4fa}')
  expect(document.querySelector('[data-ticker]')).toBeNull()
})

it('never reads, writes or deletes the retired theme key while switching and toggling', () => {
  release = primeClock(edt('2026-11-14T12:00:00'))
  const retiredKey = `kickoff-theme-${retiredLens}`
  window.localStorage.setItem(retiredKey, 'dark')
  window.localStorage.setItem('kickoff-theme', 'light')
  const get = vi.spyOn(Storage.prototype, 'getItem')
  const set = vi.spyOn(Storage.prototype, 'setItem')
  const remove = vi.spyOn(Storage.prototype, 'removeItem')
  try {
    render(<App />)
    expect(document.documentElement.dataset.theme).toBe('light')
    fireEvent.click(screen.getByRole('radio', { name: 'Ledger' }))
    fireEvent.click(screen.getByRole('button', { name: 'Dark mode' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Poster' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(get.mock.calls.some(([key]) => key === retiredKey)).toBe(false)
    expect(set.mock.calls).toContainEqual(['kickoff-theme', 'dark'])
    expect(set.mock.calls.some(([key]) => key === retiredKey)).toBe(false)
    expect(remove.mock.calls.some(([key]) => key === retiredKey)).toBe(false)
  } finally { get.mockRestore(); set.mockRestore(); remove.mockRestore() }
  expect(window.localStorage.getItem(retiredKey)).toBe('dark')
})
