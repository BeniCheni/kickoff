import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { z } from 'zod'
import { formatReportLine, reportSaysChanged, type Change, type ChangeKind, type SyncReport } from './diff'

const labels = {
  NEW: 'new fixture records',
  DISAPPEARED: 'fixture records no longer returned within the comparison window',
  HOME_AWAY_INVERTED: 'home/away reversals',
  DATE_MOVED: 'date changes (ET)',
  TIME_CHANGED: 'kickoff-time changes',
  STATUS_CHANGED: 'match-status changes',
  VENUE_CHANGED: 'venue changes',
  VENUE_TZ_CHANGED: 'venue time-zone changes',
  TIME_CONFIDENCE_CHANGED: 'kickoff-time confidence changes',
  RESULT_CHANGED: 'score corrections',
  TEAM_RENAMED: 'team-name changes',
  TEAM_CHANGED: 'team-identity changes',
} satisfies Record<ChangeKind, string>
const step0Kinds: readonly ChangeKind[] = [
  'DATE_MOVED', 'TIME_CHANGED', 'HOME_AWAY_INVERTED', 'STATUS_CHANGED',
  'DISAPPEARED', 'RESULT_CHANGED', 'TEAM_CHANGED', 'TEAM_RENAMED',
]
const quantity = (count: number, noun: string) => `${count} ${noun}${count === 1 ? '' : 's'}`
const count = z.number().int().nonnegative()
const summarySchema = z.object({
  report: z.object({
    changes: count, urgent: count, standings: z.enum(['changed', 'unchanged']),
    rankMoves: count, merge: z.enum(['auto', 'hold']),
    zonesUnknown: count.optional(), standingsDegraded: z.array(z.string().regex(/^[a-z0-9]+$/)).optional(),
  }).strict(),
  kinds: z.array(z.object({ kind: z.enum(Object.keys(labels) as [ChangeKind, ...ChangeKind[]]), count }).strict()),
  standingsRowsChanged: count,
}).strict()

/** Only engine-owned enums/counts cross this boundary; never provider labels or details. */
export function summarizeSync(report: SyncReport, changes: readonly Change[], standingsRowsChanged: number) {
  return {
    report,
    kinds: (Object.keys(labels) as ChangeKind[]).flatMap((kind) => {
      const count = changes.filter((change) => change.kind === kind).length
      return count ? [{ kind, count }] : []
    }),
    standingsRowsChanged,
  }
}

export function renderSyncPrBody(summary: unknown, reportLine: string, log: string, repository: string): string {
  const { report, kinds, standingsRowsChanged } = summarySchema.parse(summary)
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new Error('Invalid repository')
  if (formatReportLine(report) !== reportLine ||
      kinds.reduce((total, item) => total + item.count, 0) !== report.changes ||
      new Set(kinds.map((item) => item.kind)).size !== kinds.length ||
      report.urgent > report.changes || report.rankMoves > standingsRowsChanged ||
      (report.standings === 'unchanged' && standingsRowsChanged !== 0)) {
    throw new Error('Sync summary disagrees with the report')
  }
  const changed = reportSaysChanged(report)
  const paragraphs: string[] = []
  if (!changed) {
    paragraphs.push('**No fixture or standings changes found.** The ESPN provider check found no changes relative to the prior snapshot within the comparison window.')
    paragraphs.push('This PR proposes the refreshed snapshot and check timestamps; it does not yet update the app. Fixture and table content is unchanged apart from the rolling window and freshness information.')
  } else {
    paragraphs.push(`**The ESPN provider check found changes for the next snapshot.** This PR proposes ${quantity(report.changes, 'fixture change record')} and ${quantity(standingsRowsChanged, 'changed standings row')}, including ${quantity(report.rankMoves, 'rank move')}. These update the app’s fixture or table information after publication.`)
    if (kinds.length) paragraphs.push(`Fixture changes: ${kinds.map(({ kind, count }) => `${labels[kind]} (${count})`).join('; ')}. Counts describe change records, not distinct matches.`)
    if (report.standings === 'changed' && standingsRowsChanged === 0) {
      paragraphs.push('Standings availability changed; no table rows changed.')
    }
    paragraphs.push(report.urgent > 0
      ? `${quantity(report.urgent, 'fixture change record')} flagged time-sensitive by the sync rules (near kickoff, postponement/cancellation, or score/team correction).`
      : 'No fixture changes were flagged time-sensitive by the sync rules.')
    if (kinds.some(({ kind, count }) => count > 0 && step0Kinds.includes(kind))) {
      paragraphs.push('If a reported change affects an open position, independently re-verify that fixture against primary sources (Step 0), then re-read the app after publication.' +
        (kinds.some(({ kind, count }) => kind === 'DISAPPEARED' && count > 0)
          ? ' A missing record alone does not establish cancellation.' : ''))
    }
  }
  paragraphs.push('Fixtures and standings travel together as one snapshot. The workflow requests auto-merge, gated by required `verify`; merging updates main, while the live app needs a successful Pages deployment. This PR proves neither human review, independent fixture verification, nor live delivery.')
  paragraphs.push(`<details>\n<summary>Technical details</summary>\n\n\`${reportLine}\``)
  paragraphs.push('`merge=auto` / `merge=hold` are reporting signals, not merge gates; `hold` also covers disappeared records and home/away reversals at any horizon.')
  paragraphs.push(`[Recent change digest](https://github.com/${repository}/blob/main/docs/sync-digest.md) — entries reach main with change-bearing snapshots. Quiet checks add no entry; the digest is not evidence of human review.`)
  paragraphs.push('Failed fixture/standings fetches or validation create no snapshot PR; investigate Actions diagnostics. A missing PR alone does not prove failure. Later merge or delivery failures can leave a PR or a merged snapshot behind.')
  // Keep every line of output, but strip controls before indenting: provider text cannot
  // escape code via CR, HTML, Markdown fences, headings or task-list syntax.
  const clean = log.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '')
  paragraphs.push('Full sync output:\n\n' + clean.split('\n').map((line) => `    ${line}`).join('\n'))
  paragraphs.push('</details>')
  return paragraphs.join('\n\n') + '\n'
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  writeFileSync('pr-body.md', renderSyncPrBody(
    JSON.parse(readFileSync(process.env.SYNC_SUMMARY_PATH!, 'utf8')),
    process.env.REPORT_LINE ?? '', readFileSync('sync-output.txt', 'utf8'),
    process.env.GITHUB_REPOSITORY ?? '',
  ))
}
