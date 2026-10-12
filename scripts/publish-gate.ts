import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/** A quiet snapshot at least this old is published so the header stamp stays inside the 24h banner. */
export const QUIET_PUBLISH_AFTER_HOURS = 20

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
  const metaPath = fileURLToPath(new URL('../src/data/meta.json', import.meta.url))
  const meta = JSON.parse(readFileSync(metaPath, 'utf8')) as { lastSyncAt?: string }
  const changed = process.env.SYNC_CHANGED === 'true'
  const age = snapshotAgeHours(meta.lastSyncAt ?? '')
  process.stdout.write(shouldPublish(changed, age) ? 'true' : 'false')
}
