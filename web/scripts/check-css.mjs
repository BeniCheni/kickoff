import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
function cssUnder(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name)
    return entry.isDirectory() ? cssUnder(file) : file.endsWith('.css') ? [file] : []
  })
}
function readCSS(dir) {
  const files = cssUnder(dir)
  assert.ok(files.length, `No built CSS in ${dir}; build first`)
  return files.map(file => readFileSync(file, 'utf8')).join('\n')
}
const reader = readCSS(path.join(root, 'dist/assets'))
const shellCss = path.join(root, 'web/generated/shell.css')
const web = readFileSync(shellCss, 'utf8')
assert.ok(web.includes('bada71'), 'web probe missing: scan check would be vacuous')
assert.ok(!reader.includes('bada71'), 'web probe reached reader CSS')
assert.ok(!reader.includes('fa11e0'), 'Studio probe reached reader CSS')
assert.ok(!web.includes('fa11e0'), 'Studio probe reached web CSS')
// Shell utilities are shared on purpose. Docs-only and Moments-gallery selectors stay out.
for (const marker of ['underline-offset-\\[3px\\]', 'mt-6', 'moments-gallery']) {
  assert.ok(!web.includes(`.${marker}`), `reader/docs selector reached web CSS: ${marker}`)
}
console.log('CSS isolation passed: web probe present; studio and docs markers absent; shell utilities shared')
