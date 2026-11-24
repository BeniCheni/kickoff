import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { z } from 'zod'
import { BROOKLYN_TZ } from '../../src/lib/competitions'
import { brooklynAbbrev, zonedParts } from '../../src/lib/time'
import { callModel, failureLine, spawnClaude, type ModelRunner, type UntrustedBlock } from './model'
import { runCommand, runOk, type CommandRunner } from './process'

/**
 * `npx tsx scripts/pm/unreleased.ts` drafts CHANGELOG.md's `[Unreleased]` section from the PRs
 * merged into main since the latest tag. Finding those PRs is plain code; the draft is one
 * tool-less model call. It prints the draft and never writes CHANGELOG.md: a person applies it.
 */

export const LIST_FIELDS = 'number,title,url,headRefName,body,mergedAt,mergeCommit'
export const LIST_LIMIT = 300

const sha = z.string().regex(/^[0-9a-f]{40}$/)
export const mergedPrSchema = z.object({
  number: z.number().int().positive(),
  title: z.string(),
  url: z.string(),
  headRefName: z.string(),
  body: z.string(),
  mergedAt: z.string(),
  mergeCommit: z.object({ oid: sha }).nullable(),
})
export type MergedPr = z.infer<typeof mergedPrSchema>

/** The bot's PRs: the rolling `sync/scheduled` head, or a sync title, with or without its ⚠ flag. */
export function isSyncPr(pr: Pick<MergedPr, 'headRefName' | 'title'>): boolean {
  if (pr.headRefName === 'sync/scheduled') return true
  const title = pr.title.replace(/^\s*⚠️?\s*/u, '')
  return title.startsWith('npm run sync') || title.startsWith('sync: verified unchanged')
}

export interface TagInfo {
  tag: string
  commit: string
  commitDate: string
  /** Empty for a lightweight tag, which has no tagger. */
  taggerDate: string
}

/**
 * The GitHub search only narrows the list, so it starts a day early in UTC. Whether a PR is in the
 * release is decided by git ancestry, never by date: v0.5.5's own PR (#320) shows GitHub's
 * `mergedAt` one second after the commit it tagged, so a date cut would count it as unreleased.
 */
export function searchSince(info: Pick<TagInfo, 'commitDate' | 'taggerDate'>): string {
  const times = [info.commitDate, info.taggerDate].filter(Boolean).map((iso) => Date.parse(iso))
  if (times.length === 0 || times.some(Number.isNaN)) throw new Error('the tag has no readable date')
  return new Date(Math.min(...times) - 86_400_000).toISOString().slice(0, 10)
}

export interface Selection {
  unreleased: MergedPr[]
  sync: MergedPr[]
  released: number
}

export function splitPrs(prs: readonly MergedPr[], inTag: ReadonlySet<number>): Selection {
  const after = prs.filter((pr) => !inTag.has(pr.number))
    .sort((a, b) => Date.parse(a.mergedAt) - Date.parse(b.mergedAt) || a.number - b.number)
  return {
    unreleased: after.filter((pr) => !isSyncPr(pr)),
    sync: after.filter(isSyncPr),
    released: prs.length - after.length,
  }
}

/** The `[Unreleased]` section as CHANGELOG.md has it now, without its heading; empty if absent. */
export function currentUnreleased(changelog: string): string {
  const match = changelog.match(/^## \[Unreleased\][^\n]*\n([\s\S]*?)(?=^## \[|(?![\s\S]))/m)
  return match?.[1]?.trim() ?? ''
}

/** "Sat 2026-11-14 5:14 PM EST", from the app's own Brooklyn clock helpers. */
export function brooklynStamp(iso: string): string {
  const instant = new Date(iso)
  const parts = zonedParts(instant, BROOKLYN_TZ)
  return `${parts.weekday} ${parts.isoDate} ${parts.time} ${brooklynAbbrev(instant)}`
}

const cell = (text: string) => text.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|')
const plural = (n: number, noun: string) => `${n} ${noun}${n === 1 ? '' : 's'}`

export function renderSelection(info: TagInfo, since: string, selection: Selection): string {
  return [
    `# [Unreleased] draft since ${info.tag}`,
    '',
    `- Last tag: \`${info.tag}\` on commit \`${info.commit.slice(0, 7)}\`, ${info.taggerDate ? `tagged ${brooklynStamp(info.taggerDate)}` : `committed ${brooklynStamp(info.commitDate)} (lightweight tag)`}`,
    `- Merged into \`main\` since then: ${plural(selection.unreleased.length, 'PR')}, and ${plural(selection.sync.length, 'sync PR')} left out`,
    `- How: PRs merged on or after ${since} (UTC) from GitHub, minus the ${selection.released} whose merge commit is already in \`${info.tag}\``,
    '',
    ...(selection.unreleased.length === 0 ? [] : [
      '| PR | Merged | Branch | Title |',
      '| --- | --- | --- | --- |',
      ...selection.unreleased.map((pr) => `| [#${pr.number}](${pr.url}) | ${brooklynStamp(pr.mergedAt)} | \`${cell(pr.headRefName)}\` | ${cell(pr.title)} |`),
      '',
    ]),
  ].join('\n')
}

export const SECTIONS = [
  ['added', 'Added'],
  ['changed', 'Changed'],
  ['fixed', 'Fixed'],
  ['notDone', 'Deliberately not done'],
] as const

const CLOSER = `["'”’)\\]]*`

/**
 * One sentence: it ends in . ! or ?, and no such mark followed by a space comes before the end.
 * "v0.5.5 ships Next.js 16.4.6." passes, "One. Two." does not. It is strict on purpose: an
 * abbreviation such as "e.g. this" fails too, and the task tells the model to write none.
 */
export function isOneSentence(text: string): boolean {
  const flat = text.replace(/\s+/g, ' ').trim()
  const end = new RegExp(`[.!?]${CLOSER}$`)
  if (!end.test(flat)) return false
  return !new RegExp(`[.!?]${CLOSER} `).test(flat.replace(end, ''))
}

/**
 * A line's own text must not point at a PR or an issue. Citations come only from a line's `prs`,
 * which the enum holds to the PRs sent, so a reference in the text would be a citation that
 * nothing checked, such as a link to #327 printed beside the real "(#502)". Issues count because
 * they share the PRs' number space.
 *
 * Nor may a line hold a link. Beni ruled on 23 Nov 2026, "Drop links from drafts": five rounds of
 * review found a new way for code, links and emphasis to hide a citation each time the check
 * learned to read one more of them. So the check reads no link syntax at all. It reads code spans
 * (single backticks that pair), and an address that must appear goes in one, because GitHub
 * renders nothing in a code span as a link. Outside them it refuses each piece of link syntax by
 * name (LINK_SYNTAX). The person who applies the draft adds any link.
 */
export const CODE_SPAN_FORMS = { run: 'a run of backticks', unpaired: 'an unpaired backtick' } as const

/**
 * An invisible format character (Unicode category Cf, such as a zero-width space or a soft hyphen)
 * is refused anywhere in a line, code spans included. No draft needs one, and Codex's sixth re-read
 * found that dropping it hid a reference: `#327` with a zero-width space before "today" read as
 * `#327today` here, while GitHub linked `#327`.
 */
export const FORMAT_CHARACTER = { form: 'a format character', pattern: /\p{Cf}/u } as const

/**
 * What GitHub turns into a link, outside a code span: `[` or `]` (links, images, reference links,
 * footnotes), `<` (autolinks and raw HTML), `://`, `www.` and `github.com/` (bare URLs, where
 * GitHub links a scheme-less `github.com/<owner>/<repo>/discussions/327` to the PR itself), `@`
 * (an email address, which GitHub links as mailto, or a mention), a character reference or a
 * backslash, which could spell any of these without showing it, and a commit SHA, meaning a
 * lowercase hex token of 7 to 40 characters with a letter and a digit, which GitHub links to the
 * commit (it renders an uppercase one as plain text). Last, a PR or issue path with no host:
 * GitHub links `BeniCheni/kickoff/pull/327`, `../pull/327`, `/issues/361` and `/discussions/327`
 * to this repo's PR or issue, so `/pull/N`, `/issues/N` and `/discussions/N` are refused, with
 * the number bounded after it.
 */
export const LINK_SYNTAX = [
  { form: 'a square bracket', pattern: /[[\]]/ },
  { form: 'an angle bracket', pattern: /</ },
  { form: 'a URL', pattern: /:\/\/|www\.|github\.com\//i },
  { form: 'an at sign', pattern: /@/ },
  { form: 'a character reference', pattern: /&(?:#\d+|#x[\da-f]+|[a-z][a-z\d]*);/i },
  { form: 'a backslash', pattern: /\\/ },
  { form: 'a commit SHA', pattern: /(?<![A-Za-z\d])(?=[\da-f]*[a-f])(?=[\da-f]*\d)[\da-f]{7,40}(?![A-Za-z\d])/ },
  { form: 'a PR or issue path', pattern: /\/(?:pull|issues|discussions)\/\d+(?![A-Za-z\d])/i },
] as const

/**
 * The short forms and the words, read in the whole text, code spans included. Emphasis markers
 * and backticks stay where they are, so they break a token without joining or splitting one:
 * `**#327**a` holds `#327` and is refused, as GitHub links it there, while `#_327`, where GitHub
 * links nothing, passes. A short form counts wherever it starts, since GitHub links `see-GH-327`
 * and `notes/BeniCheni/kickoff#327` too, and needs a letter-or-digit boundary after its number,
 * so `#327,` and `(#327)` count, `#327b` does not, and `#327_` counts (GitHub renders it as plain
 * text, so that is a false refusal taken on purpose, as are `high-5` and `a#327`). The words take
 * a keyword and a number as separate tokens ("PR 7b", "issue #361"), never one glued token
 * ("issue10047"), and read markers and backticks as spaces, so `**issue** 361` is refused. They also refuse an
 * internal name such as "PR 0" and plain prose that puts a number after "issue" or "pull request":
 * the change can always be told without that, as the README says. The text is NFKC-normalized
 * first, so `#３２７` reads as `#327`. A format character never gets this far (FORMAT_CHARACTER).
 *
 * An issue or pull request address names one too, link or no link, so the address forms from
 * GitHub's list are read as text, code spans included: `github.com/<owner>/<repo>/pull/N` or
 * `/issues/N` on any github.com host (`redirect.github.com` too), and the API's
 * `api.github.com/repos/<owner>/<repo>/pulls/N` or `/issues/N`, each with its host starting at a
 * boundary, so `notgithub.com` or a file path that holds `/repos/` is not one, and its number
 * bounded after it.
 */
export const TEXT_REFERENCES = [
  {
    form: 'an issue or pull request address',
    pattern: /(?<![\w.-])(?:(?:[\w-]+\.)*github\.com\/[^/\s`]+\/[^/\s`]+\/(?:pull|issues)|api\.github\.com\/repos\/[^/\s`]+\/[^/\s`]+\/(?:pulls|issues))\/\d+(?![A-Za-z\d])/i,
    spaced: false,
  },
  { form: 'an owner/repo#N reference', pattern: /[\w.-]+\/[\w.-]+#\d+(?![A-Za-z\d])/, spaced: false },
  { form: 'a #N reference', pattern: /#\s*\d+(?![A-Za-z\d])/, spaced: false },
  { form: 'a GH-N reference', pattern: /GH-\d+(?![A-Za-z\d])/i, spaced: false },
  { form: 'a PR or issue named by number', pattern: /\b(?:PRs?|pull\s+requests?|issues?)(?:\s+#?|\s*#)\s*\d/i, spaced: true },
] as const

export interface TextFinding {
  form: string
  /** `hidden` for a format character, `code` for backticks that do not pair, `link` for link syntax, `cites` for a reference. */
  kind: 'hidden' | 'code' | 'link' | 'cites'
}

/** Why the check refuses a line's text, or undefined when it passes. The text is flattened first, as `citeLine` prints it. */
export function textFinding(text: string): TextFinding | undefined {
  const flat = text.replace(/\s+/g, ' ').trim()
  if (FORMAT_CHARACTER.pattern.test(flat)) return { form: FORMAT_CHARACTER.form, kind: 'hidden' }
  if (flat.includes('``')) return { form: CODE_SPAN_FORMS.run, kind: 'code' }
  const pieces = flat.split('`')
  if (pieces.length % 2 === 0) return { form: CODE_SPAN_FORMS.unpaired, kind: 'code' }
  const outside = pieces.filter((_, i) => i % 2 === 0).join(' ')
  const syntax = LINK_SYNTAX.find(({ pattern }) => pattern.test(outside))
  if (syntax) return { form: syntax.form, kind: 'link' }
  const read = flat.normalize('NFKC')
  const spaced = read.replace(/[*_~`]/g, ' ')
  const found = TEXT_REFERENCES.find(({ pattern, spaced: words }) => pattern.test(words ? spaced : read))
  return found ? { form: found.form, kind: 'cites' } : undefined
}

/** The form the check refused a line's text for, or undefined when it passes. */
export function proseReference(text: string): string | undefined {
  return textFinding(text)?.form
}

export function citesInProse(text: string): boolean {
  return textFinding(text) !== undefined
}

/** Sentence content: at least one word of two letters, so "." or "…" is not a line. */
export function hasWords(text: string): boolean {
  return /\p{L}{2}/u.test(text)
}

/** The text of a line or the lead: words, no link, and no reference of its own to a PR or an issue. */
const prose = (what: string) => z.string().min(1)
  .refine(hasWords, `${what} has no words`)
  .superRefine((text, ctx) => {
    const finding = textFinding(text)
    if (!finding) return
    ctx.addIssue({
      code: 'custom',
      message: finding.kind === 'cites'
        ? `${what} cites ${finding.form} in its text, where only prs may cite`
        : finding.kind === 'link'
          ? `${what} holds ${finding.form} outside a code span, where a draft may hold no link`
          : finding.kind === 'hidden'
            ? `${what} holds ${finding.form}, which no draft needs and which can hide a reference`
            : `${what} holds ${finding.form}, so its code spans cannot be read`,
    })
  })

/**
 * Every line, the lead included, cites at least one PR, and only PRs this code sent, so the
 * model cannot cite one it made up, and its text has words and no PR number of its own. The
 * lead's one-sentence rule is a check zod runs on the answer too. JSON Schema cannot say these
 * checks, so the schema leaves them out, the task and the lead's description tell the model, and
 * zod enforces them.
 */
export function draftSchema(prNumbers: readonly number[]) {
  const [first, ...rest] = prNumbers
  if (first === undefined) throw new Error('draftSchema needs at least one PR number')
  const prs = z.array(z.literal([first, ...rest])).min(1)
  const line = z.object({ text: prose('a line'), prs }).strict()
  return z.object({
    lead: z.object({
      text: prose('the lead')
        .describe('Exactly one sentence, ending in a full stop, with no abbreviations and no PR numbers.')
        .refine(isOneSentence, 'the lead must be exactly one sentence'),
      prs,
    }).strict(),
    added: z.array(line),
    changed: z.array(line),
    fixed: z.array(line),
    notDone: z.array(line),
  }).strict()
}
export type Draft = z.infer<ReturnType<typeof draftSchema>>

/** "Text." with PRs 7 and 9 → "Text (#7, #9)." — the citation sits inside the sentence. */
export function citeLine(text: string, prs: readonly number[]): string {
  const cite = `(${[...new Set(prs)].sort((a, b) => a - b).map((n) => `#${n}`).join(', ')})`
  const flat = text.replace(/\s+/g, ' ').trim()
  return /[.!?]$/.test(flat) ? `${flat.slice(0, -1)} ${cite}${flat.slice(-1)}` : `${flat} ${cite}`
}

export function renderDraft(draft: Draft): string {
  const lines = ['## [Unreleased]', '', citeLine(draft.lead.text, draft.lead.prs)]
  for (const [key, heading] of SECTIONS) {
    if (draft[key].length === 0) continue
    lines.push('', `### ${heading}`, '', ...draft[key].map((line) => `- ${citeLine(line.text, line.prs)}`))
  }
  return lines.join('\n')
}

export function uncited(draft: Draft, prNumbers: readonly number[]): number[] {
  const cited = new Set([...draft.lead.prs, ...SECTIONS.flatMap(([key]) => draft[key].flatMap((line) => line.prs))])
  return prNumbers.filter((n) => !cited.has(n))
}

export const DRAFT_TASK = `
You are drafting the [Unreleased] section of CHANGELOG.md for Kickoff, a public app that shows the fixtures and standings of Europe's big five football leagues in Brooklyn time. The data below is each pull request merged into main since the last release tag, labelled with its number, and then the section as it stands now.

The CHANGELOG is a product surface, not a commit log: a reader of the public repo should follow every line without having read the PRs. The shape is a lead of exactly one sentence naming what these changes add up to, with no abbreviations, and with the PRs it sums up in its prs list; then Added, Changed and Fixed; then Deliberately not done. Each line is one or two plain sentences on what changed for a reader. Put every PR number a line or the lead comes from in its prs list, and do not write PR numbers in the text. Write no links or URLs, and put any address that must appear in a code span. Group PRs into one line when they are one change.

Leave out a PR that a CHANGELOG reader would not care about, such as one that only archives review records or build briefs: a person will see which PRs you left out and decide. Deliberately not done holds only what a PR's own description says was left out on purpose, never something you infer. State only what the PR titles and descriptions say. Leave a section empty rather than pad it.

The section as it stands is shown for its voice. Your draft replaces it, and may keep its lines where they still fit.
`

export function draftBlocks(prs: readonly MergedPr[], current: string): UntrustedBlock[] {
  return [
    ...prs.map((pr) => ({ label: `PR #${pr.number}`, text: `Title: ${pr.title}\nBranch: ${pr.headRefName}\n\n${pr.body}` })),
    ...(current ? [{ label: 'the [Unreleased] section as it stands', text: current }] : []),
  ]
}

async function readTag(run: CommandRunner): Promise<TagInfo> {
  const tag = (await runOk(run, 'git', ['describe', '--tags', '--abbrev=0'])).trim()
  const ref = `refs/tags/${tag}`
  const [commit = '', commitDate = ''] = (await runOk(run, 'git', ['log', '-1', '--format=%H%x00%cI', `${ref}^{commit}`])).trim().split('\0')
  const taggerDate = (await runOk(run, 'git', ['for-each-ref', '--format=%(taggerdate:iso-strict)', ref])).trim()
  return { tag, commit, commitDate, taggerDate }
}

/** Exit 1 is "not an ancestor". Exit 128 for a commit this full clone lacks means the same thing. */
async function inTag(run: CommandRunner, oid: string, tag: string): Promise<boolean> {
  const result = await run('git', ['merge-base', '--is-ancestor', oid, `refs/tags/${tag}`])
  if (result.status === 0) return true
  if (result.status === 1) return false
  if (result.status === 128 && /not a valid commit name|bad object/i.test(result.stderr)) return false
  throw new Error(`git merge-base failed for ${oid.slice(0, 7)}: ${result.stderr.trim() || result.error || `exit ${result.status}`}`)
}

export interface UnreleasedDeps {
  run: CommandRunner
  model: ModelRunner
  readChangelog: () => string
  out: (text: string) => void
  err: (text: string) => void
  stdoutIsTerminal: boolean
}

export async function runUnreleased(argv: readonly string[], deps: UnreleasedDeps): Promise<number> {
  if (argv.length > 0) {
    deps.err('Usage: npx tsx scripts/pm/unreleased.ts (it takes no arguments)')
    return 2
  }
  let info: TagInfo
  let since: string
  let selection: Selection
  let current: string
  try {
    if ((await runOk(deps.run, 'git', ['rev-parse', '--is-shallow-repository'])).trim() === 'true') {
      throw new Error('this clone is shallow, so git cannot say which merges the tag holds')
    }
    info = await readTag(deps.run)
    since = searchSince(info)
    const raw = await runOk(deps.run, 'gh', [
      'pr', 'list', '--base', 'main', '--state', 'merged', '--search', `merged:>=${since}`,
      '--limit', String(LIST_LIMIT), '--json', LIST_FIELDS,
    ])
    const prs = z.array(mergedPrSchema).parse(JSON.parse(raw))
    if (prs.length >= LIST_LIMIT) throw new Error(`gh returned ${prs.length} PRs, the limit, so the list may be cut short`)
    const released = new Set<number>()
    for (const pr of prs) {
      if (!pr.mergeCommit) throw new Error(`PR #${pr.number} is merged but has no merge commit`)
      if (await inTag(deps.run, pr.mergeCommit.oid, info.tag)) released.add(pr.number)
    }
    selection = splitPrs(prs, released)
    current = currentUnreleased(deps.readChangelog())
  } catch (error) {
    deps.err(`Could not list the merged PRs: ${error instanceof Error ? error.message : String(error)}`)
    return 2
  }
  deps.out(renderSelection(info, since, selection))
  if (selection.unreleased.length === 0) {
    deps.out(selection.sync.length === 0
      ? `Nothing to draft: no PR has merged into main since ${info.tag}. No model call was made.`
      : `Nothing to draft: only the sync bot has merged into main since ${info.tag}. No model call was made.`)
    return 0
  }
  const numbers = selection.unreleased.map((pr) => pr.number)
  const result = await callModel({
    task: DRAFT_TASK, blocks: draftBlocks(selection.unreleased, current), schema: draftSchema(numbers), run: deps.model,
  })
  if (!result.ok) {
    const line = failureLine('The [Unreleased] draft', result.reason)
    deps.out(line)
    if (!deps.stdoutIsTerminal) deps.err(line)
    return 1
  }
  const left = uncited(result.value, numbers)
  deps.out([
    '## Draft',
    '',
    'One model call wrote the draft below from the PRs above. Read it against them before applying any of it: this script never writes CHANGELOG.md.',
    '',
    '````markdown',
    renderDraft(result.value),
    '````',
    '',
    left.length === 0 ? 'Every PR above is cited in the draft.' : `Not cited in the draft, so check whether each belongs: ${left.map((n) => `#${n}`).join(', ')}.`,
  ].join('\n'))
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
  process.exitCode = await runUnreleased(process.argv.slice(2), {
    run: runCommand,
    model: spawnClaude,
    readChangelog: () => readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8'),
    out: (text) => process.stdout.write(`${text}\n`),
    err: (text) => process.stderr.write(`${text}\n`),
    stdoutIsTerminal: Boolean(process.stdout.isTTY),
  })
}
