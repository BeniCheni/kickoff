import { existsSync } from 'node:fs'
import path from 'node:path'
import { desc, eq } from 'drizzle-orm'
import {
  CHECKLIST_LINES,
  type ChecklistAnswer,
  asset,
  generation,
  generationParent,
  job,
  model,
  policyAnswer,
  policyCheck,
} from '../db/schema.ts'
import type { OpenedAdmin } from './open.ts'

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

export function reviewJobId(pathname: string, action: '' | 'keep' | 'discard' | 'regenerate'): string | null {
  const suffix = action ? `/${action}` : ''
  const match = new RegExp(`^/api/review/(${UUID})${suffix}$`, 'i').exec(pathname)
  return match?.[1] ?? null
}

export function assetIdFrom(pathname: string): string | null {
  const match = new RegExp(`^/media/assets/(${UUID})$`, 'i').exec(pathname)
  return match?.[1] ?? null
}

function insideMedia(mediaDir: string, localPath: string): string | null {
  const full = path.resolve(localPath)
  const relative = path.relative(path.resolve(mediaDir), full)
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null
  if (!existsSync(full)) return null
  return full
}

export async function recordedAssetFile(opened: OpenedAdmin, assetId: string): Promise<{ file: string; mime: string } | null> {
  if (!new RegExp(`^${UUID}$`, 'i').test(assetId)) return null
  const [row] = await opened.db.select().from(asset).where(eq(asset.id, assetId))
  if (!row?.localPath) return null
  const file = insideMedia(opened.mediaDir, row.localPath)
  if (!file) return null
  return { file, mime: row.mime }
}

export async function readReview(opened: OpenedAdmin, jobId: string) {
  const [current] = await opened.db.select().from(job).where(eq(job.id, jobId))
  if (!current) return { outcome: 'missing' as const }
  const [gen] = await opened.db.select().from(generation).where(eq(generation.id, current.generationId))
  const [pinned] = gen ? await opened.db.select().from(model).where(eq(model.id, gen.modelId)) : []
  const [output] = gen?.outputAssetId ? await opened.db.select().from(asset).where(eq(asset.id, gen.outputAssetId)) : []
  const parents = gen
    ? await opened.db.select().from(generationParent).where(eq(generationParent.generationId, gen.id))
    : []
  const checks = gen
    ? await opened.db.select().from(policyCheck).where(eq(policyCheck.generationId, gen.id)).orderBy(desc(policyCheck.createdAt))
    : []
  const latest = checks[0]
  const answers = latest
    ? await opened.db.select().from(policyAnswer).where(eq(policyAnswer.policyCheckId, latest.id))
    : []
  const file = output?.localPath ? insideMedia(opened.mediaDir, output.localPath) : null
  return {
    outcome: 'review' as const,
    jobId: current.id,
    status: current.status,
    generationId: gen?.id ?? null,
    prompt: gen?.prompt ?? null,
    seed: gen?.seed ?? null,
    endpoint: pinned?.endpoint ?? null,
    pinnedOn: pinned?.pinnedOn ?? null,
    estimateUsd: current.estimateUsd,
    assetId: file && output ? output.id : null,
    file: output && file ? {
      mime: output.mime,
      bytes: output.bytes,
      sha256: output.sha256,
      width: output.width,
      height: output.height,
      durationS: output.durationS,
    } : null,
    parents: parents.map((parent) => parent.parentId),
    answers: answers.map((answer) => ({ line: answer.line, answer: answer.answer })),
    regenerateEstimateUsd: await reviewEstimate(opened, pinned?.endpoint, gen?.params, current.status),
    attestation: latest?.attestedAt ? {
      by: latest.attestedBy,
      at: latest.attestedAt.toISOString(),
    } : null,
  }
}

export async function keepJob(opened: OpenedAdmin, jobId: string, body: unknown) {
  const raw = body && typeof body === 'object' ? (body as { answers?: unknown }).answers : undefined
  if (!Array.isArray(raw)) return { outcome: 'keep-unavailable' as const }
  const answers = raw.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const line = (item as { line?: unknown }).line
    const answer = (item as { answer?: unknown }).answer
    if (typeof line !== 'string' || typeof answer !== 'string') return []
    if (!(CHECKLIST_LINES as readonly string[]).includes(line)) return []
    if (answer !== 'clear' && answer !== 'present' && answer !== 'unsure') return []
    return [{ line: line as (typeof CHECKLIST_LINES)[number], answer: answer as ChecklistAnswer, by: 'operator' }]
  })
  return opened.studio.keep(jobId, answers)
}

export async function discardJob(opened: OpenedAdmin, jobId: string) {
  return opened.studio.discard(jobId)
}

async function reviewEstimate(opened: OpenedAdmin, endpoint: string | undefined, params: unknown, status: string): Promise<string | null> {
  if (!endpoint || (status !== 'downloaded' && status !== 'kept' && status !== 'discarded')) return null
  const record = params && typeof params === 'object' ? params as Record<string, unknown> : {}
  const estimate = await opened.studio.estimate({ endpoint, params: record })
  return estimate.outcome === 'estimate' ? estimate.usd : null
}

export async function regenerateReview(opened: OpenedAdmin, jobId: string, body: unknown) {
  const confirm = body && typeof body === 'object' ? (body as { confirmEstimate?: unknown }).confirmEstimate : undefined
  if (typeof confirm !== 'string') return { outcome: 'refused' as const }
  const [current] = await opened.db.select().from(job).where(eq(job.id, jobId))
  if (!current || (current.status !== 'downloaded' && current.status !== 'kept' && current.status !== 'discarded')) {
    return { outcome: 'not-ready' as const }
  }
  const [gen] = await opened.db.select().from(generation).where(eq(generation.id, current.generationId))
  const [pinned] = gen ? await opened.db.select().from(model).where(eq(model.id, gen.modelId)) : []
  if (!gen || !pinned) return { outcome: 'not-ready' as const }
  const params = gen.params && typeof gen.params === 'object' ? gen.params as Record<string, unknown> : {}
  const estimate = await opened.studio.estimate({ endpoint: pinned.endpoint, params })
  if (estimate.outcome !== 'estimate') return estimate
  if (confirm !== estimate.usd) return { outcome: 'estimate-changed' as const, usd: estimate.usd }
  const result = await opened.studio.submit({
    endpoint: pinned.endpoint,
    params,
    prompt: gen.prompt,
    seed: gen.seed,
    parentGenerationId: gen.id,
  })
  if (result.outcome === 'out-of-credit') opened.outOfCredit.current = true
  return result
}
