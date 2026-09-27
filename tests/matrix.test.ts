import { mkdtempSync, realpathSync, rmSync, symlinkSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { themeStorageKey } from '../src/lib/theme'
import { parseMatrixArgs, resolveChromePath } from '../scripts/matrix/args'
import { classifyRequestUrl, mediaRequestFails } from '../scripts/matrix/classify'
import { positiveControlProblems, type ControlView } from '../scripts/matrix/control'
import { defaultConfig, momentsStateExample } from '../scripts/matrix/defaultConfig'
import { cellUrl, expandConfig } from '../scripts/matrix/expand'
import { GEOMETRY_EPSILON, boxDisjoint, boxInside, boxesIntersect, hitPoints } from '../scripts/matrix/geometry'
import { cellMatchesOnly, formatSummary, screenshotFileName } from '../scripts/matrix/names'
import { assertOutsideRepo, gitTopLevel } from '../scripts/matrix/safety'
import { themeInitScript } from '../scripts/matrix/themeScript'
import type { Box } from '../scripts/matrix/types'

const BASE = 'http://127.0.0.1:4180/'

describe('config expansion', () => {
  const cells = expandConfig(defaultConfig)

  it('expands the default config to the 72 core cells', () => {
    expect(cells).toHaveLength(72)
    const ids = new Set(cells.map((cell) => cell.id))
    expect(ids.size).toBe(72)
    for (const width of [360, 375, 390, 1000]) {
      for (const lens of ['ledger', 'poster', 'broadcast'] as const) {
        for (const theme of ['light', 'dark'] as const) {
          for (const tab of ['fixtures', 'table', 'moments'] as const) {
            expect(ids.has(`${width}-${lens}-${theme}-${tab}`)).toBe(true)
          }
        }
      }
    }
  })

  it('writes lens and tab with the app codecs, omitting Poster and Fixtures', () => {
    const poster = cells.find((cell) => cell.id === '390-poster-light-fixtures')
    const ledger = cells.find((cell) => cell.id === '390-ledger-dark-moments')
    const broadcast = cells.find((cell) => cell.id === '1000-broadcast-light-table')
    expect(poster).toBeDefined()
    expect(ledger).toBeDefined()
    expect(broadcast).toBeDefined()
    expect(cellUrl(BASE, poster!)).toBe('http://127.0.0.1:4180/')
    expect(cellUrl(BASE, ledger!)).toBe('http://127.0.0.1:4180/?lens=ledger&tab=moments')
    expect(cellUrl(BASE, broadcast!)).toBe('http://127.0.0.1:4180/?lens=broadcast&tab=table')
  })

  it('keeps an extra query and lets the cell lens win over a query lens', () => {
    const [cell] = expandConfig({
      slices: [{
        path: '/',
        viewports: [{ width: 390, height: 844 }],
        lenses: ['ledger'],
        tabs: ['fixtures'],
        themes: ['light'],
        query: { date: '2026-09-01', lens: 'broadcast', only: 'pl' },
      }],
    })
    expect(cell).toBeDefined()
    expect(cellUrl(BASE, cell!)).toBe('http://127.0.0.1:4180/?date=2026-09-01&only=pl&lens=ledger')
  })

  it('does not expand the Moments Cinema example into the default 72', () => {
    expect(cells.some((cell) => cell.state === 'cinema')).toBe(false)
    const example = expandConfig({ maxEmbeds: 1, slices: [momentsStateExample] })
    expect(example).toHaveLength(30)
    expect(example.every((cell) => cell.state === 'cinema' && cell.tab === 'moments')).toBe(true)
    expect(example.map((cell) => cell.width)).toEqual(expect.arrayContaining([768, 1100, 1250, 1440, 1920]))
    expect(example[0]?.actions).toEqual([
      { click: '[data-open-cinema]' },
      { waitFor: '[data-cinema]' },
    ])
  })

  it('rejects a duplicate id and a state that cannot be a file name', () => {
    const slice = {
      path: '/',
      viewports: [{ width: 390, height: 844 }],
      lenses: ['poster' as const],
      tabs: ['fixtures' as const],
      themes: ['light' as const],
    }
    expect(() => expandConfig({ slices: [slice, slice] })).toThrow(/duplicate cell/)
    expect(() => expandConfig({ slices: [{ ...slice, state: '../escape' }] })).toThrow(/slug/)
  })
})

describe('host classification', () => {
  it('splits app, fonts, media providers and everything else', () => {
    expect(classifyRequestUrl('http://127.0.0.1:4180/assets/app.js', BASE)).toBe('app')
    expect(classifyRequestUrl('http://localhost:4180/a', BASE)).toBe('app')
    expect(classifyRequestUrl('/src/main.tsx', BASE)).toBe('app')
    expect(classifyRequestUrl('https://fonts.googleapis.com/css2?family=Inter', BASE)).toBe('font')
    expect(classifyRequestUrl('https://fonts.gstatic.com/s/inter.woff2', BASE)).toBe('font')
    expect(classifyRequestUrl('https://fonts.example.com/x', BASE)).toBe('other-external')
    expect(classifyRequestUrl('https://youtube.com/watch?v=1', BASE)).toBe('media-provider')
    expect(classifyRequestUrl('https://www.youtube.com/embed/1', BASE)).toBe('media-provider')
    expect(classifyRequestUrl('https://www.youtube-nocookie.com/embed/1', BASE)).toBe('media-provider')
    expect(classifyRequestUrl('https://i.ytimg.com/vi/1/hqdefault.jpg', BASE)).toBe('media-provider')
    expect(classifyRequestUrl('https://ytimg.com/vi/1.jpg', BASE)).toBe('media-provider')
    expect(classifyRequestUrl('https://r1---sn-abc.googlevideo.com/videoplayback', BASE)).toBe('media-provider')
    expect(classifyRequestUrl('https://example.com/tracker', BASE)).toBe('other-external')
    expect(classifyRequestUrl('https://notyoutube.com/', BASE)).toBe('other-external')
    expect(classifyRequestUrl('https://youtube.com.evil.com/', BASE)).toBe('other-external')
  })

  it('fails a media host only when the cell did not declare play intent', () => {
    expect(mediaRequestFails('media-provider', false)).toBe(true)
    expect(mediaRequestFails('media-provider', true)).toBe(false)
    expect(mediaRequestFails('font', false)).toBe(false)
    expect(mediaRequestFails('other-external', false)).toBe(false)
  })
})

describe('box geometry', () => {
  const column: Box = { left: 0, top: 0, right: 500, bottom: 400 }
  const fitted: Box = { left: 0, top: 0, right: 500, bottom: 280 }
  const overhang: Box = { left: 0, top: 0, right: 591, bottom: 320 }
  const button: Box = { left: 520, top: 40, right: 720, bottom: 84 }
  const beside: Box = { left: 500, top: 40, right: 720, bottom: 84 }

  it('treats a 91px overhang as outside the column and across the queue', () => {
    expect(boxInside(overhang, column)).toBe(false)
    expect(boxDisjoint(overhang, [button])).toBe(false)
    expect(boxInside(fitted, column)).toBe(true)
    expect(boxDisjoint(fitted, [button])).toBe(true)
  })

  it('treats a shared edge as disjoint, and ignores subpixel slack only within epsilon', () => {
    expect(boxesIntersect(fitted, beside)).toBe(false)
    expect(boxesIntersect(
      { left: 0, top: 0, right: 500.4, bottom: 10 },
      { left: 500, top: 0, right: 700, bottom: 10 },
      GEOMETRY_EPSILON,
    )).toBe(false)
    expect(boxesIntersect(
      { left: 0, top: 0, right: 510, bottom: 10 },
      { left: 500, top: 0, right: 700, bottom: 10 },
      GEOMETRY_EPSILON,
    )).toBe(true)
    expect(boxInside(
      { left: 0, top: 0, right: 500.5, bottom: 10 },
      { left: 0, top: 0, right: 500, bottom: 20 },
      GEOMETRY_EPSILON,
    )).toBe(true)
    expect(boxInside(
      { left: 0, top: 0, right: 502, bottom: 10 },
      { left: 0, top: 0, right: 500, bottom: 20 },
      GEOMETRY_EPSILON,
    )).toBe(false)
  })

  it('rejects a zero-area box as inside', () => {
    expect(boxInside({ left: 1, top: 1, right: 1, bottom: 1 }, column)).toBe(false)
  })

  it('samples the centre and two inset points inside the visible box', () => {
    const points = hitPoints({ left: 10, top: 20, right: 110, bottom: 70 }, { width: 390, height: 844 })
    expect(points).toEqual([
      { x: 60, y: 45 },
      { x: 18, y: 28 },
      { x: 102, y: 62 },
    ])
    const clipped = hitPoints({ left: -20, top: 0, right: 30, bottom: 40 }, { width: 390, height: 844 })
    expect(clipped?.[0]).toEqual({ x: 15, y: 20 })
    expect(hitPoints({ left: 400, top: 0, right: 500, bottom: 40 }, { width: 390, height: 844 })).toBeNull()
  })
})

describe('file names and --only', () => {
  const cell = {
    id: '390-poster-dark-moments-cinema',
    width: 390,
    lens: 'poster' as const,
    theme: 'dark' as const,
    tab: 'moments' as const,
    state: 'cinema',
  }

  it('names screenshots from the cell id, including an optional state', () => {
    expect(screenshotFileName(cell)).toBe('390-poster-dark-moments-cinema.png')
    expect(screenshotFileName({ id: '1000-ledger-light-fixtures' })).toBe('1000-ledger-light-fixtures.png')
  })

  it('ANDs --only tokens against whole fields', () => {
    expect(cellMatchesOnly(cell, undefined)).toBe(true)
    expect(cellMatchesOnly(cell, '390,poster,dark')).toBe(true)
    expect(cellMatchesOnly(cell, 'cinema')).toBe(true)
    expect(cellMatchesOnly(cell, '390-poster-dark-moments-cinema')).toBe(true)
    expect(cellMatchesOnly(cell, '390,ledger')).toBe(false)
    expect(cellMatchesOnly(cell, '100')).toBe(false)
  })

  it('prints a one-line count and the failed reasons', () => {
    expect(formatSummary([
      { id: 'a', passed: true, reasons: [] },
      { id: 'b', passed: false, reasons: ['scrollWidth 412 !== innerWidth 390'] },
    ])).toBe('2 cells, 1 passed, 1 failed\nFAIL b\n  scrollWidth 412 !== innerWidth 390')
  })
})

describe('--out safety', () => {
  const repo = gitTopLevel()

  it('rejects a directory inside this worktree', () => {
    expect(() => assertOutsideRepo(path.join(repo, 'matrix-out'), repo)).toThrow(/inside the repo/)
    expect(() => assertOutsideRepo(repo, repo)).toThrow(/inside the repo/)
  })

  it('accepts a directory outside the worktree', () => {
    const outside = path.join(os.tmpdir(), 'kickoff-matrix-not-created')
    expect(assertOutsideRepo(outside, repo)).toBe(path.join(realpathSync(os.tmpdir()), 'kickoff-matrix-not-created'))
  })

  it('follows a symlink that points back into the worktree', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'kickoff-matrix-link-'))
    const link = path.join(dir, 'into-repo')
    symlinkSync(repo, link)
    try {
      expect(() => assertOutsideRepo(path.join(link, 'shots'), repo)).toThrow(/inside the repo/)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('theme init script', () => {
  it('writes Broadcast\'s own key and the shared key for the other lenses', () => {
    expect(themeStorageKey('broadcast')).toBe('kickoff-theme-broadcast')
    expect(themeInitScript('broadcast', 'light')).toBe(
      'try{if(window===window.top){localStorage.clear();localStorage.setItem("kickoff-theme-broadcast","light");}}catch(e){}',
    )
    expect(themeInitScript('poster', 'dark')).toBe(
      'try{if(window===window.top){localStorage.clear();localStorage.setItem("kickoff-theme","dark");}}catch(e){}',
    )
    expect(themeInitScript('ledger', 'light')).toBe(themeInitScript('poster', 'light'))
  })
})

describe('argv', () => {
  it('requires --url and --out', () => {
    expect(() => parseMatrixArgs(['--url', 'http://127.0.0.1:4180'])).toThrow(/--out is required/)
    expect(parseMatrixArgs(['--url', 'http://127.0.0.1:4180', '--out', '/tmp/out', '--screenshots', '--only', '390'])).toEqual({
      url: 'http://127.0.0.1:4180',
      out: '/tmp/out',
      config: undefined,
      only: '390',
      screenshots: true,
      chrome: undefined,
    })
  })

  it('resolves Chrome from the flag, then CHROME_PATH, then the Mac install', () => {
    expect(resolveChromePath('/bin/chrome', { CHROME_PATH: '/env/chrome' })).toBe('/bin/chrome')
    expect(resolveChromePath(undefined, { CHROME_PATH: '/env/chrome' })).toBe('/env/chrome')
    expect(resolveChromePath(undefined, {})).toBe('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
  })
})

describe('positive-control expectations', () => {
  const bad = (width: number, overrides: Partial<ControlView> = {}): ControlView => ({
    id: `${width}-poster-light-fixtures-bad`,
    state: 'bad',
    passed: false,
    reasons: [
      'geometry inside #player / #column: not inside',
      'geometry disjoint #player / .cue: intersects',
      'hit-test .cue: (648,40) hit div#player',
    ],
    scrollWidthPass: true,
    geometryPass: false,
    hitTestPass: false,
    ...overrides,
  })
  const good = (width: number): ControlView => ({
    id: `${width}-poster-light-fixtures-good`,
    state: 'good',
    passed: true,
    reasons: [],
    scrollWidthPass: true,
    geometryPass: true,
    hitTestPass: true,
  })
  const media: ControlView = {
    id: '390-poster-light-fixtures-media',
    state: 'media',
    passed: false,
    reasons: ['media-provider request: https://i.ytimg.com/vi/kickoff-matrix-probe/hqdefault.jpg'],
    scrollWidthPass: true,
    geometryPass: true,
    hitTestPass: true,
  }

  it('accepts a bad page that fails geometry and hit-test while page width holds', () => {
    expect(positiveControlProblems([bad(768), bad(1000), good(768), good(1000), media])).toEqual([])
  })

  it('rejects a bad page that only fails page width, or a check that misses', () => {
    expect(positiveControlProblems([
      bad(768, { scrollWidthPass: false, geometryPass: true, hitTestPass: true, passed: false }),
      bad(1000),
      good(768),
      good(1000),
      media,
    ]).join('\n')).toMatch(/page-width/)
    expect(positiveControlProblems([
      bad(768, { geometryPass: true }),
      bad(1000),
      good(768),
      good(1000),
      media,
    ]).join('\n')).toMatch(/geometry did not catch/)
    expect(positiveControlProblems([
      bad(768),
      bad(1000),
      good(768),
      good(1000),
      { ...media, passed: true, reasons: [] },
    ]).join('\n')).toMatch(/media-provider/)
  })
})
