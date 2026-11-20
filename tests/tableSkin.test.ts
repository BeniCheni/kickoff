import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { secondEditionPairs } from './contrast'

/**
 * The Table's paint, read from the stylesheet that paints it. A dom test can say which
 * element carries which attribute; it cannot say what colour the attribute is given, because
 * vitest empties a stylesheet import. So the rules themselves are read here, one selector at
 * a time, and each is tied to the pair the handoff measured for it.
 */
const css = readFileSync(new URL('../src/shell.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const source = (file: string) => readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8')

/** The declarations of the one rule whose whole selector is `selector`. */
function rule(selector: string): Record<string, string> {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const found = [...css.matchAll(new RegExp(`(?:^|\\})\\s*${escaped}\\s*\\{([^}]*)\\}`, 'g'))]
  expect(found, `${selector} is written once`).toHaveLength(1)
  return Object.fromEntries(found[0]![1]!.split(';').map((line) => line.trim()).filter(Boolean).map((line) => {
    const colon = line.indexOf(':')
    return [line.slice(0, colon).trim(), line.slice(colon + 1).trim()]
  }))
}

const pair = (name: string) => secondEditionPairs().find((entry) => entry.name === name)!

describe('form pips, as painted', () => {
  it('fills a loss in blood under cover-ink, the pair measured at 5.86', () => {
    const loss = rule(".form-pip[data-result='L']")
    expect(loss.background).toBe('var(--fb-blood)')
    expect(loss.color).toBe('var(--fb-cover-ink)')
    expect(pair('cover-ink on blood').ratio).toBeGreaterThanOrEqual(4.5)
  })

  it('fills a win in ink with the ground as its letter, outlines a draw, and fills neither with a hue', () => {
    const base = rule('.form-pip')
    expect(base.color).toBe('var(--fb-pulp-ink)')
    expect(base.border).toBe('1.5px solid var(--fb-pulp-ink)')
    expect(base.background).toBeUndefined()
    const win = rule(".form-pip[data-result='W']")
    expect(win).toEqual({ background: 'var(--fb-pulp-ink)', color: 'var(--fb-pulp)' })
    expect(pair('pulp-ink on pulp').ratio).toBeGreaterThanOrEqual(4.5)
    expect(pair('pulp-ink on dark pulp').ratio).toBeGreaterThanOrEqual(4.5)
  })

  it('draws 10px letters in 15px squares and an empty slot as a hairline square', () => {
    const base = rule('.form-pip')
    expect([base.width, base.height, base['font-size']]).toEqual(['15px', '15px', '10px'])
    const empty = rule(".form-pip[data-result='none']")
    expect(empty).toEqual({ border: '1px solid var(--fb-rule-strong)', color: 'var(--fb-pulp-muted)' })
  })

  it('leaves the first edition’s accent out of the strip (R2)', () => {
    for (const file of ['components/FormPips.tsx', 'components/TablePage.tsx']) {
      expect(source(file), file).not.toMatch(/bg-accent\b|#d85a30/i)
    }
    expect(JSON.stringify(rule(".form-pip[data-result='L']"))).not.toMatch(/--accent|#d85a30/i)
  })
})
