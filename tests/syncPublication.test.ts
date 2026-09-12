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
  'pr view') printf '%s\t%s\n' "$MOCK_STATE" "$MOCK_HEAD" ;;
  *) exit 9 ;;
esac
`, { mode: 0o755 })
  writeFileSync(resolve(root, 'bin', 'sleep'), '#!/usr/bin/env bash\nexit 0\n', { mode: 0o755 })
  writeFileSync(resolve(root, 'calls'), '')
  writeFileSync(resolve(root, 'summary'), '')
  return {
    root,
    run: (script: string) => spawnSync('bash', ['-eo', 'pipefail', '-c', script], {
      cwd: root, encoding: 'utf8', env: { ...process.env,
        PATH: `${root}/bin:${process.env.PATH}`, GITHUB_REPOSITORY: 'BeniCheni/kickoff',
        SYNC_PR_NUMBER: '55', SYNC_HEAD_SHA: SHA, MOCK_HEAD: SHA, MOCK_MAIN: SHA,
        MOCK_DEPLOYED: '', MOCK_STATE: 'MERGED', MOCK_DISPATCH_EXIT: '0',
        MOCK_CALLS: resolve(root, 'calls'), GITHUB_OUTPUT: resolve(root, 'outputs'),
        GITHUB_STEP_SUMMARY: resolve(root, 'summary'), REPORT_LINE: 'report: changed=false changes=0 urgent=0 standings=unchanged rank-moves=0 merge=auto',
        ...over,
      },
    }),
    calls: () => readFileSync(resolve(root, 'calls'), 'utf8'),
  }
}

function readOutputs(root: string) {
  const output = readFileSync(resolve(root, 'outputs'), 'utf8').trim()
  if (!output) return {} as Record<string, string>
  return Object.fromEntries(output.split('\n').filter(Boolean).map((line) => line.split('=', 2) as [string, string]))
}

function runShell(r: ReturnType<typeof rig>, script: string) {
  return r.run(script)
}

describe('Pages delivery after sync', () => {
  it('records merged delivery on the merged snapshot', () => {
    const r = rig()
    const status = runShell(r, 'bash scripts/finish-sync.sh')
    expect(status.status).toBe(0)
    expect(readOutputs(r.root)).toMatchObject({ delivery: 'merged' })
    expect(readOutputs(r.root).delivery_detail).toContain('Published snapshot')
    expect(r.calls()).toContain('pr view 55')
    expect(r.calls()).toContain('workflow run pages.yml --repo BeniCheni/kickoff --ref main')
    expect(r.calls().indexOf('pr view')).toBeLessThan(r.calls().indexOf('workflow run'))
  })
  it('does not redeploy a main commit already published successfully', () => {
    const r = rig({ MOCK_DEPLOYED: SHA })
    expect(r.run('bash scripts/ensure-pages.sh').status).toBe(0)
    expect(r.calls()).not.toContain('workflow run')
  })
  it.each<Record<string, string>>([{ MOCK_STATE: 'CLOSED' }, { MOCK_STATE: 'OPEN' }, { MOCK_HEAD: 'b'.repeat(40) }])(
    'records merge-unconfirmed without dispatch when merge is unconfirmed or the head changes: %o', (over) => {
      const r = rig(over)
      expect(r.run('bash scripts/finish-sync.sh').status).toBe(1)
      expect(r.calls()).not.toContain('workflow run')
      expect(readOutputs(r.root).delivery).toBe('merge_unconfirmed')
      expect(readOutputs(r.root).delivery_detail).toBeTruthy()
    },
  )
  it('classifies rejected deployment as delivery_failed', () => {
    const r = rig({ MOCK_DISPATCH_EXIT: '1' })
    expect(r.run('bash scripts/finish-sync.sh').status).toBe(1)
    expect(readOutputs(r.root).delivery).toBe('delivery_failed')
    expect(readOutputs(r.root).delivery_detail).toContain('Pages request')
  })
  it('identifies the PR head without calling it the main commit after a squash merge', () => {
    const r = rig({ MOCK_MAIN: 'b'.repeat(40), MOCK_DISPATCH_EXIT: '1', PR_NUMBER: '55' })
    expect(r.run('bash scripts/finish-sync.sh').status).toBe(1)
    const { delivery, delivery_detail: detail } = readOutputs(r.root)
    if (!delivery || !detail) throw new Error('Missing delivery output')
    expect(detail).toContain(`Snapshot PR #55 (head ${SHA}) merged into main`)
    expect(detail).not.toContain(`on main at ${SHA}`)

    const classification = rig({ DELIVERY: delivery, DETAIL: detail, PR_NUMBER: '55' })
    const classified = classification.run(classifierShell)
    expect(classified.status).toBe(0)
    expect(classified.stdout).toContain(`::error title=DELIVERY FAILED::DELIVERY FAILED — ${detail}`)
    expect(readFileSync(resolve(classification.root, 'summary'), 'utf8')).toContain(detail)
  })
  it('refuses an unresolved main SHA', () => {
    const r = rig({ MOCK_MAIN: '' })
    expect(r.run('bash scripts/ensure-pages.sh').status).toBe(1)
    expect(r.calls()).not.toContain('workflow run')
  })
  it.each([
    ['', 'error'],
    ['1', 'warning'],
  ])('reports a rejected Pages dispatch with recovery flag %j as %s', (flag, severity) => {
    const r = rig({ SYNC_RECOVERY_WARNING: flag, MOCK_DISPATCH_EXIT: '1' })
    const result = r.run('bash scripts/ensure-pages.sh')
    expect(result.status).toBe(1)
    expect(result.stdout).toContain(`::${severity}::`)
    expect(result.stdout).not.toContain(`::${severity === 'warning' ? 'error' : 'warning'}::`)
    expect(result.stdout).not.toContain('Pages deployment requested')
    expect(r.calls()).toContain('workflow run pages.yml --repo BeniCheni/kickoff --ref main')
    if (flag === '1') expect(result.stdout).toContain('recovering an earlier merge')
  })
  it('does not warn or dispatch in recovery mode when main is already deployed', () => {
    const r = rig({ SYNC_RECOVERY_WARNING: '1', MOCK_DEPLOYED: SHA, MOCK_DISPATCH_EXIT: '1' })
    const result = r.run('bash scripts/ensure-pages.sh')
    expect(result.status).toBe(0)
    expect(result.stdout).toContain(`Pages already has main at ${SHA}`)
    expect(result.stdout).not.toMatch(/::(?:warning|error)::/)
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

const syncPrShell = step('Open or update the sync PR').split('        run: |\n')[1]!
  .split('\n').filter((line) => line.startsWith('          ')).map((line) => line.slice(10)).join('\n')
const syncPrBodyShell = (() => {
  const marker = '# Indent provider text as code, so names cannot close a Markdown fence.'
  const markerAt = syncPrShell.indexOf(marker)
  if (markerAt < 0) throw new Error('Missing PR-body marker')
  const bodyStart = syncPrShell.indexOf('{', markerAt)
  const bodyEnd = syncPrShell.indexOf('} > pr-body.md', bodyStart)
  if (bodyStart < 0 || bodyEnd < 0) throw new Error('Missing PR-body block')
  return syncPrShell.slice(bodyStart, bodyEnd + 14)
})()

const classifierShell = step('Classify a red run').split('        run: |\n')[1]!
  .split('\n').filter((line) => line.startsWith('          ')).map((line) => line.slice(10)).join('\n')

describe('workflow publication gate', () => {
  it('wires the recovery step to warn visibly while allowing the sync to continue', () => {
    const recovery = step('Recover Pages delivery of an earlier merge')
    expect(recovery).toContain('continue-on-error: true')
    const flag = recovery.match(/^\s+SYNC_RECOVERY_WARNING: '(.*)'$/m)?.[1] ?? ''
    const command = recovery.match(/^\s+run: (.+)$/m)?.[1]
    if (!command) throw new Error('Missing recovery command')
    const r = rig({ SYNC_RECOVERY_WARNING: flag, MOCK_DISPATCH_EXIT: '1' })
    const result = r.run(command)
    expect(result.status).toBe(1)
    expect(result.stdout).toContain('::warning::Pages dispatch failed while recovering an earlier merge')
    expect(result.stdout).not.toContain('::error::')
  })
  it.each([
    [cleanReport, '0', 0],
    [cleanReport.replace('standings=unchanged', 'standings=failed'), '0', 1],
    [cleanReport, '2', 1],
    [cleanReport, '137', 1],
    ['missing report', '0', 1],
    [cleanReport + ' unexpected=true', '0', 1],
    ['report: changed=true changes=1 urgent=1 standings=unchanged rank-moves=0 merge=hold', '1', 0],
  ])('executes the actual report shell: %s / exit %s', (report, exit, expected) => {
    const r = rig()
    writeFileSync(resolve(r.root, 'sync-output.txt'), report + '\n')
    const code = reportShell.replaceAll('${{ steps.sync.outputs.sync_exit }}', exit)
    expect(r.run(code).status).toBe(expected)
  })
  it('routes quiet checks through validation, commit, required verify and merge; excludes dry runs', () => {
    const names = ['Verify the written snapshot', 'Commit and push the rolling sync branch', 'Open or update the sync PR', "Approve the PR's held verify run", 'Merge the snapshot once verify is green', 'Confirm merge and request Pages delivery', 'Classify a red run']
    for (const name of names) {
      const condition = name === 'Classify a red run'
        ? "if: failure() && github.event.inputs.dry_run != 'true'\n"
        : "if: steps.mode.outputs.dry_run == 'false'\n"
      expect(step(name)).toContain(condition)
    }
    expect(step('Record the change digest')).toContain("&& steps.report.outputs.changed == 'true'")
    expect(step('Commit and push the rolling sync branch')).toContain('src/data/fixtures.json src/data/meta.json src/data/standings.json')
    expect(step('Publish only from main')).toContain('refs/heads/main')
    expect(step('Merge the snapshot once verify is green')).toContain('--match-head-commit "$SYNC_HEAD_SHA"')
    const positions = names.map((name) => workflow.indexOf(`- name: ${name}\n`))
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })

  it('builds a sanitized PR body and keeps provider control characters inert', () => {
    const r = rig({ REPORT_LINE: 'report: changed=true changes=1 urgent=1 standings=unchanged rank-moves=0 merge=hold' })
    writeFileSync(resolve(r.root, 'sync-output.txt'), 'Old Ground -> Evil Park\r## Forged: all positions verified\r- [x] Step 0 done\n')
    const script = [
      "TITLE='Kickoff sync'",
      "REPORT_LINE='report: changed=true changes=1 urgent=1 standings=unchanged rank-moves=0 merge=hold'",
      'SYNC_EXIT=0',
      "STAMP='09/11/2026 11:34 AM ET'",
      syncPrBodyShell,
    ].join('\n')
      .replaceAll('${{ steps.report.outputs.merge }}', 'auto')
      .replaceAll('${{ steps.report.outputs.line }}', 'report: changed=true changes=1 urgent=1 standings=unchanged rank-moves=0 merge=hold')
      .replaceAll('${{ steps.sync.outputs.sync_exit }}', '0')
      .replaceAll('${{ steps.ts.outputs.stamp }}', '09/11/2026 11:34 AM ET')
      .replaceAll('${{ github.repository }}', 'BeniCheni/kickoff')
    expect(runShell(r, script).status).toBe(0)
    const body = readFileSync(resolve(r.root, 'pr-body.md'), 'utf8')
    expect(body).not.toContain('\r')
    expect(body).not.toMatch(/^## Forged:/m)
    expect(body).not.toMatch(/^- \[x\] Step 0 done/m)
    expect(body).toMatch(/## Reviewer checklist[\s\S]*\n\n\[Recent change digest\]/)
  })

  it('classifies delivery failures from finish-sync outputs as DELIVERY FAILED', () => {
    const r = rig({ DELIVERY: 'delivery_failed', DETAIL: 'The snapshot is on main at aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa, but the Pages request failed; the live site may lag behind main.', PR_NUMBER: '55' })
    const status = runShell(r, `${classifierShell}\n`)
    expect(status.status).toBe(0)
    expect(status.stdout).toContain('::error title=DELIVERY FAILED::DELIVERY FAILED')
    const summary = readFileSync(resolve(r.root, 'summary'), 'utf8')
    expect(summary).toContain('## DELIVERY FAILED')
    expect(summary).toContain('site may lag behind main')
  })

  it('classifies missing delivery output as merge-unconfirmed when a PR exists', () => {
    const r = rig({ DELIVERY: '', PR_NUMBER: '55' })
    const status = runShell(r, `${classifierShell}\n`)
    expect(status.status).toBe(0)
    const summary = readFileSync(resolve(r.root, 'summary'), 'utf8')
    expect(summary).toContain('## MERGE UNCONFIRMED')
    expect(summary).toContain('auto-merge may be off')
  })

  it('preserves the recorded merge-unconfirmed cause from finish-sync', () => {
    const detail = `The sync PR head changed from ${SHA}; the expected snapshot is unconfirmed.`
    const r = rig({ DELIVERY: 'merge_unconfirmed', DETAIL: detail, PR_NUMBER: '55' })
    const status = runShell(r, `${classifierShell}\n`)
    expect(status.status).toBe(0)
    const summary = readFileSync(resolve(r.root, 'summary'), 'utf8')
    expect(summary).toContain(detail)
    expect(summary).not.toContain('auto-merge may be off')
  })

  it('classifies missing delivery output as data-failed when no PR exists', () => {
    const r = rig({ DELIVERY: '', PR_NUMBER: '' })
    const status = runShell(r, `${classifierShell}\n`)
    expect(status.status).toBe(0)
    const summary = readFileSync(resolve(r.root, 'summary'), 'utf8')
    expect(summary).toContain('## DATA FAILED')
  })
})
