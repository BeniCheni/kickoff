import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

function filesUnder(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...filesUnder(full))
    else out.push(full)
  }
  return out
}

function specifiers(source: string): string[] {
  const found: string[] = []
  const patterns = [
    /(?:import|export)\s+(?:type\s+)?[^'"\n]*?\sfrom\s*['"]([^'"]+)['"]/g,
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /import\s*['"]([^'"]+)['"]/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ]
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      if (match[1]) found.push(match[1])
    }
  }
  return found
}

function names(specifier: string, rootName: string): boolean {
  const parts = specifier.split(/[/\\]/)
  return parts.includes(rootName) || specifier.startsWith(`${rootName}/`)
}

function enters(fromFile: string, specifier: string, forbiddenDir: string): boolean {
  if (!specifier.startsWith('.')) return false
  const resolved = path.resolve(path.dirname(fromFile), specifier)
  const relative = path.relative(forbiddenDir, resolved)
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

function offendersUnder(dir: string, forbidden: readonly string[]) {
  const found: { file: string; specifier: string }[] = []
  for (const file of filesUnder(dir)) {
    if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file)) continue
    const source = readFileSync(file, 'utf8')
    for (const specifier of specifiers(source)) {
      const hit = forbidden.some((name) => names(specifier, name) || enters(file, specifier, path.join(repoRoot, name)))
      if (hit) found.push({ file: path.relative(repoRoot, file), specifier })
    }
  }
  return found
}

describe('reader isolation', () => {
  it('forbids src/ from importing studio/', () => {
    const offenders: { file: string; specifier: string }[] = []
    for (const file of filesUnder(path.join(repoRoot, 'src'))) {
      if (!/\.(ts|tsx|js|jsx|mjs|cjs|css)$/.test(file)) continue
      const source = readFileSync(file, 'utf8')
      for (const specifier of specifiers(source)) {
        if (names(specifier, 'studio')) offenders.push({ file: path.relative(repoRoot, file), specifier })
      }
    }
    expect(offenders).toEqual([])
  })

  it('forbids studio/ from importing src/ or web/', () => {
    expect(offendersUnder(path.join(repoRoot, 'studio'), ['src', 'web'])).toEqual([])
  })

  it('forbids the catalog package from importing studio, src, or web', () => {
    expect(offendersUnder(path.join(repoRoot, 'packages/kickoff-catalog'), ['studio', 'src', 'web'])).toEqual([])
  })
})
