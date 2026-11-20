import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
// Vite's query is a second module instance. The serve-only plugin passes the specimen
// into that copy's tableFor call. TypeScript has no module for the query.
// @ts-expect-error kickoff-specimen is resolved by Vite, not by the typechecker.
import { TablePage as SpecimenTable } from '../../src/components/TablePage?kickoff-specimen'
import { clockSnapshotAt, type Clock } from '../../src/lib/clock'
import { ZONES_SEASON, type CompetitionKey } from '../../src/lib/competitions'
import type { Fixture, StandingRow } from '../../src/lib/schema'
import { STANDINGS } from '../../src/lib/standings'
import { ClockContext } from '../../src/lib/useNow'
import { edgeFixture } from '../fixtures/edgeFixtures'
import '../../src/index.css'

// Dev server only: the Table, one state to a page, on synthetic data. The states the
// committed snapshot does not hold today, or holds in one league only, are drawn here so
// both themes and every width can be looked at. `?state=` picks the specimen, the league
// and what is opened or sorted. Nothing here is a production input.

declare global {
  var __kickoffSpecimen: { rows: StandingRow[]; fixtures: Fixture[] }
}

// Saturday 21 November 2026, 10:00 in Brooklyn. Every kickoff below is set from it, and the
// page's clock is held to it, so a capture is the same whenever it is taken.
const NOW = Date.parse('2026-11-21T15:00:00.000Z')
const HOUR = 3_600_000
const at = (hours: number) => new Date(NOW + hours * HOUR).toISOString()

/** One round of a round-robin by the circle method: club 0 stays, the rest turn. */
function round(clubs: number, n: number): [number, number][] {
  const turned = Array.from({ length: clubs - 1 }, (_, i) => ((i + n) % (clubs - 1)) + 1)
  const order = [0, ...turned]
  return Array.from({ length: clubs / 2 }, (_, i) => {
    const pair: [number, number] = [order[i]!, order[clubs - 1 - i]!]
    return n % 2 === 0 ? pair : [pair[1], pair[0]]
  })
}

const SCORES: [number, number][] = [[2, 0], [1, 1], [1, 2], [3, 1], [0, 0], [0, 1]]

/**
 * A table a league could hold. `played` rounds are finished, one match of the last of them
 * was called off and waits for a time, and the next round is on the day. Every club's row
 * is summed from the results below it, so its record, its goals and its form agree.
 *
 * Three cells the committed snapshot rarely shows are set here: the called-off match has
 * no kickoff time, one match of the next round kicked off an hour ago, and one is at a
 * ground whose time zone is not known.
 */
function league(key: CompetitionKey, clubs: number, played: number, extra: Partial<Fixture> = {}) {
  const heldOff = round(clubs, played - 1)[0]!
  const next = round(clubs, played)
  const free = next.filter((pair) => !pair.some((club) => heldOff.includes(club)))
  const kicked = free[0]!
  const nozone = free[1]!
  const named = new Map([[heldOff[0], ['Specimen Unset', 'UNS']], [kicked[0], ['Specimen Kicked', 'KCK']], [nozone[0], ['Specimen Nozone', 'NZN']]])
  const club = (i: number) => {
    const [name, abbrev] = named.get(i) ?? [`Specimen ${String(i + 1).padStart(2, '0')}`, `S${String(i + 1).padStart(2, '0')}`]
    return { teamId: `synth-${key}-${i + 1}`, name: name!, abbrev: abbrev! }
  }
  const fixture = (id: string, home: number, away: number, patch: Partial<Fixture>): Fixture => edgeFixture({
    id: `synth:${key}:${id}`,
    competition: key,
    venue: 'Specimen Ground',
    venueTz: 'Europe/Paris',
    home: { name: club(home).name, sourceId: club(home).teamId },
    away: { name: club(away).name, sourceId: club(away).teamId },
    source: { provider: 'espn', sourceId: `synth-${id}`, fetchedAt: at(-1) },
    ...extra,
    ...patch,
  })

  const fixtures: Fixture[] = []
  const tally = Array.from({ length: clubs }, () => ({ w: 0, d: 0, l: 0, gf: 0, ga: 0 }))
  for (let n = 0; n < played; n += 1) {
    for (const [home, away] of round(clubs, n)) {
      if (n === played - 1 && home === heldOff[0]) continue
      const [h, a] = SCORES[(home * 5 + away * 3 + n) % SCORES.length]!
      fixtures.push(fixture(`r${n}-${home}`, home, away, { kickoffUtc: at(-24 * 7 * (played - n) + 5), status: 'full_time', result: { home: h, away: a } }))
      const [mine, theirs] = [tally[home]!, tally[away]!]
      mine.gf += h; mine.ga += a; theirs.gf += a; theirs.ga += h
      if (h > a) { mine.w += 1; theirs.l += 1 } else if (h < a) { mine.l += 1; theirs.w += 1 } else { mine.d += 1; theirs.d += 1 }
    }
  }
  // The called-off match: a placeholder on today's date, and no time the league has set.
  fixtures.push(fixture('held', heldOff[0], heldOff[1], { kickoffUtc: at(3), timeConfidence: 'tbd' }))
  next.forEach(([home, away], i) => {
    const patch: Partial<Fixture> = home === kicked[0] ? { kickoffUtc: at(-1) }
      : home === nozone[0] ? { kickoffUtc: at(4.5), venueTz: undefined }
      : [home, away].some((side) => heldOff.includes(side)) ? { kickoffUtc: at(26) }
      : { kickoffUtc: at(5 + (i % 4) * 2.25) }
    fixtures.push(fixture(`next-${home}`, home, away, patch))
  })

  const points = (i: number) => tally[i]!.w * 3 + tally[i]!.d
  const order = tally.map((_, i) => i).sort((a, b) => points(b) - points(a)
    || (tally[b]!.gf - tally[b]!.ga) - (tally[a]!.gf - tally[a]!.ga) || tally[b]!.gf - tally[a]!.gf || a - b)
  const rows: StandingRow[] = order.map((i, place) => {
    const t = tally[i]!
    // The second and third clubs changed places this round; nobody else moved.
    const rankChange = place === 1 ? 1 : place === 2 ? -1 : 0
    return { ...club(i), shortName: club(i).name, rank: place + 1, rankChange, played: t.w + t.d + t.l, w: t.w, d: t.d, l: t.l, gf: t.gf, ga: t.ga, pts: points(i) }
  })
  return { rows, fixtures }
}

type State = {
  title: string
  league: CompetitionKey
  specimen: () => { rows: StandingRow[]; fixtures: Fixture[] }
  /** What a reader does after the page has drawn: the control to press. */
  press?: (root: HTMLElement) => HTMLElement | null | undefined
  /** Words the page has to hold once that is done, or the page reports itself broken. */
  needles: string[]
  season?: number
}

const ligue1 = () => league('ligue1', 18, 4)
const row = (root: HTMLElement, name: string) => [...root.querySelectorAll<HTMLElement>('[data-table="mobile"] button[aria-expanded]')].find((button) => button.textContent?.includes(name))

const STATES: Record<string, State> = {
  cells: {
    title: 'Kickoff not set, kicked off, stadium zone not known, games in hand',
    league: 'ligue1', specimen: ligue1,
    needles: ['kickoff time not yet set', 'time TBC', 'KICKED OFF', 'local time not known', 'Games in hand', 'As of matchday 4 of 34', 'Specimen Unset', 'Specimen Kicked', 'Specimen Nozone'],
  },
  opened: {
    title: 'A row opened',
    league: 'ligue1', specimen: ligue1, press: (root) => row(root, 'Specimen Kicked'),
    needles: ['W-D-L', 'PPG'],
  },
  ppg: {
    title: 'Sorted by points per game',
    league: 'ligue1', specimen: ligue1,
    press: (root) => [...root.querySelectorAll<HTMLElement>('[data-table="desktop"] button.register-sort')].find((button) => button.textContent === 'PPG'),
    needles: ['Sorted by points per game.'],
  },
  key: {
    title: 'Zones & key, opened',
    league: 'ligue1', specimen: ligue1, press: (root) => root.querySelector<HTMLElement>('.zones-key-bar'),
    needles: ['Qualification zones', 'Columns', 'How ties are broken', 'UCL Qualifying', 'Relegation play-off'],
  },
  season: {
    title: 'Zone data from another season: bands hidden, and the note',
    league: 'ligue1', specimen: ligue1, press: (root) => root.querySelector<HTMLElement>('.zones-key-bar'), season: ZONES_SEASON - 1,
    needles: ['Zone bands are hidden: the snapshot is the 2025-26 season but the zone metadata describes 2026-27.'],
  },
  ucl: {
    title: 'Champions League, league phase',
    league: 'ucl', specimen: () => league('ucl', 36, 4, { phase: 'league-phase', season: 2026 }),
    needles: ['As of matchday 4 of 8 · league phase', 'Round of 16', 'Knockout play-offs', 'Eliminated', 'Matches played'],
  },
  empty: {
    title: 'No table in the snapshot',
    league: 'ligue1', specimen: () => ({ rows: [], fixtures: [] }),
    needles: ['No table in the snapshot for Ligue 1'],
  },
}

const query = new URLSearchParams(location.search)
const state = STATES[query.get('state') ?? ''] ?? null
if (state) {
  globalThis.__kickoffSpecimen = state.specimen()
  if (state.season !== undefined) STANDINGS.season = state.season
  // The Table reads its league from the address, as it does in the app.
  query.set('league', state.league)
  window.history.replaceState(null, '', `${location.pathname}?${query}`)
}

const snapshot = clockSnapshotAt(NOW)
const clock: Clock = { subscribe: () => () => {}, getSnapshot: () => snapshot, getServerSnapshot: () => snapshot, subscriberCount: () => 0 }

function Harness({ shown }: { shown: State }) {
  useEffect(() => {
    const root = document.getElementById('root')!
    const outer = window.setTimeout(() => {
      shown.press?.(root)?.click()
      window.setTimeout(() => {
        const text = root.textContent ?? ''
        const missing = shown.needles.filter((needle) => !text.includes(needle))
        if (missing.length) document.documentElement.dataset.statesError = missing.join(' | ')
        else document.documentElement.dataset.statesReady = 'true'
      }, 300)
    }, 0)
    return () => window.clearTimeout(outer)
  }, [shown])
  return (
    <>
      <p className="harness-caption">Synthetic specimen · ILLUSTRATIVE · {shown.title}</p>
      {/* The app's own frame for the Table, so the cover, the gutters and the ground are the page's. */}
      <div className="page-measure" data-measure="register" data-ground="black">
        <ClockContext.Provider value={clock}><SpecimenTable /></ClockContext.Provider>
      </div>
    </>
  )
}

if (state) createRoot(document.getElementById('root')!).render(<Harness shown={state} />)
else document.documentElement.dataset.statesError = `no such state: ${query.get('state') ?? '(none)'}. One of: ${Object.keys(STATES).join(', ')}`
