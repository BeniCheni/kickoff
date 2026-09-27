import { expect, it } from 'vitest'
import { momentSchema } from '../src/lib/moments'
import { knownKickoff, momentTitle, newestMoments } from '../src/lib/momentsGallery'
import { archivalEdition, fictionalEdition } from './fixtures/moments/gallery'

it('Newest uses verified fixture chronology, stable editorial ties and no curation/upload ordering', () => {
  const base = archivalEdition[0]!
  const item = (id: string, kickoffUtc: string, known = true) => ({ ...base, id,
    curatedAt: id === 'old' ? '2026-09-27T12:00:00Z' : '2020-01-01T12:00:00Z',
    fixture: { ...base.fixture, kickoffUtc, timeConfidence: known ? 'exact' as const : 'tbd' as const } })
  const edition = [item('unknown1', '2030-01-01T12:00:00Z', false), item('old', '2000-01-01T12:00:00Z'),
    item('new1', '2025-01-01T12:00:00Z'), item('unknown2', '2035-01-01T12:00:00Z', false), item('new2', '2025-01-01T12:00:00Z')]
  expect(newestMoments(edition)).toEqual(['new1', 'new2', 'old', 'unknown1', 'unknown2'])
  expect(knownKickoff({ ...edition[1]!, fixture: { ...edition[1]!.fixture, status: 'postponed' as const } })).toBe(false)
  expect(knownKickoff({ ...edition[1]!, fixture: { ...edition[1]!.fixture, status: 'cancelled' as const } })).toBe(false)
})
it('fictional queue inputs carry no fixture, competition, source or cover identity', () => {
  for (const item of fictionalEdition) {
    expect(item.fixture).toBeUndefined(); expect(item.source).toBeUndefined(); expect(item.editorial).toBeUndefined()
    expect(item.illustration.label).toContain('Fictional')
  }
  expect(newestMoments(fictionalEdition)).toEqual(['6', '5', '4', '3', '2', '1'])
})
it('cover families are explicit authored choices; unknown values fail and missing neutral titles do not leak', () => {
  const base = archivalEdition[0]!
  for (const cover of ['voices', 'seven', 'together']) expect(momentSchema.safeParse({ ...base, editorial: { ...base.editorial, cover } }).success).toBe(true)
  expect(momentSchema.safeParse({ ...base, editorial: { ...base.editorial, cover: 'unknown' } }).success).toBe(false)
  expect(momentTitle({ ...base, editorial: undefined }, true)).toBe('A moment from this fixture')
})
