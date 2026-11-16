import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

/**
 * The stock axis, resolved by a cascade. tests/contrast.test.ts reads the black-stock rule's
 * selector as text, which stays true while the rule's meaning changes: a selector added to
 * the list, or a dark page that lost its own line, keeps every substring. jsdom inherits
 * custom properties, so this file asks the stylesheet what each surface is given.
 *
 * The black voices are the handoff's black column (docs/design/5-handoff/second-edition-handoff.md
 * §2), not "whatever the dark root happens to compute". A wrong value in the black-stock
 * block fails the literal below even when every surface still agrees with the root.
 * Hairline alphas and the torch are the build's figures inside the ranges the handoff
 * leaves open (19% of 18–20, 52% of 50–55, torch at 20%, paper torch at zero).
 *
 * Not asserted: a paper surface inside a black one on a light page. It is given the black
 * voices today, because nothing restores the paper ones below a black surface. Whether it
 * should is open (the review of PR #330), so no cell here decides it.
 *
 * It runs in the node project with jsdom as a library. vitest empties a stylesheet import,
 * `?raw` included, so a test under tests/dom cannot read this file's text, and jsdom ships
 * no types, so the few members used are typed here.
 */
type Computed = { getPropertyValue(name: string): string }
type Dom = {
  window: {
    document: { documentElement: unknown; getElementById(id: string): unknown }
    getComputedStyle(element: unknown): Computed
  }
}
const { JSDOM } = createRequire(import.meta.url)('jsdom') as { JSDOM: new (html: string) => Dom }

const css = readFileSync(new URL('../src/shell.css', import.meta.url), 'utf8')
const names = [...new Set([...css.matchAll(/--(fb-[\w-]+):/g)].map((match) => match[1]!))]

function page(theme: 'light' | 'dark') {
  const { window } = new JSDOM(`<!doctype html><html data-theme="${theme}"><head><style>${css}</style></head><body>
    <div id="plain"></div>
    <div data-stock="paper" id="paper"><div id="in-paper"></div><div data-stock="black" id="black-in-paper"></div></div>
    <div data-stock="black" id="black"><div id="in-black"></div><div data-stock="paper" id="paper-in-black"></div></div>
  </body></html>`)
  return (id: string | null) => {
    const element = id ? window.document.getElementById(id) : window.document.documentElement
    if (!element) throw new Error(`No element ${id}`)
    const computed = window.getComputedStyle(element)
    return Object.fromEntries(names.map((name) => [name, computed.getPropertyValue(`--${name}`).trim()]))
  }
}

const light = page('light')
const dark = page('dark')
const paper = light(null)
const black = dark(null)

// jsdom returns `rgb(28 22 17/0.22)` for a specified `rgb(28 22 17 / 0.22)`.
function shown(tokens: Record<string, string>) {
  return Object.fromEntries(Object.entries(tokens).map(([name, value]) => [
    name,
    value.replace(/\s*\/\s*/g, ' / ').replace(/\s+/g, ' ').trim(),
  ]))
}

// Handoff §2, the eleven tokens that change with the stock.
const paperVoices = {
  'fb-pulp': '#EBDDBE',
  'fb-typescript': '#EDE9DD',
  'fb-pulp-ink': '#1C1611',
  'fb-pulp-muted': '#4E4538',
  'fb-pitch': '#1E5636',
  'fb-amber': '#6E4B00',
  'fb-alarm': '#B3121B',
  'fb-on-pitch': '#F2EBDD',
  'fb-rule': 'rgb(28 22 17 / 0.22)',
  'fb-rule-strong': 'rgb(28 22 17 / 0.52)',
  'fb-torch': 'rgb(232 179 111 / 0)',
}
const blackVoices = {
  'fb-pulp': '#0E1420',
  'fb-typescript': '#0E1420',
  'fb-pulp-ink': '#E9E4D4',
  'fb-pulp-muted': '#A9A493',
  'fb-pitch': '#56C083',
  'fb-amber': '#F7C948',
  'fb-alarm': '#FF7074',
  'fb-on-pitch': '#0A0A0C',
  'fb-rule': 'rgb(233 228 212 / 0.19)',
  'fb-rule-strong': 'rgb(233 228 212 / 0.52)',
  'fb-torch': 'rgb(232 179 111 / 0.2)',
}

describe('the stock axis, as the stylesheet resolves it', () => {
  it('changes eleven tokens with the stock, and no others', () => {
    expect(names.length).toBeGreaterThan(11)
    for (const name of names) expect(paper[name], name).not.toBe('')
    expect(names.filter((name) => paper[name] !== black[name])).toEqual([
      'fb-pulp', 'fb-typescript', 'fb-pulp-ink', 'fb-pulp-muted', 'fb-pitch', 'fb-amber', 'fb-alarm',
      'fb-on-pitch', 'fb-rule', 'fb-rule-strong', 'fb-torch',
    ])
    expect(shown(paper)).toMatchObject(shown(paperVoices))
    expect(shown(black)).toMatchObject(shown(blackVoices))
  })

  it.each(['plain', 'paper', 'in-paper'])('a light page gives %s the paper voices', (id) => {
    expect(light(id)).toEqual(paper)
  })

  it.each(['black', 'in-black', 'black-in-paper'])('a light page gives %s the black voices', (id) => {
    expect(light(id)).toEqual(black)
  })

  it.each(['plain', 'paper', 'in-paper', 'black', 'in-black', 'black-in-paper', 'paper-in-black'])(
    'a dark page gives %s the black voices', (id) => {
      expect(dark(id)).toEqual(black)
    },
  )
})
