import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** A quiet snapshot at least this old is published so the header stamp stays inside the 24h banner. */
export const QUIET_PUBLISH_AFTER_HOURS = 20

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * The age this gate must weigh is the *committed* snapshot's — the one `main` holds and Pages
 * serves — never the one in the working tree. By the time sync.yml reaches the gate,
 * `npm run sync` has already rewritten `src/data/meta.json` with this run's own `lastSyncAt`
 * (scripts/sync.ts), so reading the file made every run look fresh: `publish` collapsed into
 * `changed`, the 20-hour refresh never fired, and a quiet stretch would freeze the header
 * stamp while every run stayed green (found in the PR #183 review, 12 Oct 2026).
 * `root` exists for the test; an unreadable baseline returns '' so the age is NaN and the
 * run publishes rather than guessing.
 */
export function committedLastSyncAt(root: string = ROOT): string {
  try {
    const json = execFileSync('git', ['show', 'HEAD:src/data/meta.json'], {
      cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    })
    return (JSON.parse(json) as { lastSyncAt?: string }).lastSyncAt ?? ''
  } catch {
    return ''
  }
}

export function snapshotAgeHours(lastSyncAt: string, now = Date.now()): number {
  return (now - Date.parse(lastSyncAt)) / 3_600_000
}

/**
 * Publish when the diff found a real change, or when the committed snapshot is stale.
 * A finite age under 20 hours with nothing changed is a fetch-only success.
 * A missing or non-finite age publishes: the stamp cannot be trusted.
 */
export function shouldPublish(changed: boolean, ageHours: number): boolean {
  const fresh = Number.isFinite(ageHours) && ageHours < QUIET_PUBLISH_AFTER_HOURS
  return changed || !fresh
}

if (process.env.PUBLISH_GATE_CLI === '1') {
  const changed = process.env.SYNC_CHANGED === 'true'
  const age = snapshotAgeHours(committedLastSyncAt())
  process.stdout.write(shouldPublish(changed, age) ? 'true' : 'false')
}
