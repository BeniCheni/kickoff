// Run in the reviewed checkout, never a checkout currently serving evidence.
import fs from 'node:fs/promises'
import path from 'node:path'
import { spawnSync, execFileSync } from 'node:child_process'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
const [out] = process.argv.slice(2)
if (!out) throw new Error('Usage: node docs/verification/moments-acceptance/check-build-isolation.mjs <new-output-directory>')
await fs.mkdir(out)
const raw = JSON.parse(await fs.readFile('docs/verification/moments-acceptance/edition.json', 'utf8'))
const tokens = [...raw.flatMap(m => [m.id, m.source.identity?.videoId].filter(Boolean)), '[Moments acceptance]', 'momentsAcceptance', 'Fictional acceptance', 'S4Replace01', 'Replacement sentinel']
const rows = []
const digest = s => crypto.createHash('sha256').update(s).digest('hex')
async function bundle(dir) {
  const entries = await fs.readdir(dir, { recursive: true, withFileTypes: true })
  return (await Promise.all(entries.filter(e => e.isFile()).map(async e => ({ path: path.relative(dir, path.join(e.parentPath, e.name)), bytes: await fs.readFile(path.join(e.parentPath, e.name)) })))).sort((a,b) => a.path.localeCompare(b.path))
}
async function run(script, args = [], env = {}, expected = 0) {
  const r = spawnSync('npm', ['run', script, ...args], { encoding: 'utf8', env: { ...process.env, ...env } })
  const log = r.stdout + r.stderr
  const name = `${rows.length}-${script.replaceAll(':', '-')}`
  await fs.writeFile(path.join(out, name + '.log'), log)
  assert.equal(r.status, expected, log)
  rows.push({ script, args, env, exitCode: r.status, log: name + '.log' })
  return log
}
const poison = { MODE: 'acceptance', VITE_MODE: 'acceptance', MOMENTS_EDITION: '/does-not-exist/acceptance.json', VITE_MOMENTS_EDITION: '/does-not-exist/acceptance.json', MOMENTS_ACCEPTANCE_EDITION: '/does-not-exist/acceptance.json' }
for (const [script, dir, args] of [['build', 'dist', []], ['build:single', 'dist-single', []], ['build', 'dist', ['--', '--mode', 'acceptance']]]) {
  await run(script, args, poison)
  const files = await bundle(dir)
  const hits = files.flatMap(file => tokens.filter(t => file.bytes.includes(t)).map(token => ({ file: file.path, token })))
  assert.deepEqual(hits, [])
  rows.at(-1).scan = { tokens, hits, files: files.map(f => ({ path: f.path, sha256: digest(f.bytes) })) }
}
const replacement = structuredClone(raw)
replacement[0].title = 'Replacement sentinel'
replacement[0].source.identity.videoId = 'S4Replace01'
replacement[0].source.url = 'https://www.youtube.com/watch?v=S4Replace01'
const replacementPath = path.resolve(out, 'replacement.json')
await fs.writeFile(replacementPath, JSON.stringify(replacement))
await run('build:acceptance', ['--', replacementPath])
const good = await bundle('dist-acceptance')
assert(good.some(f => f.bytes.includes('S4Replace01')))
assert(good.some(f => f.bytes.includes('Replacement sentinel')))
assert(good.some(f => f.bytes.includes('momentsAcceptance')))
const bad = structuredClone(raw)
const snapshot = JSON.parse(execFileSync('git', ['show', 'HEAD:src/data/fixtures.json'], { encoding: 'utf8' }))
bad[0].fixtureId = snapshot[0].id
const badPath = path.resolve(out, 'bad-fixture.json')
await fs.writeFile(badPath, JSON.stringify(bad))
assert((await run('build:acceptance', ['--', badPath], {}, 1)).includes('disagrees with fixture'))
assert.deepEqual((await bundle('dist-acceptance')).map(f => digest(f.bytes)), good.map(f => digest(f.bytes)), 'Invalid edition must fail before bundling')
const invalid = structuredClone(raw); invalid[0].source.identity.videoId = 'invalid'
const invalidPath = path.resolve(out, 'bad-schema.json')
await fs.writeFile(invalidPath, JSON.stringify(invalid))
await run('build:acceptance', ['--', invalidPath], {}, 1)
assert.deepEqual((await bundle('dist-acceptance')).map(f => digest(f.bytes)), good.map(f => digest(f.bytes)))
await run('build:acceptance')
const normal = await bundle('dist-acceptance')
assert(normal.some(f => f.bytes.includes('S4Accept001')))
assert(!normal.some(f => f.bytes.includes('S4Replace01')))
const config = await fs.readFile('vite.config.ts', 'utf8'), main = await fs.readFile('src/main.tsx', 'utf8')
assert(!/acceptance|MOMENTS_EDITION/.test(config))
assert(!/momentsPlayer|momentsPlayability/.test(main))
await fs.writeFile(path.join(out, 'build-isolation.json'), JSON.stringify({ sha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), node: process.version, rows, structure: 'Replacement plugin is local to build-moments-acceptance.ts; vite.config.ts has no acceptance switch; main passes neither player nor rule' }, null, 2))
console.log('Production/single isolation, replacement input and validation-before-build passed')
