// Disposable copies only. A second React package and a second client version
// fail; one version and the built client pass.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { assertOneClientReact, readClientBundles } from './react-copies.mjs'

const webRoot = fileURLToPath(new URL('..', import.meta.url))
const evidence = path.resolve(process.argv[2] ?? fs.mkdtempSync(path.join(os.tmpdir(), 'kickoff-n2-react-')))
fs.mkdirSync(evidence, { recursive: true })
const receipts = []

function record(label, red, run) {
  let threw = false
  let message = ''
  try { run() } catch (error) {
    threw = true
    message = error instanceof Error ? error.message : String(error)
  }
  fs.writeFileSync(path.join(evidence, `${label}.log`), message)
  assert.equal(threw, red, `${label}: expected ${red ? 'failure' : 'success'}${message ? ` (${message})` : ''}`)
  receipts.push({ label, red, threw })
}

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'kickoff-react-copy-'))
fs.cpSync(path.join(webRoot, 'node_modules/react'), path.join(scratch, 'react'), { recursive: true })
const installed = await import(pathToFileURL(path.join(webRoot, 'node_modules/react/index.js')).href)
const second = await import(pathToFileURL(path.join(scratch, 'react/index.js')).href)
record('second-package-identity', true, () => { assert.equal(installed, second) })
record('two-version-client', true, () => {
  assertOneClientReact([
    { text: 'r.version="19.2.8"' },
    { text: 'r.version="19.3.0-canary-278794d7-20261002"' },
  ])
})
record('one-version-client', false, () => {
  const version = assertOneClientReact([{ text: 'r.version="19.3.0-canary-278794d7-20261002";r.version="19.3.0-canary-278794d7-20261002"' }])
  assert.equal(version, '19.3.0-canary-278794d7-20261002')
})

const injected = fs.mkdtempSync(path.join(os.tmpdir(), 'kickoff-client-'))
fs.cpSync(path.join(webRoot, '.next/static'), injected, { recursive: true })
fs.writeFileSync(path.join(injected, 'second-react.js'), 'r.version="19.2.8"\n')
record('injected-client-bundle', true, () => { assertOneClientReact(readClientBundles(injected)) })
record('built-client', false, () => {
  const result = spawnSync(process.execPath, [path.join(webRoot, 'scripts/check-one-react.mjs')], {
    cwd: webRoot, encoding: 'utf8',
  })
  if (result.status !== 0) throw new Error(result.stdout + result.stderr)
})

fs.writeFileSync(path.join(evidence, 'results.json'), JSON.stringify(receipts, null, 2) + '\n')
console.log(JSON.stringify(receipts, null, 2))
