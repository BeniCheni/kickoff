import { globSync, readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

const src = new URL('../src/', import.meta.url)
const components = globSync('components/**/*.{ts,tsx,css}', { cwd: src })
const read = (file: string) => readFileSync(new URL(file, src), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

it('components leave instant parsing and clock formatting to the time helpers', () => {
  for (const file of components) {
    let source = read(file)
    if (file === 'components/StalenessBanner.tsx') {
      // Snapshot age uses the app clock, never a fixture kickoff. Consume only this call.
      const age = 'hoursSinceSync(new Date(nowUtcIso))'
      expect(source).toContain(age)
      source = source.replace(age, '')
    }
    if (file === 'components/TablePage.tsx') {
      // The first-edition Table also computes snapshot age from now. A second call still fails.
      source = source.replace('syncedAgo(new Date(nowUtcIso))', '')
    }
    expect(source, file).not.toMatch(/\b(?:new\s+Date|Date\s*\.\s*parse|Intl\s*\.\s*DateTimeFormat|toLocale(?:Date|Time)?String)\s*\(/)
  }
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
  ['StalenessBanner', '5 · age banner ground', /className="staleness" data-plane=\{plane\} data-voice=\{plane\}/],
  ['StalenessBanner', '5 · snapshot age', /const plane = stale \? 'alarm' : 'amber'/],
  ['MatchdayLines', '7 · outside or rescheduled', /line.state === 'computed' \? 'ink' : 'amber'/],
  ['FixtureRow', '8 · unknown stadium clock', /className="stadium-clock" data-voice=\{times.local \? 'muted' : 'amber'/],
  ['NextUpStrip', '8 · unknown stadium clock', /className="stadium-clock" data-voice=\{local \? 'muted' : 'amber'/],
  // The Table's second edition. One cell component draws both layouts, so each state is one site.
  ['TablePage', '4 · games in hand chip', /className="inhand-chip" data-voice="amber">\s*\+\{n\}/],
  ['TablePage', '4 · games in hand note', /className="inhand-note-heading" data-voice="amber">\{meta\.phase \? 'Matches played' : 'Games in hand'\}/],
  ['NextFixtureCell', '3 · kicked off', /className="next-cell-state" data-voice="amber">KICKED OFF/],
  ['NextFixtureCell', '8 · unknown stadium clock', /className="next-cell-local" data-voice="amber">local time not known/],
  ['NextFixtureCell', '2 · unset next fixture', /className="next-cell-unset" data-voice="amber">\s*\{compact \? 'time TBC' : `\$\{brooklyn\.weekday\} \$\{brooklyn\.isoDate\} — kickoff time not yet set by the league`\}/],
  // First-edition stock, retained verbatim until its owning surface is repainted.
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
    expect(source, file).not.toMatch(/(?:^|["'`\s])(?:fixture-unset|provenance|staleness)(?=[\s"'`])/)
    expect(source, file).not.toMatch(/\b(?:amber|floodlight)\b|#(?:6e4b00|f7c948)\b/i)
  }
})

it('allows the amber token only on its named grounds and text selectors', () => {
  const permitted = [
    ".imprint-band[data-stock='black']", ".imprint-band[data-stock='paper']", '.provenance',
    ":where(.register) [data-voice='amber']", '.inhand-note', '.staleness',
    ".fixture-status[data-voice='amber'], .fixture-score[data-voice='amber']",
    ".stadium-clock[data-voice='amber'], .fixture-unset",
    ".matchday-line[data-voice='amber']", ".next-card .stadium-clock[data-voice='amber']",
  ]
  const rules = [...read('shell.css').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  const painted = rules.filter(([, , body]) => /var\(--(?:fb|band)-amber\)/.test(body!))
    .map(([, selector]) => selector!.trim().replace(/\s+/g, ' '))
  expect(painted).toEqual(permitted)
})

