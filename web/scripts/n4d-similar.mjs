// Watch-page matrix for Similar moments. PNGs stay outside the repo.
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'
import { payloadScoreHits } from './check-client.mjs'

const webRoot = fileURLToPath(new URL('..', import.meta.url))
const outDir = path.resolve(process.argv[2] ?? '/Users/benicheni/kickoff-n4d-proof')
const receiptPath = path.resolve(process.argv[3] ?? path.join(webRoot, 'verification/n4d-similar.json'))
mkdirSync(outDir, { recursive: true })
const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const lenses = ['ledger', 'poster', 'broadcast']
const themes = ['light', 'dark']
const widths = [360, 375, 390, 1000]
const checks = []
function check(name, ok, detail) {
  checks.push({ name, ok: Boolean(ok), ...(detail === undefined ? {} : { detail }) })
  console.log(ok ? 'OK' : 'FAIL', name, ok ? '' : JSON.stringify(detail))
}

async function listen() {
  const socket = createServer()
  await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve))
  const port = socket.address().port
  await new Promise(resolve => socket.close(resolve))
  return port
}

function start(port, fixture) {
  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: webRoot,
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
      KICKOFF_CATALOG: 'stub',
      KICKOFF_STUB_CATALOG_FILE: path.join(webRoot, 'fixtures/catalog', fixture),
      KICKOFF_DATABASE_URL: '',
      VERCEL_ENV: '',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let logs = ''
  child.stdout.on('data', chunk => { logs += chunk })
  child.stderr.on('data', chunk => { logs += chunk })
  return { child, logs: () => logs }
}

async function ready(url, child, logs) {
  for (let n = 0; n < 100; n++) {
    if (child.exitCode !== null) throw new Error(logs())
    try { if ((await fetch(url)).ok) return } catch {}
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error(logs())
}

const severalPort = await listen()
const onePort = await listen()
const several = start(severalPort, 'several.json')
const one = start(onePort, 'one.json')
const severalOrigin = `http://127.0.0.1:${severalPort}`
const oneOrigin = `http://127.0.0.1:${onePort}`
const shots = []
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ['--disable-gpu', '--autoplay-policy=no-user-gesture-required'],
})

function search(lens, watch) {
  const params = new URLSearchParams({ tab: 'moments' })
  if (lens !== 'poster') params.set('lens', lens)
  if (watch) params.set('watch', watch)
  return params.toString()
}

try {
  await ready(severalOrigin, several.child, several.logs)
  await ready(oneOrigin, one.child, one.logs)
  const withBody = await (await fetch(`${severalOrigin}/?${search('poster', 'stub-fenway-one')}`)).text()
  const withoutBody = await (await fetch(`${oneOrigin}/?${search('poster', 'stub-only-one')}`)).text()
  const galleryBody = await (await fetch(`${severalOrigin}/?tab=moments`)).text()
  check('ssr with list has the heading and no score key', withBody.includes('Similar moments') && withBody.includes('Picked by how alike the opening frame and title are.') && !withBody.includes('"score"') && payloadScoreHits(JSON.parse('{}')).length === 0)
  check('ssr without list has no heading', !withoutBody.includes('Similar moments') && !withoutBody.includes('Picked by how alike'))
  check('ssr gallery has no heading', !galleryBody.includes('Similar moments'))
  check('up next still leads', withBody.indexOf('id="up-stub-frankenstein-one"') > -1 && withBody.indexOf('id="up-stub-frankenstein-one"') < withBody.indexOf('Similar moments'))

  for (const mode of ['with', 'without']) {
    for (const lens of lenses) for (const theme of themes) for (const width of widths) {
      const page = await browser.newPage()
      await page.setViewport({ width, height: 900, deviceScaleFactor: 1 })
      await page.evaluateOnNewDocument(themeName => {
        const memory = new Map([['kickoff-theme', themeName], ['kickoff-theme-broadcast', themeName]])
        Object.defineProperty(window, 'localStorage', { configurable: true, value: {
          getItem: key => memory.get(key) ?? null,
          setItem: (key, value) => memory.set(key, String(value)),
          removeItem: key => memory.delete(key),
          clear: () => memory.clear(),
          key: () => null,
          length: 0,
        } })
      }, theme)
      const origin = mode === 'with' ? severalOrigin : oneOrigin
      const watch = mode === 'with' ? 'stub-fenway-one' : 'stub-only-one'
      await page.goto(`${origin}/?${search(lens, watch)}`, { waitUntil: 'networkidle0' })
      const measured = await page.evaluate(() => {
        const text = document.body.innerText
        const aside = document.querySelector('aside')
        const names = aside ? [...aside.querySelectorAll('a[href], button')].map(el => {
          const labelled = el.getAttribute('aria-labelledby')
          return el.getAttribute('aria-label') || (labelled && document.getElementById(labelled)?.textContent) || el.textContent.trim()
        }) : []
        return {
          scrollEqual: document.documentElement.scrollWidth === window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          theme: document.documentElement.dataset.theme,
          lens: document.documentElement.dataset.lens,
          heading: text.includes('Similar moments'),
          line: text.includes('Picked by how alike the opening frame and title are.'),
          upFirst: document.getElementById('up-stub-frankenstein-one')?.textContent ?? null,
          names,
        }
      })
      const name = `${mode}-${lens}-${theme}-${width}`
      const png = await page.screenshot({ type: 'png', fullPage: true })
      writeFileSync(path.join(outDir, `${name}.png`), png)
      shots.push({ name, sha256: hash(png), ...measured })
      check(`scroll ${name}`, measured.scrollEqual, measured)
      check(`theme ${name}`, measured.theme === theme, measured.theme)
      check(`list ${name}`, mode === 'with' ? measured.heading && measured.line && measured.upFirst === 'Stub Frankenstein one' : !measured.heading && !measured.line, measured)
      await page.close()
    }
  }

  const page = await browser.newPage()
  await page.setViewport({ width: 390, height: 900, deviceScaleFactor: 1 })
  await page.goto(`${severalOrigin}/?${search('poster', 'stub-fenway-one')}`, { waitUntil: 'networkidle0' })
  const focused = []
  let sawAside = false
  for (let step = 0; step < 40; step++) {
    await page.keyboard.press('Tab')
    const current = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || !el.closest('aside')) return null
      const labelled = el.getAttribute('aria-labelledby')
      return el.getAttribute('aria-label') || (labelled && document.getElementById(labelled)?.textContent) || null
    })
    if (current) {
      sawAside = true
      focused.push(current)
    } else if (sawAside) break
  }
  check('tab order through the aside', JSON.stringify(focused) === JSON.stringify([
    'Autoplay next',
    'Stub Frankenstein one',
    'Stub both cats',
    'Fenway',
    'Fenway',
    'Stub both cats',
  ]), focused)
  await page.click('a[aria-labelledby="similar-stub-title-fenway"]')
  await page.waitForFunction(() => location.search.includes('watch=stub-title-fenway'))
  const after = await page.evaluate(() => ({
    watch: new URLSearchParams(location.search).get('watch'),
    upGone: document.getElementById('up-stub-frankenstein-one') === null,
    earlier: document.body.innerText.includes('Earlier'),
    nothing: document.body.innerText.includes('Nothing after this one in Beni\u2019s order.'),
    similarFirst: document.querySelector('aside a[aria-labelledby^="similar-"]')?.getAttribute('aria-labelledby'),
  }))
  check('a similar row navigates like up next', after.watch === 'stub-title-fenway' && after.upGone && after.earlier && after.nothing && after.similarFirst === 'similar-stub-frankenstein-one', after)
  await page.close()
} finally {
  several.child.kill('SIGTERM')
  one.child.kill('SIGTERM')
  await browser.close()
}

const failed = checks.filter(item => !item.ok)
const receipt = {
  checked: new Date().toISOString(),
  pngDirectory: outDir,
  shots,
  checks,
  failed: failed.map(item => item.name),
}
writeFileSync(receiptPath, JSON.stringify(receipt, null, 2))
console.log(JSON.stringify({ shots: shots.length, checks: checks.length, failed: receipt.failed }, null, 2))
if (failed.length) process.exit(1)
