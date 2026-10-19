// Demo-on Moments proof. PNGs stay outside the repo; the receipt keeps their SHA-256s.
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const origin = process.env.KICKOFF_NEXT_ORIGIN ?? 'http://127.0.0.1:5196'
const outDir = path.resolve(process.argv[2] ?? '/tmp/kickoff-n4c-demo')
const receiptPath = path.resolve(process.argv[3] ?? fileURLToPath(new URL('../verification/n4c-demo.json', import.meta.url)))
mkdirSync(outDir, { recursive: true })
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const shots = []
const assertions = []
const logs = []
function check(name, ok, detail) {
  assertions.push({ name, ok: Boolean(ok), ...(detail === undefined ? {} : { detail }) })
  console.log(ok ? 'OK' : 'FAIL', name)
}

async function shoot(page, name) {
  const png = await page.screenshot({ fullPage: true })
  const file = path.join(outDir, `${name}.png`)
  writeFileSync(file, png)
  const box = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    inner: window.innerWidth,
    text: document.body.innerText,
  }))
  shots.push({ name, sha256: hash(png), bytes: png.length, scrollWidth: box.scroll, innerWidth: box.inner })
  check(`scroll ${name}`, box.scroll === box.inner, box)
  return box.text
}

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] })
try {
  const lenses = ['ledger', 'poster', 'broadcast']
  const themes = ['light', 'dark']
  const widths = [360, 375, 390, 1000]
  for (const lens of lenses) for (const theme of themes) for (const width of widths) {
    const page = await browser.newPage()
    page.on('console', message => { if (message.type() === 'warning' || message.type() === 'error') logs.push(`${lens}-${theme}-${width} ${message.text()}`) })
    page.on('pageerror', error => logs.push(String(error)))
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 })
    await page.evaluateOnNewDocument(themeName => {
      localStorage.setItem('kickoff-theme', themeName)
      localStorage.setItem('kickoff-theme-broadcast', themeName)
      const play = HTMLMediaElement.prototype.play
      HTMLMediaElement.prototype.play = function () {
        this.loop = true
        return play.apply(this, arguments)
      }
    }, theme)
    const params = new URLSearchParams({ tab: 'moments', ...(lens === 'poster' ? {} : { lens }) })
    await page.goto(`${origin}/?${params}`, { waitUntil: 'networkidle0' })
    await page.waitForFunction(() => document.body.innerText.includes('views ·'))
    const gallery = await shoot(page, `gallery-${lens}-${theme}-${width}`)
    check(`gallery counts ${lens}-${theme}-${width}`, gallery.includes('views ·') && gallery.includes('Sample reactions'), gallery.slice(0, 240))
    await page.click('h2 a')
    await page.waitForFunction(() => document.body.innerText.includes('Playing muted.') || document.body.innerText.includes('Sound on'))
    await page.evaluate(() => { const video = document.querySelector('video'); if (video) video.loop = true })
    const arrival = await page.evaluate(() => ({
      mutedLine: document.body.innerText.includes('Playing muted. Unmute beside the player.'),
      sound: document.body.innerText.includes('Sound on'),
      stored: localStorage.getItem('kickoff-moments-sound-v1'),
    }))
    const muted = await shoot(page, `watch-muted-${lens}-${theme}-${width}`)
    check(
      `watch arrival ${lens}-${theme}-${width}`,
      arrival.mutedLine
        ? muted.includes('Unmute')
        : arrival.sound && arrival.stored === 'on',
      arrival,
    )
    if (arrival.mutedLine) {
      await page.evaluate(() => [...document.querySelectorAll('button')].find(button => button.textContent.trim() === 'Unmute')?.click())
      await page.waitForFunction(() => document.body.innerText.includes('Sound on') || [...document.querySelectorAll('button')].some(button => button.textContent.trim() === 'Mute'))
    }
    await shoot(page, `watch-sound-${lens}-${theme}-${width}`)
    await page.waitForFunction(() => {
      const button = document.querySelector('.moments-reactions button')
      return button && Object.keys(button).some(key => key.startsWith('__reactProps'))
    })
    await page.evaluate(() => document.querySelector('.moments-reactions button')?.click())
    await page.waitForFunction(() => document.querySelector('.moments-reactions button')?.getAttribute('aria-pressed') === 'true')
    const pressed = await page.$eval('.moments-reactions button', button => button.getAttribute('aria-pressed'))
    check(`reaction pressed ${lens}-${theme}-${width}`, pressed === 'true')
    await shoot(page, `reaction-${lens}-${theme}-${width}`)
    await page.waitForSelector('button[aria-expanded]')
    await page.evaluate(() => document.querySelector('button[aria-expanded]')?.click())
    await shoot(page, `reply-${lens}-${theme}-${width}`)
    const order = await page.$$('[aria-label="Comment order"] button')
    if (order[1]) await page.evaluate(() => document.querySelectorAll('[aria-label="Comment order"] button')[1]?.click())
    await shoot(page, `comments-newest-${lens}-${theme}-${width}`)
    await page.type('textarea', 'A kind note from this page.')
    await page.evaluate(() => document.querySelector('form button[type="submit"]')?.click())
    const local = await page.evaluate(() => document.body.innerText.includes('Only on this page; not saved') && document.body.innerText.includes('A kind note from this page.'))
    check(`local comment ${lens}-${theme}-${width}`, local)
    await shoot(page, `comment-${lens}-${theme}-${width}`)
    await page.evaluate(() => document.querySelector('video')?.dispatchEvent(new Event('ended')))
    await page.waitForSelector('.moments-ring')
    await shoot(page, `countdown-${lens}-${theme}-${width}`)
    await page.close()
  }
  const preview = await browser.newPage()
  await preview.setViewport({ width: 1000, height: 900, deviceScaleFactor: 1 })
  const media = []
  preview.on('request', request => { if (request.url().includes('.mp4')) media.push(request.url()) })
  await preview.goto(`${origin}/?tab=moments`, { waitUntil: 'networkidle0' })
  const before = media.length
  await preview.hover('.moments-card')
  await preview.waitForFunction(() => document.querySelector('.moments-preview-video')?.getAttribute('src'))
  await new Promise(resolve => setTimeout(resolve, 300))
  check('hover preview requests one file', media.length === before + 1, media)
  await preview.hover('h1')
  await preview.waitForFunction(() => !document.querySelector('.moments-preview-video')?.getAttribute('src'))
  await shoot(preview, 'preview-hover-1000')
  const reduced = await browser.newPage()
  await reduced.setViewport({ width: 1000, height: 900, deviceScaleFactor: 1 })
  const reducedMedia = []
  reduced.on('request', request => { if (request.url().includes('.mp4')) reducedMedia.push(request.url()) })
  await reduced.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await reduced.goto(`${origin}/?tab=moments`, { waitUntil: 'networkidle0' })
  const reducedBefore = reducedMedia.length
  await reduced.hover('.moments-card')
  await new Promise(resolve => setTimeout(resolve, 700))
  check('reduced motion makes no preview request', reducedMedia.length === reducedBefore, reducedMedia)
  await reduced.close()
  const touch = await browser.newPage()
  await touch.setViewport({ width: 390, height: 900, deviceScaleFactor: 1, hasTouch: true, isMobile: true })
  const touchMedia = []
  touch.on('request', request => { if (request.url().includes('.mp4') && request.frame() === touch.mainFrame()) touchMedia.push(new URL(request.url()).pathname) })
  await touch.goto(`${origin}/?tab=moments`, { waitUntil: 'networkidle0' })
  const galleryMedia = touchMedia.filter(url => !url.includes('watch'))
  check('touch gallery makes no video request', !await touch.$('video[src]') && galleryMedia.length === 0, touchMedia)
  await touch.close()
  await preview.close()
  for (const [name, route] of [['empty', 'empty'], ['unavailable', 'unavailable']]) {
    const host = process.env[`KICKOFF_${name.toUpperCase()}_ORIGIN`]
    if (!host) { check(`${name} origin`, false, 'set the env'); continue }
    const page = await browser.newPage()
    await page.setViewport({ width: 390, height: 900, deviceScaleFactor: 1 })
    await page.goto(`${host}/?tab=moments`, { waitUntil: 'networkidle0' })
    const text = await shoot(page, `${name}-390`)
    check(name, name === 'empty' ? (text.includes('0 of 0') || text.includes('0 / 0')) : text.includes('The gallery is unavailable.'))
    await page.close()
  }
  const pm1 = await browser.newPage()
  await pm1.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 })
  await pm1.evaluateOnNewDocument(() => {
    const start = performance.now()
    window.__pm1 = []
    const timer = setInterval(() => {
      const video = document.querySelector('video')
      if (!video || !video.getAttribute('src')) return
      const labels = [...document.querySelectorAll('button')].map(button => button.textContent.trim())
      window.__pm1.push({
        t: performance.now() - start,
        paused: video.paused,
        muted: video.muted,
        line: document.body.innerText.includes('Playing muted. Unmute beside the player.'),
        play: labels.includes('Play'),
      })
    }, 20)
    setTimeout(() => clearInterval(timer), 1600)
  })
  await pm1.goto(`${origin}/?tab=fixtures`, { waitUntil: 'networkidle0' })
  await pm1.evaluate(() => localStorage.setItem('kickoff-moments-sound-v1', 'on'))
  await pm1.goto(`${origin}/?tab=moments&watch=stub-fenway-one`, { waitUntil: 'domcontentloaded' })
  await new Promise(resolve => setTimeout(resolve, 1700))
  const samples = await pm1.evaluate(() => window.__pm1)
  const stored = await pm1.evaluate(() => localStorage.getItem('kickoff-moments-sound-v1'))
  const hit = samples.find(sample => sample.t <= 1500 && sample.paused === false && sample.muted === true && sample.line && sample.play === false)
  check('stored on retries muted within 1.5s', Boolean(hit) && stored === 'on', { stored, hit })
  await pm1.close()
} finally {
  await browser.close()
}
const failed = assertions.filter(item => !item.ok).map(item => item.name)
const receipt = { origin, shots, assertions, console: logs, failed }
writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n')
console.log(JSON.stringify({ shots: shots.length, failed }, null, 2))
if (failed.length || logs.length) process.exitCode = 1
