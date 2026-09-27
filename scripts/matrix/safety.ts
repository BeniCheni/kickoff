import { execFileSync } from 'node:child_process'
import { existsSync, realpathSync } from 'node:fs'
import path from 'node:path'

export function gitTopLevel(cwd = process.cwd()): string {
  return execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd, encoding: 'utf8' }).trim()
}

export function gitHead(cwd = process.cwd()): string {
  return execFileSync('git', ['rev-parse', 'HEAD'], { cwd, encoding: 'utf8' }).trim()
}

/**
 * `--out` must not resolve inside the repo, including through a symlink whose
 * real path lands in the worktree. Missing leaf directories are allowed; the
 * nearest existing ancestor is what gets realpath'd.
 */
export function assertOutsideRepo(outDir: string, repoRoot: string): string {
  const repo = realpathSync(repoRoot)
  const abs = path.resolve(outDir)
  const missing: string[] = []
  let cursor = abs
  while (!existsSync(cursor)) {
    const parent = path.dirname(cursor)
    if (parent === cursor) break
    missing.push(path.basename(cursor))
    cursor = parent
  }
  if (!existsSync(cursor)) {
    throw new Error(`--out has no existing ancestor: ${abs}`)
  }
  const realBase = realpathSync(cursor)
  const resolved = path.join(realBase, ...missing.reverse())
  const prefix = repo.endsWith(path.sep) ? repo : repo + path.sep
  if (resolved === repo || resolved.startsWith(prefix)) {
    throw new Error(`--out resolves inside the repo (${repo}); generated receipts must stay outside git: ${resolved}`)
  }
  return resolved
}
