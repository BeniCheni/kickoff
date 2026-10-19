import { COPY } from '../copy.ts'
import { DRAFT, STORAGE_REFUSAL } from './admin-copy.ts'

function storageDetail(record: { status?: unknown; code?: unknown }): string | null {
  const hasStatus = record.status !== undefined && record.status !== null
  const hasCode = typeof record.code === 'string' && record.code.length > 0
  if (!hasStatus && !hasCode) return null
  const status = hasStatus ? String(record.status) : 'none'
  const code = hasCode ? record.code : 'unknown'
  return `status=${status} code=${code}`
}

const SUCCESS = new Set([
  'submitted',
  'submitted-batch',
  'kept',
  'discarded',
  'downloaded',
  'completed',
  'published',
  'withdrawn',
  'gate-recorded',
  'gate-already-recorded',
  'already-published',
  'already-withdrawn',
  'delete-retried',
  'merged',
])

const SENTENCE: Record<string, string> = {
  'public-id-taken': 'Unavailable: that public id is already used. The clip stays listed.',
  'position-taken': 'Unavailable: that position is already taken. The clip stays listed.',
  'gate-closed': COPY.gate,
  'card-refused': 'Unavailable: the Card facts are not on the record.',
  'upload-failed': DRAFT.uploadFailed,
  'estimate-changed': 'Unavailable: the price changed. Confirm the new estimate before submitting.',
  'not-in-registry': DRAFT.submitUnpriced,
  'database-unavailable': DRAFT.submitDatabase,
  'budget-refused': DRAFT.submitBudget,
  'out-of-credit': COPY.outOfCredit,
  'photo-missing': 'Unavailable: that photograph is not on this Mac.',
  'fal-key-missing': DRAFT.falKey,
  'storage-refused': STORAGE_REFUSAL,
  refused: 'Unavailable: the request was refused.',
}

function sentence(outcome: string, reason?: string): string {
  if (outcome === 'record-failed') {
    const named = reason ? SENTENCE[reason] : undefined
    return named ?? `Unavailable: record-failed${reason ? ` · ${reason}` : ''}.`
  }
  return SENTENCE[outcome] ?? `Unavailable: ${outcome}.`
}

/** A non-success engine answer, or null when the action landed. */
export function statusLine(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null
  const record = body as {
    outcome?: unknown
    reason?: unknown
    message?: unknown
    results?: unknown
    refusals?: unknown
    status?: unknown
    code?: unknown
  }
  if (typeof record.outcome !== 'string') return null
  if (record.outcome === 'submitted-batch' && Array.isArray(record.results)) {
    for (const item of record.results) {
      const line = statusLine(item)
      if (line) return line
    }
    return null
  }
  if (record.outcome === 'card-refused' && Array.isArray(record.refusals)) {
    const words = record.refusals.filter((item): item is string => typeof item === 'string')
    if (words.length > 0) return words.join(' ')
  }
  if (record.outcome === 'storage-refused' && typeof record.message === 'string') return record.message
  const detail = storageDetail(record)
  if (record.outcome === 'upload-failed') return detail ? `${DRAFT.uploadFailed} ${detail}` : DRAFT.uploadFailed
  if ((record.outcome === 'withdrawn' || record.outcome === 'delete-retried') && detail) {
    return `${DRAFT.deleteFailed} ${detail}`
  }
  if (SUCCESS.has(record.outcome)) return null
  return sentence(record.outcome, typeof record.reason === 'string' ? record.reason : undefined)
}

export function publishFieldsReady(publicId: string, title: string, position: string): boolean {
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(publicId)) return false
  if (title.trim().length === 0) return false
  return /^[1-9]\d*$/.test(position)
}
