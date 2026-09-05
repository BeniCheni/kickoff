import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ViewBoundary } from '../../src/components/ViewBoundary'

/**
 * Affordance 5 — a deliberate throw under a boundary, with the console noise contained.
 * Now exercises the production boundary (docs/v0.3.0-ideas.md row 6, v0.2.5):
 * the throw is caught, the fallback is asserted, and
 * React's error report is captured by a spy scoped to the test rather than printed into
 * the run. The second test is the control — the same throw with no boundary escapes render,
 * which is the white screen row 6 exists to prevent.
 */

function Bomb(): never {
  throw new Error('deliberate')
}

describe('a throwing child under a boundary (affordance 5)', () => {
  it('is caught, renders the fallback, and its error report stays inside this test', () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(() =>
        render(
          <ViewBoundary>
            <Bomb />
          </ViewBoundary>,
        ),
      ).not.toThrow()
      expect(screen.getByRole('alert').textContent).toContain('This view couldn’t load.')
      expect(screen.getByRole('button', { name: 'Reload' })).toBeTruthy()
      expect(screen.getByRole('link', { name: 'Reset view' }).getAttribute('href')).toBe('/')
      // React 19 reports a boundary-caught error through console.error (onCaughtError's
      // default). The spy proves the rig saw exactly that report — and swallowed it.
      const reported = errors.mock.calls.flat().some((a) => (a instanceof Error ? a.message : String(a)).includes('deliberate'))
      expect(reported).toBe(true)
    } finally {
      errors.mockRestore()
    }
  })

  it('control: with no boundary the same throw escapes render', () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(() => render(<Bomb />)).toThrow('deliberate')
    } finally {
      errors.mockRestore()
    }
  })
})
