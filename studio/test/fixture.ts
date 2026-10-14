import { eq } from 'drizzle-orm'
import {
  CHECKLIST_LINES,
  asset,
  generation,
  generationInput,
  job,
  model,
  policyAnswer,
  policyCheck,
  session,
  subject,
} from '../db/schema.ts'
import type { StudioDatabase } from './harness.ts'

const when = new Date('2026-10-12T16:00:00.000Z')

export async function seedClip(db: StudioDatabase) {
  const [cat] = await db.insert(subject).values({ name: 'Fenway', description: 'A fictional cat' }).returning()
  if (!cat) throw new Error('subject insert returned nothing')
  const [pinned] = await db.insert(model).values({
    registryId: 'minimax-h3-max-turbo-i2v-480p-through-2026-10-14',
    endpoint: 'minimax/h3-max-turbo/image-to-video',
    task: 'video',
    allowedParams: ['prompt', 'image_url', 'end_image_url', 'duration', 'resolution', 'seed'],
    priceRule: { kind: 'per_second', usd: '0.015000', resolution: '480P', tag: 'DOCUMENTED' },
    priceCheckedOn: '2026-10-04',
    priceValidUntil: '2026-10-14',
    pinnedOn: '2026-10-05',
  }).returning()
  if (!pinned) throw new Error('model insert returned nothing')
  const [open] = await db.insert(session).values({
    capUsd: '6.000000',
    perJobCapUsd: '1.500000',
    openedAt: when,
  }).returning()
  if (!open) throw new Error('session insert returned nothing')
  const [k0] = await db.insert(asset).values({
    role: 'keyframe',
    sha256: 'k0-hash',
    mime: 'image/jpeg',
    bytes: 1200,
    width: 1280,
    height: 800,
    localPath: '/outside/k0.jpg',
  }).returning()
  const [videoAsset] = await db.insert(asset).values({
    role: 'video',
    sha256: 'video-hash',
    mime: 'video/mp4',
    bytes: 4_000_000,
    width: 768,
    height: 480,
    durationS: '15.084',
    localPath: '/outside/clip.mp4',
  }).returning()
  const [thumbnail] = await db.insert(asset).values({
    role: 'thumbnail',
    sha256: 'k0-hash',
    mime: 'image/jpeg',
    bytes: 1200,
    width: 1280,
    height: 800,
    localPath: '/outside/k0.jpg',
  }).returning()
  const [photo] = await db.insert(asset).values({
    role: 'reference',
    sha256: 'photo-hash-private',
    mime: 'image/jpeg',
    bytes: 800,
    localPath: '/outside/photo.jpg',
  }).returning()
  if (!k0 || !videoAsset || !thumbnail || !photo) throw new Error('asset insert returned nothing')
  const [gen] = await db.insert(generation).values({
    kind: 'video',
    modelId: pinned.id,
    prompt: 'draft-prompt-secret',
    promptSha256: 'prompt-hash',
    params: { duration: 15, resolution: '480P' },
    seed: '20261004',
    cacheKey: 'cache-1',
    status: 'downloaded',
  }).returning()
  if (!gen) throw new Error('generation insert returned nothing')
  await db.insert(generationInput).values({ generationId: gen.id, assetId: k0.id, role: 'first' })
  const [row] = await db.insert(job).values({
    generationId: gen.id,
    sessionId: open.id,
    attempt: 1,
    idempotencyKey: 'idem-1',
    estimateUsd: '0.225000',
    status: 'downloaded',
    finishedAt: when,
  }).returning()
  if (!row) throw new Error('job insert returned nothing')
  return {
    subjectId: cat.id,
    modelId: pinned.id,
    sessionId: open.id,
    generationId: gen.id,
    jobId: row.id,
    k0Id: k0.id,
    videoAssetId: videoAsset.id,
    thumbnailId: thumbnail.id,
    photoId: photo.id,
    when,
  }
}

export async function markKept(db: StudioDatabase, generationId: string, jobId: string) {
  const [check] = await db.insert(policyCheck).values({
    generationId,
    policyVersion: 'v1',
    fictionalOnly: true,
    noRealMarks: true,
    attestedAt: when,
    attestedBy: 'operator',
  }).returning()
  if (!check) throw new Error('policy check insert returned nothing')
  await db.insert(policyAnswer).values(CHECKLIST_LINES.map((line) => ({
    policyCheckId: check.id,
    line,
    answer: 'clear' as const,
    answeredBy: 'operator',
    answeredAt: when,
  })))
  await db.update(job).set({ status: 'kept' }).where(eq(job.id, jobId))
  await db.update(generation).set({ status: 'kept', reviewed: 'kept' }).where(eq(generation.id, generationId))
}
