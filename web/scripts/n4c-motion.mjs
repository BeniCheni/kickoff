// Throttled Moments motion receipt. Screenshots and traces stay outside the repo.
// The page must already be serving the stub catalog with the demo flag on.
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const origin = process.env.KICKOFF_NEXT_ORIGIN ?? 'http://127.0.0.1:5194'
const outDir = path.resolve(process.argv[2] ?? '/tmp/kickoff-n4c-motion')
const receiptPath = path.resolve(process.argv[3] ?? fileURLToPath(new URL('../verification/n4c-motion.json', import.meta.url)))
mkdirSync(outDir, { recursive: true })

const runs = []

function median(values) {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

async function trace(page, ms, trigger) {
  await page.tracing.start({
    categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.frame'],
  })
  const started = Date.now()
  await trigger()
  await new Promise(resolve => setTimeout(resolve, ms))
  const buffer = await page.tracing.stop()
  const parsed = JSON.parse(Buffer.from(buffer).toString('utf8'))
  const events = Array.isArray(parsed) ? parsed : parsed.traceEvents ?? []
  const frames = events.filter(event => event.name === 'DrawFrame' && typeof event.ts === 'number').map(event => event.ts)
  const deltas = []
  for (let index = 1; index < frames.length; index += 1) deltas.push((frames[index] - frames[index - 1]) / 1000)
  const mid = median(deltas)
  const long = events.filter(event => event.name === 'RunTask' && event.dur > 50_000 && event.ts >= frames[0]).map(event => Math.round(event.dur / 1000))
  return {
    ms,
    wallMs: Date.now() - started,
    frames: frames.length,
    medianFrameMs: mid === null ? null : Math.round(mid * 100) / 100,
    medianFps: mid ? Math.round((1000 / mid) * 10) / 10 : null,
    longTasksMs: long,
  }
}

async function prepare(page, width) {
  await page.setViewport({ width, height: 900, deviceScaleFactor: 1 })
  const client = await page.createCDPSession()
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 })
}

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ['--no-sandbox'],
})

try {
  for (const width of [390, 1000]) {
    const page = await browser.newPage()
    await prepare(page, width)
    await page.goto(`${origin}/?tab=moments`, { waitUntil: 'networkidle0' })
    runs.push({ name: 'card-entrance', width, ...await trace(page, 500, async () => page.reload({ waitUntil: 'networkidle0' })) })
    runs.push({ name: 'card-lift', width, ...await trace(page, 250, async () => page.hover('.moments-card')) })
    runs.push({ name: 'cross-fade', width, ...await trace(page, 400, async () => page.click('h2 a')) })
    await page.waitForSelector('.moments-reactions button')
    runs.push({ name: 'reaction-burst', width, ...await trace(page, 500, async () => page.click('.moments-reactions button')) })
    runs.push({ name: 'count-tick', width, ...await trace(page, 250, async () => page.click('.moments-reactions button')) })
    runs.push({ name: 'countdown-ring', width, ...await trace(page, 700, async () => {
      await page.waitForFunction(() => document.body.innerText.includes('Playing muted.') || document.body.innerText.includes('Sound on'))
      await page.evaluate(() => document.querySelector('video')?.dispatchEvent(new Event('ended')))
      await page.waitForSelector('.moments-ring')
    }) })
    runs.push({ name: 'comment-in', width, ...await trace(page, 350, async () => {
      await page.type('textarea', 'A kind note from this page.')
      await page.click('form button')
    }) })
    await page.close()
  }
  const transition = await browser.newPage()
  await transition.setViewport({ width: 390, height: 900, deviceScaleFactor: 1 })
  await transition.goto(`${origin}/?tab=moments`, { waitUntil: 'networkidle0' })
  await transition.evaluate(() => {
    window.__vt = []
    const timer = setInterval(() => {
      for (const animation of document.getAnimations()) {
        const pseudo = animation.effect?.pseudoElement ?? ''
        if (!String(pseudo).includes('view-transition')) continue
        window.__vt.push({ pseudo, duration: animation.effect.getComputedTiming().duration })
      }
    }, 16)
    setTimeout(() => clearInterval(timer), 500)
  })
  await transition.click('h2 a')
  await new Promise(resolve => setTimeout(resolve, 550))
  const samples = await transition.evaluate(() => window.__vt)
  const durations = [...new Set(samples.map(sample => sample.duration))]
  const over = samples.filter(sample => typeof sample.duration === 'number' && sample.duration > 180)
  runs.push({
    name: 'view-transition',
    width: 390,
    ms: 550,
    wallMs: 550,
    frames: samples.length,
    medianFrameMs: null,
    medianFps: null,
    longTasksMs: [],
    durations,
    pseudos: [...new Set(samples.map(sample => sample.pseudo))],
    over: over.length,
  })
  await transition.close()
} finally {
  await browser.close()
}

const failed = runs.filter(run => run.name === 'view-transition' ? run.over > 0 || run.durations.some(duration => duration > 180) : run.medianFps === null || run.medianFps < 55)
const receipt = {
  origin,
  throttle: '4x CPU',
  targetFps: 60,
  floorFps: 55,
  longTaskMs: 50,
  note: 'Median frame rate is the pass line (floor 55). Route loads and the countdown start can still post a main-thread task over 50 ms under 4× CPU; those durations are listed on the row and are not a dropped frame.',
  runs,
  failed: failed.map(run => run.name + '@' + run.width),
}
writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n')
writeFileSync(path.join(outDir, 'n4c-motion.json'), JSON.stringify(receipt, null, 2) + '\n')
console.log(JSON.stringify({ failed: receipt.failed, runs: runs.map(run => ({ name: run.name, width: run.width, fps: run.medianFps, frames: run.frames, long: run.longTasksMs.length })) }, null, 2))
if (failed.length) process.exitCode = 1
