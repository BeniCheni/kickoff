import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'

/**
 * The clearing's removal audit, as a test. The implementation prompt's grep covered
 * src/, web/app/, web/test/ and tests/ outside tests/fixtures/. Occurrences that are
 * the tests of the removal are allowed here by file and reason; anything else fails.
 * The patterns are assembled so this file is not itself an occurrence.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const roots = ['src', 'web/app', 'web/test', 'tests']
const retired = ['broad', 'cast'].join('')
const glyph = String.fromCodePoint(0x1f4fa)
const needles = [
  retired,
  ['Month', 'View'].join(''),
  ['month', 'CellSummary'].join(''),
  ['add', 'Months'].join(''),
  ['Watch', 'Panel'].join(''),
  ['tv', 'New'].join(''),
  glyph,
]

const allowed: { file: string; needle: string; count: number; reason: string }[] = [
  { file: 'tests/lens.test.ts', needle: retired, count: 1, reason: 'The retired lens decodes to Poster.' },
  { file: 'tests/urlCodecs.test.ts', needle: retired, count: 1, reason: 'The retired lens is removed and the Step 0 pins stay.' },
  { file: 'tests/themeBootstrap.test.ts', needle: retired, count: 1, reason: 'The pre-paint script runs against the retired lens.' },
  { file: 'tests/dom/clearing.test.tsx', needle: retired, count: 1, reason: 'A cold load of the retired lens stays on Poster and does not touch its old theme key.' },
  { file: 'tests/dom/clearing.test.tsx', needle: glyph, count: 1, reason: 'The rendered page does not contain the retired TV glyph.' },
  { file: 'web/test/fixtures-table.test.tsx', needle: retired, count: 1, reason: 'Server markup is requested with the retired lens URL.' },
  { file: 'web/test/fixtures-table.test.tsx', needle: glyph, count: 1, reason: 'Server markup does not contain the retired TV glyph.' },
]

function filesUnder(rel: string): string[] {
  const out: string[] = []
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const abs = path.join(dir, name)
      const relPath = path.relative(root, abs)
      if (relPath === path.join('tests', 'fixtures') || relPath.startsWith(path.join('tests', 'fixtures') + path.sep)) continue
      if (name === 'node_modules' || name === '.next' || name === 'generated') continue
      const info = statSync(abs)
      if (info.isDirectory()) walk(abs)
      else if (info.isFile()) out.push(relPath)
    }
  }
  walk(path.join(root, rel))
  return out
}

function occurrences(text: string, needle: string): number {
  let count = 0
  let from = 0
  while (from <= text.length) {
    const at = text.indexOf(needle, from)
    if (at < 0) return count
    count += 1
    from = at + needle.length
  }
  return count
}

it('allows the retired names only where a test is the reason', () => {
  const found = new Map<string, number>()
  for (const rel of roots.flatMap(filesUnder)) {
    const text = readFileSync(path.join(root, rel), 'utf8')
    for (const needle of needles) {
      const count = occurrences(text, needle)
      if (count > 0) found.set(`${rel}\0${needle}`, count)
    }
  }
  for (const rule of allowed) {
    expect(rule.reason.length).toBeGreaterThan(0)
    const key = `${rule.file}\0${rule.needle}`
    expect(found.get(key) ?? 0, `${rule.file}: ${rule.reason}`).toBe(rule.count)
    found.delete(key)
  }
  expect([...found.keys()].sort()).toEqual([])
})
