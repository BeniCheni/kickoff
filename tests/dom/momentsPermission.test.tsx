import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
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
function mount(moment: Moment, others: Moment[] = []) {
  const factory = vi.fn(createMockMomentsPlayer)
  render(<App momentsEdition={[moment, ...others]} momentsPlayer={factory} momentsRoute={<Probe />} />)
  fireEvent.click(screen.getAllByRole('button', { name: 'Open selection' })[0]!)
  return factory
}
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
const patchPermission = (patch: Partial<NonNullable<Moment['source']['permissions']>[number]>): Moment => ({ ...permitted,
  source: { ...permitted.source, permissions: [{ ...permitted.source.permissions![0]!, ...patch }] } })
const expiring = patchPermission({ expiresAt: '2026-10-01T16:01:00Z' })
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
  const beforeLapse = structuredClone(session.queue)
  expect(player.reads.retires).toBe(0)
  tick(60_050)
  expect(player.reads.retires).toBe(1)
  expect(session.queue.media[permitted.id]).toMatchObject({
    status: status === 'playing' || status === 'loading' ? 'paused' : status,
    position: beforeLapse.media[permitted.id]!.position,
    attempt: beforeLapse.media[permitted.id]!.attempt + 1,
  })
  expect(session.queue.history).toEqual(beforeLapse.history)
  expect(session.queue.remainder).toEqual(beforeLapse.remainder)
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
it.each(['[data-player-return]', 'iframe'])('a stage lapse hands focus from %s to the visible Cinema control', selector => {
  mount(patchPermission({ expiresAt: '2026-10-01T16:01:00Z' }))
  click('Play')
  const player = currentMockPlayer()!
  act(() => player.emit({ ...player.reads.plays[0]!, event: 'playing', position: 12 }))
  const focus = document.querySelector<HTMLElement>(selector)!
  focus.focus()
  expect(document.activeElement).toBe(focus)
  tick(60_050)
  const control = screen.getByRole('button', { name: 'Enter Cinema' })
  expect(document.activeElement).toBe(control)
  expect(control.closest('[inert], [hidden], [aria-hidden="true"]')).toBeNull()
  expect(player.reads.retires).toBe(1)
  expect(session.queue.media[permitted.id]).toMatchObject({ status: 'paused', position: 12, attempt: 2 })
})
it('a stage lapse leaves focus outside the host alone', () => {
  mount(patchPermission({ expiresAt: '2026-10-01T16:01:00Z' }))
  click('Play')
  const control = screen.getByRole('button', { name: /^Save reference:/ })
  control.focus()
  tick(60_050)
  expect(document.activeElement).toBe(control)
})
it.each(['stage', 'cinema'] as const)('a lapse before Play keeps the %s cover and attempt unchanged', surface => {
  const factory = mount(patchPermission({ expiresAt: '2026-10-01T16:01:00Z' }))
  if (surface === 'cinema') click('Enter Cinema')
  const control = screen.getByRole('button', { name: surface === 'cinema' ? 'Exit Cinema' : 'Enter Cinema' })
  control.focus()
  const before = structuredClone(session.queue)
  tick(60_050)
  expect(session.queue).toEqual(before)
  expect(session.queue.surface).toBe(surface)
  expect(document.activeElement).toBe(control)
  expect(control.closest('[inert], [hidden], [aria-hidden="true"]')).toBeNull()
  expect(screen.queryByRole('button', { name: /^(Play|Pause|Retry|Replay)$/ })).toBeNull()
  const area = document.querySelector(surface === 'cinema' ? '[data-moments-cinema]' : '.moments-stage-main')!
  expect(area.querySelector('[data-primary-action]')?.tagName).toBe('A')
  expect(factory).not.toHaveBeenCalled()
  expect(document.querySelector('iframe')).toBeNull()
  if (surface === 'cinema') {
    expect(document.querySelector('[data-moments-player-host]')?.hasAttribute('inert')).toBe(true)
    expect(document.querySelector('[data-moments-player-dialog]')?.hasAttribute('inert')).toBe(false)
  }
})
it.each(['owner', 'selection'] as const)('a parked frame under another selection is undisturbed by the %s lapse', lapsing => {
  const expiring = patchPermission({ expiresAt: '2026-10-01T16:01:00Z' })
  const first = lapsing === 'owner' ? expiring : permitted
  const second = { ...(lapsing === 'selection' ? expiring : permitted), id: 'permission-neighbour', title: 'Neighbour' }
  mount(first, [second])
  click('Play')
  const player = currentMockPlayer()!
  act(() => player.emit({ ...player.reads.plays[0]!, event: 'playing', position: 12 }))
  act(() => session.dispatch({ type: 'open', id: second.id }))
  click('Enter Cinema')
  const control = screen.getByRole('button', { name: 'Exit Cinema' })
  control.focus()
  const before = structuredClone(session.queue)
  const retires = player.reads.retires
  const frame = document.querySelector('iframe')
  tick(60_050)
  expect(session.queue).toEqual(before)
  expect(session.queue.surface).toBe('cinema')
  expect(player.reads.retires).toBe(retires)
  expect(document.querySelector('iframe')).toBe(frame)
  expect(document.activeElement).toBe(control)
  expect(document.querySelector('[data-moments-player-host]')?.hasAttribute('inert')).toBe(true)
})
it('focus catch-up observes a permission lapse after suspension', () => {
  mount(patchPermission({ expiresAt: '2026-10-01T16:01:00Z' }))
  wake(new Date('2026-10-01T16:05:00Z'))
  expect(screen.queryByRole('button', { name: 'Play' })).toBeNull()
})

function expectVisibleFocus(control: HTMLElement) {
  expect(document.activeElement).toBe(control)
  expect(control.isConnected).toBe(true)
  expect(control.closest('[inert], [hidden], [aria-hidden="true"]')).toBeNull()
  expect(getComputedStyle(control).display).not.toBe('none')
  expect(getComputedStyle(control).visibility).toBe('visible')
}
function playingExpiring() {
  mount(expiring)
  click('Play')
  const player = currentMockPlayer()!
  act(() => player.emit({ ...player.reads.plays[0]!, event: 'playing', position: 12 }))
  return player
}
it('removed stage Pause hands focus to Enter Cinema on lapse', () => {
  playingExpiring()
  const removed = screen.getByRole('button', { name: 'Pause' })
  removed.focus()
  tick(60_050)
  expect(removed.isConnected).toBe(false)
  expectVisibleFocus(screen.getByRole('button', { name: 'Enter Cinema' }))
})
it('removed stage cover Play hands focus to Enter Cinema on lapse', () => {
  const factory = mount(expiring)
  const removed = screen.getByRole('button', { name: 'Play' })
  removed.focus()
  tick(60_050)
  expect(removed.isConnected).toBe(false)
  expectVisibleFocus(screen.getByRole('button', { name: 'Enter Cinema' }))
  expect(factory).not.toHaveBeenCalled()
})
it('removed Cinema cover Play hands focus to Exit Cinema without changing attempt', () => {
  const factory = mount(expiring)
  click('Enter Cinema')
  const cinema = document.querySelector<HTMLElement>('[data-moments-cinema]')!
  const removed = within(cinema).getByRole('button', { name: 'Play' })
  removed.focus()
  const before = structuredClone(session.queue)
  tick(60_050)
  expect(removed.isConnected).toBe(false)
  expectVisibleFocus(within(cinema).getByRole('button', { name: 'Exit Cinema' }))
  expect(session.queue).toEqual(before)
  expect(session.queue.surface).toBe('cinema')
  expect(document.querySelector<HTMLDialogElement>('[data-moments-player-dialog]')!.open).toBe(true)
  expect(factory).not.toHaveBeenCalled()
})
it('removed live Cinema Pause retains the existing Enter Cinema hand-off', () => {
  playingExpiring()
  click('Enter Cinema')
  const cinema = document.querySelector<HTMLElement>('[data-moments-cinema]')!
  within(cinema).getByRole('button', { name: 'Pause' }).focus()
  tick(60_050)
  expectVisibleFocus(screen.getByRole('button', { name: 'Enter Cinema' }))
  expect(session.queue.surface).toBe('stage')
})
it('removed stage Retry hands focus to Enter Cinema on lapse', () => {
  const player = playingExpiring()
  act(() => player.emit({ ...player.reads.plays[0]!, event: 'failure', failure: { kind: 'owner-blocked', providerError: 150 } }))
  const removed = screen.getByRole('button', { name: 'Retry' })
  removed.focus()
  tick(60_050)
  expect(removed.isConnected).toBe(false)
  expectVisibleFocus(screen.getByRole('button', { name: 'Enter Cinema' }))
})
it('removed secondary source link hands focus to Enter Cinema on lapse', () => {
  playingExpiring()
  const removed = screen.getByRole('link', { name: /Open at/ })
  removed.focus()
  tick(60_050)
  expect(removed.isConnected).toBe(false)
  expectVisibleFocus(screen.getByRole('button', { name: 'Enter Cinema' }))
})
it('connected stage Save reference retains the same focus on lapse', () => {
  playingExpiring()
  const control = screen.getByRole('button', { name: /^Save reference:/ })
  control.focus()
  tick(60_050)
  expectVisibleFocus(control)
})
it('removed cover Play over another parked owner hands focus to Enter Cinema without retiring that frame', () => {
  const second = { ...expiring, id: 'permission-neighbour', title: 'Neighbour' }
  mount(permitted, [second])
  click('Play')
  const player = currentMockPlayer()!
  act(() => player.emit({ ...player.reads.plays[0]!, event: 'playing', position: 12 }))
  act(() => session.dispatch({ type: 'open', id: second.id }))
  const frame = document.querySelector('iframe')
  const firstMedia = structuredClone(session.queue.media[permitted.id])
  const reads = structuredClone(player.reads)
  const removed = screen.getByRole('button', { name: 'Play' })
  removed.focus()
  tick(60_050)
  expect(removed.isConnected).toBe(false)
  expectVisibleFocus(screen.getByRole('button', { name: 'Enter Cinema' }))
  expect(player.reads).toEqual(reads)
  expect(session.queue.media[permitted.id]).toEqual(firstMedia)
  expect(document.querySelector('iframe')).toBe(frame)
  expect(frame!.isConnected).toBe(true)
})
