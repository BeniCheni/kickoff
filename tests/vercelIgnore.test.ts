import { afterEach, describe, expect, it } from 'vitest'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { history as createHistory } from './helpers/gitFixtures'

const roots: string[] = []
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }) })

const history = () => createHistory(roots)

describe('Vercel ignored build step', () => {
  it('always builds main, even with a docs-only diff', () => {
    const h = history(); h.commit('docs/note.md')
    expect(h.run('main')).toBe(1)
  })
  it('skips a proven docs-only branch push', () => {
    const h = history(); h.commit('docs/note.md')
    expect(h.run()).toBe(0)
  })
  it('builds a dashboard Redeploy of the same non-main commit', () => {
    const h = history()
    expect(h.run()).toBe(1)
  })
  it('builds a web change three commits back in one push', () => {
    const h = history(); h.commit('web/public/probe.txt'); h.commit('docs/one.md'); h.commit('docs/two.md'); h.commit('docs/three.md')
    expect(h.run()).toBe(1)
  })
  it.each(['', 'f'.repeat(40), '--help'])('builds with missing, absent-from-clone, or malformed previous SHA %j', prior => {
    const h = history(); h.commit('docs/note.md')
    expect(h.run('feature', prior)).toBe(1)
  })
  it.each(['src/lib/time.ts', 'src/data/fixtures.json', 'scripts/themeBootstrap.ts', 'packages/new/input.ts', 'package-lock.json', 'public/favicon-32.png', 'public/faces.css', 'public/fonts/oswald/Oswald.woff2', 'tsconfig.app.json', 'tsconfig.node.json', 'tsconfig.test-dom.json'])(
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
  it.each(['src/App.tsx', 'public/favicon-512.png'])('skips a Vite-only input outside the web graph: %s', file => {
    const h = history(); h.commit(file)
    expect(h.run()).toBe(0)
  })
  it('builds when the real previous deployment is outside a ten-commit shallow clone', () => {
    const h = history()
    for (let index = 0; index < 11; index++) h.commit(`docs/${index}.md`)
    const clone = mkdtempSync(path.join(tmpdir(), 'vercel-shallow-')); roots.push(clone)
    execFileSync('git', ['clone', '--depth=10', pathToFileURL(h.root).href, clone], { stdio: 'ignore' })
    expect(spawnSync('git', ['cat-file', '-e', `${h.previous}^{commit}`], { cwd: clone, stdio: 'ignore' }).status).not.toBe(0)
    expect(h.run('feature', h.previous, clone)).toBe(1)
  })
})
