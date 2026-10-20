import { afterEach, describe, expect, it } from 'vitest'
import { execFileSync, spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const roots: string[] = []
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }) })

function history() {
  const root = mkdtempSync(path.join(tmpdir(), 'vercel-ignore-')); roots.push(root)
  // Use the real input graph and script, but a fabricated Git history.
  for (const entry of ['web', 'src', 'scripts', 'tests/fixtures']) {
    cpSync(entry, path.join(root, entry), { recursive: true, filter: file => !/(?:^|\/)(?:node_modules|\.next|generated)(?:\/|$)/.test(file) })
  }
  const git = (...args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  git('init', '-b', 'feature')
  git('config', 'user.name', 'Fixture'); git('config', 'user.email', 'fixture@example.invalid')
  const commit = (file: string) => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true })
    writeFileSync(path.join(root, file), `${file} ${git('rev-list', '--count', '--all')}\n`)
    git('add', '--', file); git('commit', '-m', 'fabricated history')
    return git('rev-parse', 'HEAD')
  }
  git('add', '.'); git('commit', '-m', 'base')
  const previous = git('rev-parse', 'HEAD')
  const run = (branch = 'feature', prior = previous) => spawnSync(process.execPath, ['scripts/vercel-ignore.mjs'], {
    cwd: path.join(root, 'web'), encoding: 'utf8',
    env: { ...process.env, VERCEL_GIT_COMMIT_REF: branch, VERCEL_GIT_PREVIOUS_SHA: prior, VERCEL_GIT_COMMIT_SHA: git('rev-parse', 'HEAD') },
  }).status
  return { root, previous, commit, run }
}

describe('Vercel ignored build step', () => {
  it('always builds main, even with a docs-only diff', () => {
    const h = history(); h.commit('docs/note.md')
    expect(h.run('main')).toBe(1)
  })
  it('skips a proven docs-only branch push', () => {
    const h = history(); h.commit('docs/note.md')
    expect(h.run()).toBe(0)
  })
  it('builds a web change three commits back in one push', () => {
    const h = history(); h.commit('web/public/probe.txt'); h.commit('docs/one.md'); h.commit('docs/two.md'); h.commit('docs/three.md')
    expect(h.run()).toBe(1)
  })
  it.each(['', 'f'.repeat(40), '--help'])('builds with missing, absent-from-clone, or malformed previous SHA %j', prior => {
    const h = history(); h.commit('docs/note.md')
    expect(h.run('feature', prior)).toBe(1)
  })
  it.each(['src/lib/time.ts', 'src/data/fixtures.json', 'scripts/themeBootstrap.ts', 'packages/new/input.ts', 'package-lock.json', 'public/favicon.svg'])(
    'builds a changed shared input: %s', file => {
      const h = history(); h.commit(file)
      expect(h.run()).toBe(1)
    },
  )
  it('builds if the input graph cannot be resolved', () => {
    const h = history(); h.commit('docs/note.md')
    rmSync(path.join(h.root, 'src/lib/time.ts'))
    expect(h.run()).toBe(1)
  })
})
