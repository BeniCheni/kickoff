import { execFileSync } from 'node:child_process'

export function clearGitRepositoryEnv() {
  // This query lists names without opening a repository, even under an inherited GIT_DIR.
  const names = execFileSync('git', ['rev-parse', '--local-env-vars'], { encoding: 'utf8' })
  for (const name of names.trim().split(/\r?\n/)) delete process.env[name]
}

// Clear the Node test worker's environment before tests load. In-process Git callers
// and child scripts (including ones that spread process.env) inherit the same cleanup.
clearGitRepositoryEnv()
