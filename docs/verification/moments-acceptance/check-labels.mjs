// Phone typography: playback buttons stay on one line; links and gallery actions can wrap.
import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
const [runtime, chrome, harness, acceptance, out] = process.argv.slice(2)
if (!out) throw new Error('Usage: node check-labels.mjs <playwright-module> <chrome> <harness-origin> <acceptance-origin> <receipt.json>')
for (const origin of [harness, acceptance]) assert(['localhost', '127.0.0.1'].includes(new URL(origin).hostname))
const { chromium } = await import(runtime)
const domains = ['youtube.com', 'youtu.be', 'youtube-nocookie.com', 'ytimg.com', 'googlevideo.com', 'ggpht.com']
const browser = await chromium.launch({ executablePath: chrome, headless: true,
  args: ['--host-resolver-rules=' + domains.flatMap(d => [`MAP ${d} ~NOTFOUND`, `MAP *.${d} ~NOTFOUND`]).join(', ')] })
const context = await browser.newContext({ reducedMotion: 'reduce', deviceScaleFactor: 1, serviceWorkers: 'block' })
const result = { browser: browser.version(), providerRequests: [], errors: [], rows: [] }
await context.route('**/*', route => {
  const u = new URL(route.request().url())
  if (domains.some(d => u.hostname === d || u.hostname.endsWith('.' + d))) { result.providerRequests.push(u.href); return route.abort() }
  if (!['localhost', '127.0.0.1', 'fonts.googleapis.com', 'fonts.gstatic.com'].includes(u.hostname)) return route.abort()
  return route.continue()
})
await context.addInitScript(() => {
  const Original = Date, now = Date.parse('2026-10-01T16:00:00Z')
  globalThis.Date = class extends Original { constructor(...args) { super(...(args.length ? args : [now])) } static now() { return now } }
})
const page = await context.newPage()
page.on('pageerror', e => result.errors.push(e.message))
const record = async (name, area, playback) => {
  const row = await page.evaluate(({ area, playback }) => {
    const root = document.querySelector(area), primary = root.querySelector('.moments-primary')
    const measure = n => {
      const b = n.getBoundingClientRect(), style = getComputedStyle(n), range = document.createRange()
      range.selectNodeContents(n.firstChild)
      return { text: n.textContent.trim(), tag: n.tagName, whiteSpace: style.whiteSpace, shrink: style.flexShrink,
        lines: range.getClientRects().length, x: b.x, right: b.right, width: b.width }
    }
    const items = [...root.querySelectorAll('.moments-action-row > *')].map(measure)
    const p = measure(primary)
    return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      lens: document.documentElement.dataset.lens, theme: document.documentElement.dataset.theme, primary: p, items, playback,
      fits: items.every(n => n.x >= -1 && n.right <= innerWidth + 1),
      valid: playback ? p.lines === 1 && p.whiteSpace === 'nowrap' && p.shrink === '0' : p.whiteSpace === 'normal' }
  }, { area, playback })
  assert(name.startsWith(`${row.width}-${row.lens}-${row.theme}-`), 'Rendered lens/theme must match the cell')
  result.rows.push({ name, ...row })
}
try {
  for (const width of [360, 375, 390]) for (const lens of ['ledger', 'poster', 'broadcast']) for (const theme of ['light', 'dark']) {
    await page.setViewportSize({ width, height: 844 })
    for (const surface of ['stage', 'cinema']) for (const playback of ['ready', 'playing', 'blocked', 'ended']) {
      await page.goto(`${harness}/tests/harness/moments.html?tab=moments&scenario=player&lens=${lens}&theme=${theme}&surface=${surface}&playback=${playback}`)
      await page.waitForFunction(({ surface, playback }) => {
        const raw = document.querySelector('[data-visit-state]')?.textContent
        if (!raw) return false
        const v = JSON.parse(raw)
        return v.queue.surface === surface && v.queue.media[v.queue.active]?.status === playback
      }, { surface, playback })
      await page.evaluate(() => document.fonts.ready)
      await record(`${width}-${lens}-${theme}-${surface}-${playback}`, surface === 'cinema' ? '[data-moments-cinema]' : '.moments-stage-main', true)
    }
    await page.goto(acceptance + '/?tab=moments&lens=' + lens)
    await page.evaluate(theme => { localStorage.setItem('kickoff-theme', theme); localStorage.setItem('kickoff-theme-broadcast', theme) }, theme)
    await page.reload()
    await page.locator('[data-lead]').waitFor()
    await page.evaluate(() => document.fonts.ready)
    await record(`${width}-${lens}-${theme}-gallery`, '[data-moment-card]:not([data-lead])', false)
    for (const id of ['acceptance-1', 'acceptance-3']) {
      await page.locator(`[data-moment-id="${id}"]`).getByRole('button', { name: /Open selection/ }).click()
      await record(`${width}-${lens}-${theme}-${id}-stage`, '.moments-stage-main', id === 'acceptance-1')
      await page.getByRole('button', { name: 'Enter Cinema', exact: true }).click()
      await record(`${width}-${lens}-${theme}-${id}-cinema`, '[data-moments-cinema]', id === 'acceptance-1')
      await page.getByRole('button', { name: 'Exit Cinema', exact: true }).click()
      await page.getByRole('button', { name: '← Gallery', exact: true }).click()
    }
  }
} finally { await fs.writeFile(out, JSON.stringify(result, null, 2)); await browser.close() }
const failures = result.rows.filter(r => !r.valid || !r.fits || r.width !== r.scrollWidth)
console.log(JSON.stringify({ cells: result.rows.length, failures: failures.map(r => ({ name: r.name, primary: r.primary, fits: r.fits })), providerRequests: result.providerRequests.length, errors: result.errors }))
assert.equal(result.rows.length, 234)
assert.deepEqual(failures, [])
assert.deepEqual(result.providerRequests, [])
assert.deepEqual(result.errors, [])
