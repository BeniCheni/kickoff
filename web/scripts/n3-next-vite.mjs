// Next production against the Vite preview at this tip. Screenshots stay outside the repo.
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const viteOrigin = process.env.KICKOFF_VITE_ORIGIN ?? 'http://127.0.0.1:5182'
const nextOrigin = process.env.KICKOFF_NEXT_ORIGIN ?? 'http://127.0.0.1:5174'
const outDir = path.resolve(process.argv[2] ?? '/tmp/kickoff-n3-next-vite')
const frozen = process.env.KICKOFF_FROZEN ?? '2026-10-15T20:00:00.000Z'
mkdirSync(outDir, { recursive: true })

const tokens = [
  '--bg', '--surface', '--surface-alt', '--text', '--text-secondary', '--text-muted',
  '--pitch', '--floodlight', '--accent', '--border', '--accent-lead', '--lens-accent',
  '--on-accent-lead', '--accent-lead-strong', '--font-sans',
]
const tabs = ['fixtures', 'table', 'moments']
const lenses = ['ledger', 'poster', 'broadcast']
const themes = ['light', 'dark']
const widths = [360, 375, 390, 1000]
const leagues = ['laliga', 'pl', 'seriea', 'ligue1', 'bundesliga', 'ucl']
const only = process.env.KICKOFF_ONLY ?? ''

function cellUrl(origin, search) {
  return origin + '/' + (search ? `?${search}` : '')
}

async function measure(browser, origin, search, theme, width, shotName) {
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
  await page.goto(cellUrl(origin, search), { waitUntil: 'networkidle0' })
  await page.evaluate(() => document.fonts.ready)
  await page.addStyleTag({ content: '.ticker-track{animation:none!important}' })
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const measured = await page.evaluate((tokenNames) => {
    const round = value => Math.round(value)
    const box = element => {
      if (!element) return null
      const rect = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      return {
        x: round(rect.x), y: round(rect.y), w: round(rect.width), h: round(rect.height),
        color: style.color, background: style.backgroundColor, font: style.font,
      }
    }
    const style = getComputedStyle(document.documentElement)
    const probe = document.createElement('div')
    document.body.appendChild(probe)
    const tokens = Object.fromEntries(tokenNames.map(name => {
      const raw = style.getPropertyValue(name).trim()
      if (name.includes('font')) {
        probe.style.fontFamily = raw
        return [name, getComputedStyle(probe).fontFamily.replace(/["']/g, '')]
      }
      probe.style.backgroundColor = raw
      return [name, getComputedStyle(probe).backgroundColor]
    }))
    probe.remove()
    const header = document.querySelector('header')
    const route = document.querySelector('[data-moments-background="route"]')
      ?? document.querySelector('main')
    const text = (route?.innerText ?? '').replace(/\s+/g, ' ').trim()
    return {
      scrollEqual: document.documentElement.scrollWidth === window.innerWidth,
      theme: document.documentElement.dataset.theme ?? '',
      lens: document.documentElement.dataset.lens ?? '',
      tokens,
      header: box(header),
      nav: box(document.querySelector('nav[aria-label="Primary"]')),
      themeButton: box(header?.querySelector('button') ?? null),
      route: box(route),
      routeText: text.slice(0, 2500),
      activeTab: document.querySelector('nav[aria-label="Primary"] button[aria-current="page"]')?.textContent ?? '',
      ticker: document.querySelector('[data-ticker]')?.getAttribute('data-ticker') ?? '',
      privacy: document.body.innerText.includes('Privacy'),
    }
  }, tokens)
  const button = await page.$('header button')
  const ax = button ? await page.accessibility.snapshot({ root: button }) : null
  measured.themeName = ax?.name ?? ''
  measured.captureUrl = page.url()
  const shot = await page.screenshot({ type: 'png' })
  writeFileSync(path.join(outDir, shotName), shot)
  measured.sha256 = createHash('sha256').update(shot).digest('hex')
  const logsNow = logs.filter(line => !/favicon/i.test(line))
  measured.logs = logsNow
  measured.hydration = logsNow.some(line => /hydration|did not match|didn't match/i.test(line))
  const other = measured.activeTab === 'Table' ? 'Fixtures' : 'Table'
  await page.evaluate(label => {
    const button = [...document.querySelectorAll('nav[aria-label="Primary"] button')].find(element => element.textContent === label)
    if (!button) throw new Error(`missing tab ${label}`)
    button.click()
  }, other)
  await page.waitForFunction(label => document.querySelector('nav[aria-label="Primary"] button[aria-current="page"]')?.textContent === label, {}, other)
  const pushed = await page.evaluate(() => location.pathname + location.search + location.hash)
  await page.goBack({ waitUntil: 'networkidle0' })
  await page.waitForFunction(label => document.querySelector('nav[aria-label="Primary"] button[aria-current="page"]')?.textContent === label, {}, measured.activeTab)
  const backed = await page.evaluate(() => location.pathname + location.search + location.hash)
  await page.goForward({ waitUntil: 'networkidle0' })
  await page.waitForFunction(label => document.querySelector('nav[aria-label="Primary"] button[aria-current="page"]')?.textContent === label, {}, other)
  const forwarded = await page.evaluate(() => location.pathname + location.search + location.hash)
  measured.history = { pushed, backed, forwarded }
  await context.close()
  return measured
}

function diffMeasured(vite, next, moments) {
  const keys = ['scrollEqual', 'theme', 'lens', 'tokens', 'header', 'nav', 'themeButton', 'themeName', 'privacy', 'history']
  if (!moments) keys.push('route', 'routeText', 'activeTab', 'ticker')
  return keys.filter(key => JSON.stringify(vite[key]) !== JSON.stringify(next[key]))
}

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--disable-gpu'] })
const rows = []
try {
  for (const tab of tabs) for (const lens of lenses) for (const theme of themes) for (const width of widths) {
    const params = new URLSearchParams()
    if (tab !== 'fixtures') params.set('tab', tab)
    if (lens !== 'poster') params.set('lens', lens)
    const search = params.toString()
    const id = `${tab}-${lens}-${theme}-${width}`
    if (only && id !== only) continue
    const vite = await measure(browser, viteOrigin, search, theme, width, `vite-${id}.png`)
    const next = await measure(browser, nextOrigin, search, theme, width, `next-${id}.png`)
    const diffs = diffMeasured(vite, next, tab === 'moments')
    if (vite.logs.length || next.logs.length || vite.hydration || next.hydration) diffs.push('console')
    rows.push({ id, kind: 'matrix', diffs, viteLogs: vite.logs, nextLogs: next.logs, vite: { sha256: vite.sha256, captureUrl: vite.captureUrl }, next: { sha256: next.sha256, captureUrl: next.captureUrl } })
    if (diffs.includes('tokens')) {
      const delta = Object.keys(vite.tokens).filter(key => vite.tokens[key] !== next.tokens[key])
        .map(key => `${key} vite=${JSON.stringify(vite.tokens[key])} next=${JSON.stringify(next.tokens[key])}`)
      console.error('TOKENS', id, delta.join(' | '))
    }
    console.log(diffs.length ? `DIFF ${id} ${diffs.join(',')}` : `OK ${id}`)
  }

  const extras = [
    ['month', 'view=month', 'light', 390],
    ['only-pl', 'only=pl', 'light', 390],
    ['pinned-date', 'date=2026-09-20', 'light', 390],
    ['empty-only', 'only=', 'dark', 390],
    ['tbc-week', 'date=2026-11-22&only=laliga', 'light', 390],
    ['abandoned-week', 'date=2026-10-10&only=laliga', 'light', 390],
    ...leagues.map(league => [`league-${league}`, `tab=table&league=${league}`, 'light', 390]),
    ['ticker', 'lens=broadcast', 'dark', 390],
  ]
  for (const [id, search, theme, width] of only ? [] : extras) {
    const vite = await measure(browser, viteOrigin, search, theme, width, `vite-extra-${id}.png`)
    const next = await measure(browser, nextOrigin, search, theme, width, `next-extra-${id}.png`)
    const diffs = diffMeasured(vite, next, false)
    if (vite.logs.length || next.logs.length || vite.hydration || next.hydration) diffs.push('console')
    const expectText = []
    if (id === 'tbc-week') expectText.push('not yet set')
    if (id === 'abandoned-week') expectText.push('ABANDONED')
    if (id === 'ticker' && (vite.ticker === '' || next.ticker === '')) diffs.push('ticker')
    rows.push({
      id, kind: 'extra', search, diffs,
      viteHas: expectText.filter(piece => vite.routeText.includes(piece) || piece === 'data-ticker'),
      nextHas: expectText.filter(piece => next.routeText.includes(piece)),
      viteLogs: vite.logs, nextLogs: next.logs,
      vite: { sha256: vite.sha256, captureUrl: vite.captureUrl, routeStart: vite.routeText.slice(0, 180) },
      next: { sha256: next.sha256, captureUrl: next.captureUrl, routeStart: next.routeText.slice(0, 180) },
    })
    console.log(diffs.length ? `DIFF extra ${id} ${diffs.join(',')}` : `OK extra ${id}`)
  }
} finally {
  await browser.close()
}

const summary = {
  compares: `Next production at ${nextOrigin} against Vite preview at ${viteOrigin}. 72 cells (3 tabs × 3 lenses × 2 themes × 360, 375, 390, 1000) plus month, one competition filter, a pinned date, an empty competition set, a TBC week, an abandoned week, every league table, and the Broadcast ticker. Date frozen at ${frozen}. Both theme keys stubbed. Viewport set before navigation. Ticker animation paused. PNGs captured at the cell route. Moments compares the shell only; its body stays the N2 empty state on Next. Compared: scrollWidth === innerWidth, computed tokens, header nav and theme-button geometry rounded to the pixel, theme accessible name, route text, and console or hydration warnings.`,
  frozenUtc: frozen,
  cells: rows.length,
  differing: rows.filter(row => row.diffs.length).map(row => ({ id: row.id, diffs: row.diffs, viteLogs: row.viteLogs, nextLogs: row.nextLogs })),
  rows,
}
writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2))
console.log(JSON.stringify({ cells: rows.length, differing: summary.differing.map(row => row.id) }, null, 2))
