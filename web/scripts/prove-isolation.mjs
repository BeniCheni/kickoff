// Mutate disposable copies only; retain failure logs at the requested evidence path.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../../', import.meta.url))
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'kickoff-n1-isolation-'))
const evidence = path.resolve(process.argv[2] ?? path.join(os.tmpdir(), 'kickoff-n1-red-results'))
fs.mkdirSync(evidence, { recursive: true })
const receipts = []
function run(label, cwd, args, red) {
  const result = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', timeout: 60_000 })
  fs.writeFileSync(path.join(evidence, `${label}.log`), result.stdout + result.stderr)
  assert.equal(result.error, undefined, label)
  assert.equal(result.signal, null, label)
  assert.equal(result.status === 0, !red, `${label}: unexpected exit ${result.status}`)
  if (red) assert.match(result.stdout + result.stderr, /AssertionError|FAIL/, `${label}: must fail an assertion`)
  receipts.push({ label, exit: result.status })
}
const rootRunner = [path.join(root, 'node_modules/vitest/vitest.mjs'), 'run', 'tests/web-isolation.test.ts', '-t']
try {
  for (const entry of fs.readdirSync(root)) {
    if (['src', 'scripts', 'tests', 'web', 'vite.config.ts', 'package.json'].includes(entry) || /^tsconfig.*\.json$/.test(entry)) {
      fs.cpSync(path.join(root, entry), path.join(scratch, entry), {
        recursive: true, filter: file => !file.split(path.sep).some(part => ['node_modules', '.next'].includes(part)),
      })
    }
  }
  fs.symlinkSync(path.join(root, 'node_modules'), path.join(scratch, 'node_modules'), 'dir')
  fs.symlinkSync(path.join(root, 'web/node_modules'), path.join(scratch, 'web/node_modules'), 'dir')
  const importWord = ['im', 'port'].join('')
  for (const [label, file, specifier, test] of [
    ['src-to-web', 'src/__n1_probe.ts', '../web/app/page', 'src never'],
    ['web-to-studio', 'web/app/__n1_probe.ts', '../../studio/db/schema', 'web never'],
  ]) {
    const probe = path.join(scratch, file)
    fs.writeFileSync(probe, `${importWord} '${specifier}'\n`)
    run(`${label}-red`, scratch, [...rootRunner, test], true)
    fs.unlinkSync(probe)
    run(`${label}-green`, scratch, [...rootRunner, test], false)
  }
  for (const [label, file, mutate, cwd, args] of [
    ['root-vitest', 'vite.config.ts', s => s.replace("include: ['tests/**/*.test.ts']", "include: ['tests/**/*.test.ts', 'web/test/**/*.test.{ts,tsx}']"), scratch, [...rootRunner, 'actual root Vitest']],
    ['root-tsc', 'tsconfig.app.json', s => s.replace('"include": ["src"]', '"include": ["src", "web/app"]'), scratch, [...rootRunner, 'root tsc build graph']],
    ['web-vitest', 'web/vitest.config.ts', s => s.replace("include: ['test/**/*.test.{ts,tsx}']", "include: ['test/**/*.test.{ts,tsx}', '../tests/**/*.test.ts']"), path.join(scratch, 'web'), [path.join(root, 'web/node_modules/vitest/vitest.mjs'), 'run', 'test/isolation.test.ts']],
  ]) {
    const target = path.join(scratch, file); const original = fs.readFileSync(target, 'utf8')
    const changed = mutate(original); assert.notEqual(changed, original)
    fs.writeFileSync(target, changed)
    run(`${label}-red`, cwd, args, true)
    fs.writeFileSync(target, original)
    run(`${label}-green`, cwd, args, false)
  }
  const built = path.join(scratch, 'client')
  fs.cpSync(path.join(root, 'web/.next/static'), built, { recursive: true })
  const checker = [path.join(root, 'web/scripts/check-client.mjs'), built]
  const markers = ['studio/', 'drizzle', 'postgres://', 'postgresql://', 'DATABASE_URL', 'FAL_KEY', 'STUDIO_ENV_FILE', 'STUDIO_LIVE', 'STUDIO_DATA_DIR', 'STUDIO_MEDIA_DIR', 'STUDIO_NOW', 'STUDIO_STUB', 'STUDIO_STORAGE_FAIL']
  for (const [index, marker] of markers.entries()) {
    const probe = path.join(built, '__n1_probe.js')
    fs.writeFileSync(probe, `${JSON.stringify(marker)};\n`)
    run(`client-${index + 1}-red`, scratch, checker, true)
    fs.unlinkSync(probe)
  }
  run('client-green', scratch, checker, false)
} finally { fs.rmSync(scratch, { recursive: true, force: true }) }
fs.writeFileSync(path.join(evidence, 'results.json'), JSON.stringify(receipts, null, 2) + '\n')
console.log(JSON.stringify(receipts, null, 2))
