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

// The two hosts today's pages ask for besides their own. The plan's same-origin check
// allows these and the page's host. An offline page has no host of its own.
export const FONT_HOSTS = new Set(['fonts.googleapis.com', 'fonts.gstatic.com'])

function hopHost(url) {
  try { return new URL(url).host } catch { return '' }
}

function resourceBucket(type) {
  if (type === 'Font') return 'fonts'
  if (type === 'Image' || type === 'Media') return 'images'
  if (type === 'Script') return 'script'
  if (type === 'Stylesheet') return 'style'
  return 'other'
}

// Chrome reuses one requestId across a redirect chain. The log keeps every hop, checks
// each host, and counts encodedDataLength once, on the last hop.
export function createColdLoad() {
  const chains = new Map()
  const hops = (requestId) => {
    let chain = chains.get(requestId)
    if (!chain) {
      chain = []
      chains.set(requestId, chain)
    }
    return chain
  }
  return {
    requestWillBeSent(event) {
      hops(event.requestId).push({ url: event.request?.url ?? '', type: event.type || 'Other', encoded: 0 })
    },
    responseReceived(event) {
      const hop = chains.get(event.requestId)?.at(-1)
      if (hop && event.type) hop.type = event.type
    },
    loadingFinished(event) {
      const hop = chains.get(event.requestId)?.at(-1)
      if (hop) hop.encoded = event.encodedDataLength ?? 0
    },
    tally(pageUrl) {
      const bytes = { fonts: 0, images: 0, script: 0, style: 0, other: 0 }
      const hosts = new Map()
      const foreign = []
      for (const chain of chains.values()) {
        if (!chain.length) continue
        const seen = new Set()
        for (const hop of chain) {
          if (unexpectedHost(hop.url, pageUrl)) {
            const host = hopHost(hop.url)
            if (host && !foreign.includes(host)) foreign.push(host)
          }
          const host = hopHost(hop.url)
          if (host) seen.add(host)
        }
        const last = chain[chain.length - 1]
        bytes[resourceBucket(last.type)] += last.encoded
        const lastHost = hopHost(last.url)
        if (lastHost) {
          const row = hosts.get(lastHost) ?? { host: lastHost, bytes: 0, count: 0 }
          row.bytes += last.encoded
          hosts.set(lastHost, row)
        }
        for (const host of seen) {
          const row = hosts.get(host) ?? { host, bytes: 0, count: 0 }
          row.count += 1
          hosts.set(host, row)
        }
      }
      return {
        bytes,
        hosts: [...hosts.values()].sort((a, b) => a.host.localeCompare(b.host)),
        foreign,
      }
    },
  }
}

/** The request URL when it leaves the allowed hosts, otherwise null. ws and wss count. */
export function unexpectedHost(requestUrl, pageUrl, { offline = false } = {}) {
  let request
  try { request = new URL(requestUrl) } catch { return null }
  if (request.protocol !== 'http:' && request.protocol !== 'https:' && request.protocol !== 'ws:' && request.protocol !== 'wss:') return null
  if (FONT_HOSTS.has(request.host)) return null
  if (offline) return requestUrl
  let page
  try { page = new URL(pageUrl) } catch { return requestUrl }
  if (request.host === page.host) return null
  return requestUrl
}

// Colour-bitmap text: default emoji presentation, flag indicators, a pictograph that
// explicitly asks for emoji presentation (U+FE0F), and the joiners that build them.
// A text-presentation mark (↗, ©, ®, ™, ▶) is drawn in the element's own colour.
export const BITMAP_GLYPH = /^(?:\p{Emoji_Presentation}|\p{Regional_Indicator}|\p{Extended_Pictographic}\uFE0F|[\u{E0020}-\u{E007F}\uFE0F\u200D\s])+$/u

export function isBitmapGlyph(text) {
  return BITMAP_GLYPH.test(String(text))
}

/** The colour that was painted. A visible `-webkit-text-fill-color` is the ink.
 * A transparent fill is foil's unpainted layer, so the fallback `color` is measured. */
export function paintedColor(color, fill) {
  const fallback = String(color ?? '')
  const text = String(fill ?? '').trim()
  if (!text || text.toLowerCase() === 'transparent') return fallback
  const parsed = parseColor(text)
  if (parsed && parsed.a === 0) return fallback
  return text
}

/** Samples whose colour `parseColor` cannot read. They are not measured, so they are named. */
export function unreadColors(samples) {
  return samples
    .filter((sample) => !parseColor(sample.color))
    .map((sample) => ({ color: String(sample.color), text: String(sample.text ?? '').slice(0, 40) }))
}
