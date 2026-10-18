import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const LEAK_MARKERS = [
  'studio/', 'drizzle', 'postgres' + '://', 'postgresql' + '://', 'DATABASE_URL',
  'FAL_KEY', 'STUDIO_ENV_FILE', 'STUDIO_LIVE', 'STUDIO_DATA_DIR', 'STUDIO_MEDIA_DIR',
  'STUDIO_NOW', 'STUDIO_STUB', 'STUDIO_STORAGE_FAIL',
]

/** Present in stub fixture JSON. A non-stub build must not contain it. */
export const STUB_SENTINEL = ['KICKOFF', 'STUB', 'CATALOG'].join('-')
export const CLIENT_MARKERS = [...LEAK_MARKERS, /STUDIO_[A-Z0-9_]+/, STUB_SENTINEL]
export const SERVER_MARKERS = ['studio/', 'FAL_KEY', /STUDIO_[A-Z0-9_]+/]

export function textLeakHits(source, markers = CLIENT_MARKERS) {
  return markers.filter(marker => typeof marker === 'string' ? source.includes(marker) : marker.test(source)).map(String)
}

const SERVER_EXT = /\.(?:html|js|rsc|json|map|meta|body|txt)$/

export function filesUnder(dir, accept) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) return filesUnder(file, accept)
    return accept(file) ? [file] : []
  })
}

export function leakHits(files, markers) {
  return files.flatMap(file => {
    const source = readFileSync(file, 'utf8')
    return textLeakHits(source, markers).map(marker => ({ file, marker }))
  })
}

export function scanBuild(staticDir, serverDir, { stubBuild = false } = {}) {
  const client = filesUnder(staticDir, file => file.endsWith('.js'))
  assert.ok(client.length, 'No built client JavaScript; run the web build first')
  const server = filesUnder(serverDir, file => SERVER_EXT.test(file))
  assert.ok(server.length, 'No built server output; run the web build first')
  const serverMarkers = stubBuild ? SERVER_MARKERS : [...SERVER_MARKERS, STUB_SENTINEL]
  const leaks = [...leakHits(client, CLIENT_MARKERS), ...leakHits(server, serverMarkers)]
  assert.deepEqual(leaks, [], 'Studio, database, or stub-catalog marker in the Next build')
  return { client: client.length, server: server.length, markers: CLIENT_MARKERS.length, serverMarkers: serverMarkers.length }
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
if (isCli) {
  const webRoot = fileURLToPath(new URL('..', import.meta.url))
  const result = scanBuild(
    process.argv[2] ?? path.join(webRoot, '.next/static'),
    process.argv[3] ?? path.join(webRoot, '.next/server'),
    { stubBuild: process.env.KICKOFF_CATALOG === 'stub' },
  )
  console.log(`Leak scan passed: ${result.client} client JavaScript files, ${result.server} server files, ${result.markers} markers`)
}
