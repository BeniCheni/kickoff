// Before merge: run after npm --prefix web run build. No credentials or DB.
// node scripts/n6b-proof.mjs [/tmp/kickoff-n6b-proof.json]
import assert from 'node:assert/strict'
import { execFileSync, spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readDeployment, smoke } from './vercel-smoke.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
const reserve = net.createServer()
await new Promise(resolve => reserve.listen(0, '127.0.0.1', resolve))
const port = reserve.address().port
await new Promise(resolve => reserve.close(resolve))
const local = `http://127.0.0.1:${port}`
// Allowlist the child environment: a local application process never gets a
// bypass, GitHub token, database address, or inherited provider credential.
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
  cwd: path.join(root, 'web'), stdio: 'ignore',
  env: { PATH: process.env.PATH, NEXT_TELEMETRY_DISABLED: '1', VERCEL_GIT_COMMIT_SHA: sha },
})
const receipt = { sha, nextStart: true, checks: [] }
try {
  let ready = false
  for (let attempt = 0; attempt < 60; attempt++) {
    try { ready = (await fetch(`${local}/api/snapshot`, { signal: AbortSignal.timeout(1000) })).status === 200 } catch { /* booting */ }
    if (ready) break
    if (child.exitCode !== null) throw new Error('Local next start exited')
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  assert(ready, 'Local next start did not become ready')
  const event = {
    action: 'vercel.deployment.success',
    client_payload: { project: { name: 'kickoff' }, environment: 'preview', url: 'https://kickoff-local-proof.vercel.app', git: { sha, ref: 'main' } },
  }
  const deployment = readDeployment('repository_dispatch', event, 'kickoff')
  const forward = async (input, init) => {
    assert.equal(new URL(input).origin, deployment.url)
    assert.equal([...init.headers].length, 0) // This proof never supplies a bypass.
    const address = new URL(input)
    return fetch(local + address.pathname + address.search, init)
  }
  const input = { ...deployment, project: 'kickoff', mainSha: sha }
  await assert.rejects(smoke(input, { fetchImpl: forward }), /Gallery unavailable on latest main/)
  receipt.checks.push('latest main rejects the real unavailable gallery')
  const reported = await smoke({ ...input, ref: 'feature/n6b-proof' }, { fetchImpl: forward })
  assert.equal(reported.checks.length, 4)
  assert(reported.gallery.includes('reported'))
  receipt.checks.push('other deployment: all HTTP routes, real landmarks, Vercel SHA, git-show digest, no response leaks; unavailable gallery reported')
  await assert.rejects(smoke(input, { fetchImpl: async (request, init) => {
    if (new URL(request).pathname === '/api/snapshot') return Response.json({ sourceSha: '0'.repeat(40), snapshotDigest: reported.snapshotDigest })
    return forward(request, init)
  } }), /source SHA/)
  receipt.checks.push('wrong deployed SHA rejects before gallery verdict')
  writeFileSync(path.resolve(process.argv[2] ?? '/tmp/kickoff-n6b-proof.json'), JSON.stringify(receipt, null, 2) + '\n')
  console.log(JSON.stringify(receipt))
} finally {
  child.kill('SIGTERM')
  await new Promise(resolve => child.exitCode !== null ? resolve() : child.once('exit', resolve))
}
