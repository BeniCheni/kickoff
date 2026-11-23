import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { jsonSchemaFor, type ModelRunner } from '../scripts/pm/model'
import type { CommandRunner, ProcessResult } from '../scripts/pm/process'
import {
  LIST_FIELDS, LIST_LIMIT, brooklynStamp, citeLine, citesInProse, currentUnreleased, draftBlocks, draftSchema, hasWords, isOneSentence,
  isSyncPr, mergedPrSchema, proseReference, renderDraft, runUnreleased, searchSince, splitPrs, uncited, type Draft,
} from '../scripts/pm/unreleased'

// No test here calls GitHub, git or Claude: every runner is a scripted fake.
const listJson = readFileSync('tests/fixtures/pm/merged-prs.json', 'utf8')
const prs = mergedPrSchema.array().parse(JSON.parse(listJson))
const byNumber = (n: number) => prs.find((pr) => pr.number === n)!
const TAG_COMMIT = 'a'.repeat(40)
const IN_TAG = new Set(['a'.repeat(40), 'b'.repeat(40)])
const NOT_LOCAL = new Set(['e'.repeat(40)])
const CHANGELOG = '# Changelog\n\nIntro.\n\n## [Unreleased]\n\n### Changed\n\n- The preview smoke\'s landmark moved.\n\n## [1.2.3] — 2026-11-14\n\nOld news.\n'
const draft: Draft = {
  lead: { text: 'The standings table learns to fit a phone.', prs: [502] },
  added: [],
  changed: [{ text: 'The standings table fits a 360 px phone.', prs: [502] }],
  fixed: [],
  notDone: [{ text: 'The Ledger lens keeps its old widths.', prs: [502] }],
}
const answer = (structured: unknown) => JSON.stringify({ type: 'result', subtype: 'success', is_error: false, structured_output: structured })
const ok = (stdout: string): ProcessResult => ({ status: 0, stdout, stderr: '' })

function harness(options: { model?: string; list?: string; shallow?: boolean; terminal?: boolean } = {}) {
  const calls: string[][] = []
  const modelCalls: { args: readonly string[]; stdin: string }[] = []
  const out: string[] = []
  const err: string[] = []
  const run: CommandRunner = async (command, args) => {
    calls.push([command, ...args])
    const key = [command, ...args].join(' ')
    if (key === 'git rev-parse --is-shallow-repository') return ok(options.shallow ? 'true\n' : 'false\n')
    if (key === 'git describe --tags --abbrev=0') return ok('v1.2.3\n')
    if (key === 'git log -1 --format=%H%x00%cI refs/tags/v1.2.3^{commit}') return ok(`${TAG_COMMIT}\u00002026-11-14T17:14:02-05:00\n`)
    if (key === 'git for-each-ref --format=%(taggerdate:iso-strict) refs/tags/v1.2.3') return ok('2026-11-14T17:14:41-05:00\n')
    if (command === 'gh') return ok(options.list ?? listJson)
    if (command === 'git' && args[0] === 'merge-base') {
      const oid = args[2] ?? ''
      if (IN_TAG.has(oid)) return ok('')
      if (NOT_LOCAL.has(oid)) return { status: 128, stdout: '', stderr: `fatal: Not a valid commit name ${oid}\n` }
      return { status: 1, stdout: '', stderr: '' }
    }
    throw new Error(`unexpected command: ${key}`)
  }
  const model: ModelRunner = async (args, stdin) => {
    modelCalls.push({ args, stdin })
    return ok(options.model ?? answer(draft))
  }
  return {
    calls, modelCalls, out, err,
    deps: {
      run, model, readChangelog: () => CHANGELOG, out: (t: string) => out.push(t), err: (t: string) => err.push(t),
      stdoutIsTerminal: options.terminal ?? true,
    },
  }
}

describe('isSyncPr', () => {
  it('leaves out the bot\'s rolling head whatever its title', () => {
    expect(isSyncPr({ headRefName: 'sync/scheduled', title: 'Anything at all' })).toBe(true)
  })

  it('leaves out sync titles from any head, with or without the ⚠ flag', () => {
    expect(isSyncPr({ headRefName: 'x', title: 'npm run sync 11/22/2026 3:03 AM ET' })).toBe(true)
    expect(isSyncPr({ headRefName: 'x', title: '⚠ npm run sync 11/22/2026 1:35 PM ET — time-sensitive change reported' })).toBe(true)
    expect(isSyncPr({ headRefName: 'x', title: '⚠️ npm run sync 11/22/2026 1:35 PM ET' })).toBe(true)
    expect(isSyncPr({ headRefName: 'x', title: 'sync: verified unchanged — 11/20/2026 2:10 PM ET' })).toBe(true)
  })

  it('keeps a person\'s PR that only mentions sync', () => {
    expect(isSyncPr({ headRefName: 'claude/sync-rules-docs', title: 'docs: the sync rules, archived' })).toBe(false)
    expect(isSyncPr({ headRefName: 'codex/sync-fix', title: 'Fix: npm run sync no longer drops UCL' })).toBe(false)
    expect(isSyncPr({ headRefName: 'sync/scheduled-not', title: 'Sync the README badge' })).toBe(false)
  })
})

describe('searchSince', () => {
  it('starts the GitHub search a UTC day before the earlier of the tag\'s two dates', () => {
    expect(searchSince({ commitDate: '2026-11-14T17:14:02-05:00', taggerDate: '2026-11-14T17:14:41-05:00' })).toBe('2026-11-13')
    expect(searchSince({ commitDate: '2026-11-14T21:00:00-05:00', taggerDate: '' })).toBe('2026-11-14')
  })

  it('refuses a tag with no readable date', () => {
    expect(() => searchSince({ commitDate: '', taggerDate: '' })).toThrow()
    expect(() => searchSince({ commitDate: 'yesterday', taggerDate: '' })).toThrow()
  })
})

describe('splitPrs', () => {
  it('decides release membership by ancestry, so the release PR merged a second after its tagged commit stays out', () => {
    expect(Date.parse(byNumber(500).mergedAt)).toBeGreaterThan(Date.parse('2026-11-14T17:14:02-05:00'))
    const selection = splitPrs(prs, new Set([499, 500]))
    expect(selection.released).toBe(2)
    expect(selection.unreleased.map((pr) => pr.number)).toEqual([502, 504])
    expect(selection.sync.map((pr) => pr.number)).toEqual([501, 503, 505])
  })
})

describe('currentUnreleased', () => {
  it('takes the section between its heading and the next release', () => {
    expect(currentUnreleased(CHANGELOG)).toBe('### Changed\n\n- The preview smoke\'s landmark moved.')
  })

  it('reads a section that runs to the end of the file, and an absent one as empty', () => {
    expect(currentUnreleased('# C\n\n## [Unreleased]\n\n- Last line.\n')).toBe('- Last line.')
    expect(currentUnreleased('# C\n\n## [1.0.0]\n\n- Old.\n')).toBe('')
  })
})

describe('brooklynStamp', () => {
  it('uses the app\'s Brooklyn clock, with the zone the offset says', () => {
    expect(brooklynStamp('2026-11-14T22:14:41Z')).toBe('Sat 2026-11-14 5:14 PM EST')
    expect(brooklynStamp('2026-07-04T16:00:00Z')).toBe('Sat 2026-07-04 12:00 PM EDT')
  })
})

describe('the draft', () => {
  const schema = draftSchema([502, 504])

  it('may cite only the PRs that were sent, and every line must cite one', () => {
    expect(schema.safeParse(draft).success).toBe(true)
    expect(schema.safeParse({ ...draft, fixed: [{ text: 'The table fits.', prs: [320] }] }).success).toBe(false)
    expect(schema.safeParse({ ...draft, fixed: [{ text: 'The table fits.', prs: [] }] }).success).toBe(false)
    expect(schema.safeParse({ ...draft, removed: [] }).success).toBe(false)
    const { notDone: _dropped, ...partial } = draft
    expect(schema.safeParse(partial).success).toBe(false)
  })

  it('cites inside the sentence, sorted and once each', () => {
    expect(citeLine('The table fits.', [504, 502, 504])).toBe('The table fits (#502, #504).')
    expect(citeLine('No full stop', [7])).toBe('No full stop (#7)')
    expect(citeLine('Spread\n  over lines?', [7])).toBe('Spread over lines (#7)?')
  })

  it('holds the lead to one sentence that cites its PRs', () => {
    expect(schema.safeParse({ ...draft, lead: { text: 'One. Two.', prs: [502] } }).success).toBe(false)
    expect(schema.safeParse({ ...draft, lead: { text: 'A lead without its PRs.', prs: [] } }).success).toBe(false)
    expect(schema.safeParse({ ...draft, lead: 'A bare string lead.' }).success).toBe(false)
    expect(schema.safeParse({ ...draft, lead: { text: 'Cites one never sent.', prs: [320] } }).success).toBe(false)
    const lead = (jsonSchemaFor(schema).properties as Record<string, { properties: Record<string, object> }>).lead!
    expect(lead.properties.prs).toMatchObject({ minItems: 1, items: { enum: [502, 504] } })
    expect(lead.properties.text).toMatchObject({ description: expect.stringContaining('Exactly one sentence') })
  })

  it('takes citations only from prs, never from the text, in the lead and in every line', () => {
    // Codex's re-read: "(#999)" in the text printed beside the real citation, "(#999) (#502)".
    for (const text of ['The table fits small screens (#999).', 'The table fits, per PR 999.', 'Pull request #504 fits the table.']) {
      expect(schema.safeParse({ ...draft, lead: { text, prs: [502] } }).success).toBe(false)
      expect(schema.safeParse({ ...draft, added: [{ text, prs: [502] }] }).success).toBe(false)
    }
  })

  it('needs words before the closing mark, in the lead and in every line', () => {
    // Codex's re-read: a lead of "." printed as "(#502).".
    for (const text of ['.', '...', '(#502).', ' ? ']) {
      expect(schema.safeParse({ ...draft, lead: { text, prs: [502] } }).success).toBe(false)
      expect(schema.safeParse({ ...draft, notDone: [{ text, prs: [502] }] }).success).toBe(false)
    }
  })

  it('tells a PR number from the other numbers a line may hold', () => {
    expect(citesInProse('The public CSS shrinks by 1,583 bytes.')).toBe(false)
    expect(citesInProse('Kickoff v0.5.5 picks up Next.js 16.4.6 on Node 24.')).toBe(false)
    expect(citesInProse('The table fits a 360 px phone.')).toBe(false)
    expect(citesInProse('It fits (#999).')).toBe(true)
    expect(citesInProse('It fits (# 999).')).toBe(true)
    expect(citesInProse('Built in PRs 7 and 9.')).toBe(true)
    // Words inside a URL are not read, and a number glued to a word is not a reference.
    expect(citesInProse('The notes are at https://example.com/page#123 for now.')).toBe(false)
    expect(citesInProse('The fix landed in issue10047.go upstream.')).toBe(false)
    expect(hasWords('It fits.')).toBe(true)
    expect(hasWords('Ça marche.')).toBe(true)
    expect(hasWords('A.')).toBe(false)
    expect(hasWords('….')).toBe(false)
  })

  it('counts one sentence the strict way', () => {
    expect(isOneSentence('Kickoff v0.5.5 picks up Next.js 16.4.6 and Vite 8.3.8.')).toBe(true)
    expect(isOneSentence('The table fits a phone (at 360 px).')).toBe(true)
    expect(isOneSentence('Does it fit?')).toBe(true)
    expect(isOneSentence('One. Two.')).toBe(false)
    expect(isOneSentence('It fits.\nAnd it shrinks.')).toBe(false)
    expect(isOneSentence('It said "done." Then it stopped.')).toBe(false)
    expect(isOneSentence('No closing mark')).toBe(false)
    expect(isOneSentence('Strict on e.g. abbreviations.')).toBe(false)
  })

  it('renders the releases.md shape and skips empty sections', () => {
    expect(renderDraft(draft)).toBe([
      '## [Unreleased]',
      '',
      'The standings table learns to fit a phone (#502).',
      '',
      '### Changed',
      '',
      '- The standings table fits a 360 px phone (#502).',
      '',
      '### Deliberately not done',
      '',
      '- The Ledger lens keeps its old widths (#502).',
    ].join('\n'))
  })

  it('names the PRs the draft left out, counting the lead as a citation', () => {
    expect(uncited(draft, [502, 504])).toEqual([504])
    expect(uncited({ ...draft, lead: { text: 'Both.', prs: [502, 504] } }, [502, 504])).toEqual([])
  })

  it('sends each unreleased PR and the current section, and nothing from a sync PR', () => {
    const blocks = draftBlocks([byNumber(502)], 'current text')
    expect(blocks.map((b) => b.label)).toEqual(['PR #502', 'the [Unreleased] section as it stands'])
    expect(blocks[0]?.text.startsWith('Title: Show the whole table at 360 px\nBranch: claude/table-360\n\n')).toBe(true)
    expect(draftBlocks([byNumber(502)], '')).toHaveLength(1)
  })
})

describe('runUnreleased', () => {
  it('lists the unreleased PRs, makes one model call and prints the draft for a person to apply', async () => {
    const h = harness()
    expect(await runUnreleased([], h.deps)).toBe(0)
    expect(h.calls).toContainEqual([
      'gh', 'pr', 'list', '--base', 'main', '--state', 'merged', '--search', 'merged:>=2026-11-13',
      '--limit', String(LIST_LIMIT), '--json', LIST_FIELDS,
    ])
    const text = h.out.join('\n')
    expect(text).toContain('- Last tag: `v1.2.3` on commit `aaaaaaa`, tagged Sat 2026-11-14 5:14 PM EST')
    expect(text).toContain('- Merged into `main` since then: 2 PRs, and 3 sync PRs left out')
    expect(text).toContain('minus the 2 whose merge commit is already in `v1.2.3`')
    expect(text).toContain('| [#502](https://github.com/example/kickoff/pull/502) | Mon 2026-11-16 12:00 PM EST | `claude/table-360` | Show the whole table at 360 px |')
    expect(text).toContain(`\`\`\`\`markdown\n${renderDraft(draft)}\n\`\`\`\``)
    expect(text).toContain('Not cited in the draft, so check whether each belongs: #504.')
    expect(h.modelCalls).toHaveLength(1)
    const stdin = h.modelCalls[0]?.stdin ?? ''
    expect(stdin).toContain('The standings table fits a 360 px phone.')
    expect(stdin).toContain('Archives the sync rules.')
    expect(stdin).toContain('- The preview smoke\'s landmark moved.')
    for (const kept of ['Its body must never reach the model', 'Time-sensitive fixture lines', 'Nothing changed.', 'Already released.', 'Merged one second after']) {
      expect(stdin).not.toContain(kept)
    }
  })

  it('never writes anything: its only effects are the commands it reads with and stdout', async () => {
    const h = harness()
    await runUnreleased([], h.deps)
    const verbs = h.calls.map((call) => call.slice(0, 2).join(' '))
    expect(new Set(verbs)).toEqual(new Set(['git rev-parse', 'git describe', 'git log', 'git for-each-ref', 'gh pr', 'git merge-base']))
  })

  it('makes no model call when only the sync bot merged since the tag', async () => {
    const onlySync = JSON.stringify(JSON.parse(listJson).filter((pr: { number: number }) => [499, 500, 501, 503, 505].includes(pr.number)))
    const h = harness({ list: onlySync })
    expect(await runUnreleased([], h.deps)).toBe(0)
    expect(h.modelCalls).toEqual([])
    expect(h.out.at(-1)).toBe('Nothing to draft: only the sync bot has merged into main since v1.2.3. No model call was made.')
  })

  it('says nothing merged at all, rather than blame the sync bot, when nothing did', async () => {
    const onlyReleased = JSON.stringify(JSON.parse(listJson).filter((pr: { number: number }) => [499, 500].includes(pr.number)))
    for (const list of ['[]', onlyReleased]) {
      const h = harness({ list })
      expect(await runUnreleased([], h.deps)).toBe(0)
      expect(h.modelCalls).toEqual([])
      expect(h.out.at(-1)).toBe('Nothing to draft: no PR has merged into main since v1.2.3. No model call was made.')
    }
  })

  it('prints the list and one failure line, and exits 1, when the model part fails', async () => {
    for (const model of [
      readFileSync('tests/fixtures/pm/claude-signed-out.json', 'utf8'),
      'not json',
      answer({ ...draft, fixed: [{ text: 'The table fits.', prs: [999] }] }),
      // The live draft Codex saw: a two-sentence lead with no citation.
      answer({ ...draft, lead: 'These changes leave what a reader sees untouched. The groundwork is laid.' }),
      answer({ ...draft, lead: { text: 'One. Two.', prs: [502] } }),
      // Codex's re-read: both of these exited 0 and printed a draft.
      answer({ ...draft, lead: { text: 'The table fits small screens (#999).', prs: [502] } }),
      answer({ ...draft, lead: { text: '.', prs: [502] } }),
      // The same holes in a section line.
      answer({ ...draft, changed: [{ text: 'The table fits small screens (#999).', prs: [502] }] }),
      answer({ ...draft, changed: [{ text: '.', prs: [502] }] }),
    ]) {
      const h = harness({ model, terminal: false })
      expect(await runUnreleased([], h.deps)).toBe(1)
      expect(h.out).toHaveLength(2)
      expect(h.out[0]).toContain('| [#504]')
      expect(h.out[1]).toMatch(/^Model part failed: .+\. The \[Unreleased\] draft was not produced/)
      expect(h.out.join('\n')).not.toContain('## Draft')
      expect(h.err).toEqual([h.out[1]])
    }
  })

  it('refuses a list that may have been cut short at the limit', async () => {
    const many = JSON.stringify(Array.from({ length: LIST_LIMIT }, (_, i) => ({ ...JSON.parse(listJson)[0], number: 1000 + i })))
    const h = harness({ list: many })
    expect(await runUnreleased([], h.deps)).toBe(2)
    expect(h.err[0]).toBe(`Could not list the merged PRs: gh returned ${LIST_LIMIT} PRs, the limit, so the list may be cut short`)
    expect(h.modelCalls).toEqual([])
  })

  it('refuses a shallow clone, where ancestry cannot be trusted', async () => {
    const h = harness({ shallow: true })
    expect(await runUnreleased([], h.deps)).toBe(2)
    expect(h.err[0]).toMatch(/shallow/)
    expect(h.calls).toHaveLength(1)
  })

  it('takes no arguments', async () => {
    const h = harness()
    expect(await runUnreleased(['--write'], h.deps)).toBe(2)
    expect(h.calls).toEqual([])
  })
})

describe('a draft that cites a PR in its own text', () => {
  // GitHub's reference forms for issues and pull requests, from "Autolinked references and URLs"
  // on docs.github.com, plus the same reference in words. Only #502 is sent: the list leaves out
  // #504, the fixture's other unreleased PR, and each run checks what the model was given. #327,
  // #361 and golang/go's 10047 are real numbers that were not sent.
  const only502 = JSON.stringify(JSON.parse(listJson).filter((pr: { number: number }) => pr.number !== 504))
  const run = async (structured: unknown) => {
    const h = harness({ model: answer(structured), list: only502 })
    const code = await runUnreleased([], h.deps)
    const call = h.modelCalls[0]!
    const schema = JSON.parse(call.args[call.args.indexOf('--json-schema') + 1]!)
    // With one PR sent, zod writes the literal as a const rather than a one-value enum.
    expect(schema.properties.lead.properties.prs.items).toEqual({ type: 'number', const: 502 })
    expect(call.stdin).toContain('BEGIN PR #502>>>')
    expect(call.stdin).not.toContain('PR #504')
    return { h, code }
  }
  const changelogLink = 'https://github.com/BeniCheni/kickoff/blob/main/CHANGELOG.md'
  const forms: [string, string][] = [
    // Link targets: refused only when they are an issue or pull request address.
    ['an issue or pull request URL', 'The table fits, as [the change](https://github.com/BeniCheni/kickoff/pull/327) shows.'],
    ['an issue or pull request URL', 'The table fits, as https://github.com/BeniCheni/kickoff/pull/327 shows.'],
    ['an issue or pull request URL', 'The table fits, as [the issue](https://github.com/BeniCheni/kickoff/issues/361) asked.'],
    ['an issue or pull request URL', 'The table fits, as [the change](../pull/327) shows.'],
    ['an issue or pull request URL', 'The table fits, as [the change](https://redirect.github.com/BeniCheni/kickoff/pull/327) shows.'],
    ['an issue or pull request URL', 'The Go [bug](https://github.com/golang/go/issues/10047) is fixed upstream.'],
    // Visible text, link labels included: GitHub's short forms and the words, as whole tokens.
    ['an owner/repo#N reference', 'The table fits, as BeniCheni/kickoff#327 shows.'],
    ['a #N reference', 'The table fits small screens (#999).'],
    ['a #N reference', `The table fits, as [#327](${changelogLink}) shows.`],
    ['a GH-N reference', 'The table fits, as GH-327 shows.'],
    ['a GH-N reference', 'The table fits, as gh-327 shows.'],
    ['a PR or issue named by number', 'The table fits, per pull request 999.'],
    ['a PR or issue named by number', 'The table fits, as issue 361 asked.'],
    ['a PR or issue named by number', `The table fits, as [issue 361](${changelogLink}) asked.`],
    // True, but refused on purpose: each can be told without the number, as the README says.
    ['a PR or issue named by number', 'Overhaul PR 0 pinned the honesty rules.'],
    ['a PR or issue named by number', 'PR 7b trims the fonts.'],
    ['a PR or issue named by number', 'Pass 0 can issue 3 GitHub reads for one small pull request.'],
    ['a PR or issue named by number', 'Pass 0 reads each pull request 100 commits at a time.'],
  ]
  const positions = ['lead', 'added', 'changed', 'fixed', 'notDone'] as const
  const placed = (key: (typeof positions)[number], text: string) =>
    key === 'lead' ? { ...draft, lead: { text, prs: [502] } } : { ...draft, [key]: [{ text, prs: [502] }] }

  it('agrees with the README\'s table of true lines that fail, and their rewordings', () => {
    const readme = readFileSync('scripts/pm/README.md', 'utf8').split('\n')
    const header = readme.findIndex((line) => line.includes('| Fails ("a PR or issue named by number") | Passes |'))
    const rows: string[][] = []
    for (const line of readme.slice(header + 2)) {
      if (!line.trim().startsWith('|')) break
      rows.push(line.split('|').slice(1, -1).map((cell) => cell.trim()))
    }
    expect(rows).toHaveLength(4)
    for (const [fails, passes] of rows) {
      expect(proseReference(fails!)).toBe('a PR or issue named by number')
      expect(proseReference(passes!)).toBeUndefined()
    }
  })

  it('refuses each form in the lead and in every section, and says which form it found', async () => {
    for (const [form, text] of forms) {
      for (const key of positions) {
        const { h, code } = await run(placed(key, text))
        expect(code, `${key}: ${text}`).toBe(1)
        expect(h.out).toHaveLength(2)
        expect(h.out[1]).toContain(`cites ${form} in its text, where only prs may cite`)
        expect(h.out.join('\n')).not.toContain('## Draft')
      }
    }
  })

  it('still prints true lines that hold other numbers, other links, or the overhaul without its name', async () => {
    for (const text of [
      'Kickoff v0.5.5 picks up Vitest 4.1.12 and fits a 390 px phone.',
      'The demo at `https://benicheni.github.io/kickoff/` redeploys on every push.',
      'The overhaul pinned the honesty rules.',
      // Codex's third re-read: a source file named issue10047.go is not issue 10047.
      'The [regression test](https://github.com/golang/go/blob/go1.23.0/test/fixedbugs/issue10047.go) is a Go source file.',
      // Its other controls, and the rewordings that keep the facts of the refused prose above.
      `The [changelog](${changelogLink}) keeps the release notes.`,
      'The [preview run](https://github.com/BeniCheni/kickoff/actions/runs/45104332843/job/137462044178) passed.',
      'The [overhaul brief](https://github.com/BeniCheni/kickoff/blob/main/docs/design-overhaul-pr0-implementation-prompt.md) is public.',
      'Pass 0 can make three GitHub reads for one small pull request.',
      'Pass 0 reads commits in pages of 100.',
    ]) {
      for (const key of positions) {
        const { h, code } = await run(placed(key, text))
        expect(code, `${key}: ${text}`).toBe(0)
        expect(h.out.join('\n')).toContain(citeLine(text, [502]))
      }
    }
  })
})
