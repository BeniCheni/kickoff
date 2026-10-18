import { describe, expect, it } from 'vitest'
import { decideBudget, PER_JOB_CAP_USD, PREPAID_CEILING_USD, SESSION_CAP_USD, TIMEOUT_CEILING_LABEL, TIMEOUT_CEILING_MS } from '../caps.ts'
import { aboveManualCeiling, jobExposure, reconcileAmount, sessionExposure } from '../ledger.ts'
import { addUsd, cmpUsd } from '../money.ts'
import { brooklynStart, estimateUsd, GROK_IMAGINE, registry, selectRegistry, unknownParam } from '../registry.ts'

const video = 'minimax/h3-max-turbo/image-to-video'
const edit = 'openai/gpt-image-2/edit'

describe('recipe v0 registry', () => {
  it('prices H3 Max Turbo at 480P through 14 Oct and from 15 Oct, in Brooklyn', () => {
    const before = selectRegistry(video, { resolution: '480P', duration: 15 }, new Date('2026-10-14T23:30:00-04:00'))
    const after = selectRegistry(video, { resolution: '480P', duration: 15 }, new Date('2026-10-15T00:30:00-04:00'))
    const pacificEvening = selectRegistry(video, { resolution: '480P', duration: 15 }, new Date('2026-10-14T21:30:00-07:00'))
    expect(before?.price).toMatchObject({ usd: '0.015000', tag: 'DOCUMENTED' })
    expect(after?.price).toMatchObject({ usd: '0.025000', tag: 'DOCUMENTED' })
    expect(pacificEvening?.id).toBe(after?.id)
    expect(estimateUsd(before!, { duration: 15 })).toBe('0.225000')
    expect(estimateUsd(after!, { duration: 15 })).toBe('0.375000')
  })

  it('uses the observed upper bound for gpt-image-2/edit until it is reconciled', () => {
    const row = selectRegistry(edit, { prompt: 'a fictional cat' }, new Date('2026-10-12T22:00:00-04:00'))
    expect(row?.price).toMatchObject({ usd: '0.051000', tag: 'OBSERVED', kind: 'per_request' })
    expect(row?.validUntil).toBeNull()
    expect(estimateUsd(row!, {})).toBe('0.051000')
  })

  it('refuses an endpoint or a resolution that is not pinned', () => {
    const now = new Date('2026-10-12T22:00:00-04:00')
    expect(selectRegistry('fal-ai/flux-2/edit', {}, now)).toBeNull()
    expect(selectRegistry(video, { resolution: '768P', duration: 15 }, now)).toBeNull()
    const row = selectRegistry(video, { resolution: '480P', duration: 5 }, now)
    expect(unknownParam(row!, { resolution: '480P', duration: 5, lora: true })).toBe('lora')
  })

  it('pins the two recipe endpoints and both H3 dates', () => {
    expect(registry.map((row) => row.endpoint)).toEqual([edit, video, video])
    expect(registry.map((row) => row.pinnedOn)).toEqual(['2026-10-05', '2026-10-05', '2026-10-05'])
  })

  it('keeps Grok Imagine out of the priced registry', () => {
    const now = new Date('2026-10-18T16:00:00.000Z')
    expect(GROK_IMAGINE.endpoint).toBe('xai/grok-imagine (grok.com, made by hand)')
    expect(selectRegistry(GROK_IMAGINE.endpoint, {}, now)).toBeNull()
    expect(registry.some((row) => row.id === GROK_IMAGINE.id)).toBe(false)
    expect(brooklynStart('2026-10-18')?.toISOString()).toBe('2026-10-18T04:00:00.000Z')
    expect(brooklynStart('2026-01-15')?.toISOString()).toBe('2026-01-15T05:00:00.000Z')
    expect(brooklynStart('2026-02-31')).toBeNull()
    expect(brooklynStart('18-10-2026')).toBeNull()
  })
})

describe('caps and ledger arithmetic', () => {
  it('refuses a request over $1.50 or one that would take the session past $6', () => {
    expect(decideBudget('1.500000', '0.000000')).toBe('ok')
    expect(decideBudget('1.500001', '0.000000')).toBe('budget-refused')
    expect(decideBudget('0.225000', '5.775000')).toBe('ok')
    expect(decideBudget('0.225000', '5.776000')).toBe('budget-refused')
    expect(PER_JOB_CAP_USD).toBe('1.500000')
    expect(SESSION_CAP_USD).toBe('6.000000')
  })

  it('keeps the billed amount pending until units are multiplied by the unit price', () => {
    const lines = [{
      jobId: 'job-1',
      settlement: 'pending' as const,
      estimateUsd: '0.225000',
      amountUsd: null,
      at: new Date('2026-10-12T16:00:00Z'),
    }]
    expect(jobExposure(lines)).toBe('0.225000')
    expect(reconcileAmount('15.000000', '0.015000')).toBe('0.225000')
    expect(reconcileAmount('5.000000', '0.025000')).toBe('0.125000')
    const reconciled = [...lines, {
      jobId: 'job-1',
      settlement: 'reconciled' as const,
      estimateUsd: '0.225000',
      amountUsd: '0.225000',
      at: new Date('2026-10-12T16:01:00Z'),
    }]
    expect(sessionExposure(reconciled)).toBe('0.225000')
    expect(cmpUsd(addUsd('0.051000', '0.225000'), '0.276000')).toBe(0)
  })

  it('records a prepaid balance without claiming to have read it', () => {
    expect(PREPAID_CEILING_USD).toBe('9.370000')
    expect(aboveManualCeiling('9.370000')).toBe(false)
    expect(aboveManualCeiling('9.370001')).toBe(true)
    expect(TIMEOUT_CEILING_MS).toBe(600_000)
    expect(TIMEOUT_CEILING_LABEL).toBe('proposal')
  })
})
