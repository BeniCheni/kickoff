import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const baseline = process.argv[2]
assert.ok(baseline, 'Pass the preserved merge-base build directory')
function manifest(base, directory) {
  const out = []
  for (const entry of fs.readdirSync(path.join(base, directory), { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) out.push(...manifest(base, file))
    else {
      assert.ok(entry.isFile(), `Unexpected non-file: ${file}`)
      const bytes = fs.readFileSync(path.join(base, file))
      out.push({ file, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') })
    }
  }
  return out.sort((a, b) => a.file.localeCompare(b.file, 'en'))
}
const expected = ['dist', 'dist-single'].flatMap(dir => manifest(baseline, dir))
const actual = ['dist', 'dist-single'].flatMap(dir => manifest(root, dir))
assert.deepEqual(actual, expected, 'Reader build differs from the preserved merge-base build')
console.log(JSON.stringify({ identical: true, files: actual.length, manifest: actual }, null, 2))
