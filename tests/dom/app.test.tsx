import { StrictMode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import App from '../../src/App'
import { clock } from '../../src/lib/clock'
import { edt, installMatchMedia, popTo, primeClock, tick } from './rig'

/**
 * Affordance 3 — StrictMode's double effect and double subscribe. `main.tsx` renders App
 * under StrictMode, so this is the shape production runs; the train's named test is the
 * lens → theme effect, and the subscriber count is the browser review's "returns to the
 * same number" check (`docs/v0.2.0-proposal.md`, subscriber hygiene) brought indoors.
 */

let release: (() => void) | null = null
afterEach(() => {
  release?.()
  release = null
})

const html = () => document.documentElement

describe('App under StrictMode — the lens → theme effect (affordance 3)', () => {
  it('switching lenses preserves the theme; nothing is left subscribed', () => {
    release = primeClock(edt('2026-09-05T12:00:00'))
    const idle = clock.subscriberCount()
    const { unmount } = render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    expect(html().dataset.lens).toBe('poster')
    expect(html().dataset.theme).toBe('light')
    const onPoster = clock.subscriberCount()
    expect(onPoster).toBeGreaterThan(idle)

    fireEvent.click(screen.getByRole('radio', { name: 'Ledger' }))
    expect(html().dataset.lens).toBe('ledger')
    expect(html().dataset.theme).toBe('light')
    expect(window.location.search).toBe('?lens=ledger')
    expect(screen.getByRole('button', { name: 'Dark mode' })).toBeTruthy()

    fireEvent.click(screen.getByRole('radio', { name: 'Poster' }))
    expect(html().dataset.lens).toBe('poster')
    expect(html().dataset.theme).toBe('light')
    expect(window.location.search).toBe('')
    // Returning to Poster restores the subscriber count under StrictMode.
    expect(clock.subscriberCount()).toBe(onPoster)

    unmount()
    expect(clock.subscriberCount()).toBe(idle)
  })

  it('a toggle is remembered across both lenses under one key', () => {
    release = primeClock(edt('2026-09-05T12:00:00'))
    render(<StrictMode><App /></StrictMode>)
    fireEvent.click(screen.getByRole('radio', { name: 'Ledger' }))
    fireEvent.click(screen.getByRole('button', { name: 'Dark mode' }))
    expect(html().dataset.theme).toBe('dark')
    expect(window.localStorage.getItem('kickoff-theme')).toBe('dark')
    fireEvent.click(screen.getByRole('radio', { name: 'Poster' }))
    expect(html().dataset.theme).toBe('dark')
    fireEvent.click(screen.getByRole('radio', { name: 'Ledger' }))
    expect(html().dataset.theme).toBe('dark')
  })

  it('Back/Forward reaches the same effect: a popstate to ?lens=ledger preserves the theme with no click', () => {
    release = primeClock(edt('2026-09-05T12:00:00'))
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    act(() => popTo('/?lens=ledger'))
    expect(html().dataset.lens).toBe('ledger')
    expect(html().dataset.theme).toBe('light')
    expect(screen.getByRole('radio', { name: 'Ledger' }).getAttribute('aria-checked')).toBe('true')
  })

  it('the 220 ms cross-fade class is transient, and never added under reduced motion', () => {
    release = primeClock(edt('2026-09-05T12:00:00'))
    const { unmount } = render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    fireEvent.click(screen.getByRole('radio', { name: 'Ledger' }))
    expect(html().classList.contains('lens-switching')).toBe(true)
    tick(300)
    expect(html().classList.contains('lens-switching')).toBe(false)
    unmount()

    installMatchMedia({ reducedMotion: true })
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    expect(html().dataset.lens).toBe('ledger')
    fireEvent.click(screen.getByRole('radio', { name: 'Poster' }))
    expect(html().dataset.lens).toBe('poster')
    expect(html().classList.contains('lens-switching')).toBe(false)
  })
})
