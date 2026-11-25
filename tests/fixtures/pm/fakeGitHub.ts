import { COMMITS_QUERY, FILES_QUERY, PAGE_SIZE, type PullRequest } from '../../../scripts/pm/github'
import type { CommandRunner, ProcessResult } from '../../../scripts/pm/process'

/**
 * A stand-in for `gh` that serves one PR the way GitHub does: its own fields from `gh pr view`,
 * and its commits and files from paged GraphQL. No test that uses it reaches GitHub.
 */
export interface FakeGitHubOptions {
  /** Stop the commit list here while still reporting the full total, as GraphQL does at 250. */
  commitCap?: number
  /** Report another head from this GraphQL call on (0-based), as if someone pushed mid-read. */
  headMovesAtCall?: number
  /** Make `gh pr view` fail with this stderr. */
  viewFails?: string
  /**
   * Serve node `again` a second time in place of node `index`, keeping every total right, as
   * pages that overlap would: Codex's re-read served commit 100 twice and never the 101st.
   */
  overlap?: { list: 'commits' | 'files'; index: number; again: number }
}

const overlapped = (nodes: unknown[], list: 'commits' | 'files', options: FakeGitHubOptions) => {
  const o = options.overlap
  return o?.list === list ? nodes.map((node, i) => (i === o.index ? nodes[o.again] : node)) : nodes
}

const ok = (stdout: string): ProcessResult => ({ status: 0, stdout, stderr: '' })

export function fakeGitHub(pr: PullRequest, options: FakeGitHubOptions = {}) {
  const calls: string[][] = []
  let graphqlCalls = 0
  const run: CommandRunner = async (command, args) => {
    calls.push([command, ...args])
    if (command !== 'gh') throw new Error(`fakeGitHub only plays gh, not ${command}`)
    if (args[0] === 'pr' && args[1] === 'view') {
      if (options.viewFails) return { status: 1, stdout: '', stderr: options.viewFails }
      const { commits: _commits, files: _files, ...meta } = pr
      return ok(JSON.stringify(meta))
    }
    if (args[0] !== 'api' || args[1] !== 'graphql') throw new Error(`unexpected gh call: ${args.join(' ')}`)
    const field = (name: string) => args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1)
    const query = field('query')
    const start = Number(field('after')?.replace('cursor-', '') ?? 0)
    const headRefOid = options.headMovesAtCall !== undefined && graphqlCalls >= options.headMovesAtCall ? 'f'.repeat(40) : pr.headRefOid
    graphqlCalls++
    let total: number
    let served: unknown[]
    if (query === COMMITS_QUERY) {
      total = pr.commits.length
      served = overlapped(pr.commits.slice(0, options.commitCap ?? total).map((c) => ({
        commit: {
          oid: c.oid, messageHeadline: c.messageHeadline, messageBody: c.messageBody,
          authors: { totalCount: c.authors.length, nodes: c.authors },
        },
      })), 'commits', options)
    } else if (query === FILES_QUERY) {
      total = pr.files.length
      served = overlapped(pr.files.map((f) => ({ ...f, changeType: f.changeType ?? 'MODIFIED' })), 'files', options)
    } else {
      throw new Error('unexpected GraphQL query')
    }
    const nodes = served.slice(start, start + PAGE_SIZE)
    const end = start + nodes.length
    const hasNextPage = end < served.length
    return ok(JSON.stringify({
      data: { repository: { pullRequest: {
        headRefOid,
        list: { totalCount: total, pageInfo: { hasNextPage, endCursor: hasNextPage ? `cursor-${end}` : null }, nodes },
      } } },
    }))
  }
  return { run, calls }
}

/** A PR of `count` commits: every one by Claude except the last, by Codex. */
export function withCommits(pr: PullRequest, count: number): PullRequest {
  const claude = { name: 'Claude', email: 'noreply@anthropic.com' }
  const codex = { name: 'Codex', email: 'noreply@openai.com' }
  return {
    ...pr,
    commits: Array.from({ length: count }, (_, i) => ({
      // Unique in its first seven hex digits, so every commit gets its own source label.
      oid: (0x1000000 + i).toString(16).padEnd(40, 'a'),
      messageHeadline: `Commit ${i + 1}`,
      messageBody: '',
      authors: [i === count - 1 ? codex : claude],
    })),
  }
}

/**
 * A PR of `count` files, each +1 −0, with the PR's own totals to match. Every file has the same
 * counts, so a repeated file in place of a missing one leaves the totals check satisfied.
 */
export function withFiles(pr: PullRequest, count: number): PullRequest {
  return {
    ...pr,
    changedFiles: count,
    additions: count,
    deletions: 0,
    files: Array.from({ length: count }, (_, i) => ({ path: `src/file-${i + 1}.ts`, additions: 1, deletions: 0, changeType: 'ADDED' })),
  }
}
