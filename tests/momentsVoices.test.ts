import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

const voices = [
  ['--bg', '--fb-pulp'],
  ['--surface', '--fb-typescript'],
  ['--surface-alt', '--fb-pulp'],
  ['--media', '--fb-pulp'],
  ['--text', '--fb-pulp-ink'],
  ['--text-secondary', '--fb-pulp-muted'],
  ['--text-muted', '--fb-pulp-muted'],
  ['--border', '--fb-rule'],
  ['--border-strong', '--fb-rule-strong'],
  ['--pitch', '--fb-pitch'],
  ['--pitch-deep', '--fb-pitch'],
  ['--floodlight', '--fb-amber'],
  ['--floodlight-strong', '--fb-amber'],
  ['--floodlight-bg', '--fb-pulp'],
  ['--accent', '--fb-alarm'],
  ['--accent-strong', '--fb-alarm'],
  ['--accent-lead', '--fb-pitch'],
  ['--accent-lead-strong', '--fb-pitch'],
  ['--lens-accent', '--fb-pitch'],
  ['--on-accent-lead', '--fb-on-pitch'],
] as const

/** The block that holds the mapping. In the Vite sheet it is shared with the empty route. */
function voicesBlock(file: string, selector: string) {
  const css = readFileSync(new URL(file, import.meta.url), 'utf8')
  const start = css.indexOf(`${selector} {`)
  expect(start, `${file} has no ${selector} block`).toBeGreaterThan(-1)
  return css.slice(start, css.indexOf('}', start))
}

const sheets = [
  ['../src/index.css', '.moments-gallery, .moments-voices'],
  ['../web/app/moments/gallery.css', '.moments-gallery'],
] as const

it('Moments remaps its colours under .moments-gallery in both sheets', () => {
  for (const [file, selector] of sheets) {
    const block = voicesBlock(file, selector)
    for (const [from, to] of voices) expect(block, file).toContain(`${from}: var(${to})`)
    const css = readFileSync(new URL(file, import.meta.url), 'utf8')
    expect(css, file).toContain('width: min(calc(100vw - 40px), 1120px)')
  }
})

it('text that names no colour inherits the second edition’s ink, in both sheets', () => {
  for (const [file, selector] of sheets) expect(voicesBlock(file, selector), file).toContain('color: var(--text)')
})

it('the production-empty route takes the voices and none of the gallery’s layout', () => {
  const block = voicesBlock('../src/index.css', '.moments-gallery, .moments-voices')
  for (const layout of ['width:', 'margin-inline:', 'font-size:', 'line-height:']) expect(block).not.toContain(layout)
  const empty = readFileSync(new URL('../src/components/MomentsEmpty.tsx', import.meta.url), 'utf8')
  expect(empty).toContain('<main aria-label="Moments" className="moments-voices">')
  expect(empty).not.toContain('moments-gallery')
})

it('the page behind the Moments route is pulp, on the shared sheet both apps load', () => {
  const shell = readFileSync(new URL('../src/shell.css', import.meta.url), 'utf8')
  expect(shell).toContain("body:has(.page-measure[data-measure='moments']) {\n  background: var(--fb-pulp);\n}")
  for (const file of ['../src/App.tsx', '../web/app/shell.tsx']) {
    expect(readFileSync(new URL(file, import.meta.url), 'utf8'), file).toContain("data-measure={tab === 'moments' ? 'moments'")
  }
})
