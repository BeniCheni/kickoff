// WCAG contrast of rendered text against the ground behind it. Report mode records the
// ratio; --enforce is what later PRs turn on. Floors: 4.5, and 3 for large text.

export function parseColor(value) {
  const match = String(value).match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)/)
  if (!match) return null
  const alpha = match[4]
  const a = alpha === undefined ? 1 : alpha.endsWith('%') ? Number(alpha.slice(0, -1)) / 100 : Number(alpha)
  return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]), a: a > 1 ? a / 255 : a }
}

export function composite(ink, ground) {
  const a = ink.a
  return {
    r: ink.r * a + ground.r * (1 - a),
    g: ink.g * a + ground.g * (1 - a),
    b: ink.b * a + ground.b * (1 - a),
    a: 1,
  }
}

function channel(c) {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

export function luminance(rgb) {
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
}

export function contrastRatio(a, b) {
  const l1 = luminance(a)
  const l2 = luminance(b)
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

/** WCAG large text: 24px, or 18.66px at weight 700 or above. */
export function isLargeText(fontSizePx, fontWeight) {
  return fontSizePx >= 24 || (fontSizePx >= 18.66 && fontWeight >= 700)
}

export function floorFor(large) {
  return large ? 3 : 4.5
}

function canonical(ink) {
  return `rgba(${Math.round(ink.r)}, ${Math.round(ink.g)}, ${Math.round(ink.b)}, ${ink.a})`
}

/**
 * Worst ground pixel inside each sample's boxes. `scaleX` / `scaleY` map CSS pixels of
 * the document onto the screenshot. Returns the minimum per ink and size.
 */
export function sampleContrast(samples, image, scaleX = 1, scaleY = scaleX) {
  const worst = new Map()
  for (const sample of samples) {
    const ink = parseColor(sample.color)
    if (!ink || ink.a === 0) continue
    const large = Boolean(sample.large)
    let min = Infinity
    let ground = null
    for (const rect of sample.rects ?? []) {
      const x0 = Math.max(0, Math.floor(rect.x * scaleX))
      const y0 = Math.max(0, Math.floor(rect.y * scaleY))
      const x1 = Math.min(image.width, Math.ceil((rect.x + rect.w) * scaleX))
      const y1 = Math.min(image.height, Math.ceil((rect.y + rect.h) * scaleY))
      for (let y = y0; y < y1; y++) {
        const row = y * image.width
        for (let x = x0; x < x1; x++) {
          const i = (row + x) * 4
          const pixel = {
            r: image.data[i] ?? 0,
            g: image.data[i + 1] ?? 0,
            b: image.data[i + 2] ?? 0,
            a: (image.data[i + 3] ?? 255) / 255,
          }
          const seen = pixel.a < 1 ? composite(pixel, { r: 255, g: 255, b: 255, a: 1 }) : pixel
          const ratio = contrastRatio(composite(ink, seen), seen)
          if (ratio < min) {
            min = ratio
            ground = seen
          }
        }
      }
    }
    if (!ground || !Number.isFinite(min)) continue
    const key = `${canonical(ink)}|${large}`
    const prev = worst.get(key)
    if (!prev || min < prev.ratio) {
      worst.set(key, {
        ink: canonical(ink),
        ground: `rgb(${Math.round(ground.r)}, ${Math.round(ground.g)}, ${Math.round(ground.b)})`,
        ratio: min,
        large,
        floor: floorFor(large),
        text: String(sample.text ?? '').slice(0, 40),
      })
    }
  }
  return [...worst.values()]
}
