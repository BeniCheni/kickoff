import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

async function visit(page, url, options = { waitUntil: 'networkidle0' }) {
  await page.goto(url, options)
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(() => [...document.querySelectorAll('nav[aria-label=\"Primary\"] button')].every(button => Object.keys(button).some(key => key.startsWith('__reactProps'))))
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
}

export const READY = 'The video is not requested until Play.'
export const CANCELLED = 'Autoplay cancelled. Up next waits for a click.'
export async function button(page, text) {
  const handle = await page.evaluateHandle(text => [...document.querySelectorAll('button')].find(button => button.textContent.trim() === text), text)
  const element = handle.asElement()
  if (!element) throw new Error(`Button missing: ${text}`)
  await element.click() // Real pointer input, including mousedown, blur and mouseup.
  await handle.dispose()
}
export async function playing(page) {
  await page.evaluate(() => { const video = document.querySelector('video'); if (video) video.loop = true })
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const state = await page.evaluate(() => {
      const video = document.querySelector('video')
      const labels = [...document.querySelectorAll('button')].map(button => button.textContent.trim())
      return {
        live: !!(video && !video.paused && video.readyState >= 2 && !video.ended),
        replay: labels.includes('Replay'),
        play: labels.includes('Play'),
      }
    })
    if (state.live) return
    if (state.replay || state.play) {
      await button(page, state.replay ? 'Replay' : 'Play')
      await page.waitForFunction(() => { const video = document.querySelector('video'); return video && !video.paused && video.currentTime > 0 })
      return
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('Button missing: Play')
}
export async function countdown(page) {
  await playing(page)
  // A controlled ended event isolates the React countdown from the stub's tiny
  // duration. The matrix separately waits for genuine native ended events.
  await page.evaluate(() => document.querySelector('video').pause())
  await page.waitForFunction(() => ![...document.querySelectorAll('button')].some(b => b.textContent === 'Pause'))
  await page.evaluate(() => { const v = document.querySelector('video'); v.focus(); v.dispatchEvent(new Event('ended')) })
  await page.waitForFunction(() => /Up next in \d s/.test(document.body.innerText))
}
const watch = '?tab=moments&watch=stub-fenway-one'
async function ready(page, id = 'stub-fenway-one') {
  await page.waitForFunction(id => document.querySelector('#moments-watch-heading')?.textContent === (id === 'stub-fenway-one' ? 'Stub Fenway one' : 'Stub Frankenstein one'), {}, id)
  // A heading can commit before the flight stream finishes. Drain the request
  // before the next history traversal so the response scanner can read it.
  await page.waitForNetworkIdle({ idleTime: 100 })
}
async function state(page) {
  return page.evaluate(() => ({
    src: document.querySelector('video')?.getAttribute('src') ?? null,
    same: document.querySelector('video') === window.__video,
    countdown: /Up next in \d s/.test(document.body.innerText),
    alert: !!document.querySelector('[role="alert"]'),
    copy: document.body.innerText.includes('Link copied.'),
    copyFailure: document.body.innerText.includes('Copy failed. The address is in the address bar.'),
  }))
}
const resetOK = (s, id) => s.same && typeof s.src === 'string' && s.src.includes(`/${id}/`) && !s.countdown && !s.alert && !s.copy && !s.copyFailure
export async function regressions(browser, origin, check, configure = async () => {}) {
  async function scenario(name, run) {
    const page = await browser.newPage()
    page.setDefaultTimeout(8000)
    await page.setViewport({ width: 1000, height: 900 })
    await configure(page)
    await page.evaluateOnNewDocument(() => {
      window.__pushes = []
      const push = history.pushState.bind(history)
      history.pushState = (...args) => { window.__pushes.push(String(args[2])); return push(...args) }
    })
    try { await run(page) } catch (error) { check(name, false, { error: String(error), page: await page.evaluate(() => ({ href: location.href, heading: document.querySelector('h1')?.textContent })) }) }
    finally { await page.waitForNetworkIdle(); await page.close() }
  }
  await scenario('H1 tab navigation', async page => {
    await visit(page, `${origin}/`, { waitUntil: 'networkidle0' })
    let pushes = await page.evaluate(() => window.__pushes.length)
    await button(page, 'Moments')
    await page.waitForNetworkIdle()
    check('H1 Moments tab switches the region with one push', await page.evaluate(n => !!document.querySelector('main.moments-gallery') && document.querySelector('[aria-current="page"]')?.textContent === 'Moments' && window.__pushes.length === n + 1, pushes))
    for (const tab of ['Fixtures', 'Table']) {
      await visit(page, `${origin}/${watch}`, { waitUntil: 'networkidle0' })
      pushes = await page.evaluate(() => window.__pushes.length)
      await button(page, tab)
      await page.waitForNetworkIdle()
      const s = await page.evaluate(name => ({
        selected: document.querySelector('[aria-current="page"]')?.textContent,
        gallery: !!document.querySelector('main.moments-gallery'),
        content: name === 'Fixtures' ? !!document.querySelector('[aria-label="Weekly view"]') || /weekly/i.test(document.body.innerText) : !!document.querySelector('[data-table-picker]'),
        pushes: window.__pushes.length,
      }), tab)
      check(`H1 ${tab} leaves watch with content and one push`, s.selected === tab && !s.gallery && s.content && s.pushes === pushes + 1, s)
    }
  })
  await scenario('H2 manual id lifecycle', async page => {
    await visit(page, `${origin}/${watch}`, { waitUntil: 'networkidle0' })
    await page.evaluate(() => { window.__video = document.querySelector('video') })
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__copied = text } } }))
    await button(page, 'Copy link')
    await page.waitForFunction(() => document.body.innerText.includes('Link copied.'))
    check('Copy link success writes the exact current address', await page.evaluate(() => window.__copied === location.href))
    await playing(page)
    await page.$eval('aside a[href*="watch=stub-frankenstein-one"]', a => a.click())
    await ready(page, 'stub-frankenstein-one')
    let s = await state(page)
    check('H2 Up next while playing retires source and state, same element', resetOK(s, 'stub-frankenstein-one'), s)
    await page.goBack()
    await ready(page)
    await countdown(page)
    await page.$eval('aside a[href*="watch=stub-frankenstein-one"]', a => a.click())
    await ready(page, 'stub-frankenstein-one')
    s = await state(page)
    check('H2 Up next during countdown retires source and state, same element', resetOK(s, 'stub-frankenstein-one'), s)
    await playing(page)
    const replay = await page.evaluate(() => ({ src: document.querySelector('video').getAttribute('src'), currentSrc: document.querySelector('video').currentSrc }))
    check('H2 Play on the new page requests its own file', replay.src?.includes('/stub-frankenstein-one/') && replay.currentSrc.includes('/stub-frankenstein-one/'), replay)
    await page.goBack()
    await ready(page)
    s = await state(page)
    check('H2 Back restores the previous id ready', resetOK(s, 'stub-fenway-one'), s)
    await page.goForward()
    await ready(page, 'stub-frankenstein-one')
    s = await state(page)
    check('H2 Forward restores its id ready', resetOK(s, 'stub-frankenstein-one'), s)
  })
  await scenario('automatic advance and A-10 visibility', async page => {
    await visit(page, `${origin}/${watch}#clip`, { waitUntil: 'networkidle0' })
    await page.evaluate(() => { window.__video = document.querySelector('video') })
    await page.waitForFunction(() => /Playing muted|Sound on|Paused at|Up next in \d s/.test(document.body.innerText))
    if (!await page.evaluate(() => /Up next in \d s/.test(document.body.innerText))) {
      await page.evaluate(() => document.querySelector('video')?.dispatchEvent(new Event('ended')))
    }
    await page.waitForFunction(() => /Up next in \d s/.test(document.body.innerText))
    const other = await browser.newPage()
    await other.bringToFront()
    await page.waitForFunction(() => document.hidden)
    const before = await page.evaluate(() => document.querySelector('[aria-hidden="true"]')?.textContent && document.body.textContent.match(/Up next in \d s/)[0])
    await new Promise(resolve => setTimeout(resolve, 2100))
    const after = await page.evaluate(() => document.body.textContent.match(/Up next in \d s/)[0])
    check('A-10 real hidden document pauses countdown', before === after, { before, after })
    await page.bringToFront()
    await page.waitForFunction(() => document.body.innerText.includes('The countdown paused while this tab was hidden'))
    await other.close()
    await page.waitForFunction(() => document.querySelector('#moments-watch-heading')?.textContent === 'Stub Frankenstein one' && !document.querySelector('video').paused && document.querySelector('video').currentTime > 0)
    const s = await page.evaluate(() => ({ same: window.__video === document.querySelector('video'), src: document.querySelector('video').getAttribute('src'), pushes: window.__pushes.length, hash: location.hash, status: document.body.innerText.includes('Playing muted. Unmute beside the player.'), statusLines: [...document.querySelectorAll('[role="status"]')].map(p => p.textContent) }))
    check('automatic advance plays its own file in the same node with one push', s.same && s.src?.includes('/stub-frankenstein-one/') && s.pushes === 1 && s.hash === '#clip' && s.status, s)
  })
  await scenario('H2 recovery id lifecycle', async page => {
    await page.setRequestInterception(true)
    page.on('request', r => r.url().includes('.mp4') ? r.abort() : r.continue())
    await visit(page, `${origin}/${watch}`, { waitUntil: 'networkidle0' })
    await page.evaluate(() => { window.__video = document.querySelector('video') })
    await button(page, 'Play')
    await page.waitForSelector('[role="alert"]')
    await button(page, 'Next')
    await ready(page, 'stub-frankenstein-one')
    const s = await state(page)
    const alert = await page.evaluate(() => document.querySelector('[role="alert"]')?.innerText ?? '')
    check('H2 Next after a real code-4 error requests the new file in the same element', s.same && s.src?.includes('/stub-frankenstein-one/') && !s.countdown && !s.copy && !s.copyFailure && alert.includes('Next opens \u201cStub both cats\u201d.'), { ...s, alert })
  })
  await scenario('M4 M5 L1 countdown', async page => {
    await visit(page, `${origin}/${watch}`, { waitUntil: 'networkidle0' })
    await page.evaluate(() => {
      window.__live = document.querySelector('[data-countdown-announcement]') ?? document.querySelector('.moments-live')
      window.__writes = []
      if (window.__live) new MutationObserver(() => { const text = window.__live.textContent; if (text) window.__writes.push(text) }).observe(window.__live, { childList: true, subtree: true, characterData: true })
    })
    await countdown(page)
    await button(page, 'Cancel')
    const cancelled = await page.evaluate(() => ({
      same: document.querySelector('[data-countdown-announcement]') === window.__live,
      visible: document.body.innerText.includes('Autoplay cancelled. Up next waits for a click.'),
      count: /Up next in \d s/.test(document.body.innerText),
      writes: window.__writes,
    }))
    check('M4 persistent live region has one start and one visible Cancel write', cancelled.same && cancelled.visible && cancelled.writes.length === 2 && cancelled.writes[0].startsWith('Up next in five seconds:') && cancelled.writes[1] === CANCELLED, cancelled)
    check('M5 the first real Cancel click after Play works', cancelled.visible && !cancelled.count, cancelled)
    await countdown(page)
    await page.click('[role="switch"][aria-label="Autoplay next"]')
    check('L1 off removes countdown', !await page.evaluate(() => /Up next in \d s/.test(document.body.innerText)))
    await page.click('[role="switch"][aria-label="Autoplay next"]')
    check('L1 on does not restart countdown', !await page.evaluate(() => /Up next in \d s/.test(document.body.innerText)))
  })
  await scenario('M6 fragment and history', async page => {
    await visit(page, `${origin}/?tab=moments&only=pl&extra=kept#clip`, { waitUntil: 'networkidle0' })
    const steps = []
    async function record(label) { steps.push(await page.evaluate(label => ({ label, href: location.href, hash: location.hash, pushes: window.__pushes.length }), label)) }
    await page.click('h2 a[href*="watch=stub-fenway-one"]')
    await ready(page)
    await record('entry')
    await page.click('aside a[href*="watch=stub-frankenstein-one"]')
    await ready(page, 'stub-frankenstein-one')
    await record('Up next')
    await page.goBack()
    await ready(page)
    await record('Back')
    await page.evaluate(() => document.querySelector('.moments-stage-top a')?.click())
    await page.waitForSelector('#moments-gallery-heading')
    await record('Gallery')
    await page.evaluate(() => [...document.querySelectorAll('nav button')].find(button => button.textContent.trim() === 'Fixtures')?.click())
    await page.waitForFunction(() => !location.search.includes('tab=moments'))
    await record('Fixtures')
    check('M6 entry Up next Back Gallery Fixtures keeps the exact fragment', steps.every(s => s.hash === '#clip' && s.href.split('#').length === 2), steps)
    check('M6 history pushes once per forward action, none for Back', JSON.stringify(steps.map(s => s.pushes)) === '[1,2,2,3,4]', steps)
    check('M6 unknown keys and only survive', steps.every(s => s.href.includes('only=pl') && s.href.includes('extra=kept')), steps)
  })
  await scenario('L2 PM3 live lens', async page => {
    await visit(page, `${origin}/?tab=moments&lens=poster#clip`, { waitUntil: 'networkidle0' })
    await button(page, 'Ledger')
    await page.waitForFunction(() => [...document.querySelectorAll('.moments-card h2 a')].every(a => a.getAttribute('href').includes('lens=ledger')))
    check('L2 gallery href tracks a client lens change and canonical default removal', await page.evaluate(() => [...document.querySelectorAll('.moments-card h2 a')].every(a => a.hash === '#clip' && new URL(a.href).searchParams.get('lens') === 'ledger')))
    await page.click('h2 a[href*="watch=stub-fenway-one"]')
    await ready(page)
    await playing(page)
    await page.evaluate(() => { window.__video = document.querySelector('video') })
    await page.evaluate(() => [...document.querySelectorAll('button')].find(button => button.textContent.trim() === 'Broadcast')?.click())
    await page.waitForFunction(() => [...document.querySelectorAll('.moments-stage-top a, aside a')].every(a => new URL(a.href).searchParams.get('lens') === 'broadcast'))
    const s = await page.evaluate(() => ({ same: window.__video === document.querySelector('video'), playing: !document.querySelector('video').paused, src: document.querySelector('video').getAttribute('src'), hrefs: [...document.querySelectorAll('.moments-stage-top a, aside a')].map(a => a.href) }))
    check('PM3 lens change keeps the video element and playback', s.same && s.playing && !!s.src, s)
    check('L2 watch hrefs track the live lens and fragment', s.hrefs.every(h => new URL(h).searchParams.get('lens') === 'broadcast' && new URL(h).hash === '#clip'), s.hrefs)
  })
  await scenario('M1 pre-hydration thumbnail race', async page => {
    await page.evaluateOnNewDocument(() => {
      window.__earlyErrors = []
      document.addEventListener('error', e => {
        if (e.target instanceof HTMLImageElement) window.__earlyErrors.push({ src: e.target.src, beforeHydration: !Object.keys(e.target).some(k => k.startsWith('__reactFiber')) })
      }, true)
    })
    await page.setCacheEnabled(false)
    await page.setRequestInterception(true)
    page.on('request', r => {
      if (r.url().includes('/stub-storage/') && r.url().includes('.jpg')) void r.abort()
      else if (r.url().includes('/_next/') && r.resourceType() === 'script') setTimeout(() => { void r.continue() }, 800)
      else void r.continue()
    })
    for (const route of ['?tab=moments', watch]) {
      await visit(page, `${origin}/${route}`, { waitUntil: 'networkidle0' })
      const result = await page.evaluate(() => ({
        early: window.__earlyErrors.filter(e => e.beforeHydration),
        images: [...document.querySelectorAll('.moments-cover img')].map(img => ({ src: img.src, loaded: img.complete && img.naturalWidth > 0 })),
        trust: [...document.querySelectorAll('.moments-trust')].map(p => p.textContent),
      }))
      check(`M1 errors before hydration recover to loaded site copies: ${route}`, result.early.length > 0 && result.images.length > 0 && result.images.every(img => img.loaded && img.src.includes('/moments/stub-site/')) && result.trust.length === result.images.length && result.trust.every(t => t === 'Thumbnail from the site\'s copy \u00b7 the file store did not answer.'), result)
    }
  })
  await scenario('M2 M3 M10 L4 geometry', async page => {
    for (const width of [390, 1000]) {
      await page.setViewport({ width, height: 900 })
      await visit(page, `${origin}/${watch}`, { waitUntil: 'networkidle0' })
      async function geometry() {
        return page.evaluate(() => {
          const stage = document.querySelector('.moments-stage-anchor').getBoundingClientRect(), aside = document.querySelector('aside').getBoundingClientRect()
          return { stage: { x: stage.x, y: stage.y, w: stage.width, h: stage.height }, aside: { x: aside.x, y: aside.y, w: aside.width }, center: document.elementFromPoint(stage.x + stage.width / 2, stage.y + stage.height / 2)?.tagName, scroll: document.documentElement.scrollWidth === innerWidth, rows: [...document.querySelectorAll('aside li')].every(li => li.querySelector('small').getBoundingClientRect().top >= li.querySelector('a').getBoundingClientRect().bottom) }
        })
      }
      const normal = await geometry()
      check(`M3 the muted video covers the thumbnail once it has started at ${width}`, normal.center === 'VIDEO', normal)
      await button(page, 'Theater')
      const theater = await geometry()
      check(`M2 theater and normal layout at ${width}`, normal.scroll && theater.scroll && theater.aside.y >= theater.stage.y + theater.stage.h && (width < 888 ? normal.aside.y >= normal.stage.y + normal.stage.h : normal.aside.x > normal.stage.x + normal.stage.w && theater.stage.w > normal.stage.w), { normal, theater })
      check(`M10 small lines sit below titles at ${width}`, normal.rows && theater.rows)
      await page.keyboard.press('Escape')
      await page.waitForFunction(() => document.querySelector('.moments-stage-top button').textContent === 'Theater')
      check(`Escape leaves theater at ${width}`, await page.$eval('.moments-stage-top button', b => b.getAttribute('aria-pressed') === 'false'))
      await playing(page)
      const hit = await page.evaluate(() => { const v = document.querySelector('video'), r = v.getBoundingClientRect(); v.scrollIntoView({ block: 'center' }); const box = v.getBoundingClientRect(); return { tag: document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)?.tagName, poster: v.hasAttribute('poster') } })
      check(`M3 after Play the video is on top with poster unset at ${width}`, hit.tag === 'VIDEO' && !hit.poster, hit)
    }
    await page.setViewport({ width: 760, height: 900 })
    await visit(page, `${origin}/?tab=moments`, { waitUntil: 'networkidle0' })
    check('L4 count line hides at 760', await page.$eval('.moments-count', p => getComputedStyle(p).display === 'none'))
  })
  await scenario('M3 watch fallback trust line', async page => {
    await page.setViewport({ width: 390, height: 900 })
    await page.setRequestInterception(true)
    page.on('request', r => r.url().includes('.jpg') ? r.abort() : r.continue())
    await visit(page, `${origin}/${watch}`)
    await page.waitForSelector('.moments-cover-word')
    const visible = await page.$eval('.moments-trust', p => { p.scrollIntoView({ block: 'center' }); const r = p.getBoundingClientRect(); return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === p })
    check('M3 cover and amber fallback sentence are both visible', visible)
  })
  await scenario('Copy link failure and fullscreen guard', async page => {
    await visit(page, `${origin}/${watch}#clip`)
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('refused for this test') } } }))
    await button(page, 'Copy link')
    await page.waitForFunction(() => document.body.innerText.includes('Copy failed. The address is in the address bar.'))
    check('Copy link refusal uses the D9 failure sentence', await page.evaluate(() => document.body.innerText.includes('Copy failed. The address is in the address bar.')))
    await button(page, 'Theater')
    await playing(page)
    await page.evaluate(() => document.querySelector('video').requestFullscreen())
    await page.keyboard.press('Escape')
    check('Escape leaves theater alone while native fullscreen is active', await page.$eval('.moments-stage-top button', b => b.textContent === 'Exit theater'))
    await page.evaluate(() => document.fullscreenElement ? document.exitFullscreen() : undefined)
  })
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const out = path.resolve(process.argv[2] ?? '/tmp/k217-regressions')
  mkdirSync(out, { recursive: true })
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--disable-gpu', '--autoplay-policy=no-user-gesture-required'] })
  const assertions = []
  try { await regressions(browser, process.env.KICKOFF_NEXT_ORIGIN ?? 'http://127.0.0.1:5175', (name, ok, detail) => { assertions.push({ name, ok, detail }); console.log(ok ? 'OK' : 'FAIL', name, ok ? '' : JSON.stringify(detail)) }) }
  finally { await browser.close() }
  writeFileSync(path.join(out, 'receipt.json'), JSON.stringify({ assertions }, null, 2))
  if (assertions.some(item => !item.ok)) process.exitCode = 1
}
