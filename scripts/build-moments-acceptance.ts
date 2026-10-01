// Only this explicit entry owns replacement input. vite.config.ts has no acceptance branch
// or environment switch: production/single builds cannot install this plugin.
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import { parseMoments } from '../src/lib/moments'
import { fixtureSchema } from '../src/lib/schema'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
if (args.length > 1) throw new Error('Usage: npm run build:acceptance -- [replacement-edition.json]')
const input = resolve(root, args[0] ?? 'docs/verification/moments-acceptance/edition.json')
const snapshot = fixtureSchema.array().parse(JSON.parse(execFileSync('git', ['show', 'HEAD:src/data/fixtures.json'], { cwd: root, encoding: 'utf8' })))
const edition = parseMoments(JSON.parse(readFileSync(input, 'utf8')), snapshot)
console.log(`Acceptance edition validated against HEAD snapshot: ${edition.length} items from ${input}`)
const productionInput = resolve(root, 'src/curated/moments.json')
const virtual = '\0moments-acceptance-edition'
await build({
  root,
  mode: 'acceptance',
  build: { outDir: 'dist-acceptance', emptyOutDir: true },
  plugins: [{
    name: 'moments-acceptance-only', enforce: 'pre',
    resolveId(source, importer) {
      if (importer && resolve(dirname(importer), source) === productionInput) return virtual
    },
    load(id) { if (id === virtual) return `export default ${JSON.stringify(edition)}` },
    transformIndexHtml() {
      return [{ tag: 'script', attrs: { type: 'module' }, children:
        'document.title = "[Moments acceptance] " + document.title; document.documentElement.dataset.momentsAcceptance = "true";', injectTo: 'head' }]
    },
  }],
})
