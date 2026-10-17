import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { expect, test } from 'vitest'
import { STUB_SENTINEL, leakHits, scanBuild } from '../scripts/check-client.mjs'

function tree() {
  const root = mkdtempSync(path.join(tmpdir(), 'kickoff-leak-'))
  const staticDir = path.join(root, 'static')
  const serverDir = path.join(root, 'server')
  mkdirSync(staticDir)
  mkdirSync(serverDir)
  writeFileSync(path.join(staticDir, 'app.js'), 'var kickoff = 1\n')
  writeFileSync(path.join(serverDir, 'page.html'), '<main>Fixtures</main>')
  writeFileSync(path.join(serverDir, 'chunk.js'), 'server()\n')
  return { staticDir, serverDir }
}

test('a clean build passes the client and server scan', () => {
  const { staticDir, serverDir } = tree()
  expect(scanBuild(staticDir, serverDir, { stubBuild: false }).markers).toBeGreaterThan(0)
})

test('a stub sentinel in a server chunk fails the non-stub scan', () => {
  const { staticDir, serverDir } = tree()
  writeFileSync(path.join(serverDir, 'inlined.js'), `const marker = ${JSON.stringify(STUB_SENTINEL)}\n`)
  expect(() => scanBuild(staticDir, serverDir, { stubBuild: false })).toThrow(/stub-catalog|marker/)
  expect(leakHits([path.join(serverDir, 'inlined.js')], [STUB_SENTINEL])).toHaveLength(1)
  expect(scanBuild(staticDir, serverDir, { stubBuild: true }).server).toBeGreaterThan(0)
})

test('a database marker in prerendered HTML fails the scan', () => {
  const { staticDir, serverDir } = tree()
  writeFileSync(path.join(serverDir, 'page.html'), 'postgres connection DATABASE_URL')
  expect(() => scanBuild(staticDir, serverDir)).toThrow(/marker/)
})
