// Reuses an existing Playwright runtime. No install and no provider request.
import fs from 'node:fs/promises'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
const [runtime, chrome, origin, output] = process.argv.slice(2)
if (!output) throw new Error('Usage: node check-player.mjs <playwright-module> <chrome> <dev-origin> <output-dir>')
const { chromium } = await import(runtime)
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({ executablePath: chrome, headless: true })
const context = await browser.newContext({ deviceScaleFactor: 1, reducedMotion: 'reduce' })
const requests = [], errors = [], cells = [], journeys = [], shots = []
const provider = host => ['youtube.com', 'youtu.be', 'youtube-nocookie.com', 'ytimg.com', 'googlevideo.com', 'ggpht.com'].some(domain => host === domain || host.endsWith('.' + domain))
await context.route('**/*', async route => {
  const url = new URL(route.request().url())
  if (!['127.0.0.1', 'localhost'].includes(url.hostname)) {
    const mediaProvider = provider(url.hostname)
    const unexpected = !['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)
    requests.push({ url: url.href, mediaProvider, unexpected })
    if (mediaProvider || unexpected) return route.abort()
  }
  return route.continue()
})
const page = await context.newPage()
page.on('pageerror', error => errors.push(error.message))
page.on('requestfailed', request => requests.push({ url: request.url(), failed: request.failure()?.errorText }))
const widths = [360, 375, 390, 761, 768, 800, 855, 887, 888, 1000, 1100, 1160, 1250, 1440, 1920]
const states = ['ready', 'loading', 'playing', 'paused', 'ended', 'blocked', 'timeout']
const lenses = ['ledger', 'poster', 'broadcast']
const themes = ['light', 'dark']
const smoke = process.env.SMOKE === '1'
const heightFor = width => width <= 390 ? 844 : width <= 888 ? 1024 : 900
const shotNames = new Set([
  '360-ledger-light-stage-ready', '360-ledger-light-stage-playing', '360-broadcast-dark-stage-playing',
  '360-broadcast-light-gallery', '375-poster-light-stage-playing', '390-poster-dark-cinema-playing',
  '390-ledger-light-cinema-blocked', '390-broadcast-light-stage-timeout', '390-poster-light-cinema-playing',
  '390-ledger-dark-cinema-playing', '390-broadcast-dark-cinema-playing', '887-poster-light-stage-playing',
  '888-poster-light-stage-playing', '888-broadcast-dark-cinema-playing', '1000-poster-dark-stage-paused',
  '1440-ledger-light-cinema-ended', '390-poster-light-cinema-playing-d15',
])
function urlFor(query) {
  const params = new URLSearchParams({ tab: 'moments', ...query })
  return `${origin}/tests/harness/moments.html?${params}`
}
async function load(query, width) {
  await page.setViewportSize({ width, height: heightFor(width) })
  await page.goto(urlFor(query), { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => document.fonts.ready)
  const expectedState = { lens: query.lens, theme: query.theme, scenario: query.scenario, surface: query.surface, playback: query.playback === 'playing0' ? 'playing' : query.playback }
  try {
  await page.waitForFunction(expected => {
    const root = document.documentElement
    const raw = document.querySelector('[data-visit-state]')?.textContent
    if (!raw || root.dataset.lens !== expected.lens || root.dataset.theme !== expected.theme) return false
    if (expected.scenario === 'gallery') return !!document.querySelector('[data-moment-card]')
    const visit = JSON.parse(raw)
    const status = visit.queue?.media?.[visit.queue.active]?.status
    const frames = document.querySelectorAll('iframe').length
    const surface = expected.surface === 'cinema' ? 'cinema' : 'stage'
    if (visit.queue?.surface !== surface || status !== expected.playback) return false
    return expected.playback === 'ready' ? frames === 0 : frames === 1
  }, expectedState, { timeout: 20000 })
  } catch (error) {
    const snapshot = await page.evaluate(() => {
      const raw = document.querySelector('[data-visit-state]')?.textContent ?? null
      let visit = null
      try { visit = raw ? JSON.parse(raw) : null } catch { visit = raw }
      const active = visit?.queue?.active
      return {
        href: location.href,
        lens: document.documentElement.dataset.lens,
        theme: document.documentElement.dataset.theme,
        surface: visit?.queue?.surface ?? null,
        active,
        status: active ? visit.queue.media[active]?.status : null,
        frames: [...document.querySelectorAll('iframe')].map(frame => frame.getAttribute('src')),
        text: document.body.innerText.slice(0, 240),
      }
    }).catch(snapshotError => snapshotError.message)
    throw new Error(`${error.message}\nquery ${JSON.stringify(expectedState)}\nsnapshot ${JSON.stringify(snapshot)}`)
  }
}
const visit = () => page.locator('[data-visit-state]').textContent().then(JSON.parse)
async function geometry() {
  return page.evaluate(() => {
    const rect = element => {
      if (!element) return null
      const box = element.getBoundingClientRect()
      return { x: box.x, y: box.y, width: box.width, height: box.height, bottom: box.bottom, right: box.right }
    }
    const dialog = document.querySelector('[data-moments-player-dialog]')
    const cinema = dialog?.getAttribute('data-placement') === 'cinema'
    const list = document.querySelector(cinema ? '[data-moments-player-dialog] [data-moments-list]' : 'main [data-moments-list]')
    const host = document.querySelector('[data-moments-player-host]')
    const small = [...document.querySelectorAll('main *, [data-moments-player-dialog] *')].filter(element => {
      if (!element.getClientRects().length || element.closest('svg') || element.closest('[data-harness-tools]')) return false
      if (element.closest('details:not([open]) > :not(summary)')) return false
      if (![...element.childNodes].some(node => node.nodeType === 3 && node.textContent.trim())) return false
      return parseFloat(getComputedStyle(element).fontSize) < 10
    }).map(element => ({ tag: element.tagName, text: element.textContent.trim().slice(0, 80), size: getComputedStyle(element).fontSize }))
    const shell = document.querySelector('header')?.parentElement
    return {
      width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      anchor: rect(document.querySelector('[data-moments-stage-anchor]')),
      slot: rect(document.querySelector('[data-moments-cinema-slot]')),
      host: rect(host), list: rect(list),
      leadTitle: rect(document.querySelector('[data-lead] h2')),
      leadSource: rect(document.querySelector('[data-lead] [data-source-line]')),
      leadAction: rect(document.querySelector('[data-lead] [data-primary-action]')),
      frame: rect(document.querySelector('.moments-cinema-frame')),
      shell: rect(shell), header: rect(document.querySelector('header')),
      frames: document.querySelectorAll('iframe').length,
      frameSrc: document.querySelector('iframe')?.getAttribute('src') ?? null,
      placement: dialog?.getAttribute('data-placement') ?? null,
      small, version: document.querySelector('header')?.innerText.includes('V0.5.2'),
    }
  })
}
function disjoint(a, b) {
  if (!a || !b) return false
  return a.right <= b.x + 1 || b.right <= a.x + 1 || a.bottom <= b.y + 1 || b.bottom <= a.y + 1
}
async function hitRows() {
  return page.evaluate(() => {
    const dialog = document.querySelector('[data-moments-player-dialog]')
    const cinema = dialog?.getAttribute('data-placement') === 'cinema'
    const list = document.querySelector(cinema ? '[data-moments-player-dialog] [data-moments-list]' : 'main [data-moments-list]')
    const rows = [...(list?.querySelectorAll('[data-queue-id]') ?? [])]
    return rows.map(row => {
      row.scrollIntoView({ block: 'center' })
      const box = row.getBoundingClientRect()
      const y = Math.max(1, Math.min(innerHeight - 2, box.top + box.height / 2))
      const points = [0.05, 0.5, 0.95].map(fraction => {
        const x = box.left + box.width * fraction
        const hit = document.elementFromPoint(Math.min(innerWidth - 2, Math.max(1, x)), y)
        return !!hit && (hit === row || row.contains(hit))
      })
      return { id: row.getAttribute('data-queue-id'), points }
    })
  })
}
let failure
try {
  const runWidths = smoke ? [360, 390, 888] : widths
  const runStates = smoke ? ['ready', 'playing', 'blocked'] : states
  const runLenses = smoke ? ['ledger'] : lenses
  const runThemes = smoke ? ['light'] : themes
  for (const width of runWidths) {
    for (const lens of runLenses) for (const theme of runThemes) {
      await load({ scenario: 'gallery', lens, theme, playback: 'ready', surface: 'stage' }, width)
      const gallery = await geometry()
      assert.equal(gallery.scrollWidth, width, `gallery ${width} ${lens} ${theme} overflow`)
      assert.equal(gallery.frames, 0)
      if (width <= 390) {
        for (const key of ['leadTitle', 'leadSource', 'leadAction']) assert(gallery[key]?.bottom <= 844, `D-04 ${key}`)
        if (width === 360 && lens === 'broadcast') journeys.push({ id: 'D-04', theme, margin: width - gallery.leadTitle.right, lead: gallery.leadTitle })
      }
      if (shotNames.has(`${width}-${lens}-${theme}-gallery`)) {
        const bytes = await page.screenshot({ path: `${output}/${width}-${lens}-${theme}-gallery.png`, fullPage: true, animations: 'disabled' })
        shots.push({ name: `${width}-${lens}-${theme}-gallery`, sha256: crypto.createHash('sha256').update(bytes).digest('hex') })
      }
      for (const surface of ['stage', 'cinema']) for (const playback of runStates) {
        const name = `${width}-${lens}-${theme}-${surface}-${playback}`
        await load({ scenario: 'player', lens, theme, surface, playback }, width)
        if (surface === 'stage') await page.evaluate(() => scrollTo(0, 0))
        const box = await geometry()
        assert.equal(box.scrollWidth, width, `${name} overflow`)
        assert.equal(box.frames, playback === 'ready' ? 0 : 1, `${name} frames`)
        if (box.frames) assert.equal(box.frameSrc, 'about:blank', name)
        assert(box.version, `${name} version`)
        assert(box.shell.width <= 780, `${name} shell ${box.shell.width}`)
        assert.deepEqual(box.small, [], `${name} font floor`)
        const measured = surface === 'cinema' ? box.slot : box.anchor
        assert(measured && measured.width > 0, `${name} missing box`)
        if (playback !== 'ready') {
          assert(box.host && box.host.width > 0, `${name} missing host`)
          assert(Math.abs(box.host.width - measured.width) <= 2 && Math.abs(box.host.height - measured.height) <= 2, `${name} host ${JSON.stringify(box.host)} vs ${JSON.stringify(measured)}`)
        }
        const subject = playback === 'ready' ? measured : box.host
        assert(disjoint(subject, box.list), `${name} intersects queue`)
        if (width <= 390) {
          assert(measured.height >= 200, `${name} phone height ${measured.height}`)
          assert(Math.abs(measured.height - Math.max(measured.width * 9 / 16, 200)) <= 2, `${name} phone grow`)
          assert(measured.width >= width - 48, `${name} phone width ${measured.width}`)
          assert(box.list.y >= measured.bottom - 1, `${name} list covered`)
        } else if (width < 888) {
          assert(box.list.y >= measured.bottom - 1, `${name} should stack`)
        } else {
          assert(box.list.x >= measured.right - 2 && box.list.y < measured.bottom, `${name} should sit beside`)
          assert(measured.width >= 480 && measured.height >= 270, `${name} side-by-side size`)
        }
        if (surface === 'cinema') assert(box.frame.width <= 1441, `${name} cinema frame`)
        const hits = await hitRows()
        assert(hits.length >= 1 && hits.every(hit => hit.points.every(Boolean)), `${name} hit ${JSON.stringify(hits)}`)
        if ((width === 360 || width === 390) && surface === 'stage' && playback === 'playing') {
          await page.evaluate(() => new Promise(resolve => {
            scrollTo({ top: 280, left: 0, behavior: 'instant' })
            requestAnimationFrame(() => requestAnimationFrame(resolve))
          }))
          const scrolled = await geometry()
          const delta = {
            x: Math.abs(scrolled.anchor.x - scrolled.host.x), y: Math.abs(scrolled.anchor.y - scrolled.host.y),
            width: Math.abs(scrolled.anchor.width - scrolled.host.width), height: Math.abs(scrolled.anchor.height - scrolled.host.height),
          }
          assert(delta.x <= 2 && delta.y <= 2 && delta.width <= 2 && delta.height <= 2, `${name} scroll ${JSON.stringify(delta)}`)
          journeys.push({ id: 'scroll', width, lens, theme, delta, anchor: scrolled.anchor, host: scrolled.host })
          await page.evaluate(() => scrollTo(0, 0))
        }
        if (shotNames.has(name)) {
          const bytes = await page.screenshot({ path: `${output}/${name}.png`, fullPage: surface !== 'cinema', animations: 'disabled' })
          shots.push({ name, sha256: crypto.createHash('sha256').update(bytes).digest('hex') })
        }
        cells.push({ name, width, lens, theme, surface, playback, box: measured, host: box.host, list: box.list, frames: box.frames })
      }
    }
    await fs.writeFile(`${output}/progress.json`, JSON.stringify({ completed: cells.length, lastWidth: width }))
    console.log(`Player matrix: ${cells.length} cells through ${width}px`)
  }
  if (!smoke) {
    for (const width of [360, 390, 887, 888, 1440]) for (const lens of lenses) for (const theme of themes) {
      await load({ scenario: 'player', lens, theme, surface: 'stage', playback: 'playing' }, width)
      const before = await visit()
      await page.getByRole('radio', { name: lens === 'broadcast' ? 'Poster' : 'Broadcast' }).click()
      const switched = await visit()
      assert.equal(switched.queue.media[switched.queue.active].status, 'playing', `lens ${width}`)
      assert.equal(switched.queue.media[switched.queue.active].attempt, before.queue.media[before.queue.active].attempt)
      assert.equal(switched.plays, before.plays)
      journeys.push({ id: 'lens-switch', width, lens, theme, pass: true })
      await load({ scenario: 'player', lens, theme, surface: 'stage', playback: 'playing' }, width)
      const playing = await visit()
      await page.getByRole('button', { name: '← Gallery' }).click()
      const returned = await visit()
      assert.equal(returned.queue.surface, 'gallery')
      assert.equal(returned.queue.media[playing.queue.active].status, 'paused')
      journeys.push({ id: 'gallery-return', width, lens, theme, pass: true })
      await load({ scenario: 'player', lens, theme, surface: 'stage', playback: 'playing' }, width)
      const live = await visit()
      await page.getByRole('button', { name: 'Fixtures', exact: true }).click()
      await page.getByRole('button', { name: 'Moments', exact: true }).click()
      const back = await visit()
      assert.equal(back.queue.surface, 'gallery')
      assert.equal(back.queue.media[live.queue.active].status, 'paused')
      assert.equal(back.plays, live.plays)
      assert.equal(back.queue.media[live.queue.active].attempt, live.queue.media[live.queue.active].attempt + 1)
      journeys.push({ id: 'tab-away', width, lens, theme, pass: true })
    }
    for (const lens of lenses) for (const theme of themes) {
      await load({ scenario: 'player', lens, theme, surface: 'stage', playback: 'playing0' }, 390)
      const zero = await visit()
      assert.equal(zero.queue.media[zero.queue.active].position, 0)
      assert.equal(zero.queue.media[zero.queue.active].status, 'playing')
      await page.getByRole('button', { name: 'Enter Cinema' }).click()
      await page.getByRole('button', { name: 'Exit Cinema' }).click()
      const still = await visit()
      assert.equal(still.queue.media[still.queue.active].status, 'playing')
      assert.equal(still.queue.media[still.queue.active].position, 0)
      journeys.push({ id: 'playing-zero', lens, theme, pass: true })
    }
    for (const width of [390, 1440]) for (const lens of lenses) for (const theme of themes) {
      await load({ scenario: 'player', lens, theme, surface: 'stage', playback: 'ready' }, width)
      const trail = []
      for (let step = 0; step < 40; step++) {
        await page.keyboard.press('Tab')
        const focus = await page.evaluate(() => ({ text: document.activeElement?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 60), play: document.activeElement?.textContent?.trim() === 'Play' }))
        trail.push(focus.text)
        if (focus.play) break
      }
      assert.equal(trail.at(-1), 'Play', `keyboard Play ${width} ${lens} ${theme}`)
      await page.keyboard.press('Enter')
      await page.waitForFunction(() => document.querySelector('iframe')?.getAttribute('src') === 'about:blank')
      await page.keyboard.press('Shift+Tab')
      await page.keyboard.press('Tab')
      assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), 'Enter Cinema')
      await page.keyboard.press('Enter')
      await page.waitForFunction(() => document.activeElement?.hasAttribute('data-cinema-exit'))
      let wrapped = false
      for (let step = 0; step < 16; step++) {
        await page.keyboard.press('Tab')
        if (await page.evaluate(() => document.activeElement?.tagName === 'IFRAME')) { wrapped = true; break }
      }
      assert(wrapped, `keyboard wrap ${width} ${lens} ${theme}`)
      await page.keyboard.press('Shift+Tab')
      assert.notEqual(await page.evaluate(() => document.activeElement?.tagName), 'IFRAME')
      await page.keyboard.press('Escape')
      await page.waitForFunction(() => JSON.parse(document.querySelector('[data-visit-state]').textContent).queue.surface === 'stage')
      assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), 'Enter Cinema')
      await page.keyboard.press('Enter')
      await page.keyboard.press('Enter')
      assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), 'Enter Cinema')
      await page.keyboard.press('Enter')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')
      await page.waitForFunction(() => document.activeElement === document.querySelector('.moments-edition-head h1'))
      const kept = await visit()
      assert.equal(kept.queue.surface, 'gallery')
      assert.equal(kept.queue.active, kept.queue.history[0])
      journeys.push({ id: 'keyboard', width, lens, theme, trail, pass: true })
    }
    for (const lens of lenses) for (const theme of themes) {
      for (const input of ['mouse', 'keyboard']) {
        await load({ scenario: 'player', lens, theme, surface: 'cinema', playback: 'playing' }, 390)
        const row = page.locator('[data-moments-player-dialog] [data-queue-id="sXAkBsEcXSo"]')
        if (input === 'mouse') await row.click()
        else { await row.focus(); await page.keyboard.press('Enter') }
        const visible = await page.evaluate(() => {
          const dialog = document.querySelector('[data-moments-player-dialog]')
          const slot = document.querySelector('[data-moments-cinema-slot]').getBoundingClientRect()
          const action = dialog.querySelector('[data-primary-action]').getBoundingClientRect()
          const view = dialog.getBoundingClientRect()
          return {
            focused: document.activeElement?.hasAttribute('data-primary-action'),
            slot: slot.top >= view.top - 1 && slot.bottom <= view.bottom + 1,
            action: action.top >= view.top - 1 && action.bottom <= view.bottom + 1,
          }
        })
        assert(visible.focused && visible.slot && visible.action, `D-15 ${lens} ${theme} ${input} ${JSON.stringify(visible)}`)
        if (lens === 'poster' && theme === 'light' && input === 'mouse') {
          const bytes = await page.screenshot({ path: `${output}/390-poster-light-cinema-playing-d15.png`, animations: 'disabled' })
          shots.push({ name: '390-poster-light-cinema-playing-d15', sha256: crypto.createHash('sha256').update(bytes).digest('hex') })
        }
        journeys.push({ id: 'D-15', lens, theme, input, pass: true })
      }
    }
    for (const width of [360, 390, 768, 1000, 1440]) for (const lens of lenses) for (const theme of themes) {
      for (const surface of ['stage', 'cinema']) {
        for (const refused of [false, true]) {
          await load({ scenario: 'player', lens, theme, surface: 'stage', playback: 'ready' }, width)
          if (refused) await page.getByRole('button', { name: 'Refuse storage writes' }).click()
          if (surface === 'cinema') await page.getByRole('button', { name: 'Enter Cinema' }).click()
          const root = surface === 'cinema' ? page.locator('[data-moments-player-dialog]') : page.locator('.moments-stage-main')
          const save = root.locator('[data-save]')
          const boxes = () => root.locator('[data-save], [data-primary-action]').evaluateAll(elements => elements.map(element => {
            const box = element.getBoundingClientRect()
            const dialog = element.closest('[data-moments-player-dialog]')
            const fixed = dialog instanceof HTMLElement && getComputedStyle(dialog).position === 'fixed'
            return {
              x: box.x + (fixed ? dialog.scrollLeft : window.scrollX),
              y: box.y + (fixed ? dialog.scrollTop : window.scrollY),
              width: box.width, height: box.height,
            }
          }))
          for (let press = 0; press < 2; press++) {
            const before = await boxes()
            await save.click()
            const after = await boxes()
            before.forEach((box, index) => Object.keys(box).forEach(key => assert(Math.abs(box[key] - after[index][key]) <= 1, `D-17 ${width} ${lens} ${theme} ${surface} ${refused} ${key}`)))
          }
          const statuses = await root.locator('[role=status]').count()
          assert.equal(statuses, 1, `D-19 ${surface}`)
          journeys.push({ id: 'D-17', width, lens, theme, surface, refused, pass: true })
        }
      }
    }
    for (const width of [1160, 1250]) for (const lens of lenses) for (const theme of themes) {
      await load({ scenario: 'gallery', lens, theme, playback: 'ready', surface: 'stage' }, width)
      for (const tab of ['Fixtures', 'Table', 'Moments']) {
        await page.getByRole('button', { name: tab, exact: true }).click()
        const box = await geometry()
        assert.equal(box.scrollWidth, width, `H-B ${width} ${tab}`)
        assert(box.shell.width <= 780, `H-B shell ${width}`)
        journeys.push({ id: 'H-B', width, lens, theme, tab, shell: box.shell.width, pass: true })
      }
    }
  }
  assert.deepEqual(errors, [])
  assert(!requests.some(request => request.mediaProvider || request.unexpected || request.failed))
} catch (error) {
  failure = error.stack
  console.error(failure)
} finally {
  const fonts = {}
  for (const request of requests) {
    const host = new URL(request.url).host
    fonts[host] = (fonts[host] ?? 0) + 1
  }
  const receipt = { browser: browser.version(), runtime, chrome, origin, dateUtc: new Date().toISOString(), cells: cells.length, journeys, shots,
    requests: { total: requests.length, fonts, mediaProvider: requests.filter(request => request.mediaProvider).length, unexpected: requests.filter(request => request.unexpected).length, failed: requests.filter(request => request.failed).length },
    errors, failure }
  await fs.writeFile(`${output}/player-receipt.json`, JSON.stringify(receipt))
  await fs.writeFile(`${output}/cells.json`, JSON.stringify(cells))
  await browser.close()
}
if (failure) process.exitCode = 1
else console.log(JSON.stringify({ cells: cells.length, journeys: journeys.length, shots: shots.length, requests: requests.length, errors }))
