import { describe, expect, it } from 'vitest'
import { contrastRatio, floorFor, isLargeText, parseColor, sampleContrast } from '../scripts/rendered-contrast.mjs'

function image(pixels: number[][]) {
  const width = pixels[0]!.length
  const data = new Uint8Array(width * pixels.length * 4)
  pixels.forEach((row, y) => row.forEach((value, x) => {
    const i = (y * width + x) * 4
    data[i] = value
    data[i + 1] = value
    data[i + 2] = value
    data[i + 3] = 255
  }))
  return { width, height: pixels.length, data }
}

describe('rendered contrast', () => {
  it('reports the worst ground pixel per ink, and the large-text floor', () => {
    expect(isLargeText(24, 400)).toBe(true)
    expect(isLargeText(18.66, 700)).toBe(true)
    expect(isLargeText(18.65, 700)).toBe(false)
    expect(floorFor(true)).toBe(3)
    expect(floorFor(false)).toBe(4.5)

    const samples = [{
      text: 'Specimen',
      color: 'rgb(0, 0, 0)',
      large: false,
      rects: [{ x: 0, y: 0, w: 2, h: 1 }],
    }]
    const [worst] = sampleContrast(samples, image([[255, 0]]))
    expect(worst!.ground).toBe('rgb(0, 0, 0)')
    expect(worst!.ratio).toBe(1)
    expect(worst!.floor).toBe(4.5)
    expect(parseColor('rgba(0, 0, 0, 0)')!.a).toBe(0)
    expect(sampleContrast([{ ...samples[0]!, color: 'rgba(0, 0, 0, 0)' }], image([[255]]))).toEqual([])
    expect(contrastRatio({ r: 0, g: 0, b: 0, a: 1 }, { r: 255, g: 255, b: 255, a: 1 })).toBe(21)
  })
})
