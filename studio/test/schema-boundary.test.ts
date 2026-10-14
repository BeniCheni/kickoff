import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const studioRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dbRoot = path.join(studioRoot, 'db')

function filesUnder(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...filesUnder(full))
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full)
  }
  return out
}

describe('schema module boundary', () => {
  it('imports nothing from the rest of studio/', () => {
    const offenders: { file: string; specifier: string }[] = []
    for (const file of filesUnder(dbRoot)) {
      const source = readFileSync(file, 'utf8')
      const specifiers = source.matchAll(/from\s*['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)/g)
      for (const match of specifiers) {
        const specifier = match[1] ?? match[2]
        if (!specifier?.startsWith('.')) continue
        const resolved = path.resolve(path.dirname(file), specifier)
        const relative = path.relative(dbRoot, resolved)
        if (relative.startsWith('..')) {
          offenders.push({ file: path.relative(studioRoot, file), specifier })
        }
      }
    }
    expect(offenders).toEqual([])
  })
})
