import { useEffect, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { FixtureRow } from '../../src/components/FixtureRow'
import { LedgerWeek } from '../../src/components/LedgerWeek'
import { MatchdayLines } from '../../src/components/MatchdayLines'
import { NextUpStrip } from '../../src/components/NextUpStrip'
import { StalenessBanner } from '../../src/components/StalenessBanner'
// Vite's query is a second module instance. The serve-only plugin passes the specimen
// into that copy's tableFor call. TypeScript has no module for the query.
// @ts-expect-error kickoff-specimen is resolved by Vite, not by the typechecker.
import { TablePage as SpecimenTable } from '../../src/components/TablePage?kickoff-specimen'
import { TonightSlate } from '../../src/components/TonightSlate'
import { clockSnapshotAt, type Clock } from '../../src/lib/clock'
import { hoursSinceSync, META } from '../../src/lib/fixtures'
import type { CompetitionKey } from '../../src/lib/competitions'
import type { Fixture, StandingRow } from '../../src/lib/schema'
import { todayIso } from '../../src/lib/time'
import { ClockContext } from '../../src/lib/useNow'
import { edgeFixture } from '../fixtures/edgeFixtures'
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

const rows: { title: string; fixture: Fixture; stale?: boolean }[] = [
  { title: 'Kickoff not set', fixture: row('unset', { timeConfidence: 'tbd' }) },
  { title: 'Full time', fixture: row('ft', { status: 'full_time', result: { home: 2, away: 1 } }) },
  { title: 'After extra time', fixture: row('aet', { status: 'after_extra_time', result: { home: 2, away: 1 } }) },
  { title: 'Penalties', fixture: row('pens', { status: 'after_penalties', result: { home: 3, away: 3 }, shootout: { home: 2, away: 4 } }) },
  { title: 'Postponed', fixture: row('postponed', { status: 'postponed' }) },
  { title: 'Cancelled', fixture: row('cancelled', { status: 'cancelled' }) },
  { title: 'Suspended', fixture: row('suspended', { status: 'suspended' }) },
  { title: 'Abandoned', fixture: row('abandoned', { status: 'abandoned' }) },
  { title: 'Live', fixture: row('live', { status: 'in_play', result: { home: 1, away: 0 } }) },
  { title: 'Kicked off', fixture: row('stale', { status: 'in_play', result: { home: 1, away: 0 } }), stale: true },
  { title: 'Local time not known', fixture: row('no-zone', { venue: undefined, venueTz: undefined }) },
  // Madrid is already the next calendar day; Brooklyn is still the 22nd. The row derives both from one instant.
  { title: 'Day note', fixture: row('day-note', { kickoffUtc: '2026-11-22T23:30:00.000Z', venueTz: 'Europe/Madrid' }) },
]

const matchdays = [
  row('md-computed', { competition: 'ucl', phase: 'league-phase', season: 2026, round: '5', kickoffUtc: '2026-11-24T18:00:00.000Z' }),
  row('md-moved', { competition: 'ucl', phase: 'league-phase', season: 2026, round: '1', kickoffUtc: '2026-09-20T18:00:00.000Z' }),
  row('md-absent', { competition: 'ucl', phase: 'league-phase', season: 2026, kickoffUtc: '2026-09-30T18:00:00.000Z' }),
]

function standing(teamId: string, name: string, abbrev: string, rank: number, pts: number): StandingRow {
  return { teamId, name, shortName: name, abbrev, rank, rankChange: 0, played: 3, w: 1, d: 0, l: 2, gf: 4, ga: 3, pts }
}

const now = Date.now()
globalThis.__kickoffSpecimen = {
  rows: [
    standing('synth-unset', 'Specimen Unset', 'UNS', 1, 7),
    standing('synth-kicked', 'Specimen Kicked', 'KCK', 2, 4),
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
  'No upcoming fixtures match your filters.',
  'hidden by filters',
  'Specimen Unset',
  'Specimen Kicked',
  'time TBC',
]

function Harness() {
  const today = todayIso()
  const none = new Set<CompetitionKey>()
  useEffect(() => {
    const outer = window.setTimeout(() => {
      for (const specimen of ['rows', 'table']) {
        const root = document.querySelector(`[data-specimen="${specimen}"]`)
        if (!root) continue
        for (const button of root.querySelectorAll<HTMLButtonElement>('button[aria-expanded="false"]')) {
          if ((button.textContent ?? '').includes('Zones')) continue
          button.click()
        }
      }
      window.setTimeout(() => {
        const text = document.body.textContent ?? ''
        const missing = NEEDLES.filter((needle) => !text.includes(needle))
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
        {rows.map((item) => (
          <Section key={item.fixture.id} title={item.title}>
            <FixtureRow fixture={item.fixture} stale={item.stale ?? false} />
          </Section>
        ))}
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
        <NextUpStrip today={today} active={none} />
        <div style={{ height: 12 }} />
        <TonightSlate today={today} active={none} />
        <LedgerWeek days={[{ date: '2026-11-22', shown: [], total: 1, isToday: false }]} />
      </Section>
      <div data-specimen="table">
        <Section title="Table, unset and kicked off">
          {/* The query is a second module instance. The serve-only plugin passes the specimen into tableFor. */}
          <SpecimenTable />
        </Section>
      </div>
    </>
  )
}

createRoot(document.getElementById('root')!).render(<Harness />)
