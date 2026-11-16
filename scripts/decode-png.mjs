// Enough of PNG for the contrast sampler: 8-bit RGB or RGBA, no interlace. Chrome's
// screenshots are that. Filters 0–4, including Paeth, so a filtered row is not misread.
import { inflateSync } from 'node:zlib'

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

function paeth(a, b, c) {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  if (pa <= pb && pa <= pc) return a
  if (pb <= pc) return b
  return c
}

function unfilter(filter, row, prev, bpp) {
  if (filter === 0) return
  for (let i = 0; i < row.length; i++) {
    const left = i >= bpp ? row[i - bpp] : 0
    const up = prev[i] ?? 0
    const upLeft = i >= bpp ? prev[i - bpp] ?? 0 : 0
    let value = row[i]
    if (filter === 1) value += left
    else if (filter === 2) value += up
    else if (filter === 3) value += Math.floor((left + up) / 2)
    else if (filter === 4) value += paeth(left, up, upLeft)
    else throw new Error(`unsupported png filter ${filter}`)
    row[i] = value & 255
  }
}

export function decodePng(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input)
  if (buf.length < 8 || !buf.subarray(0, 8).equals(SIGNATURE)) throw new Error('not a png')
  let offset = 8
  let width, height, bitDepth, colorType, interlace
  const idat = []
  while (offset + 12 <= buf.length) {
    const length = buf.readUInt32BE(offset)
    const type = buf.toString('ascii', offset + 4, offset + 8)
    const data = buf.subarray(offset + 8, offset + 8 + length)
    offset += 12 + length
    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      bitDepth = data[8]
      colorType = data[9]
      if (data[10] !== 0 || data[11] !== 0) throw new Error('unsupported png compression')
      interlace = data[12]
    } else if (type === 'IDAT') idat.push(data)
    else if (type === 'IEND') break
  }
  if (!width || !height) throw new Error('png missing IHDR')
  if (bitDepth !== 8 || interlace !== 0 || (colorType !== 2 && colorType !== 6)) {
    throw new Error(`unsupported png: depth ${bitDepth} color ${colorType} interlace ${interlace}`)
  }
  const bpp = colorType === 6 ? 4 : 3
  const raw = inflateSync(Buffer.concat(idat))
  const stride = width * bpp
  const expected = height * (stride + 1)
  if (raw.length < expected) throw new Error('png bitmap is short')
  const out = new Uint8Array(width * height * 4)
  let prev = new Uint8Array(stride)
  let src = 0
  for (let y = 0; y < height; y++) {
    const filter = raw[src++]
    const row = raw.subarray(src, src + stride)
    src += stride
    const recon = new Uint8Array(row)
    unfilter(filter, recon, prev, bpp)
    for (let x = 0; x < width; x++) {
      const s = x * bpp
      const d = (y * width + x) * 4
      out[d] = recon[s] ?? 0
      out[d + 1] = recon[s + 1] ?? 0
      out[d + 2] = recon[s + 2] ?? 0
      out[d + 3] = bpp === 4 ? recon[s + 3] ?? 0 : 255
    }
    prev = recon
  }
  return { width, height, data: out }
}
