// Base build vs tip build: every element's box under #root, Fixtures and Table, at several scroll offsets.
import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
const [runtime, chrome, baseUrl, tipUrl, out] = process.argv.slice(2)
const { chromium } = await import(runtime)
const browser = await chromium.launch({ executablePath: chrome, headless: true })
const provider = host => ['youtube.com', 'youtu.be', 'youtube-nocookie.com', 'ytimg.com', 'googlevideo.com', 'ggpht.com'].some(d => host === d || host.endsWith('.' + d))
const rows = []; let providerRequests = 0; const errors = []; const externalRequests = []
async function capture(origin, query, width, height) {
  const context = await browser.newContext({ deviceScaleFactor: 1, reducedMotion: 'reduce', viewport: { width, height } })
  await context.addInitScript(() => {
    const Original = Date; const now = Date.parse('2026-09-27T02:40:00Z')
    globalThis.Date = class extends Original { constructor(...args) { super(...(args.length ? args : [now])) } static now() { return now } }
  })
  await context.route('**/*', route => {
    const url = new URL(route.request().url())
    if (provider(url.hostname)) { providerRequests++; return route.abort() }
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) {
      externalRequests.push(url.href)
      if (!['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) return route.abort()
    }
    return route.continue()
  })
  const page = await context.newPage()
  page.on('pageerror', e => errors.push(e.message))
  await page.goto(origin)
  await page.evaluate(t => { localStorage.setItem('kickoff-theme', t); localStorage.setItem('kickoff-theme-broadcast', t) }, query.theme)
  const params = new URLSearchParams(query.params)
  await page.goto(`${origin}/?${params}`)
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(theme => document.documentElement.dataset.theme === theme, query.theme)
  const shots = []
  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  for (const offset of [0, 240, 700, 1500, 3200, total]) {
    await page.evaluate(y => scrollTo({ top: y, left: 0, behavior: 'instant' }), offset)
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
    shots.push(await page.evaluate(() => {
      const list = []
      for (const el of document.querySelectorAll('#root *')) {
        const b = el.getBoundingClientRect(); const cs = getComputedStyle(el)
        list.push([el.tagName, typeof el.className === 'string' ? el.className : '', +b.x.toFixed(2), +b.y.toFixed(2), +b.width.toFixed(2), +b.height.toFixed(2), cs.position === 'sticky' ? 'sticky' : ''])
      }
      const sticky = [...document.querySelectorAll('#root *')].filter(el => getComputedStyle(el).position === 'sticky').map(el => ({ zone: el.getAttribute('data-zone-divider'), top: +el.getBoundingClientRect().top.toFixed(2), cls: el.className.slice(0, 40) }))
      return { iframes: document.querySelectorAll('iframe').length, scrollY, scrollWidth: document.documentElement.scrollWidth, innerWidth, docHeight: document.documentElement.scrollHeight, count: list.length, list, sticky,
        url: location.search, wrapper: document.querySelectorAll('[data-moments-background="route"]').length, header: document.querySelector('header')?.innerText.replace(/\s+/g, ' ') }
    }))
  }
  await context.close()
  return shots
}
const cells = []
for (const width of [390, 1000]) for (const lens of ['ledger', 'poster', 'broadcast']) for (const theme of ['light', 'dark']) for (const tab of ['fixtures', 'table'])
  cells.push({ width, theme, params: { lens, tab, date: '2026-09-26' }, name: `${width}-${lens}-${theme}-${tab}` })
for (const width of [390, 1000]) {
  cells.push({ width, theme: 'light', params: { only: 'pl,ucl', date: '2026-09-26' }, name: `${width}-contract-only-date` })
  cells.push({ width, theme: 'dark', params: { tab: 'table', only: 'ucl', lens: 'broadcast' }, name: `${width}-contract-table-ucl` })
  cells.push({ width, theme: 'light', params: { tab: 'table', only: 'pl', lens: 'poster' }, name: `${width}-contract-table-pl` })
}
for (const cell of cells) {
  const height = cell.width === 1000 ? 900 : 844
  const base = await capture(baseUrl, cell, cell.width, height)
  const tip = await capture(tipUrl, cell, cell.width, height)
  const perOffset = base.map((b, i) => {
    const t = tip[i]
    const same = JSON.stringify(b.list) === JSON.stringify(t.list)
    let firstDiff = null
    if (!same) for (let k = 0; k < Math.max(b.list.length, t.list.length); k++) if (JSON.stringify(b.list[k]) !== JSON.stringify(t.list[k])) { firstDiff = { base: b.list[k], tip: t.list[k] }; break }
    return { scrollY: b.scrollY, tipScrollY: t.scrollY, same, elements: b.count, tipElements: t.count, firstDiff, stickyBase: b.sticky.length, stickyPinned: b.sticky.filter(s => s.top <= 0.5).length,
      iframes: [b.iframes, t.iframes], overflowFree: b.scrollWidth === b.innerWidth && t.scrollWidth === t.innerWidth, docHeight: [b.docHeight, t.docHeight], url: [b.url, t.url], wrapper: [b.wrapper, t.wrapper], header: t.header }
  })
  rows.push({ name: cell.name, perOffset })
  console.log(cell.name, perOffset.every(o => o.same && o.overflowFree && o.url[0] === o.url[1]) ? 'same' : 'DIFF', 'sticky', perOffset.map(o => `${o.stickyPinned}/${o.stickyBase}`).join(' '))
}
await fs.writeFile(out, JSON.stringify({ browser: browser.version(), rows, providerRequests, providerEgress: 0, externalRequests, errors }, null, 1))
console.log(JSON.stringify({ cells: rows.length, offsets: rows.reduce((n, r) => n + r.perOffset.length, 0), allSame: rows.every(r => r.perOffset.every(o => o.same)), allOverflowFree: rows.every(r => r.perOffset.every(o => o.overflowFree)), urlsEqual: rows.every(r => r.perOffset.every(o => o.url[0] === o.url[1])), providerRequests, errors }))
await browser.close()

assert.equal(providerRequests, 0)
assert.deepEqual(errors, [])
assert(externalRequests.every(url => ['fonts.googleapis.com', 'fonts.gstatic.com'].includes(new URL(url).hostname)))
assert(rows.every(r => r.perOffset.every(o => o.same && o.overflowFree && o.iframes.every(n => n === 0) && o.url[0] === o.url[1])), 'Production element-box drift')
