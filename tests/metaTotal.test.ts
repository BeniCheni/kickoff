import { describe, expect, it } from 'vitest'
import fixtures from '../src/data/fixtures.json'
import { META } from '../src/lib/fixtures'

/** The header prints this number as the count of fixtures. sync writes it as valid.length. */
describe('META.total', () => {
  it('equals the number of fixtures in the snapshot', () => {
    expect(META.total).toBe(fixtures.length)
  })
})
