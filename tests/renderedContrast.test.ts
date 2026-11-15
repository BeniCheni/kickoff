import { describe, expect, it } from 'vitest'
import { contrastRatio, floorFor, isLargeText, parseColor, sampleContrast, unreadColors } from '../scripts/rendered-contrast.mjs'

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

  // A 3x1 strip. The box covers all three pixels; the text painted only the middle one.
  const black = { text: 'Specimen', color: 'rgb(0, 0, 0)', large: false, rects: [{ x: 0, y: 0, w: 3, h: 1 }] }

  it('measures only the pixels the text painted when it is given the page with the text drawn', () => {
    // Hidden: black, white, black. The box reaches onto black on both sides, as a line box
    // reaches past a tight pill or a clip edge, but the glyph sat on the white pixel.
    const hidden = image([[0, 255, 0]])
    const drawn = image([[0, 40, 0]])
    expect(sampleContrast([black], hidden)[0]!.ratio).toBe(1)
    const [narrowed] = sampleContrast([black], hidden, 1, 1, drawn)
    expect(narrowed!.ground).toBe('rgb(255, 255, 255)')
    expect(narrowed!.ratio).toBe(21)
  })

  it('still reports ratio 1 for text drawn in its ground’s own colour', () => {
    // Nothing differs between the two captures, so the whole box is the ground.
    const white = { ...black, color: 'rgb(255, 255, 255)' }
    const page = image([[255, 255, 255]])
    const [same] = sampleContrast([white], page, 1, 1, image([[255, 255, 255]]))
    expect(same!.ratio).toBe(1)
  })

  it('ignores a drawn capture of another size rather than comparing the wrong pixels', () => {
    const [whole] = sampleContrast([black], image([[0, 255, 0]]), 1, 1, image([[0, 40]]))
    expect(whole!.ratio).toBe(1)
  })

  it('thins the ink by its ancestors’ opacity', () => {
    const [faded] = sampleContrast([{ ...black, opacity: 0.5 }], image([[255, 255, 255]]))
    expect(faded!.ink).toBe('rgba(0, 0, 0, 0.5)')
    // Black at half strength on white is mid grey: about 3.98, under the 4.5 floor.
    expect(faded!.ratio).toBeGreaterThan(3.9)
    expect(faded!.ratio).toBeLessThan(4.05)
    expect(sampleContrast([{ ...black, opacity: 0 }], image([[255, 255, 255]]))).toEqual([])
  })

  it('names a sample whose colour it cannot read instead of dropping it', () => {
    const samples = [black, { ...black, text: 'Wide gamut', color: 'oklch(0.5 0.2 260)' }]
    expect(sampleContrast(samples, image([[255, 255, 255]]))).toHaveLength(1)
    expect(unreadColors(samples)).toEqual([{ color: 'oklch(0.5 0.2 260)', text: 'Wide gamut' }])
  })
})
