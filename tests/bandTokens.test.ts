import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

const css = readFileSync(new URL('../src/shell.css', import.meta.url), 'utf8')

it('the band paints with the second-edition tokens', () => {
  const band = css.slice(css.indexOf('.imprint-band {'))
  expect(band).toContain('.imprint-band[data-stock=\'black\']')
  expect(band).toContain('.imprint-band[data-stock=\'paper\']')
  for (const token of ['--fb-cover-black', '--fb-cover-ink', '--fb-typescript', '--fb-pulp-ink', '--fb-pitch', '--fb-amber', '--fb-rift', '--fb-mono', '--fb-label', '--fb-gutter']) {
    expect(band).toContain(`var(${token})`)
  }
  expect(css.match(/@theme inline\s*\{([^}]+)\}/)?.[1] ?? '').not.toContain('--fb-')
})

it('the strap is set in caps at .12em, and its string is not typed in caps', () => {
  const strap = css.match(/^\.wordmark-strap \{([^}]*)\}/m)
  expect(strap, 'the strap’s rule').not.toBeNull()
  const declared = Object.fromEntries(strap![1]!.split(';').map((line) => line.split(':').map((part) => part.trim())).filter((pair) => pair.length === 2))
  expect(declared).toMatchObject({
    'font-family': 'var(--fb-label)',
    'font-weight': '600',
    'font-size': '10px',
    'letter-spacing': '0.12em',
    'text-transform': 'uppercase',
    color: 'var(--band-pitch)',
  })
  // One rule sets the strap: nothing later in the sheet tracks or cases it again.
  expect(css.match(/\.wordmark-strap\b/g)).toHaveLength(1)
  const band = readFileSync(new URL('../src/components/ImprintBand.tsx', import.meta.url), 'utf8')
  expect(band).toContain('<span className="wordmark-strap" data-voice="pitch">Brooklyn · ET</span>')
})

/** The declarations of the one rule whose whole selector is `selector`, at the start of a line. */
function rule(selector: string): Record<string, string> {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const found = [...css.matchAll(new RegExp(`^${escaped} \\{([^}]*)\\}`, 'gm'))]
  expect(found, `one rule for ${selector}`).toHaveLength(1)
  return Object.fromEntries(found[0]![1]!.split(';').map((line) => {
    const at = line.indexOf(':')
    return [line.slice(0, at).trim(), line.slice(at + 1).trim()]
  }).filter(([name]) => name))
}

it('a tab is drawn 22px tall inside its 44px hit area, underlined at the label’s width', () => {
  // The hit area is unchanged and draws nothing of its own.
  const hit = rule('.imprint-tabs button')
  expect(hit).toMatchObject({ 'min-width': '44px', height: '44px', padding: '0 12px', background: 'transparent', border: '0' })
  expect(hit).not.toHaveProperty('box-shadow')
  // The drawn tab shrinks to its label, so its foot is the label's width.
  expect(rule('.imprint-tabs button span')).toMatchObject({ display: 'inline-block', height: '22px', 'line-height': '22px' })
  expect(rule(".imprint-tabs button[aria-current='page']")).toEqual({ color: 'var(--band-ink)' })
  expect(rule(".imprint-tabs button[aria-current='page'] span")).toEqual({ 'box-shadow': 'inset 0 -2.5px 0 var(--band-pitch)' })
  const nav = readFileSync(new URL('../src/components/TabNav.tsx', import.meta.url), 'utf8')
  expect(nav).toMatch(/aria-current=\{tab === key \? 'page' : undefined\}\s*>\s*<span>\{label\}<\/span>\s*<\/button>/)
})
