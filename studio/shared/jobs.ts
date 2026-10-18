import { COPY } from '../copy.ts'
import { displayUsd } from './display.ts'

/** The ledger states the admin can draw. A test checks this against studio/db/schema.ts. */
export const ADMIN_JOB_STATES = [
  'draft',
  'budget-refused',
  'submitted',
  'queued',
  'in-progress',
  'completed',
  'downloaded',
  'kept',
  'published',
  'withdrawn',
  'discarded',
  'failed',
  'refused',
  'timed-out',
  'cancelled',
] as const

export type AdminJobState = (typeof ADMIN_JOB_STATES)[number]

export type JobVoice = 'neutral' | 'muted' | 'ink' | 'pitch' | 'alarm'

export type JobBilled =
  | { kind: 'pending' }
  | { kind: 'unknown' }
  | { kind: 'none' }
  | { kind: 'reconciled'; amountUsd: string }

export type JobView = {
  id: string
  status: AdminJobState
  substate: 'download-failed' | 'result-expired' | null
  subject: string | null
  step: string
  model: string | null
  estimateUsd: string
  billed: JobBilled
  at: string
  elapsedSeconds: number | null
  regenerateEstimateUsd: string | null
}

const LABELS: Record<AdminJobState, string> = {
  draft: 'Draft',
  'budget-refused': 'Budget-refused',
  submitted: 'Submitted',
  queued: 'Queued',
  'in-progress': 'In progress',
  completed: 'Completed',
  downloaded: 'Downloaded',
  kept: 'Kept',
  published: 'Published',
  withdrawn: 'Withdrawn',
  discarded: 'Discarded',
  failed: 'Failed',
  refused: 'Refused',
  'timed-out': 'Timed out',
  cancelled: 'Cancelled',
}

/** D5's download-failed paragraph. The CLI prints the shorter first sentences. */
export const DOWNLOAD_FAILED_NOTE = `${COPY.downloadFailed} Result expiry: unknown until read from fal\u2019s documentation; shown here as unknown.`

export function jobVoice(status: AdminJobState): JobVoice {
  if (status === 'kept') return 'pitch'
  if (status === 'published') return 'ink'
  if (status === 'discarded' || status === 'cancelled' || status === 'withdrawn') return 'muted'
  if (status === 'failed' || status === 'timed-out') return 'alarm'
  return 'neutral'
}

export function jobLabel(status: AdminJobState, substate: JobView['substate']): string {
  if (status === 'completed' && substate === 'download-failed') return 'Completed · download failed'
  if (status === 'completed' && substate === 'result-expired') return 'Completed · result expired'
  return LABELS[status]
}

export function jobNote(status: AdminJobState, substate: JobView['substate']): string | null {
  if (status === 'completed' && substate === 'download-failed') return DOWNLOAD_FAILED_NOTE
  if (status === 'completed' && substate === 'result-expired') return COPY.resultExpired
  if (status === 'completed') return COPY.completed
  if (status === 'refused') return COPY.refused
  if (status === 'timed-out') return COPY.timedOut
  return null
}

export function jobAction(status: AdminJobState, substate: JobView['substate']): 'retry-download' | 'regenerate' | null {
  if (status === 'completed' && substate === 'download-failed') return 'retry-download'
  if (status === 'completed' && substate === 'result-expired') return 'regenerate'
  return null
}

export const RETRY_DOWNLOAD_LABEL = 'Retry download · no new charge'

export function regenerateLabel(estimateUsd: string): string {
  return `Regenerate · est. ${displayUsd(estimateUsd)}`
}

export function formatElapsed(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(whole / 60)
  const remain = whole % 60
  return `${minutes} m ${remain.toString().padStart(2, '0')} s`
}

/** Poll only while the document is visible. A hidden tab makes no request. */
export function shouldPoll(visibility: string): boolean {
  return visibility === 'visible'
}
