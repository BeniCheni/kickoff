// Synthetic frame stacking only: no provider continuation, dependency or application seam.
import fs from 'node:fs/promises'
import path from 'node:path'
import http from 'node:http'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { dnsGuard, providerHost, apiUrl } from './policy.ts'

const [runtime, chrome, distArg, stubArg, out] = process.argv.slice(2)
if (!out) throw new Error('Usage: node --import tsx check-cinema-repair.mjs <runtime> <chrome> <dist-acceptance> <youtube-stub.js> <new-output-dir>')
const dist = await fs.realpath(distArg), stub = await fs.readFile(stubArg, 'utf8')
await fs.mkdir(out)
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost')
    const file = path.resolve(dist, '.' + (url.pathname === '/' ? '/index.html' : url.pathname))
    assert(file.startsWith(dist + path.sep))
    res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html')
    res.end(await fs.readFile(file))
  } catch { res.writeHead(404); res.end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`
const { chromium } = await import(runtime)
const browser = await chromium.launch({ executablePath: chrome, headless: true, chromiumSandbox: true, args: [dnsGuard] })
const result = { browser: browser.version(), origin, providerContinuations: 0, cells: [], edges: [], failures: [] }
const colour = [34, 51, 68, 255]
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex')
try {
  for (const width of [390, 1000, 360, 375, 887, 888]) for (const transparent of [false, true]) {
    const viewport = { width, height: width <= 390 ? 844 : width <= 888 ? 1024 : 900 }
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce', serviceWorkers: 'block' })
    const handled = new WeakSet(), escaped = [], errors = [], fulfilled = [], aborted = []
    await context.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url())
      if (providerHost(url.hostname)) {
        handled.add(request)
        if (url.href === apiUrl) {
          fulfilled.push(url.href)
          return route.fulfill({ contentType: 'text/javascript', body: stub })
        }
        if (url.hostname === 'www.youtube-nocookie.com' && /^\/embed\/S4Accept00[12]$/.test(url.pathname)) {
          fulfilled.push(url.href)
          return route.fulfill({ contentType: 'text/html', body: `<!doctype html><style>html,body{margin:0;width:100%;height:100%;background:${transparent ? 'transparent' : '#223344'}}</style><title>Synthetic frame</title>` })
        }
        aborted.push(url.href)
        return route.abort()
      }
      if (url.origin !== origin && !['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) return route.abort()
      return route.continue()
    })
    context.on('response', response => {
      if (providerHost(new URL(response.url()).hostname) && !handled.has(response.request())) escaped.push(response.url())
    })
    const page = await context.newPage()
    page.on('pageerror', error => errors.push(error.message))
    const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    const click = async name => {
      const cinema = await page.locator('[data-moments-player-dialog]').getAttribute('data-placement') === 'cinema'
      const root = cinema ? page.locator('[data-moments-player-dialog]') : page
      const button = root.getByRole('button', { name, exact: typeof name === 'string' })
      await button.scrollIntoViewIfNeeded(); await settle(); await button.click(); await settle()
    }
    const probe = () => page.evaluate(() => {
      const frame = document.querySelector('iframe'), host = document.querySelector('[data-moments-player-host]')
      const dialog = document.querySelector('[data-moments-player-dialog]')
      const slot = document.querySelector(dialog.dataset.placement === 'cinema' ? '[data-moments-cinema-slot]' : '[data-moments-stage-anchor]')
      const rect = (frame && !host.hasAttribute('inert') ? frame : slot).getBoundingClientRect()
      const points = [[rect.x + rect.width / 2, rect.y + rect.height / 2], [rect.x + 8, rect.y + 8],
        [rect.right - 8, rect.y + 8], [rect.x + 8, rect.bottom - 8], [rect.right - 8, rect.bottom - 8]]
      return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth, placement: dialog.dataset.placement,
        frames: document.querySelectorAll('iframe').length, host: host.getBoundingClientRect().toJSON(),
        slot: slot.getBoundingClientRect().toJSON(), inert: host.hasAttribute('inert'), display: getComputedStyle(host).display,
        hits: points.map(([x, y]) => { const hit = document.elementFromPoint(x, y); return { x, y, iframe: hit === frame, cover: !!hit?.closest('.moments-cover'), node: hit?.tagName, className: hit?.getAttribute('class') } }) }
    })
    const capture = async (name, clip) => {
      await page.setViewportSize(viewport); await settle()
      assert(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth), 'capture overflow')
      return page.screenshot({ path: path.join(out, name), ...(clip ? { clip } : {}), animations: 'disabled' })
    }
    try {
      await page.goto(origin + '/?tab=moments&lens=ledger')
      await page.evaluate(() => document.fonts.ready)
      await page.locator('[data-lead]').getByRole('button', { name: /Open selection/ }).click()
      await click('Enter Cinema')
      const beforePlay = await probe()
      assert.equal(beforePlay.frames, 0)
      assert(beforePlay.hits.every(hit => hit.cover), 'cover before first Play')
      await click('Exit Cinema'); await click('Play')
      await page.waitForFunction(() => window.__players?.length === 1)
      await page.evaluate(() => window.__players[0].__ready())
      await page.getByRole('button', { name: 'Pause', exact: true }).waitFor()
      await page.locator('iframe').scrollIntoViewIfNeeded(); await settle()
      const stage = await probe()
      assert(stage.hits.every(hit => hit.iframe), 'stage frame hit-test')
      await page.evaluate(() => { window.__repairFrame = document.querySelector('iframe'); window.__repairParent = window.__repairFrame.parentElement })
      await click('Enter Cinema')
      const cinema = await probe()
      assert.equal(cinema.scrollWidth, width)
      assert.equal(cinema.frames, 1)
      for (const key of ['x', 'y', 'width', 'height']) assert(Math.abs(cinema.host[key] - cinema.slot[key]) <= 1 / 64, `slot alignment ${key}`)
      const cellFailures = []
      if (!cinema.hits.every(hit => hit.iframe)) cellFailures.push('five-point frame hit-test')
      let pixels = null
      if (!transparent) {
        // Sample wholly interior device pixels, including every pixel along the perimeter.
        // Integer clipping avoids mistaking fractional boundary antialiasing for slot bleed.
        const r = cinema.slot, x = Math.ceil(r.x), y = Math.ceil(r.y)
        const clip = { x, y, width: Math.floor(r.right) - x, height: Math.floor(r.bottom) - y }
        const png = await capture(`slot-${width}.png`, clip)
        pixels = await page.evaluate(async ({ data, colour }) => {
          const image = new Image(); image.src = 'data:image/png;base64,' + data; await image.decode()
          const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height
          const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0)
          const { width: w, height: h } = canvas, rgba = ctx.getImageData(0, 0, w, h).data
          const pixel = (x, y) => Array.from(rgba.slice((y * w + x) * 4, (y * w + x) * 4 + 4))
          const matches = p => p.every((value, i) => value === colour[i])
          const points = [[Math.floor(w / 2), Math.floor(h / 2)], [8, 8], [w - 9, 8], [8, h - 9], [w - 9, h - 9]]
          let perimeterFailures = 0
          for (let x = 0; x < w; x++) for (const y of [0, h - 1]) if (!matches(pixel(x, y))) perimeterFailures++
          for (let y = 1; y < h - 1; y++) for (const x of [0, w - 1]) if (!matches(pixel(x, y))) perimeterFailures++
          return { width: w, height: h, points: points.map(([x, y]) => ({ x, y, rgba: pixel(x, y), match: matches(pixel(x, y)) })), perimeterFailures }
        }, { data: png.toString('base64'), colour })
        if (!pixels.points.every(point => point.match) || pixels.perimeterFailures) cellFailures.push('opaque frame pixels')
        await capture(`cinema-${width}.png`)
      }
      await click(/^Next:/)
      await page.locator('[data-moments-cinema-slot]').scrollIntoViewIfNeeded(); await settle()
      const clipped = await probe()
      assert.equal(clipped.host.width, 0); assert.equal(clipped.host.height, 0)
      assert.equal(clipped.inert, true); assert.notEqual(clipped.display, 'none')
      assert(clipped.hits.every(hit => hit.cover), 'next selection cover')
      const visible = await capture(`clipped-${width}-${transparent}.png`)
      await page.locator('[data-moments-player-host]').evaluate(host => { host.style.visibility = 'hidden' })
      const hidden = await capture(`clipped-control-${width}-${transparent}.png`)
      assert.equal(hash(visible), hash(hidden), 'zero-sized host paints no pixels')
      await page.locator('[data-moments-player-host]').evaluate(host => { host.style.visibility = '' })
      assert(await page.evaluate(() => document.querySelector('iframe') === window.__repairFrame && window.__repairFrame.parentElement === window.__repairParent), 'frame identity and parent')
      await click('Exit Cinema'); await click('← Gallery')
      const parked = await page.locator('[data-moments-player-dialog]').evaluate(dialog => ({ placement: dialog.dataset.placement, inert: dialog.hasAttribute('inert'), rect: dialog.getBoundingClientRect().toJSON() }))
      assert.equal(parked.placement, 'parked'); assert.equal(parked.inert, true)
      assert.equal(parked.rect.width, 0); assert.equal(parked.rect.height, 0)
      assert.deepEqual(escaped, []); assert.deepEqual(errors, []); assert.deepEqual(aborted, [])
      const cell = { width, transparent, beforePlay, stage, cinema, pixels, clipped, clippedCaptureSha256: hash(visible), parked, fulfilled: fulfilled.length, escaped, errors, failures: cellFailures }
      result[[390, 1000, 360].includes(width) ? 'cells' : 'edges'].push(cell)
      if (cellFailures.length) result.failures.push({ width, transparent, failures: cellFailures })
    } finally { await context.close() }
  }
  assert.equal(result.cells.length, 6); assert.equal(result.edges.length, 6)
  assert.equal(result.failures.length, 0, `${result.failures.length} repaired-state cells failed`)
} catch (error) { result.failure = error.stack; process.exitCode = 1 }
finally {
  await browser.close(); await new Promise(resolve => server.close(resolve))
  await fs.writeFile(path.join(out, 'cinema-repair.json'), JSON.stringify(result, null, 2))
}
console.log(JSON.stringify({ cells: result.cells.length, edgeCells: result.edges.length, failedCells: result.failures.length, failure: result.failure, providerContinuations: result.providerContinuations }))
