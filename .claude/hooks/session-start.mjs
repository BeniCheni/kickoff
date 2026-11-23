#!/usr/bin/env node
// Claude Code injects this SessionStart hook's stdout into context. Surface the
// Step 0 preflight and worktree/PR state with read-only commands. Independent
// lookups run in parallel, and unavailable results are reported as unknown.
import { execFile } from 'node:child_process'
import { realpathSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { isAbsolute, join, relative, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const COMMAND_TIMEOUT_MS = 3_000
const INPUT_TIMEOUT_MS = 500
const MAX_WORKTREES = 6
const CHECK_TIME = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York', year: 'numeric', month: 'short', day: 'numeric',
  hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
})

function unknownSync(checked = CHECK_TIME.format(Date.now())) {
  return `Sync main: unknown (checked ${checked}). Check before any Step 0.`
}

function parseJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

function syncLine(result, now) {
  const checked = CHECK_TIME.format(now)
  const runs = result.status === 0 ? parseJson(result.stdout) : undefined
  const run = Array.isArray(runs) ? runs[0] : undefined
  if (!run || typeof run.createdAt !== 'string' || typeof run.url !== 'string'
    || !/^https:\/\/github\.com\/BeniCheni\/kickoff\/actions\/runs\/\d+(?:\/attempts\/\d+)?$/i.test(run.url)) {
    return unknownSync(checked)
  }

  const elapsed = now - Date.parse(run.createdAt)
  if (!Number.isFinite(elapsed) || elapsed < 0) return unknownSync(checked)

  const minutes = Math.floor(elapsed / 60_000)
  let age = `${minutes}m`
  if (minutes >= 1_440) age = `${Math.floor(minutes / 1_440)}d`
  else if (minutes >= 60) age = `${Math.floor(minutes / 60)}h`

  // GitHub leaves conclusion empty while a run is queued or in progress.
  const outcome = run.conclusion || (run.status !== 'completed' && run.status)
  if (typeof outcome !== 'string' || !/^[a-z_]+$/.test(outcome)) return unknownSync(checked)
  if (outcome === 'success' && (run.conclusion !== 'success' || run.status !== 'completed')) return unknownSync(checked)

  const summary = `Sync main: ${outcome} (${age} ago, checked ${checked}) ${run.url}`
  if (outcome === 'success') return summary
  return `${summary} | Step 0 needs independent primary-source re-verification. See CLAUDE.md, “Scheduled sync”.`
}

function oneLine(text) {
  return text.replace(/[\p{Cc}\p{Zl}\p{Zp}]/gu, char =>
    `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`)
}

function parseWorktrees(stdout) {
  const trees = []
  for (const record of stdout.split('\0\0')) {
    const [pathField, ...fields] = record.split('\0')
    if (!pathField.startsWith('worktree ')) continue
    const path = pathField.slice('worktree '.length)
    const branch = fields.find(field => field.startsWith('branch refs/heads/'))?.slice('branch refs/heads/'.length)
    const state = fields.includes('bare') ? 'bare' : 'detached HEAD'
    const prunable = fields.some(field => field === 'prunable' || field.startsWith('prunable '))
    trees.push({ path, branch, state, prunable })
  }
  return trees
}

function readWorktreeMtimes(result) {
  const mtimes = new Map()
  if (result.status !== 0) return mtimes
  for (const { path, state, prunable } of parseWorktrees(result.stdout)) {
    if (prunable || state === 'bare') continue
    try {
      mtimes.set(path, statSync(join(path, '.git')).mtimeMs)
    } catch {
      // The worktree may have disappeared or be inaccessible from this session.
    }
  }
  return mtimes
}

function worktreeLines(result, { cwd, home, worktreeMtimes }) {
  if (result.status !== 0) return ['Worktrees: unknown.']
  const trees = parseWorktrees(result.stdout)
  if (trees.length === 0) return ['Worktrees: none.']

  const mtime = tree => worktreeMtimes?.get(tree.path) ?? Number.MIN_SAFE_INTEGER
  trees.sort((a, b) => Number(a.prunable) - Number(b.prunable) || mtime(b) - mtime(a))

  // A linked worktree can sit inside another worktree's directory.
  let current = -1
  if (cwd) {
    for (const [index, tree] of trees.entries()) {
      const fromTree = relative(tree.path, cwd)
      if (isAbsolute(fromTree) || fromTree === '..' || fromTree.startsWith(`..${sep}`)) continue
      if (current === -1 || tree.path.length > trees[current].path.length) current = index
    }
  }
  if (current > 0) trees.unshift(...trees.splice(current, 1))
  const lines = trees.slice(0, MAX_WORKTREES).map(({ path, branch, state, prunable }) => {
    const label = home && path.startsWith(`${home}/`) ? `~${path.slice(home.length)}` : path
    return `Worktree: ${oneLine(label)} (${oneLine(branch ?? state)}${prunable ? ', prunable' : ''})`
  })
  if (trees.length > MAX_WORKTREES) {
    lines[MAX_WORKTREES - 1] += ` +${trees.length - MAX_WORKTREES} more`
  }
  return lines
}

function prLabel(result) {
  if (result?.status === 1 && /^no pull requests found for branch "/.test(result.stderr)) return 'No PR'
  const pr = result?.status === 0 ? parseJson(result.stdout) : undefined
  if (!Number.isSafeInteger(pr?.number) || pr.number < 1 || typeof pr.isDraft !== 'boolean'
    || !['OPEN', 'CLOSED', 'MERGED'].includes(pr.state)) return 'PR unknown'
  return `PR #${pr.number} (${pr.state.toLowerCase()}, ${pr.isDraft ? 'draft' : 'non-draft'})`
}

export function formatContext({ sync, worktrees, branch, pr }, now, options = {}) {
  const name = branch.status === 0 ? branch.stdout.trim() : ''
  let session = 'Branch: unknown | PR unknown'
  if (branch.status === 0) {
    session = name ? `Branch: ${oneLine(name)} | ${prLabel(pr)}` : 'Branch: detached HEAD | PR not looked up'
  }
  return [syncLine(sync, now), ...worktreeLines(worktrees, options), session]
}

function canonicalPath(path) {
  try {
    return realpathSync(path)
  } catch {
    return path
  }
}

async function readSessionCwd() {
  if (process.stdin.isTTY) return process.cwd()
  const timer = setTimeout(() => process.stdin.destroy(), INPUT_TIMEOUT_MS)
  let input = ''
  try {
    process.stdin.setEncoding('utf8')
    for await (const chunk of process.stdin) {
      input += chunk
      if (input.length > 65_536) return process.cwd()
    }
  } catch {
    return process.cwd()
  } finally {
    clearTimeout(timer)
  }
  const cwd = parseJson(input)?.cwd
  return typeof cwd === 'string' && !cwd.includes('\0') && isAbsolute(cwd) ? cwd : process.cwd()
}

function readCommand(command, args, cwd) {
  return new Promise(resolve => {
    execFile(command, args, {
      cwd,
      timeout: COMMAND_TIMEOUT_MS,
      killSignal: 'SIGKILL',
      env: {
        ...process.env,
        GIT_OPTIONAL_LOCKS: '0',
        GH_REPO: '',
        GH_PROMPT_DISABLED: '1',
        GH_NO_UPDATE_NOTIFIER: '1',
        GH_NO_EXTENSION_UPDATE_NOTIFIER: '1',
        GH_TELEMETRY: '0',
      },
    }, (error, stdout, stderr) => {
      const status = error ? (typeof error.code === 'number' ? error.code : null) : 0
      resolve({ status, stdout, stderr })
    })
  })
}

async function main() {
  const cwd = canonicalPath(await readSessionCwd())
  const syncRequest = readCommand('gh', [
    'run', 'list', '--repo', 'github.com/BeniCheni/kickoff', '--workflow=sync.yml',
    '--branch', 'main', '--limit', '1', '--json', 'conclusion,status,createdAt,url',
  ], cwd)
  const worktreesRequest = readCommand('git', ['worktree', 'list', '--porcelain', '-z'], cwd)
  const branchRequest = readCommand('git', ['branch', '--show-current'], cwd).then(async branch => {
    const pr = branch.status === 0 && branch.stdout.trim()
      ? await readCommand('gh', ['pr', 'view', '--json', 'number,state,isDraft'], cwd)
      : undefined
    return { branch, pr }
  })
  const [sync, worktrees, { branch, pr }] = await Promise.all([syncRequest, worktreesRequest, branchRequest])
  const worktreeMtimes = readWorktreeMtimes(worktrees)
  console.log(formatContext({ sync, worktrees, branch, pr }, Date.now(), {
    home: homedir(), cwd, worktreeMtimes,
  }).join('\n'))
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main().catch(() => console.log(unknownSync()))
}
