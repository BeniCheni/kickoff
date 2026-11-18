import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

const css = readFileSync(new URL('../src/shell.css', import.meta.url), 'utf8')

type Rule = { selectors: string[]; body: string }

/** Rules of one nesting level: `a, b { … }` with no braces inside the body. */
function rules(source: string): Rule[] {
  return [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selectors: match[1]!.replace(/\/\*[\s\S]*?\*\//g, '').split(',').map((selector) => selector.trim().replace(/\s+/g, ' ')).filter(Boolean),
    body: match[2]!,
  }))
}

/** The bodies of every `@media (prefers-reduced-motion: reduce)` block, and the sheet without any @media block. */
function split(source: string): { reduced: string; plain: string } {
  let reduced = ''
  let plain = ''
  let index = 0
  while (index < source.length) {
    const at = source.indexOf('@media', index)
    if (at === -1) { plain += source.slice(index); break }
    plain += source.slice(index, at)
    const open = source.indexOf('{', at)
    let depth = 1
    let cursor = open + 1
    while (depth > 0) {
      if (source[cursor] === '{') depth += 1
      if (source[cursor] === '}') depth -= 1
      cursor += 1
    }
    if (/prefers-reduced-motion:\s*reduce/.test(source.slice(at, open))) reduced += source.slice(open + 1, cursor - 1)
    index = cursor
  }
  return { reduced, plain }
}

const { reduced, plain } = split(css)
// The lens cross-fade is a class the controller adds, and it does not add it under
// reduced motion (useThemeController). Every other transition is a state change.
const CONTROLLER_OWNED = new Set(['.lens-switching', '.lens-switching *'])
const moving = rules(plain).filter((rule) => /(^|[;\s])transition(-duration)?\s*:/.test(rule.body))
  .flatMap((rule) => rule.selectors).filter((selector) => !CONTROLLER_OWNED.has(selector))
const stilled = rules(reduced).filter((rule) => /transition:\s*none/.test(rule.body)).flatMap((rule) => rule.selectors)

it('every transition the chrome declares is stopped when the system asks for reduced motion', () => {
  expect(moving).toEqual(expect.arrayContaining(['.theme-disc', '.lens-switch button span', '.imprint-tabs button']))
  for (const selector of moving) expect(stilled, `${selector} keeps its transition under reduced motion`).toContain(selector)
})

it('the chrome keeps to the state budget: 150, 180 and 220 ms', () => {
  const durations = [...plain.matchAll(/transition[^;{}]*;/g)].flatMap((match) => match[0].match(/\d+ms/g) ?? [])
  expect(durations.length).toBeGreaterThan(0)
  for (const duration of durations) expect(['150ms', '180ms', '220ms']).toContain(duration)
})
