// Apply the same gate tests to two untouched commit archives; never commit red tests.
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
const [before, after, out] = process.argv.slice(2)
if (!out) throw new Error('Usage: node reproduce-permission.mjs <before-sha> <after-sha> <new-output-dir>')
await fs.mkdir(out)
const root = process.cwd(), file = 'tests/dom/momentsPermission.test.tsx'
const test = execFileSync('git', ['show', `${after}:${file}`])
const rows = []
for (const [name, sha, expected] of [['before', before, 1], ['after', after, 0]]) {
  const full = execFileSync('git', ['rev-parse', sha], { encoding: 'utf8' }).trim()
  const dir = path.resolve(out, name); await fs.mkdir(dir)
  execFileSync('tar', ['-xf', '-', '-C', dir], { input: execFileSync('git', ['archive', full], { maxBuffer: 100 * 1024 * 1024 }) })
  await fs.symlink(path.join(root, 'node_modules'), path.join(dir, 'node_modules'))
  await fs.writeFile(path.join(dir, file), test)
  const report = path.resolve(out, `${name}.json`)
  const r = spawnSync(process.execPath, [path.join(root, 'node_modules/vitest/vitest.mjs'), 'run', file, '--reporter=json', `--outputFile=${report}`], { cwd: dir, encoding: 'utf8' })
  await fs.writeFile(path.join(out, `${name}.log`), r.stdout + r.stderr)
  assert.equal(r.status, expected, r.stdout + r.stderr)
  const result = JSON.parse(await fs.readFile(report, 'utf8'))
  rows.push({ sha: full, exitCode: r.status, passed: result.numPassedTests, failed: result.numFailedTests,
    tests: result.testResults.flatMap(s => s.assertionResults.map(t => ({ name: t.fullName, status: t.status }))) })
}
assert.equal(rows[0].failed, 16); assert.equal(rows[1].passed, 17)
await fs.writeFile(path.join(out, 'permission-red-green.json'), JSON.stringify({ command: process.argv.slice(1), rows }, null, 2))
console.log(JSON.stringify(rows.map(({ tests, ...row }) => row)))
