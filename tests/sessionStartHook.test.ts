import { spawnSync } from 'node:child_process'
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, join } from 'node:path'
import { expect, it } from 'vitest'
import { formatContext, type CommandResult } from '../.claude/hooks/session-start.mjs'
import settings from '../.claude/settings.json'

const now = Date.parse('2026-11-22T14:30:00Z')
const url = 'https://github.com/BeniCheni/kickoff/actions/runs/123'
const unknownSync = 'Sync main: unknown. Check before any Step 0.'
const stepZero = 'Step 0 needs independent primary-source re-verification. See CLAUDE.md, “Scheduled sync”.'
const success = (stdout: string): CommandResult => ({ status: 0, stdout, stderr: '' })
const timeout: CommandResult = { status: null, stdout: '', stderr: '' }
const run = { createdAt: '2026-11-22T12:15:00Z', url, status: 'completed', conclusion: 'success' }
const draft = success(JSON.stringify({ number: 42, state: 'OPEN', isDraft: true }))
const noPr = { status: 1, stdout: '', stderr: 'no pull requests found for branch "topic"\n' }

function tree(path: string, head: string) {
  return `worktree ${path}\0HEAD abc123\0${head}\0\0`
}

const fixtures = {
  sync: success(JSON.stringify([run])),
  worktrees: success(tree('/example/kickoff tree', 'branch refs/heads/topic')),
  branch: success('topic\n'),
  pr: noPr,
}

it('shows the latest successful sync, a worktree with spaces, and no PR', () => {
  expect(formatContext(fixtures, now)).toEqual([
    `Sync main: success (2h ago) ${url}`,
    'Worktree: /example/kickoff tree (topic)',
    'Branch: topic | No PR',
  ])
})

it.each([
  ['completed', 'failure', 'failure'],
  ['in_progress', '', 'in_progress'],
])('requires primary-source re-verification for %s / %s', (status, conclusion, outcome) => {
  const sync = success(JSON.stringify([{ ...run, status, conclusion }]))
  expect(formatContext({ ...fixtures, sync }, now)[0]).toBe(`Sync main: ${outcome} (2h ago) ${url} | ${stepZero}`)
})

it.each([
  ['a timeout with partial stdout', { ...timeout, stdout: fixtures.sync.stdout }],
  ['a nonzero exit', { status: 1, stdout: '', stderr: 'gh auth login' }],
  ['an empty run list', success('[]')],
  ['malformed JSON', success('{"conclusion":')],
  ['success in the status field alone', success(JSON.stringify([{ ...run, status: 'success', conclusion: '' }]))],
])('keeps sync status unknown for %s', (_case, sync) => {
  expect(formatContext({ ...fixtures, sync }, now)[0]).toBe(unknownSync)
})

it('shows the draft or non-draft status of a PR', () => {
  expect(formatContext({ ...fixtures, pr: draft }, now).at(-1)).toBe('Branch: topic | PR #42 (open, draft)')
  const merged = success(JSON.stringify({ number: 43, state: 'MERGED', isDraft: false }))
  expect(formatContext({ ...fixtures, pr: merged }, now).at(-1)).toBe('Branch: topic | PR #43 (merged, non-draft)')
})

it('distinguishes an empty worktree list, a detached HEAD and unavailable queries', () => {
  expect(formatContext({ ...fixtures, worktrees: success(''), branch: success('') }, now).slice(1))
    .toEqual(['Worktrees: none.', 'Branch: detached HEAD | No PR'])
  expect(formatContext({ ...fixtures, worktrees: timeout, branch: timeout }, now).slice(1))
    .toEqual(['Worktrees: unknown.', 'Branch: unknown | PR unknown'])
  expect(formatContext({ ...fixtures, pr: timeout }, now).at(-1)).toBe('Branch: topic | PR unknown')
})

it('includes the current worktree and limits a long list to eight context lines', () => {
  const others = [
    tree('/example/main', 'branch refs/heads/main'),
    tree('/example/detached\nfolder', 'detached\0prunable stale gitdir'),
    ...Array.from({ length: 6 }, (_, i) => tree(`/example/other-${i}`, `branch refs/heads/other-${i}`)),
  ].join('')
  const worktrees = success(others + fixtures.worktrees.stdout)
  const lines = formatContext({ ...fixtures, worktrees }, now, '/example')
  expect(lines).toHaveLength(8)
  expect(lines[1]).toBe('Worktree: ~/kickoff tree (topic)')
  expect(lines[3]).toBe('Worktree: ~/detached\\u000afolder (detached HEAD, prunable)')
  expect(lines[6]).toBe('Worktree: ~/other-2 (other-2) +3 more')
  expect(lines[7]).toBe('Branch: topic | No PR')
})

it('runs the configured hook with SessionStart stdin and fake gh and git on PATH', () => {
  const directory = realpathSync(mkdtempSync(join(tmpdir(), 'kickoff-session-start-')))
  try {
    const liveRun = { ...run, createdAt: new Date().toISOString() }
    writeFileSync(join(directory, 'gh'), `#!/bin/sh
[ "$PWD" = "$HOOK_TEST_CWD" ] && [ "$GH_PROMPT_DISABLED" = "1" ] && [ "$GH_TELEMETRY" = "0" ] || exit 99
case "$*" in
  'run list --repo github.com/BeniCheni/kickoff --workflow=sync.yml --branch main --limit 1 --json conclusion,status,createdAt,url')
    printf '%s\\n' '${JSON.stringify([liveRun])}' ;;
  'pr view --json number,state,isDraft') printf '%s\\n' '${draft.stdout}' ;;
  *) exit 99 ;;
esac
`, { mode: 0o755 })
    writeFileSync(join(directory, 'git'), `#!/bin/sh
[ "$PWD" = "$HOOK_TEST_CWD" ] && [ "$GIT_OPTIONAL_LOCKS" = "0" ] || exit 99
case "$*" in
  'worktree list --porcelain -z') printf 'worktree /example/kickoff tree\\000HEAD abc123\\000branch refs/heads/topic\\000\\000' ;;
  'branch --show-current') printf 'topic\\n' ;;
  *) exit 99 ;;
esac
`, { mode: 0o755 })

    const hook = settings.hooks.SessionStart[0]!.hooks[0]!
    const project = join(import.meta.dirname, '..')
    const result = spawnSync(hook.command, hook.args.map(arg => arg.replace('${CLAUDE_PROJECT_DIR}', project)), {
      cwd: project,
      env: { ...process.env, PATH: `${directory}${delimiter}${process.env.PATH}`, HOOK_TEST_CWD: directory },
      input: JSON.stringify({
        session_id: 'test-session',
        transcript_path: join(directory, 'transcript.jsonl'),
        cwd: directory,
        hook_event_name: 'SessionStart',
        source: 'startup',
      }),
      encoding: 'utf8',
      timeout: hook.timeout * 1_000,
      killSignal: 'SIGKILL',
    })
    expect(result.error).toBeUndefined()
    expect(result.status).toBe(0)
    expect(result.stderr).toBe('')
    expect(result.stdout.trimEnd().split('\n')).toEqual([
      `Sync main: success (0m ago) ${url}`,
      'Worktree: /example/kickoff tree (topic)',
      'Branch: topic | PR #42 (open, draft)',
    ])
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
