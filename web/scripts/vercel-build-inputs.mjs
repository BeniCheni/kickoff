import { readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SRC_ALLOWLIST, importSpecifiers } from '../src-allowlist.mjs'

const root = fileURLToPath(new URL('../..', import.meta.url))

// The one build-input list: web/package.json's build/install, globals.css's
// shared shell, next.config.ts's snapshot trace, and public/ favicon symlinks.
// The reader ceiling comes from the existing allowlist, including its relative
// transitive imports. A new unresolved import makes the ignore step build.
const INPUTS = [
  'web/', 'packages/', 'public/',
  'package.json', 'package-lock.json', '.npmrc', 'tsconfig.json',
  'src/data/', 'src/shell.css', 'src/themeBoot.ts',
  'scripts/write-theme-head.ts', 'scripts/themeBootstrap.ts',
  ...SRC_ALLOWLIST,
]

export function buildInputs() {
  const inputs = new Set(INPUTS)
  const queue = INPUTS.filter(file => /\.[cm]?[jt]sx?$/.test(file))
  for (const file of queue) {
    const source = readFileSync(path.join(root, file), 'utf8')
    for (const specifier of importSpecifiers(source)) {
      if (!specifier.startsWith('.')) continue
      const base = path.resolve(root, path.dirname(file), specifier)
      const resolved = ['', '.ts', '.tsx', '.js', '.mjs', '.json', '/index.ts', '/index.tsx']
        .map(extension => base + extension)
        .find(candidate => { try { return statSync(candidate).isFile() } catch { return false } })
      if (!resolved) throw new Error('Unresolved build input')
      const relative = path.relative(root, resolved).split(path.sep).join('/')
      if (relative.startsWith('../')) throw new Error('Build input outside repository')
      if (inputs.has(relative)) continue
      inputs.add(relative)
      if (/\.[cm]?[jt]sx?$/.test(relative)) queue.push(relative)
    }
  }
  return [...inputs]
}
