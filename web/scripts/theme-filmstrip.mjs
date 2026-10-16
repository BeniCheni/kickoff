// Cold-load filmstrip for the unreleased Next shell. Uses the installed Chrome;
// it does not download a browser. PNGs stay outside the repo.
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const origin = process.env.KICKOFF_NEXT_ORIGIN ?? 'http://127.0.0.1:5174'
const outDir = path.resolve(process.argv[2] ?? '/tmp/kickoff-n2-filmstrip')
mkdirSync(outDir, { recursive: true })

const LIGHT = 'rgb(247, 245, 238)'
const DARK = 'rgb(14, 28, 21)'

const cases = [
  { id: 'poster-default', url: '/', expect: LIGHT, storage: null, media: [{ name: 'prefers-color-scheme', value: 'light' }] },
  { id: 'broadcast-dark-default', url: '/?lens=broadcast', expect: DARK, storage: null, media: [{ name: 'prefers-color-scheme', value: 'light' }] },
  { id: 'broadcast-stored-light', url: '/?lens=broadcast', expect: LIGHT, storage: { 'kickoff-theme-broadcast': 'light' }, media: [{ name: 'prefers-color-scheme', value: 'dark' }] },
  { id: 'system-change', url: '/', expect: DARK, then: LIGHT, storage: null, media: [{ name: 'prefers-color-scheme', value: 'dark' }] },
  { id: 'blocked-storage', url: '/?lens=broadcast', expect: DARK, blockStorage: true, media: [{ name: 'prefers-color-scheme', value: 'light' }] },
  { id: 'reduced-motion', url: '/?lens=broadcast', expect: DARK, storage: null, media: [{ name: 'prefers-color-scheme', value: 'light' }, { name: 'prefers-reduced-motion', value: 'reduce' }] },
]

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ['--disable-gpu', '--no-first-run'],
})
const receipts = []
try {
  for (const item of cases) {
    const context = await browser.createBrowserContext()
    const page = await context.newPage()
    const client = await page.createCDPSession()
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 1.6 * 1024 * 1024 / 8,
      uploadThroughput: 750 * 1024 / 8,
      latency: 150,
    })
    await page.emulateMediaFeatures(item.media)
    await page.evaluateOnNewDocument((setup) => {
      window.__kickoffFrames = []
      const sample = () => {
        const body = document.body
        window.__kickoffFrames.push({
          theme: document.documentElement.dataset.theme ?? '',
          bg: body ? getComputedStyle(body).backgroundColor : '',
        })
        requestAnimationFrame(sample)
      }
      requestAnimationFrame(sample)
      if (setup.blockStorage) {
        const deny = () => { throw new DOMException('blocked', 'SecurityError') }
        Object.defineProperty(window, 'localStorage', { configurable: true, get: deny })
      } else if (setup.storage) {
        for (const [key, value] of Object.entries(setup.storage)) localStorage.setItem(key, value)
      }
    }, { blockStorage: Boolean(item.blockStorage), storage: item.storage })
    await page.goto(origin + item.url, { waitUntil: 'load' })
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    if (item.then) {
      await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }])
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    }
    const frames = await page.evaluate(() => window.__kickoffFrames)
    const shot = await page.screenshot({ type: 'png' })
    const file = path.join(outDir, `${item.id}.png`)
    writeFileSync(file, shot)
    const painted = [...new Set(frames.map(frame => frame.bg).filter(bg => bg === 'rgb(247, 245, 238)' || bg === 'rgb(14, 28, 21)'))]
    const wrong = painted.filter(bg => bg !== item.expect && !(item.then && (bg === item.expect || bg === item.then)))
    const finalBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    const expectedFinal = item.then ?? item.expect
    if (finalBg !== expectedFinal) throw new Error(`${item.id}: final ${finalBg} wanted ${expectedFinal}`)
    if (wrong.length) throw new Error(`${item.id}: wrong theme paint ${wrong.join(', ')}`)
    receipts.push({
      id: item.id,
      frames: frames.length,
      painted,
      finalBg,
      png: path.basename(file),
      sha256: createHash('sha256').update(shot).digest('hex'),
    })
    await page.close()
    await context.close()
  }
} finally {
  await browser.close()
}
writeFileSync(path.join(outDir, 'receipt.json'), JSON.stringify({ throttling: '4x CPU, Slow 4G (1.6Mbps down, 750Kbps up, 150ms)', receipts }, null, 2) + '\n')
console.log(JSON.stringify(receipts, null, 2))
