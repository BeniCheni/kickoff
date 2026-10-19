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
import { syntheticMp4 } from '../media/mp4.ts'
import { PHOTO_LIMIT } from '../server/body.ts'
import { assertLoopbackBind } from '../server/bind.ts'
import { findSecrets } from '../secrets/scan.ts'
import { minimalJpeg } from '../test/jpeg.ts'
import { seedAdmin, type SeedManifest } from './seed-admin.ts'

const here = path.dirname(fileURLToPath(import.meta.url))
const studioDir = path.resolve(here, '..')
const proofDir = path.join(process.env.HOME ?? '/tmp', 'kickoff-st3b-proofs')
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

function httpCall(port: number, method: string, urlPath: string, headers: Record<string, string>, body?: string | Buffer): Promise<{ status: number; body: string; setCookie: string }> {
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
      response.on('end', () => {
        const setCookie = response.headers['set-cookie']
        resolve({
          status: response.statusCode ?? 0,
          body: Buffer.concat(chunks).toString('utf8'),
          setCookie: (Array.isArray(setCookie) ? setCookie[0] : setCookie)?.split(';')[0] ?? '',
        })
      })
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

function startServer(dataDir: string, mediaDir: string, extra: Record<string, string> = {}, args: string[] = []): Promise<{ port: number; origin: string; token: string; stop: () => void }> {
  const child = spawn('npx', ['tsx', 'server/main.ts', ...args], {
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

function filePayload(bytes: Uint8Array, name: string, type: string): { name: string; type: string; base64: string } {
  return { name, type, base64: Buffer.from(bytes).toString('base64') }
}

async function chooseImportFile(page: Page, id: string, file: { name: string; type: string; base64: string }): Promise<void> {
  await page.evaluate<void>(`(() => {
    const item = ${JSON.stringify(file)}
    const binary = atob(item.base64)
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
    const input = document.querySelector(${JSON.stringify(id)})
    if (!input) throw new Error('missing ' + ${JSON.stringify(id)})
    const list = new DataTransfer()
    list.items.add(new File([bytes], item.name, { type: item.type }))
    input.files = list.files
    input.dispatchEvent(new Event('change', { bubbles: true }))
  })()`)
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
    await waitFor(page, `(() => { const cell = document.querySelector(${JSON.stringify(`td.job-id[title="${fresh}"]`)}); const row = cell && cell.closest('tr'); return !!row && row.textContent.includes('Download') })()`, 15000)
    await page.evaluate<void>(`{
      const cell = document.querySelector(${JSON.stringify(`td.job-id[title="${fresh}"]`)})
      const row = cell && cell.closest('tr')
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
    flowServer.stop()
    const dummyUrl = ['postgres', '://127.0.0.1:1/studio'].join('')
    const pausedLive = await startServer(flowData, flowMedia, { STUDIO_LIVE: '1', DATABASE_URL: dummyUrl }, ['--live'])
    servers.push(pausedLive)
    const pausedTicket = await httpCall(pausedLive.port, 'GET', `/?ticket=${encodeURIComponent(pausedLive.token)}`, {})
    const pausedShell = JSON.parse((await httpCall(pausedLive.port, 'GET', '/api/shell', { cookie: pausedTicket.setCookie })).body) as { database: string; storage: string; transport: string; fal: string; falConfigured: boolean }
    if (pausedShell.database !== 'unavailable' || pausedShell.storage !== 'refused' || pausedShell.transport !== 'live' || pausedShell.fal !== 'refused' || pausedShell.falConfigured !== false) {
      throw new Error(`paused live shell ${JSON.stringify(pausedShell)}`)
    }
    const pausedBody = JSON.stringify(pausedShell)
    if (pausedBody.includes('Failed query')) throw new Error('driver text in the paused shell')
    security.push({ name: 'live database paused', status: 200, secrets: findSecrets(pausedBody) })
    notes.push('live database at 127.0.0.1:1 shows the paused banner')
    pausedLive.stop()

    const liveData = path.join(proofDir, 'live-data')
    const liveMedia = path.join(proofDir, 'live-media')
    rmSync(liveData, { recursive: true, force: true })
    rmSync(liveMedia, { recursive: true, force: true })
    const liveSeed = await seedAdmin(liveData, liveMedia, 'flow')
    const liveServer = await startServer(liveData, liveMedia, {
      STUDIO_LIVE: '1',
      DATABASE_URL: dummyUrl,
      STUDIO_ADMIN_LIVE_PGLITE: '1',
      NODE_ENV: 'test',
    }, ['--live'])
    servers.push(liveServer)
    const liveTicket = await httpCall(liveServer.port, 'GET', `/?ticket=${encodeURIComponent(liveServer.token)}`, {})
    const liveCookie = liveTicket.setCookie
    const liveHeaders = { cookie: liveCookie, origin: liveServer.origin, 'content-type': 'application/json' }
    const gate = JSON.parse((await httpCall(liveServer.port, 'POST', '/api/gate', liveHeaders, JSON.stringify({
      answer: 'Recorded for the live refusal proof.',
      disclosure: 'The Generated label stays.',
      recordedBy: 'operator',
      source: 'prove-admin',
    }))).body) as { outcome: string }
    if (gate.outcome !== 'gate-recorded') throw new Error(`live gate ${gate.outcome}`)
    const ready = liveSeed.jobs.keptReady
    if (!ready) throw new Error('live seed')
    const refusedPublish = JSON.parse((await httpCall(liveServer.port, 'POST', `/api/publish/${ready}/go`, liveHeaders, JSON.stringify({
      publicId: 'live-proof',
      title: 'Live proof',
      position: 1,
      confirm: true,
    }))).body) as { outcome: string }
    if (refusedPublish.outcome !== 'upload-failed') throw new Error(`live publish ${refusedPublish.outcome}`)
    security.push({ name: 'live publish', status: 200, secrets: findSecrets(JSON.stringify(refusedPublish)) })
    for (const [name, pathName, payload] of [
      ['live unpublish delete', `/api/publish/${ready}/unpublish`, { deleteFiles: true }],
      ['live retry delete', `/api/publish/${ready}/retry-delete`, {}],
      ['live retry removal', `/api/publish/${ready}/retry-removal`, {}],
    ] as const) {
      const refused = JSON.parse((await httpCall(liveServer.port, 'POST', pathName, liveHeaders, JSON.stringify(payload))).body) as { outcome: string }
      if (refused.outcome !== 'storage-refused') throw new Error(`${name} ${refused.outcome}`)
      security.push({ name, status: 200, secrets: [] })
    }
    const stillKept = JSON.parse((await httpCall(liveServer.port, 'GET', '/api/jobs', { cookie: liveCookie })).body) as { id: string; status: string }[]
    if (stillKept.find((row) => row.id === ready)?.status !== 'kept') throw new Error('live publish changed the clip')
    notes.push(`live publish refused for ${ready}; the clip stayed kept`)
    liveServer.stop()

    const importData = path.join(proofDir, 'import-data')
    const importMedia = path.join(proofDir, 'import-media')
    rmSync(importData, { recursive: true, force: true })
    rmSync(importMedia, { recursive: true, force: true })
    mkdirSync(importData, { recursive: true })
    mkdirSync(importMedia, { recursive: true })
    const importServer = await startServer(importData, importMedia)
    servers.push(importServer)
    await signIn(page, importServer.origin, importServer.token)
    await page.goto(`${importServer.origin}/#import`)
    await waitFor(page, `!!document.querySelector('#i-clip')`)
    await themed(page, 'import-empty', async () => undefined)
    const pngFile = filePayload(new Uint8Array([1, 2, 3]), 'still.png', 'image/png')
    await chooseImportFile(page, '#i-still', pngFile)
    await waitFor(page, `document.body.innerText.includes('This still is a PNG')`)
    await themed(page, 'import-png', async () => undefined)
    const made = Math.floor(Date.parse('2026-10-21T15:00:00.000Z') / 1000) + 2_082_844_800
    const whole = syntheticMp4({ userData: true, audio: true, creationTime: made })
    const cut = whole.slice(0, Buffer.from(whole).lastIndexOf('mdat') + 8)
    await chooseImportFile(page, '#i-clip', filePayload(cut, 'cut.mp4', 'video/mp4'))
    await chooseImportFile(page, '#i-still', filePayload(minimalJpeg, 'still.jpg', 'image/jpeg'))
    await page.evaluate<void>(`{
      function setText(id, value, proto) {
        const el = document.querySelector(id)
        const set = Object.getOwnPropertyDescriptor(proto, 'value').set
        set.call(el, value)
        el.dispatchEvent(new Event('input', { bubbles: true }))
      }
      setText('#i-prompt', 'a fictional cat, as typed', window.HTMLTextAreaElement.prototype)
      document.querySelector('.studio-seg button')?.click()
      setText('#i-title', 'Fenway', window.HTMLInputElement.prototype)
      setText('#i-made', '2026-10-21', window.HTMLInputElement.prototype)
    }`)
    await page.evaluate<void>(`[...document.querySelectorAll('button')].find((button) => button.textContent.trim() === 'Read the file')?.click()`)
    await waitFor(page, `document.body.innerText.includes('the clip is truncated')`)
    await themed(page, 'import-refused', async () => undefined)
    await chooseImportFile(page, '#i-clip', filePayload(whole, 'fenway.mp4', 'video/mp4'))
    await page.evaluate<void>(`[...document.querySelectorAll('button')].find((button) => button.textContent.trim() === 'Read the file')?.click()`)
    await waitFor(page, `document.body.innerText.includes('Width 1920') && document.body.innerText.includes('Strip will remove udta,meta')`)
    await themed(page, 'import-preview', async () => undefined)
    await page.evaluate<void>(`document.querySelector('.studio-primary')?.click()`)
    await waitFor(page, `document.body.innerText.includes('The clip is in Jobs and Review')`)
    await themed(page, 'import-imported', async () => undefined)
    const importCookie = `studio_session=${importServer.token}`
    const importedJobs = JSON.parse((await httpCall(importServer.port, 'GET', '/api/jobs', { cookie: importCookie })).body) as { id: string; status: string }[]
    const importedId = importedJobs.find((row) => row.status === 'downloaded')?.id
    if (!importedId) throw new Error('imported clip is not downloaded')
    await page.goto(`${importServer.origin}/#review`)
    await waitFor(page, `document.querySelectorAll('.check li').length === 5`)
    for (let index = 0; index < 5; index += 1) {
      await page.evaluate<void>(`document.querySelectorAll('.check li')[${index}].querySelector('button')?.click()`)
      await waitFor(page, `document.querySelectorAll('.check li')[${index}].querySelector('button').getAttribute('aria-pressed') === 'true'`)
    }
    await waitFor(page, `[...document.querySelectorAll('button')].some((button) => button.textContent.trim() === 'Keep' && !button.disabled)`)
    await page.evaluate<void>(`[...document.querySelectorAll('button')].find((button) => button.textContent.trim() === 'Keep')?.click()`)
    await waitFor(page, `document.body.innerText.includes('5 of 5 clear')`)
    let keptJob = false
    for (let attempt = 0; attempt < 15 && !keptJob; attempt += 1) {
      const listed = JSON.parse((await httpCall(importServer.port, 'GET', '/api/jobs', { cookie: importCookie })).body) as { id: string; status: string }[]
      keptJob = listed.find((row) => row.id === importedId)?.status === 'kept'
      if (!keptJob) await delay(200)
    }
    if (!keptJob) throw new Error('imported clip was not kept')
    await page.goto(`${importServer.origin}/#publish`)
    await waitFor(page, `!!document.querySelector('#p-answer')`)
    await page.evaluate<void>(`{
      function setValue(id, value, proto) {
        const el = document.querySelector(id)
        const set = Object.getOwnPropertyDescriptor(proto, 'value').set
        set.call(el, value)
        el.dispatchEvent(new Event('input', { bubbles: true }))
      }
      setValue('#p-answer', 'Recorded in the import proof.', window.HTMLTextAreaElement.prototype)
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
      setValue('#p-id', 'fenway-import')
      setValue('#p-title', 'Fenway')
      setValue('#p-position', '1')
    }`)
    await waitFor(page, `!!document.querySelector('.studio-primary') && !document.querySelector('.studio-primary').disabled && document.querySelector('.studio-primary').textContent.trim() === 'Publish'`)
    await page.evaluate<void>(`document.querySelector('.studio-primary')?.click()`)
    await waitFor(page, `[...document.querySelectorAll('button')].some((button) => button.textContent.trim() === 'Unpublish')`)
    await page.evaluate<void>(`[...document.querySelectorAll('button')].find((button) => button.textContent.trim() === 'Unpublish')?.click()`)
    await waitFor(page, `document.querySelector('#p-clip') && document.querySelector('#p-clip').selectedOptions[0].textContent.startsWith('withdrawn')`)
    notes.push(`import flow ${importedId} published and withdrawn`)
    const importHeaders = { cookie: importCookie, origin: importServer.origin }
    const pngUpload = await httpCall(importServer.port, 'POST', '/api/import/still', { ...importHeaders, 'content-type': 'image/png' }, 'png')
    const plainUpload = await httpCall(importServer.port, 'POST', '/api/import/clip', { ...importHeaders, 'content-type': 'text/plain' }, 'hello')
    const hugeUpload = await httpCall(importServer.port, 'POST', '/api/import/still', { ...importHeaders, 'content-type': 'image/jpeg' }, Buffer.alloc(PHOTO_LIMIT + 1))
    for (const [name, result, status] of [
      ['upload png', pngUpload, 415],
      ['upload not an mp4', plainUpload, 415],
      ['upload too large', hugeUpload, 413],
    ] as const) {
      if (result.status !== status) throw new Error(`${name} ${result.status}`)
      security.push({ name, status: result.status, secrets: findSecrets(result.body) })
    }
    importServer.stop()

    const account = ['R2', '_ACCOUNT_ID'].join('')
    const access = ['R2', '_ACCESS_KEY_ID'].join('')
    const secretName = ['R2', '_SECRET_ACCESS_KEY'].join('')
    const bucket = ['R2', '_BUCKET'].join('')
    const r2Env = {
      STUDIO_LIVE: '1',
      DATABASE_URL: dummyUrl,
      STUDIO_ADMIN_LIVE_PGLITE: '1',
      NODE_ENV: 'test',
      STUDIO_R2_FETCH: 'inject',
      [account]: 'accountid123',
      [access]: 'AKIAEXAMPLEKEY',
      [secretName]: ['super', '-secret-value'].join(''),
      [bucket]: 'moments-live',
    }
    const r2Data = path.join(proofDir, 'r2-data')
    const r2Media = path.join(proofDir, 'r2-media')
    rmSync(r2Data, { recursive: true, force: true })
    rmSync(r2Media, { recursive: true, force: true })
    await seedAdmin(r2Data, r2Media, 'flow')
    const r2Server = await startServer(r2Data, r2Media, r2Env, ['--live'])
    servers.push(r2Server)
    await signIn(page, r2Server.origin, r2Server.token)
    await page.goto(`${r2Server.origin}/#publish`)
    await waitFor(page, `document.body.innerText.toLowerCase().includes('storage=r2') && document.body.innerText.toLowerCase().includes('live on the next read')`, 15000)
    await themed(page, 'live-r2-confirm', async () => undefined)
    r2Server.stop()

    const refusedServer = await startServer(r2Data, r2Media, {
      STUDIO_LIVE: '1',
      DATABASE_URL: dummyUrl,
      STUDIO_ADMIN_LIVE_PGLITE: '1',
      NODE_ENV: 'test',
    }, ['--live'])
    servers.push(refusedServer)
    await signIn(page, refusedServer.origin, refusedServer.token)
    await page.goto(`${refusedServer.origin}/#publish`)
    await waitFor(page, `document.body.innerText.toLowerCase().includes('storage=refused') && document.body.innerText.toLowerCase().includes('storage is not connected')`)
    await themed(page, 'live-storage-refused', async () => undefined)
    refusedServer.stop()

    const unreachable = await startServer(r2Data, r2Media, {
      STUDIO_LIVE: '1',
      DATABASE_URL: dummyUrl,
      STUDIO_ADMIN_DATABASE: 'unavailable',
    }, ['--live'])
    servers.push(unreachable)
    await signIn(page, unreachable.origin, unreachable.token)
    await page.goto(`${unreachable.origin}/#jobs`)
    await waitFor(page, `document.body.innerText.toLowerCase().includes('database unavailable') && document.body.innerText.toLowerCase().includes('storage=refused')`)
    await themed(page, 'live-database-unreachable', async () => undefined)
    unreachable.stop()

    writeFileSync(path.join(proofDir, 'security.json'), JSON.stringify(security, null, 2))
    const allowed = new Map<string, number>([
      ['browser live switch', 405],
      ['live database paused', 200],
      ['live publish', 200],
      ['live unpublish delete', 200],
      ['live retry delete', 200],
      ['live retry removal', 200],
      ['upload png', 415],
      ['upload not an mp4', 415],
      ['upload too large', 413],
    ])
    const failedSecurity = security.filter((item) => item.secrets.length > 0 || (allowed.get(item.name) ?? 403) !== item.status || (item.name === 'browser live switch' && live.transport !== 'stub'))
    notes.push(`security failures ${failedSecurity.length}`)

    const badScroll = shots.filter((shot) => !shot.scrollEqual)
    const badContrast = shots.filter((shot) => shot.contrast.some((pair) => !pair.wcag))
    const badConsole = shots.filter((shot) => shot.consoleErrors.length > 0)
    const receipt = {
      date: '2026-10-19',
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
    const receiptPath = path.resolve(studioDir, 'verification/st3b-admin-receipt.json')
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
