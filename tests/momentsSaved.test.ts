import { expect, it } from 'vitest'
import { readSavedReferences, writeSavedReferences, SAVED_MOMENTS_KEY, type ReferenceStorage } from '../src/lib/momentsSaved'
const deny = (): never => { throw new Error('storage refused') }
it('storage getter and read refusal return reportable visit-only state', () => {
  for (const access of [deny, () => undefined, () => ({ getItem: deny, setItem() {} })]) {
    expect(readSavedReferences(access)).toEqual({ ids: [], persistence: 'visit-only', reason: 'read-refused' })
  }
})
it('write refusal, including failed unsave, retains this visit intent without claiming persistence', () => {
  const disk = new Map([[SAVED_MOMENTS_KEY, '["1","2"]']])
  const storage: ReferenceStorage = { getItem: key => disk.get(key) ?? null, setItem: deny }
  expect(readSavedReferences(() => storage).ids).toEqual(['1', '2'])
  expect(writeSavedReferences(['2'], () => storage)).toEqual({ ids: ['2'], persistence: 'visit-only', reason: 'write-refused' })
  expect(readSavedReferences(() => storage).ids).toEqual(['1', '2']) // Old reference really remains on disk.
  expect(writeSavedReferences([], deny).persistence).toBe('visit-only')
  expect(writeSavedReferences(['3'], () => undefined).persistence).toBe('visit-only')
  storage.setItem = (key, value) => { disk.set(key, value) }
  expect(writeSavedReferences(['2', '3'], () => storage).persistence).toBe('local')
  expect(readSavedReferences(() => storage).ids).toEqual(['2', '3'])
  expect(writeSavedReferences([], () => storage).persistence).toBe('local')
  expect(readSavedReferences(() => storage).ids).toEqual([])
})
it.each(['{', '{}', '[1]', '[""]', '[" padded "]'])('corrupt stored references are reportable: %s', raw => {
  expect(readSavedReferences(() => ({ getItem: () => raw, setItem() {} }))).toEqual({ ids: [], persistence: 'visit-only', reason: 'invalid-data' })
})
it('empty storage, duplicate references and invalid write arguments have explicit results', () => {
  expect(readSavedReferences(() => ({ getItem: () => null, setItem() {} })).persistence).toBe('local')
  expect(readSavedReferences(() => ({ getItem: () => '["1","1"]', setItem() {} })).ids).toEqual(['1'])
  expect(() => writeSavedReferences([''])).toThrow('trimmed IDs')
})
