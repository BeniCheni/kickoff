// Local proof: Postgres on the wire over PGlite, a clip published through the
// Studio engine, and the sample audience generated in the database.
//
// Run from the repo root. Plain `node` fails on type stripping:
// node node_modules/tsx/dist/cli.mjs scripts/n6a-proof.mjs ~/kickoff-n6a-proof web/verification/n6a-proof.json
//
// PNGs go to ~/kickoff-n6a-proof, outside the repo. The receipt lists their SHA-256s.
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { PGlite } from '../studio/node_modules/@electric-sql/pglite/dist/index.js'
import { CHECKLIST_LINES } from '../studio/db/schema.ts'
import { createStudio } from '../studio/engine.ts'
import { createFalStub } from '../studio/fal/stub.ts'
import { createStorageStub } from '../studio/storage/stub.ts'
import { catalogFromRows } from '../web/lib/catalog/hosted.ts'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const webRoot = path.join(repoRoot, 'web')
const requireWeb = createRequire(path.join(webRoot, 'package.json'))
const loadWeb = async specifier => import(pathToFileURL(requireWeb.resolve(specifier)).href)
const { createServer: createWire } = await loadWeb('pglite-server')
const postgres = (await loadWeb('postgres')).default
const { drizzle } = await loadWeb('drizzle-orm/pglite')
const { migrate } = await loadWeb('drizzle-orm/pglite/migrator')
const { sql } = await loadWeb('drizzle-orm')
const { drizzle: drizzlePostgres } = await loadWeb('drizzle-orm/postgres-js')
const puppeteer = (await loadWeb('puppeteer-core')).default
const outDir = path.resolve(process.argv[2] ?? path.join(homedir(), 'kickoff-n6a-proof'))
const receiptPath = path.resolve(process.argv[3] ?? path.join(webRoot, 'verification/n6a-proof.json'))
const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const hash = bytes => createHash('sha256').update(bytes).digest('hex')

function fail(message) {
  console.error(message)
  process.exitCode = 1
  throw new Error(message)
}

const database = new PGlite()
await database.waitReady
const orm = drizzle(database)
await migrate(orm, { migrationsFolder: path.join(repoRoot, 'studio/db/migrations') })
const mediaDir = mkdtempSync(path.join(tmpdir(), 'kickoff-n6a-'))
const storage = createStorageStub()
const studio = createStudio({
  db: orm,
  fal: createFalStub('queued-then-completed'),
  storage: storage.port,
  mediaDir,
  repoRoot,
  clock: () => new Date('2026-10-18T16:00:00.000Z'),
})
const video = new Uint8Array(readFileSync(path.join(webRoot, 'fixtures/catalog/media/clip.mp4')))
const keyframe = new Uint8Array(readFileSync(path.join(webRoot, 'fixtures/catalog/media/thumb-16x9.jpg')))
const imported = await studio.importClip({
  video,
  keyframe,
  source: 'grok-imagine',
  prompt: 'A fictional cat keeps a ball close.',
  subjects: ['Fenway'],
  title: 'Synthetic cat',
  madeOn: '2026-10-18',
})
if (imported.outcome !== 'imported') fail(`import ${JSON.stringify(imported)}`)
const kept = await studio.keep(imported.jobId, CHECKLIST_LINES.map(line => ({ line, answer: 'clear', by: 'the proof' })))
if (kept.outcome !== 'kept') fail(`keep ${JSON.stringify(kept)}`)
const gate = await studio.recordGate({
  answer: 'recorded for the local proof',
  disclosure: 'a synthetic clip',
  recordedBy: 'the proof',
  source: 'n6a',
})
if (gate.outcome !== 'gate-recorded') fail(`gate ${JSON.stringify(gate)}`)
const published = await studio.publish({ jobId: imported.jobId, publicId: 'n6a-cat', title: 'Synthetic cat', position: 1 })
if (published.outcome !== 'published') fail(`publish ${JSON.stringify(published)}`)

await database.exec(readFileSync(path.join(repoRoot, 'studio/db/seed-demo.sql'), 'utf8'))
const placed = await database.query(`
  SELECT v.video_bucket, v.video_object_path, v.thumbnail_bucket, v.thumbnail_object_path,
    vid.local_path AS video_local, thumb.local_path AS thumb_local
  FROM catalog.video v
  JOIN studio.asset vid ON vid.sha256 = v.sha256 AND vid.role = 'video'
  JOIN studio.asset thumb ON thumb.object_path = v.thumbnail_object_path
`)
const row = placed.rows[0]
if (!row?.video_object_path || !row.thumbnail_object_path) fail(`catalog row ${JSON.stringify(placed.rows)}`)
const files = new Map([
  [`/${row.video_bucket}/${row.video_object_path}`, { bytes: readFileSync(row.video_local), type: 'video/mp4' }],
  [`/${row.thumbnail_bucket}/${row.thumbnail_object_path}`, { bytes: readFileSync(row.thumb_local), type: 'image/jpeg' }],
])
await database.exec('SET ROLE studio_reader')

const wire = createWire(database)
await new Promise(resolve => wire.listen(0, '127.0.0.1', resolve))
const wirePort = wire.address().port
const media = createServer((request, response) => {
  const found = files.get(new URL(request.url ?? '/', 'http://127.0.0.1').pathname)
  if (!found) {
    response.writeHead(404)
    response.end()
    return
  }
  response.writeHead(200, { 'content-type': found.type, 'content-length': String(found.bytes.length), 'accept-ranges': 'bytes' })
  response.end(found.bytes)
})
await new Promise(resolve => media.listen(0, '127.0.0.1', resolve))
const mediaPort = media.address().port
const databasePassword = 'n6a-proof-pw'
const databaseUser = 'studio_reader'
const databaseUrl = ['postgres', '://', `${databaseUser}:${databasePassword}@127.0.0.1:${wirePort}/postgres`].join('')
const storageOrigin = `http://127.0.0.1:${mediaPort}`
const probe = postgres(databaseUrl, { prepare: false, max: 1, ssl: false, connect_timeout: 5 })
const probed = drizzlePostgres(probe)
const list = await probed.execute(sql`SELECT * FROM catalog.videos ORDER BY position ASC, id ASC`)
const detail = await probed.execute(sql`SELECT * FROM catalog.video ORDER BY position ASC, id ASC`)
try {
  const parsed = catalogFromRows([...list], [...detail])
  console.log('parsed', parsed.list.length, parsed.list[0]?.id)
} catch (error) {
  console.log('list', JSON.stringify(list[0], null, 2))
  console.log('detail types', detail[0] && Object.fromEntries(Object.entries(detail[0]).map(([key, value]) => [key, value === null ? 'null' : typeof value === 'object' ? value.constructor?.name : typeof value])))
  fail(error instanceof Error ? error.message : 'parse')
}
await probe.end({ timeout: 1 })

function startNext(port, env) {
  const childEnv = { ...process.env, NEXT_TELEMETRY_DISABLED: '1', KICKOFF_CATALOG: '', KICKOFF_DEMO_FILE: '', ...env }
  delete childEnv.VERCEL_ENV
  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: webRoot,
    env: childEnv,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let stdout = ''
  let stderr = ''
  child.stdout.on('data', chunk => { stdout += chunk })
  child.stderr.on('data', chunk => { stderr += chunk })
  return { child, logs: () => stdout + stderr, stdout: () => stdout, stderr: () => stderr }
}

const leakParts = [databaseUrl, `${databaseUser}:${databasePassword}`, databaseUser, databasePassword, `127.0.0.1:${wirePort}`, ['postgres', '://'].join(''), ['postgresql', '://'].join('')]
function leakHits(text) {
  return leakParts.filter(part => part && text.includes(part)).length
}

async function ready(url, started) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (started.child.exitCode !== null) fail(started.logs())
    try {
      if ((await fetch(url)).ok) return
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  fail(`next start did not answer ${url}\n${started.logs()}`)
}

const app = startNext(5196, { KICKOFF_DATABASE_URL: databaseUrl, KICKOFF_STORAGE_ORIGIN: storageOrigin, KICKOFF_DEMO: 'on' })
await ready('http://127.0.0.1:5196', app)
const gallery = await (await fetch('http://127.0.0.1:5196/?tab=moments')).text()
if (!gallery.includes('Synthetic cat') || !gallery.includes('Sample reactions')) fail(gallery.slice(0, 500))
if (gallery.includes('Stub catalog')) fail('stub indicator on a real catalog')
const fixtures = await (await fetch('http://127.0.0.1:5196/')).text()
if (!fixtures.includes('Kickoff') || fixtures.includes('Sample reactions')) fail('fixtures picked up the sample layer')

mkdirSync(outDir, { recursive: true })
const shots = []
const checks = []
function check(name, ok, detail) {
  checks.push({ name, ok: Boolean(ok), ...(detail === undefined ? {} : { detail }) })
  console.log(ok ? 'OK' : 'FAIL', name)
}

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--autoplay-policy=no-user-gesture-required'] })
try {
  for (const lens of ['ledger', 'poster', 'broadcast']) {
    for (const theme of ['light', 'dark']) {
      for (const width of [390, 1000]) {
        const page = await browser.newPage()
        await page.setViewport({ width, height: 900, deviceScaleFactor: 1 })
        await page.evaluateOnNewDocument(themeName => {
          localStorage.setItem('kickoff-theme', themeName)
          localStorage.setItem('kickoff-theme-broadcast', themeName)
        }, theme)
        const params = new URLSearchParams({ tab: 'moments', ...(lens === 'poster' ? {} : { lens }) })
        await page.goto(`http://127.0.0.1:5196/?${params}`, { waitUntil: 'networkidle0' })
        await page.waitForFunction(origin => {
          const images = [...document.querySelectorAll('.moments-card img')]
          return images.length > 0 && images.every(img => img.complete && img.naturalWidth > 0 && img.src.startsWith(origin))
        }, { timeout: 8000 }, storageOrigin)
        const galleryText = await page.evaluate(() => document.body.innerText)
        const thumbs = await page.evaluate(origin => [...document.querySelectorAll('.moments-card img')].map(img => ({
          complete: img.complete,
          width: img.naturalWidth,
          src: img.src,
          fromStore: img.src.startsWith(origin),
        })), storageOrigin)
        const galleryPng = await page.screenshot({ fullPage: true })
        const name = `gallery-${lens}-${theme}-${width}`
        writeFileSync(path.join(outDir, `${name}.png`), galleryPng)
        const box = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }))
        shots.push({ name, sha256: hash(galleryPng), scrollWidth: box.scroll, innerWidth: box.inner })
        check(`${name} overflow`, box.scroll === box.inner, box)
        check(`${name} catalog`, galleryText.includes('Synthetic cat') && galleryText.includes('Sample reactions') && !galleryText.includes('Stub catalog'))
        check(`${name} thumbnail`, thumbs.length > 0 && thumbs.every(img => img.complete && img.width > 0 && img.fromStore), thumbs.map(img => img.width))
        await page.click('h2 a')
        await page.waitForFunction(() => /Playing muted|Sound on|No playable file/.test(document.body.innerText), { timeout: 8000 })
        const watchText = await page.evaluate(() => ({
          text: document.body.innerText,
          src: document.querySelector('video')?.getAttribute('src') ?? '',
        }))
        // The stub clip is a third of a second, so the capture waits out the 220 ms cross-fade after the state is read.
        await new Promise(resolve => setTimeout(resolve, 450))
        const watchPng = await page.screenshot({ fullPage: true })
        const watchName = `watch-${lens}-${theme}-${width}`
        writeFileSync(path.join(outDir, `${watchName}.png`), watchPng)
        shots.push({ name: watchName, sha256: hash(watchPng) })
        check(`${watchName} autoplay`, watchText.text.includes('Playing muted') && watchText.src.startsWith(storageOrigin), watchText.src)
        await page.close()
      }
    }
  }
} finally {
  await browser.close()
}

const galleryHtml = gallery
const watchHtml = await (await fetch('http://127.0.0.1:5196/?tab=moments&watch=n6a-cat')).text()
app.child.kill('SIGTERM')
const quiet = startNext(5197, { KICKOFF_DATABASE_URL: databaseUrl, KICKOFF_STORAGE_ORIGIN: storageOrigin })
await ready('http://127.0.0.1:5197', quiet)
const without = await (await fetch('http://127.0.0.1:5197/?tab=moments')).text()
if (without.includes('Sample reactions') || without.includes('views ·')) fail('demo off still showed counts')
if (!without.includes('Synthetic cat')) fail('demo off lost the catalog')
quiet.child.kill('SIGTERM')

const sleepChild = spawn(process.execPath, ['web/test/sleep-server.mjs', 'sleep'], { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'] })
let sleepPort = ''
await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('sleep server did not listen')), 15000)
  sleepChild.stdout.on('data', chunk => {
    sleepPort += chunk.toString()
    if (!sleepPort.includes('\n')) return
    clearTimeout(timer)
    resolve()
  })
  sleepChild.on('error', reject)
})
const sleepUrl = ['postgres', '://', `${databaseUser}:${databasePassword}@127.0.0.1:${sleepPort.trim()}/postgres`].join('')
const slow = startNext(5199, {
  KICKOFF_DATABASE_URL: sleepUrl,
  KICKOFF_STORAGE_ORIGIN: 'https://media.example',
  KICKOFF_READ_TIMEOUT_MS: '400',
})
await ready('http://127.0.0.1:5199', slow)
const slowStarted = Date.now()
const timedOut = await (await fetch('http://127.0.0.1:5199/?tab=moments')).text()
const slowElapsed = Date.now() - slowStarted
slow.child.kill('SIGTERM')
sleepChild.kill('SIGKILL')
const recovered = startNext(5200, { KICKOFF_DATABASE_URL: databaseUrl, KICKOFF_STORAGE_ORIGIN: storageOrigin, KICKOFF_DEMO: 'on' })
await ready('http://127.0.0.1:5200', recovered)
const afterTimeout = await (await fetch('http://127.0.0.1:5200/?tab=moments')).text()
recovered.child.kill('SIGTERM')

wire.close()
const down = startNext(5198, { KICKOFF_DATABASE_URL: databaseUrl, KICKOFF_STORAGE_ORIGIN: storageOrigin, KICKOFF_DEMO: 'on' })
await ready('http://127.0.0.1:5198', down)
const unavailable = await (await fetch('http://127.0.0.1:5198/?tab=moments')).text()
if (!unavailable.includes('The gallery is unavailable.')) fail(unavailable.slice(0, 400))
down.child.kill('SIGTERM')

media.close()
await database.close()

const receipt = {
  proved: '2026-10-19',
  helper: 'pglite-server 0.1.5 (MIT, published 2026-02-07)',
  database: 'Studio PGlite 0.5.9 on the Postgres wire, SET ROLE studio_reader after publish and seed',
  storageOrigin,
  publicId: 'n6a-cat',
  shots,
  checks,
  demoOff: !without.includes('Sample reactions') && without.includes('Synthetic cat'),
  unavailable: unavailable.includes('The gallery is unavailable.'),
  timedOut: timedOut.includes('The gallery is unavailable.') && slowElapsed < 2000,
  recovered: afterTimeout.includes('Synthetic cat'),
  fixturesUntouched: fixtures.includes('Kickoff') && !fixtures.includes('Sample reactions'),
  leakHits: [
    galleryHtml, watchHtml, fixtures, without, unavailable, timedOut, afterTimeout,
    app.stdout(), app.stderr(), quiet.stdout(), quiet.stderr(), down.stdout(), down.stderr(), slow.stdout(), slow.stderr(), recovered.stdout(), recovered.stderr(),
  ].reduce((sum, text) => sum + leakHits(text), 0),
}
writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`)
const failed = checks.filter(item => !item.ok).map(item => item.name)
console.log(JSON.stringify({ shots: shots.length, failed, demoOff: receipt.demoOff, unavailable: receipt.unavailable, timedOut: receipt.timedOut, recovered: receipt.recovered, leakHits: receipt.leakHits, slowElapsed }, null, 2))
if (failed.length || !receipt.demoOff || !receipt.unavailable || !receipt.timedOut || !receipt.recovered || receipt.leakHits !== 0) process.exitCode = 1
