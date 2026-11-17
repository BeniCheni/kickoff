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
