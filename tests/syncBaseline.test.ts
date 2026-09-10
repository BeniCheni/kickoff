import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { resolve } from 'node:path'
import { runSync } from '../scripts/sync'
import { normalizeEvent } from '../scripts/providers/espn'
import scoreboard from './fixtures/espn/ucl-md1.json'
import standings from '../src/data/standings.json'

const mocks = vi.hoisted(() => ({ read: vi.fn(), exists: vi.fn(), write: vi.fn(), fixtures: vi.fn(), standings: vi.fn() }))
vi.mock('node:fs', async original => ({ ...await original<typeof import('node:fs')>(), readFileSync: mocks.read, existsSync: mocks.exists, writeFileSync: mocks.write }))
vi.mock('../scripts/providers/espn', async original => ({ ...await original<typeof import('../scripts/providers/espn')>(), espnProvider: { name: 'espn', fetchWindow: mocks.fixtures } }))
vi.mock('../scripts/providers/espn-standings', () => ({ fetchStandings: mocks.standings }))
const args = process.argv
const directory = resolve('/tmp/illustrative-sync-baseline')
const prior = { ...normalizeEvent(scoreboard.events[0], 'ucl', '2026-09-10T12:00:00Z')!, note: 'Retain curation context' }

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-09-10T12:00:00Z') })
  process.argv = ['node', 'scripts/sync.ts', `--baseline-dir=${directory}`]
  mocks.write.mockReset()
  mocks.exists.mockReset().mockReturnValue(true)
  mocks.read.mockReset().mockImplementation((path: string) => {
    if (path === resolve(directory, 'fixtures.json')) return JSON.stringify([prior])
    if (path === resolve(directory, 'standings.json')) return JSON.stringify(standings)
    throw new Error('Must not read conflict-marked output files')
  })
  mocks.fixtures.mockReset().mockResolvedValue({ fixtures: [{ ...prior, kickoffUtc: '2026-10-13T19:00:00Z', round: '2', note: undefined }], counts: { ucl: 1 } })
  mocks.standings.mockReset().mockResolvedValue(standings)
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => { process.argv = args; vi.restoreAllMocks(); vi.useRealTimers() })

it('reads the exported baseline, preserves first-seen identity, and writes only fresh output to src/data', async () => {
  expect(await runSync()).toBe(0)
  expect(mocks.read.mock.calls.map(([path]) => path)).toEqual([resolve(directory, 'fixtures.json'), resolve(directory, 'standings.json')])
  const written = mocks.write.mock.calls
  expect(written.map(([path]) => path)).toEqual(['fixtures.json', 'meta.json', 'standings.json'].map(name => resolve('src/data', name)))
  expect(JSON.parse(written[0]![1])[0]).toMatchObject({ kickoffUtc: '2026-10-13T19:00:00Z', round: '1', note: prior.note })
})
it.each(['fixtures.json', 'standings.json'])('fails closed on a missing explicitly selected %s baseline', async name => {
  mocks.exists.mockImplementation((path: string) => path !== resolve(directory, name))
  expect(await runSync()).toBe(2)
  expect(mocks.write).not.toHaveBeenCalled()
  expect(vi.mocked(console.error).mock.calls.flat().join(' ')).toContain('Missing explicit sync baseline')
})
it('rejects a corrupt baseline before writing anything', async () => {
  mocks.read.mockReturnValue('{ conflict markers are not JSON')
  expect(await runSync()).toBe(2)
  expect(mocks.fixtures).not.toHaveBeenCalled()
  expect(mocks.write).not.toHaveBeenCalled()
})
it('retains an absent baseline round through a later move inside a window', async () => {
  mocks.read.mockImplementation((path: string) => JSON.stringify(path.endsWith('fixtures.json') ? [{ ...prior, round: undefined }] : standings))
  expect(await runSync()).toBe(0)
  expect(JSON.parse(mocks.write.mock.calls[0]![1])[0]).not.toHaveProperty('round')
})
