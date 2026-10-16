import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FixtureRow } from '../../src/components/FixtureRow'
import type { Fixture } from '../../src/lib/schema'

/**
 * Statuses and venues the committed snapshot does not contain. The server string is what
 * Next renders; hydration must match it, which is also what the Vite client renders.
 */
function fixture(patch: Partial<Fixture>): Fixture {
  return {
    id: 'synthetic:1',
    competition: 'laliga',
    kickoffUtc: '2026-11-22T20:00:00.000Z',
    venue: 'Ramón Sánchez-Pizjuán',
    venueTz: 'Europe/Madrid',
    home: { name: 'Sevilla', sourceId: '1' },
    away: { name: 'Levante', sourceId: '2' },
    status: 'scheduled',
    timeConfidence: 'exact',
    source: { provider: 'espn', sourceId: '1', fetchedAt: '2026-10-15T22:27:12.832Z' },
    ...patch,
  }
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
})
