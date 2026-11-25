import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('two-club specimen', () => {
  it('gives the clubs complementary records over the two rounds they play', () => {
    const src = readFileSync('tests/harness/states.tsx', 'utf8')
    const block = src.slice(src.indexOf('globalThis.__kickoffSpecimen'), src.indexOf('function frozenClock'))
    const calls = [...block.matchAll(/standing\(\s*'synth-(unset|kicked)'[^)]*?,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g)]
    expect(calls.map((call) => call[1])).toEqual(['unset', 'kicked'])
    const clubs = calls.map((call) => {
      const w = Number(call[3])
      const d = Number(call[4])
      const l = Number(call[5])
      return { w, d, l, played: w + d + l, gf: 2 * w + d, ga: 2 * l + d }
    })
    expect(clubs.every((club) => club.played === 2)).toBe(true)
    expect(clubs[0]!.w).toBe(clubs[1]!.l)
    expect(clubs[1]!.w).toBe(clubs[0]!.l)
    expect(clubs[0]!.d).toBe(clubs[1]!.d)
    expect(clubs[0]!.gf).toBe(clubs[1]!.ga)
    expect(clubs[0]!.ga).toBe(clubs[1]!.gf)
    expect(src).toContain('data-open="Specimen Unset"')
    expect(src).toContain('data-open="Specimen Kicked"')
  })
})
