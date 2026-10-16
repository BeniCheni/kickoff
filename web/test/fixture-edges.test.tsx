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
})
