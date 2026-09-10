import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import recorded from './fixtures/espn/ucl-standings.json'
import scoreboard from './fixtures/espn/ucl-md1.json'
import { runSync } from '../scripts/sync'
import { normalizeEvent } from '../scripts/providers/espn'
import { SYNCABLE, LEAGUE_TABLES } from '../src/lib/competitions'
const mocks = vi.hoisted(() => ({ write: vi.fn(), fixtures: vi.fn() }))
vi.mock('node:fs', async original => ({ ...await original<typeof import('node:fs')>(), existsSync: () => false, writeFileSync: mocks.write }))
vi.mock('../scripts/providers/espn', async original => ({ ...await original<typeof import('../scripts/providers/espn')>(), espnProvider: { name: 'espn', fetchWindow: mocks.fixtures } }))
const args = process.argv
let mutate: (body: any) => void
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], now: new Date('2027-02-01T12:00:00Z') })
  mocks.write.mockReset()
  mocks.fixtures.mockResolvedValue({ fixtures: [normalizeEvent(scoreboard.events[0], 'ucl', '2027-02-01T12:00:00Z')], counts: { ucl: 1 } })
  mutate = () => {}
  process.argv = ['node', 'scripts/sync.ts', '--from=2026-08-01', '--to=2027-02-01']
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    const { key } = SYNCABLE.find(c => url.includes(`/${c.code}/`))!
    const body = structuredClone(recorded)
    body.children[0]!.standings.entries = body.children[0]!.standings.entries.slice(0, LEAGUE_TABLES[key]!.teams)
    if (key === 'ucl') mutate(body)
    return { ok: true, json: async () => body }
  }))
})
afterEach(() => { process.argv = args; vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers() })
describe('an ended UCL table does not freeze domestic snapshots', () => {
  it.each(['child', 'name', 'count'])('degrades only UCL on a validated %s reshape, records meta and reports it', async change => {
    mutate = body => {
      if (change === 'child') body.children.push(structuredClone(body.children[0]))
      if (change === 'name') body.children[0].name = 'Knockout Phase'
      if (change === 'count') body.children[0].standings.entries.pop()
    }
    expect(await runSync()).toBe(0)
    const writes = Object.fromEntries(mocks.write.mock.calls.map(([p, json]) => [p.split('/').at(-1), JSON.parse(json)]))
    expect(Object.keys(writes['standings.json'].leagues).sort()).toEqual(['bundesliga', 'laliga', 'ligue1', 'pl', 'seriea'])
    expect(writes['meta.json'].standingsDegraded).toEqual(['ucl'])
    expect(writes['fixtures.json']).toHaveLength(1)
    expect(vi.mocked(console.log).mock.calls.at(-1)![0]).toContain('standings-degraded=ucl')
  })
  it('a phase reshape during the phase still aborts before every write', async () => {
    vi.setSystemTime(new Date('2026-09-10T12:00:00Z'))
    mutate = body => { body.children[0].name = 'Unexpected' }
    expect(await runSync()).toBe(2)
    expect(mocks.write).not.toHaveBeenCalled()
  })
  it('a malformed entry in a reshaped child remains a validation failure after the phase', async () => {
    mutate = body => { body.children[0].name = 'Knockout Phase'; body.children[0].standings.entries.push({ team: { id: 'broken' }, stats: [] }) }
    expect(await runSync()).toBe(2)
    expect(mocks.write).not.toHaveBeenCalled()
  })
  it('a missing entries array is not a phase-ending signal', async () => {
    mutate = body => { delete body.children[0].standings.entries }
    expect(await runSync()).toBe(2)
    expect(mocks.write).not.toHaveBeenCalled()
  })
  it('an HTTP failure still exits 2 before any write after the phase', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503 })))
    expect(await runSync()).toBe(2)
    expect(mocks.write).not.toHaveBeenCalled()
  })
})
