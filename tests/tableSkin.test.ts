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

/** The page's own rules: what is left once every @media and @keyframes block is set aside. */
const plain = css.replace(/@(?:media|keyframes)[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')

/** The declarations of the one rule, outside any @media, whose whole selector is `selector`. */
function rule(selector: string): Record<string, string> {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const found = [...plain.matchAll(new RegExp(`(?:^|\\})\\s*${escaped}\\s*\\{([^}]*)\\}`, 'g'))]
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

/*
 * Section 6's source scan, for the Table's files. PR 3 builds beside this PR and its
 * tests/fixtureHonesty.test.ts holds the same first pattern over every component; whichever
 * merges second leaves one scan covering both. The Table's rule is the stricter one, and it
 * is what NextFixtureCell's own comment says: the lane brings both clocks, already formatted
 * from one UTC instant by fixtureTimes, and no Table file formats or builds a time.
 */
describe('the Table’s files and time', () => {
  const files = ['TablePage', 'FormPips', 'NextFixtureCell', 'LeagueTabs', 'ZonesKey', 'RegisterCover']
  const code = (file: string) => readFileSync(new URL(`../src/components/${file}.tsx`, import.meta.url), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')

  it('builds no Date from a kickoff instant', () => {
    for (const file of files) expect(code(file), file).not.toMatch(/new\s+Date\s*\([^)]*\bkickoffUtc\b/)
  })

  it('builds no Date at all and formats no time: every clock is the lane’s own', () => {
    for (const file of files) {
      expect(code(file), file).not.toMatch(/\bnew\s+Date\b|\bDate\s*\.\s*(?:parse|UTC|now)\b|\bIntl\s*\.|\.toLocale(?:Time|Date)?String\b|\.get(?:UTC)?(?:Hours|Minutes)\b/)
    }
    // The one place the Table prints a clock reads it from the lane.
    const cell = code('NextFixtureCell')
    expect(cell).toContain('const { brooklyn, local } = lane.times')
    expect(cell).toContain('{brooklyn.time}')
    expect(cell).toContain('{local.clock24} local')
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

describe('zone marks and the key, as painted', () => {
  it('draws a place in the hue the zone hands over, and nothing where there is no zone', () => {
    expect(rule('.zone-mark').background).toBe('var(--zone-hue, transparent)')
    expect([rule('.zone-mark-band').width, rule('.zone-mark-square').width, rule('.zone-mark-square').height]).toEqual(['3px', '8px', '8px'])
  })

  it('names blood for relegation and muted ink for Eliminated, and no first-edition hue', () => {
    expect(css).toContain(".zone-mark[data-band='relegation'],\n.zone-mark[data-band='relegation-playoff'] {\n  --zone-hue: var(--fb-blood);\n}")
    expect(rule(".zone-mark[data-band='eliminated']")).toEqual({ '--zone-hue': 'var(--fb-pulp-muted)' })
    const marks = css.slice(css.indexOf('.zone-mark {'), css.indexOf('.zones-key-bar {'))
    expect(marks).not.toMatch(/--accent|--floodlight|fb-amber|fb-alarm/)
  })

  it('breaks a play-off 4px on and 3px off, and its square into two bars with a gap', () => {
    expect(rule(".zone-mark-band[data-band$='playoff']").background).toBe('repeating-linear-gradient(to bottom, var(--zone-hue) 0 4px, transparent 4px 7px)')
    expect(rule(".zone-mark-square[data-band$='playoff']").background).toBe('linear-gradient(to bottom, var(--zone-hue) 0 2.5px, transparent 2.5px 5.5px, var(--zone-hue) 5.5px 8px)')
  })

  it('makes the key a 44px disclosure that opens in 180ms, with the rule moving under the key', () => {
    const bar = rule('.zones-key-bar')
    expect([bar.height, bar['border-bottom']]).toEqual(['44px', '1.5px solid var(--fb-rule)'])
    expect(rule('.zones-key[data-open] .zones-key-bar')).toEqual({ 'border-bottom-color': 'transparent' })
    const panel = rule('.zones-key-panel')
    expect(panel['border-bottom']).toBe('1.5px solid var(--fb-rule)')
    expect(panel.animation).toBe('zones-key-open 180ms cubic-bezier(.2, .7, .2, 1)')
    expect([panel['font-family'], panel['font-size'], panel['line-height']]).toEqual(['var(--fb-book)', '12px', '1.4'])
    expect(rule('.zones-key-chevron').transition).toBe('transform 180ms cubic-bezier(.2, .7, .2, 1)')
  })
})

describe('the cover, as painted', () => {
  it('is black stock in its own two inks, edge to edge, with a window of flat stock inside 150 to 250px', () => {
    const cover = rule('.register-cover')
    expect(cover.background).toBe('var(--fb-cover-black)')
    expect(cover['margin-inline']).toBe('calc(-1 * var(--page-gutter))')
    expect(rule(".register-cover [data-voice='ink']")).toEqual({ color: 'var(--fb-cover-ink)' })
    expect(rule(".register-cover [data-voice='muted']")).toEqual({ color: 'var(--fb-cover-muted)' })
    // Flat stock and nothing else: a height, and no paint of its own.
    expect(rule('.register-cover-art')).toEqual({ height: '150px' })
    expect(pair('cover-ink on cover-black').ratio).toBeGreaterThanOrEqual(4.5)
    expect(pair('cover-muted on cover-black').ratio).toBeGreaterThanOrEqual(4.5)
  })

  it('sets the line as a date line and never lets a unit break, and draws no foil and no motion', () => {
    const line = rule('.register-cover-line')
    expect([line['font-weight'], line['font-size'], line['line-height'], line['letter-spacing'], line['text-transform']]).toEqual(['500', '11px', '1.5', '0.04em', 'uppercase'])
    expect(rule('.register-cover-line span')).toEqual({ 'white-space': 'nowrap' })
    const block = css.slice(css.indexOf('.register-cover {'), css.indexOf('.league-tabs {'))
    expect(block).not.toMatch(/fb-foil|animation|transition|background-image|url\(|gradient/)
  })
})

describe('the desktop head and the Table’s focus ring, as painted', () => {
  it('gives each sort control the whole 44px row, with the rule drawn inside it', () => {
    const wide = rule('.register-labels-wide')
    expect([wide['border-bottom'], wide['box-shadow']]).toEqual(['0', 'inset 0 -1.5px 0 var(--fb-pulp-ink)'])
    const sort = rule('.register-sort')
    expect([sort['align-self'], sort.padding, sort.border, sort.cursor]).toEqual(['stretch', '0', '0', 'pointer'])
    // The six sort columns are 44px wide and the row is 44px tall: W, D and L are 26px and text.
    const page = readFileSync(new URL('../src/components/TablePage.tsx', import.meta.url), 'utf8')
    expect(page).toContain("'grid-cols-[3px_34px_36px_minmax(0,1fr)_44px_26px_26px_26px_44px_44px_44px_44px_44px_88px_146px]'")
    expect(page).toContain('sticky top-0 z-10 grid h-[44px] ${DESKTOP_COLS} register-labels register-labels-wide')
    expect(page).toContain("['pl', 'Pl'], [null, 'W'], [null, 'D'], [null, 'L'],")
  })

  it('draws a row’s ring, and a sort control’s, inside the control', () => {
    expect(css).toContain('\nbutton.register-row:focus-visible,\n.register-sort:focus-visible {\n  outline-offset: -2px;\n}')
    // The page's ring is unchanged: the same 2px line, in the same ink.
    expect(css).toMatch(/:focus-visible \{\s*outline: 2px solid var\(--accent-lead-strong\);\s*outline-offset: 2px;/)
  })

  it('leaves no first-edition colour, face or label utility in the Table’s files', () => {
    const files = ['TablePage', 'FormPips', 'NextFixtureCell', 'LeagueTabs', 'ZonesKey', 'RegisterCover']
    for (const file of files) {
      const source = readFileSync(new URL(`../src/components/${file}.tsx`, import.meta.url), 'utf8')
      const classes = [...source.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\}|\{\[([^\]]*)\])/g)].map((match) => match[1] ?? match[2] ?? match[3] ?? '').join(' ')
      expect(classes, file).not.toMatch(/\b(?:text-ink|text-accent|text-pitch|text-floodlight|bg-bg|bg-surface|bg-accent|bg-floodlight|border-line|border-accent|font-display|font-mono|font-sans|label-caps|rounded|shadow)\b/)
    }
  })
})

describe('the scorch and the page’s end, as painted', () => {
  const scorch = css.slice(css.indexOf('.register-scorch {'), css.indexOf('}', css.indexOf('.register-scorch {')) + 1)

  it('is static: gradients alone, with nothing that moves, fetches or draws on a canvas', () => {
    expect(scorch).toContain('height: 72px;')
    expect(scorch).not.toMatch(/animation|transition|url\(|filter|will-change|transform/)
    expect(css).not.toMatch(/@keyframes[^{]*scorch/)
    // No rule changes it with the motion control, the theme or a media query: one still.
    expect([...css.matchAll(/\.register-scorch\b/g)]).toHaveLength(1)
    expect((scorch.match(/gradient\(/g) ?? []).length).toBeGreaterThanOrEqual(12)
  })

  it('chars to the cover’s black, so it runs into the foot, and names its own materials', () => {
    expect(scorch).toContain('--scorch-char: var(--fb-cover-black);')
    // The shader file's defaults: scorch #3a2410 and rift light #9dffc8, as channels.
    expect(scorch).toContain('--scorch-brown: 58 36 16;')
    expect(scorch).toContain('--scorch-glow: 157 255 200;')
    expect(readFileSync(new URL('../docs/design/shaders/scorch.glsl', import.meta.url), 'utf8')).toMatch(/@default #3a2410[\s\S]*@default #9dffc8/)
    expect(scorch).toContain('linear-gradient(to bottom, transparent 45px, var(--scorch-char) 45px)')
    // No ink of the page is spent on it, and no first-edition colour.
    expect(scorch).not.toMatch(/--fb-(?:pulp|pitch|amber|alarm|blood|foil)|--accent|--floodlight/)
  })

  it('tiles its ragged edge at three periods that never line up inside a screen', () => {
    const periods = [...new Set([...scorch.matchAll(/ellipse [\d.]+px [\d.]+px at [\d.]+px 45px[^/]*\/ (\d+)px 100% repeat-x/g)].map((match) => Number(match[1])))]
    expect(periods).toEqual([97, 173, 251])
    const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
    expect(periods.reduce((common, period) => (common * period) / gcd(common, period))).toBeGreaterThan(4_000_000)
  })

  it('ends the Table on black stock, and leaves room under a Table with no rows', () => {
    expect(css).toContain(".page-measure[data-measure='register'] {\n  padding-bottom: 0;\n}")
    expect(rule(".register .page-foot[data-stock='black']")).toEqual({ 'margin-top': '0', 'padding-bottom': '40px' })
    expect(rule('.register:not(:has(.page-foot))')).toEqual({ 'padding-bottom': '64px' })
  })
})
