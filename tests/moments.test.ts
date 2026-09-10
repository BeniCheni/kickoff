import { describe, expect, it } from 'vitest'
import raw from '../src/curated/moments.json'
import { FIXTURES } from '../src/lib/fixtures'
import { MOMENT_CATEGORIES, momentsSchema, parseMoments, type Moment } from '../src/lib/moments'

const fixture = FIXTURES.find(f => f.id.startsWith('ucl:'))!
const moment: Moment = {
  id: 'illustrative-preview', category: 'prematch', fixtureId: fixture.id,
  title: 'Illustrative preview', source: { name: 'Rights holder', url: 'https://example.com/preview' },
  curatedAt: '2026-09-10T12:00:00Z', fixture,
}
describe('curated Moments boundary', () => {
  it('validates the committed empty file against the committed fixtures', () => {
    expect(parseMoments(raw, FIXTURES)).toEqual([])
  })
  it.each(MOMENT_CATEGORIES)('accepts %s with or without a credited still', category => {
    expect(momentsSchema.parse([{ ...moment, category }])).toHaveLength(1)
    expect(momentsSchema.parse([{ ...moment, category, still: { url: 'https://example.com/still.jpg', credit: 'Rights holder' } }])).toHaveLength(1)
  })
  it('rejects duplicate ids, unsafe URLs, bad clocks and uncredited stills', () => {
    expect(() => momentsSchema.parse([moment, moment])).toThrow('unique')
    for (const url of ['javascript:alert(1)', 'data:text/html,no', '/relative']) {
      expect(() => momentsSchema.parse([{ ...moment, source: { ...moment.source, url } }])).toThrow()
    }
    expect(() => momentsSchema.parse([{ ...moment, fixture: { ...fixture, venueTz: 'not/a-zone' } }])).toThrow()
    expect(() => momentsSchema.parse([{ ...moment, still: { url: 'https://example.com/still.jpg' } }])).toThrow()
    expect(() => momentsSchema.parse([{ ...moment, curatedAt: 'yesterday' }])).toThrow()
  })
  it('retains the denormalised match after it leaves the rolling snapshot', () => {
    const [saved] = parseMoments([moment], [])
    expect(saved?.fixture.home).toEqual(fixture.home)
    expect(saved?.fixture.kickoffUtc).toBe(fixture.kickoffUtc)
  })
  it('reports disagreement rather than overwriting the curation', () => {
    expect(parseMoments([moment], [fixture])).toHaveLength(1)
    for (const changed of [{ home: { ...fixture.home, name: 'Wrong club' } }, { kickoffUtc: '2026-09-11T12:00:00Z' }, { venueTz: 'Asia/Tokyo' }, { timeConfidence: 'tbd' }]) {
      expect(() => parseMoments([{ ...moment, fixture: { ...fixture, ...changed } }], [fixture])).toThrow(/disagrees with fixture/)
    }
    expect(moment.fixture).toBe(fixture)
  })
  it('does not invalidate a preview when the live fixture naturally reaches full time', () => {
    expect(parseMoments([moment], [{ ...fixture, status: 'full_time' }])).toHaveLength(1)
  })
})
