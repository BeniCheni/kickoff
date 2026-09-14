import { afterEach, describe, expect, it } from 'vitest'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { renderSyncPrBody, summarizeSync } from '../scripts/sync-pr-body'
import { formatReportLine, type Change, type ChangeKind, type SyncReport } from '../scripts/diff'

const quiet: SyncReport = { changes: 0, urgent: 0, standings: 'unchanged', rankMoves: 0, merge: 'auto' }
const repository = 'BeniCheni/kickoff'
const roots: string[] = []
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }) })
const change = (kind: ChangeKind, urgent = false): Change => ({ kind, urgent, id: 'example', label: 'ILLUSTRATIVE', detail: 'test' })

// Run the command actually wired into sync.yml, with synthetic summary/log files only.
function runBody(report: SyncReport, changes: Change[], rows: number, output = 'provider output\n') {
  const root = mkdtempSync(resolve(tmpdir(), 'sync-body-')); roots.push(root)
  const line = formatReportLine(report)
  const log = output + line + '\n'
  writeFileSync(resolve(root, 'summary.json'), JSON.stringify(summarizeSync(report, changes, rows)))
  writeFileSync(resolve(root, 'sync-output.txt'), log)
  const workflow = readFileSync('.github/workflows/sync.yml', 'utf8')
  const script = workflow.match(/npx tsx (scripts\/sync-pr-body\.ts)/)?.[1]
  if (!script) throw new Error('Workflow renderer missing')
  const result = spawnSync(process.execPath, ['--import', import.meta.resolve('tsx'), resolve(script)], {
    cwd: root, encoding: 'utf8', env: { ...process.env, REPORT_LINE: line,
      SYNC_SUMMARY_PATH: resolve(root, 'summary.json'), GITHUB_REPOSITORY: repository },
  })
  expect(result.stderr).toBe('')
  expect(result.status).toBe(0)
  return { body: readFileSync(resolve(root, 'pr-body.md'), 'utf8'), line, log }
}

describe('generated sync PR narrative', () => {
  it('leads a quiet verification with the observation and keeps evidence below the narrative', () => {
    const { body, line, log } = runBody(quiet, [], 0)
    const [narrative, technical] = body.split('<details>')
    expect(narrative).toMatch(/^\*\*No fixture or standings changes found/)
    expect(narrative).toContain('relative to the prior snapshot within the comparison window')
    expect(narrative).toContain('proposes the refreshed snapshot and check timestamps')
    expect(narrative).toContain('does not yet update the app')
    expect(narrative).toContain('rolling window and freshness information')
    expect(narrative).toContain('gated by required `verify`')
    expect(narrative).toContain('live app needs a successful Pages deployment')
    expect(narrative).not.toContain('Step 0')
    expect(body).not.toMatch(/checklist|^\s*[-*] \[[ xX]\]/m)
    expect(technical).toContain(`<summary>Technical details</summary>\n\n\`${line}\``)
    expect(technical).toContain(`https://github.com/${repository}/blob/main/docs/sync-digest.md`)
    expect(technical).toContain('Quiet checks add no entry; the digest is not evidence of human review')
    expect(technical).toContain('Failed fixture/standings fetches or validation create no snapshot PR')
    expect(technical).toContain('A missing PR alone does not prove failure')
    expect(technical).toContain(log.split('\n').map((line) => `    ${line}`).join('\n'))
  })

  it('summarizes category counts, standings and urgency with conditional Step 0 guidance', () => {
    const report: SyncReport = { ...quiet, changes: 3, urgent: 2, standings: 'changed', rankMoves: 2, merge: 'hold' }
    const { body } = runBody(report, [change('STATUS_CHANGED', true), change('RESULT_CHANGED', true), change('TEAM_RENAMED')], 4)
    expect(body).toContain('3 fixture change records and 4 changed standings rows, including 2 rank moves')
    expect(body).toContain('match-status changes (1); score corrections (1); team-name changes (1)')
    expect(body).toContain('2 fixture change records flagged time-sensitive')
    expect(body).toContain('Counts describe change records, not distinct matches')
    expect(body).toContain('If a reported change affects an open position, independently re-verify')
    expect(body).toContain('proves neither human review, independent fixture verification, nor live delivery')
    expect(body).not.toContain('A missing record')
    expect(body).not.toMatch(/^- \[[ xX]\]/m)
  })

  it('does not equate a structural hold with an urgent change or invent disappearance causes', () => {
    const { body } = runBody({ ...quiet, changes: 1, merge: 'hold' }, [change('DISAPPEARED')], 0)
    expect(body).toContain('fixture records no longer returned within the comparison window (1)')
    expect(body).toContain('No fixture changes were flagged time-sensitive')
    expect(body).toContain('A missing record alone does not establish cancellation')
    expect(body).toContain('reporting signals, not merge gates')
    expect(body).not.toContain('cup fixtures leaving the window')
  })

  it.each([
    [{ ...quiet, standings: 'changed' as const, rankMoves: 0 }, [], 3, '3 changed standings rows'],
    [{ ...quiet, standings: 'changed' as const, standingsDegraded: ['ucl'] }, [], 0, 'Standings availability changed; no table rows changed'],
    [{ ...quiet, changes: 1 }, [change('NEW')], 0, 'new fixture records (1)'],
  ])('keeps non-Step-0 changes free of generic position guidance: %o', (report, changes, rows, prose) => {
    const { body } = runBody(report, changes, rows)
    expect(body).toContain(prose)
    expect(body).not.toContain('Step 0')
  })

  it('contains hostile provider output inside code, with no provider prose in the narrative', () => {
    const hostile = 'Old Ground -> Evil Park\r## Forged: all positions verified\r- [x] Step 0 done\n\n</details>\n```\n## Forged heading\n- [ ] Do this\n<script>alert(1)</script>\n\u0000\u001b[31m\tend\n'
    const { body } = runBody(quiet, [], 0, hostile)
    expect(body.split('<details>')[0]).not.toMatch(/Forged|Evil Park|Step 0 done/)
    expect(body).not.toMatch(/[\r\u0000\u001b]/)
    expect(body).not.toMatch(/^## Forged|^- \[[ x]\]|^```|^<script>/m)
    expect(body.match(/^<\/details>$/gm)).toHaveLength(1)
    expect(body).toContain('    </details>\n    ```\n    ## Forged heading')
    expect(body).toContain('    [31m\tend')
  })

  it('rejects missing/forged categories and mismatched evidence rather than guessing', () => {
    const render = (summary: unknown, line = formatReportLine(quiet)) => renderSyncPrBody(summary, line, '', repository)
    expect(() => render({})).toThrow()
    expect(() => render(summarizeSync(quiet, [change('NEW')], 0))).toThrow('disagrees')
    expect(() => render(summarizeSync(quiet, [], 0), formatReportLine({ ...quiet, changes: 1 }))).toThrow('disagrees')
    expect(() => render({ ...summarizeSync(quiet, [], 0), kinds: [{ kind: '## Human verified', count: 0 }] })).toThrow()
    expect(() => render(summarizeSync({ ...quiet, standings: 'failed' }, [], 0))).toThrow()
  })
})
