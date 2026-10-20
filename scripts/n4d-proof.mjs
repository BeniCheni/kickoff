// Step 5. Migrations 0000–0005, clips published through the Studio engine
// with the fake embedder, then next start as studio_reader over the wire.
//
// From the repo root:
// node node_modules/tsx/dist/cli.mjs scripts/n4d-proof.mjs <png-dir> web/verification/n4d-proof.json
//
// Launch next from web/. PNGs stay outside the repo. The receipt has no home path.
import { createHash } from 'node:crypto'
import { createServer as createHttp } from 'node:http'
import { spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { connect, createServer as createTcp } from 'node:net'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { CHECKLIST_LINES } from '../studio/db/schema.ts'
import { openPglite } from '../studio/db/pglite.ts'
import { createFakeEmbedder } from '../studio/embed/fake.ts'
import { createStudio } from '../studio/engine.ts'
import { createFalStub } from '../studio/fal/stub.ts'
import { createStorageStub } from '../studio/storage/stub.ts'
import { syntheticMp4 } from '../studio/media/mp4.ts'
import { flightScoreHits, flightText } from '../web/scripts/check-client.mjs'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const webRoot = path.join(repoRoot, 'web')
const requireWeb = createRequire(path.join(webRoot, 'package.json'))
const loadWeb = async specifier => import(pathToFileURL(requireWeb.resolve(specifier)).href)
const { createServer: createWire } = await loadWeb('pglite-server')
const { drizzle } = await loadWeb('drizzle-orm/pglite')
const { migrate } = await loadWeb('drizzle-orm/pglite/migrator')
const puppeteer = (await loadWeb('puppeteer-core')).default
const outDir = path.resolve(process.argv[2] ?? path.join(homedir(), 'kickoff-n4d-proof'))
const receiptPath = path.resolve(process.argv[3] ?? path.join(webRoot, 'verification/n4d-proof.json'))
const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
mkdirSync(outDir, { recursive: true })
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const checks = []
function check(name, ok, detail) {
  checks.push({ name, ok: Boolean(ok), ...(detail === undefined ? {} : { detail }) })
  console.log(ok ? 'OK' : 'FAIL', name, ok ? '' : JSON.stringify(detail))
}
function fail(message) {
  check(message, false)
  throw new Error(message)
}

const database = await openPglite()
const orm = drizzle(database)
await migrate(orm, { migrationsFolder: path.join(repoRoot, 'studio/db/migrations') })
const applied = await database.query(`SELECT id FROM drizzle.__drizzle_migrations ORDER BY id`)
check('migrations 0000 through 0005 are applied', applied.rows.length >= 6, applied.rows.length)

const mediaDir = mkdtempSync(path.join(tmpdir(), 'kickoff-n4d-'))
const studio = createStudio({
  db: orm,
  fal: createFalStub('queued-then-completed'),
  storage: createStorageStub().port,
  mediaDir,
  repoRoot,
  clock: () => new Date('2026-10-18T16:00:00.000Z'),
  embedder: createFakeEmbedder(),
})
const stills = [
  new Uint8Array(readFileSync(path.join(webRoot, 'fixtures/catalog/media/thumb-16x9.jpg'))),
  new Uint8Array(readFileSync(path.join(webRoot, 'fixtures/catalog/media/thumb-16x10.jpg'))),
]
const third = new Uint8Array(stills[0])
third[third.length - 2] = (third[third.length - 2] + 1) % 256
stills.push(third)
const clips = [
  { id: 'n4d-a', title: 'Synthetic alder', note: 'A note about alder', position: 1, still: stills[0], video: syntheticMp4({ durationS: 0.4, creationTime: 1 }) },
  { id: 'n4d-b', title: 'Synthetic birch', note: 'A note about birch', position: 2, still: stills[1], video: syntheticMp4({ durationS: 0.4, creationTime: 2 }) },
  { id: 'n4d-c', title: 'Synthetic cedar', note: 'A note about cedar', position: 3, still: stills[2], video: syntheticMp4({ durationS: 0.4, creationTime: 3 }) },
]
const jobs = []
for (const clip of clips) {
  const imported = await studio.importClip({
    video: clip.video, keyframe: clip.still, source: 'grok-imagine', prompt: clip.note,
    subjects: ['Fenway'], title: clip.title, note: clip.note, madeOn: '2026-10-18',
  })
  if (imported.outcome !== 'imported') fail(`import ${clip.id} ${JSON.stringify(imported)}`)
  const kept = await studio.keep(imported.jobId, CHECKLIST_LINES.map(line => ({ line, answer: 'clear', by: 'the proof' })))
  if (kept.outcome !== 'kept') fail(`keep ${clip.id}`)
  jobs.push({ ...clip, jobId: imported.jobId })
}
const gate = await studio.recordGate({ answer: 'recorded for the local proof', disclosure: 'a synthetic clip', recordedBy: 'the proof', source: 'n4d' })
if (gate.outcome !== 'gate-recorded') fail(`gate ${JSON.stringify(gate)}`)
for (const clip of jobs) {
  const published = await studio.publish({ jobId: clip.jobId, publicId: clip.id, title: clip.title, position: clip.position, editorialNote: clip.note })
  if (published.outcome !== 'published' || published.embedding !== 'written') fail(`publish ${clip.id} ${JSON.stringify(published)}`)
}
const orders = {}
for (const clip of clips) {
  const rows = await database.query(`SELECT id FROM catalog.similar_moments('${clip.id}', 6)`)
  orders[clip.id] = rows.rows.map(row => row.id)
}
check('the function returns neighbours and never the clip itself', clips.every(clip => orders[clip.id].length === 2 && !orders[clip.id].includes(clip.id)), orders)

await database.exec('SET ROLE studio_reader')
const wire = createWire(database)
await new Promise(resolve => wire.listen(0, '127.0.0.1', resolve))
const wirePort = wire.address().port
const stats = { statements: [] }
const proxy = createTcp((client) => {
  const upstream = connect(wirePort, '127.0.0.1')
  let started = false
  let frontend = Buffer.alloc(0)
  client.on('data', chunk => {
    upstream.write(chunk)
    frontend = Buffer.concat([frontend, chunk])
    while (frontend.length >= 5) {
      if (!started) {
        const len = frontend.readInt32BE(0)
        if (frontend.length < len) break
        const code = frontend.readInt32BE(4)
        frontend = frontend.subarray(len)
        if (code !== 80877103) started = true
        continue
      }
      const type = String.fromCharCode(frontend[0])
      const len = frontend.readInt32BE(1)
      if (frontend.length < len + 1) break
      const body = frontend.subarray(5, 1 + len)
      if (type === 'Q') stats.statements.push(body.toString('utf8').replace(/\0+$/, ''))
      if (type === 'P') {
        const nameEnd = body.indexOf(0)
        const queryEnd = body.indexOf(0, nameEnd + 1)
        if (nameEnd >= 0 && queryEnd > nameEnd) stats.statements.push(body.subarray(nameEnd + 1, queryEnd).toString('utf8'))
      }
      frontend = frontend.subarray(len + 1)
    }
  })
  upstream.on('data', chunk => { client.write(chunk) })
  client.on('error', () => {})
  upstream.on('error', () => {})
  client.on('close', () => upstream.end())
  upstream.on('close', () => client.end())
})
await new Promise(resolve => proxy.listen(0, '127.0.0.1', resolve))
const proxyPort = proxy.address().port
const files = new Map()
for (const clip of clips) {
  const placed = await database.query(`SELECT video_bucket, video_object_path, thumbnail_bucket, thumbnail_object_path FROM catalog.video WHERE id = '${clip.id}'`)
  const row = placed.rows[0]
  if (!row) fail(`missing catalog row ${clip.id}`)
  files.set(`/${row.video_bucket}/${row.video_object_path}`, { bytes: clip.video, type: 'video/mp4' })
  files.set(`/${row.thumbnail_bucket}/${row.thumbnail_object_path}`, { bytes: clip.still, type: 'image/jpeg' })
}
const media = createHttp((request, response) => {
  const found = files.get(new URL(request.url ?? '/', 'http://127.0.0.1').pathname)
  if (!found) { response.writeHead(404); response.end(); return }
  response.writeHead(200, { 'content-type': found.type, 'content-length': String(found.bytes.length), 'accept-ranges': 'bytes' })
  response.end(found.bytes)
})
await new Promise(resolve => media.listen(0, '127.0.0.1', resolve))
const mediaPort = media.address().port

const socket = createTcp()
await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve))
const port = socket.address().port
await new Promise(resolve => socket.close(resolve))
const origin = `http://127.0.0.1:${port}`
const databaseUrl = ['postgres', '://', `studio_reader:x@127.0.0.1:${proxyPort}/postgres`].join('')
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
  cwd: webRoot,
  env: {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: '1',
    KICKOFF_CATALOG: '',
    KICKOFF_DATABASE_URL: databaseUrl,
    KICKOFF_STORAGE_ORIGIN: `http://127.0.0.1:${mediaPort}`,
    VERCEL_ENV: '',
    KICKOFF_DEMO: '',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
})
let logs = ''
child.stdout.on('data', chunk => { logs += chunk })
child.stderr.on('data', chunk => { logs += chunk })
for (let n = 0; n < 150; n += 1) {
  if (child.exitCode !== null) fail(logs)
  try { if ((await fetch(`${origin}/?tab=fixtures`)).ok) break } catch { /* starting */ }
  if (n === 149) fail(logs)
  await new Promise(resolve => setTimeout(resolve, 100))
}

const similarCount = () => stats.statements.filter(query => query.includes('similar_moments')).length
const mark = () => stats.statements.length
const galleryBefore = similarCount()
const galleryHtml = await (await fetch(`${origin}/?tab=moments`)).text()
check('the gallery makes no similarity call', similarCount() === galleryBefore && !galleryHtml.includes('Similar moments'), { calls: similarCount() - galleryBefore })
const watchBefore = { statements: mark(), similar: similarCount() }
const watchHtml = await (await fetch(`${origin}/?tab=moments&watch=n4d-a`)).text()
const watchIds = [...watchHtml.matchAll(/aria-labelledby="similar-([^"]+)"/g)].map(match => match[1])
const decoded = flightText(watchHtml)
check('a watch request makes one similarity statement', similarCount() - watchBefore.similar === 1, { statements: mark() - watchBefore.statements, similar: similarCount() - watchBefore.similar })
check('the list is the function order and carries no score', JSON.stringify(watchIds) === JSON.stringify(orders['n4d-a']) && flightScoreHits(watchHtml).length === 0 && decoded.includes('"similar"'), { watchIds, expected: orders['n4d-a'] })

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--disable-gpu', '--autoplay-policy=no-user-gesture-required'] })
const shots = []
try {
  const page = await browser.newPage()
  const rsc = []
  page.on('request', request => { if (request.url().includes('_rsc=')) rsc.push(request.url()) })
  await page.evaluateOnNewDocument(() => {
    const memory = new Map([['kickoff-moments-autoplay-v1', 'off']])
    Object.defineProperty(window, 'localStorage', { configurable: true, value: {
      getItem: key => memory.get(key) ?? null,
      setItem: (key, value) => memory.set(key, String(value)),
      removeItem: key => memory.delete(key),
      clear: () => memory.clear(),
      key: () => null,
      length: 0,
    } })
  })
  await page.setViewport({ width: 390, height: 900, deviceScaleFactor: 1 })
  await page.goto(`${origin}/?tab=moments&watch=n4d-a`, { waitUntil: 'networkidle0' })
  const readAside = () => ({
    watch: new URLSearchParams(location.search).get('watch'),
    similar: [...document.querySelectorAll('aside a[aria-labelledby^="similar-"]')].map(anchor => anchor.getAttribute('aria-labelledby').slice(8)),
  })
  let state = await page.evaluate(readAside)
  check('the watch page list matches the function', JSON.stringify(state.similar) === JSON.stringify(orders['n4d-a']), state)
  let r0 = rsc.length
  let s0 = similarCount()
  await page.click('aside a[aria-labelledby="up-n4d-b"]')
  await page.waitForFunction(() => new URLSearchParams(location.search).get('watch') === 'n4d-b')
  await page.waitForFunction(expected => JSON.stringify([...document.querySelectorAll('aside a[aria-labelledby^="similar-"]')].map(anchor => anchor.getAttribute('aria-labelledby').slice(8))) === JSON.stringify(expected), {}, orders['n4d-b'])
  state = await page.evaluate(readAside)
  check('an Up next click makes one request and one similarity statement', rsc.length - r0 === 1 && similarCount() - s0 === 1 && JSON.stringify(state.similar) === JSON.stringify(orders['n4d-b']), { rsc: rsc.length - r0, similar: similarCount() - s0, state })
  const nextSimilar = state.similar[0]
  r0 = rsc.length
  s0 = similarCount()
  await page.evaluate(id => {
    const link = document.querySelector(`aside a[aria-labelledby="similar-${id}"]`)
    link.scrollIntoView({ block: 'center' })
    link.click()
  }, nextSimilar)
  const moved = await page.waitForFunction(id => new URLSearchParams(location.search).get('watch') === id, { timeout: 8000 }, nextSimilar).then(() => true).catch(() => false)
  if (moved) {
    await page.waitForFunction(expected => JSON.stringify([...document.querySelectorAll('aside a[aria-labelledby^="similar-"]')].map(anchor => anchor.getAttribute('aria-labelledby').slice(8))) === JSON.stringify(expected), { timeout: 8000 }, orders[nextSimilar]).catch(() => {})
  }
  state = await page.evaluate(readAside)
  check('a Similar click makes one request and one similarity statement', moved && rsc.length - r0 === 1 && similarCount() - s0 === 1 && state.watch === nextSimilar && JSON.stringify(state.similar) === JSON.stringify(orders[nextSimilar]), { moved, rsc: rsc.length - r0, similar: similarCount() - s0, nextSimilar, state, orders })
  const autoplay = await browser.newPage()
  const autoRsc = []
  autoplay.on('request', request => { if (request.url().includes('_rsc=')) autoRsc.push(request.url()) })
  await autoplay.setViewport({ width: 390, height: 900, deviceScaleFactor: 1 })
  await autoplay.goto(`${origin}/?tab=moments&watch=n4d-a`, { waitUntil: 'networkidle0' })
  r0 = autoRsc.length
  s0 = similarCount()
  const advanced = await autoplay.waitForFunction(() => new URLSearchParams(location.search).get('watch') === 'n4d-b', { timeout: 20000 }).then(() => true).catch(() => false)
  if (advanced) {
    await autoplay.waitForFunction(expected => JSON.stringify([...document.querySelectorAll('aside a[aria-labelledby^="similar-"]')].map(anchor => anchor.getAttribute('aria-labelledby').slice(8))) === JSON.stringify(expected), {}, orders['n4d-b']).catch(() => {})
  }
  state = await autoplay.evaluate(readAside)
  check('autoplay advances to the first Up next clip with one similarity statement', advanced && state.watch === 'n4d-b' && similarCount() - s0 === 1 && autoRsc.length - r0 >= 1, { advanced, rsc: autoRsc.length - r0, similar: similarCount() - s0, state })
  await page.setViewport({ width: 390, height: 900, deviceScaleFactor: 1 })
  const png390 = await page.screenshot({ type: 'png', fullPage: true })
  writeFileSync(path.join(outDir, 'watch-390.png'), png390)
  shots.push({ name: 'watch-390', sha256: hash(png390) })
  await page.setViewport({ width: 1000, height: 900, deviceScaleFactor: 1 })
  await page.goto(`${origin}/?tab=moments&watch=n4d-a`, { waitUntil: 'networkidle0' })
  const png1000 = await page.screenshot({ type: 'png', fullPage: true })
  writeFileSync(path.join(outDir, 'watch-1000.png'), png1000)
  shots.push({ name: 'watch-1000', sha256: hash(png1000) })
  await page.close()
} finally {
  child.kill('SIGTERM')
  await browser.close()
  proxy.close()
  await new Promise(resolve => wire.close(() => resolve()))
  media.close()
  await database.close()
}

const failed = checks.filter(item => !item.ok)
writeFileSync(receiptPath, JSON.stringify({ shots, orders, checks, failed: failed.map(item => item.name) }, null, 2))
console.log(JSON.stringify({ checks: checks.length, failed: failed.map(item => item.name), orders }, null, 2))
if (failed.length) process.exit(1)
