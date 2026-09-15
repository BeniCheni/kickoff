import { describe, expect, it } from 'vitest'
import { SYNCABLE, type CompetitionKey } from '../src/lib/competitions'

describe('ESPN fixture paths', () => {
  it.each([
    ['uel', 'uefa.europa'],
    ['uecl', 'uefa.europa.conf'],
    ['supercoppa', 'ita.super_cup'],
    ['supercopa', 'esp.super_cup'],
  ] satisfies Array<[CompetitionKey, string]>)('%s enters SYNCABLE as %s', (key, code) => {
    expect(SYNCABLE).toContainEqual({ key, code })
  })
})
