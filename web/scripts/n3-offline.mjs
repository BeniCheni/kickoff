// The offline file, opened from file://. Screenshots stay outside the repo.
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const fileUrl = process.env.KICKOFF_OFFLINE_FILE ?? 'file:///Users/benicheni/kickoff-n3-cursor/dist-offline/index.html'
const outDir = path.resolve(process.argv[2] ?? '/tmp/kickoff-n3-offline')
const frozen = '2026-10-15T20:00:00.000Z'
mkdirSync(outDir, { recursive: true })

const tabs = ['fixtures', 'table']
const lenses = ['ledger', 'poster', 'broadcast']
const themes = ['light', 'dark']
const widths = [360, 375, 390, 1000]

function urlFor(search) {
  return fileUrl + (search ? `?${search}` : '')
}

async function open(browser, search, theme, width, options = {}) {
  const context = await browser.createBrowserContext()
  const page = await context.newPage()
  const logs = []
  page.on('console', message => {
    if (message.type() === 'error') logs.push(message.text())
  })
  page.on('pageerror', error => logs.push(String(error)))
  await page.evaluateOnNewDocument((iso, themeName, blockStorage) => {
    const fixed = Date.parse(iso)
    const Real = Date
    function Frozen(...args) { return args.length ? new Real(...args) : new Real(fixed) }
    Frozen.now = () => fixed
    Frozen.parse = Real.parse
    Frozen.UTC = Real.UTC
    Object.setPrototypeOf(Frozen, Real)
    window.Date = Frozen
    if (blockStorage) {
      Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('The operation is insecure.', 'SecurityError') } })
      return
    }
    const memory = new Map([['kickoff-theme', themeName], ['kickoff-theme-broadcast', themeName]])
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
  }, options.frozen ?? frozen, theme, options.blockStorage === true)
  await page.setViewport({ width, height: 900, deviceScaleFactor: 1 })
  await page.goto(urlFor(search), { waitUntil: 'networkidle0' })
  await page.addStyleTag({ content: '.ticker-track{animation:none!important}' })
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const measured = await page.evaluate(() => ({
    scrollEqual: document.documentElement.scrollWidth === window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    theme: document.documentElement.dataset.theme ?? '',
    lens: document.documentElement.dataset.lens ?? '',
    label: document.querySelector('[data-offline-snapshot]')?.textContent ?? '',
    momentsButton: [...document.querySelectorAll('nav[aria-label="Primary"] button')].some(element => element.textContent === 'Moments'),
    activeTab: document.querySelector('nav[aria-label="Primary"] button[aria-current="page"]')?.textContent ?? '',
    text: (document.body.innerText ?? '').replace(/\s+/g, ' ').trim().slice(0, 4000),
    url: location.pathname + location.search + location.hash,
  }))
  measured.logs = logs.filter(line => !/favicon/i.test(line))
  measured.captureUrl = page.url()
  if (options.shot) {
    const shot = await page.screenshot({ type: 'png' })
    writeFileSync(path.join(outDir, options.shot), shot)
    measured.sha256 = createHash('sha256').update(shot).digest('hex')
  }
  await context.close()
  return measured
}

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--disable-gpu', '--allow-file-access-from-files'] })
const rows = []
try {
  for (const tab of tabs) for (const lens of lenses) for (const theme of themes) for (const width of widths) {
    const params = new URLSearchParams()
    if (tab !== 'fixtures') params.set('tab', tab)
    if (lens !== 'poster') params.set('lens', lens)
    const id = `${tab}-${lens}-${theme}-${width}`
    const measured = await open(browser, params.toString(), theme, width, { shot: `${id}.png` })
    const problems = []
    if (!measured.scrollEqual) problems.push('scroll')
    if (measured.logs.length) problems.push('console')
    if (measured.label !== 'Offline snapshot') problems.push('label')
    if (measured.momentsButton) problems.push('moments-tab')
    if (measured.theme !== theme) problems.push('theme')
    if (measured.lens !== lens) problems.push('lens')
    rows.push({ id, problems, sha256: measured.sha256, captureUrl: measured.captureUrl, logs: measured.logs })
    console.log(problems.length ? `DIFF ${id} ${problems.join(',')}` : `OK ${id}`)
  }

  const moments = await open(browser, 'tab=moments&watch=clip', 'light', 390)
  const momentsText = moments.text.toLowerCase()
  const momentsOk = moments.url.includes('tab=moments') && moments.url.includes('watch=clip') && momentsText.includes('filters') && !moments.momentsButton && moments.logs.length === 0
  console.log(momentsOk ? 'OK moments-url' : 'DIFF moments-url', moments.url, moments.logs, momentsText.slice(0, 120))

  const blocked = await open(browser, '', 'light', 390, { blockStorage: true })
  const blockedOk = blocked.logs.length === 0 && blocked.text.toLowerCase().includes('filters') && blocked.label === 'Offline snapshot'
  console.log(blockedOk ? 'OK blocked-storage' : 'DIFF blocked-storage', blocked.logs, blocked.text.slice(0, 120))

  const staleFrozen = '2026-10-19T00:00:00.000Z'
  const stale = await open(browser, '', 'light', 390, { frozen: staleFrozen })
  const staleOk = stale.text.includes('Data is stale') && stale.logs.length === 0
  console.log(staleOk ? 'OK stale' : 'DIFF stale', stale.text.slice(0, 180))

  const month = await open(browser, 'view=month&only=pl&date=2026-09-20', 'dark', 360)
  const monthOk = month.text.toLowerCase().includes('monday') && month.text.includes('1 of ') && month.scrollEqual && month.logs.length === 0
  console.log(monthOk ? 'OK month-filter' : 'DIFF month-filter', month.text.slice(0, 180))

  const league = await open(browser, 'tab=table&league=bundesliga&kept=1', 'light', 1000)
  const leagueOk = league.text.includes('Bundesliga') && league.url.includes('kept=1') && league.scrollEqual
  console.log(leagueOk ? 'OK league' : 'DIFF league', league.url)

  rows.push(
    { id: 'moments-url', problems: momentsOk ? [] : ['behavior'], url: moments.url, logs: moments.logs },
    { id: 'blocked-storage', problems: blockedOk ? [] : ['behavior'], logs: blocked.logs },
    { id: 'stale', problems: staleOk ? [] : ['behavior'], frozen: staleFrozen },
    { id: 'month-filter', problems: monthOk ? [] : ['behavior'] },
    { id: 'league-unknown-key', problems: leagueOk ? [] : ['behavior'], url: league.url },
  )
} finally {
  await browser.close()
}

const summary = {
  compares: `The offline Fixtures-and-Table file at ${fileUrl}, opened from file://. 48 cells: 2 tabs × 3 lenses × 2 themes × 360, 375, 390 and 1000, plus ?tab=moments left untouched, a throwing localStorage, the 72-hour stale warning, a month filter, and a league with an unknown key. Date frozen at ${frozen} except the stale cell. Ticker animation paused. Viewport set before navigation. No Moments tab is rendered.`,
  frozenUtc: frozen,
  cells: rows.length,
  differing: rows.filter(row => row.problems.length),
  rows,
}
writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2))
console.log(JSON.stringify({ cells: rows.length, differing: summary.differing.map(row => row.id) }, null, 2))
