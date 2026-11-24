import { execFileSync } from 'node:child_process'
import { appendFileSync, readFileSync, realpathSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

type Tier = 0 | 1 | 2 | 3

// Keep the files endpoint's field names so recorded responses can be replayed directly.
export type ChangedFile = {
  filename: string
  previous_filename?: string
  status: string
  patch?: string
  additions?: number
  deletions?: number
  sha?: string
  changelogAfter?: string
}

export type PullRequestFacts = {
  headRef: string
  authorLogin: string
  sameRepo: boolean
}

type TierReason = { file: string; rule: string }
type TierResult = { tier: Tier; reasons: TierReason[] }

const releaseHeading = '## [X.Y.Z]'
const badge = 'badge/version-'
const readmeHeading = 'What it does today (vX.Y.Z)'
const lineage = '- **vX.Y.Z**'
const changelog = 'CHANGELOG.md'
const readme = 'README.md'
const contentProse = [releaseHeading, badge, readmeHeading, lineage, '[Unreleased]']

const contentRules = [
  { path: changelog, marker: releaseHeading, matches: (line: string) => /^\+ {0,3}##[ \t]+\[\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?\](?:[\s(]|$)/.test(line) },
  { path: readme, marker: badge, matches: (line: string) => line.includes(badge) },
  { path: readme, marker: readmeHeading, matches: (line: string) => /^[+-]#{1,6} .*What it does today \(v\d+\.\d+\.\d+\)\s*$/.test(line) },
  { path: readme, marker: lineage, matches: (line: string) => /^[+-]- \*\*v\d+\.\d+\.\d+\*\*/.test(line) },
]
type Tier3Rule = { path: string; marker?: string; matches?: (line: string) => boolean }

export function parseTier3Rules(agents: string): Tier3Rule[] {
  const heading = /^### Tier 3 paths[ \t]*\r?$/m.exec(agents)
  if (!heading) throw new Error('AGENTS.md is missing the ### Tier 3 paths heading')
  const section = agents.slice(heading.index + heading[0].length).split(/^#{1,3}[ \t]/m)[0] ?? ''
  const bullets = section.split(/(?=^[ \t]*(?:[-*+]|\d+[.)])[ \t]+)/m).slice(1)
  const rules = bullets.flatMap((bullet): Tier3Rule[] => {
    const tokens = [...bullet.matchAll(/`([^`\r\n]+)`/g)].map((match) => match[1]!)
    const scoped = contentRules.filter(({ path, marker }) => tokens.includes(path) &&
      (tokens.includes(marker) || (marker === lineage && /\blist under Lineage\b/.test(bullet))))
    // The Step 0 bullet also quotes URL query parameters in its label.
    const paths = tokens.filter((token) => !/^[?&][\w-]+=$/.test(token) &&
      !contentProse.includes(token) && !scoped.some(({ path }) => path === token))
    return [...paths.map((path) => ({ path })), ...scoped]
  })
  if (rules.length === 0) throw new Error('AGENTS.md has zero entries under ### Tier 3 paths')
  return rules
}

export function matchesPath(path: string, pattern: string): boolean {
  if (!pattern.includes('*')) return path === pattern
  // Use the policy's case-sensitive, root-anchored stars on every platform.
  const expression = pattern.replace(/\*\*\/|\*\*|\*|[\\^$+?.()|{}\[\]]/g, (token) => {
    if (token === '**/') return '(?:[^/]+/)*'
    if (token === '**') return '[\\s\\S]*'
    if (token === '*') return '[^/]*'
    return `\\${token}`
  })
  return new RegExp(`^${expression}(?![\\s\\S])`).test(path)
}

function pathsOf(file: ChangedFile): string[] {
  if (file.status === 'renamed' && file.previous_filename) return [file.filename, file.previous_filename]
  return [file.filename]
}

function tier3Reason(file: ChangedFile, paths: string[], rules: Tier3Rule[]): TierReason | undefined {
  let changedLines: string[] | undefined
  for (const rule of rules) {
    const path = paths.find((path) => matchesPath(path, rule.path))
    if (!path) continue
    if (!rule.matches) return { file: path, rule: `Tier 3 path ${rule.path}` }
    if (file.status === 'renamed') return { file: path, rule: 'Tier 3 release and numbering file renamed' }
    if (!file.patch) return { file: path, rule: 'Tier 3 release and numbering rule (patch unavailable)' }
    // Only look inside unified diff hunks, where +/- mark changes rather than file headers.
    if (!changedLines) {
      const lines = file.patch.split(/\r?\n/)
      const firstHunk = lines.findIndex((line) => line.startsWith('@@ '))
      if (firstHunk < 0) return { file: path, rule: 'Tier 3 release and numbering rule (patch unavailable)' }
      changedLines = lines.slice(firstHunk + 1).filter((line) => /^[+-]/.test(line))
    }
    if (changedLines.some(rule.matches)) return { file: path, rule: `Tier 3 release and numbering rule (${rule.marker})` }
  }
}

function unreleasedOnly(file: ChangedFile): boolean {
  if (file.status !== 'modified' || !file.patch || !file.changelogAfter) return false
  const after = file.changelogAfter.split(/\r?\n/)
  const start = after.findIndex((line) => /^ {0,3}##[ \t]+\[Unreleased\](?:[\s(]|$)/.test(line))
  if (start < 0) return false
  const sectionHeading = /^ {0,3}#{1,2}(?:[ \t]|$)/
  const nextHeading = after.findIndex((line, index) => index > start && sectionHeading.test(line))
  const end = nextHeading < 0 ? after.length : nextHeading
  let index = -1
  let additions = 0
  let deletions = 0
  // New-side hunk coordinates refer to this exact blob. A deletion is at the
  // gap before the next new-side line and must leave section headings intact.
  for (const line of file.patch.split(/\r?\n/)) {
    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(line)
    if (hunk) {
      index = Number(hunk[1]) - (hunk[2] === '0' ? 0 : 1)
    } else if (index >= 0 && line.startsWith('-')) {
      if (index <= start || index > end || sectionHeading.test(line.slice(1))) return false
      deletions++
    } else if (index >= 0 && (line.startsWith('+') || line.startsWith(' '))) {
      if (after[index] !== line.slice(1)) return false
      if (line.startsWith('+')) {
        if (index <= start || index >= end || sectionHeading.test(line.slice(1))) return false
        additions++
      }
      index++
    }
  }
  return additions + deletions > 0 && additions === file.additions && deletions === file.deletions
}

export function classifyTier(agents: string, files: readonly ChangedFile[], facts: PullRequestFacts): TierResult {
  const rules = parseTier3Rules(agents)
  const changes = files.map((file) => ({ file, paths: pathsOf(file) }))
  if (facts.sameRepo && facts.headRef === 'sync/scheduled' && facts.authorLogin === 'github-actions[bot]' &&
      changes.length > 0 && changes.every(({ paths }) => paths.every((path) =>
        path.startsWith('src/data/') || path === 'docs/sync-digest.md'))) {
    return { tier: 0, reasons: changes.map(({ file }) => ({ file: file.filename, rule: 'Tier 0 scheduled sync exception' })) }
  }

  const reasons: Record<1 | 2 | 3, TierReason[]> = { 1: [], 2: [], 3: [] }
  const inherited: TierReason[] = []
  for (const { file, paths } of changes) {
    const sensitive = tier3Reason(file, paths, rules)
    if (sensitive) reasons[3].push(sensitive)
    else if (paths.every((path) => path === readme || /^docs\/.+\.md$/i.test(path))) {
      reasons[1].push({ file: file.filename, rule: 'Tier 1 Markdown documentation' })
    } else if (file.filename === changelog && rules.some(({ marker }) => marker === releaseHeading) && unreleasedOnly(file)) {
      inherited.push({ file: file.filename, rule: 'Tier 2 default for a standalone Unreleased edit' })
    } else {
      reasons[2].push({ file: file.filename, rule: 'Tier 2 default' })
    }
  }
  for (const tier of [3, 2, 1] as const) {
    if (reasons[tier].length > 0) return { tier, reasons: reasons[tier] }
  }
  return { tier: 2, reasons: inherited }
}

type GitHubRef = { ref: string; sha: string; repo: { id: number } | null }
type Label = { name: string }
type IssueEvent = {
  id: number
  event: string
  label?: Label
  actor: { login: string } | null
  created_at: string
}
type GitHubPr = {
  base: GitHubRef
  head: GitHubRef
  user: { login: string }
  body: string | null
  labels: Label[]
  changed_files: number
}

function gh(...args: string[]): string {
  return execFileSync('gh', ['api', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
}

function readPages<T>(api: typeof gh, endpoint: string): T[] {
  const pages: T[][] = JSON.parse(api('--paginate', '--slurp', `${endpoint}?per_page=100`))
  return pages.flat()
}

const tierLabel = /^tier-[0-3]$/

function tierLabels(labels: Label[]): Label[] {
  return labels.filter(({ name }) => tierLabel.test(name)).sort((a, b) => b.name.localeCompare(a.name))
}

function applyTierLabel(api: typeof gh, repo: string, number: number, tier: Tier, labels: Label[]): string {
  const issue = `repos/${repo}/issues/${number}`
  const endpoint = `${issue}/labels`
  const computed = `tier-${tier}`
  let current = tierLabels(labels)
  const [lastChange] = readPages<IssueEvent>(api, `${issue}/events`)
    .filter(({ event, label }) => (event === 'labeled' || event === 'unlabeled') && label && tierLabel.test(label.name))
    .sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id)
  if (lastChange && lastChange.actor?.login !== 'github-actions[bot]') {
    const kept = current.map(({ name }) => inlineCode(name)).join(', ') || 'no tier label'
    const actor = inlineCode(lastChange.actor?.login ?? 'unknown actor')
    return `Manual tier change by ${actor} at ${inlineCode(lastChange.created_at)} ` +
      `(${lastChange.event} ${inlineCode(lastChange.label!.name)}). Kept ${kept} (computed \`${computed}\`).`
  }

  const existing = current[0]
  if (!existing || existing.name < computed) {
    if (!readPages<Label>(api, `repos/${repo}/labels`).some(({ name }) => name === computed)) {
      return `Repository label \`${computed}\` is missing. Existing labels were left in place.`
    }
    // Add first so an API failure leaves the previous tier visible. Use the returned
    // labels to account for a reviewer raising the tier while the job was running.
    const updated: Label[] = JSON.parse(api('--method', 'POST', endpoint, '-f', `labels[]=${computed}`))
    if (!updated.some(({ name }) => name === computed)) throw new Error(`GitHub did not apply ${computed}`)
    current = tierLabels(updated)
  }
  const [highest, ...obsolete] = current
  for (const { name } of obsolete) api('--method', 'DELETE', `${endpoint}/${name}`)
  return highest && highest.name > computed
    ? `Kept higher label \`${highest.name}\` (computed \`${computed}\`).`
    : `PR label: \`${computed}\`.`
}

function inlineCode(value: string): string {
  const literal = value.replaceAll('\r', '\\r').replaceAll('\n', '\\n')
  const longest = [...literal.matchAll(/`+/g)].reduce((max, [run]) => Math.max(max, run.length), 0)
  const delimiter = '`'.repeat(longest + 1)
  return `${delimiter} ${literal} ${delimiter}`
}

export function main(api: typeof gh = gh, env: NodeJS.ProcessEnv = process.env): void {
  const { GITHUB_EVENT_PATH, GITHUB_REPOSITORY, GITHUB_STEP_SUMMARY, GITHUB_SHA } = env
  if (!GITHUB_EVENT_PATH || !GITHUB_REPOSITORY || !GITHUB_STEP_SUMMARY || !GITHUB_SHA) {
    throw new Error('Run the tier labeler in a GitHub pull_request_target workflow')
  }
  const summary = ['## Review tier', '']
  try {
    const { number } = JSON.parse(readFileSync(GITHUB_EVENT_PATH, 'utf8')) as { number: number }
    if (!Number.isSafeInteger(number) || number < 1) throw new Error('Invalid pull request number')
    const repo = GITHUB_REPOSITORY
    const endpoint = `repos/${repo}/pulls/${number}`
    // The workflow leaves checkout at the event SHA on the default branch.
    // PR data stays in memory and never supplies a script, local path or command.
    const agents = readFileSync(new URL('../AGENTS.md', import.meta.url), 'utf8')
    summary.push(`Tier 3 list from commit ${inlineCode(GITHUB_SHA)}.`, '')
    const pr: GitHubPr = JSON.parse(api(endpoint))
    const files = readPages<ChangedFile>(api, `${endpoint}/files`)
    const changelogFile = files.find((file) => file.filename === changelog && file.status === 'modified')
    if (changelogFile?.patch && /^[a-f0-9]{40}$/.test(changelogFile.sha ?? '')) {
      changelogFile.changelogAfter = api('-H', 'Accept: application/vnd.github.raw+json',
        `repos/${repo}/git/blobs/${changelogFile.sha}`)
    }
    const latest: GitHubPr = JSON.parse(api(endpoint))
    if (pr.head.sha !== latest.head.sha || pr.base.sha !== latest.base.sha || files.length !== latest.changed_files) {
      throw new Error('The pull request base, head, or file list changed or is incomplete')
    }
    const facts = {
      headRef: latest.head.ref,
      authorLogin: latest.user.login,
      sameRepo: latest.head.repo !== null && latest.head.repo.id === latest.base.repo?.id,
    }
    const { tier, reasons } = classifyTier(agents, files, facts)
    summary.push(`Computed **Tier ${tier}**.`, '')
    for (const { file, rule } of reasons) summary.push(`- ${inlineCode(file)} — ${inlineCode(rule)}`)
    if (reasons.length === 0) summary.push('- Tier 2 default for an empty file list.')
    const declared = latest.body?.match(/^[ \t#>*-]*(?:Review[ \t]+)?Tier[*:]*[ \t]+(?:\**Tier[ \t]+)?\**([0-3])\b/im)?.[1]
    if (declared !== undefined) summary.push('', `PR body names **Tier ${declared}**.`)
    const label = facts.sameRepo ? applyTierLabel(api, repo, number, tier, latest.labels) : 'Fork PR. Summary only.'
    summary.push('', label)
  } catch (error) {
    summary.push('', `Labeler error: ${inlineCode(error instanceof Error ? error.message : String(error))}`)
    throw error
  } finally {
    appendFileSync(GITHUB_STEP_SUMMARY, `${summary.join('\n')}\n`)
    console.log(summary.join('\n'))
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) main()
