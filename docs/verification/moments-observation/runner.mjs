import { guardNetwork } from './cdp-network.mjs'
import { redirectVariants, fixtureURL, serveFixture, runRedirectProbe } from './probe-fixtures.mjs'
// Manual entry. Invoke with node --import tsx; a Playwright path is always explicit.
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import http from 'node:http'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { createInterface } from 'node:readline/promises'
import { parseArgs } from 'node:util'
import { validateAuthority, stubAuthority, Refusal } from './authority.ts'
import { apiUrl, providerHost, dnsGuard, decideRequest } from './policy.ts'
import { checkBundle } from './edition.ts'
import { providerRelease, applyDecision } from './route.ts'
import { detectStop, stopReasons } from './stops.ts'
import { Telemetry, observations } from './telemetry.ts'
import { hasEmbedPermission } from '../../../src/lib/moments.ts'
import { redirectLocation } from './redirect.ts'

const { values: args } = parseArgs({ options: {
  stub: { type: 'boolean' }, live: { type: 'boolean' }, authority: { type: 'string' },
  runtime: { type: 'string' }, chrome: { type: 'string' }, origin: { type: 'string' },
  port: { type: 'string' }, dist: { type: 'string', default: 'dist-acceptance' }, out: { type: 'string' },
  headless: { type: 'boolean' }, variant: { type: 'string', default: 'clean' },
  'ceiling-ms': { type: 'string', default: '300000' }, 'manual-next': { type: 'boolean' },
} })
if (!args.out) throw new Refusal('output-required')
const out = path.resolve(args.out)
await fs.mkdir(out, { recursive: false })
const startedAt = new Date().toISOString()
const result = { startedAt, mode: args.live ? 'live' : 'stub', status: 'refused', stopReason: null,
  requests: [], console: [], events: [], checkpoints: [], captures: [], human: [],
  ads: 'not observed; final human checkpoint not reached', picture: 'not observed', manualNext: 'not requested',
  nonClaims: [
    'A green stub is not playback. A loopback result predicts nothing about the Pages origin.',
    'Browser-level traffic outside Playwright is not claimed. DNS guard is additional protection in stub mode.',
    'Opaque media signatures, binary bodies and undocumented identity encodings are not decoded.',
    'Full reducer state is not exposed. DOM attributes give selection, visited rows and placement; adapter hooks give dispatches, not a reducer dump.',
    'Ads and picture/blank-return judgments require Beni. Decoding and the Referer received by the provider are not observable here.',
    'Content, rights, readiness duration, nearest-keyframe seeking, real autoplay and attribute retention are not proved by stubs.',
    'Physical devices, Safari, Firefox, screen-reader speech, zoom, Android/iOS Back and CloseWatcher are not verified.',
  ], network: { providerContinued: 0, providerFulfilled: 0, providerAborted: 0, unhandledProviderResponses: [], bytesWhileParked: 0, wireHeaders: [], hosts: {} },
}
let context, server, profile, timer, terminal, authority, telemetry, page, stopping, networkGuard, pending = new Set()
const redirectProbe = args.stub && redirectVariants.includes(args.variant)
result.redirectProof = { locationHits: 0, probeFinished: false }
let phase = 'before-play', seen = { api: false, frames: [] }, parked = false
const promptAbort = new AbortController()
process.once('SIGINT', () => stop('operator-interrupt'))
const now = () => new Date().toISOString()
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex')
async function endpointProof(profileDir) {
  let devToolsActivePort = true
  try { await fs.access(path.join(profileDir, 'DevToolsActivePort')) } catch { devToolsActivePort = false }
  const processes = execFileSync('ps', ['-ww', '-axo', 'pid=,command='], { encoding: 'utf8' }).split('\n')
  const parent = processes.find(line => line.includes('--user-data-dir=' + profileDir) && !line.includes('--type='))
  const pids = []
  const walk = pid => {
    if (!pid || pids.includes(pid)) return
    pids.push(pid)
    let kids = ''
    try { kids = execFileSync('pgrep', ['-P', pid], { encoding: 'utf8' }) } catch { kids = '' }
    for (const kid of kids.trim().split('\n').filter(Boolean)) walk(kid)
  }
  if (parent) walk(parent.trim().split(/\s+/)[0])
  // The third fact is measured only when the tree was found and lsof ran. An empty pid list
  // or an lsof that did not run leaves listeningSockets null, never an empty list.
  let listeningSockets = null, lsof = pids.length ? 'not run' : 'no chrome pids found'
  if (pids.length) {
    const parse = out => out.split('\n').filter(line => line && !line.startsWith('COMMAND'))
    try { listeningSockets = parse(execFileSync('lsof', ['-nP', '-a', '-iTCP', '-sTCP:LISTEN', '-p', pids.join(',')], { encoding: 'utf8' })); lsof = 'exit 0' }
    catch (error) {
      // Measured here: lsof exits 1 with empty stdout and stderr when no socket matches.
      if (error.status === 1 && typeof error.stdout === 'string' && !String(error.stderr ?? '').trim()) { listeningSockets = parse(error.stdout); lsof = 'exit 1' }
      else lsof = 'failed: ' + (error.code ?? error.status ?? error.message)
    }
  }
  return { devToolsActivePort, chromePids: pids, listeningSockets, lsof }
}
function stop(reason) {
  if (result.stopReason) return
  result.stopReason = reason; result.status = 'stopped'
  promptAbort.abort()
  terminal?.close()
  stopping = context?.close().catch(() => {})
}
const check = evidence => { const reason = detectStop(evidence); if (reason) stop(reason) }
const ensure = () => { if (result.stopReason) throw new Error(result.stopReason) }
async function ask(question) {
  ensure()
  if (!terminal) {
    terminal = createInterface({ input: process.stdin, output: process.stdout })
    terminal.on('SIGINT', () => stop('operator-interrupt'))
  }
  const answer = await terminal.question(question + '\n> ', { signal: promptAbort.signal })
  result.human.push({ question, answer, at: now() }); ensure(); return answer
}
async function files(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true, recursive: true })
  return Promise.all(entries.filter(e => e.isFile()).map(async e => {
    const file = path.join(e.parentPath, e.name), bytes = await fs.readFile(file)
    return { path: path.relative(dir, file), sha256: hash(bytes), bytes: bytes.length, text: /\.(html|js)$/.test(file) ? bytes.toString() : '' }
  }))
}
try {
  if (!!args.stub === !!args.live) throw new Refusal('choose-one-mode')
  const mode = args.live ? 'live' : 'stub'
  if (args.live && args.headless) throw new Refusal('live-requires-headed-chrome')
  if (!args.runtime || !args.chrome) throw new Refusal('runtime-and-chrome-required')
  if (args.live && !args.authority) throw new Refusal('authority-required')
  if (!['clean', 'owner-blocked', 'cold-blocked', 'http-redirect-refused', ...redirectVariants, 'prompt-ceiling', 'malformed-error', 'extra-hosts', 'shelf-images', ...stopReasons].includes(args.variant) || (args.live && args.variant !== 'clean')) throw new Refusal('invalid-variant')
  const ceiling = Number(args['ceiling-ms'])
  if (!Number.isInteger(ceiling) || ceiling < 100 || ceiling > 900000) throw new Refusal('invalid-safety-ceiling')
  result.safetyCeiling = { milliseconds: ceiling, meaning: 'Operational total-run safety ceiling, not a product readiness timeout' }
  const root = await fs.realpath(execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim())
  const realOutput = await fs.realpath(out)
  if (realOutput === root || realOutput.startsWith(root + path.sep)) throw new Refusal('receipt-must-be-external')
  if (args.authority) {
    const file = await fs.realpath(args.authority)
    if (file === root || file.startsWith(root + path.sep)) throw new Refusal('authority-must-be-external')
    const text = await fs.readFile(file, 'utf8')
    await fs.writeFile(path.join(out, 'authority.json'), text)
    authority = JSON.parse(text)
  }
  let origin = args.origin ?? authority?.origin ?? `http://127.0.0.1:${args.port ?? '4318'}`
  authority ??= stubAuthority(origin)
  if (mode === 'stub' && args.variant === 'extra-hosts') authority.hosts.push('named.s4a.test')
  authority = validateAuthority(authority, origin, now(), mode)
  const target = new URL(origin)
  if (!args.origin && !['localhost', '127.0.0.1'].includes(target.hostname)) throw new Refusal('non-loopback-requires-attach')
  if (args.port && Number(args.port) !== Number(target.port || (target.protocol === 'https:' ? 443 : 80))) throw new Refusal('port-origin-mismatch')
  if (!args.origin && target.protocol !== 'http:') throw new Refusal('local-server-http-only')
  // A refusal above imports no browser and binds no port.
  const dist = await fs.realpath(args.dist), built = (await files(dist)).sort((a, b) => a.path.localeCompare(b.path))
  const bundle = built.map(f => f.text).join('\n')
  checkBundle(bundle, authority, mode)
  const manifest = JSON.parse(bundle.match(/<script type="application\/json" id="moments-observation-manifest">([^<]+)<\/script>/)[1])
  if (!manifest.edition.every(m => hasEmbedPermission(m.source, now()))) throw new Refusal('edition-not-permitted')
  result.build = { gitSha: manifest.sha, runnerSha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    distHash: hash(JSON.stringify(built.map(({ path, sha256 }) => ({ path, sha256 })))), files: built.map(({ text, ...f }) => f) }
  if (!args.origin) {
    server = http.createServer(async (request, response) => {
      try {
        if (redirectProbe && serveFixture(request, response, origin, result.redirectProof)) return
        const pathname = decodeURIComponent(new URL(request.url, origin).pathname)
        if (mode === 'stub' && args.variant === 'http-redirect-refused' && pathname === '/redirect-check') {
          response.writeHead(302, { Location: apiUrl }); response.end(); return
        }
        const file = await fs.realpath(path.resolve(dist, '.' + (pathname === '/' ? '/index.html' : pathname)))
        if (!file.startsWith(dist + path.sep)) { response.writeHead(403); response.end(); return }
        response.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html')
        response.end(await fs.readFile(file))
      } catch { response.writeHead(404); response.end() }
    })
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(Number(target.port || 80), target.hostname, resolve) })
    const port = server.address().port
    if (mode === 'stub' && target.port === '0') {
      origin = `http://${target.hostname}:${port}`; authority = validateAuthority({ ...authority, origin }, origin, now(), mode)
    }
    result.boundPort = port
  } else result.boundPort = null
  result.origin = origin; result.authority = authority
  result.network.runnerAborts = {}
  await fs.writeFile(path.join(out, 'authority-copy.json'), JSON.stringify(authority, null, 2))
  telemetry = new Telemetry(authority.ids.map(i => i.id))
  const assess = state => {
    check({ parentChanged: state.parentChanged, queueCovered: state.rows.some(r => r.intersects || r.hitFrame),
      resume: state.status.some(s => s.includes('Resuming')), lastSample: telemetry.resumeSample })
    const id = state.rows.find(r => r.active === 'true')?.id
    const item = manifest.edition.find(m => m.id === id)
    if (item) check({ playShown: state.primary.some(p => p.tag === 'BUTTON' && /^(Play|Pause|Retry|Replay)$/.test(p.text)), permitted: hasEmbedPermission(item.source, now()) })
    const code = telemetry.current && telemetry.errors.get(telemetry.current.videoId)
    if (code === 150) check({ error150Territory: state.status.some(s => /(?:blocked|unavailable) (?:in|for) (?:your|this) (?:territory|region|country)|territory block/i.test(s)) })
  }
  const chromeVersion = execFileSync(args.chrome, ['--version'], { encoding: 'utf8' }).trim()
  if (!chromeVersion.startsWith('Google Chrome ')) throw new Refusal('installed-google-chrome-required')
  result.browser = { executable: args.chrome, version: chromeVersion, headed: !args.headless, os: `${os.platform()} ${os.release()} ${os.arch()}` }
  result.dnsGuard = mode === 'stub' ? dnsGuard : null
  console.log(JSON.stringify({ origin, boundPort: result.boundPort, browser: result.browser, ids: authority.ids, hosts: authority.hosts, safetyCeiling: result.safetyCeiling }, null, 2))
  // The total ceiling includes typed confirmation and every later manual checkpoint.
  timer = setTimeout(() => stop('operational-safety-ceiling'), ceiling)
  let confirmation = ''
  if (mode === 'stub' && args.variant === 'prompt-ceiling') await ask('Stub-only open prompt; wait for the ceiling.')
  if (mode === 'live') {
    if (!process.stdin.isTTY) throw new Refusal('live-requires-beni-terminal')
    confirmation = await ask(`Confirm this Chrome and allowlist. Type RELEASE ${origin} to launch the one visit.`)
    authority = validateAuthority(authority, origin, now(), mode)
    result.authority = authority
  }
  const stub = await fs.readFile(new URL('./observation-stub.js', import.meta.url), 'utf8')
  const recordAbort = (url, reason) => {
    const host = new URL(url).hostname
    const reasons = result.network.runnerAborts[host] ??= {}
    reasons[reason] = (reasons[reason] ?? 0) + 1
  }
  const local = async route => {
    const u = new URL(route.request().url())
    if (u.href === apiUrl) {
      result.network.providerFulfilled++; await route.fulfill({ contentType: 'text/javascript', body: stub })
    } else if (u.hostname === 'www.youtube-nocookie.com' && u.pathname.startsWith('/embed/')) {
      result.network.providerFulfilled++; await route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Local observation stub</title><body style="background:#234;color:white">Synthetic frame. No provider picture.</body>' })
    } else if (u.hostname === 'named.s4a.test' && args.variant === 'extra-hosts') {
      await route.fulfill({ contentType: 'text/javascript', body: '/* local named-host fixture */' })
    } else { if (providerHost(u.hostname)) result.network.providerAborted++; recordAbort(u.href, 'stub-request-not-served'); await route.abort() }
  }
  const release = providerRelease(mode, authority, origin, now(), confirmation, local)
  ensure()
  const { chromium } = await import(path.resolve(args.runtime))
  profile = await fs.mkdtemp(path.join(os.tmpdir(), 'kickoff-observation-chrome-'))
  result.authorityAgeMs = Date.parse(now()) - Date.parse(authority.at)
  context = await chromium.launchPersistentContext(profile, { executablePath: args.chrome, headless: !!args.headless, chromiumSandbox: true,
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: 'reduce', serviceWorkers: 'block',
    args: ['--disable-background-networking', '--disable-component-update', '--disable-domain-reliability', '--disable-sync', '--no-first-run', '--no-default-browser-check', '--disable-features=MediaRouter,OptimizationHints', ...(mode === 'stub' ? [dnsGuard + ', MAP *.s4a.test 127.0.0.1'] : [])] })
  result.browser.launchedVersion = context.browser()?.version() ?? chromeVersion
  result.browser.freshProfile = true
  const handled = new Set()
  const routeRequest = async route => {
    const request = route.request(), url = request.url()
    const decision = decideRequest({ url: redirectProbe && fixtureURL(url, origin) ? origin + new URL(url).pathname : url, body: request.postData() ?? '', resourceType: request.resourceType(), phase, origin,
      namedIds: authority.ids.map(i => i.id), hosts: authority.hosts, seen })
    seen = decision.next
    const record = { at: now(), url, method: request.method(), resourceType: request.resourceType(), phase, decision, parked,
      proposedReferer: request.headers().referer ?? null, disposition: 'pending' }
    result.requests.push(record)
    const host = new URL(url).hostname
    result.network.hosts[host] = (result.network.hosts[host] ?? 0) + 1
    if (decision.provider) handled.add(url)
    try {
      if (result.stopReason || decision.action === 'stop' || decision.action === 'abort') {
        recordAbort(url, decision.reason)
        if (decision.provider) result.network.providerAborted++
        record.disposition = 'aborted'; await route.abort()
        if (decision.action === 'stop') stop(decision.reason)
        return
      }
      if (decision.provider || decision.reason === 'named-extra-host' || decision.reason === 'shelf-image') {
        record.disposition = mode === 'stub' ? 'local-or-aborted' : 'continued'
        if (mode === 'live' && decision.provider) result.network.providerContinued++
        await applyDecision(route, decision, release)
      } else { record.disposition = 'continued-local-or-fonts'; await route.continue() }
    } catch (error) { if (!result.stopReason) stop('routing-failed: ' + error.message) }
  }
  result.network.redirects = []
  networkGuard = await guardNetwork(context.browser(), routeRequest, redirect => { result.network.redirects.push(redirect); recordAbort(redirect.url, 'http-redirect-refused'); stop('http-redirect-refused') }, error => { if (!result.stopReason && result.status !== 'complete') stop('response-guard-failed: ' + error.message) }, pending)
  context.on('response', response => {
    if (providerHost(new URL(response.url()).hostname) && !handled.has(response.url())) {
      result.network.unhandledProviderResponses.push(response.url()); stop('unhandled-provider-response')
    }
  })
  context.on('page', extra => { if (page && extra !== page) stop('unexpected-page') })
  context.on('requestfinished', request => {
    const pendingSize = (async () => {
      const row = result.requests.find(r => r.url === request.url() && !r.sizes)
      if (row) row.sizes = await request.sizes()
    })().catch(() => {})
    pending.add(pendingSize); pendingSize.finally(() => pending.delete(pendingSize))
  })
  await context.exposeBinding('__observationReport', ({ frame }, entry) => {
    if (page && frame !== page.mainFrame()) return
    result.events.push({ at: now(), ...entry })
    if (entry.kind === 'hook') { const reason = telemetry.accept(entry.value); if (reason) stop(reason) }
    if (entry.kind === 'structure') check(entry.value)
    if (entry.kind === 'dom') assess(entry.value)
  })
  await context.addInitScript({ path: new URL('./browser-observer.js', import.meta.url).pathname })
  if (mode === 'stub') await context.addInitScript(variant => { window.__observationVariant = variant }, args.variant)
  page = context.pages()[0] ?? await context.newPage()
  result.browser.launchCommand = execFileSync('ps', ['-ww', '-axo', 'command='], { encoding: 'utf8' }).split('\n').find(line => line.includes('--user-data-dir=' + profile) && !line.includes('--type='))?.replaceAll(profile, '<fresh-profile>') ?? 'not observed'
  result.browser.endpointProof = await endpointProof(profile)
  result.browser.webdriver = await page.evaluate(() => navigator.webdriver)
  // CDP's extra-info headers describe the browser's network request, rather than the
  // intercepted proposal. Locally fulfilled frame requests may have no wire headers.
  const cdp = await context.newCDPSession(page), wireUrls = new Map()
  await cdp.send('Network.enable')
  cdp.on('Network.requestWillBeSent', event => wireUrls.set(event.requestId, event.request.url))
  cdp.on('Network.requestWillBeSentExtraInfo', event => result.network.wireHeaders.push({ requestId: event.requestId,
    url: wireUrls.get(event.requestId) ?? null, headers: event.headers, note: 'Browser-reported sent headers; not a server receipt' }))
  cdp.on('Network.dataReceived', event => {
    const url = wireUrls.get(event.requestId)
    if (parked && url && providerHost(new URL(url).hostname)) result.network.bytesWhileParked += event.encodedDataLength
  })
  page.setDefaultTimeout(0); page.setDefaultNavigationTimeout(0)
  page.on('console', msg => result.console.push({ type: msg.type(), text: msg.text() }))
  page.on('pageerror', error => result.console.push({ type: 'pageerror', text: error.message }))
  // Verify the actual served bytes (including attached origins), before any Play.
  const actual = new Map()
  page.on('response', response => {
    if (new URL(response.url()).origin !== origin) return
    const task = response.body().then(bytes => actual.set(new URL(response.url()).pathname.replace(/^\//, '') || 'index.html', hash(bytes))).catch(() => {})
    pending.add(task); task.finally(() => pending.delete(task))
  })
  await page.goto(origin + '/?tab=moments&lens=ledger', { waitUntil: 'load' })
  result.pageLoads = 1
  await page.locator('[data-lead]').waitFor(); await page.evaluate(() => document.fonts.ready)
  await Promise.all([...pending])
  for (const file of built.filter(f => /\.(html|js)$/.test(f.path))) if (actual.get(file.path) !== file.sha256) throw new Refusal('served-bundle-mismatch', file.path)
  result.servedBundleVerified = true
  const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const snapshot = async label => {
    ensure()
    const state = await page.evaluate(() => window.__observationSnapshot())
    result.checkpoints.push({ label, at: now(), ...state, lastSample: telemetry.lastSample })
    if (state.width !== state.scrollWidth) stop('horizontal-overflow')
    assess(state)
    ensure(); return { ...state, lastSample: telemetry.lastSample }
  }
  const click = async name => {
    ensure()
    const scope = name instanceof RegExp && name.source === 'Open selection' ? page.locator('[data-lead]') : page
    const button = scope.getByRole('button', { name, exact: typeof name === 'string' })
    await button.scrollIntoViewIfNeeded(); await settle()
    const point = await button.evaluate(n => { const r = n.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, hit: n.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)) } })
    if (!point.hit) { stop('control-hit-missed'); ensure() }
    const before = result.events.filter(e => e.kind === 'click').length
    if (name === 'Play') { phase = 'after-play'; telemetry.warmDirect = telemetry.ready }
    await page.mouse.click(point.x, point.y); await settle()
    result.checkpoints.push({ label: 'click', name: String(name), parentReceived: result.events.filter(e => e.kind === 'click').length > before })
    ensure()
  }
  const capture = async (label, width) => {
    await page.setViewportSize({ width, height: width === 1000 ? 900 : 844 }); await settle()
    const state = await snapshot(label)
    const filename = `${label}-${width}.png`
    await page.screenshot({ path: path.join(out, filename), fullPage: true })
    result.captures.push({ file: filename, sha256: hash(await fs.readFile(path.join(out, filename))), width, scrollWidth: state.scrollWidth })
    if (mode === 'live') await ask(`Picture checkpoint: ${label}, ${width}px. Describe the picture and letterboxing now; Enter records your words.`)
  }
  const rows = async () => {
    const scope = await page.locator('[data-moments-cinema]').count() ? page.locator('[data-moments-cinema]') : page.locator('[data-moments-gallery]')
    const count = await scope.locator('[data-queue-id]').filter({ visible: true }).count()
    for (let i = 0; i < count; i++) {
      const row = scope.locator('[data-queue-id]').filter({ visible: true }).nth(i)
      await row.scrollIntoViewIfNeeded(); await settle(); await snapshot('queue-row-hit-' + i)
    }
  }
  await snapshot('before-play')
  if (args.variant.startsWith('redirect-first')) {
    await runRedirectProbe(page, args.variant, origin, result.redirectProof)
    ensure(); throw new Refusal('probe-finished')
  }
  if (args.variant === 'http-redirect-refused') await page.evaluate(() => fetch('/redirect-check').catch(() => {}))
  if (args.variant === 'provider-before-play') await page.evaluate(() => { const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; document.head.append(s) })
  await click(/Open selection/)
  await snapshot('A-cover')
  await click('Play')
  // Readiness has no product timeout. The total-run safety ceiling is the only deadline.
  await page.waitForFunction(() => document.querySelector('[data-primary-action]')?.textContent.trim() === 'Pause' || document.querySelector('[data-recovery-copy]') || document.querySelector('[data-player-status]'))
  await snapshot('A-cold-result')
  if (redirectProbe) {
    await runRedirectProbe(page, args.variant, origin, result.redirectProof)
    ensure(); throw new Refusal('probe-finished')
  }
  if (args.variant === 'malformed-error') await page.evaluate(() => window.dispatchEvent(new CustomEvent('moments-observation-hook-v1', { detail: { kind: 'error', value: undefined } })))
  if (args.variant === 'extra-hosts') {
    const frame = page.frames().find(f => f !== page.mainFrame())
    await frame.evaluate(async () => { await fetch('https://named.s4a.test/probe').catch(() => {}); await fetch('https://unnamed.s4a.test/probe').catch(() => {}) })
  }
  if (args.variant === 'shelf-images') await page.evaluate(async () => {
    await Promise.all(['vi', 'sb'].map(label => new Promise(resolve => { const image = new Image(); image.onload = image.onerror = resolve; image.src = `https://i.ytimg.com/${label}/S4Stub99999/default.jpg` })))
  })
  result.onePress = { cold: telemetry.playing && !telemetry.events.some(e => e.kind === 'blocked'), warm: null,
    meaning: mode === 'stub' ? 'Synthetic events only' : 'API event and one parent Play click; picture is a separate human observation' }
  if (mode === 'stub' && !['clean', 'owner-blocked', 'cold-blocked', 'warm-autoplay-blocked', 'provider-before-play', 'error-153', 'navigation-waits', 'parked-return-blank', 'ineligible-play'].includes(args.variant)) {
    await page.evaluate(variant => {
      const emit = (kind, value) => window.dispatchEvent(new CustomEvent('moments-observation-hook-v1', { detail: { kind, value } }))
      if (variant === 'second-element') document.body.append(document.createElement('iframe'))
      if (variant === 'parent-changed') document.body.append(document.querySelector('iframe'))
      if (variant === 'queue-covered') { const row = document.querySelector('[data-queue-id]'); const r = document.querySelector('iframe').getBoundingClientRect(); Object.assign(row.style, { position: 'fixed', top: r.y + 'px', left: r.x + 'px', width: r.width + 'px', height: r.height + 'px' }) }
      if (variant === 'second-terminal-failure') for (let i = 0; i < 2; i++) emit('dispatch', { itemId: 'kickoff-moments-slice-4-test-1', attempt: 1, event: 'failure', failure: { kind: 'unknown' } })
      if (variant === 'unsampled-position') emit('dispatch', { itemId: 'kickoff-moments-slice-4-test-1', attempt: 1, event: 'position', position: 999 })
      if (variant === 'territory-150') emit('dispatch', { itemId: 'kickoff-moments-slice-4-test-1', attempt: 1, event: 'failure', failure: { kind: 'territory', providerError: 150 } })
      if (variant === 'resume-at-zero') { emit('sample', 0); emit('resume', true) }
      if (variant === 'unnamed-id') fetch('https://www.youtube.com/youtubei/v1/player?videoId=S4Stub99999&v=S4Stub99999').catch(() => {})
    }, args.variant)
    await settle(); await snapshot('fault-injected')
  }
  if (await page.getByRole('button', { name: 'Pause', exact: true }).count()) {
    if (mode === 'live') await ask('Let A advance above zero, then press Enter to sample and pause.')
    await click('Pause')
    if (!(telemetry.lastSample > 0)) stop('A-not-paused-above-zero')
  }
  ensure()
  for (const width of [390, 1000, 360]) {
    await capture('stage', width); await rows()
    await click('Enter Cinema'); await capture('cinema', width); await rows(); await click('Exit Cinema')
  }
  if (args.variant === 'ineligible-play') {
    // Synthetic clock regression makes the authority's checkedAt future to the rule.
    const item = manifest.edition[0]
    check({ playShown: true, permitted: hasEmbedPermission(item.source, '2000-01-01T00:00:00Z') }); ensure()
  }
  const parkedBefore = await snapshot('before-park')
  await click('← Gallery'); parked = true; await snapshot('parked')
  if (mode === 'live') await ask('Player is parked. Press Enter to return when ready; browser-reported bytes during this interval are recorded.')
  else await page.waitForTimeout(100)
  const samplesBeforeReturn = telemetry.events.filter(e => e.kind === 'sample').length
  await click('Return to selection'); parked = false
  const returned = await snapshot('parked-return')
  check({ returnedBlank: args.variant === 'parked-return-blank', instanceDied: !returned.sameElement || !returned.frame })
  result.park = { sameElement: returned.sameElement, sameParent: !returned.parentChanged, lastSampleBeforePark: parkedBefore.lastSample,
    lastSampleAfterReturn: telemetry.lastSample, freshSampleAtReturn: telemetry.events.filter(e => e.kind === 'sample').length > samplesBeforeReturn,
    positionLimit: 'The app need not call getCurrentTime on return; unchanged cached samples do not establish a fresh provider position.',
    encodedBytesReportedWhileParked: result.network.bytesWhileParked,
    byteScope: 'CDP Network.dataReceived on the page session; cross-process frames or buffered transfers may be absent',
    picture: mode === 'stub' ? 'synthetic only' : 'requires human' }
  if (mode === 'live') {
    const answer = await ask('Did the parked player return blank, or appear dead? yes / no / unsure')
    if (!['yes', 'no', 'unsure'].includes(answer)) throw new Refusal('invalid-blank-answer')
    check({ returnedBlank: answer === 'yes' }); ensure()
    result.park.picture = answer
  }
  ensure()
  if (authority.ids.length === 2) {
    if (args.variant === 'navigation-waits') await page.evaluate(() => document.addEventListener('click', e => { if (e.target.closest('button')?.getAttribute('aria-label')?.startsWith('Next:')) e.stopImmediatePropagation() }, true))
    if (args['manual-next'] && mode === 'live') {
      // This optional click follows the final Exit Cinema. Do not inject a click for Beni.
      await click('Enter Cinema'); await click('Exit Cinema')
      const before = result.events.filter(e => e.kind === 'click').length
      await ask('Row 71 checkpoint: press Next by hand in Chrome now, then Enter here.')
      result.manualNext = { parentClicks: result.events.filter(e => e.kind === 'click').slice(before) }
    } else await click(/^Next:/)
    const next = await snapshot('next-without-provider-reply')
    check({ navigationWaits: !next.rows.some(r => r.id === 'kickoff-moments-slice-4-test-2' && r.active === 'true') }); ensure()
    const warmStart = telemetry.events.length
    await click('Play')
    await page.waitForFunction(() => document.querySelector('[data-primary-action]')?.textContent.trim() === 'Pause' || document.querySelector('[data-recovery-copy]') || document.querySelector('[data-player-status]'))
    await snapshot('B-warm-result')
    result.onePress.warm = telemetry.playing && !telemetry.events.slice(warmStart).some(e => e.kind === 'blocked')
    await click(/^Previous:/)
    const prior = await snapshot('previous-without-provider-reply')
    check({ navigationWaits: !prior.rows.some(r => r.id === 'kickoff-moments-slice-4-test-1' && r.active === 'true') }); ensure()
    await click('Play')
    await page.waitForFunction(() => [...document.querySelectorAll('[data-player-status]')].some(n => n.textContent.includes('Resuming')) || document.querySelector('[data-recovery-copy]'))
    await snapshot('A-reload-and-seek')
  } else result.navigation = 'Next and Previous not observed: one named id'
  if (mode === 'live') {
    const answer = await ask('Ad shown during this visit: yes / no / unsure')
    if (!['yes', 'no', 'unsure'].includes(answer)) throw new Refusal('invalid-ad-answer')
    result.ads = answer
    result.picture = await ask('Describe the stage/Cinema picture and any letterboxing at the captured widths. Enter your observation verbatim.')
  } else { result.ads = 'not observed; stub'; result.picture = 'synthetic frame only' }
  if (mode === 'stub') result.stubCalls = await page.evaluate(() => window.__observationPlayers.map(p => p.calls))
  result.instancesObserved = telemetry.events.filter(e => e.kind === 'instance').length
  await snapshot('visit-complete')
  result.status = 'complete'
} catch (error) {
  if (!result.stopReason) { result.stopReason = error instanceof Refusal ? error.reason : error.message; result.status = 'refused' }
  result.error = error.message
} finally {
  clearTimeout(timer); terminal?.close()
  await stopping; await context?.close().catch(() => {})
  networkGuard?.close()
  if (redirectProbe) result.guardAudit = networkGuard?.audit
  result.network.interceptionCancellations = networkGuard?.audit.filter(entry => entry.stage === 'cancelled-response') ?? []
  await Promise.all([...pending])
  if (server) await new Promise(resolve => server.close(resolve))
  if (profile) await fs.rm(profile, { recursive: true, force: true })
  result.finishedAt = now()
  const environment = `${result.origin && ['localhost', '127.0.0.1'].includes(new URL(result.origin).hostname) ? 'loopback' : 'non-loopback'} ${result.origin ?? 'not launched'}; Chrome ${result.browser?.version ?? 'not launched'}; ${args.headless ? 'headless' : 'headed'}; ${os.platform()} ${os.release()}`
  result.observations = telemetry && result.status === 'complete' ? observations(authority.ids.map(i => i.id), telemetry, environment, now(), !!args.stub) : []
  const aborts = JSON.stringify(result.network.runnerAborts ?? {})
  if (aborts !== '{}') for (const observation of result.observations) observation.note += ` Runner aborts occurred during this visit (host/reason/count): ${aborts}. Outcomes and ad answers reflect these runner restrictions.`
  await fs.writeFile(path.join(out, 'observations.json'), JSON.stringify(result.observations, null, 2) + '\n')
  await fs.writeFile(path.join(out, 'receipt.json'), JSON.stringify(result, null, 2) + '\n')
}
console.log(JSON.stringify({ status: result.status, reason: result.stopReason, providerNetworkRequests: result.network.providerContinued,
  providerFulfilled: result.network.providerFulfilled, providerAborted: result.network.providerAborted, out }))
process.exitCode = result.status === 'complete' ? 0 : 1
