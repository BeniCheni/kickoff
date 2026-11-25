// The evidence runner later overhaul PRs extend. Same Chrome, same two origins, and the
// same open discipline as the clearing. PNGs and receipt.json stay outside the repo.
//
// The band's contract (H1 to H4), the Table's pinned rows, focus under everything that
// is pinned, the server-rendered shell's first frame, the motion control's first frame, the chrome's reduced-motion and hover
// paths and the banner's two planes are measured here. The flash gate, the title-swap watch and the phone bench stay for the
// PRs that need them.
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
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'
import { decodePng } from '../../scripts/decode-png.mjs'
import { COMPETITIONS, COMPETITION_KEYS } from '../../src/lib/competitions.ts'
import { addDays, brooklynDate, chooseWeeks, matrixAnchor, readSnapshot, startOfWeek } from '../../scripts/evidence-weeks.mjs'
import { BITMAP_GLYPH, contrastRatio, createColdLoad, isLargeText, paintedColor, sampleContrast, unexpectedHost, unreadColors } from '../../scripts/rendered-contrast.mjs'

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

export async function openPage(browser, url, theme, width, { waitUntil = 'networkidle0', offline = false, clock = null, reduced = false } = {}) {
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
  if (clock !== null) await page.evaluateOnNewDocument(at => { Date.now = () => at }, clock)
  if (reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
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
async function collectText(page, scope = null) {
  return page.evaluate((pattern, flags, within) => {
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
    const walker = document.createTreeWalker((within && document.querySelector(within)) || document.body, NodeFilter.SHOW_TEXT)
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
  }, BITMAP_GLYPH.source, BITMAP_GLYPH.flags, scope)
}

// `shown` is the capture just taken of this page with its text drawn. Transitions and
// animations stop with the text, so the second capture never catches an ink mid-fade.
// `scope` holds the sample to the text inside one element.
async function measureContrast(page, id, width, shown, scope = null) {
  const collected = await collectText(page, scope)
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

// Check what the cascaded row styles request against the faces this shell declares.
// FontFaceSet.check() alone succeeds when the browser can synthesize a missing face.
export function missingFixtureFaces() {
  const faces = [...document.fonts]
  const missing = new Set()
  for (const el of document.querySelectorAll('.fixture-row *, .next-up *')) {
    if (![...el.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim())) continue
    const style = getComputedStyle(el)
    const family = style.fontFamily.split(',')[0].trim().replace(/["']/g, '')
    const weight = Number(style.fontWeight)
    const supported = faces.some(face => {
      const [low, high = low] = face.weight.split(' ').map(Number)
      return face.family.replace(/["']/g, '') === family && face.style === style.fontStyle && low <= weight && weight <= high
    })
    // Beni's six-face file set carries Caslon regular. The unset line's italic is
    // its one known synthesis, pending the seventh-face ruling.
    const unsetItalic = location.protocol === 'file:' && el.matches('.fixture-unset')
      && family === 'Libre Caslon Text' && style.fontStyle === 'italic' && weight === 400
    if (!supported && !unsetItalic) missing.add(`${el.className}: ${family} ${style.fontStyle} ${weight}`)
  }
  return [...missing]
}

/** `result` is filled as cells pass, so the caller's receipt keeps them if a later cell throws. */
export function emptyMatrix() {
  return { cells: [], legacy: [], measurements: [], contrast: [] }
}

// The band's contract (handoff section 5, H1 to H4), measured. Chrome lays out in
// sixty-fourths of a pixel, so a box drawn at 44 reads 44 exactly; the tolerance is
// for floating point alone and is smaller than one layout unit.
const HIT = 44
const EPSILON = 0.005

/** H1 and H2. A box under 44 either way, or two boxes that overlap, is a fault.
 *  Touching edges are not an overlap. The week stepper is outside the band. */
export function hitAreaFaults(boxes) {
  const faults = []
  for (const box of boxes) {
    if (box.w < HIT - EPSILON || box.h < HIT - EPSILON) faults.push(`${box.name} ${box.w.toFixed(2)}×${box.h.toFixed(2)}`)
  }
  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) {
      if (overlaps(boxes[i], boxes[j])) faults.push(`${boxes[i].name} overlaps ${boxes[j].name}`)
    }
  }
  return faults
}

function overlaps(a, b) {
  return a.left < b.right - EPSILON && b.left < a.right - EPSILON && a.top < b.bottom - EPSILON && b.top < a.bottom - EPSILON
}

const near = (a, b) => Math.abs(a - b) <= EPSILON

/** The control row, then the tab row. `tabs` is the shell's own set: three online, two offline. */
export function expectedControls(tabs = ['Fixtures', 'Table', 'Moments']) {
  return [
    { name: /^(Stop|Start) motion$/, label: 'Stop motion | Start motion', row: 'controls', w: HIT },
    { name: /^(Dark|Light) mode$/, label: 'Dark mode | Light mode', row: 'controls', w: HIT },
    { name: /^Poster$/, label: 'Poster', row: 'controls', w: 57 },
    { name: /^Ledger$/, label: 'Ledger', row: 'controls', w: 57 },
    ...tabs.map((tab) => ({ name: new RegExp(`^${tab}$`), label: tab, row: 'tabs', w: null })),
  ]
}

// The tab as drawn (handoff section 5): 22px tall, the label over an underline at the
// label's width. A box and the range of its text can differ by one layout unit.
const TAB_DRAWN = 22
const LAYOUT_UNIT = 1 / 64
const UNDERLINE = /0px -2\.5px 0px 0px inset/

/** One tab's drawing, inside its hit area. The hit area itself draws nothing. */
export function tabFaults(control, pitch) {
  const { drawn, name } = control
  if (!drawn) return [`${name} has no drawn tab inside its hit area`]
  const faults = []
  if (!near(drawn.h, TAB_DRAWN)) faults.push(`${name} is drawn ${drawn.h.toFixed(2)} tall, expected ${TAB_DRAWN}`)
  if (!near(drawn.top - control.top, control.bottom - drawn.bottom)) {
    faults.push(`${name} is drawn at ${drawn.top.toFixed(2)} to ${drawn.bottom.toFixed(2)}, off the centre of its hit area at ${control.top.toFixed(2)} to ${control.bottom.toFixed(2)}`)
  }
  if (Math.abs(drawn.w - drawn.label) > LAYOUT_UNIT + EPSILON) faults.push(`${name} is drawn ${drawn.w.toFixed(2)} wide, and its label is ${drawn.label.toFixed(2)}`)
  if (control.current) {
    if (!UNDERLINE.test(drawn.underline)) faults.push(`${name} is the current tab, and the foot of its drawn tab reads ${drawn.underline}, expected a 2.5px underline`)
    else if (pitch && !drawn.underline.startsWith(pitch)) faults.push(`${name}'s underline is ${drawn.underline.split(' 0px')[0]}, expected the band's pitch ${pitch}`)
  } else if (drawn.underline !== 'none') faults.push(`${name} is not the current tab and is underlined`)
  if (control.shadow !== 'none') faults.push(`${name} draws on its hit area: ${control.shadow}`)
  return faults
}

/**
 * Everything the gate requires of one shell's band. A band that is missing, or that has
 * lost a control or a row, is a fault: the gate has nothing to skip.
 *   H1  every hit area at least 44 × 44, and the drawn contract (44, 44, 57, 57; tabs 44 tall,
 *       each drawn 22 tall inside it)
 *   H2  no two hit areas overlap
 *   H3  the control row and the tab row are each 44 tall, on a 44 px pitch
 *   H4  no hit area covers the wordmark, the strap or the provenance line
 * `current` is the tab the cell asked for, and the one tab that may be marked as the page
 * and underlined. A cell that names none asked for the shell's first, which is what a URL
 * without a tab shows; a caller that leaves it out for another tab fails, and is not excused.
 *
 * @param {{ tabs?: string[], current?: string }} [cell]
 */
export function bandFaults(band, { tabs, current } = {}) {
  if (!band) return ['the band is missing']
  const faults = []
  if (!band.landmark) faults.push('the band has lost its header landmark, data-moments-background="header"')
  if (!band.className.split(/\s+/).includes('imprint-band')) faults.push('the band has lost its imprint-band class')
  if (!near(band.box.left, 0) || !near(band.box.width, band.innerWidth)) {
    faults.push(`the band is ${band.box.width.toFixed(2)} wide at ${band.box.left.toFixed(2)}, and the page is ${band.innerWidth}`)
  }

  const rowNames = band.rows.map((row) => row.name)
  const [controlRow, tabRow] = band.rows
  if (rowNames.join(',') !== 'controls,tabs') faults.push(`rows are [${rowNames.join(', ')}], expected [controls, tabs]`)
  else {
    for (const row of band.rows) if (!near(row.h, HIT)) faults.push(`the ${row.name} row is ${row.h.toFixed(2)} tall, expected ${HIT}`)
    const pitch = tabRow.top - controlRow.top
    if (!near(pitch, HIT)) faults.push(`the tab row sits ${pitch.toFixed(2)} below the control row, expected a ${HIT}px pitch`)
    if (!band.provenance) faults.push('the band has no provenance line')
    else if (band.provenance.top < tabRow.bottom - EPSILON) {
      faults.push(`the provenance line starts at ${band.provenance.top.toFixed(2)}, above the tab row's foot at ${tabRow.bottom.toFixed(2)}`)
    }
  }

  const expected = expectedControls(tabs)
  const names = band.controls.map((control) => control.name)
  const ordered = names.length === expected.length && expected.every((want, i) => want.name.test(names[i]))
  if (!ordered) faults.push(`controls are [${names.join(', ')}], expected [${expected.map((want) => want.label).join(', ')}]`)
  else {
    band.controls.forEach((control, i) => {
      const want = expected[i]
      const row = band.rows.find((candidate) => candidate.name === want.row)
      if (control.row !== want.row) faults.push(`${control.name} is in the ${control.row ?? 'no'} row, expected ${want.row}`)
      else if (row && (control.top < row.top - EPSILON || control.bottom > row.bottom + EPSILON)) {
        faults.push(`${control.name} at ${control.top.toFixed(2)} to ${control.bottom.toFixed(2)} leaves the ${want.row} row`)
      }
      if (!near(control.h, HIT) || (want.w !== null && !near(control.w, want.w))) {
        faults.push(`${control.name} hit area is ${control.w.toFixed(2)}×${control.h.toFixed(2)}, expected ${want.w ?? 'at least 44'}×${HIT}`)
      }
      const before = band.controls[i - 1]
      if (before && before.row === control.row && control.left < before.left) faults.push(`${control.name} is drawn before ${before.name}`)
      if (want.row === 'tabs') faults.push(...tabFaults(control, band.pitch))
    })
    // One tab is the page, and it is the one that was asked for. tabFaults has already put
    // the underline on whichever tab is marked, so the mark carries the underline with it.
    const marked = band.controls.filter((control) => control.current).map((control) => control.name)
    const asked = current ?? expected.find((want) => want.row === 'tabs').label
    if (marked.length !== 1) faults.push(`${marked.length} tabs are marked as the current page`)
    else if (marked[0] !== asked) faults.push(`${marked[0]} is marked as the current page, and the cell asked for ${asked}`)
  }

  // The strap as ruled: a caps label tracked .12em, on one line.
  if (!band.strap) faults.push('the band has no strap')
  else {
    const { transform, tracking, size, lines } = band.strap
    if (transform !== 'uppercase') faults.push(`the strap is set ${transform === 'none' ? 'as typed' : transform}, expected caps`)
    if (!near(tracking, 0.12 * size)) faults.push(`the strap is tracked ${tracking.toFixed(2)}px at ${size}px, expected .12em (${(0.12 * size).toFixed(2)}px)`)
    if (lines !== 1) faults.push(`the strap runs to ${lines} lines`)
  }

  faults.push(...hitAreaFaults(band.controls))
  for (const control of band.controls) for (const line of band.data) {
    if (line.rects.some((rect) => overlaps(control, rect))) faults.push(`${control.name} covers the ${line.name}`)
  }
  return [...new Set(faults)]
}

async function bandGeometry(page) {
  return page.evaluate(() => {
    const header = document.querySelector('header.imprint-band') ?? document.querySelector('header')
    if (!header) return null
    const box = (rect) => ({ left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, w: rect.width, h: rect.height })
    // The name as written. innerText would apply text-transform, and textContent would
    // read the label the Next shell renders for the other state and hides.
    const shownText = (el) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      let text = ''
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (node.parentElement.checkVisibility()) text += node.textContent
      }
      return text.replace(/\s+/g, ' ').trim()
    }
    const controls = [...header.querySelectorAll('button')].map((el) => {
      const name = el.getAttribute('aria-label') || shownText(el)
      const row = el.closest('[data-imprint-row]')?.getAttribute('data-imprint-row') ?? null
      const control = { name, row, ...box(el.getBoundingClientRect()) }
      if (row !== 'tabs') return control
      // A tab's drawing is the one span inside its hit area, and its label the text in it.
      const span = el.children.length === 1 && el.firstElementChild.tagName === 'SPAN' ? el.firstElementChild : null
      const text = document.createRange()
      if (span) text.selectNodeContents(span)
      return {
        ...control,
        current: el.getAttribute('aria-current') === 'page',
        shadow: getComputedStyle(el).boxShadow,
        drawn: span ? { ...box(span.getBoundingClientRect()), label: text.getBoundingClientRect().width, underline: getComputedStyle(span).boxShadow } : null,
      }
    })
    const voice = header.appendChild(document.createElement('i'))
    voice.style.color = 'var(--band-pitch)'
    const pitch = getComputedStyle(voice).color
    voice.remove()
    const rows = [...header.querySelectorAll('[data-imprint-row]')].map((el) => {
      const rect = el.getBoundingClientRect()
      return { name: el.getAttribute('data-imprint-row'), top: rect.top, bottom: rect.bottom, h: rect.height }
    })
    // The lines of data in the band, as the boxes their text is drawn in.
    const lines = (name, el) => {
      if (!el) return []
      const range = document.createRange()
      range.selectNodeContents(el)
      return [{ name, rects: [...range.getClientRects()].filter((rect) => rect.width >= 1 && rect.height >= 1).map(box) }]
    }
    const provenance = header.querySelector('[data-provenance]')
    const rect = header.getBoundingClientRect()
    const strapEl = header.querySelector('.wordmark-strap')
    const strapStyle = strapEl && getComputedStyle(strapEl)
    const strapLines = lines('strap', strapEl)[0]?.rects ?? []
    return {
      strap: strapEl ? {
        transform: strapStyle.textTransform,
        tracking: Number.parseFloat(strapStyle.letterSpacing) || 0,
        size: Number.parseFloat(strapStyle.fontSize),
        lines: new Set(strapLines.map((line) => Math.round(line.top))).size,
        right: Math.max(...strapLines.map((line) => line.right)),
      } : null,
      landmark: header.getAttribute('data-moments-background') === 'header',
      pitch,
      className: header.className,
      box: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      innerWidth,
      height: rect.height,
      controls, rows,
      provenance: provenance ? { top: provenance.getBoundingClientRect().top, bottom: provenance.getBoundingClientRect().bottom } : null,
      data: [
        ...lines('wordmark', header.querySelector('.wordmark-name')),
        ...lines('strap', header.querySelector('.wordmark-strap')),
        ...lines('provenance line', provenance),
      ],
    }
  })
}

/** A tab as the URL names it, and as the band labels it. */
const TAB_LABEL = { fixtures: 'Fixtures', table: 'Table', moments: 'Moments' }

/** The gate, for one cell of any shell. `tab` is the tab the cell's URL asked for. */
async function assertBand(page, id, tab, tabs) {
  const band = await bandGeometry(page)
  assert.ok(TAB_LABEL[tab], `${id} the band gate was not told which tab the cell asked for`)
  const faults = bandFaults(band, { tabs, current: TAB_LABEL[tab] })
  assert.deepEqual(faults, [], `${id} ${faults.join('; ')}`)
  return band
}

// The Table's pinned rows, with the page scrolled into its deepest zone. The band is
// pinned above them; a pinned row behind it is H4 broken where a static cell cannot see it.
/** `state` is what the scrolled page showed. Each pinned row has to be the topmost
 *  element at its own centre, starting at the foot of what pins above it. */
export function pinFaults(state) {
  const faults = []
  const { band, labels, divider, focus } = state
  if (labels.topmost !== 'itself') faults.push(`the labels are under ${labels.topmost}`)
  if (!near(labels.top, band.bottom)) faults.push(`the labels pin at ${labels.top.toFixed(2)}, and the band ends at ${band.bottom.toFixed(2)}`)
  if (divider) {
    if (divider.topmost !== 'itself') faults.push(`the ${divider.name} divider is under ${divider.topmost}`)
    if (!near(divider.top, labels.bottom)) faults.push(`the ${divider.name} divider pins at ${divider.top.toFixed(2)}, and the labels end at ${labels.bottom.toFixed(2)}`)
  }
  if (focus) {
    if (!focus.focusVisible) faults.push(`the focused ${focus.text} sort shows no focus ring`)
    if (focus.topmost !== 'itself') faults.push(`the focused ${focus.text} sort is under ${focus.topmost}`)
  }
  return faults
}

/** A control that takes focus while it lies behind the band has to be brought out from
 *  under it: at or below the band's foot, and the topmost element at its own centre. A
 *  browser leaves a control it counts as visible where it is, so without the page's
 *  scroll padding the control stays where it was. */
export function revealFaults(reveal) {
  if (reveal.top >= reveal.band - EPSILON && reveal.topmost === 'itself') return []
  return [`"${reveal.text}" took focus at ${reveal.before.toFixed(2)} and rests at ${reveal.top.toFixed(2)}, under ${reveal.topmost === 'itself' ? 'the band' : reveal.topmost}; the band ends at ${reveal.band.toFixed(2)}`]
}

export async function proveTablePins(browser, origins, anchor = null) {
  const rows = []
  const leagues = [...new Set([longestLeague(committedStandings()), 'pl'])]
  for (const [app, origin] of Object.entries(origins)) for (const league of leagues) for (const width of [360, 390, 1000]) {
    const id = `pins-${app}-${league}-${width}`
    const { context, page, errors } = await openPage(browser, `${origin}/?tab=table&league=${league}`, 'light', width)
    try {
      const wide = width >= 768
      const state = await page.evaluate((layout) => {
        const table = document.querySelector(`[data-table="${layout}"]`)
        const bands = [...table.querySelectorAll('[data-zone-band]')]
        const sizes = bands.map((zone) => zone.querySelectorAll('[data-table-row]').length)
        const deepest = bands[sizes.indexOf(Math.max(...sizes))]
        const middle = deepest.querySelectorAll('[data-table-row]')[Math.floor(Math.max(...sizes) / 2)]
        window.scrollTo(0, middle.getBoundingClientRect().top + window.scrollY - innerHeight / 2)
        const topmost = (el) => {
          const rect = el.getBoundingClientRect()
          const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
          return hit === el || el.contains(hit) ? 'itself' : hit?.closest('header') ? 'the band' : 'another element'
        }
        const read = (el, name) => ({ name, top: el.getBoundingClientRect().top, bottom: el.getBoundingClientRect().bottom, topmost: topmost(el) })
        const header = document.querySelector('header.imprint-band').getBoundingClientRect()
        const divider = deepest.querySelector('[data-zone-divider]')
        return {
          band: { top: header.top, bottom: header.bottom },
          labels: read(table.querySelector(':scope > .sticky'), 'labels'),
          divider: divider && getComputedStyle(divider).position === 'sticky' ? read(divider, divider.getAttribute('data-zone-divider')) : null,
          scrollWidth: document.documentElement.scrollWidth, innerWidth,
        }
      }, wide ? 'desktop' : 'mobile')
      if (wide) {
        // The first column sort is focused where it is pinned, then Tab moves along the row.
        await page.evaluate(() => document.querySelector('[data-table="desktop"] > .sticky button').focus({ preventScroll: true }))
        await page.keyboard.press('Tab')
        state.focus = await page.evaluate(() => {
          const el = document.activeElement
          const rect = el.getBoundingClientRect()
          const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
          return { text: el.textContent, focusVisible: el.matches(':focus-visible'), top: rect.top, topmost: hit === el || el.contains(hit) ? 'itself' : hit?.closest('header') ? 'the band' : 'another element' }
        })
      }
      const faults = pinFaults(state)
      assert.deepEqual(faults, [], `${id} ${faults.join('; ')}`)
      assert.equal(state.scrollWidth, state.innerWidth, id)
      assert.deepEqual(errors, [], id)
      rows.push({ id, band: state.band.bottom, labels: state.labels.top, divider: state.divider?.top ?? null, focus: state.focus?.top ?? null })
    } finally { await context.close() }
  }
  // Focus on a control that lies behind the band, on Fixtures, where the band is the only
  // thing pinned. The Previous week button is scrolled to 20px from the top of the page, then focused.
  for (const [app, origin] of Object.entries(origins)) for (const width of [360, 1000]) {
    const id = `reveal-${app}-${width}`
    const { context, page, errors } = await openPage(browser, `${origin}/?lens=ledger${anchor ? `&date=${anchor}` : ''}`, 'light', width)
    try {
      const reveal = await page.evaluate(() => {
        const row = document.querySelector('button[aria-label="Previous"]:enabled:not([aria-disabled="true"])') ?? document.querySelector('button[aria-label="Next"]:enabled:not([aria-disabled="true"])')
        if (!row) return null
        window.scrollTo(0, row.getBoundingClientRect().top + window.scrollY - 20)
        const before = row.getBoundingClientRect().top
        row.focus()
        const rect = row.getBoundingClientRect()
        const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
        return {
          text: row.getAttribute('aria-label'), before, top: rect.top,
          band: document.querySelector('header.imprint-band').getBoundingClientRect().bottom,
          topmost: hit === row || row.contains(hit) ? 'itself' : hit?.closest('header') ? 'the band' : 'another element',
        }
      })
      assert.ok(reveal, `${id} found no enabled week stepper to focus`)
      assert.ok(reveal.before < reveal.band, `${id} the row was not behind the band before it took focus`)
      assert.ok(['Previous', 'Next'].includes(reveal.text), id)
      const faults = revealFaults(reveal)
      assert.deepEqual(faults, [], `${id} ${faults.join('; ')}`)
      assert.deepEqual(errors, [], id)
      rows.push({ id, band: reveal.band, before: reveal.before, reveal: reveal.top, row: reveal.text })
    } finally { await context.close() }
  }
  return rows
}

// Focus under everything that is pinned: the band, and on the phone Table the labels and
// a long zone's divider below it. Each control is put where a pinned row would cover it and
// reached with a real Tab press from the control before it, as a keyboard reaches it.

// The desktop table's controls, by the name each carries: the six labels in its pinned
// row that sort. W, D and L sort nothing and are text. Each name is the one the browser
// computes, not the label as it is written: Chrome folds the stylesheet's capitals into a
// name it takes from text, so the label written "Pl" is the control named "PL".
//
// A name is bound to its control twice over (the review of PR #352, finding 3). That the
// six names are in the table once each is not enough: two controls that had exchanged
// names passed it. So each name has the column of the head it stands in, 1 to 15, and the
// figure of the snapshot a press on it orders the table by. Pts is the league's own order.
export const DESKTOP_TABLE_SORTS = [
  { name: 'PL', column: 5, by: 'matches played', figure: (row) => row.played },
  { name: 'GF', column: 9, by: 'goals for', figure: (row) => row.gf },
  { name: 'GA', column: 10, by: 'goals against', figure: (row) => -row.ga },
  { name: 'GD', column: 11, by: 'goal difference', figure: (row) => row.gf - row.ga },
  { name: 'PTS', column: 12, by: 'league position', figure: null },
  { name: 'PPG', column: 13, by: 'points per game', figure: (row) => (row.played ? row.pts / row.played : -1) },
]
export const DESKTOP_TABLE_CONTROLS = DESKTOP_TABLE_SORTS.map((sort) => sort.name)

/** The six leagues the Table has a tab for, in the tabs' order. A tab carries its key. */
export const TABLE_LEAGUE_KEYS = ['laliga', 'pl', 'seriea', 'ligue1', 'bundesliga', 'ucl']

/**
 * The league with the longest table the snapshot holds: the Champions League's 36 while the
 * provider supplies it, and the first of the longest domestic tables once it does not. The
 * proofs that need rows under a pinned head open this one, so a snapshot without a
 * Champions League table (the review of PR #352, finding 2) is proved and not skipped.
 */
export function longestLeague(standings) {
  const held = TABLE_LEAGUE_KEYS.filter((league) => standings[league]?.length)
  if (!held.length) throw new Error('the snapshot holds no table for any league, so no Table proof can run')
  return held.reduce((longest, league) => (standings[league].length > standings[longest].length ? league : longest))
}

/** The committed standings, by league. */
const committedStandings = () => JSON.parse(readFileSync(path.join(root, 'src/data/standings.json'), 'utf8')).leagues

/** The club ids of `rows`, the committed standings of one league, in the order a press on
 *  `sort` owes: the figure, best first, and league position between equals. */
export function sortOrder(rows, sort) {
  const order = sort.figure ? [...rows].sort((a, b) => sort.figure(b) - sort.figure(a) || a.rank - b.rank) : rows
  return order.map((row) => row.teamId)
}

/**
 * What a press on each sort control did, against what its name owes. `presses` holds one
 * entry per name, each found by the name the browser computes and not by its place: the
 * head's column that control stands in, the columns marked as sorted after the press, and
 * the club ids of the rows in the order they were then drawn. A control that computes
 * another's name stands in the wrong column, marks the wrong one, and where the two
 * figures differ, orders the table by the other's.
 */
export function sortFaults(presses, rows, sorts = DESKTOP_TABLE_SORTS) {
  const faults = []
  const begins = (ids) => ids.slice(0, 3).join(', ')
  for (const sort of sorts) {
    const press = presses.find((each) => each.name === sort.name)
    if (!press?.found) {
      faults.push(`no control is named "${sort.name}", so its sort was never pressed`)
      continue
    }
    if (press.column !== sort.column) faults.push(`the control named "${sort.name}" stands in column ${press.column || 'none'} of the head, and that name’s column is ${sort.column}`)
    if (press.marked.length !== 1 || press.marked[0] !== sort.column) faults.push(`a press on "${sort.name}" marked ${press.marked.length ? `column ${press.marked.join(' and ')}` : 'no column'} as sorted, expected column ${sort.column}`)
    const owed = sortOrder(rows, sort)
    if (press.order.length !== owed.length || owed.some((id, i) => press.order[i] !== id)) faults.push(`a press on "${sort.name}" did not order the table by ${sort.by}: it begins ${begins(press.order)}, and the snapshot’s order begins ${begins(owed)}`)
  }
  return faults
}

/**
 * The name the browser computes for each element of `elements`, an array in the page, read
 * from the browser's accessibility tree: what a screen reader is handed. It is not the
 * element's text and not its aria-label. A name can come from either, from a label or a
 * title, or from text the stylesheet has transformed. An element the tree leaves out has
 * no name, and neither has one the tree holds without one.
 */
async function computedNames(page, elements) {
  const client = await page.createCDPSession()
  try {
    const held = [...(await elements.getProperties())].sort(([a], [b]) => Number(a) - Number(b))
    const names = []
    for (const [, handle] of held) {
      const element = handle.asElement()
      if (!element) { names.push(''); continue }
      const { nodes } = await client.send('Accessibility.getPartialAXTree', { backendNodeId: await element.backendNodeId(), fetchRelatives: false })
      names.push(!nodes[0] || nodes[0].ignored ? '' : String(nodes[0].name?.value ?? ''))
    }
    return names
  } finally { await client.detach() }
}

/** A name as a receipt and a fault print it. */
const tidyName = (name) => name.replace(/\s+/g, ' ').trim().slice(0, 48)

/**
 * What one Tab press left on the page. The control has to be the one the press was meant
 * for, show its ring, and have no sample point under anything pinned. `ring` and
 * `ringUnder` are read only for a standings row. It runs the full width of the page with
 * its zone's header directly above it, and a header long enough to pin is positioned, so
 * it paints over anything a row draws outside itself. The row's ring therefore has to be
 * drawn inside the row, and every sample on the ring's own line has to be the row's.
 */
export function focusFaults(seen) {
  const what = `"${seen.text}"`
  if (!seen.landed) return [`Tab before ${what} went to "${seen.active}"`]
  const faults = []
  if (!seen.focusVisible) faults.push(`${what} took focus and shows no focus ring`)
  const under = Object.entries(seen.under)
  if (under.length) {
    const hidden = under.reduce((sum, [, points]) => sum + points, 0)
    faults.push(`${what} took focus at ${seen.before.toFixed(2)} and rests at ${seen.top.toFixed(2)} to ${seen.bottom.toFixed(2)}, with ${hidden} of ${seen.points} points under ${under.map(([name]) => name).join(' and ')}`)
  }
  const outside = seen.ring ? seen.ring.offset + seen.ring.width : 0
  if (outside > EPSILON) faults.push(`the focus ring of ${what} is drawn ${outside.toFixed(2)}px outside its row, where a zone header paints over it`)
  const ring = Object.keys(seen.ringUnder ?? {})
  if (ring.length) faults.push(`the focus ring of ${what} is under ${ring.join(' and ')}`)
  // A control of the table draws its ring inside itself, so its ring is read from the page
  // as it was painted. A press the sweep counted for the table and did not sample is no pass.
  if (seen.paint) faults.push(...ringPaintFaults(what, seen.paint))
  else if (Number.isInteger(seen.owed) && seen.owed >= 0) faults.push(`the focus ring of ${what} was not sampled`)
  return faults
}

/**
 * How many pixels deep a capture shows a ring whose outline is `width` CSS pixels, where one
 * capture pixel is one CSS pixel. That is the runner's scale: openPage sets the device scale
 * factor to 1, and ringPaint stops the run at any other. A browser draws an outline in whole
 * pixels, as it does a border: a width under one pixel is drawn as one, and any other is
 * rounded down. Chromium 157 was measured to do so (Pass 2.5 of PR #352, fix round 2): it
 * drew 0.25px, 0.5px and 0.75px one pixel deep, 1.5px and 1.9px one, 2.5px and 2.99px two,
 * and 3.5px three, and it had already rounded the width it computes the same way, so the
 * width ringPaint reads from the page is a whole number and this returns it unchanged.
 */
export function ringDepth(width) {
  if (!(width > 0)) return 0
  return width < 1 ? 1 : Math.floor(width)
}

/**
 * Where a control's ring is in two captures of the control's own box, `focused` and
 * `rested`: the same pixels with focus on the control and after focus has left it. The
 * ring's line is `width` deep and starts where `offset` puts it, measured in from the box's
 * edge. At five points along each edge the line is read across its depth and one pixel
 * either side, and a pixel is the ring's where it is the ring's own colour with focus and
 * another colour without. `edges` is that count at each point, and `depth` the count a
 * whole ring gives: ringDepth of its width. `ground` is the colour the ring's line most
 * often has without focus, and `contrast` the ring against it.
 */
export function ringPixels({ focused, rested, ring, width, offset }) {
  const at = (image, x, y) => {
    const i = 4 * (y * image.width + x)
    return { r: image.data[i], g: image.data[i + 1], b: image.data[i + 2] }
  }
  const same = (p, q) => Math.abs(p.r - q.r) <= 2 && Math.abs(p.g - q.g) <= 2 && Math.abs(p.b - q.b) <= 2
  const w = Math.min(focused.width, rested.width)
  const h = Math.min(focused.height, rested.height)
  const inset = Math.round(-(offset + width))
  const depth = Array.from({ length: Math.ceil(width) + 2 }, (_, i) => inset - 1 + i).filter((d) => d >= 0)
  const along = [0.1, 0.3, 0.5, 0.7, 0.9]
  const lines = {
    top: along.map((f) => depth.map((d) => [Math.floor((w - 1) * f), d])),
    bottom: along.map((f) => depth.map((d) => [Math.floor((w - 1) * f), h - 1 - d])),
    left: along.map((f) => depth.map((d) => [d, Math.floor((h - 1) * f)])),
    right: along.map((f) => depth.map((d) => [w - 1 - d, Math.floor((h - 1) * f)])),
  }
  const inside = ([x, y]) => x >= 0 && y >= 0 && x < w && y < h
  /** @type {Record<string, number[]>} */
  const edges = {}
  const grounds = new Map()
  for (const [edge, points] of Object.entries(lines)) {
    edges[edge] = points.map((line) => line.filter((point) => inside(point) && same(at(focused, ...point), ring) && !same(at(rested, ...point), ring)).length)
    for (const point of points.flat().filter(inside)) {
      const pixel = at(rested, ...point)
      const key = `${pixel.r}, ${pixel.g}, ${pixel.b}`
      grounds.set(key, (grounds.get(key) ?? 0) + 1)
    }
  }
  const depthOwed = ringDepth(width)
  const [most] = [...grounds].sort((a, b) => b[1] - a[1])
  if (!most) return { edges, depth: depthOwed, ground: null, contrast: 0 }
  const [r, g, b] = most[0].split(', ').map(Number)
  return { edges, depth: depthOwed, ground: `rgb(${most[0]})`, contrast: contrastRatio(ring, { r, g, b }) }
}

/**
 * The ring as it was painted, held to what a reader has to see (the review of PR #352,
 * finding 4): a colour that paints, the whole of the control in view, the ring's own
 * pixels at every point read on each of its four edges, and 3:1 against what it is drawn
 * on. A transparent ring has the right width, the right offset and nothing over its line.
 *
 * A point is held to the ring's whole depth, `paint.depth`, and not to one pixel (Pass 2.5
 * of PR #352): a ring drawn two pixels deep with one of them painted over still had a pixel
 * of its own at every point, and passed. A point with none of the ring's pixels is not
 * painted. A point with some and fewer than the depth is clipped, and the fault gives the
 * thinnest of them. A reading that carries no depth cannot be held to one, so it is a fault
 * and not a pass.
 */
export function ringPaintFaults(what, paint) {
  if (paint.alpha === 0) return [`the focus ring of ${what} is ${paint.color}, which paints nothing`]
  const faults = []
  if (paint.alpha < 1) faults.push(`the focus ring of ${what} is ${paint.color}, which the page shows through`)
  if (paint.cut.length) faults.push(`the focus ring of ${what} is cut off at the ${paint.cut.join(' and ')} of the page`)
  const deep = Number.isInteger(paint.depth) && paint.depth >= 1
  if (!deep) faults.push(`the focus ring of ${what} has no depth to be held to: its line’s depth was read as ${String(paint.depth)}`)
  for (const [edge, counts] of Object.entries(paint.edges)) {
    const bare = counts.filter((count) => count < 1).length
    if (bare) faults.push(`the focus ring of ${what} is not painted at ${bare} of ${counts.length} points on its ${edge} edge`)
    const thin = deep ? counts.filter((count) => count >= 1 && count < paint.depth) : []
    if (thin.length) faults.push(`the focus ring of ${what} is painted ${Math.min(...thin)} of its ${paint.depth}px deep at ${thin.length} of ${counts.length} points on its ${edge} edge`)
  }
  if (paint.contrast < 3) faults.push(`the focus ring of ${what} is ${paint.color}, ${paint.contrast.toFixed(2)}:1 against the ${paint.ground ?? 'ground'} it is drawn on`)
  return faults
}

/**
 * What a placement's sweep has to have done before its presses are evidence. A sweep that
 * reached nothing has no control to fault, so it passed: on a page without the wrapper it
 * looks inside, every cell did. And a table held to a total passed with two controls in
 * one row and none in the next, so the table is held to what it is owed by identity.
 * `rows` is the club id on each row of the shown table and `controls` every control in
 * it, read from the whole document and not through that wrapper. On the phone a club's
 * row is a control: each of `clubs`, read from the committed standings and not from the
 * page, has one row of its own, and that row holds one control a keyboard can reach. On
 * the desktop the rows hold none: each of `named` is in the table once, within reach.
 * Every control a keyboard can reach in the table has to have been the target of a press.
 *
 * A name is also owed its place: each of `placed` is a name and the column of the head its
 * control stands in, so two controls that exchange names are two faults and not a pass.
 *
 * @param {{ owed: number }[]} seen  each press, by its target's place in `controls`, or -1
 * @param {{
 *   within: string,
 *   rows: string[],
 *   controls: { name: string, row: number, reachable: boolean, column?: number }[],
 *   clubs?: { id: string, name: string }[] | null,
 *   named?: string[] | null,
 *   placed?: { name: string, column: number }[] | null,
 * }} expected
 */
export function sweepFaults(seen, { within, rows, controls, clubs = null, named = null, placed = null }) {
  const faults = []
  if (!seen.length) faults.push(`no Tab was pressed: nothing a keyboard can reach is inside ${within}`)
  if (!clubs?.length && !named?.length) faults.push('the sweep was not told what the table is owed: no club and no named control')
  const first = (names) => `${names.slice(0, 3).join(', ')}${names.length > 3 ? ', …' : ''}`
  const reachable = controls.map((control, place) => ({ ...control, place })).filter((control) => control.reachable)
  if (clubs?.length) {
    // A club's rows are the ones that carry its id, and its control the one in its own row.
    const rowsOf = (club) => rows.flatMap((id, at) => (id === club.id ? [at] : []))
    const heldBy = (club) => reachable.filter((control) => control.row === rowsOf(club)[0])
    const tell = (some, one, many, show = (club) => club.name) => {
      if (some.length) faults.push(`${some.length} of the standings’ ${clubs.length} clubs ${some.length === 1 ? one : many}: ${first(some.map(show))}`)
    }
    tell(clubs.filter((club) => rowsOf(club).length === 0), 'has no row in the table', 'have no row in the table')
    tell(clubs.filter((club) => rowsOf(club).length > 1), 'has more than one row in the table', 'have more than one row in the table', (club) => `${club.name} (${rowsOf(club).length})`)
    const own = clubs.filter((club) => rowsOf(club).length === 1)
    tell(own.filter((club) => heldBy(club).length === 0), 'has a row that holds no control a keyboard can reach', 'have a row that holds no control a keyboard can reach')
    tell(own.filter((club) => heldBy(club).length > 1), 'has a row that holds more than one control a keyboard can reach', 'have a row that holds more than one control a keyboard can reach', (club) => `${club.name} (${heldBy(club).length})`)
    const known = new Set(clubs.map((club) => club.id))
    const strangers = rows.filter((id) => !known.has(id))
    if (strangers.length) faults.push(`${strangers.length} of the table’s ${rows.length} rows ${strangers.length === 1 ? 'is' : 'are'} for a club the standings do not hold: ${first(strangers.map((id) => `"${id}"`))}`)
  }
  if (named?.length) {
    const called = (name) => controls.filter((control) => control.name === name)
    const tell = (some, one, many, show = (name) => `"${name}"`) => {
      if (some.length) faults.push(`${some.length} of the ${named.length} controls owed by name ${some.length === 1 ? one : many}: ${first(some.map(show))}`)
    }
    tell(named.filter((name) => called(name).length === 0), 'is not in the table', 'are not in the table')
    tell(named.filter((name) => called(name).length > 1), 'is in the table more than once', 'are in the table more than once', (name) => `"${name}" (${called(name).length})`)
    tell(named.filter((name) => called(name).length === 1 && !called(name)[0].reachable), 'cannot be reached by a keyboard', 'cannot be reached by a keyboard')
    const astray = (placed ?? []).filter(({ name, column }) => called(name).length === 1 && called(name)[0].column !== column)
    tell(astray, 'is not in the column of that name', 'are not in the column of that name', ({ name, column }) => `"${name}" (in column ${called(name)[0].column || 'none'}, and its column is ${column})`)
  }
  // A control a keyboard stops on and a screen reader cannot name is not held either.
  const nameless = reachable.filter((control) => !control.name)
  if (nameless.length) faults.push(`${nameless.length} of the table’s ${reachable.length} controls ${nameless.length === 1 ? 'has' : 'have'} no name the browser computes`)
  // Owed by a club, by a name or by neither: every control a keyboard can reach in the table.
  const pressed = new Set(seen.map((control) => control.owed))
  const missed = reachable.filter((control) => !pressed.has(control.place)).map((control) => `"${control.name}"`)
  if (missed.length) faults.push(`${missed.length} of the table’s ${reachable.length} controls ${missed.length === 1 ? 'was' : 'were'} never the target of a press: ${first(missed)}`)
  return faults
}

/** Every control a Tab press can reach inside `within`, each placed by `place` first:
 *  { y } is its top in the viewport, { underFoot } that many pixels under the band's foot.
 *  `table` is the shown table as sweepFaults reads it: the club id on each of its rows,
 *  and each of its controls with the row it sits in and whether a keyboard can reach it.
 *  Every name here, in a receipt and in a fault, is the one the browser computes. */
async function sweepFocus(page, place, { within = '.page-measure', layout }) {
  const found = await page.evaluate((scope, shown) => {
    const reachable = (el) => el.tabIndex >= 0 && !el.disabled && !el.closest('[inert]')
      && el.checkVisibility({ visibilityProperty: true }) && el.getClientRects().length > 0
    const every = [...document.querySelectorAll('a[href], button, input, select, textarea, summary, iframe, [tabindex], [contenteditable]')]
    const list = every.filter(reachable)
    // Not through `scope`: the table is owed its presses whether or not the wrapper is there.
    const table = every.filter((el) => el.closest(`[data-table="${shown}"]`))
    const rows = [...document.querySelectorAll(`[data-table="${shown}"] [data-table-row]`)]
    // The head's column a control stands in, 1 to 15, or 0 for a control outside the head.
    const head = document.querySelector(`[data-table="${shown}"] > .sticky`)
    const column = (el) => (head ? [...head.children].findIndex((cell) => cell === el || cell.contains(el)) + 1 : 0)
    window.__kickoffFocus = { every, list, table, names: [], targets: list.map((_, i) => i).filter((i) => i > 0 && list[i].closest(scope)) }
    return {
      targets: window.__kickoffFocus.targets.length,
      rows: rows.map((row) => row.getAttribute('data-table-row')),
      // A control's row is the nearest one around it, by its place among `rows`, or -1.
      controls: table.map((el) => ({ at: every.indexOf(el), row: rows.indexOf(el.closest('[data-table-row]')), column: column(el), reachable: reachable(el) })),
    }
  }, within, layout)
  const every = await page.evaluateHandle(() => window.__kickoffFocus.every)
  const names = (await computedNames(page, every)).map(tidyName)
  await every.dispose()
  await page.evaluate((computed) => { window.__kickoffFocus.names = computed }, names)
  const controls = found.controls.map(({ at, ...control }) => ({ name: names[at], ...control }))
  const seen = []
  for (let n = 0; n < found.targets; n += 1) {
    const placed = await page.evaluate((index, where) => {
      const { list, targets: chosen } = window.__kickoffFocus
      const target = list[chosen[index]]
      list[chosen[index] - 1].focus({ preventScroll: true })
      const foot = document.querySelector('header.imprint-band').getBoundingClientRect().height
      const y = where.underFoot === undefined ? where.y : foot + where.underFoot
      window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - y)
      return { before: target.getBoundingClientRect().top }
    }, n, place)
    await page.keyboard.press('Tab')
    seen.push({ ...placed, ...(await page.evaluate((index) => {
      const { every, list, table, names: computed, targets: chosen } = window.__kickoffFocus
      const target = list[chosen[index]]
      const active = document.activeElement
      // The browser's name for a control the sweep knows; what holds focus otherwise is no control.
      const name = (el) => (every.includes(el) ? computed[every.indexOf(el)] : `<${el?.tagName?.toLowerCase() ?? 'nothing'}>`)
      const rect = target.getBoundingClientRect()
      // What covers a point, if it is pinned: anything else is the control's own ground.
      // A sticky element still in its own place in the flow is not pinned yet. A zone's
      // divider sits directly above its first row there, on the first edition as well.
      const pinned = (x, y) => {
        const hit = document.elementFromPoint(x, y)
        if (!hit || hit === target || target.contains(hit)) return null
        for (let el = hit; el && el !== document.body; el = el.parentElement) {
          const style = getComputedStyle(el)
          if (style.position !== 'sticky' && style.position !== 'fixed') continue
          if (style.position === 'sticky' && el.getBoundingClientRect().top > Number.parseFloat(style.top) + 0.01) continue
          if (el.matches('header.imprint-band')) return 'the band'
          if (el.hasAttribute('data-zone-divider')) return `the ${el.getAttribute('data-zone-divider')} divider`
          return el.parentElement?.hasAttribute('data-table') ? 'the labels' : 'a pinned element'
        }
        return null
      }
      const tally = (points, what = pinned) => points.reduce((under, [x, y]) => {
        const by = what(x, y)
        if (by) under[by] = (under[by] ?? 0) + 1
        return under
      }, {})
      const across = [0.1, 0.3, 0.5, 0.7, 0.9].map((fx) => rect.left + rect.width * fx)
      const body = across.flatMap((x) => [0.1, 0.5, 0.9].map((fy) => [x, rect.top + rect.height * fy]))
      const row = !!target.parentElement?.hasAttribute('data-table-row')
      // The ring as the browser draws it. `reach` is the middle of its line, measured
      // outward from the row's edge: negative is inside the row.
      const style = getComputedStyle(target)
      const ring = { offset: Number.parseFloat(style.outlineOffset), width: Number.parseFloat(style.outlineWidth) }
      const reach = ring.offset + ring.width / 2
      // On the ring's own line, anything that is not the row covers it, pinned or not. A
      // header still in its place in the flow is positioned too, and paints over a ring.
      const covering = (x, y) => {
        const hit = document.elementFromPoint(x, y)
        if (!hit || hit === target || target.contains(hit)) return null
        if (hit.closest('header.imprint-band')) return 'the band'
        const divider = hit.closest('[data-zone-divider]')
        if (divider) return `the ${divider.getAttribute('data-zone-divider')} divider`
        return hit.closest('[data-table] > .sticky') ? 'the labels' : 'another element'
      }
      return {
        text: name(target), active: name(active), landed: active === target, row,
        // The control's place among the table's controls, or -1: a press is counted by its target.
        owed: table.indexOf(target),
        focusVisible: target.matches(':focus-visible'), top: rect.top, bottom: rect.bottom,
        points: body.length, under: tally(body),
        ...(row ? { ring, ringUnder: tally(across.flatMap((x) => [[x, rect.top - reach], [x, rect.bottom + reach]]), covering) } : {}),
      }
    }, n)) })
    // A control of the table: its ring is read from the page as painted. Focus leaves it.
    const pressed = seen.at(-1)
    if (pressed.landed && pressed.owed >= 0) pressed.paint = await ringPaint(page)
  }
  return { seen, table: { rows: found.rows, controls } }
}

/**
 * The ring of the control that holds focus, as it was painted (the review of PR #352,
 * finding 4). The sweep read the ring's width and offset from the stylesheet and asked
 * which element lay over its line. Neither is a pixel, and a transparent ring passed both.
 * So the control's box is captured with focus and again once focus has left it, and
 * ringPixels reads the ring's line from the two. Focus is not put back: the sweep places
 * it before every press.
 *
 * The line's depth is taken from the outline width the browser computes, and that is a
 * count of capture pixels only where one capture pixel is one CSS pixel. The page says
 * whether it is, and the run stops if it is not.
 */
async function ringPaint(page) {
  const box = await page.evaluate(() => {
    const rect = document.activeElement.getBoundingClientRect()
    const style = getComputedStyle(document.activeElement)
    return {
      left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, scrollX, scrollY, innerWidth, innerHeight,
      color: style.outlineColor, width: Number.parseFloat(style.outlineWidth), offset: Number.parseFloat(style.outlineOffset),
      scale: devicePixelRatio,
    }
  })
  assert.equal(box.scale, 1, `a ring is read at one capture pixel to a CSS pixel, and this page draws ${box.scale}`)
  const [r, g, b, alpha = 1] = box.color.match(/[\d.]+/g).map(Number)
  const cut = [box.left < -EPSILON && 'left', box.top < -EPSILON && 'top', box.right > box.innerWidth + EPSILON && 'right', box.bottom > box.innerHeight + EPSILON && 'bottom'].filter(Boolean)
  // The box as the browser snaps it to whole pixels, in the page's coordinates.
  const left = Math.max(0, Math.round(box.left))
  const top = Math.max(0, Math.round(box.top))
  const clip = {
    x: left + box.scrollX, y: top + box.scrollY,
    width: Math.min(box.innerWidth, Math.round(box.right)) - left, height: Math.min(box.innerHeight, Math.round(box.bottom)) - top,
  }
  const bare = { top: [0, 0, 0, 0, 0], bottom: [0, 0, 0, 0, 0], left: [0, 0, 0, 0, 0], right: [0, 0, 0, 0, 0] }
  if (clip.width < 1 || clip.height < 1) return { color: box.color, alpha, cut: ['top', 'bottom', 'left', 'right'], edges: bare, depth: ringDepth(box.width), ground: null, contrast: 0 }
  const focused = decodePng(await page.screenshot({ clip, captureBeyondViewport: false }))
  await page.evaluate(() => document.activeElement.blur())
  const rested = decodePng(await page.screenshot({ clip, captureBeyondViewport: false }))
  return { color: box.color, alpha, cut, ...ringPixels({ focused, rested, ring: { r, g, b }, width: box.width, offset: box.offset }) }
}

/**
 * Each sort control of the desktop table, found by the name the browser computes for it,
 * pressed, and what the press did: the head's column the control stands in, the columns
 * marked as sorted, and the rows' club ids in the order then drawn. The names are read
 * again before each press, and a last press on Pts returns the table to league order.
 */
async function pressSorts(page) {
  const head = '[data-table="desktop"] > .sticky'
  const names = async () => {
    const buttons = await page.evaluateHandle((selector) => [...document.querySelectorAll(`${selector} button`)], head)
    try { return (await computedNames(page, buttons)).map(tidyName) } finally { await buttons.dispose() }
  }
  const press = async (sort) => {
    const at = (await names()).indexOf(sort.name)
    if (at < 0) return { name: sort.name, found: false }
    await page.evaluate((selector, index) => document.querySelectorAll(`${selector} button`)[index].click(), head, at)
    return { name: sort.name, found: true, ...(await page.evaluate((selector, index) => {
      const cells = [...document.querySelector(selector).children]
      const column = (el) => cells.findIndex((cell) => cell === el || cell.contains(el)) + 1
      const buttons = [...document.querySelectorAll(`${selector} button`)]
      return {
        column: column(buttons[index]),
        marked: buttons.filter((button) => button.hasAttribute('data-sorted')).map(column),
        order: [...document.querySelectorAll('[data-table="desktop"] [data-table-row]')].map((row) => row.getAttribute('data-table-row')),
      }
    }, head, at)) }
  }
  const presses = []
  for (const sort of DESKTOP_TABLE_SORTS) presses.push(await press(sort))
  await press(DESKTOP_TABLE_SORTS.find((sort) => !sort.figure))
  return presses
}

/** What a cell's sampled rings came to: how many, the fewest ring pixels read at a point on each edge, each depth a ring was held to, the lowest contrast, and each ring colour with the ground it was read on. */
function ringSummary(seen, into = { sampled: 0, least: { top: Infinity, bottom: Infinity, left: Infinity, right: Infinity }, depth: [], contrast: Infinity, drawn: [] }) {
  for (const { paint } of seen.filter((control) => control.paint)) {
    into.sampled += 1
    for (const edge of Object.keys(into.least)) into.least[edge] = Math.min(into.least[edge], ...paint.edges[edge])
    if (!into.depth.includes(paint.depth)) into.depth.push(paint.depth)
    into.contrast = Math.min(into.contrast, paint.contrast)
    const drawn = `${paint.color} on ${paint.ground}`
    if (!into.drawn.includes(drawn)) into.drawn.push(drawn)
  }
  return into
}

/**
 * The ring in the dark theme (the review of PR #352, finding 4). proveFocus presses every
 * control in the light theme, where the ring is one green on one ground. The dark theme
 * draws another green on another ground, and a ring that reads in one need not read in the
 * other. So each served app's longest table is swept once more in the dark theme, on a
 * phone and at 1000, and every table control's ring is held to the same reading.
 */
export async function proveRings(browser, origins) {
  const standings = committedStandings()
  const league = longestLeague(standings)
  const within = '.page-measure'
  const rows = []
  for (const [app, origin] of Object.entries(origins)) for (const width of [390, 1000]) {
    const id = `rings-${app}-${league}-${width}-dark`
    const layout = width >= 768 ? 'desktop' : 'mobile'
    const { context, page, errors } = await openPage(browser, `${origin}/?tab=table&league=${league}`, 'dark', width)
    try {
      await page.waitForSelector(`[data-table="${layout}"] [data-table-row]`, { timeout: 15_000 })
      assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark', id)
      const { seen, table } = await sweepFocus(page, { underFoot: 1.06 }, { within, layout })
      const owed = layout === 'mobile'
        ? { clubs: standings[league].map((club) => ({ id: club.teamId, name: club.name })) }
        : { named: DESKTOP_TABLE_CONTROLS, placed: DESKTOP_TABLE_SORTS }
      const faults = [...sweepFaults(seen, { within, ...table, ...owed }), ...seen.flatMap(focusFaults)]
      assert.deepEqual(faults, [], `${id} ${faults.join('; ')}`)
      const rings = ringSummary(seen)
      const controls = table.controls.filter((control) => control.reachable).length
      assert.ok(controls > 0 && rings.sampled === controls, `${id} sampled ${rings.sampled} rings of ${controls} table controls`)
      assert.deepEqual(errors, [], id)
      rows.push({ id, theme: 'dark', tableControls: controls, rings })
    } finally { await context.close() }
  }
  return rows
}

/** The Table in both apps, and both files from disk, at every width of the matrix. Each
 *  control is placed twice: one pixel under the band's foot, where the labels and a
 *  divider cover a row, and 20px from the top of the page, behind the band itself. Each
 *  placement is held to sweepFaults first, so a cell that pressed nothing cannot pass. */
export async function proveFocus(browser, origins, out) {
  const standings = committedStandings()
  const long = longestLeague(standings)
  const files = { offline: path.join(root, 'dist-offline/index.html'), single: path.join(root, 'dist-single/index.html') }
  const shells = [
    ...Object.entries(origins).map(([app, origin]) => ({ app, url: (league) => `${origin}/?tab=table&league=${league}`, leagues: [...new Set(['ucl', long, 'pl'])], open: {} })),
    ...Object.entries(files).map(([app, file]) => ({ app, url: (league) => `${pathToFileURL(file).href}?tab=table&league=${league}`, leagues: [...new Set(['ucl', long])], open: { waitUntil: 'domcontentloaded', offline: true } })),
  ]
  const places = [{ name: 'under the band’s foot', underFoot: 1.06 }, { name: 'behind the band', y: 20 }]
  const rows = []
  for (const shell of shells) for (const league of shell.leagues) for (const width of [360, 375, 390, 1000]) {
    const id = `focus-${shell.app}-${league}-${width}`
    const { context, page, errors } = await openPage(browser, shell.url(league), 'light', width, shell.open)
    try {
      await page.waitForSelector('[data-table-picker]', { timeout: 15_000 })
      const layout = width >= 768 ? 'desktop' : 'mobile'
      const within = '.page-measure'
      const held = standings[league] ?? []
      if (!held.length) {
        // A snapshot may hold no table for a league (the review of PR #352, finding 2):
        // the page owes the empty page, and the sweep owes it no table and no row.
        const state = await page.evaluate(() => ({ empty: !!document.querySelector('[data-empty-table]'), tables: document.querySelectorAll('[data-table]').length, scroll: document.documentElement.scrollWidth === innerWidth }))
        assert.deepEqual(state, { empty: true, tables: 0, scroll: true }, `${id} the snapshot holds no ${league} table`)
        const { seen, table } = await sweepFocus(page, places[0], { within, layout })
        const faults = [
          ...(seen.length ? [] : [`no Tab was pressed: nothing a keyboard can reach is inside ${within}`]),
          ...(table.rows.length || table.controls.length ? [`the page draws ${table.rows.length} rows and ${table.controls.length} table controls for a league the snapshot holds no table for`] : []),
          ...seen.flatMap(focusFaults),
        ]
        assert.deepEqual(faults, [], `${id} ${faults.join('; ')}`)
        assert.deepEqual(errors, [], id)
        rows.push({ id, empty: true, controls: seen.length, tableControls: 0, rowControls: 0, tableRows: 0, clubs: 0, named: null, pressed: seen.length, moved: 0 })
        continue
      }
      // A club's row is a control on the phone: each club in the committed standings is
      // owed its own, matched by the id the row carries. The desktop rows hold none and
      // the table is owed its six sort controls by name, each in the column of that name;
      // a row control arriving there is owed a press too.
      const clubs = layout === 'mobile' ? held.map((club) => ({ id: club.teamId, name: club.name })) : null
      const named = layout === 'desktop' ? DESKTOP_TABLE_CONTROLS : null
      const placed = layout === 'desktop' ? DESKTOP_TABLE_SORTS : null
      const row = { id, controls: 0, tableControls: 0, rowControls: 0, tableRows: 0, clubs: clubs?.length ?? null, named, pressed: 0, moved: 0, rings: ringSummary([]) }
      for (const place of places) {
        const { seen, table } = await sweepFocus(page, place, { within, layout })
        const faults = [...sweepFaults(seen, { within, ...table, clubs, named, placed }), ...seen.flatMap(focusFaults)]
        assert.deepEqual(faults, [], `${id} ${place.name}: ${faults.join('; ')}`)
        ringSummary(seen, row.rings)
        const reachable = table.controls.filter((control) => control.reachable)
        row.controls = seen.length
        row.tableControls = reachable.length
        row.rowControls = reachable.filter((control) => control.row >= 0).length
        row.tableRows = table.rows.length
        row.pressed += seen.length
        row.moved += seen.filter((control) => Math.abs(control.top - control.before) > EPSILON).length
        // The reviewed case: position 16 of the Champions League table.
        const reviewed = league === 'ucl' && layout === 'mobile' && seen.filter((control) => control.row)[15]
        if (reviewed) row[place.underFoot === undefined ? 'behindBand' : 'underFoot'] = { text: reviewed.text.slice(0, 16), before: reviewed.before, top: reviewed.top, bottom: reviewed.bottom }
        if (reviewed && place.underFoot !== undefined && width === 390 && out) {
          await page.evaluate(() => {
            const { list, targets } = window.__kickoffFocus
            const rows = targets.map((i) => list[i]).filter((el) => el.parentElement.hasAttribute('data-table-row'))
            rows[14].focus({ preventScroll: true })
            window.scrollTo(0, rows[15].getBoundingClientRect().top + window.scrollY - document.querySelector('header.imprint-band').getBoundingClientRect().height - 1.06)
          })
          await page.keyboard.press('Tab')
          await page.screenshot({ path: path.join(out, `${id}.png`), captureBeyondViewport: false })
        }
      }
      // Every table control's ring was read, and no reading is left at its starting value.
      assert.equal(row.rings.sampled, row.pressed === 0 ? 0 : places.length * row.tableControls, `${id} sampled ${row.rings.sampled} rings`)
      if (layout === 'desktop') {
        // Each name sorts by its own figure (finding 3): the six are pressed by name.
        const sorts = sortFaults(await pressSorts(page), held)
        assert.deepEqual(sorts, [], `${id} ${sorts.join('; ')}`)
        row.sorts = DESKTOP_TABLE_SORTS.map((sort) => `${sort.name} by ${sort.by}`)
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth), true, id)
      assert.deepEqual(errors, [], id)
      rows.push(row)
    } finally { await context.close() }
  }
  rows.push(...await provePosterFocus(browser, origins))
  return rows
}

export async function provePosterFocus(browser, origins) {
  const places = [{ underFoot: 1.06 }, { y: 20 }]
  const rows = []
  const { fixtures, window } = readSnapshot(root)
  const heavy = chooseWeeks(fixtures, window).heavy.monday
  for (const [app, origin] of Object.entries(origins)) for (const width of [360, 390, 1000]) {
    const id = 'focus-' + app + '-poster-' + width
    const { page, context, errors } = await openPage(browser, origin + '/?date=' + heavy, 'light', width)
    try {
      const owed = await page.$$eval('.more-stories', buttons => buttons.length)
      assert.ok(owed > 0, id)
      for (const place of places) {
        const { seen } = await sweepFocus(page, place, { within: '.poster-part', layout: 'poster' })
        assert.equal(seen.length, owed, id)
        assert.ok(seen.every(control => control.text.startsWith('More stories')), id)
        assert.deepEqual(seen.flatMap(focusFaults), [], id)
      }
      assert.deepEqual(errors, [], id)
      rows.push({ id, controls: owed, pressed: places.length * owed })
    } finally { await context.close() }
  }
  return rows
}

// The Table's own controls, held to H1 and H2 as the band is: the six league tabs, Zones
// & key, each club's row on a phone and the six sort controls on the desktop.
/** `boxes` is every control the Table drew, each with its `kind`. A kind that is short of
 *  what the Table owes is a fault before any box is measured: a control that is not there
 *  has no hit area to fail. `clubs` is the count the committed standings hold. */
export function tableHitFaults(boxes, { layout, clubs }) {
  // A league the snapshot holds no table for draws the six tabs and no other control.
  const owed = { tab: 6, ...(layout === 'empty' ? {} : { key: 1, ...(layout === 'mobile' ? { row: clubs } : { sort: DESKTOP_TABLE_CONTROLS.length }) }) }
  const faults = []
  for (const kind of new Set([...Object.keys(owed), ...boxes.map((box) => box.kind)])) {
    const drawn = boxes.filter((box) => box.kind === kind).length
    if (drawn !== (owed[kind] ?? 0)) faults.push(`${drawn} ${kind} hit ${drawn === 1 ? 'area' : 'areas'}, expected ${owed[kind] ?? 0}`)
  }
  return [...faults, ...hitAreaFaults(boxes)]
}

/** The Table's controls on the page, in page coordinates, so a pinned row is read where it lies. */
async function tableHitBoxes(page, layout) {
  return page.evaluate((shown) => {
    const box = (el, kind, name) => {
      const rect = el.getBoundingClientRect()
      return { kind, name: `${kind} ${name}`.replace(/\s+/g, ' ').trim(), left: rect.left, right: rect.right, top: rect.top + scrollY, bottom: rect.bottom + scrollY, w: rect.width, h: rect.height }
    }
    const all = (selector) => [...document.querySelectorAll(selector)]
    return [
      ...all('[data-table-picker] button').map((el) => box(el, 'tab', el.textContent)),
      ...all('.zones-key-bar').map((el) => box(el, 'key', 'Zones & key')),
      ...all(`[data-table="${shown}"] button`).map((el) => (
        el.parentElement.hasAttribute('data-table-row') ? box(el, 'row', el.parentElement.getAttribute('data-table-row')) : box(el, 'sort', el.textContent)
      )),
    ]
  }, layout)
}

/** The desktop table's head as drawn. `cells` is each label's left and right edge, in
 *  order; `table` the table's own box; `overflow` each row with a cell whose content is
 *  wider than its column. Fifteen columns, each starting where the one before it ends or
 *  later, the last inside the table, and the table inside the 780px measure. */
export function columnFaults({ cells, table, overflow }) {
  const faults = []
  if (cells.length !== 15) faults.push(`${cells.length} columns in the head, expected 15`)
  cells.forEach((cell, i) => {
    if (i > 0 && cell.left < cells[i - 1].right - EPSILON) faults.push(`column ${i + 1}${cell.name ? ` (${cell.name})` : ''} starts at ${cell.left.toFixed(2)}, inside column ${i}`)
  })
  const last = cells.at(-1)
  if (last && last.right > table.right + EPSILON) faults.push(`the last column ends at ${last.right.toFixed(2)}, past the table’s edge at ${table.right.toFixed(2)}`)
  if (table.width > 780 + EPSILON) faults.push(`the table is ${table.width.toFixed(2)} wide, past the 780px measure`)
  if (overflow.length) faults.push(`${overflow.length} ${overflow.length === 1 ? 'row has' : 'rows have'} a cell wider than its column: ${overflow.slice(0, 3).join(', ')}${overflow.length > 3 ? ', …' : ''}`)
  return faults
}

// The Table in each league it holds. The matrix shows the one a URL without a league
// opens; a league's own zones, bands and length are drawn only here. Each cell is held to
// the page's width, the cover's line, the Table's hit areas and, on the desktop, its
// fifteen columns. Then the key is opened, and on a phone the first row, and the contrast
// is sampled with both open, so the key's words and the opened row's are measured too.
const TABLE_WIDTHS = [360, 390, 1000]

/**
 * A capture of one league's Table is that league's (the review of PR #352, finding 5). The
 * cover's line beginning with the pressed tab's words says only that the page agrees with
 * itself: a page asked for La Liga that opened Serie A passed, both having twenty clubs.
 * So the tab pressed has to carry the key that was asked for, and the rows have to be the
 * provider's clubs for that key, by id, in the provider's order. `clubs` is those ids from
 * the committed standings. With none, the snapshot holds no table for the league (finding
 * 2), and the page owes the empty page: its note, no table and no row.
 *
 * @param {string} league  the key the capture asked for
 * @param {string[]} clubs
 * @param {{ tabs: string[], pressed: string[], ids: string[], empty: string | null, tables: number }} seen
 */
export function leagueFaults(league, clubs, { tabs, pressed, ids, empty, tables }) {
  const faults = []
  if (tabs.join() !== TABLE_LEAGUE_KEYS.join()) faults.push(`the tabs are ${tabs.join(', ') || 'none'}, expected ${TABLE_LEAGUE_KEYS.join(', ')}`)
  if (pressed.join() !== league) faults.push(`asked for ${league}, and the tab pressed is ${pressed.join(' and ') || 'none'}`)
  if (!clubs.length) {
    if (empty === null) faults.push(`the snapshot holds no ${league} table, and the page does not say so`)
    if (tables || ids.length) faults.push(`the snapshot holds no ${league} table, and the page draws ${tables} ${tables === 1 ? 'table' : 'tables'} and ${ids.length} ${ids.length === 1 ? 'row' : 'rows'}`)
    return faults
  }
  if (empty !== null) faults.push(`the snapshot holds ${clubs.length} ${league} clubs, and the page says it has no table`)
  const at = clubs.findIndex((id, i) => ids[i] !== id)
  if (ids.length !== clubs.length) faults.push(`the page draws ${ids.length} rows, and the snapshot holds ${clubs.length} ${league} clubs`)
  else if (at >= 0) faults.push(`row ${at + 1} is club "${ids[at]}", and the snapshot’s ${league} table has "${clubs[at]}" there`)
  return faults
}

/** The foot's last paragraph: string 8's third sentence, ending on the dot sentence as approved
 *  on 21 Nov 2026 (the review of PR #352, question 11). The runner's own copy, letter for letter. */
export const TABLE_FOOT_LAST = 'Zones & key, opened, reads: form runs oldest to newest. A dot is an empty slot: the snapshot holds fewer than five finished results for that club in this competition.'

/** The statuses under which a match has ended with a score. A strip draws a letter for the first
 *  alone; the foot's "finished results" is read as widely as a reader could, as all three. */
const ENDED = new Set(['full_time', 'after_extra_time', 'after_penalties'])

/**
 * What the committed fixtures hold for each club of one league's table, counted here and not
 * read from the page: the club's full-time results in that competition as letters, oldest to
 * newest, and how many of its matches there have ended with a score, however they ended.
 *
 * @param {string} league
 * @param {string[]} clubs  the club ids of the committed standings, in order
 * @param {{ competition: string, status: string, kickoffUtc: string, result?: { home: number, away: number }, home: { sourceId?: string }, away: { sourceId?: string } }[]} fixtures
 * @returns {Map<string, { letters: string[], finished: number }>}
 */
export function heldResults(league, clubs, fixtures) {
  const held = new Map(clubs.map((id) => [id, { letters: [], finished: 0 }]))
  const scored = fixtures
    .filter((fixture) => fixture.competition === league && fixture.result && ENDED.has(fixture.status))
    .sort((a, b) => a.kickoffUtc.localeCompare(b.kickoffUtc))
  for (const fixture of scored) for (const [us, them] of [['home', 'away'], ['away', 'home']]) {
    const club = held.get(fixture[us].sourceId)
    if (!club) continue
    club.finished += 1
    if (fixture.status !== 'full_time') continue
    club.letters.push(fixture.result[us] > fixture.result[them] ? 'W' : fixture.result[us] === fixture.result[them] ? 'D' : 'L')
  }
  return held
}

/**
 * The foot's dot sentence is on the page as approved, and it is true of the page (the review
 * of PR #352, question 11). A strip is five slots: a letter for each of the club's latest
 * full-time results in this competition, oldest to newest, then a dot for each slot it has
 * none for. So a dot the snapshot holds a result for is a fault, and so is a letter it holds
 * none for, and so is a club that draws a dot while the snapshot holds five finished results
 * for it here, which is the one thing the sentence says cannot be.
 *
 * @param {string} league
 * @param {Map<string, { letters: string[], finished: number }>} held  from heldResults
 * @param {{ foot: string[], strips: { id: string, pips: string[] }[] }} seen  the foot's paragraphs, and each row's pips as drawn
 */
export function dotFaults(league, held, { foot, strips }) {
  const faults = []
  const last = foot[foot.length - 1]
  if (last !== TABLE_FOOT_LAST) faults.push(`the foot ends ${last === undefined ? 'with no paragraph' : `"${last}"`}, and the approved sentence is "${TABLE_FOOT_LAST}"`)
  if (strips.length !== held.size) faults.push(`the page draws ${strips.length} strips, and the snapshot holds ${held.size} ${league} clubs`)
  for (const [id, { letters, finished }] of held) {
    const mine = strips.filter((strip) => strip.id === id)
    if (mine.length !== 1) {
      faults.push(`club "${id}" has ${mine.length} rows with a strip`)
      continue
    }
    const latest = letters.slice(-5)
    const owed = [...latest, ...Array(5 - latest.length).fill('·')].join('')
    const drawn = mine[0].pips.join('')
    if (drawn !== owed) faults.push(`club "${id}" draws ${drawn || 'no strip'}, and the snapshot’s ${league} fixtures give ${owed}`)
    else if (latest.length < 5 && finished >= 5) faults.push(`club "${id}" draws a dot, and the snapshot holds ${finished} finished results for it in ${league}`)
  }
  return faults
}

/** The foot's paragraphs, and each row's pips in the layout the width draws: the ones a reader is shown. */
function readDots(page, layout) {
  return page.evaluate((shown) => ({
    foot: [...document.querySelectorAll('footer.page-foot p.page-foot-copy')].filter((paragraph) => paragraph.checkVisibility()).map((paragraph) => paragraph.textContent),
    strips: [...document.querySelectorAll(`[data-table="${shown}"] [data-table-row]`)].map((row) => ({
      id: row.getAttribute('data-table-row'),
      pips: [...row.querySelectorAll('.form-pips .form-pip')].filter((pip) => pip.checkVisibility()).map((pip) => pip.textContent),
    })),
  }), layout)
}

/** What a Table page shows of its league, in the layout the width draws. */
function readLeague(page, layout) {
  return page.evaluate((shown) => {
    const table = document.querySelector(`[data-table="${shown}"]`)
    const tabs = [...document.querySelectorAll('[data-table-picker] button')]
    const pressed = tabs.filter((tab) => tab.getAttribute('aria-pressed') === 'true')
    return {
      scrollWidth: document.documentElement.scrollWidth, innerWidth,
      theme: document.documentElement.dataset.theme,
      tabs: tabs.map((tab) => tab.getAttribute('data-league') ?? ''),
      pressed: pressed.map((tab) => tab.getAttribute('data-league') ?? ''),
      current: pressed[0]?.textContent ?? '',
      line: document.querySelector('.register-cover-line')?.textContent ?? '',
      empty: document.querySelector('[data-empty-table]')?.textContent ?? null,
      tables: document.querySelectorAll('[data-table]').length,
      ids: table ? [...table.querySelectorAll('[data-table-row]')].map((row) => row.getAttribute('data-table-row')) : [],
    }
  }, layout)
}

/**
 * With `files`, the same cells run on the two files a reader opens from disk, and the
 * network is off: openPage fails a cell whose file asks for any host at all.
 */
export async function captureTable(browser, { origins = {}, out, contrast = false, files = false }, result = { cells: [], contrast: [] }) {
  const standings = committedStandings()
  const { fixtures } = readSnapshot(root)
  const degraded = JSON.parse(readFileSync(path.join(root, 'src/data/meta.json'), 'utf8')).standingsDegraded ?? []
  // The six leagues the Table has a tab for, whether or not the snapshot holds a table for
  // each: a sync may write none for a league, and that league's cells are the empty page.
  const leagues = TABLE_LEAGUE_KEYS
  const strangers = Object.keys(standings).filter((key) => !leagues.includes(key))
  assert.deepEqual(strangers, [], `the standings hold a league the Table has no tab for: ${strangers.join(', ')}`)
  const disk = { offline: path.join(root, 'dist-offline/index.html'), single: path.join(root, 'dist-single/index.html') }
  const apps = files
    ? Object.entries(disk).map(([app, file]) => ({ app, url: (league) => `${pathToFileURL(file).href}?tab=table&league=${league}`, open: { waitUntil: 'domcontentloaded', offline: true } }))
    : Object.entries(origins).map(([app, origin]) => ({ app, url: (league) => `${origin}/?tab=table&league=${league}`, open: {} }))
  for (const { app, url, open } of apps) for (const league of leagues) {
    for (const theme of ['light', 'dark']) for (const width of TABLE_WIDTHS) {
      const id = `table-${app}-${league}-${theme}-${width}`
      const { context, page, errors } = await openPage(browser, url(league), theme, width, open)
      try {
        const layout = width >= 768 ? 'desktop' : 'mobile'
        const clubs = (standings[league] ?? []).map((club) => club.teamId)
        await page.waitForSelector(`[data-table="${layout}"] [data-table-row], [data-empty-table]`, { timeout: 15_000 })
        const shown = await readLeague(page, layout)
        assert.equal(shown.scrollWidth, shown.innerWidth, id)
        assert.equal(shown.theme, theme, id)
        assert.deepEqual(errors, [], id)
        const bound = leagueFaults(league, clubs, shown)
        assert.deepEqual(bound, [], `${id} ${bound.join('; ')}`)
        if (!clubs.length) {
          // The empty page: the league's name on the cover, the reason in the app's words,
          // the six tabs as the only controls, and the page's contrast as drawn.
          assert.equal(shown.line, shown.current, `${id} the cover reads "${shown.line}" under the tab "${shown.current}"`)
          const reason = degraded.includes(league) ? 'the provider no longer supplies the configured league-phase table.' : 'run npm run sync.'
          assert.equal(shown.empty, `No table in the snapshot for ${shown.current} — ${reason}`, id)
          const hits = tableHitFaults(await tableHitBoxes(page, layout), { layout: 'empty', clubs: 0 })
          assert.deepEqual(hits, [], `${id} ${hits.join('; ')}`)
          const drawn = await shoot(page, path.join(out, `${id}.png`), width)
          if (contrast) result.contrast.push(await measureContrast(page, id, width, drawn))
          assert.deepEqual(errors, [], id)
          result.cells.push({ id, rows: 0, empty: true, line: shown.line, columns: 0, table: 0, scrollWidth: shown.scrollWidth })
          continue
        }
        const state = { ...shown, rows: shown.ids.length, ...(await page.evaluate((layoutShown) => {
          const table = document.querySelector(`[data-table="${layoutShown}"]`)
          const head = table.querySelector(':scope > .sticky')
          const edges = (el) => ({ name: el.textContent.trim(), left: el.getBoundingClientRect().left, right: el.getBoundingClientRect().right })
          const wide = (el) => el.scrollWidth > el.clientWidth + 0.5
          return {
            cells: [...head.children].map(edges),
            table: { right: table.getBoundingClientRect().right, width: table.getBoundingClientRect().width },
            overflow: [...table.querySelectorAll('[data-table-row] > .register-row')]
              .filter((row) => wide(row) || [...row.children].some(wide))
              .map((row) => row.parentElement.getAttribute('data-table-row')),
          }
        }, layout)) }
        // The cover's line is the league a reader chose and the app's own matchday count.
        assert.ok(state.current && state.line.startsWith(`${state.current} · As of matchday `), `${id} the cover reads "${state.line}" under the tab "${state.current}"`)
        // The foot's last paragraph as approved, and every dot a result the snapshot does not hold.
        const dots = await readDots(page, layout)
        const said = dotFaults(league, heldResults(league, clubs, fixtures), dots)
        assert.deepEqual(said, [], `${id} ${said.join('; ')}`)
        const hits = tableHitFaults(await tableHitBoxes(page, layout), { layout, clubs: clubs.length })
        assert.deepEqual(hits, [], `${id} ${hits.join('; ')}`)
        if (layout === 'desktop') {
          const columns = columnFaults(state)
          assert.deepEqual(columns, [], `${id} ${columns.join('; ')}`)
        } else assert.deepEqual(state.overflow, [], `${id} rows with a cell wider than its column: ${state.overflow.join(', ')}`)
        await shoot(page, path.join(out, `${id}.png`), width)

        await page.click('.zones-key-bar')
        await page.waitForSelector('.zones-key-panel')
        if (layout === 'mobile') {
          await page.click('[data-table="mobile"] [data-table-row] > button')
          await page.waitForSelector('[data-row-more]')
        }
        // Past the 180ms the key takes to open and the 150ms a row takes.
        await new Promise((resolve) => setTimeout(resolve, 400))
        const opened = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth }))
        assert.equal(opened.scrollWidth, opened.innerWidth, `${id} with the key opened`)
        const drawn = await shoot(page, path.join(out, `${id}-opened.png`), width)
        if (contrast) result.contrast.push(await measureContrast(page, `${id}-opened`, width, drawn))
        assert.deepEqual(errors, [], `${id} with the key opened`)
        result.cells.push({ id, rows: state.rows, line: state.line, columns: state.cells.length, table: state.table.width, scrollWidth: state.scrollWidth, strips: dots.strips.length, dots: dots.strips.reduce((sum, strip) => sum + strip.pips.filter((pip) => pip === '·').length, 0) })
      } finally { await context.close() }
    }
    console.log(`${app} table ${league}: ${2 * TABLE_WIDTHS.length} cells passed`)
  }
  return result
}

// The Table's states, each on its own harness page, on synthetic data. What a state has
// to show is read from the layout the width draws: innerText leaves out what is hidden.
const TABLE_STATES = {
  cells: { mobile: [/kickoff time not yet set by the league/i, /kicked off/i, /local time not known/i, /games in hand/i, /\+1/], desktop: [/time TBC/i, /kicked off/i, /local time not known/i, /games in hand/i, /\+1/] },
  opened: { mobile: [/W-D-L \d+-\d+-\d+/i, /PPG \d\.\d\d/i], desktop: [] },
  ppg: { mobile: [], desktop: [/sorted by points per game\./i] },
  key: { mobile: [/qualification zones/i, /columns/i, /how ties are broken/i], desktop: [/qualification zones/i, /columns/i, /how ties are broken/i] },
  season: { mobile: [/zone bands are hidden: the snapshot is the 2025-26 season but the zone metadata describes 2026-27\./i], desktop: [/zone bands are hidden: the snapshot is the 2025-26 season but the zone metadata describes 2026-27\./i] },
  ucl: { mobile: [/as of matchday 4 of 8 · league phase/i, /knockout play-offs/i, /eliminated/i, /matches played/i], desktop: [/as of matchday 4 of 8 · league phase/i, /knockout play-offs/i, /eliminated/i, /matches played/i] },
  empty: { mobile: [/no table in the snapshot for ligue 1/i], desktop: [/no table in the snapshot for ligue 1/i] },
}

// The three clubs the cells state is there for, each with the state its cell has to be in.
const NAMED_CELLS = { 'Specimen Unset': 'unset', 'Specimen Kicked': 'kicked-off', 'Specimen Nozone': 'set' }
const CELL_CLOCK = /\b\d{1,2}:\d{2}\b/
const CELL_SCORE = /\b\d+\s*[–—-]\s*\d+\b/
const CELL_LEAD = /^[A-Z][a-z]{2} · \S+ \((?:H|A)\)$/

/**
 * Every next-fixture cell the shown table drew, held to its own state (the review of PR
 * #352, finding 6). A state's words being somewhere on the page is not the cell: a clock
 * and a score added beside KICKED OFF passed. `cells` is each cell as a reader sees it:
 * the club, the state the cell carries, the text of each of its units, and the whole
 * cell's text. The whole text has to be its units and nothing more. A kicked-off cell is
 * the fixture and KICKED OFF, with no clock and no score. A cell whose kickoff is not set
 * is the fixture and the not-set words of its layout, with neither clock. A set cell is
 * the fixture, the Brooklyn clock and the stadium's, or the words that stand for it.
 */
export function nextCellFaults(cells, layout) {
  const faults = []
  for (const cell of cells) {
    const who = cell.club || 'a row'
    // A date is not a clock or a score, and the not-set line carries one.
    const said = cell.text.replace(/\d{4}-\d{2}-\d{2}/g, '')
    const rest = cell.units.slice(1).join(' ')
    if (cell.text !== cell.units.join(' ')) faults.push(`${who}’s cell shows "${cell.text}", and its units read "${cell.units.join(' ')}"`)
    if (!CELL_LEAD.test(cell.units[0] ?? '')) faults.push(`${who}’s cell begins "${cell.units[0] ?? ''}", expected a day, an opponent and (H) or (A)`)
    if (CELL_SCORE.test(said)) faults.push(`${who}’s cell prints a score: "${cell.text}"`)
    if (cell.state === 'kicked-off') {
      if (cell.units.length !== 2 || !/^kicked off$/i.test(cell.units[1])) faults.push(`${who} has kicked off and the cell reads "${rest}", expected KICKED OFF alone`)
      if (CELL_CLOCK.test(said) || /local/i.test(said)) faults.push(`${who} has kicked off and the cell prints a clock: "${cell.text}"`)
    } else if (cell.state === 'unset') {
      const owed = layout === 'mobile' ? /^[A-Z][a-z]{2} \d{4}-\d{2}-\d{2} — kickoff time not yet set by the league$/ : /^time TBC$/
      if (cell.units.length !== 2 || !owed.test(cell.units[1])) faults.push(`${who}’s kickoff is not set and the cell reads "${rest}", expected ${layout === 'mobile' ? 'the weekday, the date and “kickoff time not yet set by the league”' : '“time TBC”'}`)
      if (CELL_CLOCK.test(said) || /local/i.test(said)) faults.push(`${who}’s kickoff is not set and the cell prints a clock: "${cell.text}"`)
    } else if (cell.state === 'set') {
      if (cell.units.length !== 3 || !/^\d{1,2}:\d{2} [AP]M$/.test(cell.units[1]) || !/^(?:\d{2}:\d{2} local|local time not known)$/i.test(cell.units[2])) faults.push(`${who}’s cell reads "${rest}", expected the Brooklyn clock and the stadium’s`)
    } else faults.push(`${who}’s cell is in the state "${cell.state}", which is none of set, unset and kicked-off`)
  }
  return faults
}

/**
 * What one state's page showed, against what that state is there to show. `marks` is how
 * many zone marks the page drew with a band; `tables` how many tables it drew; `cells`
 * every next-fixture cell of the shown table, held to nextCellFaults in every state that
 * draws a table; `opened` each row of the shown table that is open, with what it reads and
 * the figures the specimen holds for that club.
 *
 * @param {string} name
 * @param {string} layout  'mobile' or 'desktop'
 * @param {{
 *   text: string, marks: number, tables: number,
 *   cells?: { club: string, state: string | null, units: string[], text: string }[],
 *   opened?: { club: string, more: string, expanded: string | null, owed: { wdl: string, ppg: string } | null }[],
 * }} seen
 */
export function tableStateFaults(name, layout, { text, marks, tables, cells, opened }) {
  const owed = TABLE_STATES[name]
  if (!owed) return [`${name} is not a Table state the runner knows`]
  const faults = owed[layout].filter((needle) => !needle.test(text)).map((needle) => `${name} does not show ${needle}`)
  if (name !== 'empty') {
    if (!Array.isArray(cells)) faults.push(`${name}: the next-fixture cells were not read`)
    else faults.push(...nextCellFaults(cells, layout).map((fault) => `${name}: ${fault}`))
  }
  if (name === 'cells' && Array.isArray(cells)) {
    for (const [club, state] of Object.entries(NAMED_CELLS)) {
      const cell = cells.find((each) => each.club === club)
      if (!cell) faults.push(`cells: ${club} has no next-fixture cell`)
      else if (cell.state !== state) faults.push(`cells: ${club}’s cell is "${cell.state}", expected "${state}"`)
      else if (club === 'Specimen Nozone' && !/^local time not known$/i.test(cell.units.at(-1) ?? '')) faults.push(`cells: ${club}’s cell ends "${cell.units.at(-1)}", expected “local time not known”`)
    }
  }
  if (name === 'opened') {
    if (!Array.isArray(opened)) faults.push('opened: the opened rows were not read')
    else if (layout === 'desktop') {
      if (opened.length) faults.push(`opened draws ${opened.length} opened ${opened.length === 1 ? 'row' : 'rows'} on the desktop, whose rows hold no control`)
    } else {
      if (opened.length !== 1) faults.push(`opened draws ${opened.length} opened rows, expected one`)
      for (const row of opened) {
        if (row.club !== 'Specimen Kicked') faults.push(`opened opens ${row.club}, expected Specimen Kicked`)
        if (row.expanded !== 'true') faults.push(`opened: ${row.club}’s row is drawn open and says aria-expanded="${row.expanded}"`)
        if (!row.owed) faults.push(`opened: ${row.club} is not a club of the specimen`)
        else if (row.more.toUpperCase() !== `W-D-L ${row.owed.wdl} PPG ${row.owed.ppg}`) faults.push(`opened: ${row.club} reads "${row.more}", and its row holds W-D-L ${row.owed.wdl} and PPG ${row.owed.ppg}`)
      }
    }
  }
  // A season the zone data does not describe draws no band anywhere, in a row or in the key.
  if (name === 'season' && marks) faults.push(`season draws ${marks} zone ${marks === 1 ? 'mark' : 'marks'}, and its bands are hidden`)
  if (name !== 'season' && name !== 'empty' && !marks) faults.push(`${name} draws no zone mark`)
  if (name === 'empty' && tables) faults.push(`empty draws ${tables} ${tables === 1 ? 'table' : 'tables'}, and the snapshot holds none`)
  if (name !== 'empty' && tables !== 2) faults.push(`${name} draws ${tables} tables, expected the phone’s and the desktop’s`)
  return faults
}

/** One harness page as a reader sees it, in the layout the width draws: what tableStateFaults holds it to. */
function readTableState(page, layout) {
  return page.evaluate((shown) => {
    const tidy = (text) => (text ?? '').replace(/\s+/g, ' ').trim()
    const table = document.querySelector(`[data-table="${shown}"]`)
    const rows = table ? [...table.querySelectorAll('[data-table-row]')] : []
    const club = (row) => tidy(row.querySelector('.register-name')?.textContent)
    const specimen = new Map((globalThis.__kickoffSpecimen?.rows ?? []).map((row) => [row.teamId, row]))
    return {
      scrollWidth: document.documentElement.scrollWidth, innerWidth,
      theme: document.documentElement.dataset.theme,
      // The page as a reader sees it: innerText leaves out the layout the width hides.
      text: document.querySelector('.register')?.innerText ?? '',
      marks: document.querySelectorAll('.zone-mark[data-band]').length,
      tables: document.querySelectorAll('[data-table]').length,
      cells: rows.flatMap((row) => {
        const cell = row.querySelector('[data-next-cell]')
        return cell ? [{ club: club(row), state: cell.getAttribute('data-next-cell'), units: [...cell.children].map((unit) => tidy(unit.innerText)), text: tidy(cell.innerText) }] : []
      }),
      opened: rows.filter((row) => row.querySelector('[data-row-more]')).map((row) => {
        const held = specimen.get(row.getAttribute('data-table-row'))
        return {
          club: club(row), more: tidy(row.querySelector('[data-row-more]').innerText),
          expanded: row.querySelector('[aria-expanded]')?.getAttribute('aria-expanded') ?? null,
          owed: held ? { wdl: `${held.w}-${held.d}-${held.l}`, ppg: held.played ? (held.pts / held.played).toFixed(2) : '—' } : null,
        }
      }),
    }
  }, layout)
}

/** `contrast`, when it is given, takes each state's rendered contrast, in both themes. */
export async function captureTableStates(browser, out, cells = [], contrast = null) {
  const origin = process.env.KICKOFF_HARNESS_ORIGIN ?? 'http://127.0.0.1:5175'
  for (const name of Object.keys(TABLE_STATES)) for (const theme of ['light', 'dark']) for (const width of TABLE_WIDTHS) {
    const id = `harness-table-${name}-${theme}-${width}`
    // The dev server's HMR socket never goes idle, so this load waits for the page's own flag.
    const { context, page, errors, status } = await openPage(
      browser, `${origin}/tests/harness/table.html?state=${name}&theme=${theme}`, theme, width,
      { waitUntil: 'load' },
    )
    try {
      if (status >= 400) throw new Error(`${id} HTTP ${status}`)
      if (await page.title() !== 'Table states harness') {
        throw new Error(`${id}: ${origin} did not serve the Table harness. It needs the Vite dev server (KICKOFF_HARNESS_ORIGIN), not the built preview.`)
      }
      await page.waitForFunction(
        () => document.documentElement.dataset.statesReady === 'true' || document.documentElement.dataset.statesError,
        { timeout: 15_000 },
      )
      const failure = await page.evaluate(() => document.documentElement.dataset.statesError ?? '')
      if (failure) throw new Error(`${id}: ${failure}`)
      const layout = width >= 768 ? 'desktop' : 'mobile'
      const state = await readTableState(page, layout)
      assert.equal(state.scrollWidth, state.innerWidth, id)
      assert.equal(state.theme, theme, id)
      assert.deepEqual(errors, [], id)
      const faults = tableStateFaults(name, layout, state)
      assert.deepEqual(faults, [], `${id} ${faults.join('; ')}`)
      const drawn = await shoot(page, path.join(out, `${id}.png`), width)
      // The named states' inks as rendered: amber on the row, the opened row's labels, the note.
      if (contrast) contrast.push(await measureContrast(page, id, width, drawn))
      assert.deepEqual(errors, [], id)
      cells.push({ id, state: name, theme, width, scrollWidth: state.scrollWidth, marks: state.marks, nextCells: state.cells.length, openedRows: state.opened.length })
    } finally { await context.close() }
  }
  return cells
}

/**
 * The verifiers, shown to fail (the review of PR #352, findings 3 to 6). Each of four gates
 * passed a page that was wrong, so each is run here on a page that is right, then on the
 * same page broken the way the review broke it, and the run stops unless the first is
 * clean and the second is not. A receipt that says a gate passed says nothing until the
 * gate has been seen to fail. The foot's dot sentence (question 11) is held the same way:
 * once with its qualifier taken out, and once with a strip that no longer matches the
 * snapshot. So is the ring's depth (Pass 2.5): once with one of its two pixels painted over.
 */
export async function proveVerifiers(browser, origins) {
  const standings = committedStandings()
  const [origin] = Object.values(origins)
  const harness = process.env.KICKOFF_HARNESS_ORIGIN ?? 'http://127.0.0.1:5175'
  const within = '.page-measure'
  const controls = []
  const record = (name, clean, broken, extra = {}) => {
    assert.deepEqual(clean, [], `the verifier for "${name}" faults a clean page: ${clean.join('; ')}`)
    assert.ok(broken.length > 0, `the verifier for "${name}" passed the broken page`)
    controls.push({ name, clean: clean.length, faults: broken.length, first: broken[0], ...extra })
  }

  // Finding 3: Played and Points exchange accessible names. Each keeps its text, its place and its press.
  {
    const { context, page } = await openPage(browser, `${origin}/?tab=table&league=pl`, 'light', 1000)
    try {
      await page.waitForSelector('[data-table="desktop"] [data-table-row]', { timeout: 15_000 })
      const judge = async () => {
        const { seen, table } = await sweepFocus(page, { underFoot: 1.06 }, { within, layout: 'desktop' })
        return [...sweepFaults(seen, { within, ...table, named: DESKTOP_TABLE_CONTROLS, placed: DESKTOP_TABLE_SORTS }), ...seen.flatMap(focusFaults), ...sortFaults(await pressSorts(page), standings.pl)]
      }
      const clean = await judge()
      await page.evaluate(() => {
        const buttons = [...document.querySelectorAll('[data-table="desktop"] > .sticky button')]
        const [played, points] = [buttons[0], buttons[4]]
        for (const [id, label] of [['verifier-label-pl', 'PL'], ['verifier-label-pts', 'PTS']]) {
          const span = document.createElement('span')
          span.hidden = true
          span.id = id
          span.textContent = label
          document.body.append(span)
        }
        played.setAttribute('aria-labelledby', 'verifier-label-pts')
        points.setAttribute('aria-labelledby', 'verifier-label-pl')
      })
      record('two sort controls exchange accessible names', clean, await judge())
    } finally { await context.close() }
  }

  // Finding 4: the row's focus ring is made transparent. Width, offset and what lies over it are unchanged.
  {
    const league = longestLeague(standings)
    const clubs = standings[league].map((club) => ({ id: club.teamId, name: club.name }))
    const { context, page } = await openPage(browser, `${origin}/?tab=table&league=${league}`, 'light', 390)
    try {
      await page.waitForSelector('[data-table="mobile"] [data-table-row]', { timeout: 15_000 })
      const judge = async () => {
        const { seen, table } = await sweepFocus(page, { underFoot: 1.06 }, { within, layout: 'mobile' })
        return { rows: seen.filter((control) => control.row).length, faults: [...sweepFaults(seen, { within, ...table, clubs }), ...seen.flatMap(focusFaults)] }
      }
      const clean = await judge()
      await page.addStyleTag({ content: 'button.register-row:focus-visible { outline-color: transparent !important }' })
      const broken = await judge()
      assert.equal(broken.faults.length, clean.rows, `a transparent ring faulted ${broken.faults.length} of ${clean.rows} rows`)
      record('a transparent focus ring on the standings rows', clean.faults, broken.faults, { league, rows: clean.rows })
    } finally { await context.close() }
  }

  // Pass 2.5: one pixel is painted over the upper edge of the focused row, in the dark theme.
  // The ring keeps its colour, width and offset. The mask takes no pointer, so nothing is
  // found lying over the ring's line, and one of the ring's pixels is left at every point.
  {
    const league = longestLeague(standings)
    const clubs = standings[league].map((club) => ({ id: club.teamId, name: club.name }))
    const { context, page } = await openPage(browser, `${origin}/?tab=table&league=${league}`, 'dark', 390)
    try {
      await page.waitForSelector('[data-table="mobile"] [data-table-row]', { timeout: 15_000 })
      const judge = async () => {
        const { seen, table } = await sweepFocus(page, { underFoot: 1.06 }, { within, layout: 'mobile' })
        const rows = seen.filter((control) => control.row)
        return { rows: rows.length, depth: rows.map((control) => control.paint?.depth), faults: [...sweepFaults(seen, { within, ...table, clubs }), ...seen.flatMap(focusFaults)] }
      }
      const clean = await judge()
      assert.deepEqual(clean.faults, [], `the unmasked rows fault before the mask is drawn: ${clean.faults.join('; ')}`)
      const [depth] = clean.depth
      assert.ok(depth >= 2 && clean.depth.every((each) => each === depth), `the mask needs a ring at least two pixels deep, the same on every row, and the rows’ rings were read ${[...new Set(clean.depth)].join(' and ')}px deep`)
      const row = '[data-table="mobile"] [data-table-row] button.register-row'
      await page.addStyleTag({ content: `${row} { position: relative } ${row}:focus-visible::before { content: ""; position: absolute; z-index: 100; top: 0; left: 9px; right: 9px; height: 1px; padding: 0; background: var(--fb-pulp); pointer-events: none }` })
      const broken = await judge()
      const clipped = broken.faults.filter((fault) => fault.endsWith(` is painted ${depth - 1} of its ${depth}px deep at 5 of 5 points on its top edge`))
      assert.equal(clipped.length, clean.rows, `a ring masked to ${depth - 1} of its ${depth}px along its top edge faulted so on ${clipped.length} of ${clean.rows} rows`)
      assert.equal(broken.faults.length, clean.rows, `the mask over the top edge brought ${broken.faults.length} faults on ${clean.rows} rows: ${broken.faults.filter((fault) => !clipped.includes(fault)).slice(0, 3).join('; ')}`)
      record('a focus ring with one pixel of its depth painted over along the top of the standings rows', clean.faults, broken.faults, { league, rows: clean.rows, theme: 'dark', depth })
    } finally { await context.close() }
  }

  // Finding 5: a capture asked for La Liga and the page that opened is Serie A's.
  {
    const ids = (league) => standings[league].map((club) => club.teamId)
    const { context, page } = await openPage(browser, `${origin}/?tab=table&league=seriea`, 'light', 390)
    try {
      await page.waitForSelector('[data-table="mobile"] [data-table-row]', { timeout: 15_000 })
      const shown = await readLeague(page, 'mobile')
      record('a capture of La Liga that shows Serie A', leagueFaults('seriea', ids('seriea'), shown), leagueFaults('laliga', ids('laliga'), shown))
    } finally { await context.close() }
  }

  // Question 11: the foot's sentence loses "in this competition", and then one slot of one
  // strip is drawn as what the snapshot does not hold: a dot as a win, or a letter as a dot.
  {
    const league = longestLeague(standings)
    const held = heldResults(league, standings[league].map((club) => club.teamId), readSnapshot(root).fixtures)
    const breaks = [
      ['the foot’s dot sentence without “in this competition”', () => {
        const paragraphs = [...document.querySelectorAll('footer.page-foot p.page-foot-copy')]
        const last = paragraphs[paragraphs.length - 1]
        last.textContent = last.textContent.replace(' in this competition', '')
      }],
      ['a strip’s last slot drawn as what the snapshot does not hold', () => {
        const pips = document.querySelectorAll('[data-table="mobile"] [data-table-row] .form-pips .form-pip')
        const pip = pips[4]
        pip.textContent = pip.textContent === '·' ? 'W' : '·'
      }],
    ]
    for (const [name, spoil] of breaks) {
      const { context, page } = await openPage(browser, `${origin}/?tab=table&league=${league}`, 'light', 390)
      try {
        await page.waitForSelector('[data-table="mobile"] [data-table-row]', { timeout: 15_000 })
        const clean = dotFaults(league, held, await readDots(page, 'mobile'))
        await page.evaluate(spoil)
        record(name, clean, dotFaults(league, held, await readDots(page, 'mobile')), { league })
      } finally { await context.close() }
    }
  }

  // Finding 6: a clock and a score are added to the KICKED OFF cell, in each layout.
  for (const width of [360, 1000]) {
    const layout = width >= 768 ? 'desktop' : 'mobile'
    const { context, page } = await openPage(browser, `${harness}/tests/harness/table.html?state=cells&theme=light`, 'light', width, { waitUntil: 'load' })
    try {
      await page.waitForFunction(() => document.documentElement.dataset.statesReady === 'true' || document.documentElement.dataset.statesError, { timeout: 15_000 })
      const clean = tableStateFaults('cells', layout, await readTableState(page, layout))
      await page.evaluate((shown) => {
        const row = [...document.querySelectorAll(`[data-table="${shown}"] [data-table-row]`)].find((each) => each.querySelector('.register-name')?.textContent === 'Specimen Kicked')
        row.querySelector('[data-next-cell]').append(' 3:00 PM · 2–1')
      }, layout)
      record(`a clock and a score beside KICKED OFF (${layout})`, clean, tableStateFaults('cells', layout, await readTableState(page, layout)))
    } finally { await context.close() }
  }
  return controls
}

// The first frame of a shell the server renders. Its HTML is laid out before the app
// runs, so what pins below the band has to start at the band's foot by then.
/** `state` is the scrolled Table with the app's scripts held. The pinned rows are held to
 *  pinFaults; the app must not have run, and the scroll padding has to end where the band does. */
export function firstFrameFaults(state) {
  const faults = []
  if (state.hydrated) faults.push('the app ran while its scripts were held')
  if (!near(state.padding, state.band.bottom)) faults.push(`the scroll padding is ${state.padding.toFixed(2)}, and the band ends at ${state.band.bottom.toFixed(2)}`)
  return [...faults, ...pinFaults(state)]
}

const BAND_WATCHER = { script: 'the server’s script', app: 'the app' }

/**
 * Who watches the band's height, and who wrote it. With the app held, the script the
 * server renders after the band is the one observer, and it has published the figure.
 * Once the app has hydrated, that script has stopped and the app's observer is the one
 * left. Two would publish one figure, and the older of the two is the one that writes, so
 * the app's would never publish at all. `writes` are those since the reading before, and
 * `owned` is whether the app's observer was watching when a write was made. After a wrap
 * the app has to have published the new height.
 *
 * @param {'held' | 'hydrated' | 'wrapped'} phase
 * @param {{ watchers: { by: string, live: boolean }[], writes: { value: string, by: string, owned: boolean }[] }} watch
 */
export function handoffFaults(phase, { watchers, writes }) {
  const owner = BAND_WATCHER[phase === 'held' ? 'script' : 'app']
  const watching = watchers.filter((watcher) => watcher.live).map((watcher) => BAND_WATCHER[watcher.by])
  const faults = []
  if (watching.length !== 1 || watching[0] !== owner) {
    faults.push(`${watching.length ? watching.join(' and ') : 'nothing'} ${watching.length > 1 ? 'watch' : 'watches'} the band, expected ${owner} alone`)
  }
  if (writes.some((write) => write.owned && write.by !== 'app')) faults.push('the server’s script wrote the band’s height after the app had it')
  if (phase === 'held' && !writes.some((write) => write.by === 'script')) faults.push('the server’s script published no height before the app ran')
  if (phase === 'wrapped' && !writes.some((write) => write.by === 'app')) faults.push('the band changed height and the app published nothing')
  return faults
}

/** Runs in the page before any of its scripts. Each observer that takes the band is
 *  recorded with who made it, the script the server renders after the band or the app, and
 *  each write of the band's height with who made it and whether the app was watching by then. */
function watchBand() {
  const Real = window.ResizeObserver
  const who = () => (document.currentScript?.hasAttribute('data-kickoff-band') ? 'script' : 'app')
  const watchers = []
  const writes = []
  const made = new WeakMap()
  let reporting = null
  window.ResizeObserver = class extends Real {
    constructor(callback) {
      super((entries, observer) => {
        reporting = made.get(this)?.by ?? null
        try { callback(entries, observer) } finally { reporting = null }
      })
    }
    observe(target, options) {
      if (target instanceof Element && target.matches('header.imprint-band')) {
        const entry = { by: who(), live: true }
        made.set(this, entry)
        watchers.push(entry)
      }
      return super.observe(target, options)
    }
    disconnect() {
      const entry = made.get(this)
      if (entry) entry.live = false
      return super.disconnect()
    }
  }
  const set = CSSStyleDeclaration.prototype.setProperty
  CSSStyleDeclaration.prototype.setProperty = function (name, value, priority) {
    if (name === '--band-height' && this === document.documentElement.style) {
      writes.push({ value, by: reporting ?? who(), owned: watchers.some((entry) => entry.by === 'app' && entry.live) })
    }
    return set.call(this, name, value, priority)
  }
  window.__kickoffBand = { watchers, writes }
}

/** Next's Table with hydration held, then released: at 360, at 365 and 366 where the
 *  provenance stops wrapping, at 390 and at 1000. The band's faces are not scripts and
 *  load while the app waits, so each width is read in the face a reader ends up with.
 *  Each width is then taken across the wrap, with the app's observer alone to publish it. */
export async function proveFirstFrame(browser, origins) {
  const rows = []
  if (!origins.next) return rows
  for (const width of [360, 365, 366, 390, 1000]) {
    const id = `first-next-${width}`
    const context = await browser.createBrowserContext()
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(String(error)))
    page.on('console', (message) => { if (CONSOLE_FAILS.has(message.type())) errors.push(message.text()) })
    try {
      await page.setViewport({ width, height: 844, deviceScaleFactor: 1 })
      await page.evaluateOnNewDocument(() => localStorage.setItem('kickoff-theme', 'light'))
      await page.evaluateOnNewDocument(watchBand)
      const scripts = await holdScripts(page)
      const loaded = page.goto(`${origins.next}/?tab=table&league=${longestLeague(committedStandings())}`, { waitUntil: 'load', timeout: 30_000 })
      loaded.catch(() => {})
      await until(() => scripts.count() > 0, `${id}: the app's scripts`)
      await until(() => page.evaluate(() => !!document.querySelector('[data-table] [data-table-row]')).catch(() => false), `${id}: the server-rendered table`)
      const read = (shown = width) => page.evaluate(async (layout) => {
        await document.fonts.ready
        // A face that has just arrived moves the wrap; the band is watched, and reports in a frame.
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        const table = document.querySelector(`[data-table="${layout}"]`)
        const bands = [...table.querySelectorAll('[data-zone-band]')]
        const sizes = bands.map((zone) => zone.querySelectorAll('[data-table-row]').length)
        const deepest = bands[sizes.indexOf(Math.max(...sizes))]
        const middle = deepest.querySelectorAll('[data-table-row]')[Math.floor(Math.max(...sizes) / 2)]
        window.scrollTo(0, middle.getBoundingClientRect().top + window.scrollY - innerHeight / 2)
        const topmost = (el) => {
          const rect = el.getBoundingClientRect()
          const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
          return hit === el || el.contains(hit) ? 'itself' : hit?.closest('header') ? 'the band' : 'another element'
        }
        const measure = (el, name) => ({ name, top: el.getBoundingClientRect().top, bottom: el.getBoundingClientRect().bottom, topmost: topmost(el) })
        const header = document.querySelector('header.imprint-band')
        const divider = deepest.querySelector('[data-zone-divider]')
        return {
          hydrated: Object.keys(header).some((key) => key.startsWith('__reactFiber')),
          published: document.documentElement.style.getPropertyValue('--band-height') || null,
          padding: Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop),
          band: { top: header.getBoundingClientRect().top, bottom: header.getBoundingClientRect().bottom },
          labels: measure(table.querySelector(':scope > .sticky'), 'labels'),
          divider: divider && getComputedStyle(divider).position === 'sticky' ? measure(divider, divider.getAttribute('data-zone-divider')) : null,
          scrollWidth: document.documentElement.scrollWidth, innerWidth,
          watch: { watchers: window.__kickoffBand.watchers.map((entry) => ({ ...entry })), writes: window.__kickoffBand.writes.map((entry) => ({ ...entry })) },
        }
      }, shown >= 768 ? 'desktop' : 'mobile')
      // Each reading is judged on the writes made since the one before it.
      let judged = 0
      const since = (state) => {
        const watch = { watchers: state.watch.watchers, writes: state.watch.writes.slice(judged) }
        judged = state.watch.writes.length
        return watch
      }
      const held = await read()
      const faults = [...firstFrameFaults(held), ...handoffFaults('held', since(held))]
      assert.deepEqual(faults, [], `${id} with the app held: ${faults.join('; ')}`)
      await scripts.release()
      await loaded
      await page.waitForFunction(() => Object.keys(document.querySelector('header.imprint-band') ?? {}).some((key) => key.startsWith('__reactFiber')), { timeout: 15_000 })
      const after = await read()
      const later = [...(after.hydrated ? [] : ['the app never ran']), ...firstFrameFaults({ ...after, hydrated: false }), ...handoffFaults('hydrated', since(after))]
      assert.deepEqual(later, [], `${id} after hydration: ${later.join('; ')}`)
      assert.equal(after.scrollWidth, after.innerWidth, id)
      // A wrap after the handoff. The page goes to the matrix width where the band stands
      // at its other height, and the app's observer has to publish that by itself.
      let wrapped = null
      for (const across of [390, 360]) {
        if (across === width || wrapped) continue
        await page.setViewport({ width: across, height: 844, deviceScaleFactor: 1 })
        const state = await read(across)
        if (!near(state.band.bottom, after.band.bottom)) wrapped = { width: across, ...state }
      }
      assert.ok(wrapped, `${id} the band stands ${after.band.bottom.toFixed(2)} tall at ${width}, at 390 and at 360: there was no wrap to cross`)
      const across = [...firstFrameFaults({ ...wrapped, hydrated: false }), ...handoffFaults('wrapped', since(wrapped))]
      assert.deepEqual(across, [], `${id} taken to ${wrapped.width} after hydration: ${across.join('; ')}`)
      assert.equal(wrapped.scrollWidth, wrapped.innerWidth, `${id} at ${wrapped.width}`)
      assert.deepEqual(errors, [], id)
      const watching = (state) => state.watch.watchers.filter((entry) => entry.live).map((entry) => BAND_WATCHER[entry.by])
      const brief = (state) => ({ band: state.band.bottom, published: state.published, padding: state.padding, labels: state.labels.top, divider: state.divider?.top ?? null, watching: watching(state) })
      rows.push({ id, held: brief(held), after: brief(after), wrapped: { width: wrapped.width, ...brief(wrapped), writes: wrapped.watch.writes.slice(after.watch.writes.length).map((entry) => `${entry.value} by ${BAND_WATCHER[entry.by]}`) } })
    } finally { await context.close() }
  }
  return rows
}

/** Ruling 19 on the rendered page. The ground is the first opaque background at or
 *  beneath the Moments route, and the ink is what text inherits there. Both are read
 *  against the tokens as the route resolves them, so a dark page is held to the black voices. */
async function momentsPaint(page) {
  return page.evaluate(() => {
    const main = document.querySelector('main[aria-label="Moments"]')
    if (!main) return null
    const opaque = (value) => {
      const parts = value.match(/rgba?\(([^)]+)\)/)?.[1].split(/[ ,/]+/).filter(Boolean)
      return !!parts && (parts.length < 4 || Number(parts[3]) === 1)
    }
    let ground = null
    for (let el = main; el && !ground; el = el.parentElement) {
      const color = getComputedStyle(el).backgroundColor
      if (opaque(color)) ground = color
    }
    const probe = main.appendChild(document.createElement('i'))
    const token = (name) => { probe.style.color = `var(${name})`; return getComputedStyle(probe).color }
    const pulp = token('--fb-pulp')
    const pulpInk = token('--fb-pulp-ink')
    probe.remove()
    const heading = main.querySelector('h1, h2, h3')
    return { ground, ink: getComputedStyle(main).color, heading: heading ? getComputedStyle(heading).color : null, pulp, pulpInk }
  })
}

export function momentsPaintFaults(paint) {
  if (!paint) return ['the Moments route is missing']
  const faults = []
  if (paint.ground !== paint.pulp) faults.push(`ground ${paint.ground}, expected pulp ${paint.pulp}`)
  if (paint.ink !== paint.pulpInk) faults.push(`inherited ink ${paint.ink}, expected pulp-ink ${paint.pulpInk}`)
  if (paint.heading && paint.heading !== paint.pulpInk) faults.push(`heading ink ${paint.heading}, expected pulp-ink ${paint.pulpInk}`)
  return faults
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
          const band = await assertBand(page, id, tab)
          // The strap against the first hit area, and the band's height, at every width.
          if (theme === 'light' && tab === 'fixtures') {
            measurements.push({
              app, lens, width, bandHeight: band.height,
              strapRight: Math.round(band.strap.right * 100) / 100,
              firstHit: band.controls[0].left,
              clearance: Math.round((band.controls[0].left - band.strap.right) * 100) / 100,
            })
          }
          if (width === 390 && theme === 'light' && tab === 'fixtures') {
            measurements.push({
              app, lens,
              bandHeight: band.height,
              rows: band.rows.map((row) => ({ name: row.name, h: row.h })),
              controls: band.controls.map((box) => ({
                name: box.name, w: Math.round(box.w * 10) / 10, h: Math.round(box.h * 10) / 10,
                ...(box.drawn ? { drawn: { w: Math.round(box.drawn.w * 100) / 100, h: box.drawn.h, top: box.drawn.top, bottom: box.drawn.bottom, underline: box.drawn.underline } } : {}),
              })),
            })
          }
          if (tab === 'table') assert.ok(await page.$('[data-table-picker]'), id)
          if (tab === 'moments') {
            const faults = momentsPaintFaults(await momentsPaint(page))
            assert.deepEqual(faults, [], `${id} ${faults.join('; ')}`)
          }
          if (width === 390 && tab === 'fixtures' && theme === 'light') {
            const row = await page.$('[data-fixture-id]')
            assert.ok(row, id)
            measurements.push({ app, lens, top: await row.evaluate((el) => el.getBoundingClientRect().top) })
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
    assert.ok(week?.monday, `Missing ${kind} evidence week: ${week?.missing ?? 'no pick'}`)
    for (const [app, origin] of Object.entries(origins)) {
      for (const lens of ['poster', 'ledger']) for (const theme of ['light', 'dark']) {
        for (const width of WEEK_WIDTHS) {
          const id = `${app}-week-${kind}-${lens}-${theme}-${width}`
          const { context, page, errors } = await openPage(
            browser, `${origin}/?lens=${lens}&tab=fixtures&date=${week.monday}`, theme, width,
          )
          try {
            const state = await inspect(page)
            assert.deepEqual(await page.evaluate(missingFixtureFaces), [], id)
            assertCell(state, errors, { id, lens, theme, tab: 'fixtures' })
            await assertBand(page, id, 'fixtures')
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

// The cold-load gate estimates face use on Kickoff's measured pages. It matches
// loaded FontFace descriptors to stylesheet rules. For ranged rules it also
// checks authored DOM text collected by the first family and style of the
// computed stack. It includes laid-out text at visibility:hidden or opacity:0.
//
// A preload can set FontFace.status to loaded without drawing a glyph. This
// estimate misses generated text, control values and placeholders, fallback
// families, synthesized styles and text transforms. It can overcount skipped
// content, overlapping ranges and characters drawn at a different weight.
export function textIntersectsUnicodeRange(chars, range) {
  const intervals = []
  for (const match of String(range).matchAll(/U\+([0-9A-Fa-f]+)(?:-([0-9A-Fa-f]+))?/g)) {
    const start = Number.parseInt(match[1], 16)
    const end = match[2] ? Number.parseInt(match[2], 16) : start
    intervals.push([start, end])
  }
  if (!intervals.length) return false
  for (const char of chars) {
    const code = char.codePointAt(0)
    for (const [start, end] of intervals) {
      if (code >= start && code <= end) return true
    }
  }
  return false
}

function charsForFace(text, family, style) {
  if (!text) return null
  let chars = ''
  for (const row of text) {
    const rowFamily = String(row.family).replaceAll(/['"]/g, '').trim()
    const rowStyle = String(row.style || 'normal').trim()
    if (rowFamily === family && rowStyle === style) chars += row.chars ?? ''
  }
  return chars
}

function filesForLoadedFaces(faces, loaded, text) {
  const chosen = new Set()
  for (const entry of loaded ?? []) {
    if (entry.status !== 'loaded') continue
    const family = String(entry.family).replaceAll(/['"]/g, '').trim()
    const style = String(entry.style || 'normal').trim()
    const weight = String(entry.weight).trim()
    const chars = charsForFace(text, family, style)
    for (const face of faces) {
      const faceStyle = String(face.style || 'normal').trim()
      if (face.family !== family || faceStyle !== style || String(face.weight).trim() !== weight) continue
      const range = String(face.unicodeRange || '').trim()
      if (range && (chars == null || !textIntersectsUnicodeRange(chars, range))) continue
      const file = fontFile(face.src)
      if (file) chosen.add(file)
    }
  }
  return chosen
}

/**
 * @param {{
 *   preloads: string[],
 *   faces: { family: string, style?: string, weight: string, src: string, unicodeRange?: string }[],
 *   loaded: { family: string, style?: string, weight: string, status: string }[],
 *   text?: { family: string, style?: string, chars: string }[] | null,
 * }} usage
 */
export function unusedFontPreloads(usage) {
  const { preloads, faces, loaded, text = null } = usage
  const chosen = filesForLoadedFaces(faces, loaded, text)
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
    // Navigation's networkidle0 and fonts.ready settle the cold page. Style reads
    // in the usage probe can trigger additional font requests.
    await page.evaluate(() => document.fonts.ready)
    const tally = log.tally(origin)
    const usage = await page.evaluate(() => {
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
          const unicodeRange = rule.style.getPropertyValue('unicode-range').trim()
          faces.push({ family, style, weight, src: url, unicodeRange })
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
      // Include visibility:hidden and opacity:0. Skip the hidden attribute,
      // display:none and the body of a closed details.
      const laidOut = (el) => {
        for (let node = el; node; node = node.parentElement) {
          if (node.hidden) return false
          if (getComputedStyle(node).display === 'none') return false
          if (node.tagName === 'DETAILS' && !node.open) {
            const summary = node.querySelector(':scope > summary')
            if (!summary || !summary.contains(el)) return false
          }
        }
        return true
      }
      const buckets = new Map()
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      let node = walker.nextNode()
      while (node) {
        const value = node.nodeValue ?? ''
        const el = node.parentElement
        if (value.trim() && el && laidOut(el)) {
          const computed = getComputedStyle(el)
          const textFamily = computed.fontFamily.split(',')[0].replaceAll(/["']/g, '').trim()
          const textStyle = computed.fontStyle || 'normal'
          const key = `${textFamily}\n${textStyle}`
          buckets.set(key, (buckets.get(key) ?? '') + value)
        }
        node = walker.nextNode()
      }
      const text = [...buckets.entries()].map(([key, chars]) => {
        const [textFamily, textStyle] = key.split('\n')
        return { family: textFamily, style: textStyle, chars }
      })
      return {
        preloads: [...document.querySelectorAll('link[rel="preload"][as="font"]')].map((link) => link.href),
        faces,
        loaded,
        text,
      }
    })
    const unused = unusedFontPreloads(usage)
    await context.close()
    // Apply the host guard to the probe's requests as well as the cold load.
    const { foreign } = log.tally(origin)
    if (foreign.length) throw new Error(`cold load ${app} ${tab} ${lens} ${width} asked for ${foreign.join(', ')}`)
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
      await assertBand(page, id, tab, ['Fixtures', 'Table'])
      await shoot(page, path.join(out, `${id}.png`), 390)
      cells.push({ id, theme, tab, scrollWidth: state.scrollWidth })
    } finally { await context.close() }
  }
  const { window, fixtures } = readSnapshot(root)
  const anchor = matrixAnchor(window, chooseWeeks(fixtures, window))
  for (const [name, file] of Object.entries(files)) for (const lens of ['poster', 'ledger']) {
    const id = `${name}-rows-${lens}`
    const { context, page, escaped, errors } = await openPage(browser,
      `${pathToFileURL(file).href}?lens=${lens}&date=${anchor}`, 'light', 390,
      { waitUntil: 'domcontentloaded', offline: true })
    try {
      await page.waitForSelector(`.fixture-${lens} .stadium-clock`)
      assert.deepEqual(await page.evaluate(missingFixtureFaces), [], id)
      const clock = await page.$eval('.stadium-clock', el => el.textContent)
      assert.match(clock, /\d{2}:\d{2} local|local time not known/, id)
      assert.deepEqual(escaped, [], id)
      assert.deepEqual(errors, [], id)
      cells.push({ id, clock, requests: escaped.length })
    } finally { await context.close() }
  }
  return result
}

/** `cells` is filled as cells pass, so the caller's receipt keeps them if a later cell throws. */
export async function captureHarness(browser, out, cells = [], contrasts = []) {
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
      assert.deepEqual(await page.evaluate(missingFixtureFaces), [], id)
      const longName = await page.$eval('[data-fixture-id="long-day-note"]', row => {
        const names = row.querySelector('.fixture-names')
        const node = [...names.childNodes].find(n => n.textContent.includes('Mönchengladbach'))
        const start = node.textContent.indexOf('Mönchengladbach')
        const range = document.createRange()
        range.setStart(node, start)
        range.setEnd(node, start + 'Mönchengladbach'.length)
        const boxes = [...range.getClientRects()].filter(rect => rect.width)
        const bounds = row.getBoundingClientRect()
        return boxes.length === 1 && boxes[0].left >= bounds.left && boxes[0].right <= bounds.right
          && row.scrollWidth === row.clientWidth
      })
      assert.ok(longName, `${id} split or clipped the club name beside a day note and penalties`)
      const penalties = await page.$eval('.fixture-poster[data-fixture-id="pens"]', row => {
        const score = row.querySelector('.fixture-score'), pill = row.querySelector('.fixture-status')
        const leader = row.querySelector('.fixture-leader'), clock = row.querySelector('.fixture-clock')
        return {
          score: score.innerText, word: pill.innerText,
          scoreWidth: score.getBoundingClientRect().width, pillHeight: pill.getBoundingClientRect().height,
          leaderWidth: leader.getBoundingClientRect().width, clockWidth: clock.getBoundingClientRect().width,
          fits: row.scrollWidth === row.clientWidth && score.getBoundingClientRect().right <= pill.getBoundingClientRect().left,
        }
      })
      assert.equal(penalties.score, '3–3 (2–4)', id)
      assert.equal(penalties.word, 'PENS', id)
      assert.equal(penalties.pillHeight, 16, id)
      assert.ok(penalties.fits && penalties.leaderWidth >= 12, id)
      for (const lens of ['poster', 'ledger']) {
        assert.equal(await page.$$eval(`[data-specimen-lens="${lens}"] [data-fixture-id]`, rows => rows.length), 16, id)
      }
      const shown = await shoot(page, path.join(out, `${id}.png`), width)
      contrasts.push(await measureContrast(page, id, width, shown, '[data-specimen="rows"]'))
      cells.push({ id, theme, width, scrollWidth: state.scrollWidth, penalties })
    } finally { await context.close() }
  }
  // The populated gallery. Production Vite is empty and local Next has no catalog, so
  // this is the one place the gallery's own headings and cards are painted.
  for (const theme of ['light', 'dark']) {
    const id = `harness-moments-${theme}-390`
    const { context, page, errors, status } = await openPage(
      browser, `${origin}/tests/harness/moments.html?tab=moments&theme=${theme}`, theme, 390,
      { waitUntil: 'load' },
    )
    try {
      if (status >= 400) throw new Error(`${id} HTTP ${status}`)
      await page.waitForSelector('main.moments-gallery h1', { timeout: 15_000 })
      const state = await inspect(page)
      assert.equal(state.scrollWidth, state.innerWidth, id)
      assert.equal(state.theme, theme, id)
      assert.deepEqual(errors, [], id)
      const faults = momentsPaintFaults(await momentsPaint(page))
      assert.deepEqual(faults, [], `${id} ${faults.join('; ')}`)
      await shoot(page, path.join(out, `${id}.png`), 390)
      cells.push({ id, theme, width: 390, scrollWidth: state.scrollWidth })
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

// The staleness banner at its two ages, on the rendered page. The matrix runs inside
// 24 hours, where there is no banner, so its pixels are never sampled there.
const BANNER_AGES = [
  { hours: 25, plane: 'amber', lead: 'Data may have moved.', days: 'Last synced 1 day ago' },
  { hours: 73, plane: 'alarm', lead: 'Data is stale.', days: 'Last synced 3 days ago' },
]

/** `seen` is what the page showed; `rows` are the sampler's minimums for the banner's text. */
export function bannerFaults(expected, seen, rows) {
  if (!seen) return [`no banner at ${expected.hours} hours`]
  const faults = []
  if (seen.plane !== expected.plane) faults.push(`plane ${seen.plane}, expected ${expected.plane}`)
  if (seen.lead !== expected.lead) faults.push(`lead "${seen.lead}", expected "${expected.lead}"`)
  if (!seen.text.includes(expected.days)) faults.push(`day wording missing: ${expected.days}`)
  if (seen.ground !== seen.expectedGround) faults.push(`ground ${seen.ground}, expected ${seen.expectedGround}`)
  if (!rows.length) faults.push('no banner text was sampled')
  for (const row of rows) {
    if (row.ratio < row.floor) faults.push(`${row.ink} on ${row.ground} is ${row.ratio.toFixed(2)}, under ${row.floor}`)
  }
  return faults
}

/** Amber at 25 hours and alarm at 73, on pulp (Poster) and typescript (Ledger), in both
 *  themes and both apps. The clock is the page's own, moved before any script runs; the
 *  Next server renders inside 24 hours and the browser's clock brings the banner in. */
export async function proveBanner(browser, origins, out) {
  const { lastSyncAt } = JSON.parse(readFileSync(path.join(root, 'src/data/meta.json'), 'utf8'))
  const rows = []
  for (const [app, origin] of Object.entries(origins)) for (const lens of ['poster', 'ledger']) for (const theme of ['light', 'dark']) {
    for (const age of BANNER_AGES) {
      const id = `banner-${app}-${lens}-${theme}-${age.hours}h`
      const context = await browser.createBrowserContext()
      const page = await context.newPage()
      try {
        await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 })
        await page.evaluateOnNewDocument((chosen, offset) => {
          localStorage.setItem('kickoff-theme', chosen)
          const Real = Date
          window.Date = class extends Real {
            constructor(...args) { if (args.length) super(...args); else super(Real.now() + offset) }
            static now() { return Real.now() + offset }
          }
        }, theme, Date.parse(lastSyncAt) + age.hours * 3_600_000 - Date.now())
        await page.goto(`${origin}/?lens=${lens}`, { waitUntil: 'networkidle0', timeout: 30_000 })
        await page.evaluate(() => { window.dispatchEvent(new Event('focus')); return document.fonts.ready })
        await page.waitForSelector('.staleness', { timeout: 15_000 }).catch(() => null)
        const seen = await page.evaluate((ground) => {
          const banner = document.querySelector('.staleness')
          if (!banner) return null
          const probe = banner.appendChild(document.createElement('i'))
          probe.style.color = `var(${ground})`
          const expectedGround = getComputedStyle(probe).color
          probe.remove()
          const style = getComputedStyle(banner)
          return {
            plane: banner.getAttribute('data-plane'),
            lead: banner.querySelector('b')?.textContent ?? '',
            text: banner.textContent.replace(/\s+/g, ' '),
            ink: style.color, ground: style.backgroundColor, expectedGround,
            scrollWidth: document.documentElement.scrollWidth, innerWidth,
          }
        }, lens === 'ledger' ? '--fb-typescript' : '--fb-pulp')
        const shown = seen ? await shoot(page, path.join(out, `${id}.png`), 390) : null
        const sampled = seen ? (await measureContrast(page, id, 390, shown, '.staleness')).minimums : []
        const faults = bannerFaults(age, seen, sampled)
        assert.deepEqual(faults, [], `${id} ${faults.join('; ')}`)
        assert.equal(seen.scrollWidth, seen.innerWidth, id)
        rows.push({ id, plane: seen.plane, ink: seen.ink, ground: seen.ground, pairs: sampled.map((row) => ({ ink: row.ink, ground: row.ground, ratio: Math.round(row.ratio * 100) / 100 })) })
      } finally { await context.close() }
    }
  }
  return rows
}

// The band's state transitions, read after real presses. `property duration` for every
// transition that would actually run; an element at rest under reduced motion lists none.
const CHROME_PARTS = {
  'theme disc': '.theme-disc',
  'lens thumb': '.lens-switch button span',
  'lens label': '.lens-switch button',
  'disc hit area': '.imprint-hit',
  tab: '.imprint-tabs button',
  'tab underline': '.imprint-tabs button span',
}

async function chromeTransitions(page) {
  return page.evaluate((parts) => Object.fromEntries(Object.entries(parts).map(([name, selector]) => {
    const el = document.querySelector(selector)
    if (!el) return [name, null]
    const style = getComputedStyle(el)
    const durations = style.transitionDuration.split(',').map((part) => part.trim())
    const properties = style.transitionProperty.split(',').map((part) => part.trim())
    const running = properties.map((property, i) => ({ property, duration: durations[i % durations.length] }))
      .filter((entry) => entry.property !== 'none' && Number.parseFloat(entry.duration) > 0)
      .map((entry) => `${entry.property} ${entry.duration}`)
    return [name, running]
  })), CHROME_PARTS)
}

/** Under the system's reduced-motion setting no band control may keep a transition. */
export function reducedChromeFaults(transitions) {
  return Object.entries(transitions).flatMap(([name, running]) => {
    if (running === null) return [`${name} is missing`]
    return running.length ? [`${name} still runs ${running.join(', ')}`] : []
  })
}

/** Lens, theme and a tab are pressed for real, with the system asking for reduced motion
 *  and without. Reduced: nothing transitions. Ordinary: the state budget is still there. */
export async function proveChrome(browser, origins) {
  const rows = []
  for (const [app, origin] of Object.entries(origins)) for (const reduced of [true, false]) {
    const id = `${app}-${reduced ? 'reduced' : 'ordinary'}`
    const context = await browser.createBrowserContext()
    const page = await context.newPage()
    try {
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 })
      if (reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
      await page.evaluateOnNewDocument(() => localStorage.setItem('kickoff-theme', 'light'))
      await page.goto(`${origin}/`, { waitUntil: 'networkidle0', timeout: 30_000 })
      await page.click('.lens-switch button[aria-checked="false"]')
      await page.click('.theme-toggle')
      await page.evaluate(() => [...document.querySelectorAll('.imprint-tabs button')].find((el) => el.textContent === 'Table').click())
      // The lens cross-fade class comes off after its 220 ms; read the controls' own rules.
      await new Promise((resolve) => setTimeout(resolve, 450))
      const state = await page.evaluate(() => ({
        lens: document.documentElement.dataset.lens,
        theme: document.documentElement.dataset.theme,
        tab: document.querySelector('.imprint-tabs button[aria-current="page"]')?.textContent,
      }))
      assert.deepEqual(state, { lens: 'ledger', theme: 'dark', tab: 'Table' }, `${id} the three presses`)
      const transitions = await chromeTransitions(page)
      if (reduced) {
        const faults = reducedChromeFaults(transitions)
        assert.deepEqual(faults, [], `${id} ${faults.join('; ')}`)
      } else {
        assert.ok(transitions.tab?.includes('color 0.15s'), `${id} tab ink is not 150 ms: ${transitions.tab}`)
        assert.ok(transitions['tab underline']?.includes('box-shadow 0.15s'), `${id} tab underline is not 150 ms: ${transitions['tab underline']}`)
        assert.ok(transitions['lens thumb']?.includes('background-color 0.18s'), `${id} lens thumb is not 180 ms: ${transitions['lens thumb']}`)
        assert.ok(transitions['theme disc']?.includes('background-color 0.22s'), `${id} theme disc is not 220 ms: ${transitions['theme disc']}`)
      }
      rows.push({ id, app, reduced, transitions })
    } finally { await context.close() }
  }
  return rows
}

// Hover and pressed, sampled as a reader makes them: the pointer rests on the control,
// then the button is held. A disc rests in ink; a lens or tab that is not current rests
// in muted ink. Each state is named by the band voice its ink equals.
const FEEDBACK_CONTROLS = [
  { name: 'motion', selector: '.motion-control', states: ['ink', 'pitch', 'muted'] },
  { name: 'theme', selector: '.theme-toggle', states: ['ink', 'pitch', 'muted'] },
  { name: 'inactive lens', selector: '.lens-switch button[aria-checked="false"]', states: ['muted', 'ink', 'pitch'] },
  { name: 'inactive tab', selector: '.imprint-tabs button:not([aria-current])', states: ['muted', 'ink', 'pitch'] },
]

/** `sample` is { rest, hover, held }, each { ink, ground, shadow, voices }. Ink must move
 *  to the expected voice at each step, and nothing but ink may move. */
export function feedbackFaults(control, sample) {
  const faults = []
  const steps = ['rest', 'hover', 'held']
  steps.forEach((step, i) => {
    const expected = control.states[i]
    const state = sample[step]
    const voice = Object.entries(state.voices).find(([, color]) => color === state.ink)?.[0] ?? state.ink
    if (voice !== expected) faults.push(`${control.name} ${step} ink is ${voice}, expected ${expected}`)
  })
  for (const step of ['hover', 'held']) {
    if (sample[step].ground !== sample.rest.ground) faults.push(`${control.name} ${step} repaints its ground`)
    if (sample[step].shadow !== sample.rest.shadow) faults.push(`${control.name} ${step} changes its shadow`)
  }
  return faults
}

export async function proveFeedback(browser, origins) {
  const rows = []
  const settle = () => new Promise((resolve) => setTimeout(resolve, 260))
  for (const [app, origin] of Object.entries(origins)) for (const lens of ['poster', 'ledger']) for (const theme of ['light', 'dark']) {
    const id = `${app}-${lens}-${theme}`
    const { context, page } = await openPage(browser, `${origin}/?lens=${lens}`, theme, 1000)
    try {
      for (const control of FEEDBACK_CONTROLS) {
        const read = () => page.evaluate((selector) => {
          const el = document.querySelector(selector)
          const band = el.closest('header')
          const probe = band.appendChild(document.createElement('i'))
          const voice = (name) => { probe.style.color = `var(${name})`; return getComputedStyle(probe).color }
          const voices = { ink: voice('--band-ink'), muted: voice('--band-muted'), pitch: voice('--band-pitch') }
          probe.remove()
          const style = getComputedStyle(el)
          return { ink: style.color, ground: style.backgroundColor, shadow: style.boxShadow, voices }
        }, control.selector)
        await page.mouse.move(4, 500)
        await settle()
        const rest = await read()
        const box = await (await page.$(control.selector)).boundingBox()
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
        await settle()
        const hover = await read()
        await page.mouse.down()
        await settle()
        const held = await read()
        // Leave before releasing, so the press never becomes a click.
        await page.mouse.move(4, 500)
        await page.mouse.up()
        const faults = feedbackFaults(control, { rest, hover, held })
        assert.deepEqual(faults, [], `${id} ${faults.join('; ')}`)
        rows.push({ id, control: control.name, stock: await page.evaluate(() => document.querySelector('header').dataset.stock), rest: rest.ink, hover: hover.ink, held: held.ink })
      }
      const focus = await page.evaluate(() => {
        const el = document.querySelector('.motion-control')
        el.focus({ focusVisible: true })
        const style = getComputedStyle(el)
        return { visible: el.matches(':focus-visible'), outline: `${style.outlineWidth} ${style.outlineStyle}` }
      })
      assert.deepEqual(focus, { visible: true, outline: '2px solid' }, `${id} keyboard focus ring`)
    } finally { await context.close() }
  }
  return rows
}

// The motion control's first frame. The decision has to be on <html> before the app
// runs, so the app's scripts are held at the network and the page is read while they
// wait. A decision made at the top of the app module is late, and is caught here: the
// attribute is still missing when the document has parsed and nothing has rendered.
const MOTION_SPECS = [
  { id: 'stored-on', motion: 'on', reduced: false, expect: 'on', press: 'off', stored: 'off' },
  { id: 'stored-off', motion: 'off', reduced: false, expect: 'off', press: 'on', stored: 'on' },
  // Start under reduced motion is for the visit: nothing is stored, and a reload is stopped again.
  { id: 'absent-reduced', motion: null, reduced: true, expect: 'off', press: 'on', stored: null },
  { id: 'absent-running', motion: null, reduced: false, expect: 'on', press: 'off', stored: 'off' },
]
const MOTION_ACTION = { on: 'Stop motion', off: 'Start motion' }
const MOTION_GLYPH = { on: 'pause', off: 'play' }

/** What one reading of the control has to be for a motion state. `name` is the browser's
 *  computed accessible name, when it was read. */
export function motionFaults(label, expect, seen) {
  if (!seen) return [`${label}: the motion control is missing`]
  const faults = []
  if (seen.attribute !== expect) faults.push(`${label}: data-motion is ${seen.attribute ?? 'missing'}, expected ${expect}`)
  if (seen.glyph !== MOTION_GLYPH[expect]) faults.push(`${label}: the glyph drawn is ${seen.glyph}, expected ${MOTION_GLYPH[expect]}`)
  if (seen.text !== MOTION_ACTION[expect]) faults.push(`${label}: the label shown is "${seen.text}", expected "${MOTION_ACTION[expect]}"`)
  if (seen.filled !== (expect === 'off')) faults.push(`${label}: the disc is ${seen.filled ? 'filled' : 'outlined'}, expected ${expect === 'off' ? 'filled' : 'outlined'}`)
  if ('name' in seen && seen.name !== MOTION_ACTION[expect]) faults.push(`${label}: the accessible name is "${seen.name}", expected "${MOTION_ACTION[expect]}"`)
  return faults
}

/** The server cannot know the reader's choice. Its HTML carries both actions and both
 *  theme names, the pre-paint script in the head, and no decision of its own. */
export function serverMotionFaults(html) {
  const faults = []
  const head = html.slice(0, html.indexOf('<body'))
  if (!head.includes('kickoff-motion') || !head.includes('dataset.motion')) faults.push('the head has no pre-paint motion read')
  for (const action of ['Stop motion', 'Start motion', 'Dark mode', 'Light mode']) {
    if (!html.includes(`>${action}<`)) faults.push(`the server HTML has no "${action}"`)
  }
  if (/<html[^>]*\sdata-motion=/.test(html)) faults.push('the server set data-motion itself')
  return faults
}

function readMotionControl() {
  const control = document.querySelector('.motion-control')
  if (!control) return null
  const shown = (selector) => {
    const el = control.querySelector(selector)
    return !!el && getComputedStyle(el).display !== 'none'
  }
  const pause = shown('.motion-glyph-on')
  const play = shown('.motion-glyph-off')
  const text = [...control.querySelectorAll('.imprint-name, .imprint-name *')]
    .flatMap((el) => [...el.childNodes].filter((node) => node.nodeType === 3 && el.checkVisibility()).map((node) => node.textContent))
    .join('').replace(/\s+/g, ' ').trim()
  return {
    attribute: document.documentElement.dataset.motion ?? null,
    glyph: pause && play ? 'both' : pause ? 'pause' : play ? 'play' : 'none',
    filled: getComputedStyle(control.querySelector('.motion-disc')).backgroundColor !== 'rgba(0, 0, 0, 0)',
    text,
    hydrated: Object.keys(control).some((key) => key.startsWith('__reactFiber') || key.startsWith('__reactProps')),
  }
}

/** The control as the page shows it, with the name the browser computes for it. */
async function motionControl(page) {
  const seen = await page.evaluate(readMotionControl)
  if (!seen) return null
  const handle = await page.$('.motion-control')
  const node = await page.accessibility.snapshot({ root: handle, interestingOnly: false })
  return { ...seen, name: node?.name ?? '' }
}

/** Every external script the page asks for is held until `release`. Inline scripts, the
 *  pre-paint one among them, are not requests and run as the parser meets them. */
async function holdScripts(page) {
  const held = []
  let holding = true
  await page.setRequestInterception(true)
  page.on('request', (request) => {
    if (holding && request.resourceType() === 'script') held.push(request)
    else request.continue().catch(() => {})
  })
  return {
    count: () => held.length,
    hold() { holding = true },
    async release() {
      holding = false
      await Promise.all(held.splice(0).map((request) => request.continue().catch(() => {})))
    },
  }
}

async function until(condition, what, timeout = 15_000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    if (await condition()) return
    await new Promise((resolve) => setTimeout(resolve, 25))
  }
  throw new Error(`timed out waiting for ${what}`)
}

/** One load with the app's scripts held: what the page shows before the app runs, then
 *  the control in its first frame and once the page has settled. */
async function heldLoad(page, scripts, app, navigate, label, expect) {
  scripts.hold()
  // The document being left is marked, so nothing below reads it by mistake.
  await page.evaluate(() => { window.__kickoffLeaving = true }).catch(() => {})
  const loaded = navigate()
  loaded.catch(() => {})
  await until(() => scripts.count() > 0, `${label}: the app's scripts`)
  let before
  if (app === 'next') {
    // The server's HTML is on the page and nothing has hydrated it.
    await until(() => page.evaluate(() => !window.__kickoffLeaving && !!document.querySelector('.motion-control')).catch(() => false), `${label}: the server-rendered control`)
    before = await motionControl(page)
    assert.equal(before.hydrated, false, `${label}: the control hydrated while its scripts were held`)
    const faults = motionFaults(`${label} before hydration`, expect, before)
    assert.deepEqual(faults, [], faults.join('; '))
  } else {
    // The document has parsed, the root is empty, and the decision is already made.
    await until(() => page.evaluate(() => !window.__kickoffLeaving && !!document.getElementById('root')).catch(() => false), `${label}: the parsed document`)
    before = await page.evaluate(() => ({
      attribute: document.documentElement.dataset.motion ?? null,
      rootChildren: document.getElementById('root').childElementCount,
      readyState: document.readyState,
    }))
    assert.equal(before.rootChildren, 0, `${label}: the app rendered while its module was held`)
    assert.equal(before.attribute, expect, `${label}: data-motion is ${before.attribute ?? 'missing'} with the app module held, expected ${expect}`)
  }
  await scripts.release()
  await loaded
  await page.waitForFunction(
    () => Object.keys(document.querySelector('.motion-control') ?? {}).some((key) => key.startsWith('__reactFiber')),
    { timeout: 15_000 },
  )
  const first = await page.evaluate(() => window.__kickoffFirstControl ?? null)
  if (app !== 'next') {
    const faults = motionFaults(`${label} first control`, expect, first)
    assert.deepEqual(faults, [], faults.join('; '))
  }
  await page.evaluate(() => document.fonts.ready)
  const settled = await motionControl(page)
  const faults = motionFaults(`${label} ${app === 'next' ? 'after hydration' : 'settled'}`, expect, settled)
  assert.deepEqual(faults, [], faults.join('; '))
  return { before, first, settled }
}

export async function proveMotion(browser, origins, out) {
  const cases = []
  const { fixtures } = readSnapshot(root)
  // A single kickoff makes the clock edge visible on its original slide. A later
  // eligible date in the same week gives the Rack an independently known destination.
  const days = Map.groupBy(fixtures, f => brooklynDate(f.kickoffUtc))
  const dates = [...days.keys()].filter(date => days.get(date).some(f => f.status === 'scheduled')).sort()
  const index = dates.findIndex((date, i) => {
    const day = days.get(date)
    return day.length === 1 && day[0].timeConfidence === 'exact' && dates[i + 1] &&
      startOfWeek(dates[i + 1]) === startOfWeek(date)
  })
  assert.ok(index >= 0, 'No scheduled single-match day followed by another book this week')
  const fixture = days.get(dates[index])[0]
  const nextBook = dates[index + 1]
  const kickoff = Date.parse(fixture.kickoffUtc)
  for (const [app, origin] of Object.entries(origins)) {
    let server = null
    if (app === 'next') {
      const html = await (await fetch(`${origin}/`)).text()
      const faults = serverMotionFaults(html)
      assert.deepEqual(faults, [], `next server HTML: ${faults.join('; ')}`)
      server = { bytes: html.length, bothActions: true, prePaintInHead: true, serverDecision: false }
    }
    for (const spec of MOTION_SPECS) {
      const label = `${app} ${spec.id}`
      const context = await browser.createBrowserContext()
      const page = await context.newPage()
      try {
        await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 })
        if (spec.reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
        await page.evaluateOnNewDocument((motion, read) => {
          // Seeded once for the tab: a reload has to read what the press stored.
          if (!sessionStorage.getItem('kickoff-evidence-seeded')) {
            sessionStorage.setItem('kickoff-evidence-seeded', '1')
            localStorage.setItem('kickoff-theme', 'light')
            if (motion) localStorage.setItem('kickoff-motion', motion)
          }
          // The control as it is when it first enters the document.
          const readControl = new Function(`return (${read})`)()
          const observer = new MutationObserver(() => {
            if (window.__kickoffFirstControl || !document.querySelector('.motion-control')) return
            window.__kickoffFirstControl = readControl()
            observer.disconnect()
          })
          observer.observe(document, { childList: true, subtree: true })
        }, spec.motion, readMotionControl.toString())
        const scripts = await holdScripts(page)
        const client = await page.createCDPSession()

        const load = await heldLoad(page, scripts, app, () => page.goto(`${origin}/`, { waitUntil: 'load', timeout: 30_000 }), `${label} load`, spec.expect)

        // A real press, then what the page and the store hold.
        await page.click('.motion-control')
        const pressed = await motionControl(page)
        const pressFaults = motionFaults(`${label} after the press`, spec.press, pressed)
        assert.deepEqual(pressFaults, [], pressFaults.join('; '))
        const stored = await page.evaluate(() => localStorage.getItem('kickoff-motion'))
        assert.equal(stored, spec.stored, `${label}: the store holds ${stored} after the press, expected ${spec.stored}`)

        // A reload, held the same way. An unstored Start does not survive it.
        const afterReload = spec.stored ?? (spec.reduced ? 'off' : 'on')
        // The reload goes past the renderer's memory cache: a script served from there
        // is never a request, so it could not be held.
        const reload = await heldLoad(page, scripts, app, () => {
          const done = page.waitForNavigation({ waitUntil: 'load', timeout: 30_000 })
          client.send('Page.reload', { ignoreCache: true }).catch(() => {})
          return done
        }, `${label} reload`, afterReload)

        let still = null
        let clockProof = null
        if (afterReload === 'off') {
          await page.evaluate((at, date) => {
            Date.now = () => at
            const url = new URL(location.href)
            url.searchParams.set('date', date)
            history.replaceState(null, '', url)
            window.dispatchEvent(new PopStateEvent('popstate'))
            window.dispatchEvent(new Event('focus'))
          }, kickoff - 1000, dates[index])
          const entry = '.rack-slide[data-position="center"] [data-band-fixture="' + fixture.id + '"]'
          await page.waitForSelector(entry + ' .band-clocks')
          await page.evaluate(() => document.fonts.ready)
          await page.mouse.move(4, 600)
          await new Promise((resolve) => setTimeout(resolve, 400))
          const start = performance.now()
          const first = await page.screenshot()
          await new Promise((resolve) => setTimeout(resolve, 2000))
          const second = await page.screenshot()
          still = Buffer.from(first).equals(Buffer.from(second))
          assert.equal(still, true, `${label} still`)
          const elapsed = performance.now() - start
          assert.ok(elapsed > 1000)
          assert.equal(await page.evaluate(() => Date.now()), kickoff - 1000)
          await page.evaluate(at => { Date.now = () => at; window.dispatchEvent(new Event('focus')) }, kickoff + 1000)
          // The original slide keeps the result and the resting cover follows the clock.
          const state = '[data-band-fixture="' + fixture.id + '"] .band-result'
          await page.waitForFunction(sel => document.querySelector(sel)?.textContent === 'KICKED OFF', {}, state)
          const resting = await page.evaluate(() => {
            const cover = document.querySelector('.rack-slide[data-position="center"]')
            return { date: cover.dataset.date, title: cover.querySelector('.book-title').textContent,
              marker: document.querySelector('.rack-marker[data-resting] b').textContent,
              reading: document.querySelector('.book-spine[data-reading]').dataset.date }
          })
          assert.deepEqual([resting.date, resting.reading, resting.marker], [nextBook, nextBook, resting.title], label)
          clockProof = { from: dates[index], resting, kickoff: fixture.kickoffUtc, pinned: new Date(kickoff - 1000).toISOString(), elapsedMs: Math.round(elapsed), advanced: 'KICKED OFF' }
          if (spec.id === 'stored-on') {
            writeFileSync(path.join(out, `motion-stopped-${app}-a.png`), first)
            writeFileSync(path.join(out, `motion-stopped-${app}-b.png`), second)
          }
        }
        cases.push({
          app, id: spec.id, server,
          held: app === 'next'
            ? { hydrated: load.before.hydrated, motion: load.before.attribute, glyph: load.before.glyph, name: load.before.name }
            : { rootChildren: load.before.rootChildren, motion: load.before.attribute, readyState: load.before.readyState },
          first: load.first && { motion: load.first.attribute, glyph: load.first.glyph, label: load.first.text },
          settled: { motion: load.settled.attribute, glyph: load.settled.glyph, name: load.settled.name },
          pressed: { motion: pressed.attribute, name: pressed.name, stored },
          reloaded: { motion: reload.settled.attribute, name: reload.settled.name },
          still, clockProof,
        })
      } finally { await context.close() }
    }
    console.log(`motion ${app}: ${MOTION_SPECS.length} cases passed`)
  }
  return cases
}

/** Measure the open disclosure, including its disabled action, in the actual page measure. */
export async function proveWeekControls(browser, origins, date, out, contrastCells) {
  const results = []
  for (const [app, origin] of Object.entries(origins)) for (const lens of ['poster', 'ledger']) {
    for (const theme of ['light', 'dark']) for (const width of [360, 390, 1000]) {
      const id = `filters-${app}-${lens}-${theme}-${width}`
      const { context, page, errors } = await openPage(browser, `${origin}/?lens=${lens}&date=${date}`, theme, width)
      try {
        await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }])
        const disclosure = '.filter-disclosure'
        assert.equal(await page.$eval(disclosure, el => getComputedStyle(el).transitionDuration), '0.18s', id)
        await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
        await page.click('.week-filters')
        await page.waitForSelector('.filter-disclosure[data-open="true"]')
        const metrics = await page.evaluate(() => {
          function box(el) {
            const { top, bottom, left, right, width: w, height: h } = el.getBoundingClientRect()
            return { name: el.getAttribute('aria-label') ?? el.textContent.trim(), top, bottom, left, right, w, h }
          }
          const buttons = [...document.querySelectorAll('.week-row button, .filter-panel button')].map(box)
          const toggles = [...document.querySelectorAll('.filter-toggle')]
          return {
            buttons, range: box(document.querySelector('.week-range')), week: box(document.querySelector('.week-row')),
            frameHeights: toggles.map(el => box(el.firstElementChild).h),
            panelWidth: box(document.querySelector('.filter-panel')).w,
            duration: getComputedStyle(document.querySelector('.filter-disclosure')).transitionDuration,
            outside: document.documentElement.scrollWidth !== innerWidth,
          }
        })
        assert.equal(metrics.buttons.length, 22, id)
        assert.equal(metrics.duration, '0s', id)
        assert.equal(metrics.outside, false, id)
        assert.deepEqual(hitAreaFaults(metrics.buttons), [], id)
        assert.ok(metrics.buttons.every(box => !overlaps(box, metrics.range)), id)
        assert.ok(metrics.frameHeights.every(h => near(h, 28)), id)
        assert.ok(near(metrics.week.h, 44) && near(metrics.buttons[3].right, metrics.week.right), id)
        assert.equal(metrics.panelWidth, Math.min(width - 32, 640), id)
        await page.click('.filter-toggle[aria-pressed="true"]')
        await page.waitForSelector('.filter-toggle[aria-pressed="false"]')
        const shown = await shoot(page, path.join(out, `${id}.png`), width)
        contrastCells.push(await measureContrast(page, id, width, shown, '.filter-panel'))
        results.push({ id, ...metrics })
        assert.deepEqual(errors, [], id)
      } finally { await context.close() }
    }
  }
  return results
}

export async function proveLedgerCounts(browser, origins, heavy, fixtures) {
  const selections = {
    all: COMPETITION_KEYS, three: ['pl', 'ucl', 'laliga'],
    noSupercups: COMPETITION_KEYS.filter(key => COMPETITIONS[key].group !== 'supercup'),
  }
  const [firstCupDay] = fixtures.filter(f => COMPETITIONS[f.competition].group === 'supercup')
    .map(f => brooklynDate(f.kickoffUtc)).sort()
  assert.ok(firstCupDay, 'No evidence week contains a Domestic Supercup fixture')
  const cupWeek = startOfWeek(firstCupDay)
  const cases = Object.entries(selections).map(([selection, keys]) => ({ selection, keys, week: heavy }))
  cases.push({ selection: 'cupWeek-all', keys: selections.all, week: cupWeek },
    { selection: 'cupWeek-noSupercups', keys: selections.noSupercups, week: cupWeek })
  const results = []
  for (const [app, origin] of Object.entries(origins)) for (const { selection, keys, week } of cases) {
    const id = `counts-${app}-${selection}`
    const { context, page, errors } = await openPage(browser, `${origin}/?lens=ledger&date=${week}&only=${keys.join(',')}`, 'light', 390)
    try {
      const days = await page.$$eval('[data-week-date]', elements => elements.map(el => ({
        date: el.dataset.weekDate, hidden: Number(el.dataset.hidden),
        ids: [...el.querySelectorAll('[data-fixture-id]')].map(row => row.dataset.fixtureId),
      })))
      assert.equal(days.length, 7, id)
      for (const [i, day] of days.entries()) {
        assert.equal(day.date, addDays(week, i), id)
        const snapshot = fixtures.filter(f => brooklynDate(f.kickoffUtc) === day.date)
        const listed = snapshot.filter(f => keys.includes(f.competition))
        assert.deepEqual([...day.ids].sort(), listed.map(f => f.id).sort(), id)
        assert.equal(day.ids.length + day.hidden, snapshot.length, id)
      }
      if (selection === 'cupWeek-noSupercups') assert.ok(days.some(day => day.hidden > 0), id)
      results.push({ id, week, days: days.map(({ date, ids, hidden }) => ({ date, listed: ids.length, hidden })) })
      assert.deepEqual(errors, [], id)
    } finally { await context.close() }
  }
  return results
}


// Independently group stored instants for the cover oracle. The app's selectors are
// deliberately absent here so a change to a tie, status or clock can fail this proof.
const finalLabels = { full_time: 'FT', after_extra_time: 'AET', after_penalties: 'PENS' }
const unsettled = new Set(['abandoned', 'suspended', 'postponed', 'cancelled'])
function bandOracle(day, at) {
  const timed = day.filter(f => !unsettled.has(f.status) && f.timeConfidence === 'exact')
  const groups = [...Map.groupBy(timed, f => Date.parse(f.kickoffUtc))].sort(([a], [b]) => a - b)
  const named = []
  for (const [, group] of groups) {
    if (group.length !== 1 || named.length === 3) break
    named.push(group[0])
  }
  const clock = (f, local = false) => new Intl.DateTimeFormat('en-US', {
    timeZone: local ? f.venueTz : 'America/New_York', hour: local ? '2-digit' : 'numeric', minute: '2-digit',
    ...(local ? { hourCycle: 'h23' } : { hour12: true }),
  }).format(new Date(f.kickoffUtc)).replace(/\s/g, ' ')
  const other = groups.flatMap(([, list]) => list).slice(named.length)
  const count = other.length
  const summary = count === 0 ? '' : '+ ' + count + ' more' + (other.every(f => f.status in finalLabels)
    ? (count === 1 ? ' result' : ' results') : ', from ' + clock(other[0]) + ' ET')
  const unseen = day.filter(f => !unsettled.has(f.status) && f.timeConfidence !== 'exact').length
  const unsetText = unseen ? unseen + (unseen === 1 ? ' kickoff, time' : ' kickoffs, times') + ' not yet set by the league' : ''
  const entries = named.map(f => {
    const row = { id: f.id, name: f.home.name + ' v ' + f.away.name }
    const score = f.result ? f.result.home + '–' + f.result.away + (f.shootout ? ' (' + f.shootout.home + '–' + f.shootout.away + ')' : '') + ' ' : ''
    if (finalLabels[f.status]) return { ...row, outcome: score + finalLabels[f.status] }
    if (f.status === 'in_play') return { ...row, outcome: score + (at - Date.parse(f.kickoffUtc) > 4 * 3600_000 ? 'KICKED OFF' : 'LIVE') }
    if (Date.parse(f.kickoffUtc) <= at) return { ...row, outcome: 'KICKED OFF' }
    const localDay = f.venueTz && new Intl.DateTimeFormat('en-CA', { timeZone: f.venueTz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(f.kickoffUtc))
    const nyDay = brooklynDate(f.kickoffUtc)
    const note = localDay && localDay !== nyDay ? ' (' + new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short' }).format(new Date(f.kickoffUtc)) + ', ' + (nyDay < localDay ? 'prev.' : 'next') + ' day)' : ''
    return { ...row, outcome: clock(f) + ' ET' + note + ' ' + (f.venueTz ? clock(f, true) + ' local' : 'local time not known') }
  })
  const ending = day.every(f => f.status in finalLabels) ? 'FULL TIME'
    : groups.length ? 'FIRST ' + clock(groups[0][1][0]) + ' ET' : unseen ? 'FIRST KICKOFF NOT SET' : ''
  return { entries, summary, unsetText, ending }
}

function selectBandDays(days) {
  const rules = {
    single: day => day.length === 1 && day[0].timeConfidence === 'exact',
    shared: day => bandOracle(day, 0).entries.length === 0 && bandOracle(day, 0).summary.includes('from'),
    unset: day => day.every(f => !unsettled.has(f.status) && f.timeConfidence !== 'exact'),
    closed: day => day.every(f => f.status in finalLabels),
    mixedGroup: day => new Set(day.map(f => COMPETITIONS[f.competition].group)).size > 1,
    mixedTime: day => day.some(f => f.timeConfidence === 'exact') && day.some(f => f.timeConfidence !== 'exact'),
  }
  const weeks = new Set()
  return Object.entries(rules).map(([kind, rule]) => {
    const choices = [...days].filter(([, day]) => rule(day))
    const selected = choices.find(([date]) => !weeks.has(startOfWeek(date))) ?? choices[0]
    assert.ok(selected, 'Snapshot has no band case for ' + kind)
    weeks.add(startOfWeek(selected[0]))
    return { kind, date: selected[0], fixtures: selected[1] }
  })
}

function readBand(slide) {
  return {
    entries: [...slide.querySelectorAll('.band-entry')].map(el => ({
      id: el.dataset.bandFixture, name: el.querySelector('.band-names').textContent,
      outcome: el.querySelector('.band-result, .band-clocks').textContent.trim(),
    })),
    summary: slide.querySelector('.band-summary')?.textContent ?? '',
    unsetText: slide.querySelector('.band-unset')?.textContent ?? '',
    ending: slide.querySelector('.book-date span:nth-child(3)')?.textContent.trim() ?? '',
  }
}

/** The ordinary matrix uses overlay scrollbars. Reserve a real gutter here so
 * a viewport-width bleed or a wide shelf cannot silently enlarge the document. */
export async function provePosterScrollbar(origins, week, results) {
  const browser = await puppeteer.launch({
    executablePath: chrome, headless: true, ignoreDefaultArgs: ['--hide-scrollbars'],
  })
  try {
    for (const [app, origin] of Object.entries(origins)) {
      const id = app + '-poster-classic-scrollbar'
      const { page, context, errors } = await openPage(browser, origin + '/?date=' + week, 'light', 360)
      try {
        await page.addStyleTag({ content: 'html::-webkit-scrollbar { width: 15px; height: 15px } html::-webkit-scrollbar-thumb { background: gray }' })
        const metrics = await page.evaluate(() => {
          const root = document.documentElement
          const rack = document.querySelector('.poster-rack').getBoundingClientRect()
          window.scrollTo(9999, 0)
          return { gutter: innerWidth - root.clientWidth, client: root.clientWidth, width: root.scrollWidth,
            travel: scrollX, rackLeft: rack.left, rackRight: rack.right, spines: document.querySelectorAll('.book-spine').length }
        })
        assert.equal(metrics.gutter, 15, id + ' must reserve the scrollbar')
        assert.equal(metrics.spines, 8, id + ' must include the full shelf')
        assert.deepEqual([metrics.width, metrics.travel, metrics.rackLeft, metrics.rackRight],
          [metrics.client, 0, 0, metrics.client], id)
        assert.deepEqual(errors, [], id)
        results.push({ id, ...metrics })
      } finally { await context.close() }
    }
  } finally { await browser.close() }
}

export async function provePoster(browser, origins, fixtures, out, results, contrasts) {
  const days = Map.groupBy(fixtures, f => brooklynDate(f.kickoffUtc))
  const weeks = Map.groupBy(fixtures, f => startOfWeek(brooklynDate(f.kickoffUtc)))
  const heaviest = [...weeks].sort(([, a], [, b]) => b.length - a.length)[0][0]
  const fullUefa = [...weeks].find(([monday, fs]) => fs.some(f => f.competition === 'ucl') &&
    Array.from({ length: 7 }, (_, i) => days.has(addDays(monday, i))).every(Boolean))
  assert.ok(fullUefa, 'No UEFA week with seven books')
  const heavy = fullUefa[0]
  const fullShelf = [...weeks.keys()].find(monday => Array.from({ length: 7 }, (_, i) => days.has(addDays(monday, i))).every(Boolean) && weeks.has(addDays(monday, 7)))
  assert.ok(fullShelf, 'No week with seven spines and a next volume')
  await provePosterScrollbar(origins, fullShelf, results)
  for (const [app, origin] of Object.entries(origins)) {
    for (const { kind, date, fixtures: day } of selectBandDays(days)) {
      const id = app + '-band-' + kind
      const at = Date.parse(date + 'T05:01:00Z')
      const { page, context, errors } = await openPage(browser, origin + '/?date=' + date, 'light', 390, { clock: at })
      try {
        const selector = '.rack-slide[data-date="' + date + '"]'
        const band = await page.$eval(selector, readBand)
        assert.deepEqual(band, bandOracle(day, at), id)
        if (kind === 'mixedTime') {
          assert.equal(await page.$eval(selector, el => el.dataset.position), 'center', id)
          await shoot(page, path.join(out, id + '.png'), 390)
        }
        assert.deepEqual(errors, [], id)
        results.push({ id, date, matches: day.length, ...band })
      } finally { await context.close() }
    }
    for (const width of [360, 390, 1000]) {
      const id = app + '-rack-' + width
      const { page, context, errors } = await openPage(browser, origin + '/?date=' + heavy, 'light', width, { reduced: true })
      try {
        const metrics = await page.evaluate(() => {
          const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON()
          const all = sel => [...document.querySelectorAll(sel)].map(el => el.getBoundingClientRect().toJSON())
          return { center: rect('.rack-slide[data-position="center"]'), left: rect('.rack-slide[data-position="left"]'), right: rect('.rack-slide[data-position="right"]'),
            markers: all('.rack-marker'), markerArt: rect('.rack-marker span'), opener: rect('.part-plate'), weekRow: rect('.week-row'),
            spines: all('.book-spine'), reading: rect('.book-spine[data-reading]'), shelf: rect('.book-shelf'), rows: all('.poster-part .fixture-row').map(box => box.height),
            cover: document.querySelector('.rack-slide[data-position="center"]').dataset.date,
            focusable: [...document.querySelectorAll('.rack-slide, .rack-marker, .book-spine')].some(el => el.tabIndex >= 0 || el.querySelector('button,a[href],[tabindex],input,[role]')),
          }
        })
        assert.deepEqual([metrics.center.width, metrics.center.height], width === 1000 ? [360, 450] : [width - 60, 413], id)
        if (width < 1000) assert.deepEqual([metrics.left.right, width - metrics.right.left, metrics.center.left - metrics.left.right], [22, 22, 8], id)
        else assert.ok(metrics.left.left >= 0 && metrics.right.right <= width && metrics.shelf.width === 640, id)
        assert.equal(metrics.markers.length, 8, id)
        assert.ok(metrics.markers.every((m, i) => m.width === 44 && m.height === 44 && m.y === metrics.markers[0].y && m.x === metrics.markers[0].x + 44 * i), id)
        assert.equal(metrics.markers[7].right - metrics.markers[0].left, 352, id)
        if (width === 360) assert.equal(metrics.markers[0].left, 4, id)
        assert.deepEqual([metrics.markerArt.width, metrics.markerArt.height, metrics.opener.height, metrics.weekRow.height, metrics.reading.height], [34, 22, 156, 44, 190], id)
        assert.ok(metrics.spines.every(s => s.width >= 44 && [176, 190].includes(s.height)), id)
        const widths = metrics.spines.map(spine => spine.width)
        assert.ok(Math.max(...widths) - Math.min(...widths) <= 1 / 64, id + ' equal-width spines')
        assert.ok(metrics.rows.length && metrics.rows.every(height => height >= 44), id + ' contents rows')
        assert.equal(metrics.focusable, false, id)
        const button = await page.$('.more-stories')
        const bar = await button.evaluate(el => ({ width: el.offsetWidth, full: el.parentElement.offsetWidth, h: el.offsetHeight,
          before: el.parentElement.querySelectorAll('.fixture-row').length, label: el.textContent }))
        assert.ok(bar.h >= 44 && bar.width === bar.full && bar.before === 4, id)
        await button.click()
        const after = await button.evaluate(el => ({ expanded: el.getAttribute('aria-expanded'), rows: el.parentElement.querySelectorAll('.fixture-row').length,
          duration: getComputedStyle(el.nextElementSibling).transitionDuration, label: el.textContent }))
        assert.equal(after.expanded, 'true', id)
        assert.equal(after.rows, 4 + Number(bar.label.match(/(\d+) MATCHES/)[1]), id)
        assert.equal(after.duration, '0s', id)
        if (width === 360) {
          await new Promise(r => setTimeout(r, 10000))
          assert.equal(await page.$eval('.rack-slide[data-position="center"]', el => el.dataset.date), metrics.cover, id)
        }
        assert.deepEqual(errors, [], id)
        results.push({ id, week: heavy, ...metrics, bar, after })
      } finally { await context.close() }
    }
    const hiddenWeeks = new Set([heaviest])
    if (days.has('2026-10-26')) hiddenWeeks.add('2026-10-26')
    for (const date of hiddenWeeks) for (const lens of ['poster', 'ledger']) for (const width of [360, 390]) {
      const id = [app, 'hidden', date, lens, width].join('-')
      const { page, context, errors } = await openPage(browser, origin + '/?date=' + date + '&only=&lens=' + lens, 'light', width)
      try {
        const week = await page.$eval('.' + lens + '-week', el => ({ h: el.getBoundingClientRect().height,
          days: [...el.querySelectorAll('section')].map(d => ({ line: d.textContent, h: d.getBoundingClientRect().height })) }))
        assert.ok(week.h <= (lens === 'poster' ? 510.5 : 450), id)
        if (lens === 'poster') {
          assert.ok(week.days.length && week.days.every(d => /0 MATCHES.*hidden by filters/.test(d.line) && [35.5, 52].includes(d.h)), id)
          assert.equal(await page.$$eval('.rack-slide', els => els.map(el => el.dataset.date).join()), 'register', id)
          assert.equal(await page.$('.book-spine'), null, id)
        }
        assert.deepEqual(errors, [], id)
        results.push({ id, ...week })
      } finally { await context.close() }
    }
  }
  for (const file of ['single', 'offline']) for (const theme of ['light', 'dark']) for (const width of [360, 375, 390, 1000]) {
    const id = [file, 'poster', theme, width].join('-')
    const url = pathToFileURL(path.join(root, 'dist-' + file, 'index.html')).href
    const { page, context, escaped, errors } = await openPage(browser, url + '?date=' + heavy + '&lens=poster', theme, width, { offline: true, waitUntil: 'domcontentloaded' })
    try {
      assert.equal(await page.$$eval('.rack-slide', els => els.length), 8, id)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth), true, id)
      assert.deepEqual(escaped, [], id)
      assert.deepEqual(errors, [], id)
      await shoot(page, path.join(out, id + '.png'), width)
      results.push({ id, requests: escaped.length })
    } finally { await context.close() }
  }
  await proveBookStates(browser, out, results, contrasts)
}

export async function proveBookStates(browser, out, results, contrasts) {
  const harness = process.env.KICKOFF_HARNESS_ORIGIN ?? 'http://127.0.0.1:5175'
  for (const theme of ['light', 'dark']) for (const width of [360, 390]) {
    const id = 'poster-states-' + theme + '-' + width
    const { page, context, errors } = await openPage(browser, harness + '/tests/harness/states.html?lens=poster&theme=' + theme, theme, width, { waitUntil: 'load' })
    try {
      await page.waitForSelector('[data-states-ready="true"]')
      const specimen = '[data-specimen="books"]'
      const all = await page.$$eval(specimen + ' [data-book-case]', els => Object.fromEntries(els.map(el => [el.dataset.bookCase, el.textContent])))
      assert.match(all.singular, /1 MATCH · FIRST 3:00 PM ET/)
      assert.match(all.unset, /FIRST KICKOFF NOT SET/)
      assert.doesNotMatch(all.unset, /\d:\d\d/)
      assert.match(all.mixed, /1 kickoff, time not yet set by the league/)
      assert.match(all.closed, /The Long Whistle.*FULL TIME.*2–1 FT.*2–1 AET.*3–3 \(2–4\) PENS/)
      assert.doesNotMatch(all['cannot-close'], /The Long Whistle|FULL TIME/)
      assert.match(all.live, /2–1 FT.*1–0 LIVE/)
      assert.match(all['kicked-off'], /2–1 AET.*3–3 \(2–4\) PENS.*1–0 KICKED OFF/)
      assert.equal(await page.$$eval(specimen + ' .poster-hidden', els => els.length), 7)
      assert.equal(await page.$eval(specimen + ' .more-stories', el => el.getAttribute('aria-expanded')), 'false')
      await page.setViewport({ width, height: 844, deviceScaleFactor: 1 })
      await (await page.$(specimen)).screenshot({ path: path.join(out, id + '-closed.png') })
      await page.click(specimen + ' .more-stories')
      await page.waitForSelector(specimen + ' .more-stories[aria-expanded="true"]')
      assert.equal(await page.$$eval(specimen + ' .poster-part .fixture-row', els => els.length), 8)
      await page.$eval(specimen + ' .more-rows', async panel => {
        // Opening the fold changes the document height. Sample only after the reader's
        // 180 ms expansion has finished, so both captures use the same coordinates.
        await new Promise(requestAnimationFrame)
        await Promise.all(panel.getAnimations().map(animation => animation.finished))
        await document.fonts.ready
        window.scrollTo(0, 0)
      })
      const shown = await shoot(page, path.join(out, id + '-open.png'), width)
      contrasts.push(await measureContrast(page, id, width, shown, specimen))
      assert.deepEqual(errors, [], id)
      results.push({ id, cases: Object.keys(all), closedRows: 4, openRows: 8 })
    } finally { await context.close() }
  }
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
  const tableRun = { cells: [], contrast: [] }
  const steps = { motion: null, chrome: null, feedback: null, banner: null, pins: null, focus: null, rings: null, verifiers: null, first: null, requests: null, offline: null, harness: null, tableStates: null }
  const receipt = () => {
    const contrastCells = [...matrix.contrast, ...weekRun.contrast, ...tableRun.contrast]
    return {
      origins, anchor, window, weeks, enforce,
      matrix: { cells: matrix.cells.length, legacy: matrix.legacy, measurements: matrix.measurements },
      weeksCaptured: weekRun.cells.length,
      table: tableRun.cells,
      contrast: { mode: enforce ? 'enforce' : 'report', summary: contrastSummary(contrastCells), cells: contrastCells },
      ...steps,
    }
  }
  try {
    steps.motion = await proveMotion(browser, origins, out)
    steps.poster = []
    await provePoster(browser, origins, fixtures, out, steps.poster, weekRun.contrast)
    steps.chrome = await proveChrome(browser, origins)
    steps.feedback = await proveFeedback(browser, origins)
    steps.banner = await proveBanner(browser, origins, out)
    steps.pins = await proveTablePins(browser, origins, anchor)
    steps.focus = await proveFocus(browser, origins, out)
    steps.rings = await proveRings(browser, origins)
    steps.verifiers = await proveVerifiers(browser, origins)
    steps.first = await proveFirstFrame(browser, origins)
    await runMatrix(browser, { origins, out, anchor, contrast: true }, matrix)
    assert.equal(matrix.cells.length, 96)
    await captureWeeks(browser, { origins, out, weeks, contrast: true }, weekRun)
    steps.weekControls = await proveWeekControls(browser, origins, anchor, out, weekRun.contrast)
    steps.ledgerCounts = await proveLedgerCounts(browser, origins, weeks.heavy.monday, fixtures)
    await captureTable(browser, { origins, out, contrast: true }, tableRun)
    assert.equal(tableRun.cells.length, 72)
    steps.requests = []
    await captureRequests(browser, origins, anchor, steps.requests)
    steps.offline = { sizes: {}, cells: [] }
    await captureOffline(browser, out, steps.offline)
    // The Table's cells again, on the offline and single files, from disk with the network off.
    await captureTable(browser, { out, contrast: true, files: true }, tableRun)
    assert.equal(tableRun.cells.length, 144)
    steps.harness = []
    await captureHarness(browser, out, steps.harness, weekRun.contrast)
    steps.tableStates = []
    await captureTableStates(browser, out, steps.tableStates, tableRun.contrast)
    const done = receipt()
    writeFileSync(path.join(out, 'receipt.json'), JSON.stringify(done, null, 2))
    const failing = belowFloor(done.contrast.cells)
    console.log(JSON.stringify({
      cells: matrix.cells.length,
      weeks,
      weeksCaptured: weekRun.cells.length,
      table: tableRun.cells.length,
      tableStates: steps.tableStates.length,
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
