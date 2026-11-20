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

describe('voices, as painted', () => {
  it('colours a unit by the voice it names, and by nothing else', () => {
    expect(rule(":where(.register) [data-voice='ink']")).toEqual({ color: 'var(--fb-pulp-ink)' })
    expect(rule(":where(.register) [data-voice='muted']")).toEqual({ color: 'var(--fb-pulp-muted)' })
    expect(rule(":where(.register) [data-voice='pitch']")).toEqual({ color: 'var(--fb-pitch)' })
    expect(rule(":where(.register) [data-voice='amber']")).toEqual({ color: 'var(--fb-amber)' })
    // The cell's own rules set type and never a colour, so the attribute is the only paint.
    for (const selector of ['.next-cell', '.next-cell-state', '.next-cell-unset']) expect(rule(selector).color, selector).toBeUndefined()
    for (const name of ['pitch on pulp', 'pitch on dark pulp', 'amber on pulp', 'amber on dark pulp', 'pulp-muted on pulp', 'pulp-muted on dark pulp']) {
      expect(pair(name).ratio, name).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('sets the stadium clock smaller than the Brooklyn clock, and keeps each clock whole', () => {
    expect(rule('.next-cell')['font-size']).toBe('12px')
    expect(rule('.next-cell > *')).toEqual({ 'white-space': 'nowrap' })
    expect(css).toMatch(/\.next-cell-local,\s*\.next-cell-unset \{[^}]*font-size: 11px;/)
    expect(rule('.next-cell')['flex-wrap']).toBe('wrap')
  })
})

describe('the Table’s files and the clock', () => {
  it('build no Date from a kickoff: every clock a cell prints is the pure layer’s', () => {
    for (const file of ['components/TablePage.tsx', 'components/NextFixtureCell.tsx', 'components/FormPips.tsx']) {
      const text = source(file)
      expect(text, file).not.toMatch(/new Date\([^)]*kickoff|Date\.parse\([^)]*kickoff|toLocale(Time|Date)?String|Intl\.DateTimeFormat/)
    }
  })
})

describe('league tabs and the notes, as painted', () => {
  it('draws a tab 30px tall in a 44px hit area, three to a row', () => {
    const tab = rule('.league-tab')
    expect([tab.height, tab['min-width'], tab.padding]).toEqual(['44px', '44px', '7px 0'])
    expect(rule('.league-tab span').height).toBe('30px')
    expect(rule('.league-tabs')['grid-template-columns']).toBe('repeat(3, auto)')
  })

  it('sets the current tab as a black plate with the pitch underline, and gives no tab a hue', () => {
    expect(rule(".league-tab[aria-pressed='true'] span")).toEqual({
      background: 'var(--fb-cover-black)',
      color: 'var(--fb-cover-ink)',
      'box-shadow': 'inset 0 -2.5px 0 var(--fb-pitch)',
    })
    expect(source('components/LeagueTabs.tsx')).toContain("data-stock={key === league ? 'black' : undefined}")
    expect(pair('cover-ink on cover-black').ratio).toBeGreaterThanOrEqual(4.5)
    expect(pair('pitch on cover-black').ratio).toBeGreaterThanOrEqual(3)
    // No flag, no competition colour and no chip: the tab reads the league's name and nothing else.
    expect(source('components/LeagueTabs.tsx')).not.toMatch(/\.flag|\.color|CompetitionChip|chipInk|style=/)
    expect(source('components/TablePage.tsx')).not.toMatch(/CompetitionChip|chipInk/)
  })

  it('rules the games-in-hand note in amber and washes nothing', () => {
    const note = rule('.inhand-note')
    expect(note['border-left']).toBe('3px solid var(--fb-amber)')
    expect(note.background).toBeUndefined()
    expect(rule('.register-note')['border-left']).toBe('1px solid var(--fb-rule-strong)')
    expect(rule('.register-note').background).toBeUndefined()
    expect(rule('.inhand-chip').border).toBe('1px solid currentColor')
    expect(source('components/TablePage.tsx')).not.toMatch(/bg-floodlight-bg|floodlight/)
  })
})
