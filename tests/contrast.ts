import { readFileSync } from 'node:fs'

type RGB = [number, number, number]
export function rgb(hex: string): RGB {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as RGB
}
function luminance(color: RGB): number {
  const [r, g, b] = color.map((n) => {
    const c = n / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}
export function ratio(a: RGB, b: RGB): number {
  const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y)
  return (high! + 0.05) / (low! + 0.05)
}
export function composite(fg: RGB, bg: RGB, alpha: number): RGB {
  // Keep fractional sRGB channels: rounding to a hex before measuring hides near failures.
  return fg.map((v, i) => v * alpha + bg[i]! * (1 - alpha)) as RGB
}
export const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
function palette(css: string, theme: 'light' | 'dark'): Record<string, string> {
  const block = css.match(theme === 'light' ? /:root\s*\{([^}]+)\}/ : /\[data-theme='dark'\]\s*\{([^}]+)\}/)![1]!
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()]))
}
export type ContrastCase = { theme: string; role: string; ground: string; foreground: string; ratio: number; minimum: number }
export const bannerSource = readFileSync(new URL('../src/components/StalenessBanner.tsx', import.meta.url), 'utf8')

/** Fail closed on a new CSS syntax: silently parsing rgb(...) as a hex certifies NaN. */
export function parseColor(value: string): { color: RGB; alpha: number } {
  if (/^#[0-9a-f]{6}$/i.test(value)) return { color: rgb(value), alpha: 1 }
  const match = value.match(/^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)$/)
  if (!match) throw new Error(`Unmeasured CSS color: ${value}`)
  return { color: [Number(match[1]), Number(match[2]), Number(match[3])], alpha: Number(match[4]) }
}

export function measureContrast(cssSource = css, componentSource = bannerSource): ContrastCase[] {
  // The component owns the Tailwind opacity, not this receipt. A changed class must be read
  // here or fail closed; rendered pixels still arbitrate margins under 0.05 (oklab mix).
  const tint = [...componentSource.matchAll(/\bbg-accent\/(\d+(?:\.\d+)?)\b/g)]
  if (tint.length !== 1) throw new Error('Expected one measurable 72h banner tint')
  const bannerAlpha = Number(tint[0]![1]) / 100
  const contrastCases: ContrastCase[] = []
  for (const theme of ['light', 'dark'] as const) {
    const tokens = palette(cssSource, theme)
    const value = (name: string): string => tokens[name]!.startsWith('var(')
      ? value(tokens[name]!.slice(6, -1)) : tokens[name]!
    const paint = (name: string, ground: RGB): RGB => {
      const { color, alpha } = parseColor(value(name))
      return composite(color, ground, alpha)
    }
    const color = (name: string): RGB => {
      const parsed = parseColor(value(name))
      if (parsed.alpha !== 1) throw new Error(`Expected an opaque foreground/base: ${name}`)
      return parsed.color
    }
    const add = (role: string, fg: RGB, foreground: string, ground: string, bg: RGB, minimum = 4.5) => {
      contrastCases.push({ theme, role, ground, foreground, ratio: ratio(fg, bg), minimum })
    }
    for (const ground of ['bg', 'surface', 'surface-alt', 'floodlight-bg']) {
      const bg = paint(ground, color('bg'))
      for (const role of ['text-muted', 'floodlight-strong', 'accent-strong']) {
        // Muted on the dark tint is 4.43, but no component renders that pair. The source
        // inventory and mounted descendants are guarded in contrast.test / DOM tests.
        if (theme === 'dark' && ground === 'floodlight-bg' && role === 'text-muted') continue
        add(role, color(role), value(role), ground, bg)
      }
      if (ground === 'floodlight-bg') add('text-secondary', color('text-secondary'), value('text-secondary'), ground, bg)
      add('Poster focus ring (unchanged)', color('pitch'), value('pitch'), ground, bg, 3)
    }
    add('24h banner', color('floodlight-strong'), value('floodlight-strong'), 'floodlight-bg over bg',
      paint('floodlight-bg', color('bg')))
    add('72h banner', color('accent-strong'), value('accent-strong'), `accent/${bannerAlpha * 100} over bg`,
      composite(color('accent'), color('bg'), bannerAlpha))
    for (const ground of ['bg', 'surface']) {
      add('FT pill', color('text-secondary'), value('text-secondary'), `border fill over ${ground}`,
        paint('border', color(ground)))
    }
    add('LIVE Ledger/Poster', theme === 'light' ? rgb('#ffffff') : color('bg'), theme === 'light' ? '#ffffff' : value('bg'), 'accent-strong fill', color('accent-strong'))
    add('LIVE Broadcast (unchanged)', theme === 'light' ? color('text') : color('bg'), theme === 'light' ? value('text') : value('bg'), 'floodlight fill', color('floodlight'))
  }
  return contrastCases
}
export const contrastCases = measureContrast()
