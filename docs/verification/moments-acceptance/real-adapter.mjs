// Adapted from /pass1/real-adapter.mjs: production entry + production permission rule.
// A green stub is not playback. All provider URLs are fulfilled locally or aborted.
import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
const [runtime, chrome, origin, out] = process.argv.slice(2)
if (!out) throw new Error('Usage: node real-adapter.mjs <playwright-module> <chrome> <acceptance-origin> <receipt.json>')
assert(['localhost', '127.0.0.1'].includes(new URL(origin).hostname), 'Loopback only')
const { chromium } = await import(runtime)
const domains = ['youtube.com', 'youtu.be', 'youtube-nocookie.com', 'ytimg.com', 'googlevideo.com', 'ggpht.com']
const provider = host => domains.some(d => host === d || host.endsWith('.' + d))
const stub = await fs.readFile(new URL('./youtube-stub.js', import.meta.url), 'utf8')
const browser = await chromium.launch({ executablePath: chrome, headless: true,
  args: ['--host-resolver-rules=' + domains.flatMap(d => [`MAP ${d} ~NOTFOUND`, `MAP *.${d} ~NOTFOUND`]).join(', ')] })
const result = { browser: browser.version(), build: 'dist-acceptance; production src/main.tsx; no injected rule', providerEgress: 0, runs: [] }
let activePage
async function fresh(width, variant) {
  const log = { fulfilled: [], aborted: [], external: [], escaped: [], errors: [] }
  const context = await browser.newContext({ viewport: { width, height: width === 1000 ? 900 : 844 }, deviceScaleFactor: 1, reducedMotion: 'reduce', serviceWorkers: 'block' })
  await context.addInitScript(variant => {
    window.__stubVariant = variant
    window.__clicks = []
    for (const type of ['pointerdown', 'pointerup', 'click', 'focusin']) document.addEventListener(type, event => window.__clicks.push([type, event.target.tagName, event.target.closest('button')?.getAttribute('aria-label'), event.target.textContent?.slice(0, 80)]), true)
    const Original = Date; const now = Date.parse('2026-10-01T16:00:00Z')
    globalThis.Date = class extends Original { constructor(...args) { super(...(args.length ? args : [now])) } static now() { return now } }
  }, variant)
  const handled = new WeakSet()
  await context.route('**/*', async route => {
    const req = route.request(), u = new URL(req.url())
    if (provider(u.hostname)) {
      handled.add(req)
      if (u.href === 'https://www.youtube.com/iframe_api') {
        log.fulfilled.push(u.href); return route.fulfill({ contentType: 'text/javascript', body: stub })
      }
      if (u.origin === 'https://www.youtube-nocookie.com' && /^\/embed\/S4Accept00[12]$/.test(u.pathname)) {
        log.fulfilled.push(u.href); return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Local empty frame</title>' })
      }
      log.aborted.push(u.href); return route.abort()
    }
    if (u.origin !== new URL(origin).origin) {
      log.external.push(u.href)
      if (!['fonts.googleapis.com', 'fonts.gstatic.com'].includes(u.hostname)) return route.abort()
    }
    return route.continue()
  })
  context.on('response', response => {
    if (provider(new URL(response.url()).hostname) && !handled.has(response.request())) log.escaped.push(response.url())
  })
  const page = await context.newPage()
  activePage = page
  page.on('pageerror', e => log.errors.push(e.message))
  await page.goto(origin + '/?tab=moments')
  await page.waitForSelector('[data-moment-card]')
  await page.evaluate(() => document.fonts.ready)
  assert.equal(await page.title(), '[Moments acceptance] Kickoff / Brooklyn')
  assert.equal(await page.locator('html').getAttribute('data-moments-acceptance'), 'true')
  const steps = [], clickChecks = []
  const run = { width, variant, steps, clickChecks, log, completed: false }
  result.runs.push(run)
  const record = async name => {
    const state = await page.evaluate(() => ({
      width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      iframes: document.querySelectorAll('iframe').length,
      placement: document.querySelector('[data-moments-player-dialog]')?.dataset.placement,
      primary: [...document.querySelectorAll('[data-primary-action]')].filter(n => !n.closest('[inert]')).map(n => n.textContent.trim()),
      resume: [...document.querySelectorAll('[data-player-status]')].some(n => n.textContent.includes('Resuming')),
      calls: window.__players?.map(p => p.calls) ?? [],
    }))
    assert.equal(state.scrollWidth, state.width, name)
    assert(state.iframes <= 1, name)
    assert.deepEqual(log.escaped, [], 'STOP: escaped provider request')
    assert(log.external.every(url => ['fonts.googleapis.com', 'fonts.gstatic.com'].includes(new URL(url).hostname)), name)
    steps.push({ name, ...state }); return state
  }
  const beforePlay = async name => {
    await record(name); assert.deepEqual(log.fulfilled, []); assert.deepEqual(log.aborted, [])
    assert.equal(await page.locator('iframe,script[data-moments-youtube-api]').count(), 0)
  }
  const click = async name => {
    const button = page.getByRole('button', { name, exact: typeof name === 'string' })
    // Let programmatic scrolling reach the compositor before dispatching coordinates.
    // UNSETTLED=1 reproduces the initial probe's lost Next click for ideas row 71.
    if (process.env.UNSETTLED !== '1') {
      await button.scrollIntoViewIfNeeded()
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      const geometry = await button.evaluate(n => {
        const r = n.getBoundingClientRect(), hit = document.elementFromPoint(r.x + r.width/2, r.y + r.height/2)
        return { scrollY, rect: r.toJSON(), hitWithin: !!hit && n.contains(hit) }
      })
      assert(geometry.hitWithin, `Click hit-test: ${name}`)
      clickChecks.push({ name: String(name), ...geometry })
    }
    await button.click()
  }
  const open = async () => page.locator('[data-lead]').getByRole('button', { name: /Open selection/ }).click()
  const ready = async () => {
    await page.waitForFunction(() => window.__players?.length > 0)
    await page.evaluate(() => window.__players.at(-1).__ready())
    await page.getByRole('button', { name: 'Pause', exact: true }).waitFor()
  }
  const finish = async name => {
    assert.deepEqual(log.errors, []); assert.deepEqual(log.escaped, [])
    Object.assign(run, { name, completed: true }); console.log(width, variant, name, steps.length, 'checkpoints'); await context.close()
  }
  return { page, log, record, beforePlay, click, open, ready, finish }
}
try {
  for (const variant of ['ready', 'construction']) for (const width of [360, 390, 1000]) {
    const f = await fresh(width, variant), { page, record, click } = f
    await f.beforePlay('gallery before Play'); await f.open(); await f.beforePlay('stage before Play')
    await click('Enter Cinema'); await f.beforePlay('Cinema before Play'); await click('Exit Cinema')
    await click('Play'); await page.waitForFunction(() => window.__players?.length === 1)
    assert.deepEqual(await page.evaluate(() => window.__players[0].calls), [])
    await record('cold construction before ready'); await f.ready(); await record('stage playing')
    await page.evaluate(() => { window.__firstFrame = document.querySelector('iframe'); window.__firstParent = window.__firstFrame.parentNode })
    const attributes = await page.locator('iframe').evaluate(frame => ({ allow: frame.getAttribute('allow'), referrer: frame.getAttribute('referrerpolicy'), fullscreen: frame.hasAttribute('allowfullscreen'), src: frame.src }))
    assert.equal(attributes.allow, 'autoplay; encrypted-media'); assert.equal(attributes.referrer, 'strict-origin-when-cross-origin'); assert(attributes.fullscreen)
    await click('Enter Cinema'); await record('Cinema playing'); await click('Exit Cinema')
    await page.evaluate(() => { window.__players[0].time = 42; window.__players[0].__state(2) })
    await page.getByRole('button', { name: 'Play', exact: true }).waitFor()
    await click(/^Next:/); await page.getByRole('heading', { name: 'Permitted two', exact: true }).waitFor(); await record('Next cover'); await click('Play'); await record('second playing')
    await page.evaluate(() => { window.__players[0].time = 17; window.__players[0].__state(2); window.__players[0].zeroAfterLoad = true })
    await page.getByRole('button', { name: 'Play', exact: true }).waitFor()
    await click(/^Previous:/); await page.getByRole('heading', { name: 'Permitted one', exact: true }).waitFor(); await click('Play')
    assert.equal((await record('return with zero sample')).resume, false)
    await page.evaluate(() => { window.__players[0].time = 4; window.__players[0].__state(3) })
    await page.waitForSelector('[data-player-status]')
    assert.equal((await record('later positive sample')).resume, true)
    const calls = await page.evaluate(() => window.__players[0].calls)
    assert(calls.some(c => c[0] === 'loadVideoById' && c[1].videoId === 'S4Accept001' && c[1].startSeconds === 42))
    await click('← Gallery'); await record('parked gallery'); await click('Return to selection'); await record('return without autoplay')
    assert.equal(await page.evaluate(() => document.querySelector('iframe') === window.__firstFrame && window.__firstFrame.parentNode === window.__firstParent), true)
    await click('Fixtures'); await record('tab away'); await click('Moments'); await click('Return to selection'); await record('tab return')
    await f.finish('full journey')

    for (const code of [150, 2, 100, 153]) {
      const e = await fresh(width, variant)
      await e.open(); await e.beforePlay('error journey before Play'); await e.click('Play'); await e.ready()
      await e.page.evaluate(code => window.__players[0].__error(code), code)
      await e.page.getByRole('button', { name: 'Retry', exact: true }).waitFor()
      await e.record('provider error ' + code)
      const copy = await e.page.locator('[data-recovery-copy]').textContent()
      assert(copy.includes(code === 150 ? 'owner' : code === 153 ? 'does not establish a territory restriction' : 'unavailable'))
      await e.click('Retry'); await e.record('explicit Retry'); await e.finish('error ' + code)
    }
    const denied = await fresh(width, variant)
    for (const id of ['acceptance-3', 'acceptance-4', 'acceptance-5', 'acceptance-6']) {
      await denied.page.locator(`[data-moment-id="${id}"]`).getByRole('button', { name: /Open selection/ }).click()
      await denied.beforePlay(id)
      assert.equal(await denied.page.getByRole('button', { name: /^(Play|Retry|Replay|Pause)$/ }).count(), 0)
      assert.equal(await denied.page.locator('.moments-stage-main [data-primary-action]').evaluate(n => n.tagName), 'A')
      await denied.click('Enter Cinema'); await denied.beforePlay(id + ' Cinema')
      assert.equal(await denied.page.locator('[data-moments-cinema] [data-primary-action]').evaluate(n => n.tagName), 'A')
      await denied.click('Exit Cinema'); await denied.click('← Gallery')
    }
    await denied.finish('failing permissions')

    const lost = await fresh(width, variant)
    await lost.open(); await lost.beforePlay('player-lost before Play'); await lost.click('Play'); await lost.ready()
    await lost.page.evaluate(() => {
      window.__players[0].time = 7; window.__players[0].__state(2)
      const original = HTMLElement.prototype.getBoundingClientRect
      HTMLElement.prototype.getBoundingClientRect = function () {
        if (this.hasAttribute('data-moments-cinema-slot')) {
          HTMLElement.prototype.getBoundingClientRect = original
          throw new Error('Acceptance controlled player layout fault')
        }
        return original.call(this)
      }
    })
    await lost.click('Enter Cinema'); await lost.page.getByRole('button', { name: 'Retry player', exact: true }).waitFor()
    await lost.record('player lost in Cinema')
    await lost.click('Retry player'); assert.equal(await lost.page.locator('iframe').count(), 0)
    await lost.record('Retry player requires explicit Play')
    await lost.click('Play'); await lost.ready(); await lost.record('player recreated')
    await lost.click('Fixtures'); await lost.click('Moments'); await lost.click('Return to selection'); await lost.record('recovered tab return')
    await lost.finish('player-lost Retry')

    // Retain the original probe's five ready-window navigation stresses on this build.
    for (const action of ['Next', 'Gallery', 'Play again', 'tab away', 'queue row']) {
      const early = await fresh(width, variant)
      await early.open(); await early.beforePlay('pre-ready intent'); await early.click('Play')
      await early.page.waitForFunction(() => window.__players?.length === 1)
      if (action === 'Next') await early.click(/^Next:/)
      if (action === 'Gallery') await early.click('← Gallery')
      if (action === 'Play again') await early.click('Play')
      if (action === 'tab away') await early.click('Table')
      if (action === 'queue row') await early.page.locator('[data-queue-id="acceptance-3"]').click()
      assert.deepEqual(await early.page.evaluate(() => window.__players[0].calls), [])
      await early.record(action + ' before ready')
      await early.page.evaluate(() => window.__players[0].__ready())
      await early.record(action + ' after ready')
      assert.equal(await early.page.locator('[role="alert"]').count(), 0)
      assert.equal(await early.page.locator('header').count() > 0, true)
      await early.finish('ready-window ' + action)
    }
  }
  assert(result.runs.every(run => run.completed))
} catch (error) {
  console.error(await activePage?.locator('body').innerText()); console.error(await activePage?.evaluate(() => window.__clicks))
  throw error
} finally {
  await fs.writeFile(out, JSON.stringify(result, null, 2)); await browser.close()
}
console.log(JSON.stringify({ browser: result.browser, runs: result.runs.length, checkpoints: result.runs.reduce((n,r) => n+r.steps.length,0), providerEgress: 0 }))
