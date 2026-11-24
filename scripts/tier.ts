import { execFileSync } from 'node:child_process'
import { appendFileSync, readFileSync } from 'node:fs'
import { posix } from 'node:path'
import { pathToFileURL } from 'node:url'

type Tier = 0 | 1 | 2 | 3

// Keep the files endpoint's field names so recorded responses can be replayed directly.
export type ChangedFile = {
  filename: string
  previous_filename?: string
  status: string
  patch?: string
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
  { path: changelog, marker: releaseHeading, matches: (line: string) => /^\+## \[\d+\.\d+\.\d+\](?:\s|$)/.test(line) },
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

function matchesPath(path: string, pattern: string): boolean {
  if (!/[*?[]/.test(pattern)) return path === pattern
  // Node's matcher skips leading dots. Prefix each segment so its wildcards
  // also match hidden files, as gitignore does. Preserve globstar segments.
  const file = path.split('/').map((segment) => `x${segment}`).join('/')
  const glob = pattern.split('/').map((segment) => segment === '**' ? segment : `x${segment}`).join('/')
  return posix.matchesGlob(file, glob)
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
    } else if (file.status === 'modified' && file.filename === changelog && rules.some(({ marker }) => marker === releaseHeading)) {
      // The release rule lets an Unreleased edit inherit the tier set by the other changes.
      inherited.push({ file: file.filename, rule: 'Tier 2 default for a standalone changelog edit without a released heading' })
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

function readPages<T>(endpoint: string): T[] {
  const pages: T[][] = JSON.parse(gh('--paginate', '--slurp', `${endpoint}?per_page=100`))
  return pages.flat()
}

function tierLabels(labels: Label[]): Label[] {
  return labels.filter(({ name }) => /^tier-[0-3]$/.test(name)).sort((a, b) => b.name.localeCompare(a.name))
}

function applyTierLabel(repo: string, number: number, tier: Tier, labels: Label[]): string {
  const endpoint = `repos/${repo}/issues/${number}/labels`
  const computed = `tier-${tier}`
  let current = tierLabels(labels)
  const existing = current[0]
  if (!existing || existing.name < computed) {
    if (!readPages<Label>(`repos/${repo}/labels`).some(({ name }) => name === computed)) {
      return `Repository label \`${computed}\` is missing. Existing labels were left in place.`
    }
    // Add first so an API failure leaves the previous tier visible. Use the returned
    // labels to account for a reviewer raising the tier while the job was running.
    const updated: Label[] = JSON.parse(gh('--method', 'POST', endpoint, '-f', `labels[]=${computed}`))
    if (!updated.some(({ name }) => name === computed)) throw new Error(`GitHub did not apply ${computed}`)
    current = tierLabels(updated)
  }
  const [highest, ...obsolete] = current
  for (const { name } of obsolete) gh('--method', 'DELETE', `${endpoint}/${name}`)
  return highest && highest.name > computed
    ? `Kept higher label \`${highest.name}\` (computed \`${computed}\`).`
    : `PR label: \`${computed}\`.`
}

function inlineCode(value: string): string {
  const escaped = value.replace(/[&<>\r\n]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\r': '\\r', '\n': '\\n' })[char]!)
  return `<code>${escaped}</code>`
}

function main(): void {
  const { GITHUB_EVENT_PATH, GITHUB_REPOSITORY, GITHUB_STEP_SUMMARY } = process.env
  if (!GITHUB_EVENT_PATH || !GITHUB_REPOSITORY || !GITHUB_STEP_SUMMARY) {
    throw new Error('Run the tier labeler in a GitHub pull_request workflow')
  }
  const summary = ['## Review tier', '']
  try {
    const { number } = JSON.parse(readFileSync(GITHUB_EVENT_PATH, 'utf8')) as { number: number }
    const repo = GITHUB_REPOSITORY
    const endpoint = `repos/${repo}/pulls/${number}`
    const pr: GitHubPr = JSON.parse(gh(endpoint))
    const agents = gh('-H', 'Accept: application/vnd.github.raw+json', `repos/${repo}/contents/AGENTS.md?ref=${pr.base.sha}`)
    const files = readPages<ChangedFile>(`${endpoint}/files`)
    const latest: GitHubPr = JSON.parse(gh(endpoint))
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
    const label = facts.sameRepo ? applyTierLabel(repo, number, tier, latest.labels) : 'Fork PR. Summary only.'
    summary.push('', label)
  } catch (error) {
    summary.push('', `Labeler error: ${inlineCode(error instanceof Error ? error.message : String(error))}`)
    throw error
  } finally {
    appendFileSync(GITHUB_STEP_SUMMARY, `${summary.join('\n')}\n`)
    console.log(summary.join('\n'))
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
