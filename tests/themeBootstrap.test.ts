import { beforeAll, describe, expect, it } from 'vitest'
import { build } from 'vite'
import { runInNewContext } from 'node:vm'
import { buildThemeBootstrap } from '../scripts/themeBootstrap'
import { parseLens } from '../src/lib/lens'
import { parseTheme, resolveTheme, themeStorageKey } from '../src/lib/theme'

let code: string
beforeAll(async () => { code = await buildThemeBootstrap() })

function run(rawLens: string | null, ordinary: string | null, broadcast: string | null, dark: boolean, hostile = false) {
  const dataset: Record<string, string> = {}
  const environment = {
    URLSearchParams,
    window: { location: { search: rawLens === null ? '' : `?lens=${rawLens}` } },
    document: { documentElement: { dataset } },
    matchMedia: () => ({ matches: dark }),
    get localStorage() {
      if (hostile) throw new Error('storage access blocked')
      return { getItem: (key: string) => key === themeStorageKey('broadcast') ? broadcast : ordinary }
    },
  }
  runInNewContext(code, environment)
  return dataset
}

describe('the generated head script executes the production lens/theme decision', () => {
  it('agrees across 160 lens × stored-choice × OS combinations', () => {
    for (const lens of [null, 'ledger', 'poster', 'broadcast', 'BROADCAST']) {
      for (const ordinary of [null, 'light', 'dark', 'junk']) {
        for (const broadcast of [null, 'light', 'dark', 'junk']) {
          for (const dark of [false, true]) {
            expect(run(lens, ordinary, broadcast, dark)).toEqual({
              lens: parseLens(lens),
              theme: resolveTheme(parseLens(lens), parseTheme(ordinary), parseTheme(broadcast), dark),
            })
          }
        }
      }
    }
  })

  it('runs before any React module, including when storage access throws', () => {
    for (const lens of ['ledger', 'poster', 'broadcast']) {
      for (const dark of [false, true]) {
        expect(run(lens, null, null, dark, true)).toEqual({
          lens, theme: resolveTheme(parseLens(lens), null, null, dark),
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
