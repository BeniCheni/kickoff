import { execFileSync, spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

export function history(roots: string[]) {
  const root = mkdtempSync(path.join(tmpdir(), 'vercel-ignore-')); roots.push(root)
  // Use the real input graph and script, but a fabricated Git history.
  for (const entry of ['web', 'src', 'scripts', 'tests/fixtures']) {
    cpSync(entry, path.join(root, entry), { recursive: true, filter: file => !/(?:^|\/)(?:node_modules|\.next|generated)(?:\/|$)/.test(file) })
  }
  const git = (...args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  git('init', '-b', 'feature')
  git('config', 'user.name', 'Fixture'); git('config', 'user.email', 'fixture@example.invalid')
  // The fabricated repository starts no work of its own. `git commit` otherwise launches a
  // detached `git maintenance run --auto`, and on Git 2.54 that run's geometric-repack task
  // repacks when objects/17 holds two loose objects and does not when it holds one. gc.auto
  // is not the switch: 0 and 6700 both still repack at two. The repack is still writing
  // .git/objects when afterEach removes the directory, and rmSync throws ENOTEMPTY.
  // maintenance.auto=false stops the run. gc.auto=0 only covers the older loose-object
  // estimate (~6700/256). The copied tree held two such objects at 0faf606 and one at
  // ddd9a37, f7775c9 and 89b8067 (PR #320 review).
  git('config', 'maintenance.auto', 'false'); git('config', 'gc.auto', '0')
  const commit = (file: string) => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true })
    writeFileSync(path.join(root, file), `${file} ${git('rev-list', '--count', '--all')}\n`)
    git('add', '--', file); git('commit', '-m', 'fabricated history')
    return git('rev-parse', 'HEAD')
  }
  git('add', '.'); git('commit', '-m', 'base')
  const previous = git('rev-parse', 'HEAD')
  const run = (branch = 'feature', prior = previous, cwd = root) => spawnSync(process.execPath, ['scripts/vercel-ignore.mjs'], {
    cwd: path.join(cwd, 'web'), encoding: 'utf8',
    env: { ...process.env, VERCEL_GIT_COMMIT_REF: branch, VERCEL_GIT_PREVIOUS_SHA: prior, VERCEL_GIT_COMMIT_SHA: git('rev-parse', 'HEAD') },
  }).status
  return { root, previous, commit, run }
}

export function repoWithSnapshot(roots: string[], committed: string, workingTree: string): string {
  const root = mkdtempSync(path.resolve(tmpdir(), 'publish-gate-')); roots.push(root)
  const git = (...args: string[]) => execFileSync(
    'git',
    ['-c', 'user.name=t', '-c', 'user.email=t@example.com', '-c', 'commit.gpgsign=false', ...args],
    { cwd: root, stdio: 'ignore' },
  )
  const write = (stamp: string) =>
    writeFileSync(path.resolve(root, 'src/data/meta.json'), JSON.stringify({ lastSyncAt: stamp }) + '\n')
  git('init', '-q', '-b', 'main')
  mkdirSync(path.resolve(root, 'src/data'), { recursive: true })
  write(committed)
  git('add', 'src/data/meta.json')
  git('commit', '-qm', 'snapshot')
  write(workingTree)  // what scripts/sync.ts leaves behind before the gate step runs
  return root
}
