#!/usr/bin/env tsx
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { espnProvider } from './providers/espn'
import { fetchStandings } from './providers/espn-standings'
import {
  diffFixtures,
  diffStandings,
  formatChanges,
  formatReportLine,
  hasUrgentChanges,
  implausibleShrink,
  mergeVerdict,
  type SyncReport,
} from './diff'
import {
  fixturesFileSchema,
  metaSchema,
  standingsFileSchema,
  type Fixture,
  type StandingsFile,
  type SyncMeta,
} from '../src/lib/schema'
import { addDays, todayIso } from '../src/lib/time'
import { validateFixtures } from './validate'

/**
 * The only writer of fixture data. Run it with `npm run sync`.
 *
 *   fetch -> normalize -> validate -> preserve hand-authored notes -> diff -> write
 *
 * Exits non-zero when something inside the urgency horizon moved, so a scheduled run can
 * surface it rather than updating silently: 0 clean, 1 something inside 72 h moved (after
 * writing), 2 failed. Fetch/validation failures occur before any snapshot write.
 * The last line of every successful fetch/validation run is the machine-readable report
 * (`report: changed=… … merge=…`, see formatReportLine) that sync.yml reads to decide whether
 * there is anything to commit — per-row fetchedAt stamps move on every run and are not
 * changes — and whether the PR it opens may merge itself (mergeVerdict).
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const FIXTURES = resolve(ROOT, 'src/data/fixtures.json')
const META = resolve(ROOT, 'src/data/meta.json')
const STANDINGS = resolve(ROOT, 'src/data/standings.json')

/**
 * Fixtures + standings are the authoritative snapshot boundary. Fetch and validate both
 * before writing either; even a standings outage intentionally delays fixture updates.
 * Ancillary datasets added later do not automatically join this boundary.
 */
type StandingsOutcome = { status: SyncReport['standings']; rankMoves: number; data: StandingsFile }

async function prepareStandings(): Promise<StandingsOutcome> {
  const previous: StandingsFile | null = existsSync(STANDINGS)
    ? standingsFileSchema.parse(JSON.parse(readFileSync(STANDINGS, 'utf8')))
    : null

  const standings = standingsFileSchema.parse(await fetchStandings())

  const { rowsChanged, moves } = diffStandings(previous, standings)
  console.log(
    `\nstandings: ${Object.entries(standings.leagues)
      .map(([k, v]) => `${k} ${v.length}`)
      .join(' · ')}`,
  )
  if (moves.length) console.log(`rank changes vs last snapshot:\n${moves.join('\n')}`)
  console.log(
    rowsChanged
      ? `${rowsChanged} standings row(s) changed vs last snapshot`
      : 'standings unchanged vs last snapshot',
  )

  return { status: rowsChanged > 0 ? 'changed' : 'unchanged', rankMoves: moves.length, data: standings }
}

const arg = (name: string, fallback: string) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : fallback
}

async function main() {
  const from = arg('from', addDays(todayIso(), -30))
  const to = arg('to', addDays(todayIso(), 150))
  const check = process.argv.includes('--check')

  console.log(`\nKickoff sync · ${from} .. ${to} · provider=${espnProvider.name}`)
  if (check) console.log('(--check: reporting only, nothing will be written)')

  const previous: Fixture[] = existsSync(FIXTURES)
    ? fixturesFileSchema.parse(JSON.parse(readFileSync(FIXTURES, 'utf8')))
    : []

  const { fixtures: fetched, counts } = await espnProvider.fetchWindow(from, to)

  // Validate at the boundary, all-or-nothing (see validate.ts). A row the schema rejects
  // is the provider changing shape, and this used to be a console.warn that dropped the row
  // and wrote the rest — a silent path the shrink guard could not see, because `counts`
  // came from before validation. Refuse to write instead, like every other guard.
  const { valid, rejected } = validateFixtures(fetched)
  if (rejected.length > 0) {
    throw new Error(
      `\n⚠  ${rejected.length} fetched row(s) failed the schema — the provider changed shape, ` +
        `or the mapper let a value through it shouldn't have — refusing to write:\n` +
        rejected.join('\n'),
    )
  }

  // Hand-authored notes are Beni's context (venue quirks, postponement reasons, why a
  // fixture matters). The provider knows nothing about them, so carry them forward by id.
  const notes = new Map(previous.filter((f) => f.note).map((f) => [f.id, f.note!]))
  for (const f of valid) {
    const carried = notes.get(f.id)
    if (carried) f.note = carried
  }

  valid.sort((a, b) => a.kickoffUtc.localeCompare(b.kickoffUtc) || a.id.localeCompare(b.id))

  // Only diff inside the fetched window: fixtures outside it are absent because we did not
  // ask for them, not because they were cancelled.
  const inWindow = (f: Fixture) => {
    const d = f.kickoffUtc.slice(0, 10)
    return d >= from && d <= to
  }
  const previousInWindow = previous.filter(inWindow)

  // A competition that shrank implausibly is a broken-response signal, checked before the
  // diff (which would otherwise just report a wall of DISAPPEARED lines) and before any write.
  const previousCountsByComp: Record<string, number> = {}
  for (const f of previousInWindow) {
    previousCountsByComp[f.competition] = (previousCountsByComp[f.competition] ?? 0) + 1
  }
  const shrink = implausibleShrink(previousCountsByComp, counts)
  if (shrink.length > 0) {
    throw new Error(
      `\n⚠  possible truncated or broken ESPN response — refusing to write:\n` +
        shrink
          .map(
            (s) =>
              `  ${s.competition}: had ${s.previous} fixtures in this window last sync, fetched only ${s.fetched}`,
          )
          .join('\n'),
    )
  }

  const changes = diffFixtures(previousInWindow, valid, {})

  console.log(`\nfetched ${valid.length} fixtures`)
  console.log(
    Object.entries(counts).map(([k, v]) => `  ${k.padEnd(14)} ${v}`).join('\n'),
  )
  console.log(`\nchanges vs last snapshot:\n${formatChanges(changes)}`)

  // The verdict sync.yml reads. Printed last, in both modes, after the standings outcome
  // is known — a failed standings fetch aborts before reaching this report. The merge
  // verdict's reasons print just above it, so a held PR's body says why it is held.
  const reportFor = (standings: StandingsOutcome): string => {
    const merge = mergeVerdict(changes, standings.status)
    const why =
      merge.verdict === 'hold'
        ? `hold for a human:\n${merge.reasons.map((r) => `  - ${r}`).join('\n')}\n`
        : 'no hold reasons — a change-bearing PR from this run may merge itself.\n'
    return (
      why +
      formatReportLine({
        changes: changes.length,
        urgent: changes.filter((c) => c.urgent && c.kind !== 'NEW').length,
        standings: standings.status,
        rankMoves: standings.rankMoves,
        merge: merge.verdict,
      })
    )
  }

  const standings = await prepareStandings()

  if (check) {
    console.log('\n--check: no files written.')
    console.log(reportFor(standings))
    return hasUrgentChanges(changes) ? 1 : 0
  }

  const meta: SyncMeta = metaSchema.parse({
    lastSyncAt: new Date().toISOString(),
    provider: 'espn',
    window: { from, to },
    counts,
    total: valid.length,
  })

  // All provider work, schema checks and serialization precede the first write.
  // Git publishes these three files together; a failed run is never committed by sync.yml.
  const payloads = [
    [FIXTURES, JSON.stringify(valid, null, 2) + '\n'],
    [META, JSON.stringify(meta, null, 2) + '\n'],
    [STANDINGS, JSON.stringify(standings.data, null, 2) + '\n'],
  ] as const
  for (const [path, content] of payloads) writeFileSync(path, content)
  console.log(`\nwrote src/data/fixtures.json (${valid.length}), src/data/meta.json and src/data/standings.json`)

  if (hasUrgentChanges(changes)) {
    console.log('\n⚠  Something inside 72h moved. Re-check any open position on it.')
  }
  console.log(`\n${reportFor(standings)}`)
  return hasUrgentChanges(changes) ? 1 : 0
}

/** The CLI's exit-code boundary, also exercised by integration tests with intercepted IO. */
export async function runSync(): Promise<number> {
  try {
    return await main()
  } catch (err) {
    console.error('\nsync failed:', err instanceof Error ? err.message : err)
    return 2
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = await runSync()
}
