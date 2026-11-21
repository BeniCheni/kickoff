import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import recorded from './fixtures/espn/ucl-standings.json'
import scoreboard from './fixtures/espn/ucl-md1.json'
import { runSync } from '../scripts/sync'
import { normalizeEvent } from '../scripts/providers/espn'
import { SYNCABLE, LEAGUE_TABLES } from '../src/lib/competitions'
import { META, SYNC_STAMP } from '../src/lib/fixtures'
import { STANDINGS } from '../src/lib/standings'
import { syncStamp } from '../src/lib/time'

/**
 * The Register's cover does not say when the table was synced. The band's provenance line,
 * directly above it, prints one stamp, and that stamp is meta.json's `lastSyncAt`. What makes
 * the line the Table's as well is a promise the writer keeps, and it is not how close two
 * clocks happen to be:
 *
 *   1. one sync run writes fixtures, meta and standings together, or it writes none of them;
 *   2. that run stamps the standings as it starts fetching them (`fetchedAt`) and the snapshot
 *      once every fetch is back (`lastSyncAt`), so the band's stamp is never older than the
 *      standings under it, and both stamps fall inside the one run.
 *
 * How long the fetch took is no part of that. The gate this file used to hold, "the two stamps
 * are under a minute apart", failed a run that exited 0 because the provider took 75 seconds
 * (the review of PR #352, finding 1). So the writer is driven here with a clock only the
 * provider moves, and the gap is asserted to be the fetch, whatever it was.
 *
 * What the committed files cannot show is which run wrote them: an older standings file beside
 * a newer meta file has its stamps in the right order too. That is the writer's first promise,
 * and it is tested on the writer.
 *
 * If one of these fails, the band's line is no longer the Table's: the cover has to state the
 * standings' own stamp again.
 */
const mocks = vi.hoisted(() => ({ write: vi.fn(), fixtures: vi.fn() }))
vi.mock('node:fs', async original => ({ ...await original<typeof import('node:fs')>(), existsSync: () => false, writeFileSync: mocks.write }))
vi.mock('../scripts/providers/espn', async original => ({ ...await original<typeof import('../scripts/providers/espn')>(), espnProvider: { name: 'espn', fetchWindow: mocks.fixtures } }))

const START = Date.parse('2027-02-01T12:00:00Z')
const args = process.argv
/** How long the standings provider takes to answer, in total. The clock moves by this and by nothing else. */
let providerTakes = 0
let provider: () => { ok: boolean; status?: number } = () => ({ ok: true })

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], now: new Date(START) })
  mocks.write.mockReset()
  mocks.fixtures.mockResolvedValue({ fixtures: [normalizeEvent(scoreboard.events[0], 'ucl', '2027-02-01T12:00:00Z')], counts: { ucl: 1 } })
  providerTakes = 0
  provider = () => ({ ok: true })
  process.argv = ['node', 'scripts/sync.ts', '--from=2026-08-01', '--to=2027-02-01']
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  let answered = false
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    // The whole delay lands on the first answer: the stamp was taken before any request left.
    if (!answered) { answered = true; vi.setSystemTime(Date.now() + providerTakes) }
    const { key } = SYNCABLE.find(c => url.includes(`/${c.code}/`))!
    const body = structuredClone(recorded)
    body.children[0]!.standings.entries = body.children[0]!.standings.entries.slice(0, LEAGUE_TABLES[key]!.teams)
    return { ...provider(), json: async () => body }
  }))
})
afterEach(() => { process.argv = args; vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers() })

const written = () => Object.fromEntries(mocks.write.mock.calls.map(([p, json]) => [String(p).split('/').at(-1), JSON.parse(json)]))

describe('the writer: one sync run stamps and writes the whole snapshot', () => {
  it.each([
    ['at once', 0],
    ['after 75 seconds, the case the old one-minute gate failed', 75_000],
    ['after 26 minutes', 26 * 60_000],
  ])('writes all three files in one run when the standings provider answers %s', async (_, takes) => {
    providerTakes = takes
    expect(await runSync()).toBe(0)
    const end = Date.now()
    const files = written()
    expect(Object.keys(files).sort()).toEqual(['fixtures.json', 'meta.json', 'standings.json'])

    const fetchedAt = Date.parse(files['standings.json'].fetchedAt)
    const lastSyncAt = Date.parse(files['meta.json'].lastSyncAt)
    // Both stamps inside the run, the standings' first: the band never predates the table.
    expect(START).toBeLessThanOrEqual(fetchedAt)
    expect(fetchedAt).toBeLessThanOrEqual(lastSyncAt)
    expect(lastSyncAt).toBeLessThanOrEqual(end)
    // What separates them is the fetch and nothing else, so no bound on it is owed.
    expect(lastSyncAt - fetchedAt).toBe(takes)
    // One run, one account of what the standings are missing.
    expect(files['meta.json'].standingsDegraded).toEqual(files['standings.json'].degraded ?? [])
  })

  it('writes none of the three when the standings fetch fails, so a newer fixtures stamp never sits over an older table', async () => {
    providerTakes = 75_000
    provider = () => ({ ok: false, status: 503 })
    expect(await runSync()).toBe(2)
    expect(mocks.write).not.toHaveBeenCalled()
  })
})

describe('the reader: the band prints the snapshot’s stamp, and the cover prints none', () => {
  const source = (file: string) => readFileSync(new URL(`../src/components/${file}`, import.meta.url), 'utf8')

  it('the band’s SYNCED stamp is meta.json’s lastSyncAt, to the minute, in UTC', () => {
    expect(SYNC_STAMP).toBe(syncStamp(META.lastSyncAt))
    expect(source('ProvenanceLine.tsx')).toContain('SYNCED ${SYNC_STAMP}')
  })

  it('the cover and the Table read no sync stamp of their own', () => {
    for (const file of ['RegisterCover.tsx', 'TablePage.tsx']) {
      expect(source(file), file).not.toMatch(/fetchedAt|lastSyncAt|SYNC_STAMP|hoursSince|syncStamp/)
    }
  })

  it('the committed snapshot holds the two stamps in the writer’s order, and one degraded list', () => {
    expect(Date.parse(STANDINGS.fetchedAt)).toBeLessThanOrEqual(Date.parse(META.lastSyncAt))
    expect(META.standingsDegraded ?? []).toEqual(STANDINGS.degraded ?? [])
  })
})
