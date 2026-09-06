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
const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
function palette(theme: 'light' | 'dark'): Record<string, string> {
  const block = css.match(theme === 'light' ? /:root\s*\{([^}]+)\}/ : /\[data-theme='dark'\]\s*\{([^}]+)\}/)![1]!
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()]))
}
export type ContrastCase = { theme: string; role: string; ground: string; foreground: string; ratio: number; minimum: number }
export const contrastCases: ContrastCase[] = []
for (const theme of ['light', 'dark'] as const) {
  const tokens = palette(theme)
  const value = (name: string): string => tokens[name]!.startsWith('var(')
    ? tokens[tokens[name]!.slice(6, -1)]! : tokens[name]!
  const color = (name: string) => rgb(value(name))
  const add = (role: string, fg: RGB, foreground: string, ground: string, bg: RGB, minimum = 4.5) => {
    contrastCases.push({ theme, role, ground, foreground, ratio: ratio(fg, bg), minimum })
  }
  for (const ground of ['bg', 'surface', 'surface-alt', ...(theme === 'light' ? ['floodlight-bg'] : [])]) {
    for (const role of ['text-muted', 'floodlight-strong', 'accent-strong']) {
      add(role, color(role), value(role), ground, color(ground))
    }
    add('Poster focus ring (unchanged)', color('pitch'), value('pitch'), ground, color(ground), 3)
  }
  // Actual alpha grounds: banners live on bg; FT rows on bg or Broadcast-hot surface.
  add('24h banner', color('floodlight-strong'), value('floodlight-strong'), 'floodlight-bg over bg',
    theme === 'light' ? color('floodlight-bg') : composite(color('floodlight'), color('bg'), 0.14))
  add('72h banner', color('accent-strong'), value('accent-strong'), 'accent/10 over bg', composite(color('accent'), color('bg'), 0.10))
  for (const ground of ['bg', 'surface']) {
    add('FT pill', color('text-secondary'), value('text-secondary'), `border fill over ${ground}`,
      composite(color('text'), color(ground), theme === 'light' ? 0.12 : 0.14))
  }
  add('LIVE Ledger/Poster', theme === 'light' ? rgb('#ffffff') : color('bg'), theme === 'light' ? '#ffffff' : value('bg'), 'accent-strong fill', color('accent-strong'))
  add('LIVE Broadcast (unchanged)', theme === 'light' ? color('text') : color('bg'), theme === 'light' ? value('text') : value('bg'), 'floodlight fill', color('floodlight'))
}
