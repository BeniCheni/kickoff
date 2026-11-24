import { globSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
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
    }
    const pairs = [
      ['matchday / unknown local', 'floodlight-strong', ['bg', 'surface', 'surface-alt']],
      ['divider range / competition name', 'text-muted', ['bg', 'surface']],
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
})

// CompetitionChip and chipInk left with the surfaces that drew a chip: the filter panel took
// toggles in PR 3 and the Table took league tabs in PR 4. The rule they held here, readable
// text on a competition's fill, ended with the fills. What holds in its place: a competition's
// colour is read only to draw a mark that carries no text. As in the amber inventory in
// tests/fixtureHonesty.test.ts, each site is consumed once, so a second read needs review.
const src = new URL('../src/', import.meta.url)
const hueSites: [string, string, RegExp][] = [
  ['components/FixtureRow.tsx', 'dot', /<i aria-hidden="true" style=\{\{ backgroundColor: comp\.color \}\} \/>/],
  ['components/NextUpStrip.tsx', 'dot', /<i className="competition-dot" aria-hidden="true"\s+style=\{\{ backgroundColor: COMPETITIONS\[fixture\.competition\]\.color \}\} \/>/],
  ['components/FilterToggle.tsx', 'dot, where the colour is read', /const \{ name, color \} = COMPETITIONS\[competition\]/],
  ['components/FilterToggle.tsx', 'dot', /<i aria-hidden="true" className="competition-dot" style=\{shown \? \{ backgroundColor: color \} : undefined\} \/>/],
  ['components/LeagueTabs.tsx', 'dot', /<i className="league-tab-dot" aria-hidden="true" style=\{\{ '--comp-hue': COMPETITIONS\[key\]\.color \} as CSSProperties\} \/>/],
  ['components/ZonesKey.tsx', 'zone band', /className=\{`zone-mark zone-mark-\$\{shape\}`\}\s+data-band=\{zone\?\.band\}\s+style=\{zone\?\.color \? \(\{ '--zone-hue': zone\.color \} as CSSProperties\) : undefined\}\s+aria-hidden="true"\s+\/>/],
]

it('reads a competition’s colour only to draw a mark that carries no text: a dot or a zone band', () => {
  const files = globSync('**/*.{ts,tsx}', { cwd: src }).filter(file => file !== 'lib/competitions.ts')
  const remaining = new Map(files.map(file => [file, readFileSync(new URL(file, src), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')]))
  for (const [file, shape, pattern] of hueSites) {
    const source = remaining.get(file)!
    expect(source, `${file} ${shape}`).toMatch(pattern)
    remaining.set(file, source.replace(pattern, ''))
  }
  // With every site consumed, no file but the competitions list says "color" again, so no read
  // of a competition's or a zone's colour is left to become text ink or a fill behind text.
  for (const [file, source] of remaining) expect(source, file).not.toMatch(/\bcolor\b(?!-scheme)/i)
})
