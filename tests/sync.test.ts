import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { runSync } from '../scripts/sync'
import { normalizeEvent } from '../scripts/providers/espn'

const mocks = vi.hoisted(() => ({ fixtures: vi.fn(), standings: vi.fn(), write: vi.fn() }))
vi.mock('../scripts/providers/espn', async (original) => ({
  ...await original<typeof import('../scripts/providers/espn')>(),
  espnProvider: { name: 'espn', fetchWindow: mocks.fixtures },
}))
vi.mock('../scripts/providers/espn-standings', () => ({ fetchStandings: mocks.standings }))
vi.mock('node:fs', async (original) => ({
  ...await original<typeof import('node:fs')>(),
  existsSync: () => false,
  writeFileSync: mocks.write,
}))

const events = JSON.parse(readFileSync(new URL('./fixtures/espn-ligue1-md1.json', import.meta.url), 'utf8')).events
const fixture = normalizeEvent(events[0], 'ligue1', '2026-09-05T12:00:00.000Z')!
const table = JSON.parse(readFileSync(new URL('../src/data/standings.json', import.meta.url), 'utf8'))
const originalArgs = process.argv

beforeEach(() => {
  mocks.write.mockReset()
  mocks.fixtures.mockReset().mockResolvedValue({ fixtures: [fixture], counts: { ligue1: 1 } })
  mocks.standings.mockReset().mockResolvedValue(structuredClone(table))
  process.argv = ['node', 'scripts/sync.ts', '--from=2026-08-01', '--to=2026-09-01']
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  process.argv = originalArgs
  vi.restoreAllMocks()
})

describe('the sync entry point — fixtures + standings are one authoritative snapshot', () => {
  it('the actual CLI propagates a provider failure as process exit 2', () => {
    const preload = 'globalThis.fetch = async () => { throw new Error("offline CLI probe") }'
    const child = spawnSync(process.execPath, ['--import', 'tsx', '--import', `data:text/javascript,${encodeURIComponent(preload)}`, 'scripts/sync.ts', '--check'], { encoding: 'utf8' })
    expect(child.status).toBe(2)
    expect(child.stderr).toContain('offline CLI probe')
    expect(child.stdout).not.toContain('report:')
  })
  it.each(['fixtures', 'standings'] as const)('%s fetch failure returns exit 2 without writing any file', async (source) => {
    mocks[source].mockRejectedValue(new Error(`${source} provider unavailable`))
    expect(await runSync()).toBe(2)
    expect(mocks.write).not.toHaveBeenCalled()
    expect(console.error).toHaveBeenCalledWith('\nsync failed:', `${source} provider unavailable`)
    expect(vi.mocked(console.log).mock.calls.flat().join('\n')).not.toContain('report:')
  })

  it('a schema-rejected fixture prevents every snapshot write', async () => {
    mocks.fixtures.mockResolvedValue({ fixtures: [{ ...fixture, source: { ...fixture.source, sourceId: '' } }], counts: { ligue1: 1 } })
    expect(await runSync()).toBe(2)
    expect(mocks.write).not.toHaveBeenCalled()
    expect(vi.mocked(console.error).mock.calls.flat().join('\n')).toContain('source.sourceId')
  })

  it('schema-rejected standings cannot advance already fetched fixtures or metadata', async () => {
    mocks.standings.mockResolvedValue({ ...table, fetchedAt: 'invalid' })
    expect(await runSync()).toBe(2)
    expect(mocks.write).not.toHaveBeenCalled()
    expect(vi.mocked(console.error).mock.calls.flat().join('\n')).toContain('fetchedAt')
  })

  it('waits for standings validation before the first write, then writes the complete snapshot', async () => {
    mocks.standings.mockImplementation(async () => {
      expect(mocks.write).not.toHaveBeenCalled()
      return table
    })
    expect(await runSync()).toBe(0)
    expect(mocks.write.mock.calls.map(([path]) => path.split('/').at(-1))).toEqual(['fixtures.json', 'meta.json', 'standings.json'])
    expect(JSON.parse(mocks.write.mock.calls[0]![1])).toEqual([fixture])
    expect(JSON.parse(mocks.write.mock.calls[2]![1])).toEqual(table)
    expect(vi.mocked(console.log).mock.calls.at(-1)?.[0]).toMatch(/report: changed=true changes=1 urgent=0 standings=changed rank-moves=0 merge=auto$/)
  })

  it('--check still fetches both datasets and reports without writes', async () => {
    process.argv.push('--check')
    expect(await runSync()).toBe(0)
    expect(mocks.fixtures).toHaveBeenCalledOnce()
    expect(mocks.standings).toHaveBeenCalledOnce()
    expect(mocks.write).not.toHaveBeenCalled()
    expect(vi.mocked(console.log).mock.calls.at(-1)?.[0]).toContain('report: changed=true')
  })
})
