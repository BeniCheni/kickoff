// Manual S4a browser and CLI proof. Every subprocess uses --stub; never run by CI.
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import { spawnSync, execFileSync } from 'node:child_process'
import { stopReasons } from './stops.ts'
import { stubAuthority } from './authority.ts'
const [runtime, chrome, output] = process.argv.slice(2)
if (!output) throw new Error('Usage: node --import tsx prove.mjs <playwright-module> <chrome> <new-output-dir>')
const out = path.resolve(output); await fs.mkdir(out)
const script = 'docs/verification/moments-observation/runner.mjs'
const result = { sha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), cases: [] }
const run = async (name, extra, reason = null) => {
  execFileSync('git', ['diff', '--exit-code', '11845cb21cfd0e87a1105e37e7b74e348739541c', 'HEAD', '--', 'src'])
  execFileSync('git', ['diff', '--exit-code', '--', 'src'])
  const destination = path.join(out, name)
  const child = spawnSync(process.execPath, ['--import', 'tsx', script, '--stub', '--headless', '--runtime', runtime, '--chrome', chrome,
    '--ceiling-ms', '60000', '--out', destination, ...extra], { encoding: 'utf8', timeout: 75000 })
  await fs.writeFile(path.join(out, name + '.log'), child.stdout + child.stderr)
  const receipt = JSON.parse(await fs.readFile(path.join(destination, 'receipt.json'), 'utf8'))
  result.cases.push({ name, exit: child.status, expected: reason, actual: receipt.stopReason, providerNetworkRequests: receipt.network.providerContinued,
    localProviderFulfillments: receipt.network.providerFulfilled, providerAborts: receipt.network.providerAborted,
    screenshots: receipt.captures.length, launched: !!receipt.browser?.freshProfile })
  await fs.writeFile(path.join(out, 'proof.json'), JSON.stringify(result, null, 2))
  assert.equal(receipt.network.providerContinued, 0, name)
  assert.equal(receipt.network.unhandledProviderResponses.length, 0, name)
  assert.equal(receipt.stopReason, reason, name)
  assert.equal(child.status, reason ? 1 : 0, name)
  if (name.startsWith('refusal-')) assert.equal(receipt.browser, undefined, 'Refusal must precede browser launch')
  if (reason === null) {
    assert.equal(receipt.pageLoads, 1)
    assert.equal(receipt.captures.length, 6)
    assert(receipt.checkpoints.filter(c => c.width).every(c => c.width === c.scrollWidth))
    assert(receipt.stubCalls[0].some(c => c[0] === 'loadVideoById' && c[1].startSeconds === 12))
  }
  console.log(name, child.status, receipt.stopReason ?? 'complete')
}
for (const variant of stopReasons) await run(variant, ['--port', '0', '--variant', variant], variant)
await run('http-redirect-refused', ['--port', '0', '--variant', 'http-redirect-refused'], 'http-redirect-refused')
const original = stubAuthority('http://127.0.0.1:4318')
const refusals = [
  ['future-authority', { ...original, at: '2099-01-01T00:00:00Z' }],
  ['too-many-ids', { ...original, ids: [...original.ids, { ...original.ids[0], id: 'S4Stub00003' }] }],
  ['malformed-video-id', { ...original, ids: [{ ...original.ids[0], id: 'x'.repeat(27) }] }],
  ['authority-schema', { ...original, who: undefined }],
  ['duplicate-id', { ...original, ids: [original.ids[0], original.ids[0]] }],
  ['origin-mismatch', original],
]
for (const [reason, raw] of refusals) {
  const file = path.join(out, reason + '.json'); await fs.writeFile(file, JSON.stringify(raw))
  await run('refusal-' + reason, ['--authority', file, ...(reason === 'origin-mismatch' ? ['--origin', 'http://localhost:4318'] : [])], reason)
}
// The whole visit is the final browser case, after every forced stop and refusal.
await run('owner-blocked', ['--port', '0', '--variant', 'owner-blocked'])
await run('cold-blocked', ['--port', '0', '--variant', 'cold-blocked'])
await run('clean', ['--port', '0'])
console.log(JSON.stringify({ cases: result.cases.length, providerNetworkRequests: 0 }))
