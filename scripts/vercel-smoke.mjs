import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { appendFileSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SHA = /^[a-f0-9]{40}$/
const root = fileURLToPath(new URL('..', import.meta.url))

export function deploymentUrl(raw, project) {
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(project ?? '')) throw new Error('VERCEL_PROJECT_NAME is missing or invalid')
  let url
  try { url = new URL(raw?.includes('://') ? raw : `https://${raw}`) } catch { throw new Error('Invalid deployment URL') }
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash || url.pathname !== '/' ||
      !/^[a-z0-9-]+\.vercel\.app$/.test(url.hostname) || !url.hostname.startsWith(`${project}-`) ||
      url.hostname === `${project}-.vercel.app`) throw new Error('Deployment URL is not a generated host of this project')
  return url.origin
}

export function readDeployment(eventName, event, project) {
  let url, sha, ref
  if (eventName === 'repository_dispatch' && event.action === 'vercel.deployment.success') {
    if (event.client_payload?.project?.name !== project) throw new Error('Dispatch project does not match VERCEL_PROJECT_NAME')
    ;({ url, git: { sha, ref } = {} } = event.client_payload)
  } else if (eventName === 'workflow_dispatch') {
    ;({ url, sha } = event.inputs ?? {})
    ref = null // Manual inputs do not claim a branch; compare the SHA to main.
  } else throw new Error('Unsupported deployment event')
  if (!SHA.test(sha ?? '') || (ref !== null && (typeof ref !== 'string' || !ref))) throw new Error('Invalid deployment Git metadata')
  return { url: deploymentUrl(url, project), sha, ref }
}

// This code belongs to trusted main. The deployed commit is read as bytes only.
// Same framing as web/lib/snapshotDigest.ts, with no package install or import
// from the deployed tree: name + LF + decimal byte length + LF + bytes + LF.
export function digestAt(sha, cwd = root) {
  if (!SHA.test(sha ?? '')) throw new Error('Invalid snapshot SHA')
  const hash = createHash('sha256')
  for (const name of ['fixtures.json', 'meta.json', 'standings.json']) {
    const bytes = execFileSync('git', ['show', `${sha}:src/data/${name}`], { cwd, maxBuffer: 16 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] })
    hash.update(`${name}\n${bytes.length}\n`); hash.update(bytes); hash.update('\n')
  }
  return hash.digest('hex')
}

function hasLeak(text) {
  const plain = text.replace(/\\u([a-f0-9]{4})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16))).replace(/\\\//g, '/')
  return /postgres(?:ql)?:\/\/|studio_reader\.|\bdb\.[a-z0-9-]+\.supabase\.co\b|\b[a-z0-9.-]+\.pooler\.supabase\.com\b/i.test(plain) ||
    plain.includes(['KICKOFF', 'STUB', 'CATALOG'].join('-')) || plain.includes('Stub catalog · synthetic records')
}

// The landmarks are the shell-matrix / n3-next-vite / n4b-regressions selectors.
const ROUTES = [
  ['/', /data-moments-background="route"/, /<button\b[^>]*>Weekly<\/button>/],
  ['/?tab=table', /data-moments-background="route"/, /\bdata-table-picker(?:=|[ >])/],
  ['/?tab=moments', /<main\b[^>]*aria-label="Moments"/],
]

export async function smoke({ url, sha, project, mainSha, ref = null, bypass }, { fetchImpl = fetch, cwd = root } = {}) {
  const origin = deploymentUrl(url, project) // Refuse before constructing a secret-bearing request.
  if (!SHA.test(sha ?? '') || !SHA.test(mainSha ?? '')) throw new Error('Invalid smoke SHA')
  const expectedDigest = digestAt(sha, cwd)
  const latestMain = sha === mainSha && (ref === null || ref === 'main')
  const checks = []
  let galleryUnavailable = false
  const headers = new Headers()
  if (bypass) headers.set('x-vercel-protection-bypass', bypass)
  for (const [route, ...landmarks] of [...ROUTES, ['/api/snapshot']]) {
    let response, body
    try {
      response = await fetchImpl(`${origin}${route}`, {
        headers,
        redirect: 'manual', signal: AbortSignal.timeout(20_000),
      })
      body = await response.text()
    } catch { throw new Error(`Request failed: ${route}`) }
    // Never print a body, header, URL from a redirect, or a transport error.
    if (hasLeak(body + '\n' + [...response.headers].map(([key, value]) => `${key}: ${value}`).join('\n'))) throw new Error(`Response leak: ${route}`)
    if (response.status !== 200) throw new Error(`Expected HTTP 200: ${route}`)
    if (route === '/api/snapshot') {
      let snapshot
      try { snapshot = JSON.parse(body) } catch { throw new Error('Snapshot is not JSON') }
      if (snapshot?.sourceSha !== sha) throw new Error('Snapshot source SHA does not match deployment')
      if (snapshot?.snapshotDigest !== expectedDigest) throw new Error('Snapshot digest does not match committed data')
    } else {
      if (!/<nav\b[^>]*aria-label="Primary"/.test(body) || !landmarks.every(marker => marker.test(body))) throw new Error(`Missing page landmark: ${route}`)
      if (route === '/?tab=moments') galleryUnavailable = /id="moments-unavailable-heading"|The gallery is unavailable\./.test(body)
    }
    checks.push(route)
  }
  if (galleryUnavailable && latestMain) throw new Error('Gallery unavailable on latest main deployment')
  return { checks, sha, snapshotDigest: expectedDigest, latestMain, gallery: galleryUnavailable ? 'unavailable (reported; not latest main)' : 'available' }
}

async function cli() {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'))
  const project = process.env.VERCEL_PROJECT_NAME
  const deployment = readDeployment(process.env.GITHUB_EVENT_NAME, event, project)
  if (process.argv[2] === 'metadata') {
    appendFileSync(process.env.GITHUB_OUTPUT, `sha=${deployment.sha}\nurl=${deployment.url}\n`)
    return
  }
  const mainSha = execFileSync('git', ['rev-parse', 'refs/remotes/origin/main'], { cwd: root, encoding: 'utf8' }).trim()
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
  if (!bypass) throw new Error('VERCEL_AUTOMATION_BYPASS_SECRET is not set')
  console.log(JSON.stringify(await smoke({ ...deployment, project, mainSha, bypass })))
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  cli().catch(error => {
    // Only our fixed messages are safe; never echo arbitrary input or Git output.
    const known = /^(?:VERCEL_PROJECT_NAME|VERCEL_AUTOMATION_BYPASS_SECRET|Invalid |Deployment URL |Dispatch project |Unsupported deployment |Request failed: |Response leak: |Expected HTTP 200: |Snapshot |Missing page landmark: |Gallery unavailable)/
    console.error(known.test(error.message) ? error.message : 'Vercel smoke could not read event or committed snapshot')
    process.exitCode = 1
  })
}
