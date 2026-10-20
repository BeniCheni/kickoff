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
  'imported',
  'preview',
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
  missing: DRAFT.clipUnrecorded,
  'fal-key-missing': DRAFT.falKey,
  'storage-refused': STORAGE_REFUSAL,
  refused: 'Unavailable: the request was refused.',
}

/** One plain sentence for one item from the engine's `cardGaps` list. */
export function cardRefusal(item: string): string {
  if (item === 'a positive width') return DRAFT.cardWidth
  if (item === 'a positive height') return DRAFT.cardHeight
  if (item === 'a positive duration') return DRAFT.cardDuration
  if (item === 'an approved subject') return DRAFT.cardSubject
  if (item === 'a safe public id') return DRAFT.cardPublicId
  if (item === 'a finish time') return DRAFT.cardFinished
  return `Publish is refused: missing ${item}.`
}

/** Plain words for an import refusal. A named brand is appended only when it is a short token. */
export function importRefusal(body: { outcome?: string; reason?: string; brand?: string }): string | null {
  if (body.outcome === 'clip-refused' && body.reason === 'truncated') return DRAFT.importTruncated
  if (body.outcome === 'clip-refused' && body.reason === 'not-mp4') {
    return body.brand && /^[A-Za-z0-9]{1,8}$/.test(body.brand)
      ? `${DRAFT.importNotMp4} The brand is ${body.brand}.`
      : DRAFT.importNotMp4
  }
  if (body.outcome === 'clip-refused' && body.reason === 'no-video') return DRAFT.importNoVideo
  if (body.outcome === 'clip-refused') return DRAFT.importZeroDuration
  if (body.outcome === 'not-an-mp4') return DRAFT.importNotMp4
  if (body.outcome === 'already-imported') return DRAFT.importDuplicate
  if (body.outcome === 'needs-made-on') return DRAFT.importNeedsMadeOn
  if (body.outcome === 'not-a-jpeg') return DRAFT.importNotJpeg
  if (body.outcome === 'inside-worktree') return DRAFT.importWorktree
  if (body.outcome === 'png') return DRAFT.importPng
  if (body.outcome === 'clip-too-large') return DRAFT.importClipTooLarge
  if (body.outcome === 'still-too-large') return DRAFT.importStillTooLarge
  if (body.outcome === 'upload-missing') return DRAFT.importMissing
  if (body.outcome === 'uploads-folder') return DRAFT.uploadsFolder
  if (body.outcome === 'empty') return DRAFT.importEmpty
  if (body.outcome === 'prompt-empty') return DRAFT.importPromptEmpty
  if (body.outcome === 'title-empty') return DRAFT.importTitleEmpty
  if (body.outcome === 'subject-refused') return DRAFT.importSubject
  if (body.outcome === 'made-on-invalid') return DRAFT.importMadeOnInvalid
  if (body.outcome === 'wrong-type') return DRAFT.importWrongType
  return null
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
    missing?: unknown
    status?: unknown
    code?: unknown
    brand?: unknown
  }
  if (typeof record.outcome !== 'string') return null
  if (record.outcome === 'submitted-batch' && Array.isArray(record.results)) {
    for (const item of record.results) {
      const line = statusLine(item)
      if (line) return line
    }
    return null
  }
  if (record.outcome === 'card-refused' && Array.isArray(record.missing)) {
    const missing = record.missing.filter((item): item is string => typeof item === 'string')
    if (missing.length > 0) return missing.map((item) => cardRefusal(item)).join(' ')
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
  const imported = importRefusal({
    outcome: record.outcome,
    reason: typeof record.reason === 'string' ? record.reason : undefined,
    brand: typeof record.brand === 'string' ? record.brand : undefined,
  })
  if (imported) return imported
  if (SUCCESS.has(record.outcome)) return null
  return sentence(record.outcome, typeof record.reason === 'string' ? record.reason : undefined)
}

/** The Publish screen's sentence for the embedding outcome. Draft copy for Beni. */
export function embeddingNotice(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null
  const embedding = (body as { embedding?: unknown }).embedding
  if (embedding === 'written') return DRAFT.embeddingWritten
  if (embedding === 'missing') return DRAFT.embeddingMissing
  return null
}

export function publishFieldsReady(publicId: string, title: string, position: string): boolean {
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(publicId)) return false
  if (title.trim().length === 0) return false
  return /^[1-9]\d*$/.test(position)
}
