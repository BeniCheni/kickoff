/**
 * Browser proofs for the Studio admin (Compose, Jobs, Review, Publish).
 * PNGs stay outside the repo. The receipt in studio/verification/ is committed.
 * Run: npx tsx scripts/prove-admin.ts
 */
import { spawn, type ChildProcess } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { request as httpRequest } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertLoopbackBind } from '../server/bind.ts'
import { findSecrets } from '../secrets/scan.ts'
import { seedAdmin, type SeedManifest } from './seed-admin.ts'

const here = path.dirname(fileURLToPath(import.meta.url))
const studioDir = path.resolve(here, '..')
const proofDir = path.join(process.env.HOME ?? '/tmp', 'kickoff-st3-proofs')
const chromeBin = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const widths = [1000, 1280, 1440] as const
const themes = ['light', 'dark'] as const

type Shot = {
  name: string
  file: string
  sha256: string
  theme: string
  width: number
  scrollWidth: number
  innerWidth: number
  scrollEqual: boolean
  consoleErrors: string[]
  contrast: { pair: string; ratio: number; wcag: boolean }[]
  tabOrder: string[]
}

const shots: Shot[] = []
const notes: string[] = []
const requestLog: { method: string; path: string; status: number }[] = []

function httpGet(url: string, method = 'GET'): Promise<string> {
  return new Promise((resolve, reject) => {
    const target = new URL(url)
    httpRequest({ hostname: target.hostname, port: target.port, path: `${target.pathname}${target.search}`, method }, (response) => {
      const chunks: Buffer[] = []
      response.on('data', (chunk: Buffer) => chunks.push(chunk))
      response.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    }).on('error', reject).end()
  })
}

function httpCall(port: number, method: string, urlPath: string, headers: Record<string, string>, body?: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = httpRequest({
      hostname: '127.0.0.1',
      port,
      path: urlPath,
      method,
      headers: { host: `127.0.0.1:${port}`, ...headers },
    }, (response) => {
      const chunks: Buffer[] = []
      response.on('data', (chunk: Buffer) => chunks.push(chunk))
      response.on('end', () => resolve({ status: response.statusCode ?? 0, body: Buffer.concat(chunks).toString('utf8') }))
    })
    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}

class Page {
  private next = 0
  private pending = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void }>()
  private socket: WebSocket
  consoleErrors: string[] = []
  network: { requestId: string; method: string; path: string; status: number }[] = []

  private constructor(socket: WebSocket) {
    this.socket = socket
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data)) as { id?: number; result?: unknown; error?: { message: string }; method?: string; params?: Record<string, unknown> }
      if (message.id) {
        const waiter = this.pending.get(message.id)
        if (!waiter) return
        this.pending.delete(message.id)
        if (message.error) waiter.reject(new Error(message.error.message))
        else waiter.resolve(message.result)
        return
      }
      if (message.method === 'Runtime.consoleAPICalled') {
        const type = String(message.params?.type ?? '')
        if (type === 'error') this.consoleErrors.push(JSON.stringify(message.params?.args ?? []))
      }
      if (message.method === 'Runtime.exceptionThrown') {
        this.consoleErrors.push(JSON.stringify(message.params?.exceptionDetails ?? {}))
      }
      if (message.method === 'Network.responseReceived') {
        const response = message.params?.response as { url?: string; status?: number } | undefined
        const requestId = String(message.params?.requestId ?? '')
        const match = this.network.find((entry) => entry.requestId === requestId)
        if (match && response?.status) match.status = response.status
      }
      if (message.method === 'Network.requestWillBeSent') {
        const request = message.params?.request as { url?: string; method?: string } | undefined
        const requestId = String(message.params?.requestId ?? '')
        if (request?.url) {
          const url = new URL(request.url)
          this.network.push({ requestId, method: request.method ?? 'GET', path: url.pathname, status: 0 })
        }
      }
    })
  }

  static async attach(browserUrl: string): Promise<Page> {
    const created = JSON.parse(await httpGet(`${browserUrl}/json/new?about:blank`, 'PUT')) as { webSocketDebuggerUrl: string }
    const socket = new WebSocket(created.webSocketDebuggerUrl)
    await new Promise<void>((resolve, reject) => {
      socket.addEventListener('open', () => resolve())
      socket.addEventListener('error', () => reject(new Error('chrome socket failed')))
    })
    const page = new Page(socket)
    await page.send('Page.enable')
    await page.send('Runtime.enable')
    await page.send('Network.enable')
    return page
  }

  send(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
    const id = ++this.next
    this.socket.send(JSON.stringify({ id, method, params }))
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }))
  }

  async evaluate<T>(expression: string): Promise<T> {
    const result = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }) as {
      result?: { value?: T }
      exceptionDetails?: { text?: string; exception?: { description?: string } }
    }
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text ?? 'evaluate failed')
    }
    return result.result?.value as T
  }

  async goto(url: string): Promise<void> {
    await this.send('Page.navigate', { url })
    const start = Date.now()
    while (Date.now() - start < 15000) {
      const ready = await this.evaluate<boolean>('document.readyState === "complete" && !!document.querySelector(".studio, .studio-help")')
      if (ready) return
      await delay(100)
    }
    throw new Error(`did not load ${url}`)
  }

  async setWidth(width: number): Promise<void> {
    await this.send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false })
  }

  async pauseTimers(): Promise<void> {
    await this.send('Emulation.setVirtualTimePolicy', { policy: 'pause', budget: 0 }).catch(() => undefined)
  }

  async resumeTimers(): Promise<void> {
    await this.send('Emulation.setVirtualTimePolicy', { policy: 'advance', budget: 5000 }).catch(() => undefined)
  }

  close(): void {
    this.socket.close()
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function launchChrome(port: number, dir: string): Promise<ChildProcess> {
  const chrome = spawn(chromeBin, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    `--user-data-dir=${dir}`,
    `--remote-debugging-port=${port}`,
  ], { stdio: 'ignore' })
  const start = Date.now()
  while (Date.now() - start < 10000) {
    try {
      await httpGet(`http://127.0.0.1:${port}/json/version`)
      return chrome
    } catch {
      await delay(100)
    }
  }
  chrome.kill()
  throw new Error('chrome did not start')
}

function startServer(dataDir: string, mediaDir: string, extra: Record<string, string> = {}): Promise<{ port: number; origin: string; token: string; stop: () => void }> {
  const child = spawn('npx', ['tsx', 'server/main.ts'], {
    cwd: studioDir,
    env: {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      STUDIO_DATA_DIR: dataDir,
      STUDIO_MEDIA_DIR: mediaDir,
      STUDIO_NOW: '2026-10-18T18:00:00.000Z',
      ...extra,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return new Promise((resolve, reject) => {
    let buffer = ''
    const timer = setTimeout(() => reject(new Error(`server did not start\n${buffer}`)), 20000)
    child.stdout?.on('data', (chunk: Buffer) => {
      buffer += chunk.toString('utf8')
      const match = /http:\/\/127\.0\.0\.1:(\d+)\/\?ticket=(\S+)/.exec(buffer)
      if (!match?.[1] || !match[2]) return
      clearTimeout(timer)
      resolve({
        port: Number(match[1]),
        origin: `http://127.0.0.1:${match[1]}`,
        token: match[2],
        stop: () => child.kill(),
      })
    })
    child.stderr?.on('data', (chunk: Buffer) => {
      buffer += chunk.toString('utf8')
    })
    child.on('exit', (code) => {
      clearTimeout(timer)
      reject(new Error(`server exited ${code}\n${buffer}`))
    })
  })
}

const MEASURE = `(() => {
  function channels(color) {
    const match = /rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/.exec(color)
    if (!match) return null
    return [Number(match[1]), Number(match[2]), Number(match[3]), match[4] === undefined ? 1 : Number(match[4])]
  }
  function composite(front, back) {
    const alpha = front[3]
    return [
      Math.round(front[0] * alpha + back[0] * (1 - alpha)),
      Math.round(front[1] * alpha + back[1] * (1 - alpha)),
      Math.round(front[2] * alpha + back[2] * (1 - alpha)),
      1,
    ]
  }
  function linear(channel) {
    const value = channel / 255
    return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)
  }
  function luminance(rgb) {
    return 0.2126 * linear(rgb[0]) + 0.7152 * linear(rgb[1]) + 0.0722 * linear(rgb[2])
  }
  function contrast(a, b) {
    const left = luminance(a)
    const right = luminance(b)
    const lighter = Math.max(left, right)
    const darker = Math.min(left, right)
    return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100
  }
  function token(name) {
    const probe = document.createElement('div')
    probe.style.color = 'var(' + name + ')'
    document.body.appendChild(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return channels(color)
  }
  const bg = token('--bg')
  const surface = token('--surface')
  const surfaceAlt = token('--surface-alt')
  const text = token('--text')
  const secondary = token('--text-secondary')
  const muted = token('--text-muted')
  const pitch = token('--pitch')
  const flood = token('--floodlight-strong')
  const floodBg = token('--floodlight-bg')
  const accent = token('--accent-strong')
  const media = token('--media')
  const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
  const onPitch = theme === 'dark' ? bg : channels('rgb(255, 255, 255)')
  const onAlarm = theme === 'dark' ? bg : channels('rgb(255, 255, 255)')
  const floodGround = floodBg && bg && floodBg[3] < 1 ? composite(floodBg, bg) : floodBg
  const pairs = [
    ['ink on bg (published pill inverse)', text, bg],
    ['ink on surface', text, surface],
    ['ink-secondary on bg', secondary, bg],
    ['ink-secondary on surface', secondary, surface],
    ['ink-muted on bg', muted, bg],
    ['pitch on bg', pitch, bg],
    ['floodlight-strong on floodlight-bg', flood, floodGround],
    ['floodlight-strong on bg', flood, bg],
    ['kept pill text on pitch', onPitch, pitch],
    ['failed pill text on accent-strong', onAlarm, accent],
    ['ink on surface-alt', text, surfaceAlt],
    ['ink-secondary on media', secondary, media],
    ['ink-muted on surface', muted, surface],
  ]
  return pairs.filter((pair) => pair[1] && pair[2]).map((pair) => {
    const ratio = contrast(pair[1], pair[2])
    return { pair: pair[0], ratio, wcag: ratio >= 4.5 }
  })
})()`

const TABS = `(() => {
  const nodes = [...document.querySelectorAll('a[href], button, input, select, textarea, video')]
  return nodes.filter((el) => !el.disabled && el.tabIndex !== -1 && el.getClientRects().length > 0).map((el) => {
    const text = (el.getAttribute('aria-label') || el.textContent || el.id || el.tagName).replace(/\\s+/g, ' ').trim()
    return text.slice(0, 90)
  })
})()`

async function capture(page: Page, name: string, theme: string, width: number): Promise<void> {
  await page.setWidth(width)
  await delay(150)
  const metrics = await page.evaluate<{ scrollWidth: number; innerWidth: number }>('({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth })')
  const contrast = await page.evaluate<{ pair: string; ratio: number; wcag: boolean }[]>(MEASURE)
  const tabOrder = await page.evaluate<string[]>(TABS)
  const shot = await page.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }) as { data: string }
  const bytes = Buffer.from(shot.data, 'base64')
  const file = path.join(proofDir, 'png', `${name}-${theme}-${width}.png`)
  writeFileSync(file, bytes)
  shots.push({
    name,
    file,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    theme,
    width,
    scrollWidth: metrics.scrollWidth,
    innerWidth: metrics.innerWidth,
    scrollEqual: metrics.scrollWidth === metrics.innerWidth,
    consoleErrors: [...page.consoleErrors],
    contrast,
    tabOrder,
  })
}

async function waitFor(page: Page, expression: string, timeout = 8000): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const ready = await page.evaluate<boolean>(expression)
    if (ready) return
    await delay(100)
  }
  throw new Error(`timed out waiting for ${expression}`)
}

async function themed(page: Page, name: string, prepare: () => Promise<void>): Promise<void> {
    for (const theme of themes) {
    const current = await page.evaluate<string>('document.documentElement.getAttribute("data-theme") || "light"')
    if (current !== theme) {
      await page.evaluate<void>(`document.querySelector('.studio-theme')?.click()`)
      try {
        await waitFor(page, `document.documentElement.getAttribute('data-theme') === '${theme}'`, 3000)
      } catch (error) {
        const probe = await page.evaluate<string>(`JSON.stringify({ theme: document.documentElement.getAttribute('data-theme'), label: document.querySelector('.studio-theme') && document.querySelector('.studio-theme').textContent, stored: localStorage.getItem('kickoff-theme') })`)
        throw new Error(`${error instanceof Error ? error.message : 'theme'} ${probe}`)
      }
    }
    await prepare()
    for (const width of widths) await capture(page, name, theme, width)
  }
}

async function signIn(page: Page, origin: string, token: string): Promise<void> {
  await page.goto(`${origin}/?ticket=${encodeURIComponent(token)}`)
  await waitFor(page, `!!document.querySelector('.studio-theme')`)
}

async function main(): Promise<void> {
  mkdirSync(path.join(proofDir, 'png'), { recursive: true })
  mkdirSync(path.join(proofDir, 'chrome'), { recursive: true })
  rmSync(path.join(proofDir, 'matrix-data'), { recursive: true, force: true })
  rmSync(path.join(proofDir, 'matrix-media'), { recursive: true, force: true })
  rmSync(path.join(proofDir, 'flow-data'), { recursive: true, force: true })
  rmSync(path.join(proofDir, 'flow-media'), { recursive: true, force: true })
  const matrixData = path.join(proofDir, 'matrix-data')
  const matrixMedia = path.join(proofDir, 'matrix-media')
  const flowData = path.join(proofDir, 'flow-data')
  const flowMedia = path.join(proofDir, 'flow-media')
  notes.push('seeding')
  const matrix: SeedManifest = await seedAdmin(matrixData, matrixMedia, 'matrix')
  const flow: SeedManifest = await seedAdmin(flowData, flowMedia, 'flow')
  notes.push(`matrix session ${matrix.sessionSpendUsd}; flow session ${flow.sessionSpendUsd}`)
  notes.push('Jobs screenshots use STUDIO_ADMIN_FREEZE=1 so a visible poll does not move seeded in-flight rows. The flow server does not set it, so compose → poll → download runs.')

  await new Promise<void>((resolve, reject) => {
    const build = spawn('npx', ['vite', 'build', '--config', 'ui/vite.config.ts'], { cwd: studioDir, stdio: 'inherit' })
    build.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`vite ${code}`)))
  })

  try {
    assertLoopbackBind('0.0.0.0')
    notes.push('bind 0.0.0.0 was not refused')
  } catch (error) {
    notes.push(`bind off loopback refused: ${error instanceof Error ? error.message : 'refused'}`)
  }

  const chrome = await launchChrome(9334, path.join(proofDir, 'chrome'))
  const page = await Page.attach('http://127.0.0.1:9334')
  const servers: { stop: () => void }[] = []
  try {
    const matrixServer = await startServer(matrixData, matrixMedia, { STUDIO_ADMIN_FREEZE: '1' })
    servers.push(matrixServer)
    await signIn(page, matrixServer.origin, matrixServer.token)
    await page.goto(`${matrixServer.origin}/#compose`)
    await waitFor(page, `!!document.querySelector('#c-motion')`)
    await page.evaluate<void>(`{
      const area = document.querySelector('#c-motion')
      if (!area) throw new Error('motion prompt missing')
      const set = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
      if (!set) throw new Error('no value setter')
      set.call(area, 'a fictional cat, one more clip')
      area.dispatchEvent(new Event('input', { bubbles: true }))
      area.dispatchEvent(new Event('blur', { bubbles: true }))
    }`)
    await waitFor(page, `document.body.innerText.includes('over the $1.50')`)
    notes.push('budget reason visible')
    await themed(page, 'compose-budget-refused', async () => undefined)

    await page.goto(`${matrixServer.origin}/#jobs`)
    await waitFor(page, `document.querySelectorAll('.jobs tbody tr').length > 5`)
    await themed(page, 'jobs-all-states', async () => undefined)

    await page.goto(`${matrixServer.origin}/#review`)
    await delay(300)
    const downloaded = matrix.jobs.downloaded
    const kept = matrix.jobs.keptPlain
    const discarded = matrix.jobs.discarded
    if (!downloaded || !kept || !discarded) throw new Error('matrix ids')
    await page.evaluate<void>(`{
      const select = document.querySelector('#r-clip')
      const set = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set
      set.call(select, ${JSON.stringify(downloaded)})
      select.dispatchEvent(new Event('change', { bubbles: true }))
    }`)
    await delay(300)
    await themed(page, 'review-unanswered', async () => undefined)
    await page.evaluate<void>(`document.querySelector('#r-q1')?.parentElement?.querySelectorAll('button')[1]?.click()`)
    await waitFor(page, `document.querySelector('#r-q1')?.parentElement?.querySelectorAll('button')[1]?.getAttribute('aria-pressed') === 'true'`)
    await themed(page, 'review-partly', async () => undefined)
    const clearLines = await page.evaluate<number>(`document.querySelectorAll('.check li').length`)
    for (let index = 0; index < clearLines; index += 1) {
      await page.evaluate<void>(`document.querySelectorAll('.check li')[${index}].querySelector('button')?.click()`)
      await waitFor(page, `document.querySelectorAll('.check li')[${index}].querySelector('button').getAttribute('aria-pressed') === 'true'`)
    }
    await waitFor(page, `[...document.querySelectorAll('button')].some((button) => button.textContent.trim() === 'Keep' && !button.disabled)`)
    await themed(page, 'review-all-clear', async () => undefined)
    await page.evaluate<void>(`{
      const select = document.querySelector('#r-clip')
      const set = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set
      set.call(select, ${JSON.stringify(kept)})
      select.dispatchEvent(new Event('change', { bubbles: true }))
    }`)
    await delay(300)
    await themed(page, 'review-kept', async () => undefined)
    await page.evaluate<void>(`{
      const select = document.querySelector('#r-clip')
      const set = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set
      set.call(select, ${JSON.stringify(discarded)})
      select.dispatchEvent(new Event('change', { bubbles: true }))
    }`)
    await delay(300)
    await themed(page, 'review-discarded', async () => undefined)

    await page.goto(`${matrixServer.origin}/#publish`)
    await delay(300)
    await themed(page, 'publish-gate-recorded-card-refused', async () => undefined)
    matrixServer.stop()

    const paused = await startServer(matrixData, matrixMedia, { STUDIO_ADMIN_DATABASE: 'unavailable', STUDIO_ADMIN_FREEZE: '1' })
    servers.push(paused)
    await signIn(page, paused.origin, paused.token)
    await page.goto(`${paused.origin}/#compose`)
    await delay(200)
    await themed(page, 'compose-database-paused', async () => undefined)
    await page.goto(`${paused.origin}/#jobs`)
    await delay(200)
    await themed(page, 'jobs-database-banner', async () => undefined)
    paused.stop()

    const credit = await startServer(matrixData, matrixMedia, { STUDIO_STUB: 'out-of-credit', STUDIO_ADMIN_FREEZE: '1' })
    servers.push(credit)
    await signIn(page, credit.origin, credit.token)
    await page.goto(`${credit.origin}/#jobs`)
    await delay(200)
    await themed(page, 'jobs-credit-banner', async () => undefined)
    credit.stop()

    const flowServer = await startServer(flowData, flowMedia)
    servers.push(flowServer)
    await signIn(page, flowServer.origin, flowServer.token)
    await page.goto(`${flowServer.origin}/#publish`)
    await waitFor(page, `!!document.querySelector('#p-clip')`)
    const plain = flow.jobs.keptPlain
    if (!plain || !flow.jobs.keptReady) throw new Error('flow ids')
    await page.evaluate<void>(`{
      const select = document.querySelector('#p-clip')
      if (!select) throw new Error('clip menu missing')
      select.value = ${JSON.stringify(plain)}
      select.dispatchEvent(new Event('change', { bubbles: true }))
    }`)
    await delay(200)
    await themed(page, 'publish-gate-not-recorded', async () => undefined)

    await page.goto(`${flowServer.origin}/#compose`)
    await delay(200)
    await themed(page, 'compose-editable', async () => undefined)
    page.network.length = 0
    await page.evaluate<void>(`{
      const area = document.querySelector('#c-motion')
      const set = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
      set.call(area, 'a fictional cat walks across a plain pitch')
      area.dispatchEvent(new Event('input', { bubbles: true }))
      area.dispatchEvent(new Event('blur', { bubbles: true }))
    }`)
    await delay(500)
    await page.evaluate<void>(`document.querySelector('.studio-primary')?.click()`)
    await delay(800)
    await page.goto(`${flowServer.origin}/#jobs`)
    const known = new Set(Object.values(flow.jobs))
    let fresh = ''
    for (let attempt = 0; attempt < 20 && !fresh; attempt += 1) {
      const listed = JSON.parse((await httpCall(flowServer.port, 'GET', '/api/jobs', { cookie: `studio_session=${flowServer.token}` })).body) as { id: string; status: string }[]
      fresh = listed.find((row) => !known.has(row.id) && row.status === 'completed')?.id ?? ''
      if (!fresh) await delay(500)
    }
    if (!fresh) throw new Error('composed job did not reach completed')
    notes.push(`composed job ${fresh}`)
    await page.goto(`${flowServer.origin}/#jobs`)
    await waitFor(page, `[...document.querySelectorAll('tr')].some((row) => row.textContent.includes(${JSON.stringify(fresh)}) && row.textContent.includes('Download'))`, 15000)
    await page.evaluate<void>(`{
      const row = [...document.querySelectorAll('tr')].find((item) => item.textContent.includes(${JSON.stringify(fresh)}) && item.textContent.includes('Download'))
      if (!row) throw new Error('download row missing')
      row.querySelector('button')?.click()
    }`)
    let downloadedFresh = false
    for (let attempt = 0; attempt < 15; attempt += 1) {
      const listed = JSON.parse((await httpCall(flowServer.port, 'GET', '/api/jobs', { cookie: `studio_session=${flowServer.token}` })).body) as { id: string; status: string }[]
      if (listed.find((row) => row.id === fresh)?.status === 'downloaded') {
        downloadedFresh = true
        break
      }
      await delay(300)
    }
    if (!downloadedFresh) throw new Error('composed job was not downloaded')
    await delay(500)
    await page.goto(`${flowServer.origin}/#review`)
    await waitFor(page, `!!document.querySelector('#r-clip')`)
    await page.evaluate<void>(`{
      const select = document.querySelector('#r-clip')
      if (!select) throw new Error('review menu missing')
      const set = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set
      set.call(select, ${JSON.stringify(fresh)})
      select.dispatchEvent(new Event('change', { bubbles: true }))
    }`)
    await waitFor(page, `document.querySelector('#r-clip') && document.querySelector('#r-clip').value === ${JSON.stringify(fresh)}`)
    await waitFor(page, `document.querySelector('h1') && document.querySelector('h1').textContent === ${JSON.stringify(fresh)}`)
    const lines = await page.evaluate<number>(`document.querySelectorAll('.check li').length`)
    for (let index = 0; index < lines; index += 1) {
      await page.evaluate<void>(`document.querySelectorAll('.check li')[${index}].querySelector('button')?.click()`)
      await waitFor(page, `document.querySelectorAll('.check li')[${index}].querySelector('button').getAttribute('aria-pressed') === 'true'`)
    }
    await waitFor(page, `[...document.querySelectorAll('button')].some((button) => button.textContent.trim() === 'Keep' && !button.disabled)`)
    await page.evaluate<void>(`[...document.querySelectorAll('button')].find((button) => button.textContent.trim() === 'Keep' && !button.disabled)?.click()`)
    let keptFresh = false
    for (let attempt = 0; attempt < 15; attempt += 1) {
      const listed = JSON.parse((await httpCall(flowServer.port, 'GET', '/api/jobs', { cookie: `studio_session=${flowServer.token}` })).body) as { id: string; status: string }[]
      if (listed.find((row) => row.id === fresh)?.status === 'kept') {
        keptFresh = true
        break
      }
      await delay(200)
    }
    if (!keptFresh) throw new Error('composed job was not kept')
    await page.goto(`${flowServer.origin}/#publish`)
    await waitFor(page, `!!document.querySelector('#p-clip')`)
    await page.evaluate<void>(`{
      const select = document.querySelector('#p-clip')
      if (!select) throw new Error('clip menu missing')
      const set = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set
      set.call(select, ${JSON.stringify(flow.jobs.keptReady)})
      select.dispatchEvent(new Event('change', { bubbles: true }))
    }`)
    await waitFor(page, `document.querySelector('#p-clip') && document.querySelector('#p-clip').value === ${JSON.stringify(flow.jobs.keptReady)}`)
    await delay(300)
    await page.evaluate<void>(`{
      function setValue(id, value, proto) {
        const el = document.querySelector(id)
        const set = Object.getOwnPropertyDescriptor(proto, 'value').set
        set.call(el, value)
        el.dispatchEvent(new Event('input', { bubbles: true }))
      }
      setValue('#p-answer', 'Recorded in the proof. Applicability is not decided here.', window.HTMLTextAreaElement.prototype)
      setValue('#p-disclosure', 'The Generated label stays.', window.HTMLTextAreaElement.prototype)
      setValue('#p-by', 'operator', window.HTMLInputElement.prototype)
      setValue('#p-source', 'prove-admin', window.HTMLInputElement.prototype)
      document.querySelector('#p-answer')?.parentElement?.querySelector('button')?.click()
    }`)
    await delay(400)
    await page.evaluate<void>(`{
      function setValue(id, value) {
        const el = document.querySelector(id)
        const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
        set.call(el, value)
        el.dispatchEvent(new Event('input', { bubbles: true }))
      }
      setValue('#p-id', 'flow-ready')
      setValue('#p-title', 'Synthetic ready clip')
      setValue('#p-position', '1')
    }`)
    await waitFor(page, `!!document.querySelector('.studio-primary') && !document.querySelector('.studio-primary').disabled`)
    await page.evaluate<void>(`document.querySelector('.studio-primary')?.click()`)
    await waitFor(page, `[...document.querySelectorAll('button')].some((button) => button.textContent.trim() === 'Unpublish')`)
    await page.evaluate<void>(`[...document.querySelectorAll('button')].find((button) => button.textContent.trim() === 'Unpublish')?.click()`)
    let withdrawn = false
    for (let attempt = 0; attempt < 15; attempt += 1) {
      const listed = JSON.parse((await httpCall(flowServer.port, 'GET', '/api/jobs', { cookie: `studio_session=${flowServer.token}` })).body) as { id: string; status: string }[]
      if (listed.find((row) => row.id === flow.jobs.keptReady)?.status === 'withdrawn') {
        withdrawn = true
        break
      }
      await delay(200)
    }
    if (!withdrawn) throw new Error('ready clip was not unpublished')
    notes.push(`unpublished ${flow.jobs.keptReady}`)
    await waitFor(page, `document.querySelector('#p-clip') && document.querySelector('#p-clip').selectedOptions[0].textContent.startsWith('withdrawn')`)
    await delay(300)
    requestLog.push(...page.network.filter((entry) => entry.path.startsWith('/api/')).map(({ method, path: requestPath, status }) => ({ method, path: requestPath, status })))
    await themed(page, 'publish-after-unpublish', async () => undefined)

    const cookie = `studio_session=${flowServer.token}`
    const security: { name: string; status: number; secrets: string[] }[] = []
    const checks: [string, () => Promise<{ status: number; body: string }>][] = [
      ['no token', () => httpCall(flowServer.port, 'GET', '/api/shell', {})],
      ['wrong token', () => httpCall(flowServer.port, 'GET', '/api/shell', { cookie: 'studio_session=not-this-run' })],
      ['foreign origin', () => httpCall(flowServer.port, 'POST', '/api/shell', { cookie, origin: 'http://evil.example' })],
      ['non-loopback host', () => httpCall(flowServer.port, 'GET', '/api/shell', { cookie, host: 'evil.example' })],
    ]
    for (const [name, run] of checks) {
      const result = await run()
      security.push({ name, status: result.status, secrets: findSecrets(result.body) })
    }
    const live = await page.evaluate<{ status: number; body: string; transport: string }>(`fetch('/api/shell', { method: 'POST', headers: { 'content-type': 'application/json', origin: location.origin }, body: JSON.stringify({ transport: 'live' }) }).then(async (response) => ({ status: response.status, body: await response.text(), transport: '' })).then(async (result) => { const shell = await fetch('/api/shell').then((response) => response.json()); return { ...result, transport: shell.transport } })`)
    security.push({ name: 'browser live switch', status: live.status, secrets: findSecrets(live.body + live.transport) })
    notes.push(`live switch left transport=${live.transport}`)
    writeFileSync(path.join(proofDir, 'security.json'), JSON.stringify(security, null, 2))
    const failedSecurity = security.filter((item) => item.status !== 403 && item.name !== 'browser live switch' || item.secrets.length > 0 || (item.name === 'browser live switch' && live.transport !== 'stub'))
    notes.push(`security failures ${failedSecurity.length}`)

    const badScroll = shots.filter((shot) => !shot.scrollEqual)
    const badContrast = shots.filter((shot) => shot.contrast.some((pair) => !pair.wcag))
    const badConsole = shots.filter((shot) => shot.consoleErrors.length > 0)
    const receipt = {
      date: '2026-10-18',
      shots: shots.map((shot) => ({ ...shot, file: path.relative(proofDir, shot.file) })),
      notes,
      requestLog,
      security,
      counts: {
        shots: shots.length,
        scrollFailures: badScroll.length,
        contrastFailures: badContrast.length,
        consoleFailures: badConsole.length,
      },
    }
    const receiptPath = path.resolve(studioDir, 'verification/st3-admin-receipt.json')
    mkdirSync(path.dirname(receiptPath), { recursive: true })
    writeFileSync(receiptPath, JSON.stringify(receipt, null, 2))
    process.stdout.write(`${receiptPath}\nshots ${shots.length} scroll ${badScroll.length} contrast ${badContrast.length} console ${badConsole.length}\n`)
  } finally {
    page.close()
    chrome.kill()
    for (const server of servers) server.stop()
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.stack : 'prove failed'}\n`)
  process.exitCode = 1
})
