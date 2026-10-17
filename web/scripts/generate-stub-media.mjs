// Synthetic stub thumbnails and one small MP4. No design export, no course file, no fal.
// Re-running replaces web/fixtures/catalog/media/ and prints the measured sizes.
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const outDir = fileURLToPath(new URL('../fixtures/catalog/media/', import.meta.url))
mkdirSync(outDir, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ['--disable-gpu', '--autoplay-policy=no-user-gesture-required'],
})
try {
  const page = await browser.newPage()
  const produced = await page.evaluate(async () => {
    function jpeg(width, height) {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#1b3a4b'
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = '#d08c3a'
      ctx.fillRect(0, 0, Math.floor(width / 2), height)
      ctx.fillStyle = '#f4efe4'
      ctx.fillRect(Math.floor(width / 3), Math.floor(height / 4), Math.floor(width / 3), Math.floor(height / 2))
      const url = canvas.toDataURL('image/jpeg', 0.85)
      return url.slice(url.indexOf(',') + 1)
    }
    const streamCanvas = document.createElement('canvas')
    streamCanvas.width = 64
    streamCanvas.height = 36
    const ctx = streamCanvas.getContext('2d')
    const stream = streamCanvas.captureStream(10)
    const mime = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1', 'video/mp4']
      .find(type => MediaRecorder.isTypeSupported(type)) ?? null
    if (!mime) return { error: 'mp4 recorder unsupported', types: ['video/mp4'] }
    const recorder = new MediaRecorder(stream, { mimeType: mime })
    const chunks = []
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data) }
    const stopped = new Promise(resolve => { recorder.onstop = () => resolve() })
    recorder.start()
    const started = performance.now()
    await new Promise(resolve => {
      const draw = () => {
        const t = (performance.now() - started) / 400
        ctx.fillStyle = t < 0.5 ? '#1b3a4b' : '#d08c3a'
        ctx.fillRect(0, 0, 64, 36)
        if (t < 1) requestAnimationFrame(draw)
        else resolve()
      }
      draw()
    })
    recorder.stop()
    await stopped
    const blob = new Blob(chunks, { type: mime })
    const bytes = new Uint8Array(await blob.arrayBuffer())
    let binary = ''
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return {
      mime,
      video: btoa(binary),
      wide: jpeg(160, 100),
      flat: jpeg(160, 90),
    }
  })
  if (produced.error) {
    console.error(produced)
    process.exit(1)
  }
  const files = [
    ['thumb-16x10.jpg', produced.wide, 160, 100],
    ['thumb-16x9.jpg', produced.flat, 160, 90],
    ['clip.mp4', produced.video, 64, 36],
  ]
  const manifest = { sentinel: ['KICKOFF', 'STUB', 'CATALOG'].join('-'), recorder: produced.mime, files: [] }
  for (const [name, b64, width, height] of files) {
    const bytes = Buffer.from(b64, 'base64')
    const file = path.join(outDir, name)
    writeFileSync(file, bytes)
    manifest.files.push({
      name,
      bytes: bytes.length,
      width,
      height,
      sha256: createHash('sha256').update(bytes).digest('hex'),
    })
  }
  writeFileSync(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(JSON.stringify(manifest, null, 2))
} finally {
  await browser.close()
}
