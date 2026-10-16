// The offline file, opened from file://. Screenshots stay outside the repo.
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const fileUrl = process.env.KICKOFF_OFFLINE_FILE ?? new URL('../../dist-offline/index.html', import.meta.url).href
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
  const networkOff = options.networkOff === true
  const blocked = []
  if (networkOff) {
    await page.setRequestInterception(true)
    page.on('request', request => {
      let protocol = ''
      try { protocol = new URL(request.url()).protocol } catch { protocol = '' }
      if (protocol === 'file:') {
        request.continue().catch(() => {})
        return
      }
      try { blocked.push(new URL(request.url()).host) } catch { blocked.push('unparsed') }
      request.abort('blockedbyclient').catch(() => {})
    })
  }
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
    searchHash: location.search + location.hash,
    fontStack: getComputedStyle(document.body).fontFamily.replace(/["']/g, ''),
    loadedFamilies: [...document.fonts].filter(font => font.status === 'loaded').map(font => font.family),
  }))
  measured.logs = logs.filter(line => !/favicon/i.test(line))
  if (networkOff) {
    const expected = /fonts\.g(?:oogleapis|static)|ERR_BLOCKED_BY_CLIENT|ERR_FAILED/
    measured.blockedLogs = measured.logs.filter(line => expected.test(line))
    measured.logs = measured.logs.filter(line => !expected.test(line))
    measured.networkOff = true
    measured.blockedHosts = [...new Set(blocked)]
  }
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
    const measured = await open(browser, params.toString(), theme, width, {
      shot: `${id}.png`,
      networkOff: width === 360 || width === 390,
    })
    const problems = []
    if (!measured.scrollEqual) problems.push('scroll')
    if (measured.logs.length) problems.push('console')
    if (measured.label !== 'Offline snapshot') problems.push('label')
    if (measured.momentsButton) problems.push('moments-tab')
    if (measured.theme !== theme) problems.push('theme')
    if (measured.lens !== lens) problems.push('lens')
    const row = { id, problems, sha256: measured.sha256, searchHash: measured.searchHash, logs: measured.logs }
    if (measured.networkOff) {
      row.networkOff = true
      row.fontStack = measured.fontStack
      row.loadedFamilies = measured.loadedFamilies
      row.blockedHosts = measured.blockedHosts
      row.blockedLogs = measured.blockedLogs
    }
    rows.push(row)
    console.log(problems.length ? `DIFF ${id} ${problems.join(',')}` : `OK ${id}`)
  }

  const moments = await open(browser, 'tab=moments&watch=clip', 'light', 390, { networkOff: true })
  const momentsText = moments.text.toLowerCase()
  const momentsOk = moments.searchHash.includes('tab=moments') && moments.searchHash.includes('watch=clip') && momentsText.includes('filters') && !moments.momentsButton && moments.logs.length === 0
  console.log(momentsOk ? 'OK moments-url' : 'DIFF moments-url', moments.searchHash, moments.logs, momentsText.slice(0, 120))

  const blocked = await open(browser, '', 'light', 390, { blockStorage: true, networkOff: true })
  const blockedOk = blocked.logs.length === 0 && blocked.text.toLowerCase().includes('filters') && blocked.label === 'Offline snapshot'
  console.log(blockedOk ? 'OK blocked-storage' : 'DIFF blocked-storage', blocked.logs, blocked.text.slice(0, 120))

  const staleFrozen = '2026-10-19T00:00:00.000Z'
  const stale = await open(browser, '', 'light', 390, { frozen: staleFrozen, networkOff: true })
  const staleOk = stale.text.includes('Data is stale') && stale.logs.length === 0
  console.log(staleOk ? 'OK stale' : 'DIFF stale', stale.text.slice(0, 180))

  const month = await open(browser, 'view=month&only=pl&date=2026-09-20', 'dark', 360, { networkOff: true })
  const monthOk = month.text.toLowerCase().includes('monday') && month.text.includes('1 of ') && month.scrollEqual && month.logs.length === 0
  console.log(monthOk ? 'OK month-filter' : 'DIFF month-filter', month.text.slice(0, 180))

  const league = await open(browser, 'tab=table&league=bundesliga&kept=1', 'light', 1000)
  const leagueOk = league.text.includes('Bundesliga') && league.searchHash.includes('kept=1') && league.scrollEqual
  console.log(leagueOk ? 'OK league' : 'DIFF league', league.searchHash)

  function behavior(id, ok, measured, extra = {}) {
    const row = { id, problems: ok ? [] : ['behavior'], searchHash: measured.searchHash, logs: measured.logs, ...extra }
    if (measured.networkOff) {
      row.networkOff = true
      row.fontStack = measured.fontStack
      row.loadedFamilies = measured.loadedFamilies
      row.blockedHosts = measured.blockedHosts
      row.blockedLogs = measured.blockedLogs
    }
    return row
  }
  rows.push(
    behavior('moments-url', momentsOk, moments),
    behavior('blocked-storage', blockedOk, blocked),
    behavior('stale', staleOk, stale, { frozen: staleFrozen }),
    behavior('month-filter', monthOk, month),
    behavior('league-unknown-key', leagueOk, league),
  )
} finally {
  await browser.close()
}

const summary = {
  compares: `The offline Fixtures-and-Table file, opened from file://. The file URL defaults to dist-offline/index.html resolved from import.meta.url. 48 cells: 2 tabs × 3 lenses × 2 themes × 360, 375, 390 and 1000, plus ?tab=moments left untouched, a throwing localStorage, the 72-hour stale warning, a month filter, and a league with an unknown key. Date frozen at ${frozen} except the stale cell. Ticker animation paused. Viewport set before navigation. No Moments tab is rendered. Each cell records location.search + location.hash. The 360 and 390 cells abort every request that is not file: and record the resolved body font stack.`,
  frozenUtc: frozen,
  cells: rows.length,
  differing: rows.filter(row => row.problems.length),
  rows,
}
writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2))
console.log(JSON.stringify({ cells: rows.length, differing: summary.differing.map(row => row.id) }, null, 2))
