// Current tests against the untouched host, then independent hand-off/lapse mutants.
// Full logs stay in the disposable output directory; tracked receipts keep summaries only.
import fs from 'node:fs/promises'
import path from 'node:path'
import { execFileSync, spawnSync } from 'node:child_process'
import assert from 'node:assert/strict'
const [beforeRef, afterRef, out] = process.argv.slice(2)
if (!out) throw new Error('Usage: node reproduce-focus.mjs <before-sha> <after-sha> <new-output-dir>')
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()
const before = git('rev-parse', beforeRef), after = git('rev-parse', afterRef)
const snapshot = '7636b0871c9a10db53e9a00ad3811cc7093efa6c'
const repo = process.cwd(), source = path.resolve(out, 'source')
await fs.mkdir(out); await fs.mkdir(source)
const archive = execFileSync('git', ['archive', after], { maxBuffer: 100 * 1024 * 1024 })
assert.equal(spawnSync('tar', ['-x', '-C', source], { input: archive }).status, 0)
await fs.symlink(path.join(repo, 'node_modules'), path.join(source, 'node_modules'))
const host = 'src/components/MomentsPlayerHost.tsx'
const provider = 'src/components/MomentsSessionProvider.tsx'
const read = (sha, file) => execFileSync('git', ['show', `${sha}:${file}`], { encoding: 'utf8' })
const original = read(after, host), owner = read(after, provider), rows = []
async function run(name, failures) {
  git('diff', '--exit-code', snapshot, after, '--', 'src/data')
  const r = spawnSync('npm', ['test', '--', 'tests/dom/momentsPermission.test.tsx'], { cwd: source, encoding: 'utf8' })
  const log = r.stdout + r.stderr
  await fs.writeFile(path.join(out, name + '.log'), log)
  assert.equal(r.status, failures ? 1 : 0, name + '\n' + log)
  const failed = [...log.matchAll(/^ FAIL .* > (.+)$/gm)].map(m => m[1])
  assert.equal(failed.length, failures, name + ': failing test count')
  rows.push({ name, exitCode: r.status, failed, summary: log.split('\n').filter(s => /Test Files|Tests\s/.test(s)) })
}
function omit(file, text, needle) {
  assert.equal(text.split(needle).length, 2, 'Mutation must target exactly one act step')
  return fs.writeFile(path.join(source, file), text.replace(needle, '    // Mutation: intentionally omitted.'))
}
await fs.writeFile(path.join(source, host), read(before, host))
await run('before', 6)
await fs.writeFile(path.join(source, host), original)
await run('after', 0)
await omit(host, original, '    control?.focus()')
await run('no-detached-focus', 6)
assert.deepEqual(rows.at(-1).failed, rows[0].failed, 'Every new red case must fail without the new act step')
await fs.writeFile(path.join(source, host), original)
await run('restored-detached-focus', 0)
await omit(host, original, "    if (placement === 'parked' && host.contains(document.activeElement)) {\n      survivingControl()?.focus()\n    }")
await run('no-in-host-focus', 2)
assert(rows.at(-1).failed.every(name => name.startsWith('a stage lapse hands focus from')))
await fs.writeFile(path.join(source, host), original)
await run('restored-in-host-focus', 0)
for (const [name, needle] of [
  ['no-player-lost', "      dispatch({ type: 'player-lost' })"],
  ['no-retire', '      bridge.current?.retire()'],
]) {
  await omit(provider, owner, needle)
  // The existing adapter/reducer assertions remain active; save the measured count.
  git('diff', '--exit-code', snapshot, after, '--', 'src/data')
  const r = spawnSync('npm', ['test', '--', 'tests/dom/momentsPermission.test.tsx'], { cwd: source, encoding: 'utf8' })
  const log = r.stdout + r.stderr
  await fs.writeFile(path.join(out, name + '.log'), log)
  assert.equal(r.status, 1, name)
  rows.push({ name, exitCode: r.status, failed: [...log.matchAll(/^ FAIL .* > (.+)$/gm)].map(m => m[1]),
    summary: log.split('\n').filter(s => /Test Files|Tests\s/.test(s)) })
  await fs.writeFile(path.join(source, provider), owner)
}
await run('restored', 0)
await fs.writeFile(path.join(out, 'focus-red-green.json'), JSON.stringify({ before, after, testSource: after, rows }, null, 2))
console.log(JSON.stringify(rows.map(r => ({ name: r.name, failed: r.failed.length, summary: r.summary }))))
