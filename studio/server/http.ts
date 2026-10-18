import { createReadStream, existsSync, statSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { createServer, type Server } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { LOOPBACK_HOST, assertLoopbackBind, isLoopbackHost } from './bind.ts'
import { SESSION_COOKIE, cookieValue, guardRequest, oneTimeUrl, sessionCookie } from './guard.ts'
import { readBytes, readJson } from './body.ts'
import { estimateJobs, readCompose, submitJobs } from './compose.ts'
import { downloadJob, jobIdFrom, pollInFlight, readJobs, regenerateJob } from './jobs.ts'
import { serveFile as serveRecorded } from './media.ts'
import { findPhoto, photoPath, storePhoto } from './photos.ts'
import { publishJob, publishJobId, readPublish, recordPublishGate, retryDeleteJob, retryRemovalJob, unpublishJob } from './publish.ts'
import { assetIdFrom, discardJob, keepJob, readReview, recordedAssetFile, regenerateReview, reviewJobId } from './review.ts'
import { openAdmin, type OpenedAdmin } from './open.ts'
import { publicError } from './public-error.ts'
import { readShell } from './shell.ts'

const here = path.dirname(fileURLToPath(import.meta.url))
const uiDist = path.resolve(here, '../ui/dist')

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
}

export type AdminServer = {
  port: number
  token: string
  origin: string
  url: string
  transport: 'stub' | 'live'
  close: () => Promise<void>
}

export type StartAdminOptions = {
  env?: NodeJS.ProcessEnv
  live?: boolean
  host?: string
  port?: number
  token?: string
  /** Test seam. A thrown message on GET /api/boom, so error paths can be proved. */
  boom?: string
}

function sendJson(response: ServerResponse, status: number, body: unknown, extra: Record<string, string> = {}): void {
  const payload = JSON.stringify(body)
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    ...extra,
  })
  response.end(payload)
}

function refuse(response: ServerResponse): void {
  sendJson(response, 403, { error: 'refused' })
}

function fileInside(root: string, urlPath: string): string | null {
  let decoded = urlPath
  try {
    decoded = decodeURIComponent(urlPath)
  } catch {
    return null
  }
  if (decoded.includes('\0') || decoded.split('/').includes('..')) return null
  const relative = decoded.replace(/^\/+/, '')
  if (!relative || relative.endsWith('/')) return path.join(root, 'index.html')
  const full = path.resolve(root, relative)
  const fromRoot = path.relative(root, full)
  if (fromRoot.startsWith('..') || path.isAbsolute(fromRoot)) return null
  return full
}

function serveFile(response: ServerResponse, file: string): void {
  if (!existsSync(file) || !statSync(file).isFile()) {
    sendJson(response, 404, { error: 'not-found' })
    return
  }
  const type = TYPES[path.extname(file)] ?? 'application/octet-stream'
  response.writeHead(200, {
    'content-type': type,
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  })
  createReadStream(file).pipe(response)
}

async function handle(
  request: IncomingMessage,
  response: ServerResponse,
  opened: OpenedAdmin,
  options: { token: string; origin: string; port: number; boom?: string },
): Promise<void> {
  const url = new URL(request.url ?? '/', options.origin)
  const method = request.method ?? 'GET'
  const decision = guardRequest({
    method,
    host: request.headers.host,
    origin: request.headers.origin,
    cookieToken: cookieValue(request.headers.cookie, SESSION_COOKIE),
    ticket: url.searchParams.get('ticket') ?? undefined,
    token: options.token,
    expectedOrigin: options.origin,
    port: options.port,
    loopbackHost: isLoopbackHost(request.headers.host, options.port),
  })
  if (!decision.ok) {
    refuse(response)
    return
  }
  const cookieHeader: Record<string, string> = decision.setCookie
    ? { 'set-cookie': sessionCookie(options.token) }
    : {}
  if (decision.setCookie && method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    response.writeHead(302, { location: '/', 'cache-control': 'no-store', ...cookieHeader })
    response.end()
    return
  }
  if (url.pathname === '/api/shell' && method === 'GET') {
    sendJson(response, 200, await readShell(opened, options.port), cookieHeader)
    return
  }
  if (url.pathname === '/api/jobs' && method === 'GET') {
    sendJson(response, 200, await readJobs(opened.db, opened.studio, opened.clock()), cookieHeader)
    return
  }
  if (url.pathname === '/api/jobs/poll' && method === 'POST') {
    const body = await readJson(request)
    const ids = body && typeof body === 'object' && Array.isArray((body as { ids?: unknown }).ids)
      ? (body as { ids: unknown[] }).ids.filter((id): id is string => typeof id === 'string')
      : []
    sendJson(response, 200, await pollInFlight(opened, ids), cookieHeader)
    return
  }
  const downloadId = method === 'POST' ? jobIdFrom(url.pathname, 'download') : null
  if (downloadId) {
    sendJson(response, 200, await downloadJob(opened, downloadId), cookieHeader)
    return
  }
  if (url.pathname === '/api/compose' && method === 'GET') {
    sendJson(response, 200, await readCompose(opened), cookieHeader)
    return
  }
  if (url.pathname === '/api/estimate' && method === 'POST') {
    sendJson(response, 200, await estimateJobs(opened, await readJson(request)), cookieHeader)
    return
  }
  if (url.pathname === '/api/submit' && method === 'POST') {
    sendJson(response, 200, await submitJobs(opened, await readJson(request)), cookieHeader)
    return
  }
  if (url.pathname === '/api/photos' && method === 'POST') {
    const type = request.headers['content-type'] ?? ''
    if (!type.startsWith('image/jpeg')) {
      sendJson(response, 415, { outcome: 'not-a-jpeg' }, cookieHeader)
      return
    }
    const stored = storePhoto(opened.mediaDir, new Uint8Array(await readBytes(request)))
    sendJson(response, 'outcome' in stored ? 400 : 200, stored, cookieHeader)
    return
  }
  const photoMatch = method === 'GET' || method === 'HEAD' ? /^\/media\/photos\/([a-f0-9]{32})$/.exec(url.pathname) : null
  if (photoMatch?.[1]) {
    const photo = findPhoto(opened.mediaDir, photoMatch[1])
    const file = photo ? photoPath(opened.mediaDir, photo) : null
    if (!photo || !file) {
      sendJson(response, 404, { error: 'not-found' }, cookieHeader)
      return
    }
    if (cookieHeader['set-cookie']) response.setHeader('set-cookie', cookieHeader['set-cookie'])
    serveRecorded(request, response, file, 'image/jpeg')
    return
  }
  const regenerateId = method === 'POST' ? jobIdFrom(url.pathname, 'regenerate') : null
  if (regenerateId) {
    const body = await readJson(request)
    const confirm = body && typeof body === 'object' ? (body as { confirmEstimate?: unknown }).confirmEstimate : undefined
    if (typeof confirm !== 'string') {
      sendJson(response, 400, { error: 'refused' }, cookieHeader)
      return
    }
    sendJson(response, 200, await regenerateJob(opened, regenerateId, confirm), cookieHeader)
    return
  }
  if (url.pathname === '/api/shell' && method === 'POST') {
    sendJson(response, 405, { error: 'refused' }, cookieHeader)
    return
  }
  const reviewRead = method === 'GET' ? reviewJobId(url.pathname, '') : null
  if (reviewRead) {
    sendJson(response, 200, await readReview(opened, reviewRead), cookieHeader)
    return
  }
  const reviewKeep = method === 'POST' ? reviewJobId(url.pathname, 'keep') : null
  if (reviewKeep) {
    sendJson(response, 200, await keepJob(opened, reviewKeep, await readJson(request)), cookieHeader)
    return
  }
  const reviewDiscard = method === 'POST' ? reviewJobId(url.pathname, 'discard') : null
  if (reviewDiscard) {
    sendJson(response, 200, await discardJob(opened, reviewDiscard), cookieHeader)
    return
  }
  const reviewRegenerate = method === 'POST' ? reviewJobId(url.pathname, 'regenerate') : null
  if (reviewRegenerate) {
    sendJson(response, 200, await regenerateReview(opened, reviewRegenerate, await readJson(request)), cookieHeader)
    return
  }
  const assetMedia = method === 'GET' || method === 'HEAD' ? assetIdFrom(url.pathname) : null
  if (assetMedia) {
    const recorded = await recordedAssetFile(opened, assetMedia)
    if (!recorded) {
      sendJson(response, 404, { error: 'not-found' }, cookieHeader)
      return
    }
    if (cookieHeader['set-cookie']) response.setHeader('set-cookie', cookieHeader['set-cookie'])
    serveRecorded(request, response, recorded.file, recorded.mime)
    return
  }
  if (url.pathname === '/api/gate' && method === 'POST') {
    sendJson(response, 200, await recordPublishGate(opened, await readJson(request)), cookieHeader)
    return
  }
  const publishRead = method === 'GET' ? publishJobId(url.pathname, '') : null
  if (publishRead) {
    sendJson(response, 200, await readPublish(opened, publishRead, url.searchParams.get('publicId') ?? ''), cookieHeader)
    return
  }
  const publishGo = method === 'POST' ? publishJobId(url.pathname, 'go') : null
  if (publishGo) {
    sendJson(response, 200, await publishJob(opened, publishGo, await readJson(request)), cookieHeader)
    return
  }
  const publishUnpublish = method === 'POST' ? publishJobId(url.pathname, 'unpublish') : null
  if (publishUnpublish) {
    sendJson(response, 200, await unpublishJob(opened, publishUnpublish, await readJson(request)), cookieHeader)
    return
  }
  const publishRetryDelete = method === 'POST' ? publishJobId(url.pathname, 'retry-delete') : null
  if (publishRetryDelete) {
    sendJson(response, 200, await retryDeleteJob(opened, publishRetryDelete), cookieHeader)
    return
  }
  const publishRetryRemoval = method === 'POST' ? publishJobId(url.pathname, 'retry-removal') : null
  if (publishRetryRemoval) {
    sendJson(response, 200, await retryRemovalJob(opened, publishRetryRemoval), cookieHeader)
    return
  }
  if (url.pathname === '/api/boom' && method === 'GET' && options.boom !== undefined) {
    throw new Error(options.boom)
  }
  if (url.pathname.startsWith('/api/')) {
    sendJson(response, 404, { error: 'not-found' }, cookieHeader)
    return
  }
  if (method !== 'GET' && method !== 'HEAD') {
    sendJson(response, 405, { error: 'refused' }, cookieHeader)
    return
  }
  const file = fileInside(uiDist, url.pathname)
  if (!file) {
    refuse(response)
    return
  }
  if (Object.keys(cookieHeader).length > 0) {
    response.setHeader('set-cookie', cookieHeader['set-cookie'] ?? '')
  }
  if (method === 'HEAD') {
    response.writeHead(existsSync(file) ? 200 : 404, { 'cache-control': 'no-store' })
    response.end()
    return
  }
  serveFile(response, file)
}

export async function startAdmin(options: StartAdminOptions = {}): Promise<AdminServer> {
  const host = options.host ?? LOOPBACK_HOST
  assertLoopbackBind(host)
  const live = options.live ?? false
  const opened = await openAdmin(options.env ?? process.env, live)
  const token = options.token ?? randomBytes(32).toString('base64url')
  const server: Server = createServer((request, response) => {
    const address = server.address()
    const port = address && typeof address !== 'string' ? address.port : 0
    const origin = `http://${LOOPBACK_HOST}:${port}`
    handle(request, response, opened, { token, origin, port, boom: options.boom }).catch((error: unknown) => {
      if (response.headersSent) {
        response.end()
        return
      }
      sendJson(response, 500, { error: publicError(error) })
    })
  })

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen({ host, port: options.port ?? 5176 }, () => resolve())
  })
  const address = server.address()
  if (!address || typeof address === 'string' || address.address !== LOOPBACK_HOST) {
    server.close()
    await opened.close()
    throw new Error('The Studio admin binds to 127.0.0.1 only')
  }
  const origin = `http://${LOOPBACK_HOST}:${address.port}`
  return {
    port: address.port,
    token,
    origin,
    url: oneTimeUrl(origin, token),
    transport: opened.transport,
    async close() {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()))
      })
      await opened.close()
    },
  }
}
