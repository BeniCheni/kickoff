import { readFileSync } from 'node:fs'
import { posix } from 'node:path'
import { describe, expect, it } from 'vitest'
import { classifyTier, parseTier3Rules, type ChangedFile, type PullRequestFacts } from '../scripts/tier'

const heading = '### Tier 3 paths'
const agents = readFileSync(new URL('../AGENTS.md', import.meta.url), 'utf8')
const human: PullRequestFacts = { headRef: 'topic', authorLogin: 'someone', sameRepo: true }
const scheduled: PullRequestFacts = { headRef: 'sync/scheduled', authorLogin: 'github-actions[bot]', sameRepo: true }
const change = (filename: string, patch?: string): ChangedFile => ({ filename, status: 'modified', patch })
const patch = (...lines: string[]) => ['@@ -1,3 +1,4 @@', ...lines].join('\n')

describe('Tier 3 list', () => {
  it('requires the heading and at least one entry', () => {
    expect(() => parseTier3Rules('## Agent instructions')).toThrow('missing the ### Tier 3 paths heading')
    expect(() => parseTier3Rules(`${heading}\n\n- No entries.\n\n### Unrelated\n- \`other.ts\``))
      .toThrow('zero entries under ### Tier 3 paths')
  })

  it('reads bullet entries and skips examples, URL parameters, and the next section', () => {
    const policy = `\`AGENTS.md\`\n${heading}\n\nFor example \`scripts/*\`.\n\n` +
      '- **Contract (`?example=`):** `src/example.ts`.\n  * Supporting code: `src/helpers/**`.\n' +
      '## Other instructions\n- `tests/outside.test.ts`'
    expect(parseTier3Rules(policy)).toEqual([{ path: 'src/example.ts' }, { path: 'src/helpers/**' }])
    expect(classifyTier(policy, [change('scripts/unlisted.ts')], human).tier).toBe(2)
  })

  it('takes at least one rule from every bullet or its nested bullets in AGENTS.md', () => {
    const section = agents.split(`\n${heading}\n`)[1]?.split(/\n#{1,3} /)[0] ?? ''
    const bullets = [...section.matchAll(/^([ \t]*)(?:[-*+]|\d+[.)])[ \t]+(.*)$/gm)]
    expect(bullets.length).toBeGreaterThan(0)
    for (const [index, bullet] of bullets.entries()) {
      const level = bullet[1]!.length
      const end = bullets.slice(index + 1).find((candidate) => candidate[1]!.length <= level)?.index
      const subtree = section.slice(bullet.index, end)
      expect(parseTier3Rules(`${heading}\n${subtree}`).length, bullet[2]).toBeGreaterThan(0)
    }
  })

  it('agrees with Node glob matching on each path entry for ordinary filenames', () => {
    for (const { path, marker } of parseTier3Rules(agents)) {
      if (marker) continue
      const filename = path.replaceAll('**', 'nested/example/file.ts').replaceAll('*', 'example')
      const policy = `${heading}\n- \`${path}\``
      for (const name of [filename, `other/${filename}`, `${filename}.extra`]) {
        expect(classifyTier(policy, [change(name)], human).tier === 3, `${path} against ${name}`)
          .toBe(posix.matchesGlob(name, path))
      }
    }
  })
})

describe('review tier', () => {
  it.each([
    ['src/data/nested/record.json', 'src/data/**'],
    ['src/data/.private/record.json', 'src/data/**'],
    ['.github/workflows/.example.yml', '.github/workflows/**'],
    ['scripts/.sync.ts', 'scripts/*sync*'],
    ['AGENTS.md', 'AGENTS.md'],
    ['scripts/tier.ts', 'scripts/tier.ts'],
    ['tests/tier.test.ts', 'tests/tier.test.ts'],
  ])('takes Tier 3 for %s', (filename, pattern) => {
    expect(classifyTier(agents, [change(filename)], human)).toEqual({
      tier: 3,
      reasons: [{ file: filename, rule: `Tier 3 path ${pattern}` }],
    })
  })

  it('keeps a single star within one path segment and anchors literal paths', () => {
    expect(classifyTier(agents, [change('scripts/nested/sync.ts'), change('docs/AGENTS.md')], human).tier).toBe(2)
    expect(classifyTier(agents, [change('docs/AGENTS.md')], human).tier).toBe(1)
  })

  it.each([
    ['AGENTS.md', 'docs/old.md'],
    ['docs/old.md', 'AGENTS.md'],
  ])('checks both paths of a rename (%s to %s)', (previous_filename, filename) => {
    const result = classifyTier(agents, [{ filename, previous_filename, status: 'renamed' }], human)
    expect(result).toEqual({ tier: 3, reasons: [{ file: 'AGENTS.md', rule: 'Tier 3 path AGENTS.md' }] })
  })

  it.each([
    ['README.md', '+[![version](https://img.shields.io/badge/version-1.2.3)](CHANGELOG.md)', 'badge/version-'],
    ['README.md', '-## ⏱️ What it does today (v1.2.3)', 'What it does today (vX.Y.Z)'],
    ['README.md', '+- **v1.2.3** — an edited release entry', '- **vX.Y.Z**'],
    ['CHANGELOG.md', '+## [1.2.3] — release date', '## [X.Y.Z]'],
  ])('checks changed release lines in %s (%s)', (filename, line, marker) => {
    expect(classifyTier(agents, [change(filename, patch(line))], human)).toEqual({
      tier: 3,
      reasons: [{ file: filename, rule: `Tier 3 release and numbering rule (${marker})` }],
    })
  })

  it.each(['README.md', 'CHANGELOG.md'])('takes Tier 3 when %s has no patch', (filename) => {
    expect(classifyTier(agents, [change(filename)], human)).toEqual({
      tier: 3,
      reasons: [{ file: filename, rule: 'Tier 3 release and numbering rule (patch unavailable)' }],
    })
  })

  it('ignores Git diff headers and unchanged release lines', () => {
    const prose = '+++ b/badge/version-1.2.3\n' + patch(' ## ⏱️ What it does today (v1.2.3)', '+Ordinary prose')
    expect(classifyTier(agents, [change('README.md', prose)], human).tier).toBe(1)
    expect(classifyTier(agents, [change('CHANGELOG.md', patch('-## [1.2.3]'))], human).tier).toBe(2)
  })

  it('keeps an Unreleased edit at the tier set by the other files, with Tier 2 as the default', () => {
    const unreleased = change('CHANGELOG.md', patch(' ## [Unreleased]', '+- New entry', ' ## [1.2.3]'))
    expect(classifyTier(agents, [unreleased], human).tier).toBe(2)
    expect(classifyTier(agents, [unreleased, change('docs/guide.md')], human).tier).toBe(1)
  })

  it('uses the given policy for all content-scoped rules', () => {
    const policy = `${heading}\n- \`AGENTS.md\``
    expect(classifyTier(policy, [change('README.md', patch('+- **v1.2.3** — release'))], human).tier).toBe(1)
    expect(classifyTier(policy, [change('CHANGELOG.md', patch('+## [1.2.3]'))], human).tier).toBe(2)
  })

  const sync = [change('src/data/nested/fixtures.json'), change('docs/sync-digest.md')]

  it('recognizes a same-repo scheduled sync from the bot', () => {
    expect(classifyTier(agents, sync, scheduled)).toEqual({
      tier: 0,
      reasons: sync.map(({ filename }) => ({ file: filename, rule: 'Tier 0 scheduled sync exception' })),
    })
  })

  it.each([
    ['fork', { sameRepo: false }],
    ['human author', { authorLogin: 'someone' }],
    ['other branch', { headRef: 'sync/other' }],
  ])('keeps sync paths at Tier 3 for a %s', (_, facts) => {
    expect(classifyTier(agents, sync, { ...scheduled, ...facts }).tier).toBe(3)
  })

  it('requires every sync path, including both sides of a rename, to be in scope', () => {
    const rename = { filename: 'src/data/copied.json', previous_filename: 'other.json', status: 'renamed' }
    expect(classifyTier(agents, [...sync, change('docs/extra.md')], scheduled).tier).toBe(3)
    expect(classifyTier(agents, [...sync, rename], scheduled).tier).toBe(3)
  })

  it('takes Tier 1 for Markdown under docs and ordinary README edits', () => {
    expect(classifyTier(agents, [change('docs/nested/guide.md'), change('README.md', patch('+Prose'))], human).tier).toBe(1)
  })

  it.each(['scripts/general.ts', 'docs/notes.txt', 'OTHER.md'])('defaults to Tier 2 for %s', (filename) => {
    expect(classifyTier(agents, [change(filename)], human).tier).toBe(2)
  })

  it('reports each file that sets the highest tier, independent of file order', () => {
    const files = [change('docs/guide.md'), change('AGENTS.md'), change('src/app.ts'), change('vite.config.ts')]
    const first = classifyTier(agents, files, human)
    expect(first.tier).toBe(3)
    expect(first.reasons.map(({ file }) => file)).toEqual(['AGENTS.md', 'vite.config.ts'])
    expect(classifyTier(agents, files.reverse(), human).reasons).toEqual([...first.reasons].reverse())
  })
})

// Captured from gh api pulls/{number} and paginated pulls/{number}/files.
// Keep all changed paths and the GitHub patches used by the content rules.
describe('recorded pull requests under the current tier policy', () => {
  it.each([[369, 3], [380, 1], [365, 2], [370, 3], [378, 0], [320, 3], [314, 1]])('#%i takes Tier %i', (number, tier) => {
    const fixture = new URL(`./fixtures/tier/${number}.json`, import.meta.url)
    const { files, facts } = JSON.parse(readFileSync(fixture, 'utf8')) as { files: ChangedFile[]; facts: PullRequestFacts }
    const result = classifyTier(agents, files, facts)
    expect(result.tier).toBe(tier)
    if (number === 370) expect(result.reasons).toContainEqual({ file: 'vite.config.ts', rule: 'Tier 3 path vite.config.ts' })
  })
})
