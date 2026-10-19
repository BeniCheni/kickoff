import { and, eq } from 'drizzle-orm'
import { SUBJECT_LABELS } from '@kickoff/catalog'
import { article50Answer, asset, generation, generationInput, generationSubject, job, subject, videos } from '../db/schema.ts'
import { cardGaps } from '../engine.ts'
import { STORAGE_REFUSAL } from '../shared/admin-copy.ts'
import { cardRefusal } from '../shared/status.ts'
import type { OpenedAdmin } from './open.ts'

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

export function publishJobId(pathname: string, action: '' | 'gate' | 'go' | 'unpublish' | 'retry-delete' | 'retry-removal'): string | null {
  const suffix = action ? `/${action}` : ''
  const match = new RegExp(`^/api/publish/(${UUID})${suffix}$`, 'i').exec(pathname)
  return match?.[1] ?? null
}

export async function readPublish(opened: OpenedAdmin, jobId: string, publicId: string) {
  const [current] = await opened.db.select().from(job).where(eq(job.id, jobId))
  if (!current) return { outcome: 'missing' as const }
  const [gen] = await opened.db.select().from(generation).where(eq(generation.id, current.generationId))
  const [output] = gen?.outputAssetId ? await opened.db.select().from(asset).where(eq(asset.id, gen.outputAssetId)) : []
  const [k0Link] = gen ? await opened.db.select().from(generationInput).where(and(
    eq(generationInput.generationId, gen.id),
    eq(generationInput.role, 'first'),
  )) : []
  const [k0] = k0Link ? await opened.db.select().from(asset).where(eq(asset.id, k0Link.assetId)) : []
  const links = gen ? await opened.db.select().from(generationSubject).where(eq(generationSubject.generationId, gen.id)) : []
  const names: string[] = []
  for (const link of links) {
    const [who] = await opened.db.select().from(subject).where(eq(subject.id, link.subjectId))
    if (who) names.push(who.name)
  }
  const [gate] = await opened.db.select().from(article50Answer).limit(1)
  const [video] = await opened.db.select().from(videos).where(eq(videos.jobId, jobId))
  const approvedSubjects = names.filter((name) => (SUBJECT_LABELS as readonly string[]).includes(name)).length
  const missing = cardGaps({
    publicId,
    width: output?.width ?? null,
    height: output?.height ?? null,
    duration: output?.durationS ?? null,
    approvedSubjects,
    finishedAt: current.finishedAt,
  })
  const refusals = missing.map((item) => cardRefusal(item))
  const videoSha = output?.sha256
  const stillSha = k0?.sha256
  const keys = publicId && videoSha && stillSha ? {
    video: `${publicId}/video-${videoSha.slice(0, 8)}.mp4`,
    thumbnail: `${publicId}/thumbnail-${stillSha.slice(0, 8)}.jpg`,
  } : null
  return {
    outcome: 'publish' as const,
    jobId: current.id,
    status: current.status,
    assetId: output?.id ?? null,
    publicId: video?.publicId ?? null,
    title: video?.title ?? null,
    gateRecorded: Boolean(gate),
    gateReason: gate ? null : 'Unavailable: the Article 50 answer is not recorded (A-06).',
    missing,
    refusals,
    keys,
    recordedKeys: output?.bucket && output.objectPath ? { bucket: output.bucket, objectPath: output.objectPath } : null,
    removalStatus: video?.removalStatus ?? null,
    fallbackStatus: video?.fallbackStatus ?? null,
  }
}

export async function recordPublishGate(opened: OpenedAdmin, body: unknown) {
  if (!body || typeof body !== 'object') return { outcome: 'gate-empty' as const }
  const record = body as { answer?: unknown; disclosure?: unknown; recordedBy?: unknown; source?: unknown }
  if (typeof record.answer !== 'string' || typeof record.disclosure !== 'string' || typeof record.recordedBy !== 'string' || typeof record.source !== 'string') {
    return { outcome: 'gate-empty' as const }
  }
  return opened.studio.recordGate({
    answer: record.answer,
    disclosure: record.disclosure,
    recordedBy: record.recordedBy,
    source: record.source,
  })
}

export async function publishJob(opened: OpenedAdmin, jobId: string, body: unknown) {
  if (!body || typeof body !== 'object') return { outcome: 'refused' as const }
  const record = body as { publicId?: unknown; title?: unknown; position?: unknown; note?: unknown; confirm?: unknown }
  if (record.confirm !== true || typeof record.publicId !== 'string' || typeof record.title !== 'string' || typeof record.position !== 'number' || !Number.isInteger(record.position) || record.position < 1) {
    return { outcome: 'refused' as const }
  }
  const result = await opened.studio.publish({
    jobId,
    publicId: record.publicId,
    title: record.title,
    position: record.position,
    editorialNote: typeof record.note === 'string' ? record.note : undefined,
  })
  if (result.outcome === 'card-refused') {
    return { ...result, refusals: result.missing.map((item) => cardRefusal(item)) }
  }
  return result
}

function storageRefused(opened: OpenedAdmin): { outcome: 'storage-refused'; message: string } | null {
  if (opened.storage !== 'refused') return null
  return { outcome: 'storage-refused', message: STORAGE_REFUSAL }
}

export async function unpublishJob(opened: OpenedAdmin, jobId: string, body: unknown) {
  const deleteFiles = Boolean(body && typeof body === 'object' && (body as { deleteFiles?: unknown }).deleteFiles === true)
  if (deleteFiles) {
    const refused = storageRefused(opened)
    if (refused) return refused
  }
  return opened.studio.unpublish(jobId, { deleteFiles })
}

export async function retryDeleteJob(opened: OpenedAdmin, jobId: string) {
  const refused = storageRefused(opened)
  if (refused) return refused
  return opened.studio.retryDelete(jobId)
}

export async function retryRemovalJob(opened: OpenedAdmin, jobId: string) {
  const refused = storageRefused(opened)
  if (refused) return refused
  return opened.studio.retryRemoval(jobId)
}
