// Freshness and a pinned date across Brooklyn midnight, on Vite and on Next.
import puppeteer from 'puppeteer-core'

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const viteOrigin = process.env.KICKOFF_VITE_ORIGIN ?? 'http://127.0.0.1:5182'
const nextOrigin = process.env.KICKOFF_NEXT_ORIGIN ?? 'http://127.0.0.1:5174'

async function read(browser, origin, search, frozen) {
  const context = await browser.createBrowserContext()
  const page = await context.newPage()
  const logs = []
  page.on('console', message => { if (message.type() === 'warning' || message.type() === 'error') logs.push(message.text()) })
  page.on('pageerror', error => logs.push(String(error)))
  await page.evaluateOnNewDocument(iso => {
    const fixed = Date.parse(iso)
    const Real = Date
    function Frozen(...args) { return args.length ? new Real(...args) : new Real(fixed) }
    Frozen.now = () => fixed
    Frozen.parse = Real.parse
    Frozen.UTC = Real.UTC
    Object.setPrototypeOf(Frozen, Real)
    window.Date = Frozen
  }, frozen)
  await page.setViewport({ width: 390, height: 900, deviceScaleFactor: 1 })
  await page.goto(origin + '/' + (search ? `?${search}` : ''), { waitUntil: 'networkidle0' })
  const text = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').trim())
  const url = page.url()
  await context.close()
  return { text, url, logs: logs.filter(line => !/favicon/i.test(line)) }
}

const cases = [
  { id: 'fresh-24', search: '', frozen: '2026-10-16T23:30:00.000Z', includes: 'Data may have moved', excludes: 'Data is stale' },
  { id: 'fresh-72', search: '', frozen: '2026-10-19T00:00:00.000Z', includes: 'Data is stale' },
  { id: 'midnight-pin', search: 'date=2026-10-18', frozen: '2026-10-19T04:30:00.000Z', includes: 'Oct 12', urlIncludes: 'date=2026-10-18' },
]

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--disable-gpu'] })
const rows = []
try {
  for (const item of cases) {
    for (const [name, origin] of [['vite', viteOrigin], ['next', nextOrigin]]) {
      const result = await read(browser, origin, item.search, item.frozen)
      const problems = []
      if (!result.text.includes(item.includes)) problems.push('missing ' + item.includes)
      if (item.excludes && result.text.includes(item.excludes)) problems.push('unexpected ' + item.excludes)
      if (item.urlIncludes && !result.url.includes(item.urlIncludes)) problems.push('url')
      if (result.logs.length) problems.push('console')
      rows.push({ id: `${item.id}-${name}`, problems, url: result.url })
      console.log(problems.length ? `DIFF ${item.id} ${name} ${problems.join(',')}` : `OK ${item.id} ${name}`)
    }
  }
} finally {
  await browser.close()
}
console.log(JSON.stringify(rows, null, 2))
