import { describe, expect, it } from 'vitest'
import { LENSES, encodeLens, parseLens } from '../src/lib/lens'

describe('lens URL codec', () => {
  it('round-trips every lens through encode → parse', () => {
    for (const lens of LENSES) {
      expect(parseLens(encodeLens(lens))).toBe(lens)
    }
  })

  it('omits the default (ledger) from the URL and keeps the others', () => {
    expect(encodeLens('ledger')).toBeNull()
    expect(encodeLens('poster')).toBe('poster')
    expect(encodeLens('broadcast')).toBe('broadcast')
  })

  it('falls back to ledger on junk input', () => {
    expect(parseLens(null)).toBe('ledger')
    expect(parseLens('')).toBe('ledger')
    expect(parseLens('x')).toBe('ledger')
    expect(parseLens('LEDGER')).toBe('ledger')
    expect(parseLens('Broadcast')).toBe('ledger')
    expect(parseLens('poster ')).toBe('ledger')
    expect(parseLens('poster,broadcast')).toBe('ledger')
  })
})
