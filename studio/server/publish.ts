import { eq } from 'drizzle-orm'
import { siteCopyPath } from '@kickoff/catalog'
import { article50Answer, asset, generation, generationInput, generationSubject, job, subject, videos } from '../db/schema.ts'
import { DRAFT } from '../shared/admin-copy.ts'
import type { OpenedAdmin } from './open.ts'

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

export function publishJobId(pathname: string, action: '' | 'gate' | 'go' | 'unpublish' | 'retry-delete' | 'retry-removal'): string | null {
  const suffix = action ? `/${action}` : ''
  const match = new RegExp(`^/api/publish/(${UUID})${suffix}$`, 'i').exec(pathname)
  return match?.[1] ?? null
}

function positive(value: number | string | null | undefined): boolean {
  if (value === null || value === undefined) return false
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) && number > 0
}

export async function readPublish(opened: OpenedAdmin, jobId: string, publicId: string) {
  const [current] = await opened.db.select().from(job).where(eq(job.id, jobId))
  if (!current) return { outcome: 'missing' as const }
  const [gen] = await opened.db.select().from(generation).where(eq(generation.id, current.generationId))
  const [output] = gen?.outputAssetId ? await opened.db.select().from(asset).where(eq(asset.id, gen.outputAssetId)) : []
  const [k0Link] = gen ? await opened.db.select().from(generationInput).where(eq(generationInput.generationId, gen.id)) : []
  const [k0] = k0Link ? await opened.db.select().from(asset).where(eq(asset.id, k0Link.assetId)) : []
  const links = gen ? await opened.db.select().from(generationSubject).where(eq(generationSubject.generationId, gen.id)) : []
  const names: string[] = []
  for (const link of links) {
    const [who] = await opened.db.select().from(subject).where(eq(subject.id, link.subjectId))
    if (who) names.push(who.name)
  }
  const [gate] = await opened.db.select().from(article50Answer).limit(1)
  const [video] = await opened.db.select().from(videos).where(eq(videos.jobId, jobId))
  const refusals: string[] = []
  if (!positive(output?.width)) refusals.push(DRAFT.cardWidth)
  if (!positive(output?.height)) refusals.push(DRAFT.cardHeight)
  if (!positive(output?.durationS)) refusals.push(DRAFT.cardDuration)
  if (names.length !== 1) refusals.push(DRAFT.cardSubject)
  if (siteCopyPath(publicId) === null) refusals.push(DRAFT.cardPublicId)
  if (!current.finishedAt) refusals.push(DRAFT.cardFinished)
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
  const preview = await readPublish(opened, jobId, record.publicId)
  if (preview.outcome !== 'publish') return preview
  if (!preview.gateRecorded) return { outcome: 'gate-closed' as const, refusals: preview.refusals }
  if (preview.refusals.length > 0) return { outcome: 'card-refused' as const, refusals: preview.refusals }
  return opened.studio.publish({
    jobId,
    publicId: record.publicId,
    title: record.title,
    position: record.position,
    editorialNote: typeof record.note === 'string' ? record.note : undefined,
  })
}

export async function unpublishJob(opened: OpenedAdmin, jobId: string, body: unknown) {
  const deleteFiles = Boolean(body && typeof body === 'object' && (body as { deleteFiles?: unknown }).deleteFiles === true)
  return opened.studio.unpublish(jobId, { deleteFiles })
}

export async function retryDeleteJob(opened: OpenedAdmin, jobId: string) {
  return opened.studio.retryDelete(jobId)
}

export async function retryRemovalJob(opened: OpenedAdmin, jobId: string) {
  return opened.studio.retryRemoval(jobId)
}
