import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { expect, test } from 'vitest'
import { STUB_SENTINEL, DEMO_SENTINEL, DATABASE_ADDRESS, textLeakHits, leakHits, scanBuild, payloadScoreHits, flightText, flightScoreHits } from '../scripts/check-client.mjs'

function flight(payload: Record<string, unknown>) {
  const encoded = JSON.stringify(JSON.stringify(payload)).slice(1, -1)
  return `self.__next_f.push([1,"${encoded}"])`
}

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

test('database names are legitimate server code but never client or live-response data', () => {
  const { staticDir, serverDir } = tree()
  writeFileSync(path.join(serverDir, 'chunk.js'), 'drizzle postgres:// KICKOFF_DATABASE_URL')
  expect(() => scanBuild(staticDir, serverDir)).not.toThrow()
  writeFileSync(path.join(staticDir, 'app.js'), 'drizzle postgres:// KICKOFF_DATABASE_URL')
  expect(() => scanBuild(staticDir, serverDir)).toThrow(/marker/)
  expect(textLeakHits('<main>KICKOFF_DATABASE_URL</main>')).toContain('DATABASE_URL')
})

test('a demo sentinel in client JavaScript or a response fails unless that build is demo', () => {
  const { staticDir, serverDir } = tree()
  writeFileSync(path.join(staticDir, 'app.js'), DEMO_SENTINEL)
  expect(() => scanBuild(staticDir, serverDir, { demoBuild: true })).toThrow(/marker/)
  writeFileSync(path.join(staticDir, 'app.js'), 'clean')
  writeFileSync(path.join(serverDir, 'page.html'), `<main>${DEMO_SENTINEL}</main>`)
  expect(() => scanBuild(staticDir, serverDir, { demoBuild: false })).toThrow(/marker/)
  expect(scanBuild(staticDir, serverDir, { demoBuild: true }).server).toBeGreaterThan(0)
  writeFileSync(path.join(serverDir, 'page.html'), '<main>Fixtures</main>')
  writeFileSync(path.join(serverDir, 'schema.js'), `const sentinel = ${JSON.stringify(DEMO_SENTINEL)}\n`)
  expect(() => scanBuild(staticDir, serverDir, { demoBuild: false })).not.toThrow()
  expect(textLeakHits(`<main>${DEMO_SENTINEL}</main>`)).toContain(DEMO_SENTINEL)
})

test('a database address in a response fails even when the demo build is on', () => {
  const { staticDir, serverDir } = tree()
  const url = ['postgres', '://', 'reader:secret@db.example:6543/postgres'].join('')
  writeFileSync(path.join(serverDir, 'page.html'), `<main>${url}</main>`)
  expect(() => scanBuild(staticDir, serverDir, { demoBuild: true })).toThrow(/marker/)
  expect(textLeakHits(`<main>${url}</main>`, [DATABASE_ADDRESS]).length).toBe(1)
  writeFileSync(path.join(serverDir, 'page.html'), '<main>Fixtures</main>')
  expect(() => scanBuild(staticDir, serverDir, { demoBuild: true })).not.toThrow()
})

test('a score field in a Moments payload fails the leak scan', () => {
  expect(payloadScoreHits({ state: 'ready', similar: ['stub-fenway-one'] })).toEqual([])
  expect(payloadScoreHits({ state: 'ready', similar: ['stub-fenway-one'], score: 0.912345678 })).toEqual(['score'])
  expect(payloadScoreHits({ list: [{ id: 'stub-fenway-one', score: 0.2 }] })).toEqual(['score'])
})

test('a flight string hides a payload key until it is decoded, and a score turns the check red', () => {
  const clean = flight({ similar: ['stub-both-cats'], title: 'score' })
  expect(clean.includes('"similar"')).toBe(false)
  expect(flightText(clean)).toContain('"title":"score"')
  expect(flightScoreHits(clean)).toEqual([])
  const scored = flight({ similar: ['stub-both-cats'], score: 0.9 })
  expect(scored.includes('"score"')).toBe(false)
  expect(flightScoreHits(scored)).toEqual(['score'])
})

test('a title of score, an escaped quote, a split key, and a nested score stay distinct', () => {
  expect(flightScoreHits(flight({ title: 'score', note: 'say "hello"', similar: ['stub-both-cats'] }))).toEqual([])
  const quoted = flight({ title: 'he said "score" once', similar: ['a'] })
  expect(flightText(quoted)).toContain('\\"score\\"')
  expect(flightScoreHits(quoted)).toEqual([])
  const whole = JSON.stringify({ title: 'Fenway', similar: ['a'], score: 0.912345678 })
  const splitAt = whole.indexOf('score') + 2
  const html = `self.__next_f.push([1,${JSON.stringify(whole.slice(0, splitAt))}])self.__next_f.push([1,${JSON.stringify(whole.slice(splitAt))}])`
  expect(flightText(html)).toContain('"score":')
  expect(html.includes('"score":')).toBe(false)
  expect(flightScoreHits(html)).toEqual(['score'])
  const cleanSplit = JSON.stringify({ title: 'score', similar: ['a', 'b'] })
  const mid = Math.floor(cleanSplit.length / 2)
  const cleanHtml = `self.__next_f.push([1,${JSON.stringify(cleanSplit.slice(0, mid))}])self.__next_f.push([1,${JSON.stringify(cleanSplit.slice(mid))}])`
  expect(flightScoreHits(cleanHtml)).toEqual([])
  expect(flightScoreHits(flight({ similar: [{ id: 'stub-both-cats', score: 0.2 }] }))).toEqual(['score'])
  expect(payloadScoreHits({ similar: [{ id: 'stub-both-cats', score: 0.2 }] })).toEqual(['score'])
})

test('stub client sentinels and future private Studio names still fail', () => {
  const { staticDir, serverDir } = tree()
  writeFileSync(path.join(staticDir, 'app.js'), STUB_SENTINEL)
  expect(() => scanBuild(staticDir, serverDir, { stubBuild: true })).toThrow(/marker/)
  writeFileSync(path.join(staticDir, 'app.js'), 'clean')
  writeFileSync(path.join(serverDir, 'chunk.js'), 'STUDIO_FUTURE_SECRET')
  expect(() => scanBuild(staticDir, serverDir, { stubBuild: true })).toThrow(/marker/)
})
