// The evidence runner later overhaul PRs extend. Same Chrome, same two origins, and the
// same open discipline as the clearing. PNGs and receipt.json stay outside the repo.
//
// Hit areas and the motion control's first frame are measured here. The flash gate,
// the title-swap watch and the phone bench stay for the PRs that need them.
//
//   node web/scripts/evidence.mjs [outDir] [--enforce]
//
// Three servers, each from the checkout under test:
// KICKOFF_VITE_ORIGIN     built Vite preview  (default http://127.0.0.1:5173)
// KICKOFF_NEXT_ORIGIN     Next production     (default http://127.0.0.1:5174)
// KICKOFF_HARNESS_ORIGIN  Vite dev server     (default http://127.0.0.1:5175)
// CHROME_PATH             Chrome executable
// The harness is a dev-server page. A preview server answers its path with index.html,
// so the harness cannot share the preview's port.
//
// Contrast records today's ratios and fails nothing. --enforce fails below 4.5, or 3
// for large text, and on text whose colour could not be read, after the receipt is written.
// A cold load may ask for its own host. A font host is foreign, online and on the
// offline file. Any other http(s) request the page emits fails the run. A WebSocket
// the page opens is not one of those requests.
import assert from 'node:assert/strict'
import { mkdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'
import { decodePng } from '../../scripts/decode-png.mjs'
import { chooseWeeks, matrixAnchor, readSnapshot } from '../../scripts/evidence-weeks.mjs'
import { BITMAP_GLYPH, createColdLoad, isLargeText, paintedColor, sampleContrast, unexpectedHost, unreadColors } from '../../scripts/rendered-contrast.mjs'

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

// puppeteer names console.warn 'warn'; 'warning' is the protocol's word for the same level.
const CONSOLE_FAILS = new Set(['error', 'warn', 'warning', 'assert'])

export async function openPage(browser, url, theme, width, { waitUntil = 'networkidle0', offline = false } = {}) {
  const context = await browser.createBrowserContext()
  const page = await context.newPage()
  const errors = []
  // A request to any host but this page's own is recorded in `escaped` and fails the
  // open. There is no second list: nothing was writing one.
  const escaped = []
  page.on('pageerror', (error) => errors.push(String(error)))
  page.on('console', (message) => {
    if (!CONSOLE_FAILS.has(message.type())) return
    errors.push(message.text())
  })
  // The page target's own http(s) requests. A WebSocket, or a worker or service-worker
  // fetch, may not arrive here. A failed socket can still fail the console gate.
  page.on('request', (request) => {
    const target = unexpectedHost(request.url(), url, { offline })
    if (target) escaped.push(`${request.method()} ${target}`)
  })
  await page.setViewport({ width, height: 844, deviceScaleFactor: 1 })
  await page.evaluateOnNewDocument((chosen) => {
    localStorage.setItem('kickoff-theme', chosen)
    // A contrary retired preference must neither affect first paint nor be deleted.
    localStorage.setItem('kickoff-theme-broadcast', chosen === 'light' ? 'dark' : 'light')
  }, theme)
  if (offline) await page.setOfflineMode(true)
  const response = await page.goto(url, { waitUntil, timeout: 30_000 })
  // The offline file carries its faces. The bound stays so a face that never
  // arrives cannot hold the capture. Online, a capture waits for the fonts.
  if (offline) {
    await Promise.race([
      page.evaluate(() => document.fonts.ready),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ])
  } else await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction((chosen) => document.documentElement.dataset.theme === chosen, { timeout: 15_000 }, theme)
  if (escaped.length) {
    await context.close()
    const scope = offline ? 'the offline file asked for a host' : "asked for a host other than this page's own"
    throw new Error(`${scope}: ${escaped.join(' | ')}`)
  }
  return { context, page, errors, escaped, status: response?.status() ?? 0 }
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
  return page.screenshot({ path: file, fullPage: true })
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

// What a reader can see. checkVisibility covers display:none, visibility:hidden, zero
// opacity and content the browser skips: a closed <details> keeps its children's boxes,
// so their computed display is no evidence. Each box is cut to every clipping ancestor
// on both axes. Not sampled: pseudo-element text, form values, SVG text, images of text.
// A text node of colour-bitmap glyphs alone (a flag, an emoji star) is counted and set
// aside. isBitmapGlyph is that rule; the page uses the same expression.
async function collectText(page) {
  return page.evaluate((pattern, flags) => {
    const pictographsOnly = new RegExp(pattern, flags)
    window.scrollTo(0, 0)
    const samples = []
    // Computed colours are rgb() or rgba() unless the author used a wider space. One
    // canvas pixel gives those back in sRGB, so the sampler reads every ink.
    const canvas = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
    const srgb = (value) => {
      if (/^rgba?\(/.test(value) || !canvas) return value
      canvas.clearRect(0, 0, 1, 1)
      canvas.fillStyle = value
      canvas.fillRect(0, 0, 1, 1)
      const [r, g, b, a] = canvas.getImageData(0, 0, 1, 1).data
      return `rgba(${r}, ${g}, ${b}, ${Number((a / 255).toFixed(3))})`
    }
    let pictographs = 0
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let node = walker.nextNode()
    while (node) {
      const raw = node.textContent ?? ''
      const text = raw.replace(/\s+/g, ' ').trim()
      const parent = node.parentElement
      const seen = text && parent && parent.tagName !== 'SCRIPT' && parent.tagName !== 'STYLE'
        && parent.checkVisibility({ opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true })
      if (seen && pictographsOnly.test(text)) pictographs += 1
      else if (seen) {
        const range = document.createRange()
        range.selectNodeContents(node)
        const style = getComputedStyle(parent)
        const weight = Number.parseInt(style.fontWeight, 10) || 400
        let opacity = 1
        const clips = []
        for (let el = parent; el && el !== document.documentElement; el = el.parentElement) {
          const own = getComputedStyle(el)
          opacity *= Number(own.opacity)
          if (el !== document.body && (own.overflowX !== 'visible' || own.overflowY !== 'visible')) {
            clips.push({ box: el.getBoundingClientRect(), x: own.overflowX !== 'visible', y: own.overflowY !== 'visible' })
          }
        }
        const rects = [...range.getClientRects()].map((rect) => {
          let { left, top, right, bottom } = rect
          for (const clip of clips) {
            if (clip.x) { left = Math.max(left, clip.box.left); right = Math.min(right, clip.box.right) }
            if (clip.y) { top = Math.max(top, clip.box.top); bottom = Math.min(bottom, clip.box.bottom) }
          }
          return { x: left, y: top + window.scrollY, w: right - left, h: bottom - top }
        }).filter((rect) => rect.w >= 1 && rect.h >= 1)
        if (rects.length) samples.push({
          text: text.slice(0, 40),
          color: srgb(style.color),
          fill: srgb(style.getPropertyValue('-webkit-text-fill-color')),
          opacity,
          fontSize: Number.parseFloat(style.fontSize),
          fontWeight: weight,
          rects,
        })
      }
      node = walker.nextNode()
    }
    return {
      samples,
      pictographs,
      scrollHeight: document.documentElement.scrollHeight,
      innerWidth: window.innerWidth,
    }
  }, BITMAP_GLYPH.source, BITMAP_GLYPH.flags)
}

// `shown` is the capture just taken of this page with its text drawn. Transitions and
// animations stop with the text, so the second capture never catches an ink mid-fade.
async function measureContrast(page, id, width, shown) {
  const collected = await collectText(page)
  await page.evaluate(() => {
    const style = document.createElement('style')
    style.setAttribute('data-contrast-hide', '')
    style.textContent = '*{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;transition:none!important;animation:none!important}'
    document.documentElement.appendChild(style)
  })
  await page.setViewport({ width, height: 844, deviceScaleFactor: 1 })
  const buffer = await page.screenshot({ fullPage: true })
  const image = decodePng(buffer)
  const samples = collected.samples.map((sample) => ({
    ...sample,
    color: paintedColor(sample.color, sample.fill),
    large: isLargeText(sample.fontSize, sample.fontWeight),
  }))
  const scaleX = collected.innerWidth ? image.width / collected.innerWidth : 1
  const scaleY = collected.scrollHeight ? image.height / collected.scrollHeight : 1
  return {
    id,
    image: { width: image.width, height: image.height },
    minimums: sampleContrast(samples, image, scaleX, scaleY, shown ? decodePng(shown) : null),
    unread: unreadColors(samples),
    pictographs: collected.pictographs,
  }
}

function cellReceipt(id, state, errors) {
  const { text, ...rest } = state
  return { id, ...rest, errors }
}

/** `result` is filled as cells pass, so the caller's receipt keeps them if a later cell throws. */
export function emptyMatrix() {
  return { cells: [], legacy: [], measurements: [], contrast: [] }
}

/** Band controls only. A box under 44, or two boxes that overlap, is a fault.
 *  Touching edges are not an overlap. The week stepper is outside the band. */
export function hitAreaFaults(boxes) {
  const faults = []
  for (const box of boxes) {
    if (box.w < 43.5 || box.h < 43.5) faults.push(`${box.name} ${box.w.toFixed(1)}×${box.h.toFixed(1)}`)
  }
  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) {
      const a = boxes[i]
      const b = boxes[j]
      const overlap = a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5
      if (overlap) faults.push(`${a.name} overlaps ${b.name}`)
    }
  }
  return faults
}

async function bandGeometry(page) {
  return page.evaluate(() => {
    const header = document.querySelector('header[data-moments-background="header"]')
    if (!header) return null
    const controls = [...header.querySelectorAll('button')].map((el) => {
      const box = el.getBoundingClientRect()
      const name = (el.getAttribute('aria-label') || el.innerText || '').replace(/\s+/g, ' ').trim()
      return { name, left: box.left, top: box.top, right: box.right, bottom: box.bottom, w: box.width, h: box.height }
    })
    const rows = [...header.querySelectorAll('[data-imprint-row]')].map((el) => ({
      name: el.getAttribute('data-imprint-row'),
      h: el.getBoundingClientRect().height,
    }))
    return { controls, rows, height: header.getBoundingClientRect().height }
  })
}

export async function runMatrix(browser, { origins, out, anchor, contrast = false }, result = emptyMatrix()) {
  const { cells, legacy, measurements, contrast: contrastCells } = result
  for (const [app, origin] of Object.entries(origins)) {
    for (const lens of ['poster', 'ledger']) for (const theme of ['light', 'dark']) {
      for (const tab of ['fixtures', 'table', 'moments']) for (const width of [360, 375, 390, 1000]) {
        const id = `${app}-${lens}-${theme}-${tab}-${width}`
        const { context, page, errors } = await openPage(browser, `${origin}/?lens=${lens}&tab=${tab}&date=${anchor}`, theme, width)
        try {
          const state = await inspect(page)
          assertCell(state, errors, { id, lens, theme, tab })
          const band = await bandGeometry(page)
          if (band) {
            const faults = hitAreaFaults(band.controls)
            assert.deepEqual(faults, [], `${id} ${faults.join('; ')}`)
            if (width === 390 && theme === 'light' && tab === 'fixtures') {
              measurements.push({
                app, lens,
                bandHeight: band.height,
                rows: band.rows,
                controls: band.controls.map((box) => ({ name: box.name, w: Math.round(box.w * 10) / 10, h: Math.round(box.h * 10) / 10 })),
              })
            }
          }
          if (tab === 'table') assert.ok(await page.$('[data-table-picker]'), id)
          if (width === 390 && tab === 'fixtures' && theme === 'light') {
            const row = await page.$('button[aria-expanded]')
            assert.ok(row, id)
            measurements.push({ app, lens, top: await row.evaluate((el) => el.parentElement.getBoundingClientRect().top) })
          }
          const shown = await shoot(page, path.join(out, `${id}.png`), width)
          if (contrast) contrastCells.push(await measureContrast(page, id, width, shown))
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
  return result
}

const WEEK_WIDTHS = [360, 390, 1000]

export async function captureWeeks(browser, { origins, out, weeks, contrast }, result = { cells: [], contrast: [] }) {
  const { cells, contrast: contrastCells } = result
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
            const shown = await shoot(page, path.join(out, `${id}.png`), width)
            if (contrast) contrastCells.push(await measureContrast(page, id, width, shown))
            cells.push({ ...cellReceipt(id, state, errors), week: week.monday, kind })
          } finally { await context.close() }
        }
      }
    }
    console.log(`week ${kind} ${week.monday}: ${Object.keys(origins).length * 12} cells passed`)
  }
  return result
}

// The path after `fonts/`, so a relative stylesheet url and an absolute preload href
// name the same file.
export function fontFile(href) {
  const match = String(href).match(/fonts\/[^?#")\s]+/)
  return match ? match[0] : null
}

// Chrome fetches a preload it never applies and, headless, logs nothing.
// "Used" is a document.fonts entry whose status is "loaded" once the page has
// settled. The browser does not load a face for text it does not render — the
// hidden attribute, display:none, a closed details — so those do not count.
// The loaded face already carries the weight the browser applied (Kickoff Mono
// at 500 for a 400 request), so the gate matches that face to the @font-face
// rule and does not choose a nearest weight itself. document.fonts does not
// expose the file, which is why the stylesheet is still read.
function filesForLoadedFaces(faces, loaded) {
  const chosen = new Set()
  for (const entry of loaded ?? []) {
    if (entry.status !== 'loaded') continue
    const family = String(entry.family).replaceAll(/['"]/g, '').trim()
    const style = String(entry.style || 'normal').trim()
    const weight = String(entry.weight).trim()
    for (const face of faces) {
      const faceStyle = String(face.style || 'normal').trim()
      if (face.family !== family || faceStyle !== style || String(face.weight).trim() !== weight) continue
      const file = fontFile(face.src)
      if (file) chosen.add(file)
    }
  }
  return chosen
}

export function unusedFontPreloads({ preloads, faces, loaded }) {
  const chosen = filesForLoadedFaces(faces, loaded)
  return preloads.filter((href) => {
    const file = fontFile(href)
    return !file || !chosen.has(file)
  })
}

// One app's pages are one decision. A file Vite renders does not excuse the
// same path on Next. Within an app, a file one tab leaves unused is recorded
// on that page and does not abort the run; the cold load fails when no measured
// page of that app loaded the face. Pages with no app share one group, which
// is the shape of the unit cases.
export function preloadsUnusedOnEveryPage(pages) {
  const byApp = new Map()
  for (const page of pages) {
    const app = page.app ?? ''
    const seen = byApp.get(app) ?? new Map()
    const unused = new Set(page.unused)
    for (const href of page.preloads) {
      const file = fontFile(href) ?? href
      const row = seen.get(file) ?? { href, used: false }
      if (!unused.has(href)) row.used = true
      seen.set(file, row)
    }
    byApp.set(app, seen)
  }
  const missed = []
  for (const [app, seen] of byApp) {
    for (const row of seen.values()) {
      if (!row.used) missed.push(app ? `${app} ${row.href}` : row.href)
    }
  }
  return missed
}

// Poster and ledger, for each tab the cold load covers. 2 apps × 3 tabs ×
// 2 lenses × 2 widths = 24 loads. A face only the ledger lens renders has to
// be in this list, or the preload fails on the poster pages alone.
export function coldLoadTargets(apps) {
  const targets = []
  for (const app of apps) {
    for (const tab of ['fixtures', 'table', 'moments']) {
      for (const lens of ['poster', 'ledger']) {
        for (const width of [390, 1000]) targets.push({ app, tab, lens, width })
      }
    }
  }
  return targets
}

/** `rows` is filled as loads pass, so the caller's receipt keeps them if a later load throws. */
export async function captureRequests(browser, origins, anchor, rows = []) {
  for (const target of coldLoadTargets(Object.keys(origins))) {
    const { app, tab, lens, width } = target
    const origin = origins[app]
    const context = await browser.createBrowserContext()
    const page = await context.newPage()
    const client = await page.createCDPSession()
    await client.send('Network.enable')
    await client.send('Network.setCacheDisabled', { cacheDisabled: true })
    const log = createColdLoad()
    client.on('Network.requestWillBeSent', (event) => log.requestWillBeSent(event))
    client.on('Network.responseReceived', (event) => log.responseReceived(event))
    client.on('Network.loadingFinished', (event) => log.loadingFinished(event))
    await page.setViewport({ width, height: 844, deviceScaleFactor: 1 })
    await page.evaluateOnNewDocument(() => localStorage.setItem('kickoff-theme', 'light'))
    await page.goto(`${origin}/?lens=${lens}&tab=${tab}&date=${anchor}`, { waitUntil: 'networkidle0', timeout: 30_000 })
    const usage = await page.evaluate(async () => {
      await document.fonts.ready
      const faces = []
      for (const sheet of document.styleSheets) {
        let rules
        try { rules = [...sheet.cssRules] } catch { continue }
        for (const rule of rules) {
          if (rule.type !== CSSRule.FONT_FACE_RULE) continue
          const family = rule.style.getPropertyValue('font-family').replaceAll(/['"]/g, '').trim()
          const style = rule.style.getPropertyValue('font-style').trim() || 'normal'
          const weight = rule.style.getPropertyValue('font-weight').trim()
          const src = rule.style.getPropertyValue('src')
          const url = src.match(/url\((?:"|')?([^"')]+)/)?.[1] ?? ''
          faces.push({ family, style, weight, src: url })
        }
      }
      const loaded = []
      for (const face of document.fonts) {
        if (face.status !== 'loaded') continue
        loaded.push({
          family: face.family.replaceAll(/['"]/g, '').trim(),
          style: String(face.style || 'normal').trim(),
          weight: String(face.weight).trim(),
          status: face.status,
        })
      }
      return {
        preloads: [...document.querySelectorAll('link[rel="preload"][as="font"]')].map((link) => link.href),
        faces,
        loaded,
      }
    })
    const unused = unusedFontPreloads(usage)
    await context.close()
    const tally = log.tally(origin)
    if (tally.foreign.length) throw new Error(`cold load ${app} ${tab} ${lens} ${width} asked for ${tally.foreign.join(', ')}`)
    rows.push({
      id: `${app}-${tab}-${lens}-${width}`,
      app,
      bytes: tally.bytes,
      hosts: tally.hosts,
      preloads: usage.preloads,
      unused,
    })
  }
  const never = preloadsUnusedOnEveryPage(rows)
  if (never.length) throw new Error(`font preload no measured page uses: ${never.join(', ')}`)
  return rows
}

/** `result` is filled as cells pass, so the caller's receipt keeps them if a later cell throws. */
export async function captureOffline(browser, out, result = { sizes: {}, cells: [] }) {
  const files = {
    offline: path.join(root, 'dist-offline/index.html'),
    single: path.join(root, 'dist-single/index.html'),
  }
  for (const [name, file] of Object.entries(files)) {
    const stat = statSync(file)
    result.sizes[name] = { file: path.relative(root, file), bytes: stat.size }
  }
  const { cells } = result
  for (const tab of ['fixtures', 'table']) for (const theme of ['light', 'dark']) {
    const id = `offline-${tab}-${theme}-390`
    const search = tab === 'fixtures' ? '' : '?tab=table'
    const { context, page, errors, escaped } = await openPage(
      browser, `${pathToFileURL(files.offline).href}${search}`, theme, 390,
      { waitUntil: 'domcontentloaded', offline: true },
    )
    try {
      if (tab === 'table') await page.waitForSelector('[data-table-picker]', { timeout: 15_000 })
      else await page.waitForSelector('button[aria-label="Previous"]', { timeout: 15_000 })
      const state = await inspect(page)
      assert.equal(state.scrollWidth, state.innerWidth, id)
      assert.equal(state.theme, theme, id)
      // The file carries its faces, so it is known to try no request at all. Any request
      // means the file is not whole without the network. Checked first, so the failure
      // names the address rather than the console's complaint about it.
      assert.deepEqual(escaped, [], `${id} asked for a host`)
      assert.deepEqual(errors, [], id)
      await shoot(page, path.join(out, `${id}.png`), 390)
      cells.push({ id, theme, tab, scrollWidth: state.scrollWidth })
    } finally { await context.close() }
  }
  return result
}

/** `cells` is filled as cells pass, so the caller's receipt keeps them if a later cell throws. */
export async function captureHarness(browser, out, cells = []) {
  const origin = process.env.KICKOFF_HARNESS_ORIGIN ?? 'http://127.0.0.1:5175'
  // 1000 is here for the Table: its desktop cell is display:none below 768, so at 360
  // and 390 the page holds its words without showing them.
  for (const theme of ['light', 'dark']) for (const width of [360, 390, 1000]) {
    const id = `harness-${theme}-${width}`
    // The dev server's HMR socket never goes idle, so this load waits for the page's own flag.
    const { context, page, errors, status } = await openPage(
      browser, `${origin}/tests/harness/states.html?lens=ledger&theme=${theme}`, theme, width,
      { waitUntil: 'load' },
    )
    try {
      if (status >= 400) throw new Error(`${id} HTTP ${status}`)
      if (await page.title() !== 'States harness') {
        throw new Error(`${id}: ${origin} did not serve the states harness. It needs the Vite dev server (KICKOFF_HARNESS_ORIGIN), not the built preview.`)
      }
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
      // The same two cells, as a reader would see them: innerText leaves out what is not drawn.
      const table = await page.evaluate(
        (layout) => [...document.querySelectorAll(`[data-specimen="table"] [data-table="${layout}"]`)].map((el) => el.innerText).join('\n'),
        width >= 768 ? 'desktop' : 'mobile',
      )
      assert.match(table, width >= 768 ? /time TBC/i : /kickoff time not yet set/i, `${id} does not show the unset cell`)
      assert.match(table, /kicked off/i, `${id} does not show the kicked-off cell`)
      await shoot(page, path.join(out, `${id}.png`), width)
      cells.push({ id, theme, width, scrollWidth: state.scrollWidth })
    } finally { await context.close() }
  }
  return cells
}

// One row is one ink at one size in one cell, so an ink that fails in every cell is
// counted once per cell. `pairs` is the same failures with the cells folded together.
function contrastSummary(cells) {
  let worst = null
  let belowFloor = 0
  let measured = 0
  let unread = 0
  let pictographs = 0
  const pairs = new Map()
  for (const cell of cells) {
    unread += cell.unread.length
    pictographs += cell.pictographs
    for (const row of cell.minimums) {
      measured += 1
      if (!worst || row.ratio < worst.ratio) worst = { ...row, cell: cell.id }
      if (row.ratio >= row.floor) continue
      belowFloor += 1
      const key = `${row.ink}|${row.ground}|${row.large}`
      const pair = pairs.get(key) ?? { ink: row.ink, ground: row.ground, large: row.large, floor: row.floor, ratio: row.ratio, text: row.text, cells: 0 }
      pair.cells += 1
      if (row.ratio < pair.ratio) { pair.ratio = row.ratio; pair.text = row.text }
      pairs.set(key, pair)
    }
  }
  return { measured, belowFloor, unread, pictographs, worst, pairs: [...pairs.values()].sort((a, b) => a.ratio - b.ratio) }
}

export async function runClearing({ out = '/tmp/kickoff-clearing' } = {}) {
  const dir = path.resolve(out)
  mkdirSync(dir, { recursive: true })
  const origins = originsFromEnv()
  const { window, fixtures } = readSnapshot(root)
  const weeks = chooseWeeks(fixtures, window)
  const anchor = matrixAnchor(window, weeks)
  const browser = await launchBrowser()
  // Filled as cells pass: a failed run's receipt holds every cell before the one that threw.
  const { cells, legacy, measurements } = emptyMatrix()
  try {
    await runMatrix(browser, { origins, out: dir, anchor, contrast: false }, { cells, legacy, measurements, contrast: [] })
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

export async function proveMotion(browser, origin, out) {
  const specs = [
    { id: 'stored-on', motion: 'on', reduced: false, expect: 'on', name: 'Stop motion' },
    { id: 'stored-off', motion: 'off', reduced: false, expect: 'off', name: 'Start motion' },
    { id: 'absent-reduced', motion: null, reduced: true, expect: 'off', name: 'Start motion' },
    { id: 'absent-running', motion: null, reduced: false, expect: 'on', name: 'Stop motion' },
  ]
  const cases = []
  for (const spec of specs) {
    const context = await browser.createBrowserContext()
    const page = await context.newPage()
    try {
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 })
      if (spec.reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
      await page.evaluateOnNewDocument((motion) => {
        localStorage.setItem('kickoff-theme', 'light')
        if (motion) localStorage.setItem('kickoff-motion', motion)
        document.addEventListener('DOMContentLoaded', () => {
          window.__kickoffMotion = document.documentElement.dataset.motion ?? ''
        })
      }, spec.motion)
      await page.goto(`${origin}/`, { waitUntil: 'networkidle0', timeout: 30_000 })
      await page.evaluate(() => document.fonts.ready)
      const frame = await page.evaluate(() => ({
        atReady: window.__kickoffMotion ?? null,
        now: document.documentElement.dataset.motion ?? '',
        name: (document.querySelector('.motion-control')?.innerText ?? '').replace(/\s+/g, ' ').trim(),
      }))
      assert.equal(frame.atReady, spec.expect, `${spec.id} first frame`)
      assert.equal(frame.now, spec.expect, spec.id)
      assert.equal(frame.name, spec.name, spec.id)
      let still = null
      if (spec.expect === 'off') {
        const first = await page.screenshot()
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const second = await page.screenshot()
        still = Buffer.from(first).equals(Buffer.from(second))
        assert.equal(still, true, `${spec.id} still`)
        if (spec.id === 'stored-off') {
          writeFileSync(path.join(out, 'motion-stopped-a.png'), first)
          writeFileSync(path.join(out, 'motion-stopped-b.png'), second)
        }
      }
      cases.push({ id: spec.id, motion: frame.now, name: frame.name, atReady: frame.atReady, still })
    } finally { await context.close() }
  }
  return cases
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
  // Each step's results are filled in place, so the receipt of a run that threw still
  // holds every step and cell that passed before it.
  const matrix = emptyMatrix()
  const weekRun = { cells: [], contrast: [] }
  const steps = { motion: null, requests: null, offline: null, harness: null }
  const receipt = () => {
    const contrastCells = [...matrix.contrast, ...weekRun.contrast]
    return {
      origins, anchor, window, weeks, enforce,
      matrix: { cells: matrix.cells.length, legacy: matrix.legacy, measurements: matrix.measurements },
      weeksCaptured: weekRun.cells.length,
      contrast: { mode: enforce ? 'enforce' : 'report', summary: contrastSummary(contrastCells), cells: contrastCells },
      ...steps,
    }
  }
  try {
    steps.motion = await proveMotion(browser, origins.vite, out)
    await runMatrix(browser, { origins, out, anchor, contrast: true }, matrix)
    assert.equal(matrix.cells.length, 96)
    await captureWeeks(browser, { origins, out, weeks, contrast: true }, weekRun)
    steps.requests = []
    await captureRequests(browser, origins, anchor, steps.requests)
    steps.offline = { sizes: {}, cells: [] }
    await captureOffline(browser, out, steps.offline)
    steps.harness = []
    await captureHarness(browser, out, steps.harness)
    const done = receipt()
    writeFileSync(path.join(out, 'receipt.json'), JSON.stringify(done, null, 2))
    const failing = belowFloor(done.contrast.cells)
    console.log(JSON.stringify({
      cells: matrix.cells.length,
      weeks,
      weeksCaptured: weekRun.cells.length,
      contrast: done.contrast.summary,
      requests: steps.requests.map((row) => ({ id: row.id, bytes: row.bytes, hosts: row.hosts.map((host) => host.host) })),
      offline: steps.offline.sizes,
      harness: steps.harness.map((cell) => cell.id),
      belowFloor: failing.length,
    }, null, 2))
    // Text whose colour could not be read was not measured, so it cannot pass either.
    const unread = done.contrast.summary.unread
    if (enforce && (failing.length || unread)) {
      console.error(`${failing.length} contrast pairs below the floor, ${unread} samples in a colour the sampler could not read`)
      process.exitCode = 1
    }
  } catch (error) {
    writeFileSync(path.join(out, 'receipt.json'), JSON.stringify({ ...receipt(), error: String(error?.stack ?? error) }, null, 2))
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
