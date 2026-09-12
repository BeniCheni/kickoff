import { describe, expect, it } from 'vitest'
import { COMPETITIONS } from '../src/lib/competitions'
import { chipInk } from '../src/lib/chipInk'
import { css, composite, parseColor, ratio, rgb } from './contrast'

export function europeanContrastCases() {
  const cases: Array<{ theme: string; role: string; ground: string; ratio: number }> = []
  for (const theme of ['light', 'dark']) {
    const block = css.match(theme === 'light' ? /:root\s*\{([^}]+)\}/ : /\[data-theme='dark'\]\s*\{([^}]+)\}/)![1]!
    const tokens = Object.fromEntries([...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(m => [m[1]!, m[2]!.trim()]))
    const value = (name: string): string => tokens[name]!.startsWith('var(') ? value(tokens[name]!.slice(6, -1)) : tokens[name]!
    const color = (name: string) => parseColor(value(name)).color
    const grounds: Record<string, ReturnType<typeof rgb>> = {
      bg: color('bg'), surface: color('surface'), 'surface-alt': color('surface-alt'),
      'floodlight-bg': composite(color('floodlight-bg'), color('bg'), parseColor(value('floodlight-bg')).alpha),
      'Broadcast hot': color('surface'),
    }
    const pairs = [
      ['matchday / unknown local', 'floodlight-strong', ['bg', 'surface', 'surface-alt', 'Broadcast hot']],
      ['divider range / competition name', 'text-muted', ['bg', 'surface', 'Broadcast hot']],
      ['progress / Moments banner', 'floodlight-strong', ['floodlight-bg']],
      ['Moment title', 'text', ['surface']],
      ['Moment meta / credit', 'text-muted', ['surface']],
      ['Moment provenance', 'floodlight-strong', ['surface']],
      ['Moment link', 'pitch', ['surface']],
      ['inactive competition chip', 'text-secondary', ['bg', 'surface']],
    ] as const
    for (const [role, fg, gs] of pairs) for (const ground of gs) cases.push({ theme, role, ground, ratio: ratio(color(fg), grounds[ground]!) })
  }
  return cases
}
describe('new European-week text on every actual ground', () => {
  it.each(europeanContrastCases())('$theme $role on $ground', c => expect(c.ratio).toBeGreaterThanOrEqual(4.5))
  it.each(Object.entries(COMPETITIONS))('%s selected chip uses a shared readable foreground without repainting its fill', (_key, c) => {
    expect(ratio(rgb(chipInk(c.color)), rgb(c.color))).toBeGreaterThanOrEqual(4.5)
  })
})
