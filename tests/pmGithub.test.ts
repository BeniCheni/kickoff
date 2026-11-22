import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  COMMITS_QUERY, FILES_QUERY, META_FIELDS, PAGE_SIZE, assembleList, checkFiles, flattenCommits, prSchema,
  readPullRequest, repoOf,
} from '../scripts/pm/github'
import { fakeGitHub, withCommits } from './fixtures/pm/fakeGitHub'

// No test here calls GitHub: `gh` is the scripted fake in tests/fixtures/pm/fakeGitHub.ts.
const pr = prSchema.parse(JSON.parse(readFileSync('tests/fixtures/pm/pr-view.json', 'utf8')))
const head = pr.headRefOid
const page = <N>(nodes: N[], totalCount: number, hasNextPage = false, headRefOid = head) => ({ headRefOid, totalCount, hasNextPage, nodes })
const numbers = (from: number, to: number) => Array.from({ length: to - from }, (_, i) => from + i)

describe('assembleList', () => {
  it('joins pages that reach their total', () => {
    expect(assembleList('commits', [page(numbers(0, 100), 101, true), page([100], 101)], head)).toEqual(numbers(0, 101))
  })

  it('stops when GitHub ends the list short of its own count', () => {
    expect(() => assembleList('commits', [page(numbers(0, 100), 101)], head))
      .toThrow('GitHub returned 100 of the PR\'s 101 commits, so the skeleton would be incomplete')
  })

  it('stops when the head or the count moved between pages', () => {
    expect(() => assembleList('commits', [page([1], 2, true), page([2], 2, false, 'f'.repeat(40))], head)).toThrow(/head moved/)
    expect(() => assembleList('files', [page([1], 2, true), page([2], 3)], head)).toThrow(/count changed/)
  })

  it('stops when the pages ran out before the list did', () => {
    expect(() => assembleList('files', [page([1], 2, true)], head)).toThrow(/more than 100 files/)
  })

  it('refuses an empty set of pages', () => {
    expect(() => assembleList('files', [], head)).toThrow(/no page/)
  })
})

describe('readPullRequest', () => {
  it('reads the PR\'s fields with gh pr view, then its commits and files through GraphQL', async () => {
    const gh = fakeGitHub(pr)
    expect(await readPullRequest(gh.run, 4242)).toEqual(pr)
    expect(gh.calls[0]).toEqual(['gh', 'pr', 'view', '4242', '--json', META_FIELDS])
    expect(META_FIELDS.split(',')).not.toContain('commits')
    expect(gh.calls[1]).toEqual(['gh', 'api', 'graphql', '-f', `query=${COMMITS_QUERY}`, '-f', 'owner=example', '-f', 'name=kickoff', '-F', 'number=4242'])
    expect(gh.calls[2]?.[4]).toBe(`query=${FILES_QUERY}`)
    expect(gh.calls).toHaveLength(3)
  })

  it('reads exactly 100 commits in one page', async () => {
    const gh = fakeGitHub(withCommits(pr, PAGE_SIZE))
    const read = await readPullRequest(gh.run, 4242)
    expect(read.commits).toHaveLength(100)
    expect(gh.calls.filter((call) => call.includes(`query=${COMMITS_QUERY}`))).toHaveLength(1)
  })

  it('reads the 101st commit from a second page, so its vendor is counted', async () => {
    const gh = fakeGitHub(withCommits(pr, PAGE_SIZE + 1))
    const read = await readPullRequest(gh.run, 4242)
    expect(read.commits).toHaveLength(101)
    expect(read.commits.at(-1)?.authors[0]?.name).toBe('Codex')
    const commitCalls = gh.calls.filter((call) => call.includes(`query=${COMMITS_QUERY}`))
    expect(commitCalls).toHaveLength(2)
    expect(commitCalls[1]?.slice(-2)).toEqual(['-f', 'after=cursor-100'])
  })

  it('refuses a commit list GitHub cut short, as it does past 250', async () => {
    await expect(readPullRequest(fakeGitHub(withCommits(pr, 101), { commitCap: 100 }).run, 4242))
      .rejects.toThrow('GitHub returned 100 of the PR\'s 101 commits, so the skeleton would be incomplete')
    await expect(readPullRequest(fakeGitHub(withCommits(pr, 340), { commitCap: 250 }).run, 4242))
      .rejects.toThrow('GitHub returned 250 of the PR\'s 340 commits')
  })

  it('refuses a read during which the head moved', async () => {
    await expect(readPullRequest(fakeGitHub(pr, { headMovesAtCall: 1 }).run, 4242)).rejects.toThrow(/head moved from ccccccc to fffffff/)
  })

  it('passes on gh\'s own failure', async () => {
    await expect(readPullRequest(fakeGitHub(pr, { viewFails: 'GraphQL: Could not resolve to a PullRequest' }).run, 4242))
      .rejects.toThrow('gh pr failed: GraphQL: Could not resolve to a PullRequest')
  })
})

describe('the PR\'s own totals', () => {
  it('must agree with the files listed', () => {
    expect(() => checkFiles(pr, pr.files)).not.toThrow()
    expect(() => checkFiles({ ...pr, changedFiles: 140 }, pr.files)).toThrow('GitHub listed 3 files (+120 −8) but counts 140 changed (+120 −8)')
    expect(() => checkFiles({ ...pr, additions: 121 }, pr.files)).toThrow(/counts 3 changed \(\+121 −8\)/)
  })
})

describe('flattenCommits', () => {
  it('refuses a commit whose authors were cut short', () => {
    const node = { commit: { oid: 'a'.repeat(40), messageHeadline: 'h', messageBody: '', authors: { totalCount: 101, nodes: [{ name: 'Claude', email: 'noreply@anthropic.com' }] } } }
    expect(() => flattenCommits([node])).toThrow('commit aaaaaaa credits 101 authors and GitHub returned 1')
  })
})

describe('repoOf', () => {
  it('reads the owner and name from the PR\'s own URL', () => {
    expect(repoOf('https://github.com/BeniCheni/kickoff/pull/350', 350)).toEqual({ owner: 'BeniCheni', name: 'kickoff', number: 350 })
    expect(() => repoOf('https://github.com/BeniCheni/kickoff/pull/350', 351)).toThrow()
    expect(() => repoOf('https://example.com/not-a-pr', 350)).toThrow()
  })
})
