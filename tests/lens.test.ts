import { describe, expect, it } from 'vitest'
import { DEFAULT_LENS, LENSES, encodeLens, parseLens } from '../src/lib/lens'

describe('lens URL codec', () => {
  it('round-trips every lens through encode → parse', () => {
    for (const lens of LENSES) {
      expect(parseLens(encodeLens(lens))).toBe(lens)
    }
  })

  it('the default is Poster (v0.2.2) — the one lens that stays out of the URL', () => {
    expect(DEFAULT_LENS).toBe('poster')
    expect(encodeLens('poster')).toBeNull()
    expect(encodeLens('ledger')).toBe('ledger')
  })

  it('writes ?lens=ledger down and reads it back — Ledger is now the value that must survive', () => {
    const encoded = encodeLens('ledger')
    expect(encoded).toBe('ledger')
    expect(parseLens(encoded)).toBe('ledger')
    expect(parseLens('poster')).toBe('poster')
  })

  it('falls back to the default (poster) on junk input', () => {
    expect(parseLens(null)).toBe('poster')
    expect(parseLens('')).toBe('poster')
    expect(parseLens('x')).toBe('poster')
    expect(parseLens('LEDGER')).toBe('poster')
    expect(parseLens('\u0062roadcast')).toBe('poster')
    expect(parseLens('ledger ')).toBe('poster')
    expect(parseLens('ledger,poster')).toBe('poster')
  })

  it('puts Poster before Ledger in the pill and keyboard order', () => {
    expect(LENSES).toEqual(['poster', 'ledger'])
  })
})
