import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { SRC_ALLOWLIST, allowlistViolations, assertAllowlist, readerImport } from '../src-allowlist.mjs'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))
const webRoot = fileURLToPath(new URL('..', import.meta.url))

test('web imports no reader module outside the allowlist', () => {
  expect(allowlistViolations(webRoot, repoRoot)).toEqual([])
})

test('a non-listed reader import fails and the real tree passes', () => {
  const from = path.join(webRoot, 'app/page.tsx')
  expect(readerImport(from, '../../src/App.tsx', repoRoot)).toBe('src/App.tsx')
  expect(readerImport(from, '../../src/main.tsx', repoRoot)).toBe('src/main.tsx')
  expect(SRC_ALLOWLIST).not.toContain('src/App.tsx')
  expect(SRC_ALLOWLIST).not.toContain('src/main.tsx')
  // Dropping a module the probe actually imports turns the real tree red.
  const withoutSwitcher = SRC_ALLOWLIST.filter(item => item !== 'src/components/LensSwitcher.tsx')
  expect(() => assertAllowlist(webRoot, repoRoot, withoutSwitcher)).toThrow(/LensSwitcher/)
  expect(() => assertAllowlist(webRoot, repoRoot)).not.toThrow()
  expect(allowlistViolations(webRoot, repoRoot)).toEqual([])
})
