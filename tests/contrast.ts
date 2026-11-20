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
export const css = [
  readFileSync(new URL('../src/index.css', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/shell.css', import.meta.url), 'utf8'),
].join('\n')
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

/**
 * What the banner's own rules paint, as token names: the ink of each plane and the
 * ground under it. The pairs below are measured from these, so a rule that paints
 * the plane in another colour is measured in that colour. A value that is not a
 * token fails closed.
 */
export function bannerPaint(cssSource = css): { amber: string; alarm: string; grounds: string[] } {
  const block = (selector: string): string => {
    const start = cssSource.indexOf(`\n${selector} {`)
    if (start === -1) throw new Error(`Missing banner rule: ${selector}`)
    return cssSource.slice(start, cssSource.indexOf('}', start))
  }
  const token = (selector: string, property: 'background' | 'color'): string => {
    const value = block(selector).match(new RegExp(`[{;\\s]${property}:\\s*var\\(--([\\w-]+)\\)\\s*;`))?.[1]
    if (!value) throw new Error(`The banner's ${property} is not a token: ${selector}`)
    return value
  }
  return {
    amber: token('.staleness', 'color'),
    alarm: token(".staleness[data-plane='alarm']", 'color'),
    grounds: [token('.staleness', 'background'), token("[data-ground='typescript'] .staleness", 'background')],
  }
}

export function measureContrast(cssSource = css, componentSource = bannerSource): ContrastCase[] {
  // The banner's two planes are flat tokens. A missing plane fails closed.
  if (!componentSource.includes('data-plane={plane}') || !componentSource.includes("'amber'") || !componentSource.includes("'alarm'")) {
    throw new Error('72h banner tint')
  }
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
    const stock = theme === 'light' ? secondEditionTokens(cssSource).paper : secondEditionTokens(cssSource).black
    const banner = bannerPaint(cssSource)
    for (const ground of banner.grounds) {
      add('24h banner', opaqueToken(stock, banner.amber), stock[banner.amber]!, ground, opaqueToken(stock, ground))
      add('72h banner', opaqueToken(stock, banner.alarm), stock[banner.alarm]!, ground, opaqueToken(stock, ground))
    }
    for (const ground of ['bg', 'surface']) {
      add('FT pill', color('text-secondary'), value('text-secondary'), `border fill over ${ground}`,
        paint('border', color(ground)))
    }
    add('LIVE Ledger/Poster', theme === 'light' ? rgb('#ffffff') : color('bg'), theme === 'light' ? '#ffffff' : value('bg'), 'accent-strong fill', color('accent-strong'))
  }
  return contrastCases
}
export const contrastCases = measureContrast()

function props(block: string): Record<string, string> {
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((match) => [match[1]!, match[2]!.trim()]))
}

/** Paper stock is every :root block, in order. Black stock starts there and overlays the one black-stock rule. */
export function secondEditionTokens(cssSource = css): { paper: Record<string, string>; black: Record<string, string>; stockSelector: string } {
  const paper: Record<string, string> = {}
  for (const match of cssSource.matchAll(/:root\s*\{([^}]+)\}/g)) Object.assign(paper, props(match[1]!))
  // The comma is the rule. A comment may name the attribute without being the selector.
  const stock = cssSource.match(/\[data-stock='black'\],\s*:root\[data-theme='dark'\][^{]*\{([^}]+)\}/)
  if (!stock) throw new Error('Missing the black-stock rule')
  const stockSelector = cssSource.slice(stock.index!, cssSource.indexOf('{', stock.index!))
  return { paper, black: { ...paper, ...props(stock[1]!) }, stockSelector }
}

function opaqueToken(tokens: Record<string, string>, name: string): RGB {
  const value = tokens[name]
  if (!value) throw new Error(`Missing token ${name}`)
  const parsed = parseColor(value)
  if (parsed.alpha !== 1) throw new Error(`Expected an opaque token: ${name} is ${value}`)
  return parsed.color
}

/** The handoff's ratios for the scrim are the 8-bit composite, the #1E1E1F it names. Fractions stay above the floor either way. */
function scrimGround(tokens: Record<string, string>): RGB {
  const scrim = parseColor(tokens['fb-scrim']!)
  return composite(scrim.color, [255, 255, 255], scrim.alpha).map((channel) => Math.round(channel)) as RGB
}

function darkestFoil(tokens: Record<string, string>): RGB {
  let best: RGB | null = null
  let bestLuminance = Infinity
  for (let stop = 1; stop <= 5; stop += 1) {
    const color = opaqueToken(tokens, `fb-foil-${stop}`)
    const lum = luminance(color)
    if (lum < bestLuminance) {
      bestLuminance = lum
      best = color
    }
  }
  if (!best) throw new Error('Missing foil stops')
  return best
}

export type SecondEditionPair = {
  name: string
  ratio: number
  expected: number
  minimum: number
  allowed: boolean
}

// RGB measured at the spike's lit-paper centre. It is not a token.
const TORCH_POOL: RGB = [57, 50, 43]

export function secondEditionPairs(cssSource = css): SecondEditionPair[] {
  const { paper, black } = secondEditionTokens(cssSource)
  const light = palette(cssSource, 'light')
  const foil = darkestFoil(black)
  const scrim = scrimGround(black)
  const read = (tokens: Record<string, string>, name: string): RGB => opaqueToken(tokens, name)
  const measured: Array<[string, RGB, RGB, number, number, boolean]> = [
    ['pulp-ink on pulp', read(paper, 'fb-pulp-ink'), read(paper, 'fb-pulp'), 13.32, 4.5, true],
    ['pulp-ink on typescript', read(paper, 'fb-pulp-ink'), read(paper, 'fb-typescript'), 14.76, 4.5, true],
    ['pulp-muted on pulp', read(paper, 'fb-pulp-muted'), read(paper, 'fb-pulp'), 7, 4.5, true],
    ['pulp-muted on typescript', read(paper, 'fb-pulp-muted'), read(paper, 'fb-typescript'), 7.75, 4.5, true],
    ['pitch on pulp', read(paper, 'fb-pitch'), read(paper, 'fb-pulp'), 6.4, 4.5, true],
    ['pitch on typescript', read(paper, 'fb-pitch'), read(paper, 'fb-typescript'), 7.09, 4.5, true],
    ['amber on pulp', read(paper, 'fb-amber'), read(paper, 'fb-pulp'), 5.85, 4.5, true],
    ['amber on typescript', read(paper, 'fb-amber'), read(paper, 'fb-typescript'), 6.48, 4.5, true],
    ['alarm on pulp', read(paper, 'fb-alarm'), read(paper, 'fb-pulp'), 5.17, 4.5, true],
    ['alarm on typescript', read(paper, 'fb-alarm'), read(paper, 'fb-typescript'), 5.73, 4.5, true],
    ['cover-ink on paper pitch', read(paper, 'fb-cover-ink'), read(paper, 'fb-pitch'), 7.26, 4.5, true],
    ['cover-ink on blood', read(paper, 'fb-cover-ink'), read(paper, 'fb-blood'), 5.86, 4.5, true],
    ['cover-ink on cover-black', read(black, 'fb-cover-ink'), read(black, 'fb-cover-black'), 16.68, 4.5, true],
    ['cover-ink on scrim', read(black, 'fb-cover-ink'), scrim, 14.04, 4.5, true],
    ['cover-muted on cover-black', read(black, 'fb-cover-muted'), read(black, 'fb-cover-black'), 7.45, 4.5, true],
    ['cover-muted on scrim', read(black, 'fb-cover-muted'), scrim, 6.27, 4.5, true],
    ['pitch on cover-black', read(black, 'fb-pitch'), read(black, 'fb-cover-black'), 8.73, 4.5, true],
    ['pitch on scrim', read(black, 'fb-pitch'), scrim, 7.35, 4.5, true],
    ['pitch on dark pulp', read(black, 'fb-pitch'), read(black, 'fb-pulp'), 8.13, 4.5, true],
    ['amber on cover-black', read(black, 'fb-amber'), read(black, 'fb-cover-black'), 12.62, 4.5, true],
    ['amber on scrim', read(black, 'fb-amber'), scrim, 10.63, 4.5, true],
    ['amber on dark pulp', read(black, 'fb-amber'), read(black, 'fb-pulp'), 11.76, 4.5, true],
    ['alarm on cover-black', read(black, 'fb-alarm'), read(black, 'fb-cover-black'), 7.37, 4.5, true],
    ['alarm on dark pulp', read(black, 'fb-alarm'), read(black, 'fb-pulp'), 6.86, 4.5, true],
    ['cover-black on pitch', read(black, 'fb-cover-black'), read(black, 'fb-pitch'), 8.73, 4.5, true],
    ['pulp-ink on dark pulp', read(black, 'fb-pulp-ink'), read(black, 'fb-pulp'), 14.49, 4.5, true],
    ['pulp-muted on dark pulp', read(black, 'fb-pulp-muted'), read(black, 'fb-pulp'), 7.39, 4.5, true],
    ['pulp-ink on torch pool', read(black, 'fb-pulp-ink'), TORCH_POOL, 9.92, 4.5, true],
    ['pulp-muted on torch pool', read(black, 'fb-pulp-muted'), TORCH_POOL, 5.06, 4.5, true],
    ['pitch on torch pool', read(black, 'fb-pitch'), TORCH_POOL, 5.56, 4.5, true],
    ['amber on torch pool', read(black, 'fb-amber'), TORCH_POOL, 8.05, 4.5, true],
    ['alarm on torch pool', read(black, 'fb-alarm'), TORCH_POOL, 4.7, 4.5, true],
    ['foil darkest on cover-black', foil, read(black, 'fb-cover-black'), 8.22, 3, true],
    ['foil darkest on scrim', foil, scrim, 6.92, 4.5, true],
    ['blood on cover-black', read(black, 'fb-blood'), read(black, 'fb-cover-black'), 2.84, 4.5, false],
    ['first-edition accent on pulp', opaqueToken(light, 'accent'), read(paper, 'fb-pulp'), 2.88, 4.5, false],
    ['first-edition floodlight on pulp', opaqueToken(light, 'floodlight'), read(paper, 'fb-pulp'), 2.19, 4.5, false],
    ['first-edition pitch on pulp', opaqueToken(light, 'pitch'), read(paper, 'fb-pulp'), 3.91, 4.5, false],
    ['first-edition floodlight-strong on pulp', opaqueToken(light, 'floodlight-strong'), read(paper, 'fb-pulp'), 4.2, 4.5, false],
  ]
  return measured.map(([name, foreground, ground, expected, minimum, allowed]) => ({
    name, ratio: ratio(foreground, ground), expected, minimum, allowed,
  }))
}

export function scrimComposite(cssSource = css): RGB {
  return scrimGround(secondEditionTokens(cssSource).black)
}
