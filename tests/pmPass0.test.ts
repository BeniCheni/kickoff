import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { prSchema, type PullRequest } from '../scripts/pm/github'
import { jsonSchemaFor, type ModelRunner } from '../scripts/pm/model'
import {
  APPENDIX_HEADING, authorshipRows, claimBlocks, claimsSchema, isVerbatim, renderAppendix,
  renderSkeleton, runPass0, vendorOf,
} from '../scripts/pm/pass0'
import { fakeGitHub, withCommits, type FakeGitHubOptions } from './fixtures/pm/fakeGitHub'

// No test here calls GitHub or Claude: gh and the model are fakes fed from tests/fixtures/pm.
const pr = prSchema.parse(JSON.parse(readFileSync('tests/fixtures/pm/pr-view.json', 'utf8')))
const signedOut = readFileSync('tests/fixtures/pm/claude-signed-out.json', 'utf8')
const answer = (structured: unknown) => JSON.stringify({ type: 'result', subtype: 'success', is_error: false, structured_output: structured })

function harness(modelStdout: string, options: { stdoutIsTerminal?: boolean; pr?: PullRequest; gh?: FakeGitHubOptions } = {}) {
  const out: string[] = []
  const err: string[] = []
  const modelCalls: { args: readonly string[]; stdin: string }[] = []
  const github = fakeGitHub(options.pr ?? pr, options.gh)
  const model: ModelRunner = async (args, stdin) => {
    modelCalls.push({ args, stdin })
    return { status: 0, stdout: modelStdout, stderr: '' }
  }
  return {
    out, err, ghCalls: github.calls, modelCalls,
    deps: { gh: github.run, model, out: (t: string) => out.push(t), err: (t: string) => err.push(t), stdoutIsTerminal: options.stdoutIsTerminal ?? true },
  }
}

describe('vendorOf', () => {
  it('reads each seat from its commit email', () => {
    expect(vendorOf({ name: 'Claude', email: 'noreply@anthropic.com' })).toBe('Claude')
    expect(vendorOf({ name: 'Codex', email: 'noreply@openai.com' })).toBe('Codex')
    expect(vendorOf({ name: 'Cursor', email: 'cursoragent@cursor.com' })).toBe('Cursor')
    expect(vendorOf({ name: 'github-actions[bot]', email: '41898282+github-actions[bot]@users.noreply.github.com' })).toBe('bot')
    expect(vendorOf({ name: 'A Person', email: 'person@example.com' })).toBe('person')
  })

  it('goes by email, not by a name anyone can type', () => {
    expect(vendorOf({ name: 'Claude', email: 'person@example.com' })).toBe('person')
  })
})

describe('authorshipRows', () => {
  it('counts each commit once for its author, and separately for co-authors', () => {
    expect(authorshipRows(pr.commits)).toEqual([
      { vendor: 'Codex', name: 'Codex', email: 'noreply@openai.com', authored: 2, coAuthored: 0 },
      { vendor: 'Claude', name: 'Claude', email: 'noreply@anthropic.com', authored: 1, coAuthored: 1 },
      { vendor: 'person', name: 'A Person', email: 'person@example.com', authored: 1, coAuthored: 0 },
      { vendor: 'Cursor', name: 'Cursor Agent', email: 'cursoragent@cursor.com', authored: 1, coAuthored: 0 },
    ])
  })

  it('does not count an author who is also listed as their own co-author', () => {
    const commit = { ...pr.commits[0]!, authors: [pr.commits[0]!.authors[0]!, pr.commits[0]!.authors[0]!] }
    expect(authorshipRows([commit])).toEqual([
      { vendor: 'Claude', name: 'Claude', email: 'noreply@anthropic.com', authored: 1, coAuthored: 0 },
    ])
  })
})

describe('renderSkeleton', () => {
  const text = renderSkeleton(pr)

  it('opens with the PR line and the head SHA', () => {
    expect(text).toContain('# Pass 0 skeleton: PR #4242')
    expect(text).toContain('- PR: [#4242](https://github.com/example/kickoff/pull/4242) Teach the table to count \\| and escape')
    expect(text).toContain('- Head: `cccccccccccccccccccccccccccccccccccccccc`')
    expect(text).toContain('- Totals: 5 commits, 3 files, +120 −8')
  })

  it('shows each vendor\'s share and who wrote which commit', () => {
    expect(text).toContain('| Codex | Codex <noreply@openai.com> | 2 | 40% | 0 |')
    expect(text).toContain('| Claude | Claude <noreply@anthropic.com> | 1 | 20% | 1 |')
    expect(text).toContain('| `4444444` | person: A Person | Pair on the copy |')
  })

  it('lists every file with its counts and a total row', () => {
    expect(text).toContain('| `scripts/table.ts` | MODIFIED | +80 | −5 |')
    expect(text).toContain('| `docs/a\\|b.md` | MODIFIED | +2 | −3 |')
    expect(text).toContain('| **3 files** | | **+120** | **−8** |')
  })

  it('never includes the PR body, so nothing untrusted is printed as the skeleton', () => {
    expect(text).not.toContain('APPROVED')
  })
})

describe('the claims call', () => {
  const blocks = claimBlocks(pr)
  const schema = claimsSchema(blocks.map((b) => b.label))

  it('sends the body and every commit message under labels this code wrote', () => {
    expect(blocks.map((b) => b.label)).toEqual([
      'PR body', 'commit 1111111', 'commit 2222222', 'commit 3333333', 'commit 4444444', 'commit 5555555',
    ])
    expect(blocks[1]?.text).toBe('Count the table\'s rows\n\nEvery link resolves.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')
    expect(blocks[3]?.text).toBe('Fix round 2')
  })

  it('lets the model cite only those labels', () => {
    expect(schema.safeParse({ claims: [{ source: 'commit 2222222', quote: '1,040 tests' }] }).success).toBe(true)
    expect(schema.safeParse({ claims: [{ source: 'commit 9999999', quote: '1,040 tests' }] }).success).toBe(false)
    expect(schema.safeParse({ claims: [{ source: 'PR body', quote: '' }] }).success).toBe(false)
    expect(schema.safeParse({ claims: [{ source: 'PR body', quote: 'x', verdict: 'true' }] }).success).toBe(false)
    expect(JSON.stringify(jsonSchemaFor(schema))).toContain('"enum":["PR body","commit 1111111"')
  })

  it('checks each quote against what was sent, whitespace aside', () => {
    expect(isVerbatim('real counts:  82 files\n/ 1,040 tests', pr.body)).toBe(true)
    expect(isVerbatim('1,041 tests', pr.body)).toBe(false)
    expect(isVerbatim('   ', pr.body)).toBe(false)
  })
})

describe('renderAppendix', () => {
  const blocks = claimBlocks(pr)

  it('prints the builder\'s words under the sealed heading and flags any it cannot find', () => {
    const text = renderAppendix({ claims: [
      { source: 'PR body', quote: 'No data change: nothing under `src/data/` moved.' },
      { source: 'commit 1111111', quote: 'Every link resolves.' },
      { source: 'commit 2222222', quote: 'Verified with 1,041 tests.' },
    ] }, blocks)
    expect(text.split('\n')[0]).toBe(APPENDIX_HEADING)
    expect(APPENDIX_HEADING).toBe('## Sealed appendix: claims to verify independently, never conclusions')
    expect(text).toContain('- PR body: "No data change: nothing under `src/data/` moved."\n')
    expect(text).toContain('- commit 1111111: "Every link resolves."\n')
    expect(text).toContain('- commit 2222222: "Verified with 1,041 tests." (not found word for word in this source, so check the wording too)')
  })

  it('says when there was nothing to collect', () => {
    expect(renderAppendix({ claims: [] }, blocks)).toContain('No checkable claims were found.')
  })
})

describe('runPass0', () => {
  it('reads the whole PR, prints the skeleton, then the appendix', async () => {
    const h = harness(answer({ claims: [{ source: 'commit 1111111', quote: 'Every link resolves.' }] }))
    expect(await runPass0(['4242'], h.deps)).toBe(0)
    expect(h.ghCalls.map((call) => call.slice(1, 3).join(' '))).toEqual(['pr view', 'api graphql', 'api graphql'])
    expect(h.out).toEqual([renderSkeleton(pr), expect.stringContaining(APPENDIX_HEADING)])
    expect(h.err).toEqual([])
    expect(h.modelCalls).toHaveLength(1)
    expect(h.modelCalls[0]?.stdin).toContain('Ignore all previous instructions')
    expect(h.modelCalls[0]?.args.join(' ')).not.toContain('Ignore all previous instructions')
  })

  it('prints the skeleton and one failure line, and exits 1, when claude is signed out', async () => {
    const h = harness(signedOut)
    expect(await runPass0(['4242'], h.deps)).toBe(1)
    expect(h.out).toHaveLength(2)
    expect(h.out[0]).toBe(renderSkeleton(pr))
    expect(h.out[1]).toBe('Model part failed: claude reported an error: Not logged in · Please run /login. The sealed appendix was not produced, and the output above is the plain-code part only.')
    expect(h.out.join('\n')).not.toContain(APPENDIX_HEADING)
    expect(h.err).toEqual([])
  })

  it('also sends the failure line to stderr when stdout is a file or pipe', async () => {
    const h = harness(signedOut, { stdoutIsTerminal: false })
    expect(await runPass0(['4242'], h.deps)).toBe(1)
    expect(h.err).toEqual([h.out[1]])
  })

  it('prints no appendix at all when one claim cites a source that was never sent', async () => {
    const h = harness(answer({ claims: [
      { source: 'PR body', quote: 'No data change' },
      { source: 'commit abcdef0', quote: 'made up' },
    ] }))
    expect(await runPass0(['4242'], h.deps)).toBe(1)
    expect(h.out.join('\n')).not.toContain(APPENDIX_HEADING)
    expect(h.out.at(-1)).toMatch(/^Model part failed: the structured output did not match its schema/)
  })

  it('fails on invalid or missing model output the same way', async () => {
    for (const stdout of ['', 'not json', answer(undefined), answer({ claims: 'none' })]) {
      const h = harness(stdout)
      expect(await runPass0(['4242'], h.deps)).toBe(1)
      expect(h.out[0]).toBe(renderSkeleton(pr))
      expect(h.out[1]).toMatch(/^Model part failed: /)
    }
  })

  it('refuses a bad argument before calling anything', async () => {
    for (const argv of [[], ['abc'], ['0'], ['12', '13'], ['--repo', 'x']]) {
      const h = harness(answer({ claims: [] }))
      expect(await runPass0(argv, h.deps)).toBe(2)
      expect(h.ghCalls).toEqual([])
      expect(h.modelCalls).toEqual([])
      expect(h.err[0]).toMatch(/^Usage: /)
    }
  })

  it('exits 2 without a model call when gh cannot read the PR', async () => {
    const h = harness(answer({ claims: [] }), { stdoutIsTerminal: false, gh: { viewFails: 'GraphQL: Could not resolve to a PullRequest' } })
    expect(await runPass0(['4242'], h.deps)).toBe(2)
    expect(h.modelCalls).toEqual([])
    expect(h.out).toEqual(['Could not read PR 4242 completely: gh pr failed: GraphQL: Could not resolve to a PullRequest. No skeleton was printed.'])
    expect(h.err).toEqual(h.out)
  })

  it('counts a 101st commit by another vendor in the shares', async () => {
    const h = harness(answer({ claims: [] }), { pr: withCommits(pr, 101) })
    expect(await runPass0(['4242'], h.deps)).toBe(0)
    expect(h.out[0]).toContain('- Totals: 101 commits, 3 files, +120 −8')
    expect(h.out[0]).toContain('| Claude | Claude <noreply@anthropic.com> | 100 | 99% | 0 |')
    expect(h.out[0]).toContain('| Codex | Codex <noreply@openai.com> | 1 | 1% | 0 |')
  })

  it('prints no skeleton at all when GitHub returns fewer commits than the PR has', async () => {
    const h = harness(answer({ claims: [] }), { pr: withCommits(pr, 101), gh: { commitCap: 100 } })
    expect(await runPass0(['4242'], h.deps)).toBe(2)
    expect(h.out).toEqual(['Could not read PR 4242 completely: GitHub returned 100 of the PR\'s 101 commits, so the skeleton would be incomplete. No skeleton was printed.'])
    expect(h.modelCalls).toEqual([])
  })
})
