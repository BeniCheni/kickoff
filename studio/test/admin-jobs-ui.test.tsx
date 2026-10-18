import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { COPY } from '../copy.ts'
import { DOWNLOAD_FAILED_NOTE, jobLabel, regenerateLabel, RETRY_DOWNLOAD_LABEL, type JobView } from '../shared/jobs.ts'
import { JobsTable } from '../ui/app/jobs.tsx'

function row(over: Partial<JobView> & Pick<JobView, 'id' | 'status'>): JobView {
  return {
    substate: null,
    subject: null,
    step: 'Clip · 15 s · 480P',
    model: 'minimax/h3-max-turbo/image-to-video',
    estimateUsd: '0.375000',
    billed: { kind: 'pending' },
    at: '2026-10-18T18:00:00.000Z',
    elapsedSeconds: null,
    regenerateEstimateUsd: null,
    ...over,
  }
}

describe('jobs table', () => {
  it('draws every voice, pending in italic, and the two completed actions', () => {
    const html = renderToStaticMarkup(
      <JobsTable
        rows={[
          row({ id: 'pending-job', status: 'submitted', billed: { kind: 'pending' } }),
          row({ id: 'unknown-job', status: 'timed-out', billed: { kind: 'unknown' } }),
          row({ id: 'cancel-job', status: 'cancelled', billed: { kind: 'unknown' } }),
          row({ id: 'kept-job', status: 'kept', billed: { kind: 'reconciled', amountUsd: '0.375000' } }),
          row({ id: 'published-job', status: 'published', billed: { kind: 'reconciled', amountUsd: '0.375000' } }),
          row({ id: 'withdrawn-job', status: 'withdrawn', billed: { kind: 'reconciled', amountUsd: '0.375000' } }),
          row({ id: 'download-job', status: 'completed', substate: 'download-failed', billed: { kind: 'reconciled', amountUsd: '0.375000' } }),
          row({ id: 'expired-job', status: 'completed', substate: 'result-expired', billed: { kind: 'reconciled', amountUsd: '0.375000' }, regenerateEstimateUsd: '0.375000' }),
          row({ id: 'refused-job', status: 'refused', billed: { kind: 'reconciled', amountUsd: '0.000000' } }),
        ]}
        onDownload={() => undefined}
        onRegenerate={() => undefined}
      />,
    )
    expect(html).toContain('class="n pending"')
    expect(html).toContain('>pending<')
    expect(html).toContain('>unknown<')
    expect(html).toContain('data-voice="pitch"')
    expect(html).toContain('data-voice="ink"')
    expect(html).toContain('data-voice="alarm"')
    expect(html).toContain('data-voice="muted"')
    expect(html).toContain(`>${jobLabel('published', null)}<`)
    expect(html).not.toContain('Exported')
    expect(html).toContain(RETRY_DOWNLOAD_LABEL)
    expect(html).toContain(regenerateLabel('0.375000'))
    expect(html).toContain(DOWNLOAD_FAILED_NOTE)
    expect(html).toContain(COPY.timedOut)
    expect(html).toContain(COPY.refused)
    expect(html).toContain('none recorded')
  })
})
