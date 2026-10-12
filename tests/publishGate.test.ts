import { afterEach, describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import {
  QUIET_PUBLISH_AFTER_HOURS,
  committedLastSyncAt,
  shouldPublish,
  snapshotAgeHours,
} from '../scripts/publish-gate'

it('publishes a real change even when the snapshot is fresh', () => {
  expect(shouldPublish(true, 1)).toBe(true)
  expect(shouldPublish(true, 0)).toBe(true)
})

it('skips a quiet check inside the 20-hour window', () => {
  expect(shouldPublish(false, 0)).toBe(false)
  expect(shouldPublish(false, QUIET_PUBLISH_AFTER_HOURS - 0.01)).toBe(false)
})

it('publishes a quiet check once the snapshot is 20 hours old', () => {
  expect(shouldPublish(false, QUIET_PUBLISH_AFTER_HOURS)).toBe(true)
  expect(shouldPublish(false, 48)).toBe(true)
})

it('publishes when the snapshot age cannot be read', () => {
  expect(shouldPublish(false, Number.NaN)).toBe(true)
  expect(shouldPublish(false, Number.POSITIVE_INFINITY)).toBe(true)
  expect(Number.isFinite(snapshotAgeHours(''))).toBe(false)
})

// The gate's *input* is the half that broke in review: the arithmetic above was already right,
// while the age it was handed came from the working-tree meta.json that `npm run sync` had
// just rewritten — so every run looked fresh and the 20-hour refresh never fired. These cases
// run against a real git repository, because that is what sync.yml's gate step runs against.
describe('the age the gate measures comes from the committed snapshot, not the working tree', () => {
  const roots: string[] = []
  afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }) })

  function repoWithSnapshot(committed: string, workingTree: string): string {
    const root = mkdtempSync(resolve(tmpdir(), 'publish-gate-')); roots.push(root)
    const git = (...args: string[]) => execFileSync(
      'git',
      ['-c', 'user.name=t', '-c', 'user.email=t@example.com', '-c', 'commit.gpgsign=false', ...args],
      { cwd: root, stdio: 'ignore' },
    )
    const write = (stamp: string) =>
      writeFileSync(resolve(root, 'src/data/meta.json'), JSON.stringify({ lastSyncAt: stamp }) + '\n')
    git('init', '-q', '-b', 'main')
    mkdirSync(resolve(root, 'src/data'), { recursive: true })
    write(committed)
    git('add', 'src/data/meta.json')
    git('commit', '-qm', 'snapshot')
    write(workingTree)  // what scripts/sync.ts leaves behind before the gate step runs
    return root
  }

  it('publishes a quiet refresh of a stale snapshot the sync has already overwritten', () => {
    const committed = new Date(Date.now() - 56 * 3_600_000).toISOString()
    const root = repoWithSnapshot(committed, new Date().toISOString())
    expect(committedLastSyncAt(root)).toBe(committed)
    expect(shouldPublish(false, snapshotAgeHours(committedLastSyncAt(root)))).toBe(true)
  })

  it('stays quiet when the committed snapshot is itself fresh', () => {
    const root = repoWithSnapshot(new Date(Date.now() - 3 * 3_600_000).toISOString(), new Date().toISOString())
    expect(shouldPublish(false, snapshotAgeHours(committedLastSyncAt(root)))).toBe(false)
  })

  it('publishes when there is no committed snapshot to read', () => {
    const root = mkdtempSync(resolve(tmpdir(), 'publish-gate-')); roots.push(root)
    expect(committedLastSyncAt(root)).toBe('')
    expect(shouldPublish(false, snapshotAgeHours(committedLastSyncAt(root)))).toBe(true)
  })
})
