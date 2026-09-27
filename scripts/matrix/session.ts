import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import type { CdpConnection } from './cdp'
import type { ChromeHandle } from './chrome'
import { classifyRequestUrl, mediaRequestFails } from './classify'
import { GEOMETRY_EPSILON, boxDisjoint, boxInside, hitPoints } from './geometry'
import { screenshotFileName } from './names'
import { themeStorageKey } from '../../src/lib/theme'
import { themeInitScript } from './themeScript'
import { cellUrl } from './expand'
import type { Box, Cell, CellAction, CellResult, GeometryAssertion } from './types'

const KEYS: Record<string, { code: string; keyCode: number; text?: string }> = {
  Escape: { code: 'Escape', keyCode: 27 },
  Tab: { code: 'Tab', keyCode: 9 },
  Enter: { code: 'Enter', keyCode: 13, text: '\r' },
  Space: { code: 'Space', keyCode: 32, text: ' ' },
  ArrowUp: { code: 'ArrowUp', keyCode: 38 },
  ArrowDown: { code: 'ArrowDown', keyCode: 40 },
  ArrowLeft: { code: 'ArrowLeft', keyCode: 37 },
  ArrowRight: { code: 'ArrowRight', keyCode: 39 },
  Home: { code: 'Home', keyCode: 36 },
  End: { code: 'End', keyCode: 35 },
  Backspace: { code: 'Backspace', keyCode: 8 },
}

type Bucket = {
  requests: string[]
  pageErrors: string[]
  consoleErrors: string[]
  ignoredConsole: string[]
}

type Measured = {
  scrollWidth: number
  innerWidth: number
  innerHeight: number
  iframes: number
  videos: number
  storage: string | null
  theme: string | null
  lens: string | null
  colorScheme: 'light' | 'dark'
  reducedMotion: boolean
}

type GeometryRead = {
  kind: GeometryAssertion['kind']
  a: string
  b: string
  aBoxes: Box[]
  bBoxes: Box[]
}

type HitRead = { ok: boolean; x: number; y: number; hit: string }

export async function runCells(options: {
  chrome: ChromeHandle
  baseUrl: string
  cells: readonly Cell[]
  screenshots: boolean
  outDir: string
}): Promise<CellResult[]> {
  const { chrome, baseUrl, cells, screenshots, outDir } = options
  const { cdp, sessionId } = chrome
  let blockMedia = true
  let live: Bucket | null = null
  let scriptId: string | undefined
  if (screenshots) mkdirSync(path.join(outDir, 'screenshots'), { recursive: true })

  cdp.on('Network.requestWillBeSent', (params, eventSession) => {
    if (eventSession !== sessionId || !live) return
    const url = (params as { request?: { url?: string } }).request?.url
    if (url) live.requests.push(url)
  })
  cdp.on('Fetch.requestPaused', (params, eventSession) => {
    if (eventSession !== sessionId) return
    const paused = params as { requestId?: string; request?: { url?: string } }
    const url = paused.request?.url
    const requestId = paused.requestId
    if (url && live) live.requests.push(url)
    if (!requestId) return
    const block = blockMedia && !!url && classifyRequestUrl(url, baseUrl) === 'media-provider'
    const method = block ? 'Fetch.failRequest' : 'Fetch.continueRequest'
    const body = block ? { requestId, errorReason: 'BlockedByClient' } : { requestId }
    void cdp.send(method, body, sessionId).catch(() => {})
  })
  cdp.on('Runtime.exceptionThrown', (params, eventSession) => {
    if (eventSession !== sessionId || !live) return
    live.pageErrors.push(clip(exceptionText(params)))
  })
  cdp.on('Runtime.consoleAPICalled', (params, eventSession) => {
    if (eventSession !== sessionId || !live) return
    const call = params as { type?: string; args?: { value?: unknown; description?: string; unserializableValue?: string }[] }
    if (call.type !== 'error') return
    const text = clip((call.args ?? []).map(argText).filter(Boolean).join(' ') || 'console error')
    if (isIgnoredConsole(text, undefined, baseUrl)) live.ignoredConsole.push(text)
    else live.consoleErrors.push(text)
  })
  cdp.on('Log.entryAdded', (params, eventSession) => {
    if (eventSession !== sessionId || !live) return
    const entry = (params as { entry?: { level?: string; text?: string; url?: string } }).entry
    if (!entry || entry.level !== 'error') return
    const text = clip(entry.url ? `${entry.text ?? 'error'} (${entry.url})` : (entry.text ?? 'error'))
    if (isIgnoredConsole(text, entry.url, baseUrl)) live.ignoredConsole.push(text)
    else live.consoleErrors.push(text)
  })

  const results: CellResult[] = []
  for (const cell of cells) {
    const bucket: Bucket = { requests: [], pageErrors: [], consoleErrors: [], ignoredConsole: [] }
    live = bucket
    blockMedia = !cell.playIntent
    const result = blank(cell, cellUrl(baseUrl, cell))
    try {
      await setViewport(cdp, sessionId, cell)
      scriptId = await replaceThemeScript(cdp, sessionId, scriptId, cell)
      const loaded = cdp.waitFor('Page.loadEventFired', sessionId, 20_000)
      void loaded.promise.catch(() => {})
      const navigated = await cdp.send('Page.navigate', { url: result.url }, sessionId) as { errorText?: string }
      if (navigated.errorText) {
        loaded.cancel()
        throw new Error(navigated.errorText)
      }
      try {
        await loaded.promise
      } catch (error) {
        loaded.cancel()
        throw error
      }
      const landed = await evaluate<string>(cdp, sessionId, 'location.pathname')
      if (landed !== cell.path) {
        const again = cdp.waitFor('Page.loadEventFired', sessionId, 10_000)
        void again.promise.catch(() => {})
        await again.promise
      }
      await settle()
      await runActions(cdp, sessionId, cell)
      // Again, immediately before any measurement. A navigation can reset the surface.
      await setViewport(cdp, sessionId, cell)
      await measure(cdp, sessionId, cell, result)
      if (screenshots) {
        await setViewport(cdp, sessionId, cell)
        result.screenshot = await capture(cdp, sessionId, cell, outDir)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (message.includes('socket closed')) throw error
      result.reasons.push(clip(message))
    }
    applyCollected(result, cell, bucket, baseUrl)
    result.passed = result.reasons.length === 0
    results.push(result)
    live = null
  }
  if (scriptId) {
    await cdp.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: scriptId }, sessionId).catch(() => {})
  }
  return results
}

async function setViewport(cdp: CdpConnection, sessionId: string, cell: Cell): Promise<void> {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: cell.width,
    height: cell.height,
    deviceScaleFactor: 1,
    mobile: false,
  }, sessionId)
  await cdp.send('Emulation.setEmulatedMedia', {
    features: [
      { name: 'prefers-color-scheme', value: cell.colorScheme },
      { name: 'prefers-reduced-motion', value: cell.reducedMotion },
    ],
  }, sessionId)
}

async function replaceThemeScript(
  cdp: CdpConnection,
  sessionId: string,
  previous: string | undefined,
  cell: Cell,
): Promise<string | undefined> {
  if (previous) {
    await cdp.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: previous }, sessionId).catch(() => {})
  }
  const added = await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
    source: themeInitScript(cell.lens, cell.theme),
  }, sessionId) as { identifier?: string }
  return added.identifier
}

async function settle(): Promise<void> {
  await sleep(100)
}

async function runActions(cdp: CdpConnection, sessionId: string, cell: Cell): Promise<void> {
  for (const action of cell.actions) await runAction(cdp, sessionId, cell, action)
}

async function runAction(cdp: CdpConnection, sessionId: string, cell: Cell, action: CellAction): Promise<void> {
  if ('waitMs' in action) {
    await sleep(action.waitMs)
    return
  }
  if ('waitFor' in action) {
    const start = Date.now()
    while (Date.now() - start < 5_000) {
      const found = await evaluate<boolean>(cdp, sessionId, `Boolean(document.querySelector(${JSON.stringify(action.waitFor)}))`)
      if (found) return
      await sleep(50)
    }
    throw new Error(`waitFor timed out: ${action.waitFor}`)
  }
  if ('key' in action) {
    await dispatchKey(cdp, sessionId, action.key)
    return
  }
  const box = await evaluate<Box | null>(cdp, sessionId, `(() => {
    const el = document.querySelector(${JSON.stringify(action.click)})
    if (!el) return null
    el.scrollIntoView({ block: 'center', inline: 'nearest' })
    const r = el.getBoundingClientRect()
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }
  })()`)
  if (!box) throw new Error(`click ${action.click} matched nothing`)
  const point = hitPoints(box, { width: cell.width, height: cell.height })?.[0]
  if (!point) throw new Error(`click ${action.click} is not on screen`)
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y }, sessionId)
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 }, sessionId)
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 }, sessionId)
}

async function dispatchKey(cdp: CdpConnection, sessionId: string, key: string): Promise<void> {
  const known = KEYS[key]
  const info = known ?? (key.length === 1
    ? { code: `Key${key.toUpperCase()}`, keyCode: key.toUpperCase().charCodeAt(0), text: key }
    : undefined)
  if (!info) throw new Error(`unsupported key: ${key}`)
  for (const type of ['keyDown', 'keyUp'] as const) {
    await cdp.send('Input.dispatchKeyEvent', {
      type,
      key,
      code: info.code,
      windowsVirtualKeyCode: info.keyCode,
      nativeVirtualKeyCode: info.keyCode,
      text: type === 'keyDown' ? info.text : undefined,
    }, sessionId)
  }
}

async function measure(cdp: CdpConnection, sessionId: string, cell: Cell, result: CellResult): Promise<void> {
  await evaluate(cdp, sessionId, `document.fonts ? Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 2500))]) : 0`)
  const page = await evaluate<Measured>(cdp, sessionId, measureExpression(cell))
  result.viewport = {
    pass: page.innerWidth === cell.width && page.innerHeight === cell.height,
    innerWidth: page.innerWidth,
    innerHeight: page.innerHeight,
  }
  if (!result.viewport.pass) {
    result.reasons.push(`viewport inner ${page.innerWidth}×${page.innerHeight} !== ${cell.width}×${cell.height}`)
  }
  result.scrollWidth = {
    pass: page.scrollWidth === page.innerWidth,
    scrollWidth: page.scrollWidth,
    innerWidth: page.innerWidth,
  }
  if (!result.scrollWidth.pass) {
    result.reasons.push(`scrollWidth ${page.scrollWidth} !== innerWidth ${page.innerWidth}`)
  }
  const embeds = page.iframes + page.videos
  result.embeds = { pass: embeds <= cell.maxEmbeds, iframes: page.iframes, videos: page.videos, limit: cell.maxEmbeds }
  if (!result.embeds.pass) result.reasons.push(`embeds iframe+video ${embeds} > limit ${cell.maxEmbeds}`)
  result.themeCheck = {
    pass: true,
    storage: page.storage,
    datasetTheme: page.theme,
    datasetLens: page.lens,
  }
  if (page.storage !== cell.theme) {
    result.themeCheck.pass = false
    result.reasons.push(`stored theme ${page.storage ?? 'empty'} !== ${cell.theme}`)
  }
  if (page.theme && page.theme !== cell.theme) {
    result.themeCheck.pass = false
    result.reasons.push(`data-theme ${page.theme} !== ${cell.theme}`)
  }
  if (page.lens && page.lens !== cell.lens) {
    result.themeCheck.pass = false
    result.reasons.push(`data-lens ${page.lens} !== ${cell.lens}`)
  }
  const wantReduce = cell.reducedMotion === 'reduce'
  result.mediaEmulation = {
    pass: page.colorScheme === cell.colorScheme && page.reducedMotion === wantReduce,
    colorScheme: page.colorScheme,
    reducedMotion: page.reducedMotion,
  }
  if (page.colorScheme !== cell.colorScheme) {
    result.reasons.push(`prefers-color-scheme ${page.colorScheme} !== ${cell.colorScheme}`)
  }
  if (page.reducedMotion !== wantReduce) {
    result.reasons.push(`prefers-reduced-motion did not match ${cell.reducedMotion}`)
  }
  await measureGeometry(cdp, sessionId, cell, result)
  await measureHitTests(cdp, sessionId, cell, result, page.innerWidth, page.innerHeight)
}

function measureExpression(cell: Cell): string {
  const key = JSON.stringify(themeStorageKey(cell.lens))
  return `(() => {
    let storage = null
    try { storage = localStorage.getItem(${key}) } catch (e) { storage = null }
    const root = document.documentElement
    return {
      scrollWidth: root.scrollWidth,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      iframes: document.querySelectorAll('iframe').length,
      videos: document.querySelectorAll('video').length,
      storage,
      theme: root.dataset.theme || null,
      lens: root.dataset.lens || null,
      colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    }
  })()`
}

async function measureGeometry(cdp: CdpConnection, sessionId: string, cell: Cell, result: CellResult): Promise<void> {
  if (cell.geometry.length === 0) {
    result.geometry = { pass: true, assertions: [] }
    return
  }
  const reads = await evaluate<GeometryRead[]>(cdp, sessionId, `(() => {
    const spec = ${JSON.stringify(cell.geometry)}
    const boxes = (selector) => [...document.querySelectorAll(selector)].map((el) => {
      const r = el.getBoundingClientRect()
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }
    })
    return spec.map((item) => ({ kind: item.kind, a: item.a, b: item.b, aBoxes: boxes(item.a), bBoxes: boxes(item.b) }))
  })()`)
  const assertions = reads.map((read) => judgeGeometry(read))
  result.geometry = { pass: assertions.every((item) => item.pass), assertions }
  for (const item of assertions) {
    if (!item.pass) result.reasons.push(`geometry ${item.kind} ${item.a} / ${item.b}: ${item.detail}`)
  }
}

function judgeGeometry(read: GeometryRead): { kind: string; a: string; b: string; pass: boolean; detail: string } {
  if (read.aBoxes.length === 0) {
    return { kind: read.kind, a: read.a, b: read.b, pass: false, detail: `${read.a} matched nothing` }
  }
  if (read.bBoxes.length === 0) {
    return { kind: read.kind, a: read.a, b: read.b, pass: false, detail: `${read.b} matched nothing` }
  }
  if (read.kind === 'inside') {
    const ok = read.aBoxes.every((box) => read.bBoxes.some((outer) => boxInside(box, outer, GEOMETRY_EPSILON)))
    return { kind: read.kind, a: read.a, b: read.b, pass: ok, detail: ok ? 'inside' : 'not inside' }
  }
  const ok = read.aBoxes.every((box) => boxDisjoint(box, read.bBoxes, GEOMETRY_EPSILON))
  return { kind: read.kind, a: read.a, b: read.b, pass: ok, detail: ok ? 'disjoint' : 'intersects' }
}

async function measureHitTests(
  cdp: CdpConnection,
  sessionId: string,
  cell: Cell,
  result: CellResult,
  viewportWidth: number,
  viewportHeight: number,
): Promise<void> {
  if (cell.hitTest.length === 0) {
    result.hitTest = { pass: true, selectors: [] }
    return
  }
  const selectors: { selector: string; pass: boolean; detail: string }[] = []
  for (const assertion of cell.hitTest) {
    const count = await evaluate<number>(cdp, sessionId, `document.querySelectorAll(${JSON.stringify(assertion.selector)}).length`)
    if (count === 0) {
      selectors.push({ selector: assertion.selector, pass: false, detail: 'matched nothing' })
      continue
    }
    if (count > 30) {
      selectors.push({ selector: assertion.selector, pass: false, detail: `${count} matches exceeds 30` })
      continue
    }
    const misses: string[] = []
    for (let index = 0; index < count; index++) {
      const box = await evaluate<Box>(cdp, sessionId, `(() => {
        const el = document.querySelectorAll(${JSON.stringify(assertion.selector)})[${index}]
        el.scrollIntoView({ block: 'center', inline: 'nearest' })
        const r = el.getBoundingClientRect()
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }
      })()`)
      const points = hitPoints(box, { width: viewportWidth, height: viewportHeight })
      if (!points) {
        misses.push(`#${index} not visible`)
        continue
      }
      const hits = await evaluate<HitRead[]>(cdp, sessionId, `(() => {
        const el = document.querySelectorAll(${JSON.stringify(assertion.selector)})[${index}]
        const points = ${JSON.stringify(points)}
        return points.map((p) => {
          const hit = document.elementFromPoint(p.x, p.y)
          const label = !hit ? 'none' : (hit.id ? hit.tagName.toLowerCase() + '#' + hit.id : hit.tagName.toLowerCase())
          return { ok: Boolean(hit && (hit === el || el.contains(hit))), x: p.x, y: p.y, hit: label }
        })
      })()`)
      for (const hit of hits) {
        if (!hit.ok) misses.push(`(${Math.round(hit.x)},${Math.round(hit.y)}) hit ${hit.hit}`)
      }
    }
    selectors.push({
      selector: assertion.selector,
      pass: misses.length === 0,
      detail: misses.length === 0 ? `${count} element(s) received their points` : misses.slice(0, 6).join('; '),
    })
  }
  result.hitTest = { pass: selectors.every((item) => item.pass), selectors }
  for (const item of selectors) {
    if (!item.pass) result.reasons.push(`hit-test ${item.selector}: ${item.detail}`)
  }
}

async function capture(cdp: CdpConnection, sessionId: string, cell: Cell, outDir: string): Promise<string> {
  const shot = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
    clip: { x: 0, y: 0, width: cell.width, height: cell.height, scale: 1 },
  }, sessionId) as { data?: string }
  if (!shot.data) throw new Error('screenshot returned no data')
  const relative = path.join('screenshots', screenshotFileName(cell))
  writeFileSync(path.join(outDir, relative), Buffer.from(shot.data, 'base64'))
  return relative
}

function applyCollected(result: CellResult, cell: Cell, bucket: Bucket, baseUrl: string): void {
  const grouped: Record<'app' | 'font' | 'media-provider' | 'other-external', string[]> = {
    app: [],
    font: [],
    'media-provider': [],
    'other-external': [],
  }
  for (const url of unique(bucket.requests)) {
    grouped[classifyRequestUrl(url, baseUrl)].push(url)
  }
  const mediaFails = grouped['media-provider'].filter((url) => mediaRequestFails(classifyRequestUrl(url, baseUrl), cell.playIntent))
  result.network = {
    pass: mediaFails.length === 0,
    app: grouped.app.slice(0, 80),
    fonts: grouped.font.slice(0, 80),
    mediaProvider: grouped['media-provider'].slice(0, 80),
    otherExternal: grouped['other-external'].slice(0, 80),
  }
  if (mediaFails.length > 0) {
    result.reasons.push(`media-provider request: ${mediaFails.slice(0, 3).join(', ')}`)
  }
  result.pageErrors = { pass: bucket.pageErrors.length === 0, errors: unique(bucket.pageErrors).slice(0, 20) }
  for (const error of result.pageErrors.errors) result.reasons.push(`page error: ${error}`)
  result.consoleErrors = {
    pass: bucket.consoleErrors.length === 0,
    errors: unique(bucket.consoleErrors).slice(0, 20),
    ignored: unique(bucket.ignoredConsole).slice(0, 20),
  }
  for (const error of result.consoleErrors.errors) result.reasons.push(`console error: ${error}`)
}

function blank(cell: Cell, url: string): CellResult {
  return {
    id: cell.id,
    url,
    width: cell.width,
    height: cell.height,
    lens: cell.lens,
    tab: cell.tab,
    theme: cell.theme,
    state: cell.state,
    passed: false,
    reasons: [],
    viewport: { pass: false, innerWidth: null, innerHeight: null },
    scrollWidth: { pass: false, scrollWidth: null, innerWidth: null },
    pageErrors: { pass: true, errors: [] },
    consoleErrors: { pass: true, errors: [], ignored: [] },
    network: { pass: true, app: [], fonts: [], mediaProvider: [], otherExternal: [] },
    embeds: { pass: false, iframes: 0, videos: 0, limit: cell.maxEmbeds },
    themeCheck: { pass: false, storage: null, datasetTheme: null, datasetLens: null },
    mediaEmulation: { pass: false, colorScheme: null, reducedMotion: null },
    geometry: { pass: cell.geometry.length === 0, assertions: [] },
    hitTest: { pass: cell.hitTest.length === 0, selectors: [] },
    screenshot: null,
  }
}

async function evaluate<T>(cdp: CdpConnection, sessionId: string, expression: string): Promise<T> {
  const evaluated = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  }, sessionId) as {
    result?: { value?: T }
    exceptionDetails?: { text?: string; exception?: { description?: string } }
  }
  if (evaluated.exceptionDetails) {
    throw new Error(evaluated.exceptionDetails.exception?.description || evaluated.exceptionDetails.text || 'evaluate failed')
  }
  return evaluated.result?.value as T
}

function exceptionText(params: unknown): string {
  const details = (params as { exceptionDetails?: { text?: string; exception?: { description?: string } } }).exceptionDetails
  return details?.exception?.description || details?.text || 'page exception'
}

function argText(arg: { value?: unknown; description?: string; unserializableValue?: string }): string {
  if (typeof arg.value === 'string') return arg.value
  if (arg.value !== undefined) return JSON.stringify(arg.value)
  return arg.description || arg.unserializableValue || ''
}

function isIgnoredConsole(text: string, url: string | undefined, baseUrl: string): boolean {
  if (url && classifyRequestUrl(url, baseUrl) === 'font') return true
  if (text.includes('fonts.googleapis.com') || text.includes('fonts.gstatic.com')) return true
  // We fail media-provider requests in the browser. The classification is the
  // failure; the blocked-load console line is the same event.
  if (text.includes('ERR_BLOCKED_BY_CLIENT') && url && classifyRequestUrl(url, baseUrl) === 'media-provider') return true
  return false
}

function unique(values: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const value of values) {
    if (seen.has(value)) continue
    seen.add(value)
    out.push(value)
  }
  return out
}

function clip(text: string): string {
  const line = text.replace(/\s+/g, ' ').trim()
  return line.length > 400 ? `${line.slice(0, 400)}…` : line
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
