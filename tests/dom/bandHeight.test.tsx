import { StrictMode } from 'react'
import { act, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import App from '../../src/App'
import { BAND_HEIGHT } from '../../src/lib/useBandHeight'
import { edt, primeClock } from './rig'

let release: (() => void) | null = null
afterEach(() => {
  release?.()
  release = null
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

/** jsdom lays nothing out and has no ResizeObserver. The stub hands the band a height
 *  and keeps the callbacks, so a wrap can be played back the way the browser reports it. */
function installBandLayout(initial: number) {
  let height = initial
  const observers = new Set<{ notify: () => void }>()
  vi.stubGlobal('ResizeObserver', class {
    private readonly entry: { notify: () => void }
    constructor(callback: () => void) { this.entry = { notify: callback } }
    observe() { observers.add(this.entry) }
    disconnect() { observers.delete(this.entry) }
    unobserve() {}
  })
  const original = HTMLElement.prototype.getBoundingClientRect
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (!this.classList.contains('imprint-band')) return original.call(this)
    return { x: 0, y: 0, top: 0, left: 0, right: 390, bottom: height, width: 390, height, toJSON() {} } as DOMRect
  })
  return {
    resize(next: number) { height = next; act(() => { for (const observer of observers) observer.notify() }) },
    observing: () => observers.size,
  }
}

const published = () => document.documentElement.style.getPropertyValue(BAND_HEIGHT)

it('the band publishes its measured height, follows a wrap, and takes it back on unmount', () => {
  release = primeClock(edt('2026-09-05T12:00:00'))
  const layout = installBandLayout(118)
  const view = render(<StrictMode><App /></StrictMode>)
  expect(published()).toBe('118px')
  // StrictMode mounts the effect twice; one observer is left watching.
  expect(layout.observing()).toBe(1)
  layout.resize(133)
  expect(published()).toBe('133px')
  layout.resize(118)
  expect(published()).toBe('118px')
  view.unmount()
  expect(published()).toBe('')
  expect(layout.observing()).toBe(0)
})

it('with no ResizeObserver the stylesheet’s 118px stands and nothing is written', () => {
  release = primeClock(edt('2026-09-05T12:00:00'))
  render(<App />)
  expect(published()).toBe('')
})
