// Production-browser receipt. All captures and response bodies stay outside Git.
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { spawn, execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'
import { button, playing, regressions } from './n4b-regressions.mjs'
import { textLeakHits } from './check-client.mjs'

const webRoot = fileURLToPath(new URL('..', import.meta.url))
const origin = process.env.KICKOFF_NEXT_ORIGIN ?? 'http://127.0.0.1:5175'
const outDir = path.resolve(process.argv[2] ?? '/tmp/kickoff-n4b-moments')
mkdirSync(outDir, { recursive: true })
const indicator = 'Stub catalog · synthetic records'
const assertions = [], shots = [], responses = [], environments = [], allLogs = [], responseReads = new Set(), servers = []
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
function check(name, ok, detail) {
  assertions.push({ name, ok: Boolean(ok), ...(detail === undefined ? {} : { detail }) })
  console.log(ok ? 'OK' : 'FAIL', name, ok ? '' : JSON.stringify(detail))
}
async function extraServer(fixture, mode = 'stub', overrides = {}) {
  const socket = createServer()
  await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve))
  const port = socket.address().port
  await new Promise(resolve => socket.close(resolve))
  const url = `http://127.0.0.1:${port}`
  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: webRoot,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1', KICKOFF_CATALOG: mode, KICKOFF_DATABASE_URL: '', VERCEL_ENV: '', KICKOFF_STUB_STORAGE_ORIGIN: '', KICKOFF_STUB_CATALOG_FILE: fixture ? path.join(webRoot, 'fixtures/catalog', fixture) : '', ...overrides },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  servers.push(child)
  let logs = ''
  child.stdout.on('data', chunk => { logs += chunk })
  child.stderr.on('data', chunk => { logs += chunk })
  for (let n = 0; n < 100; n++) {
    if (child.exitCode !== null) throw new Error(`Fixture server exited: ${logs}`)
    try { if ((await fetch(url)).ok) return url } catch {}
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error(`Fixture server did not start: ${logs}`)
}
async function prepare(page, theme = 'light', autoplay = 'on') {
  const logs = []
  allLogs.push({ page, logs })
  // Next may cancel a flight stream after committing its usable prefix. Chrome
  // then discards its CDP body. Read a clone inside this isolated browser before
  // returning the same response to Next; no payload is replaced or fabricated.
  await page.exposeFunction('__kickoffFlightReceipt', ({ url, body }) => {
    responses.push({ url, type: 'text/x-component', observedBy: 'browser fetch clone before Next consumes', bytes: Buffer.byteLength(body), sha256: hash(body), hits: textLeakHits(body) })
  })
  page.on('console', message => {
    if (!['warning', 'error'].includes(message.type())) return
    // Recovery and cover deliberately fail local media requests. Retain those
    // browser diagnostics separately from app and hydration errors.
    logs.push({ browserResource: message.text().startsWith('Failed to load resource:'), text: message.text() })
  })
  page.on('pageerror', error => logs.push({ browserResource: false, text: String(error) }))
  page.on('response', response => {
    const type = response.headers()['content-type'] ?? ''
    if (!type.includes('text/html')) return
    const read = response.text().then(body => {
      responses.push({ url: response.url(), type, bytes: Buffer.byteLength(body), sha256: hash(body), hits: textLeakHits(body) })
    }).catch(error => { responses.push({ url: response.url(), type, error: String(error), fromCache: response.fromCache(), failure: response.request().failure(), hits: ['unreadable response'] }) })
    responseReads.add(read)
    void read.finally(() => responseReads.delete(read))
  })
  await page.evaluateOnNewDocument((theme, autoplay) => {
    const fetchResponse = window.fetch.bind(window)
    window.fetch = async (...args) => {
      const response = await fetchResponse(...args)
      if (response.headers.get('content-type')?.includes('text/x-component')) {
        const body = await response.clone().text()
        await window.__kickoffFlightReceipt({ url: response.url, body })
      }
      return response
    }
    const memory = new Map([['kickoff-theme', theme], ['kickoff-theme-broadcast', theme], ['kickoff-moments-autoplay-v1', autoplay]])
    Object.defineProperty(window, 'localStorage', { configurable: true, value: {
      getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, String(value)), removeItem: key => memory.delete(key), clear: () => memory.clear(), key: () => null, length: 0,
    } })
    window.__normalizations = []
    const replace = history.replaceState.bind(history)
    history.replaceState = (...args) => {
      const target = args[2] == null ? location.href : new URL(String(args[2]), location.href).href
      if (new URL(target).search !== location.search) window.__normalizations.push(target)
      return replace(...args)
    }
  }, theme, autoplay)
  return logs
}
async function shoot(page, name, logs) {
  await page.evaluate(() => document.fonts.ready)
  const measured = await page.evaluate(indicator => ({
    scrollEqual: document.documentElement.scrollWidth === innerWidth,
    scrollWidth: document.documentElement.scrollWidth, innerWidth,
    theme: document.documentElement.dataset.theme,
    indicatorFirst: document.querySelector('main.moments-gallery')?.firstElementChild?.textContent === indicator,
    indicatorSize: getComputedStyle(document.querySelector('.moments-preview')).fontSize,
  }), indicator)
  const png = await page.screenshot({ type: 'png', fullPage: true })
  writeFileSync(path.join(outDir, `${name}.png`), png)
  shots.push({ name, sha256: hash(png), ...measured })
  check(`scroll ${name}`, measured.scrollEqual, measured)
  check(`indicator ${name}`, measured.indicatorFirst && measured.indicatorSize === '12px', measured)
  check(`console ${name}`, logs.every(log => log.browserResource), logs)
  return measured
}

const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--disable-gpu', '--autoplay-policy=no-user-gesture-required'] })
process.once('SIGINT', async () => {
  for (const child of servers) child.kill('SIGTERM')
  await browser.close()
  process.exit(130)
})
let fatal
try {
  const empty = await extraServer('empty.json')
  const unavailable = await extraServer('unavailable.json')
  const closed = await extraServer(null, '')
  for (const [name, fixture, mode, overrides, stub, unavailableState] of [
    ['unset', null, '', {}, false, true],
    ['production missing address', null, 'production', {}, false, true],
    ['production dummy address', null, 'production', { KICKOFF_DATABASE_URL: 'present' }, false, true],
    ['unknown word', null, 'yes', {}, false, true],
    ['stub missing file', null, 'stub', {}, true, true],
    ['stub production refuses', 'several.json', 'stub', { VERCEL_ENV: 'production' }, false, true],
    ['stub empty', 'empty.json', 'stub', {}, true, false],
    ['stub one', 'one.json', 'stub', {}, true, false],
    ['stub several', 'several.json', 'stub', {}, true, false],
    ['stub missing thumbnail', 'missing-thumbnail.json', 'stub', {}, true, false],
    ['stub unavailable', 'unavailable.json', 'stub', {}, true, true],
    ['stub preview', 'several.json', 'stub', { VERCEL_ENV: 'preview' }, true, false],
  ]) {
    const host = await extraServer(fixture, mode, overrides)
    const child = servers.at(-1)
    const result = { name, routes: [] }
    for (const route of ['', '?tab=table', '?tab=moments', '?tab=moments&watch=stub-fenway-one']) {
      const response = await fetch(`${host}/${route}`)
      const body = await response.text()
      const hits = textLeakHits(body)
      const isMoments = route.includes('tab=moments')
      const shown = body.includes('class="moments-preview"')
      result.routes.push({ route, status: response.status, indicator: shown, hits })
      check(`environment ${name} ${route || 'Fixtures'}`, response.ok && hits.length === 0 && shown === (stub && isMoments) && (!isMoments || !unavailableState || body.includes('is unavailable.')), result.routes.at(-1))
    }
    if (!stub) for (const route of ['/moments/thumbnails/stub-fenway-one.jpg', '/stub-storage/moments/stub-fenway-one/video-b1b2c3d4.mp4']) {
      const response = await fetch(`${host}${route}`)
      check(`environment ${name} media refuses ${route}`, response.status === 404, response.status)
      await response.arrayBuffer()
    }
    environments.push(result)
    child.kill('SIGTERM')
  }
  const cases = [
    'gallery', 'empty', 'no-results', 'unavailable', 'watch-ready', 'playing', 'paused', 'ended', 'recovery', 'not-found', 'theater', 'countdown', 'cover', 'watch-unavailable',
  ]
  if (!process.env.KICKOFF_SKIP_GRID) {
    for (const lens of ['ledger', 'poster', 'broadcast']) for (const theme of ['light', 'dark']) for (const width of [360, 375, 390, 1000]) {
      const context = await browser.createBrowserContext()
      for (const state of cases) {
      const page = await context.newPage()
      await page.setViewport({ width, height: 900, deviceScaleFactor: 1 })
      const logs = await prepare(page, theme, state === 'ended' ? 'off' : 'on')
      if (state === 'cover' || state === 'recovery') {
        await page.setRequestInterception(true)
        page.on('request', request => {
          const url = request.url()
          if ((state === 'cover' && url.includes('.jpg')) || (state === 'recovery' && url.includes('.mp4'))) void request.abort()
          else void request.continue()
        })
      }
      const isWatch = !['gallery', 'empty', 'no-results', 'unavailable'].includes(state)
      const params = new URLSearchParams({ tab: 'moments', ...(lens === 'poster' ? {} : { lens }), ...(isWatch ? { watch: state === 'not-found' ? 'withdrawn-clip' : 'stub-fenway-one' } : {}) })
      const host = state === 'empty' ? empty : ['unavailable', 'watch-unavailable'].includes(state) ? unavailable : origin
      const media = []
      page.on('request', r => { if (r.url().includes('.mp4')) media.push(r.url()) })
      await page.goto(`${host}/?${params}`, { waitUntil: 'networkidle0' })
      if (state === 'no-results') await page.click('label.moments-check input')
      if (state === 'theater') await button(page, 'Theater')
      if (state === 'cover') await page.waitForSelector('.moments-cover-word')
      if (['playing', 'paused'].includes(state)) {
        await playing(page)
        if (state === 'paused') { await button(page, 'Pause'); await page.waitForFunction(() => document.querySelector('video').paused) }
      }
      if (['ended', 'countdown'].includes(state)) {
        await button(page, 'Play')
        await page.waitForFunction(() => document.querySelector('video').ended)
        if (state === 'countdown') await page.waitForFunction(() => /Up next in \d s/.test(document.body.innerText))
      }
      if (state === 'recovery') { await button(page, 'Play'); await page.waitForSelector('[role="alert"]') }
      const name = `${state}-${lens}-${theme}-${width}`
      const shot = await shoot(page, name, logs)
      check(`theme ${name}`, shot.theme === theme, shot.theme)
      if (state === 'gallery') check(`no gallery media ${name}`, media.length === 0 && await page.$('video') === null, media)
      if (state === 'watch-ready') check(`no source before Play ${name}`, media.length === 0 && await page.$eval('video', v => !v.hasAttribute('src') && !v.hasAttribute('autoplay') && v.preload === 'none'), media)
      await page.waitForNetworkIdle()
      await page.close()
      }
      await context.close()
    }
  }
  // Seven stub states, independent of whether the optional full grid ran.
  for (const [label, host, route] of [
    ['gallery', origin, '?tab=moments'], ['empty', empty, '?tab=moments'],
    ['unavailable', unavailable, '?tab=moments'], ['watch', origin, '?tab=moments&watch=stub-fenway-one'],
    ['not-found', origin, '?tab=moments&watch=withdrawn-clip'], ['watch-unavailable', unavailable, '?tab=moments&watch=stub-fenway-one'], ['no-results', origin, '?tab=moments'],
  ]) {
    const page = await browser.newPage()
    await page.setViewport({ width: 390, height: 900 })
    const logs = await prepare(page)
    await page.goto(`${host}/${route}`, { waitUntil: 'networkidle0' })
    if (label === 'no-results') await page.click('label.moments-check input')
    await shoot(page, `indicator-${label}-390`, logs)
    await page.close()
  }
  const page = await browser.newPage()
  await prepare(page)
  await page.goto(`${closed}/?tab=moments`, { waitUntil: 'networkidle0' })
  check('indicator absent outside stub', await page.$('.moments-preview') === null && await page.$eval('main', main => !main.hasAttribute('data-catalog')))
  await page.goto(`${origin}/?tab=moments&lens=poster&extra=kept#clip`, { waitUntil: 'networkidle0' })
  const normalizations = await page.evaluate(() => window.__normalizations.length)
  await page.click('h2 a[href*="watch=stub-fenway-one"]')
  await page.waitForSelector('video')
  check('canonicalSearch does not normalize again on watch entry', await page.evaluate(n => window.__normalizations.length === n, normalizations), normalizations)
  const focused = await page.evaluate(() => document.activeElement?.id)
  check('watch focuses its heading', focused === 'moments-watch-heading', focused)
  await playing(page)
  check('Play focuses the video', await page.evaluate(() => document.activeElement === document.querySelector('video')))
  await page.close()
  await regressions(browser, origin, check, page => prepare(page))
  check('no app console or hydration warnings across all interactions', allLogs.every(item => item.logs.every(log => log.browserResource)), allLogs.flatMap(item => item.logs.filter(log => !log.browserResource)))
  await Promise.allSettled([...responseReads])
  check('live HTML and flight payloads contain no private or stub sentinel marker', responses.length > 0 && responses.some(r => r.type.includes('text/x-component')) && responses.every(r => r.hits.length === 0), { responses: responses.length, flight: responses.filter(r => r.type.includes('text/x-component')).length, leaks: responses.filter(r => r.hits.length) })
} catch (error) { fatal = String(error); check('receipt completed', false, fatal) }
finally {
  await Promise.allSettled([...responseReads])
  await browser.close()
  for (const child of servers) child.kill('SIGTERM')
}
const failed = assertions.filter(item => !item.ok).map(item => item.name)
const receipt = { origin, gitHead: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: webRoot, encoding: 'utf8' }).trim(), method: 'Production Next, synthetic local catalog only. Viewport before every full-page capture. 14 states x 3 lenses x 2 themes x 4 widths. Countdown matrix waits for native ended; lifecycle tests use a controlled ended event after real Play. Response scan covers HTML and the receipt client navigations flight data. Browser resource failures retained as expected diagnostics, app and hydration messages fail.', environments, shots, assertions, responses, failed, ...(fatal ? { fatal } : {}) }
writeFileSync(path.join(outDir, 'receipt.json'), JSON.stringify(receipt, null, 2))
console.log(JSON.stringify({ shots: shots.length, assertions: assertions.length, responses: responses.length, failed }, null, 2))
if (failed.length) process.exitCode = 1
