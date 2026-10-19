import { desc, eq, isNull } from 'drizzle-orm'
import { decideBudget, PER_JOB_CAP_USD, SESSION_CAP_USD } from '../caps.ts'
import { ledger, session, subject } from '../db/schema.ts'
import { sessionExposure, type LedgerView } from '../ledger.ts'
import { addUsd, cmpUsd } from '../money.ts'
import { registry, selectRegistry } from '../registry.ts'
import { largestEstimate, sumEstimates } from '../shared/compose.ts'
import type { OpenedAdmin } from './open.ts'
import { findPhoto, loadPhotos, photoBytes } from './photos.ts'

export async function readCompose(opened: OpenedAdmin) {
  const now = opened.clock()
  const subjects = await opened.db.select().from(subject).orderBy(desc(subject.createdAt))
  const keyframeModels = registry.filter((row) => row.task === 'edit' && selectRegistry(row.endpoint, {}, now)?.id === row.id)
  const clipModels = registry.filter((row) => row.task === 'video' && selectRegistry(row.endpoint, { resolution: '480P' }, now)?.id === row.id)
  const [current] = await opened.db.select().from(session).where(isNull(session.closedAt)).limit(1)
  let spend = '0.000000'
  if (current) {
    const lines = await opened.db.select().from(ledger).where(eq(ledger.sessionId, current.id))
    const views: LedgerView[] = lines.map((line) => ({
      jobId: line.jobId,
      settlement: line.settlement === 'reconciled' ? 'reconciled' : 'pending',
      estimateUsd: line.estimateUsd,
      amountUsd: line.amountUsd,
      at: line.at,
    }))
    spend = sessionExposure(views)
  }
  return {
    subjects: subjects.map((row) => ({ id: row.id, name: row.name })),
    photos: loadPhotos(opened.mediaDir).map((photo) => ({ id: photo.id, sha256: photo.sha256 })),
    keyframeModels: keyframeModels.map((row) => ({ id: row.id, endpoint: row.endpoint, pinnedOn: row.pinnedOn })),
    clipModels: clipModels.map((row) => ({ id: row.id, endpoint: row.endpoint, pinnedOn: row.pinnedOn })),
    sessionSpendUsd: spend,
    perJobCapUsd: PER_JOB_CAP_USD,
    sessionCapUsd: SESSION_CAP_USD,
    database: opened.database,
  }
}

type PostedJob = {
  endpoint?: unknown
  params?: unknown
  prompt?: unknown
  seed?: unknown
  photoId?: unknown
  subjectId?: unknown
}

function jobsOf(body: unknown): PostedJob[] {
  if (!body || typeof body !== 'object' || !Array.isArray((body as { jobs?: unknown }).jobs)) return []
  return (body as { jobs: PostedJob[] }).jobs
}

export async function estimateJobs(opened: OpenedAdmin, body: unknown) {
  const spend = (await readCompose(opened)).sessionSpendUsd
  const lines = []
  for (const job of jobsOf(body)) {
    if (typeof job.endpoint !== 'string' || !job.params || typeof job.params !== 'object') {
      lines.push({ outcome: 'not-in-registry' as const })
      continue
    }
    lines.push(await opened.studio.estimate({
      endpoint: job.endpoint,
      params: job.params as Record<string, unknown>,
    }))
  }
  const priced = lines.flatMap((line) => line.outcome === 'estimate' ? [line.usd] : [])
  const totalUsd = sumEstimates(priced)
  const largest = largestEstimate(priced)
  const overJob = priced.some((usd) => cmpUsd(usd, PER_JOB_CAP_USD) > 0)
  const overSession = priced.length > 0 && cmpUsd(addUsd(spend, totalUsd), SESSION_CAP_USD) > 0
  const overBudget = overJob || overSession
  return {
    lines,
    totalUsd,
    largestUsd: largest,
    sessionSpendUsd: spend,
    overBudget,
    unpriced: lines.some((line) => line.outcome !== 'estimate'),
  }
}

export async function submitJobs(opened: OpenedAdmin, body: unknown) {
  if (!opened.falConfigured) return { outcome: 'fal-key-missing' as const }
  if (opened.database === 'unavailable') return { outcome: 'database-unavailable' as const }
  const estimate = await estimateJobs(opened, body)
  const confirm = body && typeof body === 'object' ? (body as { confirmTotalUsd?: unknown }).confirmTotalUsd : undefined
  if (typeof confirm !== 'string' || confirm !== estimate.totalUsd) {
    return { outcome: 'estimate-changed' as const, totalUsd: estimate.totalUsd }
  }
  if (estimate.unpriced) return { outcome: 'not-in-registry' as const, ...estimate }
  if (estimate.overBudget) return { outcome: 'budget-refused' as const, ...estimate }
  const results = []
  let running = estimate.sessionSpendUsd
  for (const job of jobsOf(body)) {
    const endpoint = job.endpoint
    const params = job.params
    const prompt = job.prompt
    if (typeof endpoint !== 'string' || typeof prompt !== 'string' || !params || typeof params !== 'object') {
      results.push({ outcome: 'not-in-registry' as const })
      continue
    }
    const one = await opened.studio.estimate({ endpoint, params: params as Record<string, unknown> })
    if (one.outcome !== 'estimate') {
      results.push(one)
      continue
    }
    if (decideBudget(one.usd, running) === 'budget-refused') {
      results.push({ outcome: 'budget-refused' as const })
      continue
    }
    const photograph = typeof job.photoId === 'string' ? photoBytes(opened.mediaDir, job.photoId) ?? undefined : undefined
    if (typeof job.photoId === 'string' && !photograph) {
      results.push({ outcome: 'photo-missing' as const })
      continue
    }
    const result = await opened.studio.submit({
      endpoint,
      params: params as Record<string, unknown>,
      prompt,
      seed: typeof job.seed === 'string' ? job.seed : null,
      photograph: photograph ?? undefined,
      subjectId: typeof job.subjectId === 'string' ? job.subjectId : undefined,
    })
    if (result.outcome === 'out-of-credit') opened.outOfCredit.current = true
    if (result.outcome === 'submitted' || result.outcome === 'budget-refused') running = addUsd(running, one.usd)
    results.push(result)
  }
  return { outcome: 'submitted-batch' as const, results }
}

export function recordedPhoto(opened: OpenedAdmin, id: string) {
  const photo = findPhoto(opened.mediaDir, id)
  return photo
}
