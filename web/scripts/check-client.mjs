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
/** Present in the demo social schema and fixture. Client output and response text must not contain it unless a demo build is explicit. */
export const DEMO_SENTINEL = 'KICKOFF-DEMO-SOCIAL'
/** A database address value. Response text must not contain one, demo build or not. */
export const DATABASE_ADDRESS = /postgres(?:ql)?:\/\/\S+/i
export const CLIENT_MARKERS = [...LEAK_MARKERS, /STUDIO_[A-Z0-9_]+/, STUB_SENTINEL, DEMO_SENTINEL, DATABASE_ADDRESS]
export const SERVER_MARKERS = ['studio/', 'FAL_KEY', /STUDIO_[A-Z0-9_]+/]

/** RSC flight text: every `self.__next_f.push([1,"…"])` string, unescaped and joined. */
export function flightText(html) {
  const chunks = []
  const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g
  let match
  while ((match = re.exec(html))) chunks.push(JSON.parse(`"${match[1]}"`))
  return chunks.join('')
}

/**
 * JSON keys named `score` in decoded flight text.
 * A string value of `score`, including one that contains a quote, is not a key.
 * Chunks are joined first, so a key split across push calls is still visible.
 */
export function scoreKeyHits(text) {
  const hits = []
  let index = 0
  while (index < text.length) {
    if (text[index] !== '"') { index += 1; continue }
    let cursor = index + 1
    let escaped = false
    let closed = false
    while (cursor < text.length) {
      if (escaped) { escaped = false; cursor += 1; continue }
      if (text[cursor] === '\\') { escaped = true; cursor += 1; continue }
      if (text[cursor] === '"') { closed = true; break }
      cursor += 1
    }
    if (!closed) break
    let key = text.slice(index + 1, cursor)
    try { key = JSON.parse(`"${key}"`) } catch { /* keep the raw slice */ }
    let after = cursor + 1
    while (after < text.length && /\s/.test(text[after])) after += 1
    if (text[after] === ':' && key === 'score') hits.push('score')
    index = cursor + 1
  }
  return hits
}

/** A score property in the Moments flight. A title whose text is "score" is not one. */
export function flightScoreHits(html) {
  return [...new Set(scoreKeyHits(flightText(html)))]
}

/** A Moments payload may list neighbour ids. It may not carry a score field. */
export function payloadScoreHits(value) {
  const hits = []
  const walk = (node) => {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }
    for (const [key, child] of Object.entries(node)) {
      if (key === 'score') hits.push('score')
      walk(child)
    }
  }
  walk(value)
  return hits
}

export function textLeakHits(source, markers = CLIENT_MARKERS) {
  return markers.filter(marker => typeof marker === 'string' ? source.includes(marker) : marker.test(source)).map(String)
}

const SERVER_EXT = /\.(?:html|js|rsc|json|map|meta|body|txt)$/
const RESPONSE_EXT = /\.(?:html|rsc|json|body|txt)$/

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

export function scanBuild(staticDir, serverDir, { stubBuild = false, demoBuild = false } = {}) {
  const client = filesUnder(staticDir, file => file.endsWith('.js'))
  assert.ok(client.length, 'No built client JavaScript; run the web build first')
  const server = filesUnder(serverDir, file => SERVER_EXT.test(file))
  assert.ok(server.length, 'No built server output; run the web build first')
  const serverMarkers = stubBuild ? SERVER_MARKERS : [...SERVER_MARKERS, STUB_SENTINEL]
  const responseMarkers = demoBuild ? [DATABASE_ADDRESS] : [DEMO_SENTINEL, DATABASE_ADDRESS]
  const responses = server.filter(file => RESPONSE_EXT.test(file))
  const leaks = [
    ...leakHits(client, CLIENT_MARKERS),
    ...leakHits(server, serverMarkers),
    ...leakHits(responses, responseMarkers),
  ]
  assert.deepEqual(leaks, [], 'Studio, database, stub-catalog, or demo-social marker in the Next build')
  return { client: client.length, server: server.length, markers: CLIENT_MARKERS.length, serverMarkers: serverMarkers.length }
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
if (isCli) {
  const webRoot = fileURLToPath(new URL('..', import.meta.url))
  const result = scanBuild(
    process.argv[2] ?? path.join(webRoot, '.next/static'),
    process.argv[3] ?? path.join(webRoot, '.next/server'),
    { stubBuild: process.env.KICKOFF_CATALOG === 'stub', demoBuild: process.env.KICKOFF_DEMO === 'on' },
  )
  console.log(`Leak scan passed: ${result.client} client JavaScript files, ${result.server} server files, ${result.markers} markers`)
}
