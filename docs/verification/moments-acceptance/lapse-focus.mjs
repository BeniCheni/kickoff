// Production acceptance bundle; first item's permission must expire at 16:30Z on 1 Oct.
// Collect every cell before failing so the original defects remain readable as a red receipt.
import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
const [runtime, chrome, origin, out] = process.argv.slice(2)
if (!out) throw new Error('Usage: node lapse-focus.mjs <playwright-module> <chrome> <lapse-origin> <receipt.json>')
assert(['localhost', '127.0.0.1'].includes(new URL(origin).hostname))
const { chromium } = await import(runtime)
const domains = ['youtube.com', 'youtu.be', 'youtube-nocookie.com', 'ytimg.com', 'googlevideo.com', 'ggpht.com']
const provider = host => domains.some(d => host === d || host.endsWith('.' + d))
const stub = await fs.readFile(new URL('./youtube-stub.js', import.meta.url), 'utf8')
const browser = await chromium.launch({ executablePath: chrome, headless: true,
  args: ['--host-resolver-rules=' + domains.flatMap(d => [`MAP ${d} ~NOTFOUND`, `MAP *.${d} ~NOTFOUND`]).join(', ')] })
const result = { browser: browser.version(), clock: '2026-10-01T16:00:00Z -> 17:00:00Z', providerEgress: 0, rows: [] }
try {
  for (const width of [360, 390, 1000]) for (const scenario of [
    'stage-iframe', 'stage-return', 'stage-outside', 'cinema-live', 'stage-cover', 'cinema-cover', 'parked-owner', 'parked-selection',
    'stage-pause', 'stage-play-cover', 'cinema-play-cover', 'cinema-pause-live', 'stage-retry', 'stage-source-link',
  ]) {
    const log = { fulfilled: [], aborted: [], escaped: [], errors: [] }
    const context = await browser.newContext({ viewport: { width, height: width === 1000 ? 900 : 844 },
      deviceScaleFactor: 1, reducedMotion: 'reduce', serviceWorkers: 'block' })
    await context.addInitScript(() => {
      const Original = Date
      window.__lapseNow = Date.parse('2026-10-01T16:00:00Z')
      globalThis.Date = class extends Original {
        constructor(...args) { super(...(args.length ? args : [window.__lapseNow])) }
        static now() { return window.__lapseNow }
      }
    })
    const handled = new WeakSet()
    await context.route('**/*', route => {
      const request = route.request(), u = new URL(request.url())
      if (provider(u.hostname)) {
        handled.add(request)
        if (u.href === 'https://www.youtube.com/iframe_api') {
          log.fulfilled.push(u.href); return route.fulfill({ contentType: 'text/javascript', body: stub })
        }
        if (u.origin === 'https://www.youtube-nocookie.com' && /^\/embed\/S4Accept00[12]$/.test(u.pathname)) {
          log.fulfilled.push(u.href); return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Local empty frame</title>' })
        }
        log.aborted.push(u.href); return route.abort()
      }
      if (u.origin !== new URL(origin).origin && !['fonts.googleapis.com', 'fonts.gstatic.com'].includes(u.hostname)) return route.abort()
      return route.continue()
    })
    context.on('response', response => {
      if (provider(new URL(response.url()).hostname) && !handled.has(response.request())) log.escaped.push(response.url())
    })
    const page = await context.newPage()
    page.on('pageerror', e => log.errors.push(e.message))
    await page.goto(origin + '/?tab=moments&lens=ledger')
    await page.locator('[data-lead]').waitFor()
    await page.evaluate(() => document.fonts.ready)
    const click = async name => {
      const control = page.getByRole('button', { name, exact: typeof name === 'string' })
      await control.scrollIntoViewIfNeeded()
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
      const rect = await control.evaluate(n => {
        const b = n.getBoundingClientRect()
        return { x: b.x + b.width / 2, y: b.y + b.height / 2, hit: n.contains(document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2)) }
      })
      assert(rect.hit, `Click hit: ${name}`)
      await page.mouse.click(rect.x, rect.y)
    }
    await page.locator('[data-lead]').getByRole('button', { name: /Open selection/ }).click()
    if (scenario === 'parked-selection') await click(/^Next:/)
    if (!scenario.endsWith('cover')) {
      await click('Play')
      await page.waitForFunction(() => window.__players?.length === 1)
      await page.evaluate(() => window.__players[0].__ready())
      await page.getByRole('button', { name: 'Pause', exact: true }).waitFor()
      await page.evaluate(() => { window.__players[0].time = 12 })
    }
    if (scenario === 'stage-retry') {
      await page.evaluate(() => window.__players[0].__error(150))
      await page.getByRole('button', { name: 'Retry', exact: true }).waitFor()
    }
    if (scenario === 'parked-owner') await click(/^Next:/)
    if (scenario === 'parked-selection') await click(/^Previous:/)
    if (scenario.startsWith('cinema') || scenario.startsWith('parked')) await click('Enter Cinema')
    const focusSelector = ['stage-pause', 'stage-play-cover', 'stage-retry'].includes(scenario) ? '.moments-stage-main [data-primary-action]'
      : ['cinema-play-cover', 'cinema-pause-live'].includes(scenario) ? '[data-moments-cinema] [data-primary-action]'
      : scenario === 'stage-source-link' ? '.moments-stage-main .moments-source-link'
      : scenario === 'stage-iframe' ? 'iframe' : scenario === 'stage-return' ? '[data-player-return]'
      : scenario === 'stage-outside' ? '.moments-stage-main [data-save]' : scenario === 'stage-cover' ? '[data-cinema-enter]' : '[data-cinema-exit]'
    // Gallery.open schedules heading focus for the next frame. Finish that navigation
    // before placing the user's focus; otherwise the probe mistakes it for lapse behavior.
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
    await page.locator(focusSelector).focus()
    const read = () => page.evaluate(() => {
      const dialog = document.querySelector('[data-moments-player-dialog]'), host = document.querySelector('[data-moments-player-host]')
      const focus = document.activeElement
      const area = document.querySelector(dialog.dataset.placement === 'cinema' ? '[data-moments-cinema]' : '.moments-stage-main')
      return { placement: dialog.dataset.placement, dialogInert: dialog.inert, hostInert: host.hasAttribute('inert'),
        focus: { tag: focus.tagName, text: focus.textContent?.trim().slice(0, 80), enter: focus.hasAttribute('data-cinema-enter'),
          exit: focus.hasAttribute('data-cinema-exit'), save: focus.hasAttribute('data-save'), inert: !!focus.closest('[inert], [hidden]'), connected: focus.isConnected,
          visible: focus.getClientRects().length > 0 && getComputedStyle(focus).visibility === 'visible' },
        primaryTag: area.querySelector('[data-primary-action]')?.tagName, primary: area.querySelector('[data-primary-action]')?.textContent.trim(),
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth, frames: document.querySelectorAll('iframe').length,
        calls: window.__players?.flatMap(p => p.calls) ?? [] }
    })
    const before = await read()
    await page.evaluate(() => { window.__lapseNow += 3_600_000; window.dispatchEvent(new Event('focus')) })
    if (scenario !== 'parked-owner') await page.waitForFunction(() => {
      const cinema = document.querySelector('[data-moments-player-dialog]')?.dataset.placement === 'cinema'
      return document.querySelector((cinema ? '[data-moments-cinema]' : '.moments-stage-main') + ' [data-primary-action]')?.tagName === 'A'
    })
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
    const after = await read(), failures = []
    const check = (condition, message) => { if (!condition) failures.push(message) }
    check(after.width === after.scrollWidth && after.frames <= 1, 'overflow or multiple frames')
    check(after.focus.connected && after.focus.visible && !after.focus.inert && after.focus.tag !== 'BODY', 'focus must remain on a visible control')
    if (scenario === 'stage-iframe' || scenario === 'stage-return' || scenario === 'cinema-live' || ['stage-pause', 'stage-retry', 'stage-source-link', 'cinema-pause-live'].includes(scenario)) {
      check(after.placement === 'parked' && after.focus.enter, 'live lapse must park and focus Enter Cinema')
    } else if (scenario === 'stage-play-cover' || scenario === 'cinema-play-cover') {
      check(after.placement === before.placement, 'cover surface changed')
      check(scenario === 'cinema-play-cover' ? after.focus.exit : after.focus.enter,
        scenario === 'cinema-play-cover' ? 'cover lapse must focus Exit Cinema' : 'cover lapse must focus Enter Cinema')
    } else {
      check(after.placement === before.placement || (scenario === 'stage-outside' && after.placement === 'parked'), 'cover surface changed')
      check(JSON.stringify(after.focus) === JSON.stringify(before.focus), 'unrelated focus changed')
    }
    if (scenario.endsWith('cover') || scenario.startsWith('parked')) check(JSON.stringify(after.calls) === JSON.stringify(before.calls), 'no active frame: adapter was called')
    else check(after.calls.filter(c => c[0] === 'pauseVideo').length === before.calls.filter(c => c[0] === 'pauseVideo').length + 1, 'live frame did not pause once')
    if (after.placement === 'cinema') check(after.hostInert && !after.dialogInert, 'cover Cinema must keep controls active and host inert')
    check(log.escaped.length === 0 && log.aborted.length === 0 && log.errors.length === 0, 'network or page error')
    result.rows.push({ width, scenario, before, after, log, failures })
    console.log(width, scenario, failures.length ? failures.join('; ') : 'pass')
    await context.close()
  }
} finally {
  await fs.writeFile(out, JSON.stringify(result, null, 2))
  await browser.close()
}
assert(result.rows.length === 42 && result.rows.every(r => r.failures.length === 0), 'Permission lapse regressions; see receipt')
