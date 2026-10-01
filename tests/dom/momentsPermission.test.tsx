import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import App from '../../src/App'
import { MomentsPage } from '../../src/components/MomentsPage'
import { useMomentsSession } from '../../src/components/MomentsSessionProvider'
import type { Moment } from '../../src/lib/moments'
import { archivalEdition } from '../fixtures/moments/gallery'
import { createMockMomentsPlayer, currentMockPlayer } from '../harness/momentsPlayerMock'
import { installMatchMedia, installSelectionScroll, primeClock, tick, wake } from './rig'

const now = '2026-10-01T16:00:00Z'
// Fictional identity: never grant permission to an archival video.
const permitted: Moment = { ...archivalEdition[0]!, id: 'permission-test', source: {
  name: 'Fictional source', url: 'https://www.youtube.com/watch?v=S4Test00001',
  identity: { provider: 'youtube', videoId: 'S4Test00001' },
  content: { scope: 'highlights', description: 'Fictional content', verification: 'watched' },
  permissions: [{ use: 'embed', status: 'permitted', checkedAt: now, basis: 'Fictional acceptance record' }],
} }
let release: () => void
let session: NonNullable<ReturnType<typeof useMomentsSession>>
beforeEach(() => {
  installMatchMedia(); installSelectionScroll(); release = primeClock(new Date(now))
  window.history.replaceState(null, '', '/?tab=moments')
})
afterEach(() => { cleanup(); release(); vi.restoreAllMocks() })
function Probe() { session = useMomentsSession()!; return <MomentsPage /> }
function mount(moment: Moment) {
  const factory = vi.fn(createMockMomentsPlayer)
  render(<App momentsEdition={[moment]} momentsPlayer={factory} momentsRoute={<Probe />} />)
  fireEvent.click(screen.getByRole('button', { name: 'Open selection' }))
  return factory
}
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
const patchPermission = (patch: Partial<NonNullable<Moment['source']['permissions']>[number]>): Moment => ({ ...permitted,
  source: { ...permitted.source, permissions: [{ ...permitted.source.permissions![0]!, ...patch }] } })
const failing: Array<[string, Moment]> = [
  ['identity without permission', { ...permitted, source: { ...permitted.source, permissions: undefined } }],
  ...(['unknown', 'denied', 'revoked'] as const).map(status => [status, patchPermission({ status })] as [string, Moment]),
  ['expiry at now', patchPermission({ expiresAt: now })],
  ['expiry before now', patchPermission({ expiresAt: '2026-09-30T16:00:00Z' })],
  ['checked after now', patchPermission({ checkedAt: '2026-10-01T16:01:00Z' })],
  ['unverified', { ...permitted, source: { ...permitted.source, content: { ...permitted.source.content!, verification: 'unverified' } } }],
  ['unknown scope', { ...permitted, source: { ...permitted.source, content: { ...permitted.source.content!, scope: 'unknown' } } }],
  ['missing content', { ...permitted, source: { ...permitted.source, content: undefined } }],
  ['legacy link-only', { ...permitted, source: { name: 'Legacy', url: 'https://example.com/legacy' } }],
]
it('permitted identity offers Play and sends its id only on explicit intent', () => {
  const factory = mount(permitted)
  expect(factory).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy()
  expect(screen.getByRole('link', { name: /Open at/ }).hasAttribute('data-primary-action')).toBe(false)
  click('Play')
  expect(currentMockPlayer()!.reads.plays).toHaveLength(1)
  expect(currentMockPlayer()!.reads.plays[0]?.videoId).toBe('S4Test00001')
})
it.each(failing)('%s is link-only on stage and Cinema; direct play creates no attempt or adapter call', (_name, moment) => {
  const factory = mount(moment)
  const before = session.queue
  act(() => { session.play(); session.play(true) })
  expect(session.queue).toBe(before)
  expect(factory).not.toHaveBeenCalled()
  for (const cinema of [false, true]) {
    if (cinema) click('Enter Cinema')
    const area = document.querySelector(cinema ? '[data-moments-cinema]' : '.moments-stage-main')!
    expect(area.querySelector('[data-primary-action]')?.tagName).toBe('A')
    expect(area.querySelectorAll('a[href]')).toHaveLength(1)
    expect(area.querySelector('[data-player-status], [data-playback-recovery], [data-player-sentinel]')).toBeNull()
    expect(screen.queryByRole('button', { name: /^(Play|Retry|Replay|Pause)$/ })).toBeNull()
  }
  expect(document.querySelector('iframe, script[data-moments-youtube-api]')).toBeNull()
})
it.each(['playing', 'blocked', 'ended', 'loading'] as const)('expiry at next clock tick parks %s and blocks Play, Retry and Replay', status => {
  mount(patchPermission({ expiresAt: '2026-10-01T16:01:00Z' }))
  click('Play')
  const player = currentMockPlayer()!
  const request = player.reads.plays[0]!
  act(() => {
    if (status === 'blocked') player.emit({ ...request, event: 'failure', failure: { kind: 'owner-blocked', providerError: 150 } })
    else if (status !== 'loading') player.emit({ ...request, event: status, position: 12 })
  })
  click('Enter Cinema')
  tick(60_050)
  expect(session.queue.surface).toBe('stage')
  expect(document.querySelector('[data-moments-player-dialog]')?.getAttribute('data-placement')).toBe('parked')
  expect(document.querySelector('[data-player-sentinel], [data-playback-recovery], [data-player-status]')).toBeNull()
  expect(screen.queryByRole('button', { name: /^(Play|Retry|Replay|Pause)$/ })).toBeNull()
  const before = session.queue
  const reads = structuredClone(player.reads)
  act(() => { session.play(); session.play(true) })
  expect(session.queue).toBe(before)
  expect(player.reads).toEqual(reads)
  act(() => player.emit({ ...request, event: 'playing', position: 99 }))
  expect(session.queue.media[permitted.id]?.position).not.toBe(99)
})
it('focus catch-up observes a permission lapse after suspension', () => {
  mount(patchPermission({ expiresAt: '2026-10-01T16:01:00Z' }))
  wake(new Date('2026-10-01T16:05:00Z'))
  expect(screen.queryByRole('button', { name: 'Play' })).toBeNull()
})
