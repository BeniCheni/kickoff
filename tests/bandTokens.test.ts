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
