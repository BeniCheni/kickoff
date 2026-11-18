import { StrictMode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from '../../src/App'
import { readBootMotion } from '../../src/lib/motion'
import { edt, installMatchMedia, primeClock, refusingWrites, throwingStorage } from './rig'

let release: (() => void) | null = null
afterEach(() => {
  release?.()
  release = null
})

function boot() {
  document.documentElement.dataset.motion = readBootMotion()
}

function firstFrame() {
  return renderToStaticMarkup(<App />)
}

describe('the motion control', () => {
  it('each stored value, and no stored value, is the first frame after a reload', () => {
    release = primeClock(edt('2026-09-05T12:00:00'))
    installMatchMedia({ reducedMotion: true })
    window.localStorage.setItem('kickoff-motion', 'on')
    boot()
    expect(firstFrame()).toContain('Stop motion')

    window.localStorage.setItem('kickoff-motion', 'off')
    delete document.documentElement.dataset.motion
    boot()
    const stopped = firstFrame()
    expect(stopped).toContain('Start motion')
    expect(stopped).not.toContain('Stop motion')

    window.localStorage.removeItem('kickoff-motion')
    delete document.documentElement.dataset.motion
    boot()
    expect(firstFrame()).toContain('Start motion')

    installMatchMedia({ reducedMotion: false })
    delete document.documentElement.dataset.motion
    boot()
    const running = firstFrame()
    expect(running).toContain('Stop motion')
    expect(running).not.toContain('Start motion')
  })

  it('storage that refuses the read follows the system, and Start under reduced motion still changes the page', () => {
    const media = installMatchMedia({ reducedMotion: true })
    release = primeClock(edt('2026-09-05T12:00:00'))
    const restore = throwingStorage()
    try {
      render(<App />)
      expect(document.documentElement.dataset.motion).toBe('off')
      expect(screen.getByRole('button', { name: 'Start motion' })).toBeTruthy()
      fireEvent.click(screen.getByRole('button', { name: 'Start motion' }))
      expect(document.documentElement.dataset.motion).toBe('on')
      expect(screen.getByRole('button', { name: 'Stop motion' })).toBeTruthy()
      media.setReducedMotion(false)
      expect(document.documentElement.dataset.motion).toBe('on')
    } finally { restore() }
  })

  it('a write that throws still changes the page, and the stored choice is as it was after a reload', () => {
    installMatchMedia({ reducedMotion: false })
    release = primeClock(edt('2026-09-05T12:00:00'))
    window.localStorage.setItem('kickoff-motion', 'on')
    const storage = refusingWrites()
    try {
      const view = render(<App />)
      expect(document.documentElement.dataset.motion).toBe('on')
      fireEvent.click(screen.getByRole('button', { name: 'Stop motion' }))
      // The write was tried, it threw, and the page changed anyway.
      expect(storage.setItem).toHaveBeenCalledTimes(1)
      expect(storage.setItem).toHaveBeenCalledWith('kickoff-motion', 'off')
      expect(document.documentElement.dataset.motion).toBe('off')
      expect(screen.getByRole('button', { name: 'Start motion' })).toBeTruthy()
      expect(window.localStorage.getItem('kickoff-motion')).toBe('on')
      view.unmount()

      // A reload reads what the store kept, which is the choice from before the press.
      delete document.documentElement.dataset.motion
      boot()
      const reloaded = firstFrame()
      expect(reloaded).toContain('Stop motion')
      expect(reloaded).not.toContain('Start motion')
    } finally { storage.restore() }
  })

  it('storage that refuses everything: a press that would be stored still changes the page', () => {
    installMatchMedia({ reducedMotion: false })
    release = primeClock(edt('2026-09-05T12:00:00'))
    const restore = throwingStorage()
    try {
      render(<App />)
      expect(document.documentElement.dataset.motion).toBe('on')
      fireEvent.click(screen.getByRole('button', { name: 'Stop motion' }))
      expect(document.documentElement.dataset.motion).toBe('off')
      expect(screen.getByRole('button', { name: 'Start motion' })).toBeTruthy()
    } finally { restore() }
  })

  it('Start under reduced motion is honoured for the visit and not stored', () => {
    const media = installMatchMedia({ reducedMotion: true })
    release = primeClock(edt('2026-09-05T12:00:00'))
    const view = render(<StrictMode><App /></StrictMode>)
    expect(document.documentElement.dataset.motion).toBe('off')
    fireEvent.click(screen.getByRole('button', { name: 'Start motion' }))
    expect(document.documentElement.dataset.motion).toBe('on')
    expect(window.localStorage.getItem('kickoff-motion')).toBeNull()
    media.setReducedMotion(false)
    expect(document.documentElement.dataset.motion).toBe('on')
    view.unmount()

    media.setReducedMotion(true)
    delete document.documentElement.dataset.motion
    boot()
    const reloaded = firstFrame()
    expect(reloaded).toContain('Start motion')
    expect(reloaded).not.toContain('Stop motion')
    expect(window.localStorage.getItem('kickoff-motion')).toBeNull()
  })

  it('Stop is stored, and a later reload comes back stopped', () => {
    installMatchMedia({ reducedMotion: false })
    release = primeClock(edt('2026-09-05T12:00:00'))
    const view = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Stop motion' }))
    expect(window.localStorage.getItem('kickoff-motion')).toBe('off')
    view.unmount()
    delete document.documentElement.dataset.motion
    boot()
    expect(firstFrame()).toContain('Start motion')
  })
})
