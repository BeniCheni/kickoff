import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const directory = process.argv[2] ?? fileURLToPath(new URL('../.next/static/', import.meta.url))
function filesUnder(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name)
    return entry.isDirectory() ? filesUnder(file) : /\.js$/.test(file) ? [file] : []
  })
}
const files = filesUnder(directory)
assert.ok(files.length, 'No built client JavaScript; run the web build first')
const markers = [
  'studio/', 'drizzle', 'postgres' + '://', 'postgresql' + '://', 'DATABASE_URL',
  'FAL_KEY', 'STUDIO_ENV_FILE', 'STUDIO_LIVE', 'STUDIO_DATA_DIR', 'STUDIO_MEDIA_DIR',
  'STUDIO_NOW', 'STUDIO_STUB', 'STUDIO_STORAGE_FAIL',
]
const leaks = files.flatMap(file => {
  const source = readFileSync(file, 'utf8')
  return markers.filter(marker => source.includes(marker)).map(marker => ({ file, marker }))
})
assert.deepEqual(leaks, [], 'Studio/database marker in built client JavaScript')
console.log(`Client leak scan passed: ${files.length} JavaScript files, ${markers.length} markers`)
