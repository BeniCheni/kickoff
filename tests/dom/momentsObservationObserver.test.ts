import { afterEach, expect, it, vi } from 'vitest'
import source from '../../docs/verification/moments-observation/browser-observer.js?raw'
afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks() })
it('queue rows below the viewport never count null as an iframe hit', () => {
  Object.assign(window, { __observationReport: vi.fn(async () => {}) })
  Object.defineProperty(document, 'elementFromPoint', { configurable: true, value: () => null })
  document.body.innerHTML = '<button data-queue-id="a">A</button>'
  const row = document.querySelector('button')!
  vi.spyOn(row, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList)
  vi.spyOn(row, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 1000, 100, 50))
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1)
  window.eval(source)
  const read = (window as unknown as { __observationSnapshot: () => { rows: { hitFrame: boolean }[] } }).__observationSnapshot
  expect(read().rows).toHaveLength(1)
  expect(read().rows[0]!.hitFrame).toBe(false)
})

it('a clipped parked frame does not cover an overlapping queue row', () => {
  Object.assign(window, { __observationReport: vi.fn(async () => {}) })
  Object.defineProperty(document, 'elementFromPoint', { configurable: true, value: () => null })
  document.body.innerHTML = '<div style="overflow-x:hidden;overflow-y:hidden" data-clip><iframe></iframe></div><button data-queue-id="a">A</button>'
  const row = document.querySelector('button')!, frame = document.querySelector('iframe')!, clip = document.querySelector('[data-clip]')!
  vi.spyOn(row, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList)
  for (const node of [row, frame]) vi.spyOn(node, 'getBoundingClientRect').mockReturnValue(new DOMRect(10, 10, 200, 200))
  vi.spyOn(clip, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 0, 0))
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1)
  window.eval(source)
  const read = (window as unknown as { __observationSnapshot: () => { rows: { intersects: boolean }[] } }).__observationSnapshot
  expect(read().rows[0]!.intersects).toBe(false)
  clip.setAttribute('style', 'overflow-x:visible;overflow-y:visible')
  expect(read().rows[0]!.intersects).toBe(true)
})
