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
