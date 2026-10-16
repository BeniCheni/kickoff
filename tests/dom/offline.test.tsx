import { StrictMode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../../src/App'
import { OfflineApp } from '../../src/offline'
import { edt, primeClock, throwingStorage } from './rig'

let release: (() => void) | null = null
afterEach(() => {
  release?.()
  release = null
})

describe('offline Fixtures and Table', () => {
  it('keeps the shared header and adds the label outside it', () => {
    release = primeClock(edt('2026-09-14T12:00:00'))
    const live = render(<StrictMode><App /></StrictMode>)
    const liveHeader = document.querySelector('header')?.outerHTML
    expect(live.container.textContent).not.toContain('Offline snapshot')
    expect(screen.getByRole('button', { name: 'Moments' })).toBeTruthy()
    live.unmount()

    render(<StrictMode><OfflineApp /></StrictMode>)
    expect(document.querySelector('header')?.outerHTML).toBe(liveHeader)
    expect(screen.getByText('Offline snapshot')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Moments' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Fixtures' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Table' })).toBeTruthy()
  })

  it('renders Fixtures for ?tab=moments and leaves that URL in place', () => {
    release = primeClock(edt('2026-09-14T12:00:00'))
    window.history.replaceState(null, '', '/?tab=moments&watch=clip#keep')
    render(<OfflineApp />)
    expect(screen.getByText('Filters')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Moments' })).toBeNull()
    expect(window.location.search).toBe('?tab=moments&watch=clip')
    expect(window.location.hash).toBe('#keep')
  })

  it('still renders when storage throws', () => {
    release = primeClock(edt('2026-09-14T12:00:00'))
    const restore = throwingStorage()
    try {
      expect(() => render(<OfflineApp />)).not.toThrow()
      expect(screen.getByText('Filters')).toBeTruthy()
    } finally {
      restore()
    }
  })
})
