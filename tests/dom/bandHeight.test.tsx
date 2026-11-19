import { StrictMode } from 'react'
import { act, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import App from '../../src/App'
import { renderToStaticMarkup } from 'react-dom/server'
import { BandHeightBoot } from '../../src/components/ImprintBand'
import { BAND_HEIGHT, BAND_HEIGHT_BOOT, BAND_HEIGHT_OWNED } from '../../src/lib/useBandHeight'
import { edt, primeClock } from './rig'

let release: (() => void) | null = null
afterEach(() => {
  release?.()
  release = null
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  document.documentElement.style.removeProperty(BAND_HEIGHT)
  document.querySelectorAll('[data-server-html]').forEach((el) => el.remove())
  delete pageWindow().ResizeObserver
  // A script left listening by one test would hear the next test's app.
  document.dispatchEvent(new Event(BAND_HEIGHT_OWNED))
})

/** An inserted script runs in the document's own window. Under vitest that is not the
 *  test's global, and document.defaultView hands back the global, so a script is asked. */
function pageWindow(): { ResizeObserver?: unknown } {
  const ask = document.createElement('script')
  ask.textContent = 'document.kickoffPageWindow = window'
  document.head.appendChild(ask).remove()
  return (document as unknown as { kickoffPageWindow: { ResizeObserver?: unknown } }).kickoffPageWindow
}

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

/** The server's HTML as the parser meets it: the band, then the script directly after it.
 *  jsdom runs the script as it is inserted, with document.currentScript set, as a browser does. */
function parseServerBand(height: number | null) {
  const host = document.body.appendChild(document.createElement('div'))
  host.setAttribute('data-server-html', '')
  let band: HTMLElement | null = null
  let measured = height
  if (height !== null) {
    band = host.appendChild(document.createElement('header'))
    band.className = 'imprint-band'
    band.getBoundingClientRect = () => ({ height: measured } as DOMRect)
  }
  const script = document.createElement('script')
  script.textContent = BAND_HEIGHT_BOOT
  host.appendChild(script)
  return { band, resize(next: number) { measured = next } }
}

it('a server-rendered band is measured by the script after it, before the app runs', () => {
  expect(renderToStaticMarkup(<BandHeightBoot />)).toBe(`<script data-kickoff-band="">${BAND_HEIGHT_BOOT}</script>`)
  parseServerBand(133)
  expect(published()).toBe('133px')
})

it('the script writes the figure in the hook’s own form, so the hook has nothing to change', () => {
  release = primeClock(edt('2026-09-05T12:00:00'))
  parseServerBand(132.796875)
  expect(published()).toBe('132.796875px')
  installBandLayout(132.796875)
  const written = vi.spyOn(document.documentElement.style, 'setProperty')
  const view = render(<App />)
  expect(written.mock.calls.filter(([name]) => name === BAND_HEIGHT)).toEqual([])
  expect(published()).toBe('132.796875px')
  view.unmount()
  expect(published()).toBe('')
})

it('the script follows the band until the app arrives: a face that loads late moves the wrap', () => {
  const observed: Array<{ target: Element; notify: () => void }> = []
  pageWindow().ResizeObserver = class {
    private readonly notify: () => void
    constructor(callback: () => void) { this.notify = callback }
    observe(target: Element) { observed.push({ target, notify: this.notify }) }
    disconnect() {}
    unobserve() {}
  }
  const server = parseServerBand(133)
  expect(published()).toBe('133px')
  expect(observed.map((entry) => entry.target)).toEqual([server.band])
  server.resize(118)
  observed[0]!.notify()
  expect(published()).toBe('118px')
  // A band taken off the page reports no height. The last figure stands.
  server.resize(0)
  observed[0]!.notify()
  expect(published()).toBe('118px')
})

/** The page window's ResizeObserver, as the script after the band meets it. A stopped
 *  observer is handed nothing, as a browser's is not, and says so in `live`. */
function installPageObserver() {
  const observers: Array<{ target: Element | null; live: boolean; notify: () => void }> = []
  pageWindow().ResizeObserver = class {
    private readonly entry: { target: Element | null; live: boolean; notify: () => void }
    constructor(callback: () => void) {
      const entry = { target: null as Element | null, live: false, notify: () => { if (entry.live) callback() } }
      this.entry = entry
    }
    observe(target: Element) {
      this.entry.target = target
      this.entry.live = true
      observers.push(this.entry)
    }
    disconnect() { this.entry.live = false }
    unobserve() {}
  }
  return observers
}

it('the app’s observer takes the band over: the script stops watching, and one writer is left', () => {
  release = primeClock(edt('2026-09-05T12:00:00'))
  const script = installPageObserver()
  const server = parseServerBand(133)
  expect(published()).toBe('133px')
  expect(script.map((observer) => observer.live)).toEqual([true])
  // jsdom does not hydrate, so the app's band is an element of its own here. The handoff
  // is made on the document, and does not turn on which element the app was given.
  const layout = installBandLayout(133)
  // StrictMode mounts the effect twice: the second mount finds no script left to tell.
  const view = render(<StrictMode><App /></StrictMode>)
  expect(layout.observing()).toBe(1)
  expect(script.map((observer) => observer.live)).toEqual([false])
  // The script reports nothing now, whatever its band measures.
  const written = vi.spyOn(document.documentElement.style, 'setProperty')
  server.resize(140)
  script[0]!.notify()
  expect(published()).toBe('133px')
  // A wrap is published once, and by the app.
  layout.resize(118)
  expect(published()).toBe('118px')
  expect(written.mock.calls.filter(([name]) => name === BAND_HEIGHT)).toEqual([[BAND_HEIGHT, '118px']])
  view.unmount()
  expect(published()).toBe('')
  expect(layout.observing()).toBe(0)
})

it('the script watches until it is told the app has the band, and nothing else stops it', () => {
  const script = installPageObserver()
  const server = parseServerBand(133)
  document.dispatchEvent(new Event('kickoff:band-height'))
  window.dispatchEvent(new Event(BAND_HEIGHT_OWNED))
  expect(script[0]!.live).toBe(true)
  server.resize(118)
  script[0]!.notify()
  expect(published()).toBe('118px')
  document.dispatchEvent(new Event(BAND_HEIGHT_OWNED))
  expect(script[0]!.live).toBe(false)
  server.resize(133)
  script[0]!.notify()
  expect(published()).toBe('118px')
})

it('the app says it has the band once it has published and is watching, and not before', () => {
  release = primeClock(edt('2026-09-05T12:00:00'))
  const layout = installBandLayout(118)
  const heard: Array<{ observing: number; published: string }> = []
  const listen = () => heard.push({ observing: layout.observing(), published: published() })
  document.addEventListener(BAND_HEIGHT_OWNED, listen)
  const view = render(<App />)
  expect(heard).toEqual([{ observing: 1, published: '118px' }])
  layout.resize(133)
  view.unmount()
  document.removeEventListener(BAND_HEIGHT_OWNED, listen)
  // A wrap and an unmount are not a second handoff.
  expect(heard).toHaveLength(1)
})

it('an app that cannot watch the band leaves the script watching it', () => {
  release = primeClock(edt('2026-09-05T12:00:00'))
  const script = installPageObserver()
  const server = parseServerBand(133)
  // The test's own global has no ResizeObserver here, so the hook measures nothing.
  render(<App />)
  expect(script.map((observer) => observer.live)).toEqual([true])
  server.resize(118)
  script[0]!.notify()
  expect(published()).toBe('118px')
})

it('the script writes nothing without a band before it, or for a band with no height', () => {
  parseServerBand(null)
  expect(published()).toBe('')
  parseServerBand(0)
  expect(published()).toBe('')
})

it('the Vite shell renders its own band, measures it in the hook, and carries no script', () => {
  release = primeClock(edt('2026-09-05T12:00:00'))
  installBandLayout(118)
  render(<App />)
  expect(document.querySelector('script[data-kickoff-band]')).toBeNull()
  expect(published()).toBe('118px')
})
