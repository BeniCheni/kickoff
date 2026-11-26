import { useEffect, useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { FixturesPage } from '../../src/components/FixturesPage'
import { useMotionController } from '../../src/lib/useMotionController'
import { FixtureRow } from '../../src/components/FixtureRow'
import { LedgerWeek } from '../../src/components/LedgerWeek'
import { MatchdayLines } from '../../src/components/MatchdayLines'
import { NextUpStrip } from '../../src/components/NextUpStrip'
import { StalenessBanner } from '../../src/components/StalenessBanner'
// Vite's query is a second module instance. The serve-only plugin passes the specimen
// into that copy's tableFor call. TypeScript has no module for the query.
// @ts-expect-error kickoff-specimen is resolved by Vite, not by the typechecker.
import { TablePage as SpecimenTable } from '../../src/components/TablePage?kickoff-specimen'
import { BookCover } from '../../src/components/BookCover'
import { BookShelf } from '../../src/components/BookShelf'
import { PosterWeek } from '../../src/components/PosterWeek'
import { posterBooks } from '../../src/lib/lensSelectors'
import { PosterRack } from '../../src/components/PosterRack'
import { clockSnapshotAt, type Clock } from '../../src/lib/clock'
import { BY_DATE, hoursSinceSync, META } from '../../src/lib/fixtures'
import type { CompetitionKey } from '../../src/lib/competitions'
import type { Fixture, StandingRow } from '../../src/lib/schema'
import { addDays, brooklynDate, niceDate } from '../../src/lib/time'
import { ClockContext } from '../../src/lib/useNow'
import { coverSpecimens, heavyBookDay, edgeFixture, rowStates, specimenRowProps } from '../fixtures/edgeFixtures'
import '../../src/index.css'

// Dev server only. Tailwind scans src/ and not tests/, so the captions and the page
// frame are inline styles (and the plain stylesheet in states.html). The components
// keep the classes they ship with. Nothing here is a production input.

declare global {
  var __kickoffSpecimen: { rows: StandingRow[]; fixtures: Fixture[] }
}

const source = { provider: 'espn' as const, sourceId: 'specimen', fetchedAt: '2026-11-15T07:57:53.282Z' }

function row(id: string, patch: Partial<Fixture>): Fixture {
  return edgeFixture({
    id,
    venue: 'Specimen Ground',
    home: { name: 'Specimen Home', sourceId: `${id}-home` },
    away: { name: 'Specimen Away', sourceId: `${id}-away` },
    source: { ...source, sourceId: id },
    ...patch,
  })
}

// Keep the original states sheet in order, then append the later rulings.
const rowTitles = [
  ['unset', 'Kickoff not set'], ['ft', 'Full time'], ['aet', 'After extra time'], ['pens', 'Penalties'],
  ['postponed', 'Postponed'], ['cancelled', 'Cancelled'], ['suspended', 'Suspended'], ['abandoned', 'Abandoned'],
  ['live', 'Live'], ['stale', 'Kicked off'], ['no-zone', 'Local time not known'], ['prev-day', 'Day note'],
  ['next', 'Next'], ['elapsed', 'Scheduled past kickoff'], ['next-day', 'Next day'], ['note', 'Fixture note'],
] as const

const matchdays = [
  row('md-computed', { competition: 'ucl', phase: 'league-phase', season: 2026, round: '5', kickoffUtc: '2026-11-24T18:00:00.000Z' }),
  row('md-moved', { competition: 'ucl', phase: 'league-phase', season: 2026, round: '1', kickoffUtc: '2026-09-20T18:00:00.000Z' }),
  row('md-absent', { competition: 'ucl', phase: 'league-phase', season: 2026, kickoffUtc: '2026-09-30T18:00:00.000Z' }),
]

// A two-club table plays two rounds, and the clubs play only each other. One club's
// wins are the other's losses, and the goals match. Both have played 2, so the header
// stays "matchday 2 of 2" and each row's sums are ones a table could hold.
function standing(teamId: string, name: string, abbrev: string, rank: number, w: number, d: number, l: number): StandingRow {
  return { teamId, name, shortName: name, abbrev, rank, rankChange: 0, played: w + d + l, w, d, l, gf: 2 * w + d, ga: 2 * l + d, pts: 3 * w + d }
}

const now = Date.now()
globalThis.__kickoffSpecimen = {
  rows: [
    standing('synth-unset', 'Specimen Unset', 'UNS', 1, 2, 0, 0),
    standing('synth-kicked', 'Specimen Kicked', 'KCK', 2, 0, 0, 2),
  ],
  fixtures: [
    row('table-unset', {
      competition: 'laliga',
      timeConfidence: 'tbd',
      kickoffUtc: new Date(now + 10 * 86_400_000).toISOString(),
      home: { name: 'Specimen Unset', sourceId: 'synth-unset' },
      away: { name: 'Unset Opponent', sourceId: 'synth-unset-away' },
    }),
    row('table-kicked', {
      competition: 'laliga',
      timeConfidence: 'exact',
      kickoffUtc: new Date(now - 3 * 3_600_000).toISOString(),
      home: { name: 'Specimen Kicked', sourceId: 'synth-kicked' },
      away: { name: 'Kicked Opponent', sourceId: 'synth-kicked-away' },
    }),
  ],
}

function frozenClock(hours: number): Clock {
  let instant = Date.parse(META.lastSyncAt) + hours * 3_600_000
  // The snapshot is the minute, so a +24h instant can floor to just under the threshold.
  while (hoursSinceSync(new Date(clockSnapshotAt(instant).nowUtcIso)) < hours) instant += 60_000
  const snapshot = clockSnapshotAt(instant)
  return {
    subscribe: () => () => {},
    getSnapshot: () => snapshot,
    getServerSnapshot: () => snapshot,
    subscriberCount: () => 0,
  }
}

const caption = {
  font: '600 11px/1.4 ui-sans-serif, system-ui, sans-serif',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ margin: '28px 0', paddingTop: 12, borderTop: '1px solid rgba(128,128,128,0.4)' }}>
      <p style={caption}>{title} · ILLUSTRATIVE</p>
      {children}
    </section>
  )
}

const NEEDLES = [
  'ILLUSTRATIVE',
  'kickoff time not yet set',
  'FT',
  'AET',
  'PENS',
  '2\u20134',
  'POSTPONED',
  'CANCELLED',
  'SUSPENDED',
  'ABANDONED',
  'LIVE',
  'KICKED OFF',
  'local time not known',
  'prev. day',
  'MATCHDAY 5',
  'COMPUTED',
  'RESCHEDULED',
  'DATE OUTSIDE',
  'Data may have moved.',
  'Data is stale.',
  'Your filters hide every upcoming fixture.',
  `No upcoming fixtures through ${niceDate(META.window.to)}, the end of this snapshot.`,
  'hidden by filters',
]

// Read inside the Table specimen alone: a fixture row above prints "kickoff time not yet
// set by the league", which would answer for the Table's cell if the whole page were read.
const TABLE_NEEDLES = ['Specimen Unset', 'Specimen Kicked', 'kickoff time not yet set', 'time TBC', 'KICKED OFF']

function Harness() {
  const none = new Set<CompetitionKey>()
  useEffect(() => {
    const outer = window.setTimeout(() => {
      // The Table opens one row at a time, so each copy opens the one club it is there for.
      for (const table of document.querySelectorAll<HTMLElement>('[data-specimen="table"] [data-open]')) {
        for (const button of table.querySelectorAll<HTMLButtonElement>('button[aria-expanded="false"]')) {
          if ((button.textContent ?? '').includes(table.dataset.open ?? '')) button.click()
        }
      }
      window.setTimeout(() => {
        const text = (document.body.textContent ?? '').replace(/\s+/g, ' ')
        const table = document.querySelector('[data-specimen="table"]')?.textContent ?? ''
        const missing = [
          ...NEEDLES.filter((needle) => !text.includes(needle)),
          ...TABLE_NEEDLES.filter((needle) => !table.includes(needle)).map((needle) => `Table: ${needle}`),
        ]
        if (missing.length) document.documentElement.dataset.statesError = missing.join(' | ')
        else document.documentElement.dataset.statesReady = 'true'
      }, 300)
    }, 0)
    return () => window.clearTimeout(outer)
  }, [])
  return (
    <>
      <p style={{ ...caption, marginBottom: 4 }}>Synthetic specimens · ILLUSTRATIVE</p>
      <div data-specimen="rows">
        {rowTitles.map(([id, title]) => {
          const fixture = rowStates.find(([, f]) => f.id === id)![1]
          return <Section key={id} title={title}>
            {(['poster', 'ledger'] as const).map(lens =>
              <div key={lens} data-specimen-lens={lens}>
                <FixtureRow {...specimenRowProps(fixture)} lens={lens} />
              </div>)}
          </Section>
        })}
        <Section title="Day note with a shootout">
          <div style={{ maxWidth: 640 }}>
            <FixtureRow lens="ledger" fixture={row('long-day-note', {
              status: 'after_penalties', result: { home: 3, away: 3 }, shootout: { home: 2, away: 4 },
              kickoffUtc: '2026-12-12T23:30:00Z', venueTz: 'Europe/Istanbul',
              home: { name: 'Borussia Mönchengladbach', sourceId: 'illustrative-home' },
              away: { name: 'Eintracht Frankfurt', sourceId: 'illustrative-away' },
            })} />
          </div>
        </Section>
        <Section title="Matchday line">
          <MatchdayLines fixtures={matchdays} />
        </Section>
      </div>
      <Section title="Staleness, 24 hours">
        <ClockContext.Provider value={frozenClock(24)}><StalenessBanner /></ClockContext.Provider>
      </Section>
      <Section title="Staleness, 72 hours">
        <ClockContext.Provider value={frozenClock(72)}><StalenessBanner /></ClockContext.Provider>
      </Section>
      <Section title="Filtered week, nothing left">
        <ClockContext.Provider value={frozenClock(0)}>
          <NextUpStrip today={brooklynDate(META.lastSyncAt)} active={none} />
        </ClockContext.Provider>
        <div style={{ height: 12 }} />
        <PosterRack books={[]} resting="register" now={META.lastSyncAt} />
        <LedgerWeek days={[{ date: '2026-11-22', shown: [], total: 1, isToday: false }]} />
      </Section>
      <div data-specimen="books">
        {coverSpecimens.map(({ name, fixtures, now }) => {
          const book = posterBooks([{ date: '2026-11-22', fixtures }], new Set(['laliga']))[0]!
          return <Section key={name} title={name}><div data-book-case={name}>
            <BookCover book={book} now={now} league="La Liga" />
          </div></Section>
        })}
        <Section title="Heavy part"><PosterWeek days={[{ date: '2026-11-22', total: heavyBookDay.length,
          shown: heavyBookDay, isToday: true }]} nowUtcIso="2026-11-22T12:00:00Z" /></Section>
        <Section title="All-hidden week"><PosterWeek days={Array.from({ length: 7 }, (_, i) => ({
          date: addDays('2026-11-16', i), total: i + 1, shown: [], isToday: i === 6,
        }))} /><BookShelf books={[]} resting="register" gaps={[]} /></Section>
      </div>
      <Section title="Window's end">
        <NextUpStrip today={addDays(META.window.to, 1)} active={none} />
      </Section>
      {/* The query is a second module instance. The serve-only plugin passes the specimen into
          tableFor. Two copies, because a phone's Table shows one club's card at a time. */}
      <div data-specimen="table">
        <Section title="Table, kickoff not set">
          <div data-open="Specimen Unset"><SpecimenTable /></div>
        </Section>
        <Section title="Table, kicked off">
          <div data-open="Specimen Kicked"><SpecimenTable /></div>
        </Section>
      </div>
    </>
  )
}

function Watch() {
  const [duration, setDuration] = useState(220)
  const [width, setWidth] = useState(390)
  const [run, setRun] = useState(0)
  const day = [...BY_DATE].find(([, rows]) => rows.length >= 26)?.[0] ?? META.window.from
  const address = `?watch=frame&lens=poster&date=${day}&ms=${duration}`
  return <>
    <label>Width <select value={width} onChange={e => setWidth(Number(e.target.value))}>
      {[390, 1000].map(w => <option key={w}>{w}</option>)}</select> px</label>{' '}
    <label>Growth <select value={duration} onChange={e => setDuration(Number(e.target.value))}>
      {[220, 320, 450, 600].map(ms => <option key={ms}>{ms}</option>)}</select> ms</label>{' '}
    <button type="button" onClick={() => setRun(n => n + 1)}>Replay</button>
    <p>Leave the Rack untouched for a crossing. Tap its centre to watch the book open.</p>
    <iframe key={run} title="Rack watch" src={address} style={{ width, height: '80vh', border: 0 }} />
  </>
}

function WatchFrame() {
  const { motion, toggle } = useMotionController()
  const ms = Number(new URLSearchParams(location.search).get('ms'))
  return <div data-watch-frame="" data-measure="poster" data-ground="pulp">
    <FixturesPage today={META.window.from} lens="poster" motion={motion} toggleMotion={toggle}
      openingMs={[220, 320, 450, 600].includes(ms) ? ms : 220} />
  </div>
}

const watch = new URLSearchParams(location.search).get('watch')
createRoot(document.getElementById('root')!).render(watch === 'frame' ? <WatchFrame /> : watch === '1' ? <Watch /> : <Harness />)
