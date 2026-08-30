#!/usr/bin/env tsx
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { espnProvider } from './providers/espn'
import { fetchStandings } from './providers/espn-standings'
import { diffFixtures, formatChanges, hasUrgentChanges } from './diff'
import {
  fixturesFileSchema,
  metaSchema,
  standingsFileSchema,
  type Fixture,
  type StandingsFile,
  type SyncMeta,
} from '../src/lib/schema'
import { addDays, todayIso } from '../src/lib/time'

/**
 * The only writer of fixture data. Run it with `npm run sync`.
 *
 *   fetch -> normalize -> validate -> preserve hand-authored notes -> diff -> write
 *
 * Exits non-zero when something inside the urgency horizon moved, so a scheduled run can
 * surface it rather than updating silently.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const FIXTURES = resolve(ROOT, 'src/data/fixtures.json')
const META = resolve(ROOT, 'src/data/meta.json')
const STANDINGS = resolve(ROOT, 'src/data/standings.json')

/**
 * League tables, fetched after the fixtures are safely written. Rank moves are reported
 * for the same reason fixture moves are — the table is betting context — but standings are
 * secondary data: a failure here (a 503 on one league, an upstream payload reshape) warns
 * and keeps the previous committed snapshot rather than aborting, so it can never discard
 * a successful fixtures sync or change the exit code.
 */
async function syncStandings(check: boolean): Promise<void> {
  try {
    const previous: StandingsFile | null = existsSync(STANDINGS)
      ? standingsFileSchema.parse(JSON.parse(readFileSync(STANDINGS, 'utf8')))
      : null

    const standings = await fetchStandings()

    const moves: string[] = []
    for (const [league, rows] of Object.entries(standings.leagues)) {
      const before = new Map((previous?.leagues[league] ?? []).map((r) => [r.teamId, r.rank]))
      for (const r of rows) {
        const prev = before.get(r.teamId)
        if (prev !== undefined && prev !== r.rank) {
          moves.push(`  ${league.padEnd(12)} ${r.name}: ${prev} -> ${r.rank}`)
        }
      }
    }
    console.log(
      `\nstandings: ${Object.entries(standings.leagues)
        .map(([k, v]) => `${k} ${v.length}`)
        .join(' · ')}`,
    )
    if (moves.length) console.log(`rank changes vs last snapshot:\n${moves.join('\n')}`)

    if (!check) {
      writeFileSync(STANDINGS, JSON.stringify(standings, null, 2) + '\n')
      console.log('wrote src/data/standings.json')
    }
  } catch (err) {
    console.error(
      `\n⚠  standings sync failed — fixtures are unaffected, previous standings kept:\n` +
        `   ${err instanceof Error ? err.message : err}`,
    )
  }
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

  // Validate at the boundary. A row that fails the schema is reported and dropped — never
  // coerced into something plausible, which is how bad data gets laundered into good-looking
  // data. A hard failure here is a signal that the provider changed shape.
  const valid: Fixture[] = []
  for (const candidate of fetched) {
    const parsed = fixturesFileSchema.safeParse([candidate])
    if (parsed.success) valid.push(parsed.data[0]!)
    else console.warn(`  ! dropped ${candidate.id}: ${parsed.error.issues[0]?.message}`)
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
  const changes = diffFixtures(previous.filter(inWindow), valid, {})

  console.log(`\nfetched ${valid.length} fixtures`)
  console.log(
    Object.entries(counts).map(([k, v]) => `  ${k.padEnd(14)} ${v}`).join('\n'),
  )
  console.log(`\nchanges vs last snapshot:\n${formatChanges(changes)}`)

  if (check) {
    await syncStandings(true)
    console.log('\n--check: no files written.')
    process.exit(hasUrgentChanges(changes) ? 1 : 0)
  }

  const meta: SyncMeta = metaSchema.parse({
    lastSyncAt: new Date().toISOString(),
    provider: 'espn',
    window: { from, to },
    counts,
    total: valid.length,
  })

  writeFileSync(FIXTURES, JSON.stringify(valid, null, 2) + '\n')
  writeFileSync(META, JSON.stringify(meta, null, 2) + '\n')
  console.log(`\nwrote src/data/fixtures.json (${valid.length}) and src/data/meta.json`)

  await syncStandings(false)

  if (hasUrgentChanges(changes)) {
    console.log('\n⚠  Something inside 72h moved. Re-check any open position on it.')
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('\nsync failed:', err instanceof Error ? err.message : err)
  process.exit(2)
})
