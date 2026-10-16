// Vite at the merge base against Vite at this tip. Screenshots stay outside the repo.
// Never binds 5173: that port is Step 0's Vite dev server.
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const baseOrigin = process.env.KICKOFF_BASE_ORIGIN ?? 'http://127.0.0.1:5181'
const tipOrigin = process.env.KICKOFF_TIP_ORIGIN ?? 'http://127.0.0.1:5182'
const outDir = path.resolve(process.argv[2] ?? '/tmp/kickoff-n2-vite-before-after')
const baseSha = process.env.KICKOFF_BASE_SHA ?? '02650bc'
const tipSha = process.env.KICKOFF_TIP_SHA ?? 'unknown'
mkdirSync(outDir, { recursive: true })

const tabs = ['fixtures', 'table', 'moments']
const lenses = ['ledger', 'poster', 'broadcast']
const themes = ['light', 'dark']
const widths = [360, 375, 390, 1000]
const only = new Set((process.env.KICKOFF_ONLY ?? '').split(',').filter(Boolean))
const frozen = '2026-10-15T20:00:00.000Z'
const tokens = [
  '--bg', '--surface', '--surface-alt', '--text', '--text-secondary', '--text-muted',
  '--pitch', '--floodlight', '--accent', '--border', '--accent-lead', '--lens-accent',
  '--on-accent-lead', '--accent-lead-strong', '--font-sans',
]

function cellUrl(origin, tab, lens) {
  const params = new URLSearchParams()
  if (tab !== 'fixtures') params.set('tab', tab)
  if (lens !== 'poster') params.set('lens', lens)
  const query = params.toString()
  return origin + '/' + (query ? `?${query}` : '')
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

async function measure(browser, origin, tab, lens, theme, width, shotName) {
  const context = await browser.createBrowserContext()
  const page = await context.newPage()
  const logs = []
  page.on('console', message => {
    if (message.type() === 'warning' || message.type() === 'error') logs.push(message.text())
  })
  page.on('pageerror', error => logs.push(String(error)))
  await page.evaluateOnNewDocument((iso, themeName) => {
    const fixed = Date.parse(iso)
    const Real = Date
    function Frozen(...args) { return args.length ? new Real(...args) : new Real(fixed) }
    Frozen.now = () => fixed
    Frozen.parse = Real.parse
    Frozen.UTC = Real.UTC
    Object.setPrototypeOf(Frozen, Real)
    window.Date = Frozen
    const memory = new Map([
      ['kickoff-theme', themeName],
      ['kickoff-theme-broadcast', themeName],
    ])
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: key => memory.has(key) ? memory.get(key) : null,
        setItem: (key, value) => memory.set(key, String(value)),
        removeItem: key => memory.delete(key),
        clear: () => memory.clear(),
        key: () => null,
        length: 0,
      },
    })
  }, frozen, theme)
  await page.setViewport({ width, height: 900, deviceScaleFactor: 1 })
  await page.goto(cellUrl(origin, tab, lens), { waitUntil: 'networkidle0' })
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const measured = await page.evaluate((tokenNames) => {
    const round = value => Math.round(value * 10) / 10
    const boxes = root => {
      if (!root) return []
      return [root, ...root.querySelectorAll('*')].slice(0, 600).map(element => {
        const rect = element.getBoundingClientRect()
        const className = typeof element.className === 'string' ? element.className : ''
        return {
          tag: element.tagName,
          className: className.slice(0, 80),
          ticker: element.closest('.ticker-track, .ticker') !== null,
          x: round(rect.x), y: round(rect.y), w: round(rect.width), h: round(rect.height),
        }
      })
    }
    const style = getComputedStyle(document.documentElement)
    const body = getComputedStyle(document.body)
    const header = document.querySelector('header')
    const nav = document.querySelector('nav[aria-label="Primary"]')
    const main = document.querySelector('main') ?? document.querySelector('[data-moments-background="route"]')
    return {
      scrollEqual: document.documentElement.scrollWidth === window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      theme: document.documentElement.dataset.theme ?? '',
      lens: document.documentElement.dataset.lens ?? '',
      tokens: Object.fromEntries(tokenNames.map(name => [name, style.getPropertyValue(name).trim()])),
      bodyColor: body.color,
      bodyFont: body.fontFamily,
      headerText: (header?.innerText ?? '').replace(/\s+/g, ' ').trim(),
      mainText: (main?.innerText ?? '').replace(/\s+/g, ' ').trim().slice(0, 400),
      headerBoxes: boxes(header),
      navBoxes: boxes(nav),
      mainBoxes: boxes(main),
      activeTab: document.querySelector('nav[aria-label="Primary"] button[aria-current="page"]')?.textContent ?? '',
    }
  }, tokens)
  const button = await page.$('header button')
  const ax = button ? await page.accessibility.snapshot({ root: button }) : null
  measured.themeName = ax?.name ?? ''
  await page.evaluate(() => { document.body.setAttribute('tabindex', '-1'); document.body.focus() })
  const focus = []
  for (let step = 0; step < 14; step += 1) {
    await page.keyboard.press('Tab')
    focus.push(await page.evaluate(() => {
      const element = document.activeElement
      if (!element) return ''
      const name = (element.innerText || element.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 40)
      return `${element.tagName}:${name}`
    }))
  }
  measured.focus = focus
  measured.captureUrl = page.url()
  const shot = await page.screenshot({ type: 'png' })
  writeFileSync(path.join(outDir, shotName), shot)
  measured.sha256 = createHash('sha256').update(shot).digest('hex')
  const other = tab === 'table' ? 'Fixtures' : 'Table'
  await page.evaluate(label => {
    const button = [...document.querySelectorAll('nav[aria-label="Primary"] button')].find(element => element.textContent === label)
    if (!button) throw new Error(`missing tab ${label}`)
    button.click()
  }, other)
  await page.waitForFunction(label => document.querySelector('nav[aria-label="Primary"] button[aria-current="page"]')?.textContent === label, {}, other)
  const pushed = await page.evaluate(() => ({
    url: location.pathname + location.search + location.hash,
    tab: document.querySelector('nav[aria-label="Primary"] button[aria-current="page"]')?.textContent ?? '',
  }))
  await page.goBack({ waitUntil: 'networkidle0' })
  await page.waitForFunction(label => document.querySelector('nav[aria-label="Primary"] button[aria-current="page"]')?.textContent === label, {}, measured.activeTab)
  const backed = await page.evaluate(() => ({
    url: location.pathname + location.search + location.hash,
    tab: document.querySelector('nav[aria-label="Primary"] button[aria-current="page"]')?.textContent ?? '',
  }))
  await page.goForward({ waitUntil: 'networkidle0' })
  await page.waitForFunction(label => document.querySelector('nav[aria-label="Primary"] button[aria-current="page"]')?.textContent === label, {}, other)
  const forwarded = await page.evaluate(() => ({
    url: location.pathname + location.search + location.hash,
    tab: document.querySelector('nav[aria-label="Primary"] button[aria-current="page"]')?.textContent ?? '',
  }))
  measured.history = { pushed, backed, forwarded }
  measured.logs = logs
  await context.close()
  return measured
}

function boxDiffs(left, right) {
  const rows = []
  const count = Math.max(left.length, right.length)
  for (let index = 0; index < count && rows.length < 6; index += 1) {
    if (!same(left[index], right[index])) rows.push({ index, left: left[index] ?? null, right: right[index] ?? null })
  }
  return rows
}

function diffKeys(left, right) {
  const keys = ['scrollEqual', 'theme', 'lens', 'tokens', 'bodyColor', 'bodyFont', 'headerText', 'mainText', 'themeName', 'focus', 'history', 'logs']
  const diffs = keys.filter(key => !same(left[key], right[key]))
  for (const key of ['headerBoxes', 'navBoxes', 'mainBoxes']) {
    if (!same(left[key], right[key])) diffs.push(key)
  }
  return diffs
}

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--disable-gpu'] })
const rows = []
try {
  for (const tab of tabs) for (const lens of lenses) for (const theme of themes) for (const width of widths) {
    const id = `${tab}-${lens}-${theme}-${width}`
    if (only.size && !only.has(id)) continue
    const base = await measure(browser, baseOrigin, tab, lens, theme, width, `base-${id}.png`)
    const tip = await measure(browser, tipOrigin, tab, lens, theme, width, `tip-${id}.png`)
    const diffs = diffKeys(base, tip)
    const samples = {}
    for (const key of ['headerBoxes', 'navBoxes', 'mainBoxes']) {
      if (diffs.includes(key)) samples[key] = boxDiffs(base[key], tip[key])
    }
    rows.push({ id, diffs, samples, base, tip })
    if (diffs.length) console.error('DIFF', id, diffs.join(','), JSON.stringify(samples))
    else console.log('OK', id)
  }
} finally {
  await browser.close()
}

const differing = rows.filter(row => row.diffs.length)
const summary = {
  compares: `Vite preview of the merge-base dist at ${baseSha} (${baseOrigin}) against Vite preview of this tip's dist at ${tipSha} (${tipOrigin}). 72 cells: 3 tabs × 3 lenses × 2 themes × 360, 375, 390 and 1000. Date frozen at ${frozen}. Both theme keys stubbed. Viewport set before each navigation. Each PNG is captured at the cell's own route, before the history exercise, and the receipt records that capture URL. Compared: scrollWidth === innerWidth, 15 computed tokens on html, body color and font, geometry of the header, tab row and route (up to 600 boxes each), header and route text, the theme button's accessible name, a 14-step Tab focus order, and the URL plus active tab after a tab push, Back and Forward.`,
  base: baseSha,
  tip: tipSha,
  frozenUtc: frozen,
  cells: rows.length,
  differing: differing.map(row => ({ id: row.id, diffs: row.diffs })),
  pngDirectory: outDir,
  pngs: rows.flatMap(row => ['base', 'tip'].map(name => ({
    file: `${name}-${row.id}.png`,
    sha256: row[name].sha256,
    captureUrl: row[name].captureUrl,
  }))),
}
writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2))
console.log(JSON.stringify({ cells: summary.cells, differing: summary.differing }, null, 2))
