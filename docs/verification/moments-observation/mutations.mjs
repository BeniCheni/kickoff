// Pure-module mutation evidence in a disposable archive, with a restored green per mutant.
// No browser entry is imported or executed here.
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
const [output] = process.argv.slice(2)
if (!output) throw new Error('Usage: node mutations.mjs <new-output-directory>')
const out = path.resolve(output); await fs.mkdir(out)
const source = path.join(out, 'archive'); await fs.mkdir(source)
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
await fs.writeFile(path.join(out, 'source.tar'), execFileSync('git', ['archive', sha], { maxBuffer: 100 * 1024 * 1024 }))
execFileSync('tar', ['-xf', path.join(out, 'source.tar'), '-C', source])
await fs.symlink(await fs.realpath('node_modules'), path.join(source, 'node_modules'))
const prefix = 'docs/verification/moments-observation/'
const cases = []
const add = (name, file, from, to) => cases.push({ name, file: prefix + file, from, to })
const reasons = ['provider-before-play', 'second-element', 'parent-changed', 'queue-covered', 'navigation-waits', 'second-terminal-failure', 'unsampled-position', 'territory-150', 'error-153', 'warm-autoplay-blocked', 'parked-return-blank', 'resume-at-zero', 'ineligible-play', 'unnamed-id']
for (const reason of reasons) add(reason, 'stops.ts', `return '${reason}'`, 'return null')
for (const reason of ['provider-before-play', 'unnamed-id', 'provider-url-refused', 'provider-host-not-authorized', 'second-api-request', 'second-frame-request', 'frame-before-api', 'provider-before-player']) {
  add('network-' + reason, 'policy.ts', `return result('stop', '${reason}')`, `return result('release', '${reason}')`)
}
add('extract-path', 'policy.ts', 'ids.add(parts[index + 1]!)', 'void parts[index + 1]')
add('extract-parameters', 'policy.ts', 'ids.add(item)', 'void item')
add('extract-body', 'policy.ts', 'if (body) {', 'if (false && body) {')
for (const reason of ['future-authority', 'duplicate-id', 'authority-hosts', 'invalid-origin', 'non-loopback-requires-https', 'origin-mismatch', 'stub-fictional-only', 'fictional-id-in-live']) {
  add('authority-' + reason, 'authority.ts', `throw new Refusal('${reason}')`, `void '${reason}'`)
}
add('authority-stale-authority', 'authority.ts', "throw new Refusal('stale-authority', (ageMs / 3600000) + ' hours')", "void 'stale-authority'")
add('authority-id-pattern', 'authority.ts', 'id: youtubeVideoIdSchema', 'id: z.string()')
add('authority-count', 'authority.ts', '}).strict()).min(1).max(2)', '}).strict()).min(1).max(3)')
add('authority-extra-fields', 'authority.ts', '}).strict()\nexport type Authority', '})\nexport type Authority')
add('edition-moment-id', 'edition.ts', '`kickoff-moments-slice-4-test-${i + 1}`', '`wrong-item-${i + 1}`')
add('edition-video-id', 'edition.ts', "videoId: named.id", "videoId: 'S4Stub99999'")
add('edition-permission-instant', 'edition.ts', 'new Date(authority.at).toISOString()', "'2099-01-01T00:00:00Z'")
add('edition-fixture-validation', 'edition.ts', ', fixtures)', ', [])')
add('bundle-manifest', 'edition.ts', "throw new Refusal('bundle-id-mismatch')", 'void 0')
add('bundle-hook', 'edition.ts', "throw new Refusal('missing-observation-hooks')", 'void 0')
add('bundle-fictional', 'edition.ts', "throw new Refusal('bundle-has-fictional-id')", 'void 0')
add('stub-continuation', 'route.ts', "if (mode === 'stub') return local", "if (mode === 'stub') return route => route.continue()")
add('live-confirmation', 'route.ts', "throw new Error('confirmation-refused')", 'void 0')
add('stop-route', 'route.ts', "await route.abort(); return", "await release(route); return")
add('observation-150', 'telemetry.ts', "code === 150 || code === 101 ? 'owner-blocked'", "code === 101 ? 'owner-blocked'")
add('hook-dispatch', 'instrumentation.ts', "observe('dispatch', event); originalHooks.dispatch(event)", 'originalHooks.dispatch(event)')
add('null-frame-hit', 'browser-observer.js', '!!frame && hit === frame', 'hit === frame')
add('redirect-refusal', 'redirect.ts', "return headers.find(h => h.name.toLowerCase() === 'location')?.value ?? null", 'return null')
add('live-port-zero', 'authority.ts', "throw new Refusal('live-port-zero')", 'void 0')
add('named-extra-host', 'policy.ts', "if (!provider) return result('record', shelf ? 'shelf-image' : 'named-extra-host')", "if (!provider) return result('abort', 'unlisted-host')")
add('extra-before-play', 'policy.ts', "return result('abort', 'extra-host-before-play')", "return result('record', 'named-extra-host')")
add('unlisted-host', 'policy.ts', "return result('abort', 'unlisted-host')", "return result('record', 'named-extra-host')")
add('shelf-images', 'policy.ts', "!shelf && ids.some", "ids.some")
add('host-syntax', 'authority.ts', '.regex(/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/)', '')
add('host-cap', 'authority.ts', '.max(32)', '.max(100)')
add('played-positive-sample', 'telemetry.ts', "if (event.event === 'playing') this.playing = true", "if (event.event === 'playing') { this.playing = true; this.played.add(this.current.videoId) }")
add('malformed-error', 'telemetry.ts', "Number.isSafeInteger(hook.value) && hook.value >= 0", "true")
add('stub-marker', 'telemetry.ts', "stub ? 'STUB; ' : ''", "''")
add('unreached-note', 'telemetry.ts', "'Id not reached.'", "'Attempt reached.'")
add('resume-label-sample', 'telemetry.ts', "this.resumeSample = hook.value === true ? this.lastSample : undefined", "this.resumeSample = undefined")
add('clipped-frame', 'browser-observer.js', "const exposedFrame = frame && clippedRect(frame)", "const exposedFrame = rect")
add('cancelled-response', 'redirect.ts', "return method === 'Fetch.continueResponse'", "return false && method === 'Fetch.continueResponse'")
const receipts = []
async function test(name, expected, dom = false) {
  const r = spawnSync('npm', ['test', '--', '--project', dom ? 'dom' : 'node', dom ? 'tests/dom/momentsObservationObserver.test.ts' : 'tests/momentsObservation.test.ts'], { cwd: source, encoding: 'utf8' })
  await fs.writeFile(path.join(out, name + '.log'), r.stdout + r.stderr)
  assert.equal(r.status === 0, expected, `${name}: unexpected exit ${r.status}`)
  return { exit: r.status, counts: (r.stdout + r.stderr).split('\n').filter(line => /Test Files|Tests\s/.test(line)) }
}
for (const mutation of cases) {
  const file = path.join(source, mutation.file), original = await fs.readFile(file, 'utf8')
  assert(original.includes(mutation.from), 'Missing mutation target: ' + mutation.name)
  await fs.writeFile(file, original.replaceAll(mutation.from, mutation.to))
  const dom = ['null-frame-hit', 'clipped-frame'].includes(mutation.name)
  let red
  try { red = await test(mutation.name + '-red', false, dom) }
  finally { await fs.writeFile(file, original) }
  const green = await test(mutation.name + '-green', true, dom)
  receipts.push({ ...mutation, red, green })
  await fs.writeFile(path.join(out, 'mutations.json'), JSON.stringify({ sha, count: receipts.length, receipts }, null, 2))
  console.log(mutation.name, 'red -> green')
}
