import { expect, it } from 'vitest'
import { hasEmbedPermission, latestKnownAvailability, momentSchema, momentsSchema, youtubeIdFromUrl, youtubeVideoIdSchema } from '../src/lib/moments'
import { historicalObservations } from './fixtures/moments/historicalObservations'
const id = 'aB_cD-eF012'
const moment = {
  id: 'synthetic', category: 'highlights', fixtureId: 'synthetic:fixture', title: 'Synthetic moment',
  curatedAt: '2026-09-26T12:00:00Z',
  fixture: { home: { name: 'Synthetic home' }, away: { name: 'Synthetic away' }, competition: 'pl',
    kickoffUtc: '2026-09-25T12:00:00Z', timeConfidence: 'tbd', status: 'scheduled' },
  source: { name: 'Synthetic source', url: `https://www.youtube.com/watch?v=${id}`, identity: { provider: 'youtube', videoId: id },
    content: { scope: 'commentary-reaction', description: 'Synthetic content description', verification: 'unverified' } },
}
it('legacy fields, empty arrays and missing optional metadata remain valid without fabricated defaults', () => {
  expect(momentsSchema.parse([])).toEqual([])
  const parsed = momentSchema.parse({ ...moment, source: { name: 'Legacy link', url: 'https://example.com/legacy' } })
  expect(parsed.source.identity).toBeUndefined()
  expect(parsed.collections).toBeUndefined()
  expect(parsed.fixture.timeConfidence).toBe('tbd')
  expect(parsed.fixture.venueTz).toBeUndefined()
  expect(hasEmbedPermission(parsed.source, moment.curatedAt)).toBe(false)
})
it.each([`https://www.youtube.com/watch?v=${id}`, `https://youtube.com/watch?v=${id}`, `https://youtu.be/${id}`])('accepts allowlisted identity URL %s', url => {
  expect(youtubeIdFromUrl(url)).toBe(id)
  expect(momentSchema.parse({ ...moment, source: { ...moment.source, url } }).source.identity?.videoId).toBe(id)
})
it.each(['<iframe src="https://youtube.com">', 'short', 'aB_cD-eF01!', 'aB_cD-eF0123'])('rejects invalid video identity %s', value => {
  expect(youtubeVideoIdSchema.safeParse(value).success).toBe(false)
})
it.each([`http://youtube.com/watch?v=${id}`, `https://youtube.com.evil.test/watch?v=${id}`, `https://evil.test/?v=${id}`,
  `https://user@youtube.com/watch?v=${id}`, `https://youtube.com:444/watch?v=${id}`, `https://youtu.be/${id}/extra`,
  `https://youtube.com/watch?v=${id}&v=${id}`, `https://youtube.com/watch?v=${id}#fragment`,
  `https://youtube.com/embed/${id}`, `https://youtube.com/watch?v=${id}&redirect=https://evil.test`, 'javascript:alert(1)'])('rejects unallowlisted playback destination %s', url => {
  expect(youtubeIdFromUrl(url)).toBeNull()
  expect(() => momentSchema.parse({ ...moment, source: { ...moment.source, url } })).toThrow()
})
it('rejects mismatched identity, arbitrary embed HTML and ambiguous collection membership/order', () => {
  expect(() => momentSchema.parse({ ...moment, source: { ...moment.source, identity: { provider: 'youtube', videoId: 'zZ_zZ-zZ999' } } })).toThrow()
  expect(() => momentSchema.parse({ ...moment, source: { ...moment.source, embedHtml: '<iframe />' } })).toThrow()
  expect(() => momentSchema.parse({ ...moment, embedHtml: '<iframe />' })).toThrow()
  const member = { ...moment, collections: [{ id: 'edition', order: 0 }] }
  expect(() => momentsSchema.parse([member, { ...member, id: 'second' }])).toThrow('unique')
  expect(() => momentsSchema.parse([{ ...moment, collections: [{ id: 'edition', order: 0 }, { id: 'edition', order: 1 }] }])).toThrow('unique')
})
it('technical playback does not grant rights; explicit permission expires and revocation prevents eligibility', () => {
  const source = momentSchema.parse({ ...moment, source: { ...moment.source,
    content: { ...moment.source.content, verification: 'watched' },
    availability: [{ outcome: 'played', observedAt: moment.curatedAt, environment: 'Synthetic unit test', note: 'Synthetic playback' }] } }).source
  expect(hasEmbedPermission(source, moment.curatedAt)).toBe(false)
  const permission = { use: 'embed' as const, status: 'permitted' as const, checkedAt: moment.curatedAt,
    basis: 'Synthetic permission evidence', expiresAt: '2026-09-27T12:00:00Z' }
  expect(hasEmbedPermission({ ...source, permissions: [permission] }, moment.curatedAt)).toBe(true)
  expect(hasEmbedPermission({ ...source, permissions: [permission] }, permission.expiresAt)).toBe(false)
  expect(hasEmbedPermission({ ...source, permissions: [{ ...permission, status: 'revoked' }] }, moment.curatedAt)).toBe(false)
  expect(hasEmbedPermission({ ...source, permissions: [permission] }, '2026-09-25T12:00:00Z')).toBe(false)
  expect(hasEmbedPermission({ ...source, permissions: [permission] }, 'bad-date')).toBe(false)
})
it('D-09: historical observations stay with their source and unknown does not erase 150', () => {
  const blocked = historicalObservations.iBuTEywEQ6U!
  const unknown = { observedAt: '2026-09-26T12:00:00Z', outcome: 'unknown' as const, environment: 'Synthetic unit test', note: 'Unknown test outcome' }
  expect(latestKnownAvailability([...blocked.observations, unknown])?.providerError).toBe(150)
  expect(latestKnownAvailability(historicalObservations.sXAkBsEcXSo!.observations)?.outcome).toBe('played')
  expect(historicalObservations.pkEpLtePJm0!.scope).toBe('pkEpLtePJm0 is an Origi commentary-reaction reel, not a verified standalone goal clip')
  expect(latestKnownAvailability([])).toBeUndefined()
  expect(() => momentSchema.parse({ ...moment, source: { ...moment.source, availability: [{ ...unknown, providerError: 150 }] } })).toThrow('owner block')
})
