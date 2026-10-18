import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { PER_JOB_CAP_USD, PREPAID_CEILING_USD, SESSION_CAP_USD } from '../caps.ts'
import { parseUsd } from '../money.ts'
import { displayUsd } from '../shared/display.ts'
import { readStoredTheme, resolveTheme } from '../shared/theme.ts'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

function properties(css: string, selector: string): Map<string, string> {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`).exec(stripped)
  const body = match?.[1] ?? ''
  const found = new Map<string, string>()
  for (const declaration of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    const name = declaration[1]
    const value = declaration[2]
    if (name && value) found.set(name, value.trim())
  }
  return found
}

describe('studio tokens', () => {
  it('matches the reader token values and does not import src', () => {
    const index = readFileSync(path.join(repoRoot, 'src/index.css'), 'utf8')
    expect(index).toContain("@import './shell.css'")
    expect(index).toContain("@source not '../studio'")
    expect(index).not.toContain('fa11e0')
    const reader = readFileSync(path.join(repoRoot, 'src/shell.css'), 'utf8')
    const studio = readFileSync(path.join(repoRoot, 'studio/ui/app/tokens.css'), 'utf8')
    expect(studio).not.toContain("from '")
    expect(studio).not.toContain('../src')
    for (const selector of [':root', "[data-theme='dark']"]) {
      const expected = properties(reader, selector)
      const actual = properties(studio, selector)
      expect(expected.size).toBeGreaterThan(10)
      for (const [name, value] of expected) {
        expect(actual.get(name), `${selector} ${name}`).toBe(value)
      }
    }
    const fonts = ['--font-display', '--font-sans', '--font-mono']
    const theme = properties(reader, '@theme inline')
    const root = properties(studio, ':root')
    for (const name of fonts) {
      expect(root.get(name)).toBe(theme.get(name))
    }
  })

  it('shows a recorded dollar figure without changing it', () => {
    expect(displayUsd(PER_JOB_CAP_USD)).toBe('$1.50')
    expect(displayUsd(SESSION_CAP_USD)).toBe('$6.00')
    expect(displayUsd(PREPAID_CEILING_USD)).toBe('$9.37')
    expect(displayUsd('0.225000')).toBe('$0.225')
    for (const recorded of [PER_JOB_CAP_USD, SESSION_CAP_USD, PREPAID_CEILING_USD, '0.225000']) {
      const shown = displayUsd(recorded).slice(1)
      expect(parseUsd(shown)).toBe(parseUsd(recorded))
    }
  })

  it('resolves a theme without a store', () => {
    expect(resolveTheme('dark', false)).toBe('dark')
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme(null, true)).toBe('dark')
    expect(resolveTheme('other', false)).toBe('light')
    expect(readStoredTheme(() => {
      throw new Error('denied')
    })).toBeNull()
  })
})
