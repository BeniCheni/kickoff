import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { fetchStandings } from '../scripts/providers/espn-standings'
import { LEAGUE_TABLES, SYNCABLE } from '../src/lib/competitions'

const sample = JSON.parse(readFileSync(new URL('./fixtures/espn-laliga-standings.json', import.meta.url), 'utf8')).entries

function installResponse(change: (entries: any[], code: string) => any[]) {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    const league = SYNCABLE.find((c) => url.includes(`/${c.code}/`))!
    // The archived sample is four entries, not a complete table. Generate a complete
    // synthetic league from that shape, with distinct identities and provider ranks.
    const rows = Array.from({ length: LEAGUE_TABLES[league.key]!.teams }, (_, i) => {
      const row = structuredClone(sample[i % sample.length])
      row.team.id = `synthetic-${i}`
      row.stats.find((s: any) => s.name === 'rank').value = i + 1
      return row
    })
    return { ok: true, json: async () => ({ children: [{ standings: { entries: change(rows, league.code) } }] }) }
  }))
}
afterEach(() => vi.unstubAllGlobals())

describe('standings reject every bad entry, regardless of the remaining row count', () => {
  it('accepts complete, valid league responses', async () => {
    installResponse((rows) => rows)
    const data = await fetchStandings(2026)
    expect(Object.keys(data.leagues)).toHaveLength(5)
    expect(data.leagues.laliga).toHaveLength(20)
    expect(data.leagues.ligue1).toHaveLength(18)
  })

  it('collects malformed extras from multiple leagues even when enough valid rows remain', async () => {
    installResponse((rows, code) => [...rows, { team: { id: `bad-${code}`, displayName: 'Incomplete' }, stats: [] }])
    await expect(fetchStandings(2026)).rejects.toThrow(/esp\.1.*bad-esp\.1.*required stats[\s\S]*eng\.1.*bad-eng\.1/)
  })

  it('includes the competition, row identity and schema field for an invalid rank', async () => {
    installResponse((rows) => {
      rows[0].team.id = 'bad-rank'
      rows[0].stats.find((s: any) => s.name === 'rank').value = 1.5
      return rows
    })
    await expect(fetchStandings(2026)).rejects.toThrow(/esp\.1 entry 1, team "bad-rank": rank/)
  })

  it('does not turn a missing team identity into a row', async () => {
    installResponse((rows) => { delete rows[0].team.id; return rows })
    await expect(fetchStandings(2026)).rejects.toThrow(/team \(missing\): missing or invalid team id/)
  })

  it('a row count mismatch is still a hard failure', async () => {
    installResponse((rows) => rows.slice(1))
    await expect(fetchStandings(2026)).rejects.toThrow(/got 19 rows, expected 20/)
  })

  it('network failures identify every affected league', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network unavailable') }))
    await expect(fetchStandings(2026)).rejects.toThrow(/ESPN standings esp\.1: network unavailable[\s\S]*ESPN standings ger\.1: network unavailable/)
  })
})
