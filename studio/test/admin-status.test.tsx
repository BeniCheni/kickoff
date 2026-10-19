import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { COPY } from '../copy.ts'
import { DRAFT, RETIRED, STORAGE_REFUSAL } from '../shared/admin-copy.ts'
import { publishFieldsReady, statusLine } from '../shared/status.ts'
import { PublishCard } from '../ui/app/publish.tsx'
import { StatusLine } from '../ui/app/status.tsx'

const outcomes: { body: unknown; text: string }[] = [
  { body: { outcome: 'record-failed', reason: 'position-taken' }, text: 'Unavailable: that position is already taken. The clip stays listed.' },
  { body: { outcome: 'record-failed', reason: 'public-id-taken' }, text: 'Unavailable: that public id is already used. The clip stays listed.' },
  { body: { outcome: 'gate-closed' }, text: COPY.gate },
  { body: { outcome: 'card-refused', refusals: [DRAFT.cardWidth] }, text: DRAFT.cardWidth },
  {
    body: { outcome: 'card-refused', missing: ['a positive width', 'an approved subject', 'a finish time'] },
    text: `${DRAFT.cardWidth} ${DRAFT.cardSubject} ${DRAFT.cardFinished}`,
  },
  { body: { outcome: 'upload-failed' }, text: DRAFT.uploadFailed },
  { body: { outcome: 'upload-failed', object: 'video', status: 403, code: 'AccessDenied' }, text: `${DRAFT.uploadFailed} status=403 code=AccessDenied` },
  { body: { outcome: 'withdrawn', status: 404, code: 'NoSuchBucket' }, text: `${DRAFT.deleteFailed} status=404 code=NoSuchBucket` },
  { body: { outcome: 'estimate-changed' }, text: 'Unavailable: the price changed. Confirm the new estimate before submitting.' },
  { body: { outcome: 'not-in-registry' }, text: DRAFT.submitUnpriced },
  { body: { outcome: 'database-unavailable' }, text: DRAFT.submitDatabase },
  { body: { outcome: 'budget-refused' }, text: DRAFT.submitBudget },
  { body: { outcome: 'out-of-credit' }, text: COPY.outOfCredit },
  { body: { outcome: 'photo-missing' }, text: 'Unavailable: that photograph is not on this Mac.' },
]

describe('engine answers', () => {
  for (const outcome of outcomes) {
    const name = JSON.stringify(outcome.body)
    it(`renders ${name}`, () => {
      expect(statusLine(outcome.body)).toBe(outcome.text)
      const html = renderToStaticMarkup(<StatusLine body={outcome.body} />)
      expect(html).toContain('role="status"')
      expect(html).toContain(outcome.text)
    })
  }

  it('keeps a prompt when the batch was refused', () => {
    expect(statusLine({ outcome: 'submitted-batch', results: [{ outcome: 'submitted' }] })).toBeNull()
    expect(statusLine({ outcome: 'submitted-batch', results: [{ outcome: 'photo-missing' }] })).toBe('Unavailable: that photograph is not on this Mac.')
    expect(statusLine({ outcome: 'storage-refused', message: STORAGE_REFUSAL })).toBe(STORAGE_REFUSAL)
  })

  it('keeps Publish disabled until the public id, title, and position are valid', () => {
    expect(publishFieldsReady('', 'Title', '1')).toBe(false)
    expect(publishFieldsReady('clip', '', '1')).toBe(false)
    expect(publishFieldsReady('clip', 'Title', '')).toBe(false)
    expect(publishFieldsReady('clip', 'Title', '0')).toBe(false)
    expect(publishFieldsReady('clip', 'Title', '1')).toBe(true)
    const html = renderToStaticMarkup(
      <PublishCard
        view={{ outcome: 'publish', status: 'kept', gateRecorded: true, gateReason: null, refusals: [], assetId: null }}
        publicId="clip"
        title="Title"
        onPublicId={() => undefined}
        onTitle={() => undefined}
        gateAnswer=""
        gateDisclosure=""
        gateBy=""
        gateSource=""
        position=""
        onGateAnswer={() => undefined}
        onGateDisclosure={() => undefined}
        onGateBy={() => undefined}
        onGateSource={() => undefined}
        onPosition={() => undefined}
        onGate={() => undefined}
        onPublish={() => undefined}
        onUnpublish={() => undefined}
        onRetryDelete={() => undefined}
        onRetryRemoval={() => undefined}
        confirm={DRAFT.publishConfirm}
      />,
    )
    expect(html).toContain('disabled')
    expect(html).toContain('>Publish<')
  })

  it('renders the Article 50 gate row once, and the confirm reason once', () => {
    const html = renderToStaticMarkup(
      <PublishCard
        view={{ outcome: 'publish', status: 'kept', gateRecorded: false, gateReason: COPY.gate, refusals: [], assetId: null }}
        publicId="clip"
        title="Title"
        onPublicId={() => undefined}
        onTitle={() => undefined}
        gateAnswer=""
        gateDisclosure=""
        gateBy=""
        gateSource=""
        position="1"
        onGateAnswer={() => undefined}
        onGateDisclosure={() => undefined}
        onGateBy={() => undefined}
        onGateSource={() => undefined}
        onPosition={() => undefined}
        onGate={() => undefined}
        onPublish={() => undefined}
        onUnpublish={() => undefined}
        onRetryDelete={() => undefined}
        onRetryRemoval={() => undefined}
        confirm={DRAFT.publishConfirm}
      />,
    )
    expect(html.split(DRAFT.gateUnrecorded).length - 1).toBe(1)
    expect(html.split(COPY.gate).length - 1).toBe(1)
    expect(RETIRED.some((row) => row.draft === 'No pull-request checks. The engine refuses a publish that lacks the Card facts or the Article 50 answer, before anything is written.')).toBe(true)
    expect(RETIRED.some((row) => row.was.includes('Export stays unavailable') && row.draft === DRAFT.gateUnrecorded)).toBe(true)
  })
})
