// Mutate disposable copies only. Evidence stays outside the repo.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'kickoff-n4a-isolation-'))
const evidence = path.resolve(process.argv[2] ?? path.join(os.tmpdir(), 'kickoff-n4a-red-results'))
fs.mkdirSync(evidence, { recursive: true })
const receipts = []
const importWord = ['im', 'port'].join('')

function run(label, cwd, args, red) {
  const result = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', timeout: 60_000 })
  fs.writeFileSync(path.join(evidence, `${label}.log`), result.stdout + result.stderr)
  assert.equal(result.error, undefined, label)
  assert.equal(result.signal, null, label)
  assert.equal(result.status === 0, !red, `${label}: unexpected exit ${result.status}`)
  if (red) assert.match(result.stdout + result.stderr, /AssertionError|FAIL/, `${label}: must fail an assertion`)
  receipts.push({ label, exit: result.status })
}

function copyTree(from, to) {
  fs.cpSync(from, to, {
    recursive: true,
    filter: file => !file.split(path.sep).some(part => ['node_modules', '.next', 'dist', 'dist-single', 'dist-offline'].includes(part)),
  })
}

const studioRunner = [path.join(root, 'studio/node_modules/vitest/vitest.mjs'), 'run', 'test/isolation.test.ts', '-t']
const webRunner = [path.join(root, 'node_modules/vitest/vitest.mjs'), 'run', '--config', 'vitest.web.config.ts', 'tests/web-isolation.test.ts', '-t']

try {
  copyTree(path.join(root, 'studio'), path.join(scratch, 'studio'))
  copyTree(path.join(root, 'packages/kickoff-catalog'), path.join(scratch, 'packages/kickoff-catalog'))
  copyTree(path.join(root, 'web'), path.join(scratch, 'web'))
  copyTree(path.join(root, 'src'), path.join(scratch, 'src'))
  fs.mkdirSync(path.join(scratch, 'tests'), { recursive: true })
  fs.copyFileSync(path.join(root, 'tests/web-isolation.test.ts'), path.join(scratch, 'tests/web-isolation.test.ts'))
  fs.writeFileSync(path.join(scratch, 'vitest.web.config.ts'), [
    "import { defineConfig } from 'vitest/config'",
    'export default defineConfig({ test: { environment: "node", include: ["tests/**/*.test.ts"] } })',
    '',
  ].join('\n'))
  fs.symlinkSync(path.join(root, 'studio/node_modules'), path.join(scratch, 'studio/node_modules'), 'dir')
  fs.symlinkSync(path.join(root, 'node_modules'), path.join(scratch, 'node_modules'), 'dir')

  const studioCwd = path.join(scratch, 'studio')
  run('studio-clean-green', studioCwd, [...studioRunner, 'forbids studio'], false)
  run('package-clean-green', studioCwd, [...studioRunner, 'forbids the catalog'], false)
  run('web-clean-green', scratch, [...webRunner, 'web never'], false)

  for (const [label, file, specifier, cwd, args] of [
    ['studio-imports-src', 'studio/__n4_src_probe.ts', '../src/lib/time.ts', studioCwd, [...studioRunner, 'forbids studio']],
    ['studio-imports-web', 'studio/__n4_web_probe.ts', '../web/app/page', studioCwd, [...studioRunner, 'forbids studio']],
    ['package-imports-studio', 'packages/kickoff-catalog/src/__n4_probe.ts', '../../../studio/db/schema.ts', studioCwd, [...studioRunner, 'forbids the catalog']],
    ['package-imports-src', 'packages/kickoff-catalog/src/__n4_probe.ts', '../../../src/lib/time.ts', studioCwd, [...studioRunner, 'forbids the catalog']],
    ['package-imports-web', 'packages/kickoff-catalog/src/__n4_probe.ts', '../../../web/app/page', studioCwd, [...studioRunner, 'forbids the catalog']],
    ['web-imports-studio', 'web/app/__n4_probe.ts', '../../studio/db/schema', scratch, [...webRunner, 'web never']],
  ]) {
    const probe = path.join(scratch, file)
    fs.writeFileSync(probe, `${importWord} '${specifier}'\n`)
    run(`${label}-red`, cwd, args, true)
    fs.unlinkSync(probe)
    run(`${label}-green`, cwd, args, false)
  }

  const catalogProbe = path.join(scratch, 'web/app/__n4_catalog_probe.ts')
  fs.writeFileSync(catalogProbe, `${importWord} '@kickoff/catalog'\n`)
  run('web-imports-catalog-green', scratch, [...webRunner, 'web never'], false)
  fs.unlinkSync(catalogProbe)
  run('web-after-catalog-green', scratch, [...webRunner, 'web never'], false)

  const srcFilter = [...webRunner, 'src never imports the catalog']
  run('src-catalog-clean-green', scratch, srcFilter, false)
  const offline = path.join(scratch, 'src/offline.tsx')
  const original = fs.readFileSync(offline, 'utf8')
  fs.writeFileSync(offline, `${importWord} { catalogListRowSchema, SUBJECT_LABELS } from '../packages/kickoff-catalog/src/index.ts'\n` + original)
  run('src-imports-package-source-red', scratch, srcFilter, true)
  fs.writeFileSync(offline, original)
  run('src-imports-package-source-green', scratch, srcFilter, false)
  fs.writeFileSync(offline, `${importWord} { catalogListRowSchema } from '@kickoff/catalog'\n` + original)
  run('src-imports-package-name-red', scratch, srcFilter, true)
  fs.writeFileSync(offline, original)
  run('src-imports-package-name-green', scratch, srcFilter, false)
} finally {
  fs.rmSync(scratch, { recursive: true, force: true })
}

fs.writeFileSync(path.join(evidence, 'results.json'), JSON.stringify(receipts, null, 2) + '\n')
console.log(JSON.stringify(receipts, null, 2))
