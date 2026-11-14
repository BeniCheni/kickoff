import { beforeAll, describe, expect, it } from 'vitest'
import { build } from 'vite'
import { runInNewContext } from 'node:vm'
import { buildThemeBootstrap } from '../scripts/themeBootstrap'
import { parseLens } from '../src/lib/lens'
import { parseTheme, resolveTheme, themeStorageKey } from '../src/lib/theme'

let code: string
beforeAll(async () => { code = await buildThemeBootstrap() })

// Escaped legacy name keeps the literal-source removal audit distinct from old-link coverage.
const retiredLens = '\u0062roadcast'
function run(rawLens: string | null, stored: string | null, dark: boolean, hostile = false) {
  const dataset: Record<string, string> = {}
  const reads: string[] = []
  const environment = {
    URLSearchParams,
    window: { location: { search: rawLens === null ? '' : `?lens=${rawLens}` } },
    document: { documentElement: { dataset } },
    matchMedia: () => ({ matches: dark }),
    get localStorage() {
      if (hostile) throw new Error('storage access blocked')
      return { getItem: (key: string) => { reads.push(key); return stored } }
    },
  }
  runInNewContext(code, environment)
  expect(reads).toEqual(hostile ? [] : [themeStorageKey()])
  return dataset
}

describe('the generated head script executes the production lens/theme decision', () => {
  it('agrees across every current and legacy lens, stored choice and OS preference', () => {
    for (const lens of [null, 'ledger', 'poster', retiredLens, 'junk']) {
      for (const stored of [null, 'light', 'dark', 'junk']) {
        for (const dark of [false, true]) {
          expect(run(lens, stored, dark)).toEqual({
            lens: parseLens(lens), theme: resolveTheme(parseTheme(stored), dark),
          })
        }
      }
    }
  })
  it('runs before React even when storage access throws', () => {
    for (const lens of ['ledger', 'poster', retiredLens]) {
      for (const dark of [false, true]) {
        expect(run(lens, null, dark, true)).toEqual({
          lens: parseLens(lens), theme: resolveTheme(null, dark),
        })
      }
    }
  })
})

describe('the built document keeps its encoding declaration and pre-paint ordering', () => {
  it.each(['production', 'single'])('%s keeps the charset inside 1024 bytes and boot before styles/modules', async (mode) => {
    // Measure emitted HTML, including Vite's whitespace and every plugin, rather than
    // reconstructing an injected tag (the original estimate undercounted by five bytes).
    const result = await build({ mode, logLevel: 'silent', build: { write: false } })
    const bundle = Array.isArray(result) ? result[0] : result
    if (!bundle || !('output' in bundle)) throw new Error('Build produced no output')
    const entry = bundle.output.find((item) => item.type === 'asset' && item.fileName === 'index.html')
    if (!entry || entry.type !== 'asset') throw new Error('Build produced no index.html')
    const html = Buffer.from(entry.source).toString('utf8')
    const meta = html.match(/<meta\b[^>]*\bcharset\s*=\s*["']?utf-8["']?[^>]*>/i)
    expect(meta).not.toBeNull()
    const charsetEnd = Buffer.byteLength(html.slice(0, meta!.index! + meta![0].length))
    expect(charsetEnd).toBeLessThanOrEqual(1024)
    const boot = html.indexOf('<script data-kickoff-theme="">')
    const module = html.indexOf('<script type="module"')
    const styles = html.search(/<style\b|<link\b[^>]*\brel="stylesheet"/i)
    expect(boot).toBeGreaterThanOrEqual(0)
    expect(module).toBeGreaterThan(boot)
    expect(styles).toBeGreaterThan(boot)
  })
})
