import { expect, it } from 'vitest'
import { readSavedReferences, writeSavedReferences, SAVED_MOMENTS_KEY, type ReferenceStorage } from '../src/lib/momentsSaved'
import { createMomentsQueue, momentsQueueReducer as reduce, queueIds, queueNeighbours } from '../src/lib/momentsQueue'
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
  expect(writeSavedReferences([''])).toEqual({ ids: [], persistence: 'visit-only', reason: 'invalid-data' })
})

it('a reference to an item missing from this edition survives the reducer round trip and the next write', () => {
  const disk = new Map([[SAVED_MOMENTS_KEY, '["missing-edition-item","1"]']])
  const storage: ReferenceStorage = { getItem: key => disk.get(key) ?? null, setItem: (key, value) => { disk.set(key, value) } }
  let s = reduce(createMomentsQueue(['1', '2']), { type: 'saved', ids: readSavedReferences(() => storage).ids })
  s = reduce(s, { type: 'filter', ids: ['1', '2'], savedOnly: true })
  expect(queueIds(s)).toEqual(['1']) // Eligibility only ever sees edition members.
  s = reduce(s, { type: 'saved', ids: [...s.saved, '2'] })
  expect(writeSavedReferences(s.saved, () => storage).ids).toEqual(['missing-edition-item', '1', '2'])
  expect(readSavedReferences(() => storage).ids).toContain('missing-edition-item')
})

it('large foreign saved sets persist uniquely without entering Saved-only navigation', () => {
  const foreign = Array.from({ length: 10000 }, (_, i) => `missing-${i}`)
  const refs = [...foreign, '__proto__', 'constructor', '2', '2']
  let raw: string | null = null
  const storage: ReferenceStorage = { getItem: () => raw, setItem: (_, value) => { raw = value } }
  let s = reduce(createMomentsQueue(['1', '2', '3']), { type: 'saved', ids: refs })
  s = reduce(s, { type: 'filter', ids: [...refs, '1', '3'], savedOnly: true })
  expect(s.saved).toHaveLength(10003)
  expect(queueIds(s)).toEqual(['2'])
  expect(queueNeighbours(s)).toEqual({ previous: null, next: '2' })
  s = reduce(s, { type: 'next' })
  expect(s.active).toBe('2')
  expect(queueNeighbours(s)).toEqual({ previous: null, next: null })
  for (let n = 0; n < 3; n++) {
    writeSavedReferences(s.saved, () => storage)
    s = reduce(s, { type: 'saved', ids: readSavedReferences(() => storage).ids })
    expect(s.saved).toHaveLength(10003) // No cap, but repeat writes do not accumulate duplicates.
    expect(queueIds(s)).toEqual(['2'])
  }
  const refused = writeSavedReferences(s.saved, () => ({ getItem: () => raw, setItem: deny }))
  expect(refused.reason).toBe('write-refused')
  expect(refused.ids).toEqual(s.saved)
})


it('row 58: invalid caller references are refused without throwing or writing; reducer shares the predicate', () => {
  let writes = 0
  const access = () => ({ getItem: () => null, setItem() { writes++ } })
  const input = ['1', '', ' padded ', '  ', 'missing', '1']
  const result = writeSavedReferences(input, access)
  expect(result).toEqual({ ids: ['1', 'missing'], persistence: 'visit-only', reason: 'invalid-data' })
  expect(writes).toBe(0)
  const state = reduce(createMomentsQueue(['1']), { type: 'saved', ids: input })
  expect(state.saved).toEqual(result.ids)
  expect(writeSavedReferences(state.saved, access).reason).toBeNull()
  expect(writes).toBe(1)
})
