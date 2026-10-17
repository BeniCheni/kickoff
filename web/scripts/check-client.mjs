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
    return markers.filter(marker => source.includes(marker)).map(marker => ({ file, marker }))
  })
}

export function scanBuild(staticDir, serverDir, { stubBuild = false } = {}) {
  const client = filesUnder(staticDir, file => file.endsWith('.js'))
  assert.ok(client.length, 'No built client JavaScript; run the web build first')
  const server = filesUnder(serverDir, file => SERVER_EXT.test(file))
  assert.ok(server.length, 'No built server output; run the web build first')
  const markers = stubBuild ? LEAK_MARKERS : [...LEAK_MARKERS, STUB_SENTINEL]
  const leaks = leakHits([...client, ...server], markers)
  assert.deepEqual(leaks, [], 'Studio, database, or stub-catalog marker in the Next build')
  return { client: client.length, server: server.length, markers: markers.length }
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
if (isCli) {
  const webRoot = fileURLToPath(new URL('..', import.meta.url))
  const result = scanBuild(
    path.join(webRoot, '.next/static'),
    path.join(webRoot, '.next/server'),
    { stubBuild: process.env.KICKOFF_CATALOG === 'stub' },
  )
  console.log(`Leak scan passed: ${result.client} client JavaScript files, ${result.server} server files, ${result.markers} markers`)
}
