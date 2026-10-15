import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const globals = ['window', 'document', 'localStorage', 'navigator']
const modules = [
  'src/lib/urlCodecs.ts', 'src/lib/lens.ts', 'src/lib/theme.ts', 'src/lib/time.ts',
  'src/lib/clock.ts', 'src/lib/useNow.ts', 'src/lib/fixtures.ts', 'src/lib/standings.ts',
  'src/lib/competitions.ts', 'src/lib/schema.ts', 'src/themeBoot.ts',
]

// Each mode/module gets a fresh process and module cache. A plain Node import runs
// first; the second import supplies inert getters to observe reads beyond a first
// ReferenceError. No exported function or React hook is invoked by this harness.
if (process.argv[2] === '--child') {
  const [mode, module] = process.argv.slice(3)
  assert.ok(['plain', 'trace'].includes(mode) && modules.includes(module))
  const touches = []
  const stubs = {
    window: { location: { search: '' } },
    document: { documentElement: { dataset: {} } },
    localStorage: { getItem: () => null },
    navigator: {},
  }
  for (const name of globals) {
    // Node itself supplies navigator on some versions; remove it for a portable
    // server-only baseline, including any tempting accidental dependency on it.
    delete globalThis[name]
    if (mode === 'trace') Object.defineProperty(globalThis, name, {
      configurable: true,
      get() {
        const locations = new Error().stack.split('\n').flatMap(frame => {
          const match = frame.match(/(?:file:\/\/)?(\/[^ ()]+):(\d+):(\d+)/)
          return match && match[1] !== fileURLToPath(import.meta.url) ? [match] : []
        })
        assert.ok(locations.length, `Missing source frame for ${name}`)
        const describe = location => {
          const file = path.relative(root, location[1])
          const line = Number(location[2])
          return { file, line, source: readFileSync(path.join(root, file), 'utf8').split('\n')[line - 1].trim() }
        }
        const readerCaller = locations.find(location => location[1].startsWith(path.join(root, 'src/')))
        touches.push({ global: name, ...describe(locations[0]), ...(readerCaller ? { readerCaller: describe(readerCaller) } : {}) })
        return stubs[name]
      },
    })
  }
  let error = null
  try { await import(pathToFileURL(path.join(root, module)).href) }
  catch (caught) { error = { name: caught.name, message: caught.message } }
  console.log(JSON.stringify({ imported: error === null, error, touches }))
} else {
  const loader = import.meta.resolve('tsx') // Existing root dev dependency; no reader edits.
  const rows = modules.map(module => {
    const run = mode => {
      const result = spawnSync(process.execPath, ['--import', loader, fileURLToPath(import.meta.url), '--child', mode, module], {
        cwd: root, encoding: 'utf8', timeout: 15_000,
      })
      assert.equal(result.status, 0, `${mode} ${module}: ${result.stderr || result.error}`)
      return JSON.parse(result.stdout)
    }
    return { module, plain: run('plain'), trace: run('trace') }
  })
  console.log(JSON.stringify({ node: process.versions.node, globals, rows }, null, 2))
}
