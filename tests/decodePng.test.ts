import { crc32, deflateSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { decodePng } from '../scripts/decode-png.mjs'

function chunk(type: string, data: Buffer) {
  const name = Buffer.from(type)
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])) >>> 0)
  return Buffer.concat([len, name, data, crc])
}

function png(width: number, height: number, colorType: number, raw: Buffer, interlace = 0) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = colorType
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = interlace
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function pixel(image: { width: number, data: Uint8Array }, x: number, y: number) {
  const i = (y * image.width + x) * 4
  return [...image.data.slice(i, i + 4)]
}

describe('decodePng', () => {
  it('reads an unfiltered RGB row and an RGBA pixel', () => {
    const rgb = png(2, 1, 2, Buffer.from([0, 255, 0, 0, 0, 255, 0]))
    const image = decodePng(rgb)
    expect(image.width).toBe(2)
    expect(image.height).toBe(1)
    expect(pixel(image, 0, 0)).toEqual([255, 0, 0, 255])
    expect(pixel(image, 1, 0)).toEqual([0, 255, 0, 255])

    const rgba = png(1, 1, 6, Buffer.from([0, 1, 2, 3, 128]))
    expect(pixel(decodePng(rgba), 0, 0)).toEqual([1, 2, 3, 128])
  })

  it('reconstructs Sub, Up and Paeth', () => {
    // Sub: second pixel is a delta from the first.
    const sub = png(2, 1, 2, Buffer.from([1, 10, 20, 30, 5, 0, 0]))
    const subImage = decodePng(sub)
    expect(pixel(subImage, 0, 0)).toEqual([10, 20, 30, 255])
    expect(pixel(subImage, 1, 0)).toEqual([15, 20, 30, 255])

    // Up: a zero delta repeats the row above.
    const up = png(1, 2, 2, Buffer.from([0, 1, 2, 3, 2, 0, 0, 0]))
    const upImage = decodePng(up)
    expect(pixel(upImage, 0, 0)).toEqual([1, 2, 3, 255])
    expect(pixel(upImage, 0, 1)).toEqual([1, 2, 3, 255])

    // Paeth predictor for the first byte is the byte above, so a stored 0 repeats it.
    const paeth = png(1, 2, 2, Buffer.from([0, 10, 20, 30, 4, 0, 0, 0]))
    expect(pixel(decodePng(paeth), 0, 1)).toEqual([10, 20, 30, 255])
  })

  // Chrome's captures use Average and Paeth on most rows (counted on 180 of them, 15 Nov 2026).
  const grey = (...values: number[]) => values.flatMap((value) => [value, value, value])

  it('reconstructs Average from the pixel to the left and the one above, rounding down', () => {
    // Above: 10, 41, 0. Predictors: floor(10 / 2), floor((20 + 41) / 2), floor((100 + 0) / 2).
    const image = decodePng(png(3, 2, 2, Buffer.from([0, ...grey(10, 41, 0), 3, ...grey(15, 70, 246)])))
    expect([0, 1, 2].map((x) => pixel(image, x, 1)[0])).toEqual([20, 100, 40])
  })

  it('reconstructs Paeth when the nearest neighbour is above, above-left, then left', () => {
    // Above: 20, 10, 12. The three predictors are 20 (above), 20 (above-left) and 25 (left).
    const image = decodePng(png(3, 2, 2, Buffer.from([0, ...grey(20, 10, 12), 4, ...grey(10, 5, 15)])))
    expect([0, 1, 2].map((x) => pixel(image, x, 1)[0])).toEqual([30, 25, 40])
  })

  it('breaks a Paeth tie toward the left, then above, never above-left', () => {
    // Left 4, above 13, above-left 10: left and above-left are equally near. Left wins.
    const leftWins = decodePng(png(2, 2, 2, Buffer.from([0, ...grey(10, 13), 4, ...grey(250, 46)])))
    expect([0, 1].map((x) => pixel(leftWins, x, 1)[0])).toEqual([4, 50])
    // Left 13, above 4, above-left 10: above and above-left are equally near. Above wins.
    const aboveWins = decodePng(png(2, 2, 2, Buffer.from([0, ...grey(10, 4), 4, ...grey(3, 46)])))
    expect([0, 1].map((x) => pixel(aboveWins, x, 1)[0])).toEqual([13, 50])
  })

  it('refuses an interlaced image', () => {
    expect(() => decodePng(png(1, 1, 2, Buffer.from([0, 0, 0, 0]), 1))).toThrow(/interlace/)
  })
})
