import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

it('scans only the reader TypeScript source for Tailwind classes', () => {
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')

  expect(css.match(/@import\s+['"]tailwindcss['"][^;]*;/g)).toEqual([
    "@import 'tailwindcss' source(none);",
  ])
  expect(css.match(/@source\b[^;]*;/g)).toEqual([
    "@source './**/*.{ts,tsx}';",
  ])
})
