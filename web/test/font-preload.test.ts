import { describe, expect, it } from 'vitest'
import { unusedFontPreloads } from '../scripts/evidence.mjs'

const faces = [
  { family: 'Oswald', weight: '500', src: 'url("./fonts/oswald/Oswald.woff2")' },
  { family: 'Oswald', weight: '700', src: 'url("./fonts/oswald/Oswald.woff2")' },
  { family: 'Kickoff Mono', weight: '500', src: 'url("./fonts/kickoff-mono/KickoffMono-Medium.woff2")' },
  { family: 'Kickoff Mono', weight: '600', src: 'url("./fonts/kickoff-mono/KickoffMono-SemiBold.woff2")' },
  { family: 'Libre Caslon Text', weight: '400', src: 'url("./fonts/libre-caslon-text/LibreCaslonText-Regular.woff2")' },
]

const used = [
  { family: 'Oswald', weight: '700' },
  { family: 'Kickoff Mono', weight: '400' },
]

describe('an unused font preload', () => {
  it('passes the two files the pages preload, including mono at the nearest weight', () => {
    expect(unusedFontPreloads({
      preloads: [
        'https://page.example/fonts/oswald/Oswald.woff2',
        'https://page.example/fonts/kickoff-mono/KickoffMono-Medium.woff2',
      ],
      faces,
      used,
    })).toEqual([])
  })

  it('fails a preload no rendered text selects', () => {
    const caslon = 'https://page.example/fonts/libre-caslon-text/LibreCaslonText-Regular.woff2'
    expect(unusedFontPreloads({ preloads: [caslon], faces, used })).toEqual([caslon])
    const semibold = './fonts/kickoff-mono/KickoffMono-SemiBold.woff2'
    expect(unusedFontPreloads({ preloads: [semibold], faces, used })).toEqual([semibold])
  })
})
