import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const needle = 'tableFor(league, today, nowUtcIso),'

describe('the states harness stays off the reader', () => {
  it('rewrites only a serve-time second copy of the table call', () => {
    const page = readFileSync('src/components/TablePage.tsx', 'utf8')
    expect(page.split(needle)).toHaveLength(2)
    const plugin = readFileSync('vite.config.ts', 'utf8')
    expect(plugin).toContain(needle)
    expect(plugin).toContain("apply: 'serve'")
    expect(plugin).toContain('kickoff-specimen')
    const harness = readFileSync('tests/harness/states.tsx', 'utf8')
    expect(harness).toContain('TablePage?kickoff-specimen')
    expect(harness).not.toContain('className')
  })
})
