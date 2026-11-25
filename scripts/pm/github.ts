import { z } from 'zod'
import { runOk, type CommandRunner } from './process'

/**
 * Reads one PR completely, or throws.
 *
 * `gh pr view --json commits,files` asks GitHub for the first 100 of each and says nothing when
 * there are more (gh 2.105.0's query has no total and no cursor). For Pass 0 that is the record of
 * who may cold-review a PR, so a 101st commit by another vendor would vanish and every share would
 * print as complete and wrong. So the PR's own fields come from `gh pr view`, and its commits and
 * files come from GraphQL page by page, each list checked against the connection's `totalCount`.
 */

export const META_FIELDS = [
  'number', 'title', 'url', 'headRefName', 'headRefOid', 'baseRefName', 'body', 'changedFiles', 'additions', 'deletions',
].join(',')
export const PAGE_SIZE = 100
/** 5,000 commits or files; a PR past that stops with a reason rather than print a partial list. */
export const MAX_PAGES = 50

const count = z.number().int().nonnegative()
const sha = z.string().regex(/^[0-9a-f]{40}$/)
export const authorSchema = z.object({ name: z.string(), email: z.string() })
export const metaSchema = z.object({
  number: z.number().int().positive(),
  title: z.string(),
  url: z.string(),
  headRefName: z.string(),
  headRefOid: sha,
  baseRefName: z.string(),
  body: z.string(),
  changedFiles: count,
  additions: count,
  deletions: count,
})
const commitSchema = z.object({
  oid: sha,
  messageHeadline: z.string(),
  messageBody: z.string(),
  authors: z.array(authorSchema).min(1),
})
const fileSchema = z.object({ path: z.string(), additions: count, deletions: count, changeType: z.string().optional() })
/** The whole PR, as Pass 0 renders it. */
export const prSchema = metaSchema.extend({ commits: z.array(commitSchema), files: z.array(fileSchema) })
export type PullRequest = z.infer<typeof prSchema>
export type Author = z.infer<typeof authorSchema>

const commitNode = z.object({
  commit: z.object({
    oid: sha,
    messageHeadline: z.string(),
    messageBody: z.string(),
    authors: z.object({ totalCount: count, nodes: z.array(authorSchema) }),
  }),
})
const fileNode = fileSchema.extend({ changeType: z.string() })

const query = (list: string) => `query($owner: String!, $name: String!, $number: Int!, $after: String) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      headRefOid
      list: ${list}
    }
  }
}`
const page = `first: ${PAGE_SIZE}, after: $after`
export const COMMITS_QUERY = query(`commits(${page}) { totalCount pageInfo { hasNextPage endCursor } nodes { commit { oid messageHeadline messageBody authors(first: 100) { totalCount nodes { name email } } } } }`)
export const FILES_QUERY = query(`files(${page}) { totalCount pageInfo { hasNextPage endCursor } nodes { path additions deletions changeType } }`)

function pageSchema<T extends z.ZodType>(node: T) {
  return z.object({
    data: z.object({
      repository: z.object({
        pullRequest: z.object({
          headRefOid: sha,
          list: z.object({
            totalCount: count,
            pageInfo: z.object({ hasNextPage: z.boolean(), endCursor: z.string().nullable() }),
            nodes: z.array(node),
          }),
        }),
      }),
    }),
  })
}

export interface Page<N> {
  headRefOid: string
  totalCount: number
  hasNextPage: boolean
  nodes: N[]
}

const short = (oid: string) => oid.slice(0, 7)

/** What makes a node itself: a commit's full OID, a file's path. A PR lists each one once. */
export type NodeKey<N> = (node: N) => string

/**
 * The pages joined into one list, or the reason they cannot be: the head moved between reads,
 * the pages ran out before the total, a node came back twice, or GitHub stopped short of its own
 * count. The count is of distinct nodes, so overlapping pages cannot make up a missing one.
 */
export function assembleList<N>(what: 'commits' | 'files', pages: readonly Page<N>[], headRefOid: string, key: NodeKey<N>): N[] {
  const first = pages[0]
  if (!first) throw new Error(`GitHub returned no page of ${what}`)
  for (const p of pages) {
    if (p.headRefOid !== headRefOid) {
      throw new Error(`the PR's head moved from ${short(headRefOid)} to ${short(p.headRefOid)} while its ${what} were read, so run it again`)
    }
    if (p.totalCount !== first.totalCount) throw new Error(`the PR's ${what} count changed while they were read, so run it again`)
  }
  if (pages.at(-1)?.hasNextPage) throw new Error(`the PR has more than ${pages.length * PAGE_SIZE} ${what}, past what this script reads`)
  const nodes = pages.flatMap((p) => p.nodes)
  const seen = new Set<string>()
  for (const node of nodes) {
    const id = key(node)
    if (seen.has(id)) {
      const name = what === 'commits' ? `commit ${short(id)}` : `file ${id}`
      throw new Error(`GitHub returned ${name} twice across the pages of ${what}, so their count cannot be trusted`)
    }
    seen.add(id)
  }
  if (nodes.length !== first.totalCount) {
    throw new Error(`GitHub returned ${nodes.length} of the PR's ${first.totalCount} ${what}, so the skeleton would be incomplete`)
  }
  return nodes
}

export interface RepoRef {
  owner: string
  name: string
  number: number
}

export function repoOf(url: string, number: number): RepoRef {
  const match = url.match(/^https:\/\/[^/]+\/([^/]+)\/([^/]+)\/pull\/(\d+)$/)
  if (!match || Number(match[3]) !== number) throw new Error(`cannot read the repository from the PR URL ${url}`)
  return { owner: match[1]!, name: match[2]!, number }
}

async function readList<T extends z.ZodType>(
  run: CommandRunner, what: 'commits' | 'files', ref: RepoRef, headRefOid: string, node: T, key: NodeKey<z.infer<T>>,
): Promise<z.infer<T>[]> {
  const schema = pageSchema(node)
  const pages: Page<z.infer<T>>[] = []
  let after: string | null = null
  for (let index = 0; index < MAX_PAGES; index++) {
    const raw = await runOk(run, 'gh', [
      'api', 'graphql',
      '-f', `query=${what === 'commits' ? COMMITS_QUERY : FILES_QUERY}`,
      '-f', `owner=${ref.owner}`,
      '-f', `name=${ref.name}`,
      '-F', `number=${ref.number}`,
      ...(after ? ['-f', `after=${after}`] : []),
    ])
    const parsed = schema.safeParse(JSON.parse(raw))
    if (!parsed.success) throw new Error(`GitHub's page ${index + 1} of ${what} was not the expected shape`)
    const pr = parsed.data.data.repository.pullRequest
    pages.push({ headRefOid: pr.headRefOid, totalCount: pr.list.totalCount, hasNextPage: pr.list.pageInfo.hasNextPage, nodes: pr.list.nodes })
    if (!pr.list.pageInfo.hasNextPage) break
    if (!pr.list.pageInfo.endCursor) throw new Error(`GitHub's page ${index + 1} of ${what} has more but no cursor`)
    after = pr.list.pageInfo.endCursor
  }
  return assembleList(what, pages, headRefOid, key)
}

/** Every commit with every author GitHub credits, or the reason the list cannot be trusted. */
export function flattenCommits(nodes: readonly z.infer<typeof commitNode>[]): PullRequest['commits'] {
  return nodes.map(({ commit }) => {
    if (commit.authors.nodes.length !== commit.authors.totalCount) {
      throw new Error(`commit ${short(commit.oid)} credits ${commit.authors.totalCount} authors and GitHub returned ${commit.authors.nodes.length}`)
    }
    return { oid: commit.oid, messageHeadline: commit.messageHeadline, messageBody: commit.messageBody, authors: commit.authors.nodes }
  })
}

/** The files must also agree with the PR's own totals, or the table and the totals line would disagree. */
export function checkFiles(meta: z.infer<typeof metaSchema>, files: PullRequest['files']): void {
  const added = files.reduce((sum, f) => sum + f.additions, 0)
  const deleted = files.reduce((sum, f) => sum + f.deletions, 0)
  if (files.length !== meta.changedFiles || added !== meta.additions || deleted !== meta.deletions) {
    throw new Error(`GitHub listed ${files.length} files (+${added} −${deleted}) but counts ${meta.changedFiles} changed (+${meta.additions} −${meta.deletions})`)
  }
}

export async function readCommits(run: CommandRunner, ref: RepoRef, headRefOid: string): Promise<PullRequest['commits']> {
  return flattenCommits(await readList(run, 'commits', ref, headRefOid, commitNode, (n) => n.commit.oid))
}

export async function readFiles(run: CommandRunner, ref: RepoRef, headRefOid: string): Promise<PullRequest['files']> {
  return readList(run, 'files', ref, headRefOid, fileNode, (n) => n.path)
}

export async function readPullRequest(run: CommandRunner, number: number): Promise<PullRequest> {
  const meta = metaSchema.parse(JSON.parse(await runOk(run, 'gh', ['pr', 'view', String(number), '--json', META_FIELDS])))
  const ref = repoOf(meta.url, meta.number)
  const commits = await readCommits(run, ref, meta.headRefOid)
  const files = await readFiles(run, ref, meta.headRefOid)
  checkFiles(meta, files)
  return prSchema.parse({ ...meta, commits, files })
}
