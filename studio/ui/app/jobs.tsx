import { useEffect, useState } from 'react'
import { displayUsd } from '../../shared/display.ts'
import {
  formatElapsed,
  DOWNLOAD_LABEL,
  jobAction,
  jobLabel,
  jobNote,
  jobVoice,
  regenerateLabel,
  RETRY_DOWNLOAD_LABEL,
  shouldPoll,
  type JobView,
} from '../../shared/jobs.ts'
import { DRAFT } from '../../shared/admin-copy.ts'
import type { ShellView } from '../../shared/types.ts'
import { statusLine } from '../../shared/status.ts'
import { downloadJob, getJobs, pollJobs, regenerateJob } from './api.ts'
import { StatusLine } from './status.tsx'

function billedText(row: JobView): { text: string; pending: boolean } {
  if (row.billed.kind === 'unknown') return { text: 'unknown', pending: false }
  if (row.billed.kind === 'pending') return { text: 'pending', pending: true }
  if (row.billed.kind === 'none') return { text: '—', pending: false }
  return { text: displayUsd(row.billed.amountUsd), pending: false }
}

function whenText(row: JobView): string {
  const at = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(row.at))
  if (row.elapsedSeconds === null) return at
  return `${at} · ${formatElapsed(row.elapsedSeconds)}`
}

export function JobsTable({
  rows,
  onDownload,
  onRegenerate,
  regenerateBlocked,
}: {
  rows: readonly JobView[]
  onDownload: (id: string) => void
  onRegenerate: (row: JobView) => void
  regenerateBlocked?: boolean
}) {
  if (rows.length === 0) return <p className="studio-help">No jobs recorded.</p>
  return (
    <table className="jobs">
      <thead>
        <tr>
          <th>Job</th>
          <th>Subject</th>
          <th>Step</th>
          <th>Model</th>
          <th className="n">Est.</th>
          <th className="n">Billed</th>
          <th>State</th>
          <th className="n">Time</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const billed = billedText(row)
          const note = jobNote(row.status, row.substate)
          const action = jobAction(row.status, row.substate)
          return (
            <tr key={row.id} data-state={row.status} data-substate={row.substate ?? undefined}>
              <td className="mono">{row.id}</td>
              <td>{row.subject ?? 'none recorded'}</td>
              <td>{row.step}</td>
              <td className="mono">{row.model ?? 'none recorded'}</td>
              <td className="n">{displayUsd(row.estimateUsd)}</td>
              <td className={billed.pending ? 'n pending' : 'n'}>{billed.text}</td>
              <td>
                <span className="spill" data-voice={jobVoice(row.status)}>{jobLabel(row.status, row.substate)}</span>
                {note ? <small>{note}</small> : null}
                {action === 'download' ? (
                  <button type="button" className="studio-button" onClick={() => onDownload(row.id)}>{DOWNLOAD_LABEL}</button>
                ) : null}
                {action === 'retry-download' ? (
                  <button type="button" className="studio-button" onClick={() => onDownload(row.id)}>{RETRY_DOWNLOAD_LABEL}</button>
                ) : null}
                {action === 'regenerate' && row.regenerateEstimateUsd ? (
                  <button type="button" className="studio-button" disabled={regenerateBlocked} onClick={() => onRegenerate(row)}>
                    {regenerateLabel(row.regenerateEstimateUsd)}
                  </button>
                ) : null}
                {action === 'regenerate' && !row.regenerateEstimateUsd ? (
                  <small>Regenerate is unavailable: the registry has no current price for this job.</small>
                ) : null}
              </td>
              <td className="n">{whenText(row)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export function JobsPage({ shell, onShell }: { shell: ShellView; onShell: () => void }) {
  const [rows, setRows] = useState<JobView[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [notice, setNotice] = useState<unknown>(null)

  useEffect(() => {
    let gone = false
    const refresh = () => {
      if (!shouldPoll(document.visibilityState)) return Promise.resolve()
      return getJobs().then((next) => {
        if (!gone) setRows(next)
      }).catch(() => {
        if (!gone) setFailed(true)
      })
    }
    let timer: number | undefined
    const stop = () => {
      if (timer !== undefined) window.clearInterval(timer)
      timer = undefined
    }
    const start = () => {
      if (timer !== undefined || !shouldPoll(document.visibilityState)) return
      void refresh()
      timer = window.setInterval(() => {
        if (!shouldPoll(document.visibilityState)) {
          stop()
          return
        }
        void pollJobs().then((next) => {
          if (!gone) setRows(next)
        }).catch(() => {
          if (!gone) setFailed(true)
        })
      }, 2000)
    }
    const onVisibility = () => {
      if (shouldPoll(document.visibilityState)) start()
      else stop()
    }
    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      gone = true
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  async function onDownload(id: string) {
    await downloadJob(id)
    setRows(await getJobs())
  }

  async function onRegenerate(row: JobView) {
    if (!row.regenerateEstimateUsd || !shell.falConfigured) return
    const result = await regenerateJob(row.id, row.regenerateEstimateUsd)
    setNotice(statusLine(result))
    onShell()
    setRows(await getJobs())
  }

  if (failed) return <p className="studio-help" role="alert">The jobs list was refused.</p>
  if (!rows) return <p className="studio-help">Reading jobs.</p>
  return (
    <>
      {shell.falConfigured ? null : <p className="studio-help" role="status">{DRAFT.falKey}</p>}
      <StatusLine body={notice} />
      <JobsTable rows={rows} regenerateBlocked={!shell.falConfigured} onDownload={(id) => void onDownload(id)} onRegenerate={(row) => void onRegenerate(row)} />
    </>
  )
}
