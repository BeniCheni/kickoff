import { describe, expect, it } from 'vitest'
import recorded from './fixtures/espn/ucl-md1.json'
import standingPayload from './fixtures/espn/ucl-standings.json'
import { MATCHDAY_WINDOWS, MATCHDAY_WINDOWS_SEASON, LEAGUE_TABLES, TABLE_LEAGUES } from '../src/lib/competitions'
import { resolveMatchday, afterPhaseWindows } from '../src/lib/matchdays'
import { normalizeEvent } from '../scripts/providers/espn'
import { normalizeStandingEntry } from '../scripts/providers/espn-standings'
import { preserveContext } from '../scripts/sync'
import { fixtureSchema } from '../src/lib/schema'
import { matchdayProgress, type TableRow } from '../src/lib/standings'

function fixture(date: string, year = 2026, phase = 'league-phase') {
  return fixtureSchema.parse(normalizeEvent({ ...recorded.events[0], date, season: { year, slug: phase } }, 'ucl', '2026-09-10T16:00:00.000Z'))
}
describe('first-seen matchday identity', () => {
  it('maps Brooklyn dates only within ordered, disjoint, season-guarded UEFA windows', () => {
    const windows = MATCHDAY_WINDOWS.ucl!
    for (const [i, w] of windows.entries()) {
      expect(w.md).toBe(i + 1)
      expect(w.from <= w.to).toBe(true)
      if (i) expect(windows[i - 1]!.to < w.from).toBe(true)
      expect(resolveMatchday('ucl', `${w.from}T23:59:00Z`, MATCHDAY_WINDOWS_SEASON)).toBe(w.md)
    }
    expect(resolveMatchday('ucl', '2026-09-11T00:30:00Z', 2026)).toBe(1)
    expect(resolveMatchday('ucl', '2026-09-08T19:00:00Z', 2025)).toBeNull()
    expect(resolveMatchday('pl', '2026-09-08T19:00:00Z', 2026)).toBeNull()
  })
  it('preserves MD1 when its kickoff moves into the MD2 window', () => {
    const original = fixture('2026-09-09T19:00:00Z')
    const moved = fixture('2026-10-13T19:00:00Z')
    preserveContext([original], [moved])
    expect(moved.round).toBe('1')
    expect(resolveMatchday('ucl', moved.kickoffUtc, 2026)).toBe(2)
  })
  it('preserves a stored round when the provider carries none', () => {
    const original = { ...fixture('2026-09-09T19:00:00Z'), note: 'Keep this context' }
    const fetched = fixture('2026-09-30T19:00:00Z')
    expect(fetched.round).toBeUndefined()
    preserveContext([original], [fetched])
    expect(fetched).toMatchObject({ round: '1', note: 'Keep this context' })
  })
  it('a first sighting outside every window stays absent after later moving into a window', () => {
    const original = fixture('2026-09-30T19:00:00Z')
    const moved = fixture('2026-10-13T19:00:00Z')
    preserveContext([original], [moved])
    expect(original.round).toBeUndefined()
    expect(moved.round).toBeUndefined()
  })
  it('accepts the residual: already moved before first sighting is baselined in the window where found', () => {
    expect(fixture('2026-10-13T19:00:00Z').round).toBe('2')
  })
  it('does not label qualifying ties or a different season with league-phase windows', () => {
    expect(fixture('2026-09-09T19:00:00Z', 2026, 'qualifying').round).toBeUndefined()
    expect(fixture('2026-09-09T19:00:00Z', 2027).round).toBeUndefined()
  })
  it('only permits ended-phase degradation after the final window of the known season', () => {
    expect(afterPhaseWindows('ucl', 2026, new Date('2027-01-28T02:00:00Z'))).toBe(false)
    expect(afterPhaseWindows('ucl', 2026, new Date('2027-02-01T12:00:00Z'))).toBe(true)
    expect(afterPhaseWindows('ucl', 2027, new Date('2028-02-01T12:00:00Z'))).toBe(false)
  })
  it('uses eight matches for the 36-row phase and keeps the domestic denominator', () => {
    const rows = standingPayload.children[0]!.standings.entries.map(e => normalizeStandingEntry(e)!) as TableRow[]
    expect(matchdayProgress(rows, LEAGUE_TABLES.ucl)?.of).toBe(8)
    expect(matchdayProgress(rows.slice(0, 20), LEAGUE_TABLES.pl)?.of).toBe(38)
    expect(TABLE_LEAGUES.at(-1)).toBe('ucl')
  })
})
