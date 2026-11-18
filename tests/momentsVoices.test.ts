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

function galleryBlock(file: string) {
  const css = readFileSync(new URL(file, import.meta.url), 'utf8')
  const start = css.indexOf('.moments-gallery {')
  const end = css.indexOf('}', start)
  return css.slice(start, end)
}

it('Moments remaps its colours under .moments-gallery in both sheets', () => {
  for (const file of ['../src/index.css', '../web/app/moments/gallery.css']) {
    const block = galleryBlock(file)
    for (const [from, to] of voices) expect(block, file).toContain(`${from}: var(${to})`)
    expect(block).toContain('width: min(calc(100vw - 40px), 1120px)')
  }
})
