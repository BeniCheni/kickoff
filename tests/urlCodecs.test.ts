import { describe, expect, it } from 'vitest'
import { COMPETITION_KEYS } from '../src/lib/competitions'
import { parseDateParam, parseOnlyParam } from '../src/lib/urlCodecs'

const TODAY = '2026-08-30'

describe('parseDateParam', () => {
  it('accepts a real calendar date', () => {
    expect(parseDateParam('2026-09-15', TODAY)).toBe('2026-09-15')
    expect(parseDateParam('2028-02-29', TODAY)).toBe('2028-02-29') // leap day
  })

  it('rejects date-shaped junk that used to crash the week view', () => {
    expect(parseDateParam('2026-13-45', TODAY)).toBe(TODAY)
    expect(parseDateParam('2026-02-30', TODAY)).toBe(TODAY)
    expect(parseDateParam('2026-00-10', TODAY)).toBe(TODAY)
    expect(parseDateParam('2026-02-29', TODAY)).toBe(TODAY) // not a leap year
  })

  it('rejects anything not date-shaped at all', () => {
    expect(parseDateParam('garbage', TODAY)).toBe(TODAY)
    expect(parseDateParam('2026-1-1', TODAY)).toBe(TODAY)
    expect(parseDateParam('', TODAY)).toBe(TODAY)
  })
})

describe('parseOnlyParam', () => {
  it('keeps valid keys and drops junk beside them', () => {
    expect(parseOnlyParam('pl,laliga')).toEqual(new Set(['pl', 'laliga']))
    expect(parseOnlyParam('pl,zebra,laliga')).toEqual(new Set(['pl', 'laliga']))
  })

  it('falls back to every competition when nothing valid survives — junk must not hide the calendar', () => {
    expect(parseOnlyParam('garbage')).toEqual(new Set(COMPETITION_KEYS))
    expect(parseOnlyParam('zebra,unicorn')).toEqual(new Set(COMPETITION_KEYS))
  })

  it('never accepts prototype-chain names as competitions', () => {
    // `'toString' in COMPETITIONS` is true; Object.hasOwn is not fooled.
    expect(parseOnlyParam('toString,valueOf,constructor')).toEqual(new Set(COMPETITION_KEYS))
    const twelve = COMPETITION_KEYS.slice(0, 12).join(',')
    const padded = parseOnlyParam(`${twelve},toString,valueOf`)
    expect(padded.size).toBe(12) // not 14 — the encoder must not think "all selected"
  })

  it('treats an empty param as an explicitly cleared selection', () => {
    expect(parseOnlyParam('')).toEqual(new Set())
  })
})
