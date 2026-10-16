// A disposable non-listed import fails the allowlist; the real web tree passes.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { allowlistViolations } from '../src-allowlist.mjs'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))
const webRoot = fileURLToPath(new URL('..', import.meta.url))
const evidence = path.resolve(process.argv[2] ?? fs.mkdtempSync(path.join(os.tmpdir(), 'kickoff-n2-allow-')))
fs.mkdirSync(evidence, { recursive: true })

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'kickoff-allow-'))
const bad = path.join(scratch, 'web/app')
fs.mkdirSync(bad, { recursive: true })
fs.writeFileSync(path.join(bad, 'bad.tsx'), `${['im', 'port'].join('')} App from '../../src/App.tsx'\n`)
const red = allowlistViolations(path.join(scratch, 'web'), scratch)
assert.equal(red.length, 1)
assert.equal(red[0].readerPath, 'src/App.tsx')
const green = allowlistViolations(webRoot, repoRoot)
assert.deepEqual(green, [])
const receipts = [
  { label: 'non-listed-import', red: true, readerPath: red[0].readerPath },
  { label: 'real-tree', red: false, violations: green.length },
]
fs.writeFileSync(path.join(evidence, 'results.json'), JSON.stringify(receipts, null, 2) + '\n')
console.log(JSON.stringify(receipts, null, 2))
