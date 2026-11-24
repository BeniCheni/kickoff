import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it, vi } from 'vitest'
import { committedLastSyncAt } from '../scripts/publish-gate'
import { history, repoWithSnapshot } from './helpers/gitFixtures'
import { clearGitRepositoryEnv } from './setupGitEnv'

it.each([
  { label: 'GIT_DIR', allFive: false },
  { label: 'all five repository selectors', allFive: true },
])('keeps Git fixture writes out of a decoy selected by $label', ({ allFive }) => {
  const decoy = mkdtempSync(join(tmpdir(), 'git-env-decoy-'))
  const roots = [decoy]
  const git = (cwd: string, ...args: string[]) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()

  try {
    git(decoy, 'init', '-q', '-b', 'main')
    const gitDir = join(decoy, '.git')
    const config = join(gitDir, 'config')
    const before = readFileSync(config)
    vi.stubEnv('GIT_DIR', gitDir)
    if (allFive) {
      vi.stubEnv('GIT_WORK_TREE', decoy)
      vi.stubEnv('GIT_INDEX_FILE', join(gitDir, 'index'))
      vi.stubEnv('GIT_COMMON_DIR', gitDir)
      vi.stubEnv('GIT_OBJECT_DIRECTORY', join(gitDir, 'objects'))
    }
    vi.stubEnv('GIT_EDITOR', 'keep-editor')
    vi.stubEnv('GIT_SSH_COMMAND', 'keep-ssh')
    vi.stubEnv('VERCEL_GIT_COMMIT_REF', 'keep-vercel-ref')

    clearGitRepositoryEnv()

    const h = history(roots)
    const head = h.commit('docs/note.md')
    const ignored = h.run()
    const committed = '2026-11-22T00:00:00.000Z'
    const snapshot = repoWithSnapshot(roots, committed, '2026-11-23T00:00:00.000Z')
    const stamp = committedLastSyncAt(snapshot)

    expect(readFileSync(config).equals(before), 'decoy config changed').toBe(true)
    expect(git(decoy, 'for-each-ref')).toBe('')
    expect(git(decoy, 'cat-file', '--batch-all-objects', '--batch-check=%(objectname)')).toBe('')
    expect(git(h.root, 'rev-list', 'HEAD').split('\n')).toEqual([head, h.previous])
    expect(git(snapshot, 'log', '--format=%s')).toBe('snapshot')
    expect(ignored).toBe(0)
    expect(stamp).toBe(committed)
    expect(process.env.GIT_EDITOR).toBe('keep-editor')
    expect(process.env.GIT_SSH_COMMAND).toBe('keep-ssh')
    expect(process.env.VERCEL_GIT_COMMIT_REF).toBe('keep-vercel-ref')
  } finally {
    vi.unstubAllEnvs()
    for (const root of roots) rmSync(root, { recursive: true, force: true })
  }
})

it('runs the node project setup before vercelSmoke reads Git HEAD at load', () => {
  const root = fileURLToPath(new URL('../', import.meta.url))
  const decoy = mkdtempSync(join(tmpdir(), 'git-setup-decoy-'))
  try {
    execFileSync('git', ['init', '-q', decoy])
    const gitDir = join(decoy, '.git')
    const config = join(gitDir, 'config')
    const before = readFileSync(config)
    const child = spawnSync(process.execPath, [
      join(root, 'node_modules/vitest/vitest.mjs'), 'run', '--project', 'node', 'tests/vercelSmoke.test.ts',
    ], { cwd: root, env: { ...process.env, GIT_DIR: gitDir }, encoding: 'utf8', timeout: 30_000 })

    if (child.error) throw child.error
    expect(child.status, `vercelSmoke failed under the GIT_DIR decoy\n${child.stdout}\n${child.stderr}`).toBe(0)
    expect(readFileSync(config)).toEqual(before)
    const git = (...args: string[]) => execFileSync('git', [`--git-dir=${gitDir}`, ...args], { encoding: 'utf8' })
    expect(git('for-each-ref')).toBe('')
    const objects = git('count-objects', '-v')
    expect(objects).toMatch(/^count: 0$/m)
    expect(objects).toMatch(/^in-pack: 0$/m)
  } finally {
    rmSync(decoy, { recursive: true, force: true })
  }
}, 30_000)
