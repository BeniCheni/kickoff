import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../..', import.meta.url))
const [base, original, output] = process.argv.slice(2)
assert.ok(base && original && output, 'Usage: node web/scripts/n4b-artifacts.mjs <base checkout> <original PR checkout> <receipt.json>')
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)])
}
function client(dir) {
  const built = files(path.join(dir, 'web/.next/static')).filter(file => file.endsWith('.js')).map(file => {
    const bytes = readFileSync(file), source = bytes.toString('utf8')
    return { path: path.relative(dir, file), raw: bytes.length, gzip: gzipSync(bytes, { level: 9 }).length, sha256: sha(bytes), zod: (source.match(/_zod/g) ?? []).length }
  })
  return { files: built.length, raw: built.reduce((sum, file) => sum + file.raw, 0), gzip: built.reduce((sum, file) => sum + file.gzip, 0), zod: built.reduce((sum, file) => sum + file.zod, 0), built }
}
const vite = ['dist', 'dist-single', 'dist-offline'].flatMap(mode => files(path.join(base, mode))).map(file => {
  const relative = path.relative(base, file), current = path.join(root, relative)
  const baseline = readFileSync(file), bytes = readFileSync(current)
  return { path: relative, bytes: statSync(current).size, sha256: sha(bytes), baseSha256: sha(baseline), equal: bytes.equals(baseline) }
})
const receipt = { base: client(base), original: client(original), current: client(root), vite }
assert.equal(vite.length, 17)
assert.ok(vite.every(file => file.equal), 'Vite artifacts changed')
assert.equal(receipt.current.zod, receipt.base.zod, 'Catalog schema reached client')
assert.ok(receipt.current.gzip - receipt.base.gzip < 10000, 'Client gzip delta exceeded 10 KB')
writeFileSync(output, JSON.stringify(receipt, null, 2))
console.log(JSON.stringify({ viteFiles: vite.length, mismatches: vite.filter(file => !file.equal).length, client: Object.fromEntries(['base', 'original', 'current'].map(key => [key, { files: receipt[key].files, raw: receipt[key].raw, gzip: receipt[key].gzip, zod: receipt[key].zod }])) }, null, 2))
