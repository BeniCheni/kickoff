import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { jsonSchemaFor, type ModelRunner } from '../scripts/pm/model'
import type { CommandRunner, ProcessResult } from '../scripts/pm/process'
import {
  LIST_FIELDS, LIST_LIMIT, brooklynStamp, citeLine, currentUnreleased, draftBlocks, draftSchema, isOneSentence,
  isSyncPr, mergedPrSchema, renderDraft, runUnreleased, searchSince, splitPrs, uncited, type Draft,
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
    expect(schema.safeParse({ ...draft, fixed: [{ text: 'x', prs: [320] }] }).success).toBe(false)
    expect(schema.safeParse({ ...draft, fixed: [{ text: 'x', prs: [] }] }).success).toBe(false)
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

  it('prints the list and one failure line, and exits 1, when the model part fails', async () => {
    for (const model of [
      readFileSync('tests/fixtures/pm/claude-signed-out.json', 'utf8'),
      'not json',
      answer({ ...draft, fixed: [{ text: 'x', prs: [999] }] }),
      // The live draft Codex saw: a two-sentence lead with no citation.
      answer({ ...draft, lead: 'These changes leave what a reader sees untouched. The groundwork is laid.' }),
      answer({ ...draft, lead: { text: 'One. Two.', prs: [502] } }),
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
