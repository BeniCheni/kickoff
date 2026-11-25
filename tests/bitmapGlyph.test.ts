import { describe, expect, it } from 'vitest'
import { isBitmapGlyph } from '../scripts/rendered-contrast.mjs'

describe('contrast sampler bitmap glyphs', () => {
  it('sets aside flags and emoji stars, and measures text-presentation marks', () => {
    for (const glyph of ['⭐', '🏴', '🇫🇷', '🇩🇪', '🇮🇹', '🇪🇸']) {
      expect(isBitmapGlyph(glyph), glyph).toBe(true)
    }
    for (const glyph of ['↗', '©', '®', '™', '▶', '→']) {
      expect(isBitmapGlyph(glyph), glyph).toBe(false)
    }
    expect(isBitmapGlyph('Open at source')).toBe(false)
    expect(isBitmapGlyph('⭐ text')).toBe(false)
    expect(isBitmapGlyph('▶\uFE0F')).toBe(true)
    expect(isBitmapGlyph('↗\uFE0F')).toBe(true)
  })
})
