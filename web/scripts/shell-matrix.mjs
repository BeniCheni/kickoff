// Shell parity matrix. Screenshots stay outside the repo.
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const vite = process.env.KICKOFF_VITE_ORIGIN ?? 'http://127.0.0.1:5173'
const next = process.env.KICKOFF_NEXT_ORIGIN ?? 'http://127.0.0.1:5174'
const outDir = path.resolve(process.argv[2] ?? '/tmp/kickoff-n2-matrix')
mkdirSync(outDir, { recursive: true })

const tabs = ['fixtures', 'table', 'moments']
const lenses = ['ledger', 'poster', 'broadcast']
const themes = ['light', 'dark']
const widths = [360, 375, 390, 1000]
const frozen = '2026-10-15T20:00:00.000Z'

function cellUrl(origin, tab, lens) {
  const params = new URLSearchParams()
  if (tab !== 'fixtures') params.set('tab', tab)
  if (lens !== 'poster') params.set('lens', lens)
  const q = params.toString()
  return origin + '/' + (q ? `?${q}` : '')
}

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--disable-gpu'] })
const rows = []
try {
  for (const tab of tabs) for (const lens of lenses) for (const theme of themes) for (const width of widths) {
    const id = `${tab}-${lens}-${theme}-${width}`
    const pair = {}
    for (const [name, origin] of [['vite', vite], ['next', next]]) {
      const context = await browser.createBrowserContext()
      const page = await context.newPage()
      const logs = []
      page.on('console', message => { if (message.type() === 'warning' || message.type() === 'error') logs.push(message.text()) })
      page.on('pageerror', error => logs.push(String(error)))
      await page.evaluateOnNewDocument((iso, themeName, lensName) => {
        const fixed = Date.parse(iso)
        const Real = Date
        function Frozen(...args) { return args.length ? new Real(...args) : new Real(fixed) }
        Frozen.now = () => fixed
        Frozen.parse = Real.parse
        Frozen.UTC = Real.UTC
        Object.setPrototypeOf(Frozen, Real)
        window.Date = Frozen
        const store = { 'kickoff-theme': themeName, 'kickoff-theme-broadcast': themeName }
        const memory = new Map(Object.entries(store))
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
        void lensName
      }, frozen, theme, lens)
      await page.setViewport({ width, height: 800, deviceScaleFactor: 1 })
      await page.goto(cellUrl(origin, tab, lens), { waitUntil: 'networkidle0' })
      await page.evaluate(() => document.fonts.ready)
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      const measured = await page.evaluate(() => {
        const box = element => {
          if (!element) return null
          const rect = element.getBoundingClientRect()
          const style = getComputedStyle(element)
          return {
            x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height),
            color: style.color, background: style.backgroundColor, fontSize: style.fontSize, fontFamily: style.fontFamily,
          }
        }
        const header = document.querySelector('header')
        const button = header?.querySelector('button') ?? null
        return {
          scrollEqual: document.documentElement.scrollWidth === window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          theme: document.documentElement.dataset.theme ?? '',
          lens: document.documentElement.dataset.lens ?? '',
          header: box(header),
          wordmark: box(header?.querySelector('span')),
          nav: box(document.querySelector('nav[aria-label="Primary"]')),
          lensBox: box(document.querySelector('[role="radiogroup"]')),
          themeButton: box(button),
          themeLabel: button ? (button.innerText || '').replace(/\s+/g, ' ').trim() : '',
          banner: document.body.innerText.includes('Data may have moved') || document.body.innerText.includes('Data is stale'),
          moments: document.querySelector('main[aria-label="Moments"]')?.innerText ?? null,
          placeholder: document.body.innerText.includes('Not ported yet (N3)'),
        }
      })
      const shot = await page.screenshot({ type: 'png' })
      const file = path.join(outDir, `${name}-${id}.png`)
      writeFileSync(file, shot)
      pair[name] = { ...measured, logs, sha256: createHash('sha256').update(shot).digest('hex') }
      await context.close()
    }
    const keys = ['scrollEqual', 'theme', 'lens', 'header', 'wordmark', 'nav', 'lensBox', 'themeButton', 'themeLabel', 'banner']
    const diffs = []
    for (const key of keys) {
      if (JSON.stringify(pair.vite[key]) !== JSON.stringify(pair.next[key])) diffs.push(key)
    }
    if (tab === 'moments' && pair.vite.moments !== pair.next.moments) diffs.push('moments')
    if (pair.next.logs.length || pair.vite.logs.length) diffs.push('console')
    rows.push({ id, diffs, vite: pair.vite, next: pair.next })
    if (diffs.length) console.error('DIFF', id, diffs.join(','))
    else console.log('OK', id)
  }
} finally {
  await browser.close()
}
const summary = {
  frozen,
  cells: rows.length,
  differing: rows.filter(row => row.diffs.length).map(row => ({ id: row.id, diffs: row.diffs })),
  pngs: rows.flatMap(row => ['vite', 'next'].map(name => ({
    file: `${name}-${row.id}.png`,
    sha256: row[name].sha256,
  }))),
}
writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2))
console.log(JSON.stringify({ cells: summary.cells, differing: summary.differing }, null, 2))
