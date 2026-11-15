// The evidence runner later overhaul PRs extend. Same Chrome, same two origins, and the
// same open discipline as the clearing. PNGs and receipt.json stay outside the repo.
//
// Not in this pass, and left for the PRs that need them: hit areas, reduced motion, the
// motion control, the flash gate, the title-swap watch, and the phone bench. Add them
// here. Do not start a second runner.
//
//   node web/scripts/evidence.mjs [outDir] [--enforce]
//
// KICKOFF_VITE_ORIGIN   built Vite preview (default http://127.0.0.1:5173)
// KICKOFF_NEXT_ORIGIN   Next production     (default http://127.0.0.1:5174)
// KICKOFF_HARNESS_ORIGIN  dev server only   (default http://127.0.0.1:5173)
// CHROME_PATH           Chrome executable
//
// Contrast records today's ratios and fails nothing. --enforce fails below 4.5, or 3
// for large text, after the receipt is written.
import assert from 'node:assert/strict'
import { mkdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'
import { decodePng } from '../../scripts/decode-png.mjs'
import { chooseWeeks, matrixAnchor, readSnapshot } from '../../scripts/evidence-weeks.mjs'
import { isLargeText, sampleContrast } from '../../scripts/rendered-contrast.mjs'

const root = fileURLToPath(new URL('../..', import.meta.url))
const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

export function originsFromEnv() {
  return {
    vite: process.env.KICKOFF_VITE_ORIGIN ?? 'http://127.0.0.1:5173',
    next: process.env.KICKOFF_NEXT_ORIGIN ?? 'http://127.0.0.1:5174',
  }
}

export function launchBrowser() {
  return puppeteer.launch({ executablePath: chrome, headless: true })
}

const NETWORK_NOISE = /net::|ERR_|Failed to load resource|fonts\.googleapis|fonts\.gstatic/i

export async function openPage(browser, url, theme, width, { waitUntil = 'networkidle0', offline = false } = {}) {
  const context = await browser.createBrowserContext()
  const page = await context.newPage()
  const errors = []
  const network = []
  page.on('pageerror', (error) => errors.push(String(error)))
  page.on('console', (message) => {
    if (!['error', 'warning'].includes(message.type())) return
    const text = message.text()
    if (offline && NETWORK_NOISE.test(text)) network.push(text)
    else errors.push(text)
  })
  page.on('requestfailed', (request) => {
    if (offline) network.push(`${request.failure()?.errorText ?? 'failed'} ${request.url()}`)
  })
  await page.setViewport({ width, height: 844, deviceScaleFactor: 1 })
  await page.evaluateOnNewDocument((chosen) => {
    localStorage.setItem('kickoff-theme', chosen)
    // A contrary retired preference must neither affect first paint nor be deleted.
    localStorage.setItem('kickoff-theme-broadcast', chosen === 'light' ? 'dark' : 'light')
  }, theme)
  if (offline) await page.setOfflineMode(true)
  const response = await page.goto(url, { waitUntil, timeout: 30_000 })
  // An offline file's font CSS never finishes; don't wait it out.
  await Promise.race([
    page.evaluate(() => document.fonts.ready),
    new Promise((resolve) => setTimeout(resolve, 3000)),
  ])
  await page.waitForFunction((chosen) => document.documentElement.dataset.theme === chosen, { timeout: 15_000 }, theme)
  return { context, page, errors, network, status: response?.status() ?? 0 }
}

async function inspect(page) {
  return page.evaluate(() => ({
    lens: document.documentElement.dataset.lens,
    theme: document.documentElement.dataset.theme,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth,
    radios: [...document.querySelectorAll('[role=radio]')].map((el) => el.textContent),
    removed: !!document.querySelector('[data-ticker], [data-lens="broadcast"]') || /Where to Watch|📺/.test(document.body.textContent)
      || [...document.querySelectorAll('button')].some((el) => /^(Weekly|Monthly)$/.test(el.textContent ?? '')),
    url: location.pathname + location.search + location.hash,
    text: document.body.innerText,
    retiredTheme: localStorage.getItem('kickoff-theme-broadcast'),
  }))
}

async function shoot(page, file, width) {
  await page.setViewport({ width, height: 844, deviceScaleFactor: 1 })
  await page.screenshot({ path: file, fullPage: true })
}

function assertCell(state, errors, { id, lens, theme, tab }) {
  assert.equal(state.scrollWidth, state.innerWidth, id)
  assert.equal(state.lens, lens, id)
  assert.equal(state.theme, theme, id)
  assert.deepEqual(state.radios, ['Poster', 'Ledger'], id)
  assert.equal(state.removed, false, id)
  assert.equal(state.retiredTheme, theme === 'light' ? 'dark' : 'light', id)
  if (tab === 'fixtures') assert.match(state.text, /Filters/i, id)
  if (tab === 'moments') assert.match(state.text, /Moments/i, id)
  assert.deepEqual(errors, [], id)
}

async function collectText(page) {
  return page.evaluate(() => {
    window.scrollTo(0, 0)
    const samples = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let node = walker.nextNode()
    while (node) {
      const raw = node.textContent ?? ''
      const text = raw.replace(/\s+/g, ' ').trim()
      const parent = node.parentElement
      if (text && parent && parent.tagName !== 'SCRIPT' && parent.tagName !== 'STYLE') {
        let shown = true
        for (let el = parent; el && el !== document.documentElement; el = el.parentElement) {
          const style = getComputedStyle(el)
          if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
            shown = false
            break
          }
        }
        if (shown) {
          const range = document.createRange()
          range.selectNodeContents(node)
          const style = getComputedStyle(parent)
          const weight = Number.parseInt(style.fontWeight, 10) || 400
          const rects = [...range.getClientRects()].filter((rect) => {
            if (rect.width < 1 || rect.height < 1) return false
            for (let el = parent; el && el !== document.body; el = el.parentElement) {
              const clip = getComputedStyle(el)
              if (clip.overflow === 'visible' && clip.overflowX === 'visible' && clip.overflowY === 'visible') continue
              const box = el.getBoundingClientRect()
              if (rect.bottom <= box.top + 0.5 || rect.top >= box.bottom - 0.5) return false
            }
            return true
          }).map((rect) => ({
            x: rect.x,
            y: rect.y + window.scrollY,
            w: rect.width,
            h: rect.height,
          }))
          if (rects.length) samples.push({
            text: text.slice(0, 40),
            color: style.color,
            fontSize: Number.parseFloat(style.fontSize),
            fontWeight: weight,
            rects,
          })
        }
      }
      node = walker.nextNode()
    }
    return {
      samples,
      scrollHeight: document.documentElement.scrollHeight,
      innerWidth: window.innerWidth,
    }
  })
}

async function measureContrast(page, id, width) {
  const collected = await collectText(page)
  await page.evaluate(() => {
    const style = document.createElement('style')
    style.setAttribute('data-contrast-hide', '')
    style.textContent = '*{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}'
    document.documentElement.appendChild(style)
  })
  await page.setViewport({ width, height: 844, deviceScaleFactor: 1 })
  const buffer = await page.screenshot({ fullPage: true })
  const image = decodePng(buffer)
  const samples = collected.samples.map((sample) => ({
    ...sample,
    large: isLargeText(sample.fontSize, sample.fontWeight),
  }))
  const scaleX = collected.innerWidth ? image.width / collected.innerWidth : 1
  const scaleY = collected.scrollHeight ? image.height / collected.scrollHeight : 1
  return {
    id,
    image: { width: image.width, height: image.height },
    minimums: sampleContrast(samples, image, scaleX, scaleY),
  }
}

function cellReceipt(id, state, errors) {
  const { text, ...rest } = state
  return { id, ...rest, errors }
}

export async function runMatrix(browser, { origins, out, anchor, contrast = false }) {
  const cells = []
  const legacy = []
  const measurements = []
  const contrastCells = []
  for (const [app, origin] of Object.entries(origins)) {
    for (const lens of ['poster', 'ledger']) for (const theme of ['light', 'dark']) {
      for (const tab of ['fixtures', 'table', 'moments']) for (const width of [360, 375, 390, 1000]) {
        const id = `${app}-${lens}-${theme}-${tab}-${width}`
        const { context, page, errors } = await openPage(browser, `${origin}/?lens=${lens}&tab=${tab}&date=${anchor}`, theme, width)
        try {
          const state = await inspect(page)
          assertCell(state, errors, { id, lens, theme, tab })
          if (tab === 'table') assert.ok(await page.$('[data-table-picker]'), id)
          if (width === 390 && tab === 'fixtures' && theme === 'light') {
            const row = await page.$('button[aria-expanded]')
            assert.ok(row, id)
            measurements.push({ app, lens, top: await row.evaluate((el) => el.parentElement.getBoundingClientRect().top) })
          }
          await shoot(page, path.join(out, `${id}.png`), width)
          if (contrast) contrastCells.push(await measureContrast(page, id, width))
          cells.push(cellReceipt(id, state, errors))
        } finally { await context.close() }
      }
      console.log(`${app} ${lens} ${theme}: 12 cells passed`)
    }
    for (const search of ['?lens=broadcast', '?view=month']) {
      const { context, page, errors } = await openPage(browser, `${origin}/${search}`, 'light', 390)
      try {
        const state = await inspect(page)
        assert.equal(state.lens, 'poster')
        assert.equal(state.url, '/')
        assert.equal(state.removed, false)
        assert.equal(state.scrollWidth, state.innerWidth)
        assert.deepEqual(errors, [])
        const name = search.includes('lens') ? 'lens' : 'view'
        await shoot(page, path.join(out, `${app}-legacy-${name}.png`), 390)
        const { text, ...rest } = state
        legacy.push({ app, search, landed: rest.url, lens: rest.lens, scrollWidth: rest.scrollWidth })
      } finally { await context.close() }
    }
  }
  return { cells, legacy, measurements, contrast: contrastCells }
}

const WEEK_WIDTHS = [360, 390, 1000]

export async function captureWeeks(browser, { origins, out, weeks, contrast }) {
  const cells = []
  const contrastCells = []
  for (const kind of ['heavy', 'quiet', 'uefa']) {
    const week = weeks[kind]
    if (!week?.monday) continue
    for (const [app, origin] of Object.entries(origins)) {
      for (const lens of ['poster', 'ledger']) for (const theme of ['light', 'dark']) {
        for (const width of WEEK_WIDTHS) {
          const id = `${app}-week-${kind}-${lens}-${theme}-${width}`
          const { context, page, errors } = await openPage(
            browser, `${origin}/?lens=${lens}&tab=fixtures&date=${week.monday}`, theme, width,
          )
          try {
            const state = await inspect(page)
            assertCell(state, errors, { id, lens, theme, tab: 'fixtures' })
            await shoot(page, path.join(out, `${id}.png`), width)
            if (contrast) contrastCells.push(await measureContrast(page, id, width))
            cells.push({ ...cellReceipt(id, state, errors), week: week.monday, kind })
          } finally { await context.close() }
        }
      }
    }
    console.log(`week ${kind} ${week.monday}: ${Object.keys(origins).length * 12} cells passed`)
  }
  return { cells, contrast: contrastCells }
}

function resourceBucket(type) {
  if (type === 'Font') return 'fonts'
  if (type === 'Image' || type === 'Media') return 'images'
  if (type === 'Script') return 'script'
  if (type === 'Stylesheet') return 'style'
  return 'other'
}

export async function captureRequests(browser, origins, anchor) {
  const rows = []
  for (const [app, origin] of Object.entries(origins)) {
    for (const tab of ['fixtures', 'table', 'moments']) for (const width of [390, 1000]) {
      const context = await browser.createBrowserContext()
      const page = await context.newPage()
      const client = await page.createCDPSession()
      await client.send('Network.enable')
      await client.send('Network.setCacheDisabled', { cacheDisabled: true })
      const byId = new Map()
      client.on('Network.requestWillBeSent', (event) => {
        byId.set(event.requestId, { url: event.request.url, type: event.type, encoded: 0 })
      })
      client.on('Network.responseReceived', (event) => {
        const row = byId.get(event.requestId)
        if (row) row.type = event.type
      })
      client.on('Network.loadingFinished', (event) => {
        const row = byId.get(event.requestId)
        if (row) row.encoded = event.encodedDataLength
      })
      await page.setViewport({ width, height: 844, deviceScaleFactor: 1 })
      await page.evaluateOnNewDocument(() => localStorage.setItem('kickoff-theme', 'light'))
      await page.goto(`${origin}/?lens=poster&tab=${tab}&date=${anchor}`, { waitUntil: 'networkidle0', timeout: 30_000 })
      await context.close()
      const bytes = { fonts: 0, images: 0, script: 0, style: 0, other: 0 }
      const hosts = new Map()
      for (const request of byId.values()) {
        const bucket = resourceBucket(request.type)
        bytes[bucket] += request.encoded
        let host = ''
        try { host = new URL(request.url).host } catch { host = '' }
        if (!host) continue
        const prev = hosts.get(host) ?? { host, bytes: 0, count: 0 }
        prev.bytes += request.encoded
        prev.count += 1
        hosts.set(host, prev)
      }
      rows.push({
        id: `${app}-${tab}-${width}`,
        bytes,
        hosts: [...hosts.values()].sort((a, b) => a.host.localeCompare(b.host)),
      })
    }
  }
  return rows
}

export async function captureOffline(browser, out) {
  const files = {
    offline: path.join(root, 'dist-offline/index.html'),
    single: path.join(root, 'dist-single/index.html'),
  }
  const sizes = {}
  for (const [name, file] of Object.entries(files)) {
    const stat = statSync(file)
    sizes[name] = { file: path.relative(root, file), bytes: stat.size }
  }
  const cells = []
  for (const tab of ['fixtures', 'table']) for (const theme of ['light', 'dark']) {
    const id = `offline-${tab}-${theme}-390`
    const search = tab === 'fixtures' ? '' : '?tab=table'
    const { context, page, errors, network } = await openPage(
      browser, `${pathToFileURL(files.offline).href}${search}`, theme, 390,
      { waitUntil: 'domcontentloaded', offline: true },
    )
    try {
      if (tab === 'table') await page.waitForSelector('[data-table-picker]', { timeout: 15_000 })
      else await page.waitForSelector('button[aria-label="Previous"]', { timeout: 15_000 })
      const state = await inspect(page)
      assert.equal(state.scrollWidth, state.innerWidth, id)
      assert.equal(state.theme, theme, id)
      assert.deepEqual(errors, [], id)
      await shoot(page, path.join(out, `${id}.png`), 390)
      cells.push({ id, theme, tab, scrollWidth: state.scrollWidth, network })
    } finally { await context.close() }
  }
  return { sizes, cells }
}

export async function captureHarness(browser, out) {
  const origin = process.env.KICKOFF_HARNESS_ORIGIN ?? 'http://127.0.0.1:5173'
  const cells = []
  for (const theme of ['light', 'dark']) for (const width of [360, 390]) {
    const id = `harness-${theme}-${width}`
    // The dev server's HMR socket never goes idle, so this load waits for the page's own flag.
    const { context, page, errors, status } = await openPage(
      browser, `${origin}/tests/harness/states.html?lens=ledger&theme=${theme}`, theme, width,
      { waitUntil: 'load' },
    )
    try {
      if (status >= 400) throw new Error(`${id} HTTP ${status}`)
      await page.waitForFunction(
        () => document.documentElement.dataset.statesReady === 'true' || document.documentElement.dataset.statesError,
        { timeout: 15_000 },
      )
      const failure = await page.evaluate(() => document.documentElement.dataset.statesError ?? '')
      if (failure) throw new Error(`${id}: ${failure}`)
      const state = await inspect(page)
      assert.equal(state.scrollWidth, state.innerWidth, id)
      assert.equal(state.theme, theme, id)
      assert.deepEqual(errors, [], id)
      const text = await page.evaluate(() => document.body.textContent ?? '')
      for (const needle of ['ILLUSTRATIVE', 'Specimen Unset', 'Specimen Kicked', 'kickoff time not yet set', 'time TBC', 'KICKED OFF']) {
        assert.ok(text.includes(needle), `${id} missing ${needle}`)
      }
      await shoot(page, path.join(out, `${id}.png`), width)
      cells.push({ id, theme, width, scrollWidth: state.scrollWidth })
    } finally { await context.close() }
  }
  return cells
}

function contrastSummary(cells) {
  let worst = null
  let belowFloor = 0
  let measured = 0
  for (const cell of cells) for (const row of cell.minimums) {
    measured += 1
    if (row.ratio < row.floor) belowFloor += 1
    if (!worst || row.ratio < worst.ratio) worst = { ...row, cell: cell.id }
  }
  return { measured, belowFloor, worst }
}

export async function runClearing({ out = '/tmp/kickoff-clearing' } = {}) {
  const dir = path.resolve(out)
  mkdirSync(dir, { recursive: true })
  const origins = originsFromEnv()
  const { window, fixtures } = readSnapshot(root)
  const weeks = chooseWeeks(fixtures, window)
  const anchor = matrixAnchor(window, weeks)
  const browser = await launchBrowser()
  let cells = []
  let legacy = []
  let measurements = []
  try {
    ;({ cells, legacy, measurements } = await runMatrix(browser, { origins, out: dir, anchor, contrast: false }))
  } finally {
    writeFileSync(path.join(dir, 'receipt.json'), JSON.stringify({ origins, cells, legacy, measurements }, null, 2))
    await browser.close()
  }
  assert.equal(cells.length, 96)
  console.log(JSON.stringify({ cells: cells.length, legacy, measurements }, null, 2))
  return { cells, legacy, measurements }
}

function belowFloor(cells) {
  return cells.flatMap((cell) => cell.minimums.filter((row) => row.ratio < row.floor).map((row) => ({ id: cell.id, ...row })))
}

async function main() {
  const args = process.argv.slice(2)
  const enforce = args.includes('--enforce')
  const out = path.resolve(args.find((arg) => !arg.startsWith('--')) ?? '/tmp/kickoff-evidence')
  mkdirSync(out, { recursive: true })
  const origins = originsFromEnv()
  const { window, fixtures } = readSnapshot(root)
  const weeks = chooseWeeks(fixtures, window)
  const anchor = matrixAnchor(window, weeks)
  console.log(JSON.stringify({ anchor, weeks, enforce }))
  const browser = await launchBrowser()
  let receipt = { origins, anchor, window, weeks, enforce }
  try {
    const matrix = await runMatrix(browser, { origins, out, anchor, contrast: true })
    assert.equal(matrix.cells.length, 96)
    const weekRun = await captureWeeks(browser, { origins, out, weeks, contrast: true })
    const requests = await captureRequests(browser, origins, anchor)
    const offline = await captureOffline(browser, out)
    const harness = await captureHarness(browser, out)
    const contrastCells = [...matrix.contrast, ...weekRun.contrast]
    receipt = {
      ...receipt,
      matrix: { cells: matrix.cells.length, legacy: matrix.legacy, measurements: matrix.measurements },
      weeksCaptured: weekRun.cells.length,
      contrast: { mode: enforce ? 'enforce' : 'report', summary: contrastSummary(contrastCells), cells: contrastCells },
      requests,
      offline,
      harness,
    }
    writeFileSync(path.join(out, 'receipt.json'), JSON.stringify(receipt, null, 2))
    const failing = belowFloor(contrastCells)
    console.log(JSON.stringify({
      cells: matrix.cells.length,
      weeks,
      weeksCaptured: weekRun.cells.length,
      contrast: receipt.contrast.summary,
      requests: requests.map((row) => ({ id: row.id, bytes: row.bytes, hosts: row.hosts.map((host) => host.host) })),
      offline: offline.sizes,
      harness: harness.map((cell) => cell.id),
      belowFloor: failing.length,
    }, null, 2))
    if (enforce && failing.length) {
      console.error(`${failing.length} contrast pairs below the floor`)
      process.exitCode = 1
    }
  } catch (error) {
    receipt = { ...receipt, error: String(error?.stack ?? error) }
    writeFileSync(path.join(out, 'receipt.json'), JSON.stringify(receipt, null, 2))
    throw error
  } finally {
    await browser.close()
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  main().catch((error) => {
    console.error(error?.stack ?? error)
    process.exitCode = 1
  })
}
