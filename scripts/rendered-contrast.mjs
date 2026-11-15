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
 * Worst ground pixel under each sample's text. `image` is the page with its text hidden;
 * `shown` is the same page with the text drawn. Where the two differ inside a sample's
 * boxes, the text painted there, and only those pixels are its ground: a box is the
 * line's box, which can reach past a tight pill's own background or past a clip edge.
 * A sample that painted nothing is measured over its whole boxes, so text set in its
 * ground's own colour still reads as ratio 1 rather than going unmeasured. Without
 * `shown`, every sample is measured over its whole boxes.
 *
 * `scaleX` / `scaleY` map CSS pixels of the document onto the screenshot. A sample's
 * `opacity` is the product of its ancestors' opacity and thins the ink. Returns the
 * minimum per ink and size.
 */
export function sampleContrast(samples, image, scaleX = 1, scaleY = scaleX, shown = null) {
  const drawn = shown && shown.width === image.width && shown.height === image.height ? shown.data : null
  const worst = new Map()
  for (const sample of samples) {
    const parsed = parseColor(sample.color)
    if (!parsed) continue
    const ink = { ...parsed, a: Number((parsed.a * (sample.opacity ?? 1)).toFixed(3)) }
    if (ink.a === 0) continue
    const large = Boolean(sample.large)
    const scan = (paintedOnly) => {
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
            if (paintedOnly && drawn[i] === image.data[i] && drawn[i + 1] === image.data[i + 1] && drawn[i + 2] === image.data[i + 2]) continue
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
      return ground && Number.isFinite(min) ? { min, ground } : null
    }
    const found = (drawn && scan(true)) || scan(false)
    if (!found) continue
    const key = `${canonical(ink)}|${large}`
    const prev = worst.get(key)
    if (!prev || found.min < prev.ratio) {
      worst.set(key, {
        ink: canonical(ink),
        ground: `rgb(${Math.round(found.ground.r)}, ${Math.round(found.ground.g)}, ${Math.round(found.ground.b)})`,
        ratio: found.min,
        large,
        floor: floorFor(large),
        text: String(sample.text ?? '').slice(0, 40),
      })
    }
  }
  return [...worst.values()]
}

/** Samples whose colour `parseColor` cannot read. They are not measured, so they are named. */
export function unreadColors(samples) {
  return samples
    .filter((sample) => !parseColor(sample.color))
    .map((sample) => ({ color: String(sample.color), text: String(sample.text ?? '').slice(0, 40) }))
}
