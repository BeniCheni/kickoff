import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import path from 'node:path'

/** Chromium's snapshot omits aria-current and aria-live. Record the corresponding
 * DOM attributes alongside the serialised tree, retaining both sources. */
export async function captureRackAccessibility(browser, origin, date, app, out) {
  const context = await browser.createBrowserContext()
  try {
    const page = await context.newPage()
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 })
    await page.goto(origin + '/?date=' + date + '&league=pl', { waitUntil: 'networkidle0' })
    const rack = await page.$('.poster-rack')
    const markerIndex = await page.$$eval('.rack-marker', els =>
      (els.findIndex(el => el.hasAttribute('aria-current')) + 1) % els.length)
    const [slide, marker] = await Promise.all(['.rack-slide', '.rack-marker'].map(async selector =>
      (await page.$$(selector))[markerIndex]))
    const stop = await page.$('.rack-stop')
    async function snapshot() {
      const tree = await page.accessibility.snapshot({ interestingOnly: false, root: rack })
      const nodes = {}
      for (const [kind, el] of Object.entries({ rack, slide, marker, stop })) {
        const ax = await page.accessibility.snapshot({ interestingOnly: false, root: el })
        assert.ok(ax, kind + ' missing from the accessibility tree')
        const dom = await el.evaluate(node => ({
          roledescription: node.getAttribute('aria-roledescription'), current: node.getAttribute('aria-current'),
        }))
        nodes[kind] = { role: ax.role, name: ax.name, roledescription: ax.roledescription ?? dom.roledescription, current: dom.current }
      }
      const live = await page.$eval('.rack-faces', el => el.getAttribute('aria-live'))
      return { tree, nodes, live }
    }
    const before = await snapshot()
    await marker.click()
    const after = await snapshot()
    assert.equal(before.live, 'off')
    assert.equal(after.live, 'polite')
    assert.equal(before.nodes.marker.current, null)
    assert.equal(after.nodes.marker.current, 'true')
    assert.equal(before.nodes.slide.name, after.nodes.marker.name)
    assert.equal(before.nodes.rack.roledescription, 'carousel')
    assert.equal(after.nodes.slide.roledescription, 'slide')
    const label = 'accessibility tree, not a VoiceOver transcript'
    writeFileSync(path.join(out, app + '-rack-accessibility.json'), JSON.stringify({ label, width: 390, before, after }, null, 2))
    return { label, before: before.nodes, after: after.nodes, live: [before.live, after.live] }
  } finally { await context.close() }
}

/** Drive the production Rack's monotonic time source. A visibility sample wakes a
 * pending hold timer. The browser still lays out and paints each observed frame. */
export async function proveRackCrossing(browser, origin, date, width) {
  const context = await browser.createBrowserContext()
  try {
    const page = await context.newPage()
    await page.setViewport({ width, height: 844, deviceScaleFactor: 1 })
    await page.evaluateOnNewDocument(() => {
      window.rackTestTime = 0
      Object.defineProperty(performance, 'now', { value: () => window.rackTestTime })
      localStorage.setItem('kickoff-motion', 'on')
    })
    await page.goto(origin + '/?date=' + date, { waitUntil: 'networkidle0' })
    await page.evaluate(() => document.fonts.ready)
    const first = await page.$eval('.rack-marker[aria-current]', el => el.ariaLabel)
    const samples = []
    for (let i = 0; i <= 108; i++) {
      const ms = i * 1000 / 60
      const sample = await page.evaluate(async time => {
        window.rackTestTime = 9000 + time
        document.dispatchEvent(new Event('visibilitychange'))
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        const faces = document.querySelector('.rack-faces')
        const center = faces.getBoundingClientRect().x + faces.clientWidth / 2
        const titles = [...faces.querySelectorAll('.rack-slide')].flatMap(slide => {
          const title = slide.querySelector('.book-title-block').getBoundingClientRect()
          const alpha = Number(getComputedStyle(slide).opacity)
          if (!alpha || title.left >= center || title.right <= center || getComputedStyle(slide).visibility === 'hidden') return []
          return [{ date: slide.dataset.date, box: [title.x, title.y, title.width, title.height], opacity: alpha }]
        })
        const marker = document.querySelector('.rack-marker[aria-current]')
        return { titles, marker: marker.ariaLabel, underline: getComputedStyle(marker.querySelector('span')).boxShadow,
          live: faces.getAttribute('aria-live') }
      }, ms)
      assert.ok(sample.titles.length <= 1, 'both title blocks visible at ' + ms)
      assert.equal(sample.live, 'off')
      assert.notEqual(sample.underline, 'none')
      assert.equal(sample.marker === first, ms < 1450, 'marker timing at ' + ms)
      samples.push({ ms, ...sample })
    }
    const outgoing = samples[0].titles[0]
    const incoming = samples.at(-1).titles[0]
    assert.notEqual(outgoing.date, incoming.date)
    for (const { ms, titles } of samples) {
      for (const t of titles) assert.deepEqual(t.box, t.date === outgoing.date ? outgoing.box : incoming.box, 'moving title at ' + ms)
      if (ms >= 1560) assert.ok(titles.every(t => t.date !== outgoing.date))
      if (ms >= 1670) assert.deepEqual(titles, [incoming])
    }
    assert.equal(incoming.opacity, 1)
    return { width, frames: samples.length, firstNewMarkerMs: samples.find(s => s.marker !== first).ms,
      lastOutgoingMs: samples.findLast(s => s.titles[0]?.date === outgoing.date).ms,
      settledMs: samples.find(s => s.titles[0]?.date === incoming.date && s.titles[0]?.opacity === 1).ms }
  } finally { await context.close() }
}
