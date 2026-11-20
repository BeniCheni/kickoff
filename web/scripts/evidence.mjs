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
  for (const [app, origin] of Object.entries(origins)) for (const league of ['ucl', 'pl']) for (const width of [360, 390, 1000]) {
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
  // thing pinned. A fixture row is scrolled to 20px from the top of the page, then focused.
  for (const [app, origin] of Object.entries(origins)) for (const width of [360, 1000]) {
    const id = `reveal-${app}-${width}`
    const { context, page, errors } = await openPage(browser, `${origin}/?lens=ledger${anchor ? `&date=${anchor}` : ''}`, 'light', width)
    try {
      const reveal = await page.evaluate(() => {
        const all = [...document.querySelectorAll('button[aria-expanded]')]
        const row = all[Math.min(all.length - 1, 12)]
        if (!row) return null
        window.scrollTo(0, row.getBoundingClientRect().top + window.scrollY - 20)
        const before = row.getBoundingClientRect().top
        row.focus()
        const rect = row.getBoundingClientRect()
        const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
        return {
          text: row.textContent.replace(/\s+/g, ' ').trim().slice(0, 40), before, top: rect.top,
          band: document.querySelector('header.imprint-band').getBoundingClientRect().bottom,
          topmost: hit === row || row.contains(hit) ? 'itself' : hit?.closest('header') ? 'the band' : 'another element',
        }
      })
      assert.ok(reveal, `${id} found no fixture row to focus`)
      assert.ok(reveal.before < reveal.band, `${id} the row was not behind the band before it took focus`)
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
const FOCUS_RING = 3 // inside the 2px line a ring draws 2px off its control

// The desktop table's controls, by the name each carries: the nine labels in its pinned
// row, each a button a keyboard stops on. Six of them sort; W, D and L do nothing.
export const DESKTOP_TABLE_CONTROLS = ['Pl', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts', 'PPG']

/**
 * What one Tab press left on the page. The control has to be the one the press was meant
 * for, show its ring, and have no sample point under anything pinned. `ringUnder` is read
 * only for a standings row, which runs the full width of the page: its ring shows above
 * and below it and nowhere else, so the upper edge has to clear the stack too.
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
  const ring = Object.keys(seen.ringUnder ?? {})
  if (ring.length) faults.push(`the focus ring above ${what} is under ${ring.join(' and ')}`)
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
 * @param {{ owed: number }[]} seen  each press, by its target's place in `controls`, or -1
 * @param {{
 *   within: string,
 *   rows: string[],
 *   controls: { name: string, row: number, reachable: boolean }[],
 *   clubs?: { id: string, name: string }[] | null,
 *   named?: string[] | null,
 * }} expected
 */
export function sweepFaults(seen, { within, rows, controls, clubs = null, named = null }) {
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
  }
  // Owed by a club, by a name or by neither: every control a keyboard can reach in the table.
  const pressed = new Set(seen.map((control) => control.owed))
  const missed = reachable.filter((control) => !pressed.has(control.place)).map((control) => `"${control.name}"`)
  if (missed.length) faults.push(`${missed.length} of the table’s ${reachable.length} controls ${missed.length === 1 ? 'was' : 'were'} never the target of a press: ${first(missed)}`)
  return faults
}

/** Every control a Tab press can reach inside `within`, each placed by `place` first:
 *  { y } is its top in the viewport, { underFoot } that many pixels under the band's foot.
 *  `table` is the shown table as sweepFaults reads it: the club id on each of its rows,
 *  and each of its controls with the row it sits in and whether a keyboard can reach it. */
async function sweepFocus(page, place, { within = '.page-measure', layout }) {
  const found = await page.evaluate((scope, shown) => {
    const reachable = (el) => el.tabIndex >= 0 && !el.disabled && !el.closest('[inert]')
      && el.checkVisibility({ visibilityProperty: true }) && el.getClientRects().length > 0
    const every = [...document.querySelectorAll('a[href], button, input, select, textarea, summary, iframe, [tabindex], [contenteditable]')]
    const list = every.filter(reachable)
    // Not through `scope`: the table is owed its presses whether or not the wrapper is there.
    const table = every.filter((el) => el.closest(`[data-table="${shown}"]`))
    const rows = [...document.querySelectorAll(`[data-table="${shown}"] [data-table-row]`)]
    const name = (el) => (el.getAttribute('aria-label') || el.textContent || el.tagName).replace(/\s+/g, ' ').trim().slice(0, 48)
    window.__kickoffFocus = { list, table, targets: list.map((_, i) => i).filter((i) => i > 0 && list[i].closest(scope)) }
    return {
      targets: window.__kickoffFocus.targets.length,
      rows: rows.map((row) => row.getAttribute('data-table-row')),
      // A control's row is the nearest one around it, by its place among `rows`, or -1.
      controls: table.map((el) => ({ name: name(el), row: rows.indexOf(el.closest('[data-table-row]')), reachable: reachable(el) })),
    }
  }, within, layout)
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
    seen.push({ ...placed, ...(await page.evaluate((index, ring) => {
      const { list, table, targets: chosen } = window.__kickoffFocus
      const target = list[chosen[index]]
      const active = document.activeElement
      const name = (el) => (el?.getAttribute?.('aria-label') || el?.textContent || el?.tagName || 'nothing').replace(/\s+/g, ' ').trim().slice(0, 48)
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
      const tally = (points) => points.reduce((under, [x, y]) => {
        const by = pinned(x, y)
        if (by) under[by] = (under[by] ?? 0) + 1
        return under
      }, {})
      const across = [0.1, 0.3, 0.5, 0.7, 0.9].map((fx) => rect.left + rect.width * fx)
      const body = across.flatMap((x) => [0.1, 0.5, 0.9].map((fy) => [x, rect.top + rect.height * fy]))
      const row = !!target.parentElement?.hasAttribute('data-table-row')
      return {
        text: name(target), active: name(active), landed: active === target, row,
        // The control's place among the table's controls, or -1: a press is counted by its target.
        owed: table.indexOf(target),
        focusVisible: target.matches(':focus-visible'), top: rect.top, bottom: rect.bottom,
        points: body.length, under: tally(body),
        ...(row ? { ringUnder: tally(across.map((x) => [x, rect.top - ring])) } : {}),
      }
    }, n, FOCUS_RING)) })
  }
  return { seen, table: { rows: found.rows, controls: found.controls } }
}

/** The Table in both apps, and both files from disk, at every width of the matrix. Each
 *  control is placed twice: one pixel under the band's foot, where the labels and a
 *  divider cover a row, and 20px from the top of the page, behind the band itself. Each
 *  placement is held to sweepFaults first, so a cell that pressed nothing cannot pass. */
export async function proveFocus(browser, origins, out) {
  const standings = JSON.parse(readFileSync(path.join(root, 'src/data/standings.json'), 'utf8')).leagues
  const files = { offline: path.join(root, 'dist-offline/index.html'), single: path.join(root, 'dist-single/index.html') }
  const shells = [
    ...Object.entries(origins).map(([app, origin]) => ({ app, url: (league) => `${origin}/?tab=table&league=${league}`, leagues: ['ucl', 'pl'], open: {} })),
    ...Object.entries(files).map(([app, file]) => ({ app, url: (league) => `${pathToFileURL(file).href}?tab=table&league=${league}`, leagues: ['ucl'], open: { waitUntil: 'domcontentloaded', offline: true } })),
  ]
  const places = [{ name: 'under the band’s foot', underFoot: 1.06 }, { name: 'behind the band', y: 20 }]
  const rows = []
  for (const shell of shells) for (const league of shell.leagues) for (const width of [360, 375, 390, 1000]) {
    const id = `focus-${shell.app}-${league}-${width}`
    const { context, page, errors } = await openPage(browser, shell.url(league), 'light', width, shell.open)
    try {
      await page.waitForSelector('[data-table-picker]', { timeout: 15_000 })
      const layout = width >= 768 ? 'desktop' : 'mobile'
      // A club's row is a control on the phone: each club in the committed standings is
      // owed its own, matched by the id the row carries. The desktop rows hold none and
      // the table is owed its labels by name; a row control arriving there is owed a press too.
      const clubs = layout === 'mobile' ? standings[league].map((club) => ({ id: club.teamId, name: club.name })) : null
      const named = layout === 'desktop' ? DESKTOP_TABLE_CONTROLS : null
      const row = { id, controls: 0, tableControls: 0, rowControls: 0, tableRows: 0, clubs: clubs?.length ?? null, named, pressed: 0, moved: 0 }
      for (const place of places) {
        const within = '.page-measure'
        const { seen, table } = await sweepFocus(page, place, { within, layout })
        const faults = [...sweepFaults(seen, { within, ...table, clubs, named }), ...seen.flatMap(focusFaults)]
        assert.deepEqual(faults, [], `${id} ${place.name}: ${faults.join('; ')}`)
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
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth), true, id)
      assert.deepEqual(errors, [], id)
      rows.push(row)
    } finally { await context.close() }
  }
  return rows
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
      const loaded = page.goto(`${origins.next}/?tab=table&league=ucl`, { waitUntil: 'load', timeout: 30_000 })
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
        if (afterReload === 'off') {
          await page.mouse.move(4, 600)
          await new Promise((resolve) => setTimeout(resolve, 400))
          const first = await page.screenshot()
          await new Promise((resolve) => setTimeout(resolve, 2000))
          const second = await page.screenshot()
          still = Buffer.from(first).equals(Buffer.from(second))
          assert.equal(still, true, `${label} still`)
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
          still,
        })
      } finally { await context.close() }
    }
    console.log(`motion ${app}: ${MOTION_SPECS.length} cases passed`)
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
  const steps = { motion: null, chrome: null, feedback: null, banner: null, pins: null, focus: null, first: null, requests: null, offline: null, harness: null }
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
    steps.motion = await proveMotion(browser, origins, out)
    steps.chrome = await proveChrome(browser, origins)
    steps.feedback = await proveFeedback(browser, origins)
    steps.banner = await proveBanner(browser, origins, out)
    steps.pins = await proveTablePins(browser, origins, anchor)
    steps.focus = await proveFocus(browser, origins, out)
    steps.first = await proveFirstFrame(browser, origins)
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
