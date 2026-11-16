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

function hasLeak(text, bypass) {
  const plain = text.replace(/\\u([a-f0-9]{4})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16))).replace(/\\\//g, '/')
  return /postgres(?:ql)?:\/\/|studio_reader\.|\bdb\.[a-z0-9-]+\.supabase\.co\b|\b[a-z0-9.-]+\.pooler\.supabase\.com\b/i.test(plain) ||
    plain.includes(['KICKOFF', 'STUB', 'CATALOG'].join('-')) || plain.includes('Stub catalog · synthetic records') ||
    Boolean(bypass && plain.includes(bypass))
}

// Contract every later brief carries. A route fails without these, in the server HTML.
// The scan trusts React's escaping, so a PR that adds raw HTML to a smoke route
// hardens the scan first.
// Each name is a real attribute of its element: whitespace inside the tag precedes it,
// so a prefixed stand-in (data-aria-label, x-data-moments-background, x-data-table-picker) does not count.
// A tag name ends at whitespace, / or >, so button-probe and button.x are not buttons.
// template and noscript are skipped whole, with script, style, textarea and title.
// Attribute names are read case-insensitively, and a quoted > stays inside its value.
//   nav aria-label="Primary"         — every tab (checked below, not in ROUTES)
//   data-moments-background="route"  — Fixtures and Table
//   button aria-label="Previous"     — Fixtures only: the week stepper's previous chevron.
//                                      A button, and that exact name: "Previous week" fails.
//                                      aria-labelledby on that button fails too, in any letter case:
//                                      it overrides the name.
//   data-table-picker                — Table
//   main aria-label="Moments"        — Moments
// Two more readings are of Moments' words, and they go quiet, not red, if the words change:
//   id="moments-unavailable-heading" or "The gallery is unavailable."  — the latest-main gallery gate
//   "Stub catalog · synthetic records"                                 — the stub-catalog leak check
// "Jump to today" is not in the contract. The second edition renames that button "Today"
// (PR 3) and keeps the stepper through that week-row rebuild and the Poster books (PR 5).

function isHtmlSpace(char) {
  return char === ' ' || char === '\n' || char === '\r' || char === '\t' || char === '\f'
}

function isAsciiLetter(code) {
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122)
}

const RAW_TEXT = new Set(['script', 'style', 'textarea', 'title', 'template', 'noscript'])

// One pass over start tags. The tag name and attribute names are lowercased.
// Quoted values are taken whole, so a > inside quotes cannot end the tag.
function startTags(html) {
  const tags = []
  let i = 0
  while (i < html.length) {
    const open = html.indexOf('<', i)
    if (open === -1) break
    i = open + 1
    if (html.startsWith('!--', i)) {
      const end = html.indexOf('-->', i + 3)
      i = end === -1 ? html.length : end + 3
      continue
    }
    if (!isAsciiLetter(html.charCodeAt(i))) continue
    const nameStart = i
    i += 1
    while (i < html.length) {
      const code = html.charCodeAt(i)
      const nameChar = isAsciiLetter(code) || (code >= 48 && code <= 57) || code === 45 || code === 58 || code === 95
      if (!nameChar) break
      i += 1
    }
    const name = html.slice(nameStart, i).toLowerCase()
    // <button.x …> is not a button. The name has to end at whitespace, / or >.
    if (i >= html.length || !(isHtmlSpace(html[i]) || html[i] === '/' || html[i] === '>')) continue
    const attrs = new Map()
    let closed = false
    while (i < html.length) {
      while (isHtmlSpace(html[i])) i += 1
      if (i >= html.length) break
      if (html[i] === '>') {
        i += 1
        closed = true
        break
      }
      if (html[i] === '/' && html[i + 1] === '>') {
        i += 2
        closed = true
        break
      }
      const attrStart = i
      while (i < html.length) {
        const char = html[i]
        if (char === '=' || char === '>' || char === '/' || char === '"' || char === "'" || isHtmlSpace(char)) break
        i += 1
      }
      if (i === attrStart) {
        i += 1
        continue
      }
      const attr = html.slice(attrStart, i).toLowerCase()
      while (isHtmlSpace(html[i])) i += 1
      let value = ''
      if (html[i] === '=') {
        i += 1
        while (isHtmlSpace(html[i])) i += 1
        const quote = html[i]
        if (quote === '"' || quote === "'") {
          const valueStart = i + 1
          const valueEnd = html.indexOf(quote, valueStart)
          if (valueEnd === -1) {
            value = html.slice(valueStart)
            i = html.length
          } else {
            value = html.slice(valueStart, valueEnd)
            i = valueEnd + 1
          }
        } else {
          const valueStart = i
          while (i < html.length && !isHtmlSpace(html[i]) && html[i] !== '>') i += 1
          value = html.slice(valueStart, i)
        }
      }
      if (!attrs.has(attr)) attrs.set(attr, value)
    }
    if (closed) tags.push({ name, attrs })
    if (closed && RAW_TEXT.has(name)) {
      const closer = new RegExp(`</${name}\\s*>`, 'ig')
      closer.lastIndex = i
      const match = closer.exec(html)
      i = match ? match.index + match[0].length : html.length
    }
  }
  return tags
}

function pageLandmarks(html) {
  const found = {
    primaryNav: false,
    momentsBackground: false,
    previousButton: false,
    tablePicker: false,
    momentsMain: false,
  }
  for (const tag of startTags(html)) {
    const label = tag.attrs.get('aria-label')
    if (tag.name === 'nav' && label === 'Primary') found.primaryNav = true
    if (tag.attrs.get('data-moments-background') === 'route') found.momentsBackground = true
    if (tag.name === 'button' && label === 'Previous' && !tag.attrs.has('aria-labelledby')) found.previousButton = true
    if (tag.attrs.has('data-table-picker')) found.tablePicker = true
    if (tag.name === 'main' && label === 'Moments') found.momentsMain = true
  }
  return found
}

const ROUTES = [
  ['/', 'momentsBackground', 'previousButton'],
  ['/?tab=table', 'momentsBackground', 'tablePicker'],
  ['/?tab=moments', 'momentsMain'],
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
    if (hasLeak(body + '\n' + [...response.headers].map(([key, value]) => `${key}: ${value}`).join('\n'), bypass)) throw new Error(`Response leak: ${route}`)
    if (response.status !== 200) throw new Error(`Expected HTTP 200: ${route}`)
    if (route === '/api/snapshot') {
      let snapshot
      try { snapshot = JSON.parse(body) } catch { throw new Error('Snapshot is not JSON') }
      if (snapshot?.sourceSha !== sha) throw new Error('Snapshot source SHA does not match deployment')
      if (snapshot?.snapshotDigest !== expectedDigest) throw new Error('Snapshot digest does not match committed data')
    } else {
      const found = pageLandmarks(body)
      if (!found.primaryNav || !landmarks.every(key => found[key])) throw new Error(`Missing page landmark: ${route}`)
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
