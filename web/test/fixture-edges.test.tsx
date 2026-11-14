import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FixtureRow } from '../../src/components/FixtureRow'
import { edgeFixture } from '../../tests/fixtures/edgeFixtures'

/** Server markup only. Hydration stays on the root suite; web/ has no jsdom. */
function html(row: Parameters<typeof FixtureRow>[0]['fixture']) {
  return renderToStaticMarkup(<FixtureRow fixture={row} />)
}

describe('FixtureRow on Next\'s compiled React', () => {
  it('says the league has not set a kickoff time', () => {
    const text = html(edgeFixture({ timeConfidence: 'tbd' }))
    expect(text).toContain('kickoff time not yet set by the league')
    expect(text).not.toMatch(/\d:\d\d/)
  })

  it('says the local time is unknown when the venue zone is missing', () => {
    const text = html(edgeFixture({ venue: undefined, venueTz: undefined }))
    expect(text).toContain('local time not known')
  })

  it.each([
    ['full_time', 'FT'],
    ['in_play', 'LIVE'],
    ['postponed', 'POSTPONED'],
    ['suspended', 'SUSPENDED'],
    ['abandoned', 'ABANDONED'],
  ] as const)('renders %s as %s', (status, label) => {
    const text = html(edgeFixture({
      status,
      result: status === 'full_time' || status === 'abandoned' ? { home: 1, away: 0 } : undefined,
    }))
    expect(text).toContain(label)
  })

  it('renders an extra-time final as AET with ESPN\'s score and no shootout', () => {
    const text = html(edgeFixture({
      status: 'after_extra_time',
      result: { home: 4, away: 3 },
    }))
    expect(text).toContain('AET')
    expect(text).toContain('4–3')
    expect(text).not.toContain('(2–4)')
    expect(text).not.toMatch(/\bFT\b/)
  })

  it('renders a penalty final as PENS with the shootout in brackets', () => {
    const text = html(edgeFixture({
      status: 'after_penalties',
      result: { home: 3, away: 3 },
      shootout: { home: 2, away: 4 },
    }))
    expect(text).toContain('PENS')
    expect(text).toContain('3–3 (2–4)')
    expect(text).not.toMatch(/\bFT\b/)
  })
})
