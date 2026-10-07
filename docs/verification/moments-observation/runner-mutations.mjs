// Manual integration mutation controls. Every browser launch is guarded --stub.
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { redirectVariants } from './probe-fixtures.mjs'
import { stopReasons } from './stops.ts'
const [runtime, chrome, output] = process.argv.slice(2)
if (!output) throw new Error('Usage: node --import tsx runner-mutations.mjs <playwright-module> <chrome> <new-output-directory>')
const out = path.resolve(output); await fs.mkdir(out)
const archive = path.join(out, 'archive'); await fs.mkdir(archive)
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
const gitDir = execFileSync('git', ['rev-parse', '--absolute-git-dir'], { encoding: 'utf8' }).trim()
await fs.writeFile(path.join(out, 'source.tar'), execFileSync('git', ['archive', sha], { maxBuffer: 100 * 1024 * 1024 }))
execFileSync('tar', ['-xf', path.join(out, 'source.tar'), '-C', archive])
await fs.symlink(await fs.realpath('node_modules'), path.join(archive, 'node_modules'))
await fs.cp('dist-acceptance', path.join(archive, 'dist-acceptance'), { recursive: true })
// Read-only Git provenance from the source checkout; no index write or temporary commit.
const env = { ...process.env, GIT_DIR: gitDir, GIT_WORK_TREE: archive }
const rows = []
async function probe(reason, color) {
  const destination = path.join(out, `${reason}-${color}`)
  const run = spawnSync(process.execPath, ['--import', 'tsx', 'docs/verification/moments-observation/runner.mjs',
    '--stub', '--headless', '--port', '0', '--variant', reason, '--ceiling-ms', '10000',
    '--runtime', runtime, '--chrome', chrome, '--out', destination], { cwd: archive, env, encoding: 'utf8', timeout: 20000 })
  await fs.writeFile(destination + '.log', run.stdout + run.stderr)
  const receipt = JSON.parse(await fs.readFile(path.join(destination, 'receipt.json'), 'utf8'))
  assert.equal(receipt.network.providerContinued, 0)
  assert.equal(receipt.network.unhandledProviderResponses.length, 0)
  const assertionPassed = run.status === 1 && receipt.stopReason === reason
  assert.equal(assertionPassed, color === 'green', `${reason} ${color}: expected-stop assertion did not change (${receipt.stopReason})`)
  return { processExit: run.status, expectedStopAssertion: assertionPassed, actualReason: receipt.stopReason, providerNetworkRequests: 0 }
}
for (const reason of stopReasons) {
  const policy = ['provider-before-play', 'unnamed-id'].includes(reason)
  const file = path.join(archive, 'docs/verification/moments-observation', policy ? 'policy.ts' : 'stops.ts')
  const original = await fs.readFile(file, 'utf8')
  const from = policy ? `return result('stop', '${reason}')` : `return '${reason}'`
  const to = policy ? `return result('release', '${reason}')` : 'return null'
  assert(original.includes(from))
  await fs.writeFile(file, original.replaceAll(from, to))
  let red
  try { red = await probe(reason, 'red') } finally { await fs.writeFile(file, original) }
  const green = await probe(reason, 'green')
  rows.push({ reason, file: path.basename(file), from, to, red, green })
  await fs.writeFile(path.join(out, 'runner-mutations.json'), JSON.stringify({ sha, rows }, null, 2))
  console.log(reason, 'red -> green')
}

// Each redirect mutation is safe: its Location stays on the runner's loopback server.
async function control(name, variant, fileName, from, to, assertion, ceiling = '12000') {
  const file = path.join(archive, 'docs/verification/moments-observation', fileName)
  const original = await fs.readFile(file, 'utf8'); assert(original.includes(from), name)
  const execute = async color => {
    const destination = path.join(out, `${name}-${color}`)
    const child = spawnSync(process.execPath, ['--import', 'tsx', 'docs/verification/moments-observation/runner.mjs', '--stub', '--headless', '--port', '0', '--variant', variant, '--ceiling-ms', ceiling, '--runtime', runtime, '--chrome', chrome, '--out', destination], { cwd: archive, env, encoding: 'utf8', timeout: 18000 })
    await fs.writeFile(destination + '.log', child.stdout + child.stderr)
    let receipt
    try { receipt = JSON.parse(await fs.readFile(path.join(destination, 'receipt.json'), 'utf8')) } catch (error) { if (error.code !== 'ENOENT') throw error }
    if (receipt) { assert.equal(receipt.network.providerContinued, 0); assert.equal(receipt.network.unhandledProviderResponses.length, 0) }
    const passed = !!receipt && assertion(receipt)
    assert.equal(passed, color === 'green', `${name}: ${color} failed intended assertion (reason ${receipt?.stopReason})`)
    return { exit: child.status, signal: child.signal, expectedAssertion: passed, actualReason: receipt?.stopReason ?? 'receipt-missing', port: receipt?.boundPort, proof: receipt?.redirectProof, providerNetworkRequests: receipt?.network.providerContinued ?? 0 }
  }
  await fs.writeFile(file, original.replaceAll(from, to))
  let red
  try { red = await execute('red') } finally { await fs.writeFile(file, original) }
  const green = await execute('green')
  rows.push({ reason: name, file: fileName, from, to, red, green })
  await fs.writeFile(path.join(out, 'runner-mutations.json'), JSON.stringify({ sha, rows }, null, 2))
  console.log(name, 'red -> green')
}
for (const variant of redirectVariants.filter(v => !/-(meta|script-nav)$/.test(v))) {
  await control(variant, variant, 'redirect.ts', "return headers.find(h => h.name.toLowerCase() === 'location')?.value ?? null", 'return null', r => r.stopReason === 'http-redirect-refused' && r.redirectProof.locationHits === 0)
  assert.equal(rows.at(-1).red.proof.locationHits, 1, variant + ': guard-off control must reach Location')
}
await control('prompt-ceiling', 'prompt-ceiling', 'runner.mjs', 'promptAbort.abort()', 'void 0', r => r.stopReason === 'operational-safety-ceiling' && Array.isArray(r.observations), '100')
await control('sandbox', 'clean', 'runner.mjs', 'chromiumSandbox: true', 'chromiumSandbox: false', r => r.status === 'complete' && !r.browser.launchCommand.includes('--no-sandbox'))
await control('extra-hosts', 'extra-hosts', 'policy.ts', "if (!provider) return result('record', shelf ? 'shelf-image' : 'named-extra-host')", "if (!provider) return result('abort', 'unlisted-host')", r => r.requests.some(q => q.decision.reason === 'named-extra-host'))
await control('unlisted-host', 'extra-hosts', 'policy.ts', "return result('abort', 'unlisted-host')", "return result('record', 'named-extra-host')", r => r.network.runnerAborts['unnamed.s4a.test']?.['unlisted-host'] === 1)
await control('shelf-images', 'shelf-images', 'policy.ts', '!shelf && ids.some', 'ids.some', r => r.status === 'complete' && r.requests.filter(q => q.decision.reason === 'shelf-image').length === 3)
await control('shelf-query-stop', 'shelf-query-stop', 'policy.ts', "if (key !== 'sqp' && key !== 'rs') return false", 'if (false) return false', r => r.status === 'stopped' && r.stopReason === 'unnamed-id' && r.network.providerContinued === 0)
await control('shelf-query-nested', 'shelf-query-nested', 'policy.ts', 'if (!/^[A-Za-z0-9_.=+/-]+$/.test(token)) return false', 'if (!/^(?:[A-Za-z0-9_.=+/-]|%[0-9A-Fa-f]{2})+$/.test(value)) return false', r => r.status === 'stopped' && r.stopReason === 'unnamed-id' && r.network.providerContinued === 0)
await control('debugging-port', 'redirect-top-document', 'runner.mjs', "args: ['--disable-background-networking'", "args: ['--remote-debugging-port=0', '--disable-background-networking'", r => r.stopReason === 'http-redirect-refused' && r.redirectProof.locationHits === 0 && !r.browser.launchCommand.includes('--remote-debugging-port') && r.browser.endpointProof.devToolsActivePort === false && r.browser.endpointProof.chromePids.length > 0 && Array.isArray(r.browser.endpointProof.listeningSockets) && r.browser.endpointProof.listeningSockets.length === 0)
const skipFetch = "await session.send('Fetch.enable', { patterns: [{ urlPattern: '*', requestStage: 'Request' }, { urlPattern: '*', requestStage: 'Response' }] })"
for (const variant of redirectVariants.filter(v => !/-(meta|script-nav)$/.test(v))) {
  await control('skip-fetch-' + variant, variant, 'cdp-network.mjs', skipFetch, 'await Promise.resolve()', r => r.stopReason === 'http-redirect-refused' && r.redirectProof.locationHits === 0)
  assert.equal(rows.at(-1).red.proof.locationHits, 1, variant + ': skipping Fetch.enable must reach Location')
}
await control('skip-fetch-extra-hosts', 'extra-hosts', 'cdp-network.mjs', skipFetch, 'await Promise.resolve()', r => r.requests.some(q => q.decision.reason === 'named-extra-host'))
await control('skip-fetch-unlisted-host', 'extra-hosts', 'cdp-network.mjs', skipFetch, 'await Promise.resolve()', r => r.network.runnerAborts['unnamed.s4a.test']?.['unlisted-host'] === 1)
