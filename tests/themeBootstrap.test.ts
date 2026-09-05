import { beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
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

describe('the head prepend keeps the charset declaration inside the parser prescan', () => {
  it('leaves <meta charset> within the first 1024 bytes of index.html after injection', () => {
    // HTML's encoding prescan reads only the first 1024 bytes of the document, and
    // head-prepend puts the classic bootstrap ahead of <meta charset>. The budget is
    // index.html's own prelude plus the injected tag. Measured at v0.2.5: 648 bytes of
    // script, the declaration ending at byte 763 in both dist/ and dist-single/. If this
    // ever binds, inject after the charset meta instead of prepending the head.
    const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
    const meta = html.match(/<meta charset="[^"]+" \/>/)?.[0]
    expect(meta).toBeTruthy()
    const prelude = Buffer.byteLength(html.slice(0, html.indexOf(meta!) + meta!.length))
    const tag = Buffer.byteLength(`<script data-kickoff-theme="">${code}</script>\n`)
    expect(prelude + tag).toBeLessThanOrEqual(1024)
  })
})
