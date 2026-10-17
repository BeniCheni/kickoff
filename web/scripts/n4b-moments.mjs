// Moments states, media, and history. Screenshots stay outside the repo.
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const origin = process.env.KICKOFF_NEXT_ORIGIN ?? 'http://127.0.0.1:5175'
const outDir = path.resolve(process.argv[2] ?? '/tmp/kickoff-n4b-moments')
mkdirSync(outDir, { recursive: true })

const lenses = ['ledger', 'poster', 'broadcast']
const themes = ['light', 'dark']
const widths = [360, 375, 390, 1000]
const shots = []
const assertions = []

function check(name, ok, detail = '') {
  assertions.push({ name, ok, detail })
  if (!ok) console.error('FAIL', name, detail)
  else console.log('OK', name)
}

async function prepare(page, theme) {
  const logs = []
  page.on('console', message => {
    if (message.type() === 'warning' || message.type() === 'error') logs.push(message.text())
  })
  page.on('pageerror', error => logs.push(String(error)))
  await page.evaluateOnNewDocument(themeName => {
    const memory = new Map([
      ['kickoff-theme', themeName],
      ['kickoff-theme-broadcast', themeName],
    ])
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: key => memory.has(key) ? memory.get(key) : null,
        setItem: (key, value) => memory.set(key, String(value)),
        removeItem: key => memory.delete(key),
        clear: () => memory.clear(),
        key: () => null,
        length: 0,
      },
    })
    const original = history.replaceState.bind(history)
    let replaces = 0
    history.replaceState = (...args) => {
      replaces += 1
      window.__canonicalReplaces = replaces
      return original(...args)
    }
  }, theme)
  return logs
}

async function shoot(page, name) {
  await page.evaluate(() => document.fonts.ready)
  const measured = await page.evaluate(() => ({
    scrollEqual: document.documentElement.scrollWidth === window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    text: document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 500),
  }))
  const png = await page.screenshot({ type: 'png' })
  const file = path.join(outDir, `${name}.png`)
  writeFileSync(file, png)
  const sha256 = createHash('sha256').update(png).digest('hex')
  shots.push({ name, sha256, ...measured })
  return measured
}

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--disable-gpu', '--autoplay-policy=no-user-gesture-required'] })
try {
  const context = await browser.createBrowserContext()
  const page = await context.newPage()
  const logs = await prepare(page, 'light')
  const media = []
  page.on('request', request => {
    if (request.resourceType() === 'media' || request.url().includes('.mp4')) media.push(request.url())
  })

  if (!process.env.KICKOFF_SKIP_GRID) {
  for (const lens of lenses) for (const theme of themes) for (const width of widths) {
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 })
    const search = new URLSearchParams({ tab: 'moments' })
    if (lens !== 'poster') search.set('lens', lens)
    await page.goto(`${origin}/?${search}`, { waitUntil: 'networkidle0' })
    await page.evaluate(themeName => {
      document.documentElement.dataset.theme = themeName
      localStorage.setItem('kickoff-theme', themeName)
      localStorage.setItem('kickoff-theme-broadcast', themeName)
    }, theme)
    await page.reload({ waitUntil: 'networkidle0' })
    const gallery = await shoot(page, `gallery-${lens}-${theme}-${width}`)
    check(`scroll gallery ${lens} ${theme} ${width}`, gallery.scrollEqual, `${gallery.scrollWidth}/${gallery.innerWidth}`)
    if (lens === 'ledger' && theme === 'light' && width === 390) {
      check('preview catalog', gallery.text.includes('Preview catalog'))
      check('several count', gallery.text.includes('4 of 4 videos'))
      check('no hydration', !logs.some(line => /hydration|did not match/i.test(line)), logs.join(' | '))
      const before = media.length
      const videoCount = await page.evaluate(() => document.querySelectorAll('video').length)
      check('gallery has no video element', videoCount === 0, String(videoCount))
      check('no media request on the gallery', media.length === before, String(media.length))
    }
  }
  }

  await page.setViewport({ width: 390, height: 900, deviceScaleFactor: 1 })
  await page.goto(`${origin}/?tab=moments&only=pl&extra=kept#clip`, { waitUntil: 'networkidle0' })
  const replacesAfterLoad = await page.evaluate(() => window.__canonicalReplaces ?? 0)
  await page.click('a[href*="watch=stub-fenway-one"]:not([aria-hidden])')
  await page.waitForFunction(() => location.search.includes('watch=stub-fenway-one'))
  const afterEnter = await page.evaluate(() => ({
    search: location.search,
    hash: location.hash,
    replaces: window.__canonicalReplaces ?? 0,
    focus: document.activeElement?.id ?? '',
    videos: document.querySelectorAll('video').length,
    src: document.querySelector('video')?.getAttribute('src'),
    preload: document.querySelector('video')?.getAttribute('preload'),
    autoplay: document.querySelector('video')?.hasAttribute('autoplay'),
  }))
  check('watch keeps the competition filter and an unknown key', afterEnter.search.includes('only=pl') && afterEnter.search.includes('extra=kept'), afterEnter.search)
  check('fragment survives', afterEnter.hash === '#clip', afterEnter.hash)
  check('canonicalSearch did not run again', afterEnter.replaces === replacesAfterLoad, `${replacesAfterLoad} -> ${afterEnter.replaces}`)
  check('watch focuses the h1', afterEnter.focus === 'moments-watch-heading', afterEnter.focus)
  check('one video on the watch page', afterEnter.videos === 1)
  check('src absent until Play', afterEnter.src === null, String(afterEnter.src))
  check('preload none and no autoplay attribute', afterEnter.preload === 'none' && afterEnter.autoplay === false)
  const mediaBeforePlay = media.length
  await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find(item => item.textContent === 'Play')
    if (!button) throw new Error('Play missing')
    button.click()
  }) 
  await page.waitForFunction(() => document.querySelector('video')?.getAttribute('src'))
  await page.waitForFunction(() => document.activeElement?.tagName === 'VIDEO')
  check('Play focuses the video', true)
  check('Play issues a media request', media.length > mediaBeforePlay, `${mediaBeforePlay} -> ${media.length}`)
  await shoot(page, 'watch-playing-390')

  await page.goBack({ waitUntil: 'networkidle0' })
  await page.waitForSelector('#moments-gallery-heading')
  const back = await page.evaluate(() => ({
    href: location.href,
    heading: Boolean(document.querySelector('#moments-gallery-heading')),
  }))
  check('Back returns to the gallery', !back.href.includes('watch=') && back.heading, back.href)
  check('gallery return focuses its h1', await page.evaluate(() => document.activeElement?.id === 'moments-gallery-heading'))
  await page.goForward({ waitUntil: 'networkidle0' })
  check('Forward returns to the watch page', await page.evaluate(() => location.search.includes('watch=stub-fenway-one')))

  await page.goto(`${origin}/?tab=moments&watch=withdrawn-clip`, { waitUntil: 'networkidle0' })
  const missing = await page.evaluate(() => ({
    search: location.search,
    text: document.body.innerText,
  }))
  check('withdrawn id stays and is not found', missing.search.includes('watch=withdrawn-clip') && missing.text.includes('No published video has this address.'))
  await shoot(page, 'watch-not-found-390')

  await page.goto(`${origin}/?tab=moments&watch=stub-fenway-one`, { waitUntil: 'networkidle0' })
  await page.click('button[aria-pressed]')
  check('theater presses', await page.evaluate(() => document.body.innerText.includes('Exit theater')))
  await page.keyboard.press('Escape')
  check('Escape leaves theater', await page.evaluate(() => document.body.innerText.includes('Theater') && !document.body.innerText.includes('Exit theater')))
  await shoot(page, 'watch-theater-390')

  await page.goto(`${origin}/?tab=moments`, { waitUntil: 'networkidle0' })
  await page.click('label.moments-check input')
  const noResults = await page.evaluate(() => document.body.innerText)
  check('saved only with nothing saved is no-results', noResults.includes('No videos match.') && noResults.includes('0 of 4 videos'))
  await shoot(page, 'gallery-no-results-390')

  await context.close()

  for (const [label, extra] of [
    ['empty', process.env.KICKOFF_EMPTY_ORIGIN],
    ['unavailable', process.env.KICKOFF_UNAVAILABLE_ORIGIN],
    ['cover', process.env.KICKOFF_COVER_ORIGIN],
  ]) {
    if (!extra) continue
    const extraContext = await browser.createBrowserContext()
    const extraPage = await extraContext.newPage()
    await prepare(extraPage, 'light')
    if (label === 'cover') {
      await extraPage.setRequestInterception(true)
      extraPage.on('request', request => {
        if (request.url().includes('/moments/thumbnails/')) request.abort()
        else request.continue()
      })
    }
    for (const lens of lenses) for (const theme of themes) for (const width of widths) {
      await extraPage.setViewport({ width, height: 900, deviceScaleFactor: 1 })
      await extraPage.goto(`${extra}/?tab=moments${lens === 'poster' ? '' : `&lens=${lens}`}`, { waitUntil: 'networkidle0' })
      const shot = await shoot(extraPage, `${label}-${lens}-${theme}-${width}`)
      check(`scroll ${label} ${lens} ${theme} ${width}`, shot.scrollEqual, `${shot.scrollWidth}/${shot.innerWidth}`)
    }
    if (label === 'empty') check('empty catalog is 0 of 0', (await extraPage.evaluate(() => document.body.innerText)).includes('0 of 0 videos'))
    if (label === 'unavailable') check('unavailable copy', (await extraPage.evaluate(() => document.body.innerText)).includes('The gallery is unavailable.'))
    if (label === 'cover') check('typographic cover', (await extraPage.evaluate(() => document.body.innerText)).includes('STUDIO'))
    await extraContext.close()
  }
} finally {
  await browser.close()
}

const failed = assertions.filter(item => !item.ok)
const receipt = {
  origin,
  shots: shots.map(({ name, sha256, scrollEqual }) => ({ name, sha256, scrollEqual })),
  assertions,
  failed: failed.map(item => item.name),
}
writeFileSync(path.join(outDir, 'receipt.json'), JSON.stringify(receipt, null, 2))
console.log(JSON.stringify({ shots: shots.length, failed: receipt.failed }, null, 2))
if (failed.length) process.exit(1)
