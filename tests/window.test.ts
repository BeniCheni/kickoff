import { describe, expect, it } from 'vitest'
import { inWindow } from '../scripts/window'

describe('sync window — inclusive Brooklyn dates rather than UTC slices', () => {
  it.each([
    ['2026-09-05T00:30:00.000Z', '2026-09-05', false],
    ['2026-09-05T03:59:59.999Z', '2026-09-05', false],
    ['2026-09-05T04:00:00.000Z', '2026-09-05', true],
    ['2026-09-06T00:30:00.000Z', '2026-09-05', true],
    ['2026-09-06T03:59:59.999Z', '2026-09-05', true],
    ['2026-09-06T04:00:00.000Z', '2026-09-05', false],
    ['2026-11-02T04:59:59.999Z', '2026-11-02', false],
    ['2026-11-02T05:00:00.000Z', '2026-11-02', true],
    ['2026-11-03T04:59:59.999Z', '2026-11-02', true],
    ['2026-11-03T05:00:00.000Z', '2026-11-02', false],
  ])('%s belongs to %s: %s', (kickoffUtc, day, expected) => {
    expect(inWindow({ kickoffUtc }, day, day)).toBe(expected)
  })

  it('uses each boundary instant’s offset across the fall DST transition', () => {
    const from = '2026-10-31', to = '2026-11-02'
    expect(inWindow({ kickoffUtc: '2026-10-31T03:59:59.999Z' }, from, to)).toBe(false)
    expect(inWindow({ kickoffUtc: '2026-10-31T04:00:00.000Z' }, from, to)).toBe(true)
    expect(inWindow({ kickoffUtc: '2026-11-03T04:59:59.999Z' }, from, to)).toBe(true)
    expect(inWindow({ kickoffUtc: '2026-11-03T05:00:00.000Z' }, from, to)).toBe(false)
  })
})
