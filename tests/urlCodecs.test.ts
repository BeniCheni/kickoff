import { describe, expect, it } from 'vitest'
import { COMPETITION_KEYS } from '../src/lib/competitions'
import { canonicalSearch, parseDateParam, parseOnlyParam } from '../src/lib/urlCodecs'

const TODAY = '2026-08-30'

describe('canonicalSearch — normalize the address without changing decoder semantics', () => {
  it('omits invalid and default values, including a date equal to today', () => {
    expect(canonicalSearch(`?lens=BROADCAST&date=${TODAY}&tab=fixtures&view=week&league=laliga`, TODAY)).toBe('')
    expect(canonicalSearch('?date=2026-02-30&tab=junk&view=junk&league=constructor', TODAY)).toBe('')
  })
  it('retains a real nondefault date and the cross-track competition filter', () => {
    expect(canonicalSearch('?only=pl,laliga&date=2026-09-15', TODAY)).toBe('?only=pl%2Claliga&date=2026-09-15')
  })
  it('keeps an explicitly empty selection and unknown parameters', () => {
    expect(canonicalSearch('?only=&campaign=friend&campaign=second&lens=poster', TODAY)).toBe('?only=&campaign=friend&campaign=second')
  })
  it('canonicalizes duplicate owned keys to the same first value the hook renders', () => {
    expect(canonicalSearch('?lens=ledger&lens=broadcast&only=pl,pl', TODAY)).toBe('?lens=ledger&only=pl')
  })
  it('is idempotent across defaults, junk, filters and all nondefault views', () => {
    for (const search of ['', '?lens=ledger&tab=table&league=pl&view=month', '?only=garbage', '?only=', '?date=2026-13-45&ref=a+b']) {
      const normalized = canonicalSearch(search, TODAY)
      expect(canonicalSearch(normalized, TODAY)).toBe(normalized)
    }
  })
})

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
