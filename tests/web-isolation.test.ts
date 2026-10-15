import { readdirSync, readFileSync, realpathSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const root = fileURLToPath(new URL('../', import.meta.url))
function filesUnder(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') return []
    const file = path.join(dir, entry.name)
    return entry.isDirectory() ? filesUnder(file) : /\.(?:[cm]?[jt]sx?|css)$/.test(file) ? [file] : []
  })
}
function imports(source: string): string[] {
  return [...source.matchAll(/\b(?:import|export)\s+(?:type\s+)?(?:[^;]*?\s+from\s*)?['"]([^'"]+)['"]|\b(?:import|require)\s*\(\s*['"]([^'"]+)['"]|@import\s+['"]([^'"]+)['"]/g)]
    .map(match => match[1] ?? match[2] ?? match[3]!)
}
function crossImports(from: string, forbidden: string) {
  return filesUnder(path.join(root, from)).flatMap(file => imports(readFileSync(file, 'utf8'))
    .filter(specifier => {
      if (specifier.split(/[/\\@]/).includes(forbidden)) return true
      if (!specifier.startsWith('.')) return false
      const resolved = path.resolve(path.dirname(file), specifier)
      const relative = path.relative(path.join(root, forbidden), resolved)
      return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
    }).map(specifier => ({ file: path.relative(root, file), specifier })))
}
function run(module: string, args: string[]) {
  return execFileSync(process.execPath, [path.join(root, 'node_modules', module), ...args], {
    cwd: root, encoding: 'utf8', timeout: 30_000,
  })
}

test('src never imports web', () => expect(crossImports('src', 'web')).toEqual([]))
test('web never imports studio', () => expect(crossImports('web', 'studio')).toEqual([]))

test('the actual root Vitest discovery contains only root tests', () => {
  const listed = JSON.parse(run('vitest/vitest.mjs', ['list', '--filesOnly', '--json'])) as { file: string }[]
  expect(listed.length).toBeGreaterThan(0)
  for (const { file } of listed) expect(path.relative(root, file)).toMatch(/^tests[/\\]/)
}, 30_000)

test('every project in the root tsc build graph excludes web', () => {
  const seen = new Set<string>()
  const visit = (config: string) => {
    const absolute = path.resolve(root, config)
    if (seen.has(absolute)) return
    seen.add(absolute)
    const parsed = JSON.parse(readFileSync(absolute, 'utf8')) as { references?: { path: string }[] }
    for (const ref of parsed.references ?? []) visit(path.resolve(path.dirname(absolute), ref.path))
    const listed = run('typescript/bin/tsc', ['-p', absolute, '--listFilesOnly']).trim().split('\n').filter(Boolean)
    for (const file of listed) {
      const resolved = realpathSync(file)
      expect(resolved, `web entered ${config}`).not.toContain(`${path.sep}web${path.sep}`)
    }
  }
  visit('tsconfig.json')
}, 30_000)
