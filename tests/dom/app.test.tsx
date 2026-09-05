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
  it('entering Broadcast paints dark on <html>; leaving restores the ordinary theme; nothing is left subscribed', () => {
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

    fireEvent.click(screen.getByRole('radio', { name: 'Broadcast' }))
    expect(html().dataset.lens).toBe('broadcast')
    expect(html().dataset.theme).toBe('dark')
    expect(window.location.search).toBe('?lens=broadcast')
    expect(screen.getByRole('button', { name: 'Light mode' })).toBeTruthy()

    fireEvent.click(screen.getByRole('radio', { name: 'Poster' }))
    expect(html().dataset.lens).toBe('poster')
    expect(html().dataset.theme).toBe('light')
    expect(window.location.search).toBe('')
    // Broadcast mounts the ticker (one more useNow); back on Poster the count must be
    // exactly what it was — StrictMode's double subscribe leaves nothing behind.
    expect(clock.subscriberCount()).toBe(onPoster)

    unmount()
    expect(clock.subscriberCount()).toBe(idle)
  })

  it('a toggle made inside Broadcast is remembered under its own key and is not re-forced to dark', () => {
    release = primeClock(edt('2026-09-05T12:00:00'))
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    fireEvent.click(screen.getByRole('radio', { name: 'Broadcast' }))
    fireEvent.click(screen.getByRole('button', { name: 'Light mode' }))
    expect(html().dataset.theme).toBe('light')
    expect(window.localStorage.getItem('kickoff-theme-broadcast')).toBe('light')
    expect(window.localStorage.getItem('kickoff-theme')).toBeNull()

    fireEvent.click(screen.getByRole('radio', { name: 'Ledger' }))
    expect(html().dataset.theme).toBe('light')
    fireEvent.click(screen.getByRole('radio', { name: 'Broadcast' }))
    expect(html().dataset.theme).toBe('light')
  })

  it('Back/Forward reaches the same effect: a popstate to ?lens=broadcast paints dark with no click', () => {
    release = primeClock(edt('2026-09-05T12:00:00'))
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    act(() => popTo('/?lens=broadcast'))
    expect(html().dataset.lens).toBe('broadcast')
    expect(html().dataset.theme).toBe('dark')
    expect(screen.getByRole('radio', { name: 'Broadcast' }).getAttribute('aria-checked')).toBe('true')
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
    fireEvent.click(screen.getByRole('radio', { name: 'Broadcast' }))
    expect(html().classList.contains('lens-switching')).toBe(false)
  })
})
