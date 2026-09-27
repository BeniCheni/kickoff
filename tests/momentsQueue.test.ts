import { describe, expect, it } from 'vitest'
import { createMomentsQueue, momentsQueueReducer as reduce, queueIds, queueNeighbours, type MomentsQueue, type QueueAction } from '../src/lib/momentsQueue'
const ids = ['1', '2', '3', '4', '5', '6'] // Synthetic IDs, no football claims.
const run = (state: MomentsQueue, ...actions: QueueAction[]) => actions.reduce(reduce, state)
const open = (id: string): QueueAction => ({ type: 'open', id })
const shuffle: QueueAction = { type: 'shuffle', seed: 'equal-seed' }
const provider = (s: MomentsQueue, event: 'playing' | 'paused' | 'ended' | 'position', position?: number) =>
  reduce(s, { type: 'provider', id: s.active!, attempt: s.media[s.active!]!.attempt, event, position })

it('D-01: advance, complete, backtrack, Undo preserves new history, cursor, positions and completion', () => {
  let s = run(createMomentsQueue(ids), open('1'), { type: 'next' }, shuffle, { type: 'next' }, { type: 'next' }, { type: 'play' })
  s = provider(provider(s, 'playing'), 'ended', 15)
  s = run(s, { type: 'previous' }, { type: 'previous' })
  const after = reduce(s, { type: 'undo' })
  expect(after.history).toHaveLength(4)
  expect(after.history).toEqual(s.history)
  expect(after.active).toBe(s.active)
  expect(after.media).toEqual(s.media)
  expect(queueIds(after).indexOf(after.active!)).toBe(queueIds(s).indexOf(s.active!))
  expect(after.remainder).toEqual(ids.filter(id => !s.history.includes(id)))
  expect(after.undo).toBeNull()
})
it('D-01: simple shuffle Undo restores the prior unvisited order', () => {
  const before = run(createMomentsQueue(ids), { type: 'order', ids: [...ids].reverse() }, open('6'))
  expect(reduce(reduce(before, shuffle), { type: 'undo' }).remainder).toEqual(before.remainder)
})
it('D-02: save/unsave with Saved-only off preserves deliberate order and Undo', () => {
  const s = run(createMomentsQueue(ids), open('1'), shuffle)
  const after = run(s, { type: 'saved', ids: ['1'] }, { type: 'saved', ids: [] })
  expect(after).toEqual(s)
  expect(after.undo).toBe(s.undo)
})
it.each([['6', ['6', '1', '2', '3', '4', '5']], ['4', ['4', '1', '2', '3', '5', '6']]])(
  'D-03/D-10: Newest open %s then Restore rebuilds canonical remainder', (id, expected) => {
    const s = run(createMomentsQueue(ids), { type: 'order', ids: [...ids].reverse() }, open(id as string), shuffle, { type: 'restore' })
    expect(queueIds(s)).toEqual(expected)
    expect(s.mode).toBe('editorial')
    expect(s.seed).toBeNull()
  })
it('D-05: equal seed/pool/history ignores prior sort, shuffles and repeat clicks', () => {
  const a = run(createMomentsQueue(ids), open('1'), shuffle)
  const b = run(createMomentsQueue(ids), { type: 'order', ids: [...ids].reverse() }, open('1'),
    { type: 'shuffle', seed: 'other' }, { type: 'restore' }, shuffle)
  expect(a.remainder).toEqual(b.remainder)
  expect(reduce(a, shuffle)).toBe(a) // Repeat preserves the useful Undo as well.
  expect(new Set(a.remainder).size).toBe(5)
  expect(a.remainder).not.toContain('1')
})
it('D-08: every recovery destination is the actual Next/Previous destination, or null', () => {
  let s = run(createMomentsQueue(ids), { type: 'order', ids: [...ids].reverse() }, open('6'))
  const changes: QueueAction[] = [shuffle, { type: 'undo' }, { type: 'restore' },
    { type: 'filter', ids: ['6', '2'], savedOnly: false }, { type: 'filter', ids: ['6'], savedOnly: false }]
  for (const action of changes) {
    s = reduce(s, action)
    for (const direction of ['next', 'previous'] as const) {
      const target = queueNeighbours(s)[direction]
      const after = reduce(s, { type: direction })
      if (target === null) expect(after).toBe(s)
      else expect(after.active).toBe(target)
    }
  }
  expect(queueNeighbours(s).next).toBeNull()
})
it('D-09: failure is item-owned; unknown never replaces owner block 150', () => {
  let s = run(createMomentsQueue(ids), open('1'), { type: 'play' })
  const attempt = s.media['1']!.attempt
  s = reduce(s, { type: 'failure', id: '1', attempt, failure: { kind: 'owner-blocked', providerError: 150 } })
  s = reduce(s, { type: 'failure', id: '1', attempt, failure: { kind: 'unknown' } })
  expect(s.media['1']!.status).toBe('blocked')
  expect(s.media['1']!.failure).toEqual({ kind: 'owner-blocked', providerError: 150 })
  s = reduce(s, { type: 'play' })
  s = reduce(s, { type: 'failure', id: '1', attempt: s.media['1']!.attempt, failure: { kind: 'unknown' } })
  expect(s.media['1']!.failure?.providerError).toBe(150)
  s = run(s, open('2'), { type: 'play' })
  expect(s.media['2']!.failure).toBeUndefined()
  const before = s
  s = reduce(s, { type: 'failure', id: '1', attempt, failure: { kind: 'unknown' } })
  expect(s).toBe(before)
  s = reduce(s, { type: 'failure', id: '2', attempt: s.media['2']!.attempt, failure: { kind: 'unknown' } })
  expect(s.media['2']!.status).toBe('timeout')
  expect(s.media['1']!.status).toBe('blocked')
})
it('D-10: jumping 1→5 leaves 2–4 unvisited and reorderable; reopening never moves history', () => {
  const s = run(createMomentsQueue(ids), open('1'), open('5'), open('1'), open('5'))
  expect(s.history).toEqual(['1', '5'])
  expect(s.remainder).toEqual(['2', '3', '4', '6'])
  const ordered = reduce(s, { type: 'order', ids: ['4', '3', '2', '6'] })
  expect(queueIds(ordered)).toEqual(['1', '5', '4', '3', '2', '6'])
  expect(reduce(ordered, shuffle).remainder).toHaveLength(4)
})
describe('D-14: media round trips', () => {
  it.each(['ready', 'loading', 'playing', 'paused', 'ended', 'blocked', 'timeout', 'failed'] as const)('retains %s without inventing ready or watched', status => {
    let s = run(createMomentsQueue(ids), open('1'))
    if (status !== 'ready') s = reduce(s, { type: 'play' })
    if (['playing', 'paused', 'ended'].includes(status)) s = provider(s, status as 'playing' | 'paused' | 'ended', 0)
    if (['blocked', 'timeout', 'failed'].includes(status)) s = reduce(s, { type: 'failure', id: '1', attempt: s.media['1']!.attempt,
      failure: { kind: status === 'blocked' ? 'owner-blocked' : status === 'timeout' ? 'unknown' : 'unavailable' } })
    const expected = status === 'playing' ? 'paused' : status
    const cinema = run(s, { type: 'surface', surface: 'cinema' }, { type: 'surface', surface: 'stage' })
    expect(cinema.media).toBe(s.media)
    s = run(cinema, { type: 'leave' }, open('2'), open('1'))
    expect(s.media['1']!.status).toBe(expected)
    expect(s.media['1']!.completed).toBe(status === 'ended')
    expect(s.media['1']!.position).toBe(0)
  })
  it('completion comes only from a current provider end, never open, source link or elapsed position', () => {
    let s = run(createMomentsQueue(ids), open('1'))
    expect(provider(s, 'ended', 50)).toBe(s)
    s = reduce(s, { type: 'play' })
    s = provider(s, 'position', 9999)
    expect(s.media['1']!.completed).toBe(false)
    s = provider(s, 'ended', 10000)
    expect(s.media['1']!.completed).toBe(true)
    expect(provider(s, 'playing')).toBe(s)
    s = run(s, { type: 'leave' }, open('1'))
    expect(s.media['1']!.status).toBe('ended')
    expect(s.media['1']!.position).toBe(10000)
    s = reduce(s, { type: 'play', replay: true })
    expect(s.media['1']!.position).toBe(0)
    expect(s.media['1']!.completed).toBe(true)
  })
  it('rejects old Retry callbacks and callbacks after leaving; preserves last finite position', () => {
    let s = run(createMomentsQueue(ids), open('1'), { type: 'play' })
    const attempt = s.media['1']!.attempt
    s = provider(s, 'position', 12.5)
    for (const position of [NaN, Infinity, -1]) expect(provider(s, 'position', position).media['1']!.position).toBe(12.5)
    s = reduce(s, { type: 'play' })
    expect(reduce(s, { type: 'provider', id: '1', attempt, event: 'ended' })).toBe(s)
    s = reduce(s, { type: 'leave' })
    expect(provider(s, 'ended')).toBe(s)
    expect(s.media['1']!.status).toBe('loading')
    expect(s.media['1']!.position).toBe(12.5)
  })
})
it.each([{ pool: [] }, { pool: ['1'] }, { pool: ['1', '6'] }])('zero, one and sparse pools stay bounded: $pool', ({ pool }) => {
  let s = run(createMomentsQueue(ids), { type: 'filter', ids: pool, savedOnly: false }, shuffle)
  expect(queueIds(s).sort()).toEqual([...pool].sort())
  for (let n = 0; n < pool.length + 2; n++) s = reduce(s, { type: 'next' })
  expect(s.history).toHaveLength(pool.length)
  expect(queueNeighbours(s).next).toBeNull()
})
it('filters retain history and the excluded active item, then re-admit it without duplication', () => {
  const s = run(createMomentsQueue(ids), open('1'), open('5'), { type: 'filter', ids: ['2', '3'], savedOnly: false })
  expect(s.history).toEqual(['1', '5'])
  expect(s.active).toBe('5')
  expect(queueIds(s)).toEqual(['5', '2', '3'])
  expect(queueNeighbours(s)).toEqual({ previous: null, next: '2' })
  expect(reduce(s, { type: 'filter', ids, savedOnly: false }).history).toEqual(['1', '5'])
})
it('Saved-only reflects saves without discarding excluded active/history or deliberate order', () => {
  const s = run(createMomentsQueue(ids), open('1'), shuffle, { type: 'saved', ids: ['5', '6'] },
    { type: 'filter', ids, savedOnly: true })
  const after = reduce(s, { type: 'saved', ids: [] })
  expect(queueIds(after)).toEqual(['1'])
  expect(after.remainder).toBe(s.remainder)
  expect(after.undo).toBe(s.undo)
})
it('does not mutate reducer inputs or admit foreign IDs', () => {
  const state = createMomentsQueue(ids)
  const before = structuredClone(state)
  run(state, open('1'), shuffle, { type: 'next' }, { type: 'play' }, { type: 'leave' }, { type: 'undo' })
  expect(state).toEqual(before)
  expect(reduce(state, open('foreign'))).toBe(state)
  expect(reduce(state, { type: 'order', ids: ['foreign', '6', '6'] }).remainder).toEqual(['6', '1', '2', '3', '4', '5'])
})

it('filtered Shuffle keeps excluded unvisited items and Undo reconciles newly opened history', () => {
  const start = run(createMomentsQueue(ids), open('1'), { type: 'filter', ids: ['1', '2', '4', '6'], savedOnly: false })
  const shuffled = reduce(start, shuffle)
  expect(shuffled.remainder.filter(id => ['3', '5'].includes(id))).toEqual(['3', '5'])
  expect(shuffled.remainder.indexOf('3')).toBe(start.remainder.indexOf('3'))
  const after = run(shuffled, open('4'), { type: 'filter', ids: [], savedOnly: false }, { type: 'undo' })
  expect(after.history).toEqual(['1', '4'])
  expect(after.active).toBe('4')
  expect(after.remainder).toEqual(['2', '3', '5', '6'])
  expect(queueIds(after)).toEqual(['4'])
})
it('empty editions and arbitrary reference IDs have no inherited media or phantom neighbours', () => {
  const empty = createMomentsQueue([])
  expect(run(empty, { type: 'next' }, { type: 'previous' }, shuffle, { type: 'undo' })).toEqual(empty)
  expect(queueNeighbours(empty)).toEqual({ previous: null, next: null })
  for (const id of ['constructor', '__proto__']) {
    const s = run(createMomentsQueue([id]), open(id))
    expect(s.media[id]!.status).toBe('ready')
    expect(s.history).toEqual([id])
  }
})

it('Cinema queue navigation keeps Cinema open and pauses the previous item at zero', () => {
  let s = run(createMomentsQueue(ids), open('1'), { type: 'play' }, { type: 'surface', surface: 'cinema' })
  s = provider(s, 'playing', 0)
  s = reduce(s, { type: 'next' })
  expect(s.surface).toBe('cinema')
  expect(s.media['1']!.status).toBe('paused')
  expect(s.active).toBe('2')
  expect(reduce(s, open('2')).surface).toBe('cinema')
})
it('late failure cannot replace completion or create a failed attempt before play', () => {
  let s = run(createMomentsQueue(ids), open('1'))
  const failure = (state: MomentsQueue) => reduce(state, { type: 'failure', id: '1', attempt: state.media['1']!.attempt, failure: { kind: 'unknown' } })
  expect(failure(s)).toBe(s)
  s = provider(reduce(s, { type: 'play' }), 'ended', 15)
  expect(failure(s)).toBe(s)
})

it('D-09: a block the visit already disproved cannot classify a later timeout as blocked', () => {
  let s = run(createMomentsQueue(ids), open('1'), { type: 'play' })
  s = reduce(s, { type: 'failure', id: '1', attempt: s.media['1']!.attempt, failure: { kind: 'owner-blocked', providerError: 150 } })
  expect(s.media['1']!.status).toBe('blocked')
  s = provider(reduce(s, { type: 'play' }), 'playing', 0) // Retry genuinely played this source.
  expect(s.media['1']!.status).toBe('playing')
  s = reduce(s, { type: 'play' })
  s = reduce(s, { type: 'failure', id: '1', attempt: s.media['1']!.attempt, failure: { kind: 'unknown' } })
  expect(s.media['1']!.status).toBe('timeout')
  expect(s.media['1']!.failure).toEqual({ kind: 'unknown' })
})

it.each(['paused', 'position'] as const)('D-09: %s on a loading retry is not evidence of playback', event => {
  let s = run(createMomentsQueue(ids), open('1'), { type: 'play' })
  s = reduce(s, { type: 'failure', id: '1', attempt: s.media['1']!.attempt,
    failure: { kind: 'owner-blocked', providerError: 150 } })
  s = provider(reduce(s, { type: 'play' }), event, 0)
  s = reduce(s, { type: 'failure', id: '1', attempt: s.media['1']!.attempt, failure: { kind: 'unknown' } })
  expect(s.media['1']!.status).toBe('blocked')
  expect(s.media['1']!.failure).toEqual({ kind: 'owner-blocked', providerError: 150 })
})

it.each(['playing', 'ended'] as const)('D-09: genuine %s clears the visit block before a later retry', event => {
  let s = run(createMomentsQueue(ids), open('1'), { type: 'play' })
  s = reduce(s, { type: 'failure', id: '1', attempt: s.media['1']!.attempt,
    failure: { kind: 'owner-blocked', providerError: 150 } })
  s = provider(reduce(s, { type: 'play' }), event, 0)
  expect(s.media['1']!.failure).toBeUndefined()
  s = reduce(s, { type: 'play' })
  s = reduce(s, { type: 'failure', id: '1', attempt: s.media['1']!.attempt, failure: { kind: 'unknown' } })
  expect(s.media['1']!.status).toBe('timeout')
})

it('a terminal attempt accepts only unknown-to-known failure upgrades; Retry may replace known evidence', () => {
  const fail = (s: MomentsQueue, failure: { kind: 'owner-blocked' | 'unavailable' | 'unknown'; providerError?: number }) =>
    reduce(s, { type: 'failure', id: '1', attempt: s.media['1']!.attempt, failure })
  let s = run(createMomentsQueue(ids), open('1'), { type: 'play' })
  s = fail(s, { kind: 'owner-blocked', providerError: 150 })
  expect(fail(s, { kind: 'unavailable', providerError: 100 })).toBe(s)
  expect(fail(s, { kind: 'unknown' })).toBe(s)
  s = fail(reduce(s, { type: 'play' }), { kind: 'unavailable', providerError: 100 })
  expect(s.media['1']!.status).toBe('failed')
  expect(s.media['1']!.failure).toEqual({ kind: 'unavailable', providerError: 100 })
  expect(fail(s, { kind: 'owner-blocked', providerError: 150 })).toBe(s)
  expect(fail(s, { kind: 'unknown' })).toBe(s)
  for (const failure of [{ kind: 'owner-blocked', providerError: 150 }, { kind: 'unavailable', providerError: 100 }] as const) {
    let unknown = fail(reduce(s, { type: 'play' }), { kind: 'unknown' })
    expect(unknown.media['1']!.status).toBe('timeout')
    unknown = fail(unknown, failure)
    expect(unknown.media['1']!.failure).toEqual(failure)
    expect(unknown.media['1']!.status).toBe(failure.kind === 'owner-blocked' ? 'blocked' : 'failed')
  }
})
