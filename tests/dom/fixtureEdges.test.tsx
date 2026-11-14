import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FixtureRow } from '../../src/components/FixtureRow'
import type { Fixture } from '../../src/lib/schema'
import { edgeFixture } from '../fixtures/edgeFixtures'

/**
 * Statuses and venues the committed snapshot does not contain. The server string is what
 * Next renders; hydration must match it, which is also what the Vite client renders.
 */
function fixture(patch: Partial<Fixture>): Fixture {
  return edgeFixture(patch)
}

async function serverAndClient(row: Fixture) {
  const html = renderToString(<FixtureRow fixture={row} />)
  const host = document.createElement('div')
  host.innerHTML = html
  const recoverable: unknown[] = []
  await act(async () => {
    hydrateRoot(host, <FixtureRow fixture={row} />, {
      onRecoverableError(error) { recoverable.push(error) },
    })
  })
  expect(recoverable).toEqual([])
  expect(host.textContent).toBe(new DOMParser().parseFromString(html, 'text/html').body.textContent)
  return host.textContent ?? ''
}

describe('shared fixture row, server render and hydration', () => {
  it('says the league has not set a kickoff time', async () => {
    const text = await serverAndClient(fixture({ timeConfidence: 'tbd' }))
    expect(text).toContain('kickoff time not yet set by the league')
    expect(text).not.toMatch(/\d:\d\d/)
  })

  it('says the local time is unknown when the venue zone is missing', async () => {
    const text = await serverAndClient(fixture({ venue: undefined, venueTz: undefined }))
    expect(text).not.toContain('Ramón')
    const host = document.createElement('div')
    host.innerHTML = renderToString(<FixtureRow fixture={fixture({ venue: undefined, venueTz: undefined })} />)
    // The collapsed row omits the venue. Expanding is client state; the server HTML
    // still carries the unknown-local sentence inside the collapsed detail.
    expect(host.textContent).toContain('local time not known')
  })

  it.each([
    ['full_time', 'FT'],
    ['in_play', 'LIVE'],
    ['postponed', 'POSTPONED'],
    ['suspended', 'SUSPENDED'],
    ['abandoned', 'ABANDONED'],
  ] as const)('renders %s as %s', async (status, label) => {
    const text = await serverAndClient(fixture({
      status,
      result: status === 'full_time' || status === 'abandoned' ? { home: 1, away: 0 } : undefined,
    }))
    expect(text).toContain(label)
  })

  it('renders an extra-time final as AET with ESPN\'s score and no shootout', async () => {
    const text = await serverAndClient(fixture({
      status: 'after_extra_time',
      result: { home: 4, away: 3 },
    }))
    expect(text).toContain('AET')
    expect(text).toContain('4–3')
    expect(text).not.toContain('(2–4)')
    expect(text).not.toMatch(/\bFT\b/)
  })

  it('renders a penalty final as PENS with the shootout in brackets', async () => {
    const text = await serverAndClient(fixture({
      status: 'after_penalties',
      result: { home: 3, away: 3 },
      shootout: { home: 2, away: 4 },
    }))
    expect(text).toContain('PENS')
    expect(text).toContain('3–3 (2–4)')
    expect(text).not.toMatch(/\bFT\b/)
  })
})
