import type { Fixture, StandingRow, StandingsFile } from '../src/lib/schema'
import { brooklynDate } from '../src/lib/time'

/**
 * Compares a freshly-fetched fixture set against the committed snapshot and reports what
 * moved. This is the load-bearing safety feature of the whole project.
 *
 * The motivating case: on 19 Aug 2026 the LFP moved PSG-Rennes out of the Parc des Princes,
 * which flipped it to Rennes at home. In a hand-maintained file that change was invisible —
 * the dashboard simply kept showing a fixture that no longer existed, with the wrong team at
 * home, which inverts the moneyline. Here it surfaces as a HOME_AWAY_INVERTED line and a
 * non-zero exit code.
 */

export type ChangeKind =
  | 'NEW'
  | 'DISAPPEARED'
  | 'HOME_AWAY_INVERTED'
  | 'DATE_MOVED'
  | 'TIME_CHANGED'
  | 'STATUS_CHANGED'
  | 'VENUE_CHANGED'
  | 'TIME_CONFIDENCE_CHANGED'

export type Change = {
  kind: ChangeKind
  id: string
  label: string
  detail: string
  /** Kickoff is inside the urgency horizon — likely to have money on it. */
  urgent: boolean
}

const HOURS = 3_600_000

/**
 * How close two kickoffs must be before a reversed pairing is read as one fixture inverting
 * rather than as the reverse leg of the season. A relocation moves a fixture by days; the
 * return leg sits months away.
 */
const INVERSION_WINDOW_DAYS = 10

function label(f: Fixture): string {
  return `${f.competition} · ${f.home.name} v ${f.away.name}`
}

/** Same two clubs, opposite roles. */
function isInversion(before: Fixture, after: Fixture): boolean {
  return (
    before.competition === after.competition &&
    before.home.name === after.away.name &&
    before.away.name === after.home.name
  )
}

function inversionDetail(before: Fixture, after: Fixture): string {
  const venue =
    before.venue !== after.venue
      ? ` · venue ${before.venue ?? '?'} -> ${after.venue ?? '?'}`
      : ''
  return `was ${before.home.name} at home, now ${after.home.name} at home${venue}`
}

export type DiffOptions = {
  /** Kickoffs within this many hours of `now` are flagged urgent. Default 72. */
  urgentWithinHours?: number
  now?: Date
}

export function diffFixtures(
  previous: Fixture[],
  next: Fixture[],
  options: DiffOptions = {},
): Change[] {
  const { urgentWithinHours = 72, now = new Date() } = options
  const prev = new Map(previous.map((f) => [f.id, f]))
  const curr = new Map(next.map((f) => [f.id, f]))
  const changes: Change[] = []

  const isUrgent = (f: Fixture) => {
    const delta = Date.parse(f.kickoffUtc) - now.getTime()
    return delta >= -6 * HOURS && delta <= urgentWithinHours * HOURS
  }

  const consumed = new Set<string>()

  // Pass 1 — fixtures present in both, compared field by field.
  for (const [id, after] of curr) {
    const before = prev.get(id)
    if (!before) continue
    consumed.add(id)
    const urgent = isUrgent(after) || isUrgent(before)

    // The provider keeps its event id when a fixture is relocated, so a home/away swap shows
    // up here as the same fixture with its roles exchanged. This is the LFP moving
    // PSG-Rennes out of the Parc des Princes on 19 Aug 2026 — it inverts the moneyline.
    if (isInversion(before, after)) {
      changes.push({
        kind: 'HOME_AWAY_INVERTED', id, label: label(after), urgent,
        detail: inversionDetail(before, after),
      })
    }

    const beforeDate = brooklynDate(before.kickoffUtc)
    const afterDate = brooklynDate(after.kickoffUtc)

    if (beforeDate !== afterDate) {
      changes.push({
        kind: 'DATE_MOVED', id, label: label(after), urgent,
        detail: `${beforeDate} -> ${afterDate} (ET)`,
      })
    } else if (before.kickoffUtc !== after.kickoffUtc) {
      changes.push({
        kind: 'TIME_CHANGED', id, label: label(after), urgent,
        detail: `${before.kickoffUtc} -> ${after.kickoffUtc}`,
      })
    }

    if (before.status !== after.status) {
      changes.push({
        kind: 'STATUS_CHANGED', id, label: label(after),
        urgent: urgent || after.status === 'postponed' || after.status === 'cancelled',
        detail: `${before.status} -> ${after.status}`,
      })
    }
    if (before.venue !== after.venue) {
      changes.push({
        kind: 'VENUE_CHANGED', id, label: label(after), urgent,
        detail: `${before.venue ?? '(none)'} -> ${after.venue ?? '(none)'}`,
      })
    }
    if (before.timeConfidence !== after.timeConfidence) {
      changes.push({
        kind: 'TIME_CONFIDENCE_CHANGED', id, label: label(after), urgent: false,
        detail: `${before.timeConfidence} -> ${after.timeConfidence}`,
      })
    }
  }

  // Pass 2 — fallback for a provider that recreates the event instead of editing it: a
  // fixture vanishes while its mirror image appears. Guarded by a kickoff-proximity window,
  // because over a full season EVERY pairing legitimately appears in both directions — the
  // reverse leg is a different fixture, not an inversion.
  const orphanedPrev = [...prev.values()].filter((f) => !consumed.has(f.id) && !curr.has(f.id))
  for (const [id, after] of curr) {
    if (consumed.has(id) || prev.has(id)) continue
    const mirror = orphanedPrev.find(
      (before) =>
        !consumed.has(before.id) &&
        isInversion(before, after) &&
        Math.abs(Date.parse(before.kickoffUtc) - Date.parse(after.kickoffUtc)) <=
          INVERSION_WINDOW_DAYS * 24 * HOURS,
    )
    if (mirror) {
      consumed.add(id)
      consumed.add(mirror.id)
      changes.push({
        kind: 'HOME_AWAY_INVERTED', id, label: label(after),
        urgent: isUrgent(after) || isUrgent(mirror),
        detail: inversionDetail(mirror, after),
      })
    }
  }

  for (const [id, after] of curr) {
    if (consumed.has(id) || prev.has(id)) continue
    changes.push({ kind: 'NEW', id, label: label(after), urgent: false,
      detail: `${brooklynDate(after.kickoffUtc)} ET` })
  }
  for (const [id, before] of prev) {
    if (consumed.has(id) || curr.has(id)) continue
    changes.push({ kind: 'DISAPPEARED', id, label: label(before), urgent: isUrgent(before),
      detail: `was ${brooklynDate(before.kickoffUtc)} ET` })
  }

  const RANK: Record<ChangeKind, number> = {
    HOME_AWAY_INVERTED: 0, DATE_MOVED: 1, STATUS_CHANGED: 2, TIME_CHANGED: 3,
    VENUE_CHANGED: 4, DISAPPEARED: 5, NEW: 6, TIME_CONFIDENCE_CHANGED: 7,
  }
  return changes.sort(
    (a, b) => Number(b.urgent) - Number(a.urgent) || RANK[a.kind] - RANK[b.kind],
  )
}

/** Changes that should stop a script: something with money on it moved. */
export function hasUrgentChanges(changes: Change[]): boolean {
  return changes.some((c) => c.urgent && c.kind !== 'NEW')
}

/**
 * A competition whose freshly-fetched, in-window count falls far short of what the previous
 * snapshot held in that same window is more likely a truncated or reshaped ESPN response than
 * a league that genuinely lost most of its fixtures — writing it would silently disappear real
 * matches as a wall of DISAPPEARED lines nobody is watching for. `ratio` is the floor: the
 * fetched count must be at least `ratio` of the previous one to be trusted. A previous count of
 * zero is exempt — a competition with no prior snapshot, or a cup whose fixtures have all
 * rolled out of the window, legitimately reaches zero.
 */
export function implausibleShrink(
  previousCounts: Readonly<Record<string, number>>,
  fetchedCounts: Readonly<Record<string, number>>,
  ratio = 0.5,
): Array<{ competition: string; previous: number; fetched: number }> {
  const offenders: Array<{ competition: string; previous: number; fetched: number }> = []
  for (const [competition, previous] of Object.entries(previousCounts)) {
    if (previous === 0) continue
    const fetched = fetchedCounts[competition] ?? 0
    if (fetched < previous * ratio) offenders.push({ competition, previous, fetched })
  }
  return offenders.sort((a, b) => a.competition.localeCompare(b.competition))
}

export function formatChanges(changes: Change[]): string {
  if (!changes.length) return '  no changes'
  return changes
    .map((c) => `  ${c.urgent ? '⚠ ' : '  '}${c.kind.padEnd(24)} ${c.label}\n${' '.repeat(29)}${c.detail}`)
    .join('\n')
}

/* ---------- the standings side of the report ------------------------------------------- */

function sameRow(a: StandingRow, b: StandingRow): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]) as Set<keyof StandingRow>
  for (const k of keys) if (a[k] !== b[k]) return false
  return true
}

/**
 * What moved in the league tables. A row counts as changed when any field a reader can see
 * differs — rank, but also played, W/D/L, goals and points, which move on every matchday
 * even when the order holds: the leader winning again changes no rank and every number in
 * its row, and the Table renders those numbers. Rank moves are also listed by name, because
 * they are the betting context a reviewer scans for. `previous === null` is a first sync:
 * every row is new, nothing "moved".
 */
export function diffStandings(
  previous: StandingsFile | null,
  next: StandingsFile,
): { rowsChanged: number; moves: string[] } {
  const moves: string[] = []
  let rowsChanged = 0
  for (const [league, rows] of Object.entries(next.leagues)) {
    const before = new Map((previous?.leagues[league] ?? []).map((r) => [r.teamId, r]))
    for (const r of rows) {
      const prev = before.get(r.teamId)
      if (!prev || !sameRow(prev, r)) rowsChanged++
      if (prev && prev.rank !== r.rank) {
        moves.push(`  ${league.padEnd(12)} ${r.name}: ${prev.rank} -> ${r.rank}`)
      }
      before.delete(r.teamId)
    }
    rowsChanged += before.size // rows the previous table had and this one lacks
  }
  for (const league of Object.keys(previous?.leagues ?? {})) {
    if (!(league in next.leagues)) rowsChanged += previous!.leagues[league]!.length
  }
  return { rowsChanged, moves }
}

/* ---------- the report line: the one place "did anything change" is decided ------------ */

export type SyncReport = {
  /** Lines the fixture diff engine produced, of every kind, urgent or not. */
  changes: number
  /** Of those, the ones inside the urgency horizon (what exit code 1 means). */
  urgent: number
  /** `failed` keeps the previous table and is never a reason to commit. */
  standings: 'changed' | 'unchanged' | 'failed'
  rankMoves: number
}

/**
 * Whether a sync produced anything worth committing. Per-row `fetchedAt` stamps and
 * `lastSyncAt` move on every run by construction and are not changes — which is why the
 * scheduled workflow reads this verdict instead of `git diff` (a git-level test opened a PR
 * on every run, "no changes" or not). Any diff-engine line counts, NEW and
 * TIME_CONFIDENCE_CHANGED included: each is data the app renders.
 */
export function reportSaysChanged(r: SyncReport): boolean {
  return r.changes > 0 || r.standings === 'changed'
}

/**
 * The last line every sync run prints — machine-readable, greppable, stable. sync.yml
 * extracts `changed=` and `standings=` from it with a fixed regex and refuses to run the
 * commit/PR half of the job when the line is missing or malformed, so: add fields at the
 * end if you must, never rename, reorder or drop these.
 */
export function formatReportLine(r: SyncReport): string {
  return (
    `report: changed=${reportSaysChanged(r)} changes=${r.changes} urgent=${r.urgent} ` +
    `standings=${r.standings} rank-moves=${r.rankMoves}`
  )
}
