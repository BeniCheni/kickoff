import { Component, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

/**
 * Affordance 5 — a deliberate throw under a boundary, with the console noise contained.
 * The app has no error boundary yet (docs/v0.3.0-ideas.md row 6, v0.2.5); this proves the
 * rig can test one when it arrives: the throw is caught, the fallback is asserted, and
 * React's error report is captured by a spy scoped to the test rather than printed into
 * the run. The second test is the control — the same throw with no boundary escapes render,
 * which is the white screen row 6 exists to prevent.
 */

class Boundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    return this.state.error ? <p role="alert">Fallback: {this.state.error.message}</p> : this.props.children
  }
}

function Bomb(): never {
  throw new Error('deliberate')
}

describe('a throwing child under a boundary (affordance 5)', () => {
  it('is caught, renders the fallback, and its error report stays inside this test', () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(() =>
        render(
          <Boundary>
            <Bomb />
          </Boundary>,
        ),
      ).not.toThrow()
      expect(screen.getByRole('alert').textContent).toBe('Fallback: deliberate')
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
