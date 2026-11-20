import { globSync, readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

const src = new URL('../src/', import.meta.url)
const components = globSync('components/**/*.{ts,tsx,css}', { cwd: src })
const read = (file: string) => readFileSync(new URL(file, src), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

it('components never construct a Date from a kickoff instant', () => {
  for (const file of components) expect(read(file), file).not.toMatch(/new\s+Date\s*\([^)]*\bkickoffUtc\b/)
})

// Match the expression and its purpose. Consume each site exactly once so even a second
// copy in the same file needs review. Corrected results (use 6) have no snapshot field.
const sites: [string, string, RegExp][] = [
  ['ProvenanceLine', '1 · sync line', /className="provenance" data-provenance="" data-voice="amber"/],
  ['FixtureRow', '2 · unset kickoff', /unset && <div className="fixture-unset" data-voice="amber"/],
  ['NextUpStrip', '2 · unset card', /className="fixture-unset italic" data-voice="amber">TBC/],
  ['TonightSlate', '2 · unset cover', /text-floodlight-strong italic">TBC/],
  ['FixtureRow', '3 · last live score', /className="fixture-score" data-voice=\{isStale \? 'amber'/],
  ['StatusPill', '3 · kicked off', /const voice = kickedOff \? 'amber'/],
  ['StalenessBanner', '5 · snapshot age', /const plane = stale \? 'alarm' : 'amber'/],
  ['MatchdayLines', '7 · outside or rescheduled', /line.state === 'computed' \? 'ink' : 'amber'/],
  ['FixtureRow', '8 · unknown stadium clock', /className="stadium-clock" data-voice=\{times.local \? 'muted' : 'amber'/],
  ['NextUpStrip', '8 · unknown stadium clock', /className="stadium-clock" data-voice=\{local \? 'muted' : 'amber'/],
  ['TablePage', '4 · games in hand', /border-floodlight [^"]*text-floodlight-strong">\s*\+\{n\}/],
  ['TablePage', '1, 4 · freshness and games in hand', /border-l-floodlight bg-floodlight-bg[^"]*">\s*<div className="[^"]*text-floodlight-strong">\s*\{progress/],
  ['TablePage', '3 · mobile underway', /text-floodlight-strong">\s+KICKED OFF/],
  ['TablePage', '2 · unset next fixture', /text-floodlight-strong">\s*\{r.next.times.brooklyn.isoDate\} — kickoff time not yet set/],
  ['TablePage', '3 · desktop underway', /text-floodlight-strong">KICKED OFF/],
  // First-edition stock, retained verbatim until its owning surface is repainted.
  ['TablePage', 'existing noncanonical sort ground', /bg-floodlight-bg[^"]*">\s*Sorted by/],
  ['MomentsEmpty', 'existing Moments rights notice', /border-l-floodlight bg-floodlight-bg[^"]*">\s*<p className="[^"]*text-floodlight-strong">Hand-curated/],
]

it('accounts for amber by component and reason', () => {
  const remaining = new Map(components.map(file => [file, read(file)]))
  for (const [name, reason, pattern] of sites) {
    const file = 'components/' + name + '.tsx'
    const source = remaining.get(file)!
    expect(source, name + ' ' + reason).toMatch(pattern)
    remaining.set(file, source.replace(pattern, ''))
  }
  for (const [file, source] of remaining) {
    expect(source, file).not.toMatch(/\b(?:amber|floodlight)\b|#(?:6e4b00|f7c948)\b/i)
  }
})

it('allows the amber token only on its named grounds and text selectors', () => {
  const permitted = [
    ".imprint-band[data-stock='black']", ".imprint-band[data-stock='paper']", '.provenance', '.staleness',
    ".fixture-status[data-voice='amber'], .fixture-score[data-voice='amber']",
    ".stadium-clock[data-voice='amber'], .fixture-unset",
    ".matchday-line[data-voice='amber']", ".next-card .stadium-clock[data-voice='amber']",
  ]
  const rules = [...read('shell.css').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  const painted = rules.filter(([, , body]) => /var\(--(?:fb|band)-amber\)/.test(body!))
    .map(([, selector]) => selector!.trim().replace(/\s+/g, ' '))
  expect(painted).toEqual(permitted)
})

