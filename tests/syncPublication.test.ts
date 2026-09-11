import { afterEach, describe, expect, it } from 'vitest'
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const roots: string[] = []
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }) })
const SHA = 'a'.repeat(40)
const workflow = readFileSync('.github/workflows/sync.yml', 'utf8')

function rig(over: Record<string, string> = {}) {
  const root = mkdtempSync(resolve(tmpdir(), 'sync-publication-')); roots.push(root)
  mkdirSync(resolve(root, 'bin')); mkdirSync(resolve(root, 'scripts'))
  for (const script of ['ensure-pages.sh', 'finish-sync.sh']) copyFileSync(resolve('scripts', script), resolve(root, 'scripts', script))
  writeFileSync(resolve(root, 'bin', 'gh'), `#!/usr/bin/env bash
set -eu
echo "$*" >> "$MOCK_CALLS"
case "$1 $2" in
  'api repos/BeniCheni/kickoff/commits/main') echo "$MOCK_MAIN" ;;
  'run list') echo "$MOCK_DEPLOYED" ;;
  'workflow run') exit "$MOCK_DISPATCH_EXIT" ;;
  'pr view') printf '%s\\t%s\\n' "$MOCK_STATE" "$MOCK_HEAD" ;;
  *) exit 9 ;;
esac
`, { mode: 0o755 })
  writeFileSync(resolve(root, 'bin', 'sleep'), '#!/usr/bin/env bash\nexit 0\n', { mode: 0o755 })
  writeFileSync(resolve(root, 'calls'), '')
  return {
    root,
    run: (script: string) => spawnSync('bash', ['-eo', 'pipefail', '-c', script], {
      cwd: root, encoding: 'utf8', env: { ...process.env,
        PATH: `${root}/bin:${process.env.PATH}`, GITHUB_REPOSITORY: 'BeniCheni/kickoff',
        SYNC_PR_NUMBER: '55', SYNC_HEAD_SHA: SHA, MOCK_HEAD: SHA, MOCK_MAIN: SHA,
        MOCK_DEPLOYED: '', MOCK_STATE: 'MERGED', MOCK_DISPATCH_EXIT: '0',
        MOCK_CALLS: resolve(root, 'calls'), GITHUB_OUTPUT: resolve(root, 'outputs'), ...over,
      },
    }),
    calls: () => readFileSync(resolve(root, 'calls'), 'utf8'),
  }
}

describe('Pages delivery after sync', () => {
  it('dispatches main only after observing the expected PR head merged', () => {
    const r = rig(); expect(r.run('bash scripts/finish-sync.sh').status).toBe(0)
    expect(r.calls()).toContain('pr view 55')
    expect(r.calls()).toContain('workflow run pages.yml --repo BeniCheni/kickoff --ref main')
    expect(r.calls().indexOf('pr view')).toBeLessThan(r.calls().indexOf('workflow run'))
  })
  it('does not redeploy a main commit already published successfully', () => {
    const r = rig({ MOCK_DEPLOYED: SHA }); expect(r.run('bash scripts/ensure-pages.sh').status).toBe(0)
    expect(r.calls()).not.toContain('workflow run')
  })
  it.each<Record<string, string>>([{ MOCK_STATE: 'CLOSED' }, { MOCK_STATE: 'OPEN' }, { MOCK_HEAD: 'b'.repeat(40) }])(
    'fails without dispatch when merge is unconfirmed or the head changes: %o', (over) => {
      const r = rig(over); expect(r.run('bash scripts/finish-sync.sh').status).toBe(1)
      expect(r.calls()).not.toContain('workflow run')
    },
  )
  it('surfaces a rejected deployment request', () => {
    const r = rig({ MOCK_DISPATCH_EXIT: '1' }); expect(r.run('bash scripts/finish-sync.sh').status).toBe(1)
  })
  it('refuses an unresolved main SHA', () => {
    const r = rig({ MOCK_MAIN: '' }); expect(r.run('bash scripts/ensure-pages.sh').status).toBe(1)
    expect(r.calls()).not.toContain('workflow run')
  })
})

function step(name: string): string {
  const start = workflow.indexOf(`      - name: ${name}\n`)
  if (start < 0) throw new Error(`Missing step ${name}`)
  const end = workflow.indexOf('\n      - ', start + 1)
  return workflow.slice(start, end < 0 ? undefined : end)
}
const reportShell = step('Read the sync report').split('        run: |\n')[1]!
  .split('\n').filter((line) => line.startsWith('          ')).map((line) => line.slice(10)).join('\n')
const cleanReport = 'report: changed=false changes=0 urgent=0 standings=unchanged rank-moves=0 merge=auto'

describe('workflow publication gate', () => {
  it.each([
    [cleanReport, '0', 0],
    [cleanReport.replace('standings=unchanged', 'standings=failed'), '0', 1],
    [cleanReport, '2', 1],
    [cleanReport, '137', 1],
    ['missing report', '0', 1],
    [cleanReport + ' unexpected=true', '0', 1],
    ['report: changed=true changes=1 urgent=1 standings=unchanged rank-moves=0 merge=hold', '1', 0],
  ])('executes the actual report shell: %s / exit %s', (report, exit, expected) => {
    const r = rig(); writeFileSync(resolve(r.root, 'sync-output.txt'), report + '\n')
    const code = reportShell.replace('${{ steps.sync.outputs.sync_exit }}', exit)
    expect(r.run(code).status).toBe(expected)
  })
  it('routes quiet checks through validation, commit, required verify and merge; excludes dry runs', () => {
    const names = ['Verify the written snapshot', 'Commit and push the rolling sync branch', 'Open or update the sync PR', "Approve the PR's held verify run", 'Merge the snapshot once verify is green', 'Confirm merge and request Pages delivery']
    for (const name of names) {
      expect(step(name)).toContain("if: steps.mode.outputs.dry_run == 'false'\n")
    }
    expect(step('Record the change digest')).toContain("&& steps.report.outputs.changed == 'true'")
    expect(step('Commit and push the rolling sync branch')).toContain('src/data/fixtures.json src/data/meta.json src/data/standings.json')
    expect(step('Publish only from main')).toContain('refs/heads/main')
    expect(step('Merge the snapshot once verify is green')).toContain('--match-head-commit "$SYNC_HEAD_SHA"')
    const positions = names.map((name) => workflow.indexOf(`- name: ${name}\n`))
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })
})
