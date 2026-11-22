import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { z } from 'zod'
import { readPullRequest, type Author, type PullRequest } from './github'
import { callModel, failureLine, spawnClaude, type ModelRunner, type UntrustedBlock } from './model'
import { runCommand, type CommandRunner } from './process'

/**
 * `npx tsx scripts/pm/pass0.ts <PR number>` prints the Pass 0 skeleton for one PR: who wrote which
 * commit, which files changed, and the builder's checkable claims sealed for a cold reviewer.
 * Everything but the sealed appendix is plain code; the appendix is one tool-less model call.
 * `github.ts` reads the PR whole or refuses, so no table here can be a silent first page.
 */

export type Vendor = 'Claude' | 'Codex' | 'Cursor' | 'bot' | 'person'

/** By email, the identity each seat commits under (`CLAUDE.md`, "Commits may be authored by…"). */
export function vendorOf(author: Author): Vendor {
  const email = author.email.toLowerCase()
  if (email === 'noreply@anthropic.com') return 'Claude'
  if (email === 'noreply@openai.com') return 'Codex'
  if (email === 'cursoragent@cursor.com') return 'Cursor'
  if (email.includes('[bot]') || author.name.endsWith('[bot]')) return 'bot'
  return 'person'
}

export interface AuthorRow {
  vendor: Vendor
  name: string
  email: string
  /** Commits whose author this is: GitHub lists the commit's author first. */
  authored: number
  /** Commits that credit this identity in a Co-authored-by trailer without being their author. */
  coAuthored: number
}

export function authorshipRows(commits: PullRequest['commits']): AuthorRow[] {
  const rows = new Map<string, AuthorRow>()
  const row = (author: Author) => {
    const key = `${author.name}\u0000${author.email.toLowerCase()}`
    let found = rows.get(key)
    if (!found) {
      found = { vendor: vendorOf(author), name: author.name, email: author.email, authored: 0, coAuthored: 0 }
      rows.set(key, found)
    }
    return found
  }
  for (const commit of commits) {
    const [first, ...rest] = commit.authors
    if (!first) continue
    const firstRow = row(first)
    firstRow.authored++
    const credited = new Set<AuthorRow>([firstRow])
    for (const coAuthor of rest) {
      const coRow = row(coAuthor)
      if (credited.has(coRow)) continue
      credited.add(coRow)
      coRow.coAuthored++
    }
  }
  return [...rows.values()].sort((a, b) =>
    b.authored - a.authored || b.coAuthored - a.coAuthored || a.name.localeCompare(b.name))
}

const short = (oid: string) => oid.slice(0, 7)
/** Table cells only: a pipe or newline in untrusted text must not break the table. */
const cell = (text: string) => text.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|')
/** A seat's shared noreply address may print. Anyone else prints as their bucket and name only:
 * the email still decides the bucket and the row, but a cold reviewer needs no contact address. */
const SEATS: ReadonlySet<Vendor> = new Set(['Claude', 'Codex', 'Cursor'])
export const authorCell = (row: Pick<AuthorRow, 'vendor' | 'name' | 'email'>) =>
  SEATS.has(row.vendor) ? `${cell(row.name)} <${cell(row.email)}>` : cell(row.name)
const percent = (part: number, whole: number) => (whole === 0 ? '0%' : `${Math.round((part / whole) * 100)}%`)
const plural = (n: number, noun: string) => `${n} ${noun}${n === 1 ? '' : 's'}`

export function renderSkeleton(pr: PullRequest): string {
  const lines: string[] = []
  const rows = authorshipRows(pr.commits)
  lines.push(
    `# Pass 0 skeleton: PR #${pr.number}`,
    '',
    `- PR: [#${pr.number}](${pr.url}) ${cell(pr.title)}`,
    `- Branch: \`${pr.headRefName}\` into \`${pr.baseRefName}\``,
    `- Head: \`${pr.headRefOid}\``,
    `- Totals: ${plural(pr.commits.length, 'commit')}, ${plural(pr.changedFiles, 'file')}, +${pr.additions} −${pr.deletions}`,
    '',
    '## Authorship',
    '',
    '| Vendor | Author | Commits | Share | Co-authored |',
    '| --- | --- | ---: | ---: | ---: |',
    ...rows.map((r) => `| ${r.vendor} | ${authorCell(r)} | ${r.authored} | ${percent(r.authored, pr.commits.length)} | ${r.coAuthored} |`),
    '',
    '| Commit | Author | Headline |',
    '| --- | --- | --- |',
    ...pr.commits.map((c) => `| \`${short(c.oid)}\` | ${c.authors[0] ? `${vendorOf(c.authors[0])}: ${cell(c.authors[0].name)}` : '?'} | ${cell(c.messageHeadline)} |`),
    '',
    '## Files',
    '',
    '| File | Change | Added | Deleted |',
    '| --- | --- | ---: | ---: |',
    ...pr.files.map((f) => `| \`${cell(f.path)}\` | ${f.changeType ?? ''} | +${f.additions} | −${f.deletions} |`),
  )
  // readPullRequest has already checked these against the PR's own totals.
  const listedAdds = pr.files.reduce((sum, f) => sum + f.additions, 0)
  const listedDels = pr.files.reduce((sum, f) => sum + f.deletions, 0)
  lines.push(`| **${plural(pr.files.length, 'file')}** | | **+${listedAdds}** | **−${listedDels}** |`, '')
  return lines.join('\n')
}

export function claimBlocks(pr: PullRequest): UntrustedBlock[] {
  return [
    { label: 'PR body', text: pr.body },
    ...pr.commits.map((c) => ({
      label: `commit ${short(c.oid)}`,
      text: c.messageBody ? `${c.messageHeadline}\n\n${c.messageBody}` : c.messageHeadline,
    })),
  ]
}

/** The sources are the labels this code wrote, so the model cannot cite one that was never sent. */
export function claimsSchema(labels: readonly string[]) {
  const [first, ...rest] = labels
  if (first === undefined) throw new Error('claimsSchema needs at least one source label')
  return z.object({
    claims: z.array(z.object({ source: z.enum([first, ...rest]), quote: z.string().min(1) }).strict()),
  }).strict()
}
export type Claims = z.infer<ReturnType<typeof claimsSchema>>

export const CLAIMS_TASK = `
You are preparing the sealed appendix of a code review brief for one pull request. The data below is that pull request's description and each of its commit messages, written by the builder of the PR. Each block's label names its source.

Collect every claim the builder makes that a reviewer could check against the repository, the PR diff or CI: test counts and results, file or line counts, "no data change" or "no code change", "every link resolves", sizes or timings, what was verified and how, what was left out on purpose. Return each claim as one contiguous excerpt quoted exactly as written in its block, with that block's label as its source. Do not paraphrase, do not add ellipses and do not join separate fragments. Keep the excerpt to the sentence or clause that carries the claim.

Keep the builder's wording even where you doubt it: you are collecting claims, not judging them. Leave out statements of intent or motivation that nothing could check. If the same claim appears in several blocks, keep each occurrence. Return an empty list if there are no checkable claims.
`

export type Located =
  | { found: 'exact' | 'respaced'; text: string }
  | { found: 'no' }

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Plain code finds each quote in the text that was sent; the model's word is not enough. A copy
 * whose words match but whose spacing differs (a newline the model turned into a space, say)
 * comes back as the source's own text, whitespace and all, so the printed excerpt is always the
 * builder's, character for character. Anything else is not found.
 */
export function locateExcerpt(quote: string, source: string): Located {
  if (quote.length > 0 && source.includes(quote)) return { found: 'exact', text: quote }
  const words = quote.split(/\s+/).filter(Boolean)
  if (words.length === 0) return { found: 'no' }
  const match = source.match(new RegExp(words.map(escapeRegExp).join('\\s+')))
  return match ? { found: 'respaced', text: match[0] } : { found: 'no' }
}

/** A fence longer than any backtick run inside, so the excerpt cannot close it. */
function fenced(text: string): string {
  const longest = Math.max(0, ...[...text.matchAll(/`+/g)].map((run) => run[0].length))
  const fence = '`'.repeat(Math.max(3, longest + 1))
  return [`${fence}text`, text, fence].join('\n')
}

/** One line in quotes when it fits on one line; otherwise a fenced block, so no character moves. */
function excerptLines(label: string, text: string, note = ''): string[] {
  return text.includes('\n') || text.includes('\r')
    ? [`- ${label}${note}:`, '', fenced(text), '']
    : [`- ${label}: "${text}"${note}`]
}

export const APPENDIX_HEADING = '## Sealed appendix: claims to verify independently, never conclusions'

export function renderAppendix(claims: Claims, blocks: readonly UntrustedBlock[]): string {
  const textOf = new Map(blocks.map((block) => [block.label, block.text]))
  const lines = [
    APPENDIX_HEADING,
    '',
    'These are the builder\'s own words from the PR body and commit messages, picked out by one model call and printed exactly as the source has them. Each is a claim to check against the repo. None is a finding.',
    '',
  ]
  if (claims.claims.length === 0) lines.push('No checkable claims were found.')
  for (const claim of claims.claims) {
    const located = locateExcerpt(claim.quote, textOf.get(claim.source) ?? '')
    lines.push(...(located.found === 'no'
      ? excerptLines(claim.source, claim.quote, ' (not found in this source, so this is the model\'s copy: check the wording)')
      : excerptLines(claim.source, located.text)))
  }
  return lines.join('\n').replace(/\n+$/, '')
}

export interface Pass0Deps {
  gh: CommandRunner
  model: ModelRunner
  out: (text: string) => void
  err: (text: string) => void
  /** When stdout is a file or pipe, the model failure line goes to stderr as well, so it is seen. */
  stdoutIsTerminal: boolean
}

export async function runPass0(argv: readonly string[], deps: Pass0Deps): Promise<number> {
  const arg = argv[0] ?? ''
  if (!/^[1-9]\d*$/.test(arg) || argv.length !== 1) {
    deps.err('Usage: npx tsx scripts/pm/pass0.ts <PR number>')
    return 2
  }
  let pr: PullRequest
  try {
    pr = await readPullRequest(deps.gh, Number(arg))
  } catch (error) {
    // The same shape as the model's failure line: said once on stdout, and on stderr when piped.
    const line = `Could not read PR ${arg} completely: ${error instanceof Error ? error.message : String(error)}. No skeleton was printed.`
    deps.out(line)
    if (!deps.stdoutIsTerminal) deps.err(line)
    return 2
  }
  deps.out(renderSkeleton(pr))
  const blocks = claimBlocks(pr)
  const result = await callModel({ task: CLAIMS_TASK, blocks, schema: claimsSchema(blocks.map((b) => b.label)), run: deps.model })
  if (!result.ok) {
    const line = failureLine('The sealed appendix', result.reason)
    deps.out(line)
    if (!deps.stdoutIsTerminal) deps.err(line)
    return 1
  }
  deps.out(renderAppendix(result.value, blocks))
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = await runPass0(process.argv.slice(2), {
    gh: runCommand,
    model: spawnClaude,
    out: (text) => process.stdout.write(`${text}\n`),
    err: (text) => process.stderr.write(`${text}\n`),
    stdoutIsTerminal: Boolean(process.stdout.isTTY),
  })
}
