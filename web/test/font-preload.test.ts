import { describe, expect, it } from 'vitest'
import { preloadsUnusedOnEveryPage, unusedFontPreloads } from '../scripts/evidence.mjs'

const faces = [
  { family: 'Oswald', weight: '500', src: 'url("./fonts/oswald/Oswald.woff2")' },
  { family: 'Oswald', weight: '700', src: 'url("./fonts/oswald/Oswald.woff2")' },
  { family: 'Kickoff Mono', weight: '500', src: 'url("./fonts/kickoff-mono/KickoffMono-Medium.woff2")' },
  { family: 'Kickoff Mono', weight: '600', src: 'url("./fonts/kickoff-mono/KickoffMono-SemiBold.woff2")' },
  { family: 'Libre Caslon Text', weight: '400', src: 'url("./fonts/libre-caslon-text/LibreCaslonText-Regular.woff2")' },
]

// document.fonts reports the face the browser applied. Weight 400 text in
// Kickoff Mono loads the 500 face, so the Medium file is the one that counts.
const loaded = [
  { family: 'Oswald', weight: '700', style: 'normal', status: 'loaded' },
  { family: 'Kickoff Mono', weight: '500', style: 'normal', status: 'loaded' },
]

describe('an unused font preload', () => {
  it('passes the two files the pages preload, including the mono face the browser loads', () => {
    expect(unusedFontPreloads({
      preloads: [
        'https://page.example/fonts/oswald/Oswald.woff2',
        'https://page.example/fonts/kickoff-mono/KickoffMono-Medium.woff2',
      ],
      faces,
      loaded,
    })).toEqual([])
  })

  it('fails a preload no rendered text selects', () => {
    const caslon = 'https://page.example/fonts/libre-caslon-text/LibreCaslonText-Regular.woff2'
    expect(unusedFontPreloads({ preloads: [caslon], faces, loaded })).toEqual([caslon])
    const semibold = './fonts/kickoff-mono/KickoffMono-SemiBold.woff2'
    expect(unusedFontPreloads({ preloads: [semibold], faces, loaded })).toEqual([semibold])
  })

  it('fails a preload no measured page selects, and keeps one a single tab leaves unused', () => {
    const caslon = 'https://page.example/fonts/libre-caslon-text/LibreCaslonText-Regular.woff2'
    const mono = 'https://page.example/fonts/kickoff-mono/KickoffMono-Medium.woff2'
    expect(preloadsUnusedOnEveryPage([
      { preloads: [caslon, mono], unused: [caslon] },
      { preloads: [caslon, mono], unused: [caslon, mono] },
    ])).toEqual([caslon])
  })

  it('fails a Caslon preload when the only Caslon text is hidden', () => {
    const caslon = 'https://page.example/fonts/libre-caslon-text/LibreCaslonText-Regular.woff2'
    // The walker records the computed family. document.fonts leaves the face unloaded.
    const usage = {
      preloads: [caslon],
      faces,
      used: [{ family: 'Libre Caslon Text', weight: '400' }],
      loaded: [] as { family: string, weight: string, style: string, status: string }[],
    }
    expect(unusedFontPreloads(usage)).toEqual([caslon])
  })

  it('fails the latin-ext preload when both halves are loaded and the page is latin text', () => {
    const latin = 'https://page.example/fonts/oswald/Oswald.woff2'
    const ext = 'https://page.example/fonts/oswald/Oswald-ext.woff2'
    const split = [
      { family: 'Oswald', style: 'normal', weight: '600', src: `url("${latin}")`, unicodeRange: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' },
      { family: 'Oswald', style: 'normal', weight: '600', src: `url("${ext}")`, unicodeRange: 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF' },
    ]
    // Chrome reports both FontFace entries loaded when both halves were preloaded.
    const loadedBoth = [
      { family: 'Oswald', weight: '600', style: 'normal', status: 'loaded' },
      { family: 'Oswald', weight: '600', style: 'normal', status: 'loaded' },
    ]
    const text = [{ family: 'Oswald', style: 'normal', chars: 'Kickoff' }]
    expect(unusedFontPreloads({ preloads: [latin, ext], faces: split, loaded: loadedBoth, text })).toEqual([ext])
    expect(unusedFontPreloads({
      preloads: [latin, ext],
      faces: split,
      loaded: loadedBoth,
      text: [{ family: 'Oswald', style: 'normal', chars: 'Şükrü Saracoğlu' }],
    })).toEqual([])
  })

  it("does not let one app's use clear the other's miss", () => {
    const mono = 'https://page.example/fonts/kickoff-mono/KickoffMono-Medium.woff2'
    expect(preloadsUnusedOnEveryPage([
      { app: 'vite', preloads: [mono], unused: [] },
      { app: 'next', preloads: [mono], unused: [mono] },
    ])).toEqual([`next ${mono}`])
  })

  it('measures poster and ledger, and passes Caslon when only ledger renders it', async () => {
    const evidence = await import('../scripts/evidence.mjs')
    expect(typeof evidence.coldLoadTargets).toBe('function')
    const targets = evidence.coldLoadTargets(['vite', 'next'])
    expect(targets).toHaveLength(24)
    for (const tab of ['fixtures', 'table', 'moments']) {
      expect(targets.filter((target) => target.tab === tab && target.lens === 'ledger')).toHaveLength(4)
    }
    const caslon = 'https://page.example/fonts/libre-caslon-text/LibreCaslonText-Regular.woff2'
    const pages = targets.filter((target) => target.app === 'vite' && target.tab === 'fixtures').map((target) => ({
      app: target.app,
      preloads: [caslon],
      unused: target.lens === 'ledger' ? [] : [caslon],
    }))
    expect(pages.some((page) => page.unused.length === 0)).toBe(true)
    expect(preloadsUnusedOnEveryPage(pages)).toEqual([])
  })
})
