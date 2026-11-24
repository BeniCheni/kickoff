import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { posix } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { classifyTier, main, matchesPath, parseTier3Rules, type ChangedFile, type PullRequestFacts } from '../scripts/tier'

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

  it('pins the number of distinct path entries and checks each against tracked files', () => {
    const section = agents.split(`\n${heading}\n`)[1]!
    const introduction = section.split(/^-/m)[0]!
    expect([...introduction.matchAll(/`([^`\r\n]+)`/g)].map((match) => match[1])).toEqual(['**', '*'])
    const entries = parseTier3Rules(agents).filter(({ marker }) => !marker).map(({ path }) => path)
    expect(entries).toHaveLength(94)
    expect(new Set(entries).size).toBe(entries.length)
    const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: new URL('..', import.meta.url), encoding: 'utf8' }).split('\0')
    for (const entry of entries) {
      expect(tracked.some((path) => matchesPath(path, entry)), entry).toBe(true)
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
    ['tests/fixtures/tier/369.json', 'tests/fixtures/tier/**'],
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

  it('matches Git path case consistently, including inside globs', () => {
    expect(classifyTier(agents, [change('scripts/SYNC-tool.ts')], human).tier).toBe(2)
    expect(classifyTier(agents, [change('Scripts/sync-tool.ts')], human).tier).toBe(2)
    expect(classifyTier(agents, [change('scripts/.sync-tool.ts')], human).tier).toBe(3)
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
    ['README.md', '-[![version](https://img.shields.io/badge/version-1.2.3)](CHANGELOG.md)', 'badge/version-'],
    ['README.md', '-## ⏱️ What it does today (v1.2.3)', 'What it does today (vX.Y.Z)'],
    ['README.md', '+- **v1.2.3** — an edited release entry', '- **vX.Y.Z**'],
    ['CHANGELOG.md', '+## [1.2.3] — release date', '## [X.Y.Z]'],
    ['CHANGELOG.md', '+## [1.2.3-rc.1+build]', '## [X.Y.Z]'],
    ['CHANGELOG.md', '+## [1.2.3](url)', '## [X.Y.Z]'],
    ['CHANGELOG.md', '+##  [1.2.3]', '## [X.Y.Z]'],
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
    const prose = '+++ b/badge/version-1.2.3\n' + patch(' ## ⏱️ What it does today (v1.2.3)',
      ' [![version](https://img.shields.io/badge/version-1.2.3)](CHANGELOG.md)', '+Ordinary prose')
    expect(classifyTier(agents, [change('README.md', prose)], human).tier).toBe(1)
    expect(classifyTier(agents, [change('CHANGELOG.md', patch('-## [1.2.3]'))], human).tier).toBe(2)
  })

  it.each([['README.md', 'docs/old.md'], ['docs/old.md', 'README.md'], ['CHANGELOG.md', 'docs/old.md']])(
    'takes Tier 3 when a content-scoped file is renamed (%s to %s)', (previous_filename, filename) => {
      const rename = { filename, previous_filename, status: 'renamed', patch: patch('+Ordinary prose') }
      expect(classifyTier(agents, [rename], human).tier).toBe(3)
    },
  )

  const changelogAfter = '## [Unreleased]\n\n- New entry\n\n## [1.2.3]\n\n- Released entry\n'
  const changelogEdit = (patch: string, additions: number, deletions: number): ChangedFile => ({
    ...change('CHANGELOG.md', patch), changelogAfter, additions, deletions,
  })

  it('keeps an Unreleased edit at the tier set by the other files, with Tier 2 as the default', () => {
    const unreleased = changelogEdit('@@ -3 +3 @@\n-- Old entry\n+- New entry', 1, 1)
    expect(classifyTier(agents, [unreleased], human).tier).toBe(2)
    expect(classifyTier(agents, [unreleased, change('docs/guide.md')], human).tier).toBe(1)
  })

  it('allows a pure deletion at the end of Unreleased', () => {
    const unreleased = changelogEdit('@@ -5 +4,0 @@\n-- Removed entry', 0, 1)
    expect(classifyTier(agents, [unreleased, change('docs/guide.md')], human).tier).toBe(1)
  })

  it.each([
    ['a released rewrite', changelogEdit('@@ -7 +7 @@\n-- Old released entry\n+- Released entry', 1, 1)],
    ['a removed release heading', changelogEdit('@@ -5 +4,0 @@\n-## [1.1.0]', 0, 1)],
    ['edits in both sections', changelogEdit('@@ -3 +3 @@\n-- Old\n+- New entry\n@@ -7 +7 @@\n-- Old\n+- Released entry', 2, 2)],
    ['a patch with missing additions', changelogEdit('@@ -3 +3 @@\n+- New entry', 2, 0)],
    ['a patch that does not match the blob', changelogEdit('@@ -3 +3 @@\n+- A different entry', 1, 0)],
    ['an added changelog', { ...changelogEdit('@@ -0,0 +3 @@\n+- New entry', 1, 0), status: 'added' }],
    ['a removed changelog', { ...changelogEdit('@@ -3 +2,0 @@\n-- Old', 0, 1), status: 'removed' }],
  ])('keeps %s at Tier 2 beside docs', (_, changelog) => {
    expect(classifyTier(agents, [changelog, change('docs/guide.md')], human).tier).toBe(2)
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

  it('does not classify an empty scheduled PR as Tier 0', () => {
    expect(classifyTier(agents, [], scheduled).tier).toBe(2)
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

  it('keeps a rename from a code path into docs at Tier 2', () => {
    expect(classifyTier(agents, [{ filename: 'docs/app.md', previous_filename: 'src/app.ts', status: 'renamed' }], human).tier)
      .toBe(2)
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

describe('tier workflow trust boundary', () => {
  it('runs only the default-branch script with no PR checkout, dependency install or build', () => {
    const workflow = readFileSync(new URL('../.github/workflows/tier.yml', import.meta.url), 'utf8')
    expect(workflow).toMatch(/\non:\n  pull_request_target:\n    types: \[opened, synchronize, reopened, ready_for_review\]\n/)
    const steps = workflow.split('\n    steps:\n')[1]?.replace(/^ *#.*\n/gm, '')
    expect(steps).toBe(
      '      - uses: actions/checkout@v7\n' +
      '        with:\n' +
      '          persist-credentials: false\n' +
      '      - uses: actions/setup-node@v7\n' +
      '        with:\n' +
      '          node-version: 24\n' +
      '          package-manager-cache: false\n' +
      '      - name: Compute and label the review tier\n' +
      '        env:\n' +
      '          GH_TOKEN: ${{ github.token }}\n' +
      '        run: node scripts/tier.ts\n',
    )
    expect(workflow.match(/\$\{\{[^}]+\}\}/g)).toEqual(['${{ github.event.pull_request.number }}', '${{ github.token }}'])
    const script = readFileSync(new URL('../scripts/tier.ts', import.meta.url), 'utf8')
    expect([...script.matchAll(/^import .+ from '([^']+)'$/gm)].map((match) => match[1]))
      .toEqual(['node:child_process', 'node:fs', 'node:url'])
  })
})

describe('tier labeler entry point', () => {
  const repo = 'repos/owner/repo'
  const pull = `${repo}/pulls/382`
  const issue = `${repo}/issues/382`
  const page = (endpoint: string) => ['--paginate', '--slurp', `${endpoint}?per_page=100`]
  const add = ['--method', 'POST', `${issue}/labels`, '-f', 'labels[]=tier-3']
  const remove = ['--method', 'DELETE', `${issue}/labels/tier-1`]
  const label = (name: string) => ({ name })
  const time = '2026-11-24T18:40:00Z'
  const event = (id: number, name: string, actor: string, event = 'labeled', created_at = time) =>
    ({ id, event, label: label(name), actor: { login: actor }, created_at })

  it('runs the Node entry point when the script path crosses a symlink', () => {
    const dir = mkdtempSync(`${tmpdir()}/kickoff-tier-cli-`)
    try {
      symlinkSync(fileURLToPath(new URL('../scripts', import.meta.url)), `${dir}/scripts`, 'dir')
      const result = spawnSync(process.execPath, [`${dir}/scripts/tier.ts`], {
        env: { ...process.env, GITHUB_EVENT_PATH: '' }, encoding: 'utf8',
      })
      expect(result.status).toBe(1)
      expect(result.stderr).toContain('Run the tier labeler in a GitHub pull_request_target workflow')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  function run(overrides: {
    files?: ChangedFile[]
    labels?: string[]
    inventory?: string[]
    updated?: string[]
    events?: ReturnType<typeof event>[][]
    fork?: boolean
    failure?: 'POST' | 'DELETE'
    nextHead?: string
    changedFiles?: number
    changelogBlob?: string
  } = {}) {
    const {
      files = [change('scripts/tier.ts')], labels = [], inventory = ['tier-1', 'tier-2', 'tier-3'],
      updated = [...labels, 'tier-3'], events = [[]], fork = false, failure, nextHead = 'head',
      changedFiles = files.length, changelogBlob,
    } = overrides
    const dir = mkdtempSync(`${tmpdir()}/kickoff-tier-test-`)
    const env = {
      GITHUB_EVENT_PATH: `${dir}/event.json`, GITHUB_STEP_SUMMARY: `${dir}/summary.md`,
      GITHUB_REPOSITORY: 'owner/repo', GITHUB_SHA: 'default-branch-sha',
    }
    writeFileSync(env.GITHUB_EVENT_PATH, '{"number":382}')
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    let reads = 0
    const api = vi.fn((...args: string[]) => {
      if (args[0] === pull) return JSON.stringify({
        base: { sha: 'stale-base', repo: { id: 1 } },
        head: { sha: reads++ ? nextHead : 'head', ref: 'topic', repo: { id: fork ? 2 : 1 } },
        user: { login: 'someone' }, body: '**Tier 3.**', labels: labels.map(label), changed_files: changedFiles,
      })
      if (args[2] === page(`${pull}/files`)[2]) return JSON.stringify([files.slice(0, 1), files.slice(1)])
      if (args[2] === page(`${issue}/events`)[2]) return JSON.stringify(events)
      if (args[2] === page(`${repo}/labels`)[2]) return JSON.stringify([inventory.slice(0, 1).map(label), inventory.slice(1).map(label)])
      if (args[0] === '-H' && args[2] === `${repo}/git/blobs/${'a'.repeat(40)}` && changelogBlob) return changelogBlob
      if (failure && args[1] === failure) throw new Error(`${failure} failed`)
      if (args[1] === 'POST' && args[2] === `${issue}/labels`) return JSON.stringify(updated.map(label))
      if (args[1] === 'DELETE' && args[2]?.startsWith(`${issue}/labels/`)) return ''
      throw new Error(`Unexpected gh arguments: ${JSON.stringify(args)}`)
    })
    try {
      const error = failure ? `${failure} failed` : nextHead !== 'head' || changedFiles !== files.length
        ? 'The pull request base, head, or file list changed or is incomplete' : undefined
      if (error) expect(() => main(api, env)).toThrow(error)
      else main(api, env)
      const calls = api.mock.calls
      return { calls, writes: calls.filter(([arg]) => arg === '--method'), summary: readFileSync(env.GITHUB_STEP_SUMMARY, 'utf8') }
    } finally {
      log.mockRestore()
      rmSync(dir, { recursive: true, force: true })
    }
  }

  it('uses the checkout list and adds before deleting a lower tier', () => {
    const { calls, writes, summary } = run({ labels: ['tier-1'] })
    expect(calls).toEqual([[pull], page(`${pull}/files`), [pull], page(`${issue}/events`), page(`${repo}/labels`), add, remove])
    expect(writes).toEqual([add, remove])
    expect(summary).toContain('Tier 3 list from commit ` default-branch-sha `.')
    expect(summary).toContain('` scripts/tier.ts ` — ` Tier 3 path scripts/tier.ts `')
    expect(summary).toContain('PR body names **Tier 3**.')
  })

  it('keeps a higher tier without writing and ignores lookalike labels', () => {
    const { writes, summary } = run({ files: [change('docs/guide.md')], labels: ['tier-3', 'tier-9', 'tier-3-pending', 'Tier-1'] })
    expect(writes).toEqual([])
    expect(summary).toContain('Kept higher label `tier-3` (computed `tier-1`).')
  })

  it('reconciles two labels and leaves the highest one', () => {
    expect(run({ labels: ['tier-1', 'tier-3'] }).writes).toEqual([remove])
  })

  it('uses the label response to keep a higher tier applied while the job was running', () => {
    const { writes } = run({ files: [change('src/app.ts')], labels: ['tier-1'], updated: ['tier-1', 'tier-2', 'tier-3'] })
    expect(writes).toEqual([
      ['--method', 'POST', `${issue}/labels`, '-f', 'labels[]=tier-2'],
      ['--method', 'DELETE', `${issue}/labels/tier-2`],
      remove,
    ])
  })

  it('reports a missing repository label without mutating the PR', () => {
    const { writes, summary } = run({ labels: ['tier-1'], inventory: ['tier-1'] })
    expect(writes).toEqual([])
    expect(summary).toContain('Repository label `tier-3` is missing. Existing labels were left in place.')
  })

  it('keeps forks summary-only without reading label history or inventory', () => {
    const { calls, summary } = run({ fork: true })
    expect(calls).toEqual([[pull], page(`${pull}/files`), [pull]])
    expect(summary).toContain('Fork PR. Summary only.')
  })

  it('makes no delete attempt if the add fails', () => {
    const { writes, summary } = run({ labels: ['tier-1'], failure: 'POST' })
    expect(writes).toEqual([add])
    expect(summary).toContain('Labeler error: ` POST failed `')
  })

  it('makes a failed delete visible after the successful add', () => {
    const { writes, summary } = run({ labels: ['tier-1'], failure: 'DELETE' })
    expect(writes).toEqual([add, remove])
    expect(summary).toContain('Labeler error: ` DELETE failed `')
  })

  it('honors the latest manual tier event across pages, ignoring unrelated and older events', () => {
    const { writes, summary } = run({ labels: ['tier-2'], events: [
      [event(1, 'tier-3', 'github-actions[bot]'), event(2, 'tier-3', 'beni', 'unlabeled')],
      [event(3, 'tier-2', 'beni'), event(4, 'docs', 'github-actions[bot]'),
        event(5, 'tier-3', 'github-actions[bot]', 'labeled', '2026-11-24T18:39:59Z')],
    ] })
    expect(writes).toEqual([])
    expect(summary).toContain('Manual tier change by ` beni ` at ` 2026-11-24T18:40:00Z `')
    expect(summary).toContain('Kept ` tier-2 ` (computed `tier-3`).')
  })

  it('keeps a PR unlabelled if a person removed the last tier label', () => {
    const { writes, summary } = run({ events: [[event(2, 'tier-1', 'beni', 'unlabeled')]] })
    expect(writes).toEqual([])
    expect(summary).toContain('unlabeled ` tier-1 `). Kept no tier label (computed `tier-3`).')
  })

  it('uses automatic labelling when the latest tier event was the workflow bot', () => {
    const { writes } = run({ labels: ['tier-1'], events: [[event(2, 'tier-1', 'github-actions[bot]'), event(1, 'tier-1', 'beni')]] })
    expect(writes).toEqual([add, remove])
  })

  it('reads only the changed changelog blob and uses it as text for Unreleased edits', () => {
    const files = [change('docs/guide.md'), {
      ...change('CHANGELOG.md', '@@ -2 +2 @@\n+- New entry'), sha: 'a'.repeat(40), additions: 1, deletions: 0,
    }]
    const { calls, summary } = run({ files, changelogBlob: '## [Unreleased]\n- New entry\n## [1.2.3]\n', fork: true })
    expect(calls).toContainEqual(['-H', 'Accept: application/vnd.github.raw+json', `${repo}/git/blobs/${'a'.repeat(40)}`])
    expect(summary).toContain('Computed **Tier 1**.')
  })

  it('prints PR paths literally without Markdown links, images, HTML or workflow commands', () => {
    const filename = 'docs/[click here](https://example.com/x) ![img](https://example.com/x) <b> ``\n::warning::.md'
    const { summary } = run({ files: [change(filename)], fork: true })
    expect(summary).toContain('``` docs/[click here](https://example.com/x) ![img](https://example.com/x) <b> ``\\n::warning::.md ```')
    expect(summary).not.toMatch(/^::warning::/m)
  })

  it.each([{ nextHead: 'advanced' }, { changedFiles: 2 }])('leaves labels alone when the PR read is inconsistent (%j)', (scenario) => {
    const { calls, summary } = run(scenario)
    expect(calls).toEqual([[pull], page(`${pull}/files`), [pull]])
    expect(summary).toContain('Labeler error:')
  })
})
