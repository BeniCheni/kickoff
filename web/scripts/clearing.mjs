// Reproduce the clearing's two-app matrix. PNGs and receipts stay outside the repo.
// Build both apps first, then serve Vite preview and Next production on these origins.
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const out = path.resolve(process.argv[2] ?? '/tmp/kickoff-clearing')
mkdirSync(out, { recursive: true })
const origins = {
  vite: process.env.KICKOFF_VITE_ORIGIN ?? 'http://127.0.0.1:5173',
  next: process.env.KICKOFF_NEXT_ORIGIN ?? 'http://127.0.0.1:5174',
}
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
})
const cells = [], legacy = [], measurements = []
async function open(origin, search, theme, width) {
  const context = await browser.createBrowserContext()
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(String(error)))
  page.on('console', message => {
    if (['error', 'warning'].includes(message.type())) errors.push(message.text())
  })
  await page.setViewport({ width, height: 844, deviceScaleFactor: 1 })
  await page.evaluateOnNewDocument(theme => {
    localStorage.setItem('kickoff-theme', theme)
    // A contrary retired preference must neither affect first paint nor be deleted.
    localStorage.setItem('kickoff-theme-broadcast', theme === 'light' ? 'dark' : 'light')
  }, theme)
  await page.goto(`${origin}/${search}`, { waitUntil: 'networkidle0' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(theme => document.documentElement.dataset.theme === theme, {}, theme)
  return { context, page, errors }
}
async function inspect(page) {
  return page.evaluate(() => ({
    lens: document.documentElement.dataset.lens,
    theme: document.documentElement.dataset.theme,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth,
    radios: [...document.querySelectorAll('[role=radio]')].map(el => el.textContent),
    removed: !!document.querySelector('[data-ticker], [data-lens="broadcast"]') || /Where to Watch|📺/.test(document.body.textContent)
      || [...document.querySelectorAll('button')].some(el => /^(Weekly|Monthly)$/.test(el.textContent)),
    url: location.pathname + location.search + location.hash,
    text: document.body.innerText,
    retiredTheme: localStorage.getItem('kickoff-theme-broadcast'),
  }))
}
try {
  for (const [app, origin] of Object.entries(origins)) {
    for (const lens of ['poster', 'ledger']) for (const theme of ['light', 'dark']) {
      for (const tab of ['fixtures', 'table', 'moments']) for (const width of [360, 375, 390, 1000]) {
        const id = `${app}-${lens}-${theme}-${tab}-${width}`
        const { context, page, errors } = await open(origin, `?lens=${lens}&tab=${tab}&date=2026-11-21`, theme, width)
        try {
          const state = await inspect(page)
          assert.equal(state.scrollWidth, state.innerWidth, id)
          assert.equal(state.lens, lens, id)
          assert.equal(state.theme, theme, id)
          assert.deepEqual(state.radios, ['Poster', 'Ledger'], id)
          assert.equal(state.removed, false, id)
          assert.equal(state.retiredTheme, theme === 'light' ? 'dark' : 'light', id)
          if (tab === 'fixtures') assert.match(state.text, /Filters/i, id)
          if (tab === 'table') assert.ok(await page.$('[data-table-picker]'), id)
          if (tab === 'moments') assert.match(state.text, /Moments/i, id)
          assert.deepEqual(errors, [], id)
          if (width === 390 && tab === 'fixtures' && theme === 'light') {
            const row = await page.$('button[aria-expanded]')
            assert.ok(row, id)
            measurements.push({ app, lens, top: await row.evaluate(el => el.parentElement.getBoundingClientRect().top) })
          }
          // The viewport is explicitly reset immediately before every capture.
          await page.setViewport({ width, height: 844, deviceScaleFactor: 1 })
          await page.screenshot({ path: path.join(out, `${id}.png`), fullPage: true })
          const { text, ...receipt } = state
          cells.push({ id, ...receipt, errors })
        } finally { await context.close() }
      }
      console.log(`${app} ${lens} ${theme}: 12 cells passed`)
    }
    for (const search of ['?lens=broadcast', '?view=month']) {
      const { context, page, errors } = await open(origin, search, 'light', 390)
      try {
        const state = await inspect(page)
        assert.equal(state.lens, 'poster')
        assert.equal(state.url, '/')
        assert.equal(state.removed, false)
        assert.equal(state.scrollWidth, state.innerWidth)
        assert.deepEqual(errors, [])
        await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 })
        await page.screenshot({ path: path.join(out, `${app}-legacy-${search.includes('lens') ? 'lens' : 'view'}.png`), fullPage: true })
        legacy.push({ app, search, landed: state.url, lens: state.lens, scrollWidth: state.scrollWidth })
      } finally { await context.close() }
    }
  }
} finally {
  writeFileSync(path.join(out, 'receipt.json'), JSON.stringify({ origins, cells, legacy, measurements }, null, 2))
  await browser.close()
}
assert.equal(cells.length, 96)
console.log(JSON.stringify({ cells: cells.length, legacy, measurements }, null, 2))
