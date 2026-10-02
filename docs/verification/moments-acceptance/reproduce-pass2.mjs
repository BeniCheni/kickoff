// Disposable sources only: current tests against pre-fix source, then two independent mutants.
import fs from 'node:fs/promises'
import path from 'node:path'
import { execFileSync, spawnSync } from 'node:child_process'
import assert from 'node:assert/strict'
const [before, after, out] = process.argv.slice(2)
if (!out) throw new Error('Usage: node reproduce-pass2.mjs <before-sha> <after-sha> <new-output-dir>')
const repo = process.cwd(), source = path.resolve(out, 'source')
await fs.mkdir(out); await fs.mkdir(source)
const archive = execFileSync('git', ['archive', after], { maxBuffer: 100 * 1024 * 1024 })
const extracted = spawnSync('tar', ['-x', '-C', source], { input: archive })
assert.equal(extracted.status, 0)
await fs.symlink(path.join(repo, 'node_modules'), path.join(source, 'node_modules'))
const read = (sha, file) => execFileSync('git', ['show', `${sha}:${file}`], { encoding: 'utf8' })
const paths = ['src/components/MomentsSessionProvider.tsx', 'src/components/MomentsPlayerHost.tsx']
const rows = []
async function run(name, expected) {
  const r = spawnSync('npm', ['test', '--', 'tests/dom/momentsPermission.test.tsx'], { cwd: source, encoding: 'utf8' })
  await fs.writeFile(path.join(out, name + '.log'), r.stdout + r.stderr)
  assert.equal(r.status, expected, name + '\n' + r.stdout + r.stderr)
  rows.push({ name, exitCode: r.status, summary: (r.stdout + r.stderr).split('\n').filter(s => /Test Files|Tests\s/.test(s)) })
}
for (const file of paths) await fs.writeFile(path.join(source, file), read(before, file))
await run('before', 1)
for (const file of paths) await fs.writeFile(path.join(source, file), read(after, file))
await run('after', 0)
const provider = paths[0], original = read(after, provider)
for (const [name, needle] of [
  ['no-player-lost', "      dispatch({ type: 'player-lost' })"],
  ['no-retire', '      bridge.current?.retire()'],
]) {
  assert.equal(original.split(needle).length, 2, 'Mutation must target exactly the lapse effect')
  await fs.writeFile(path.join(source, provider), original.replace(needle, '      // Mutation: intentionally omitted.'))
  await run(name, 1)
  await fs.writeFile(path.join(source, provider), original)
}
await run('restored', 0)
await fs.writeFile(path.join(out, 'pass2-red-green.json'), JSON.stringify({ before, after, testSource: after, rows }, null, 2))
console.log(JSON.stringify(rows))
