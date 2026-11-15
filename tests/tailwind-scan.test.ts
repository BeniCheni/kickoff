import { globSync, readFileSync } from 'node:fs'
import { extname } from 'node:path'
import { parseAst } from 'vite'
import { expect, it } from 'vitest'

const src = new URL('../src/', import.meta.url)

function moduleSpecifiers(node: unknown): string[] {
  if (Array.isArray(node)) return node.flatMap(moduleSpecifiers)
  if (!node || typeof node !== 'object') return []

  if ('source' in node) {
    const source = node.source
    if (source && typeof source === 'object' && 'value' in source && typeof source.value === 'string') {
      return [source.value]
    }
  }
  return Object.values(node).flatMap(moduleSpecifiers)
}

it('scans only the reader TypeScript source for Tailwind classes', () => {
  const directives = /@(?:import|source|config|plugin|reference|tailwind)\b[^;\r\n]*;?/gi
  const index = readFileSync(new URL('index.css', src), 'utf8')
  expect([...index.matchAll(directives)].map(([rule]) => rule)).toEqual([
    "@import 'tailwindcss' source(none);",
    "@source './**/*.{ts,tsx}';",
    "@import './shell.css';",
  ])

  for (const file of globSync('**/*.css', { cwd: src })) {
    if (file === 'index.css') continue
    const css = readFileSync(new URL(file, src), 'utf8')
    expect(css, file).not.toMatch(directives)
  }

  const languages = {
    '.ts': 'ts', '.tsx': 'tsx', '.mts': 'ts', '.cts': 'ts',
    '.js': 'js', '.jsx': 'jsx', '.mjs': 'js', '.cjs': 'js',
  } as const
  for (const file of globSync('**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}', { cwd: src })) {
    const code = readFileSync(new URL(file, src), 'utf8')
    const lang = languages[extname(file) as keyof typeof languages]
    const specifiers = moduleSpecifiers(parseAst(code, { lang }, file))
    const styles = specifiers.filter(specifier =>
      /^tailwindcss(?:[/#?]|$)/.test(specifier) ||
      /\.(?:css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:[#?]|$)/i.test(specifier),
    )
    for (const stylesheet of styles) {
      expect(stylesheet, file).toBe('./index.css')
    }
  }
})
