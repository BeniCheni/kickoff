/**
 * Synthetic Studio records for the web-admin proofs.
 * Placeholder JPEG bytes are generated here. Nothing is a photograph.
 * Width, height, and duration on a "ready" clip are stand-in facts: the
 * engine's download does not record them, and the Publish screen's Card
 * check (until ST3b) refuses a clip without them.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { eq, isNull } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { CHECKLIST_LINES, asset, generation, generationInput, job, ledger, session, studioTables, subject } from '../db/schema.ts'
import { createStudio, type Studio, type StudioDatabase } from '../engine.ts'
import { createFalStub, type ScriptName } from '../fal/stub.ts'
import { sha256 } from '../hash.ts'
import { sessionExposure, type LedgerView } from '../ledger.ts'
import { formatUsd, parseUsd } from '../money.ts'
import { storePhoto } from '../server/photos.ts'
import { createStorageStub } from '../storage/stub.ts'
import { minimalJpeg } from '../test/jpeg.ts'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '../..')
const migrationsFolder = path.resolve(here, '../db/migrations')
const VIDEO = 'minimax/h3-max-turbo/image-to-video'

export type SeedManifest = {
  mode: 'matrix' | 'flow'
  subjectId: string
  photoId: string
  jobs: Record<string, string>
  sessionSpendUsd: string
}

function video(seed: string, duration = 15) {
  return {
    endpoint: VIDEO,
    params: { prompt: 'a fictional cat, synthetic proof', duration, resolution: '480P' as const, seed },
    prompt: 'a fictional cat, synthetic proof',
    seed,
  }
}

async function openDb(dataDir: string) {
  const client = new PGlite(path.join(dataDir, 'pglite'))
  const db = drizzle(client, { schema: studioTables })
  await migrate(db, { migrationsFolder })
  return { client, db }
}

let requestOffset = 0

function openStudio(db: StudioDatabase, mediaDir: string, script: ScriptName, opts?: { downloadThrows?: boolean; ceilingMs?: number }) {
  let now = new Date('2026-10-18T18:00:00.000Z')
  requestOffset += 100
  const base = createFalStub(script, { statusCalls: 0, requestSequence: requestOffset })
  const fal = opts?.downloadThrows
    ? { ...base, async download() { throw new Error('disk') } }
    : base
  const studio = createStudio({
    db,
    fal,
    storage: createStorageStub().port,
    mediaDir,
    repoRoot,
    clock: () => now,
    ...(opts?.ceilingMs ? { timeoutCeilingMs: opts.ceilingMs } : {}),
  })
  return {
    studio,
    advance(ms: number) {
      now = new Date(now.getTime() + ms)
    },
  }
}

async function submitted(studio: Studio, seed: string, duration = 15, subjectId?: string) {
  const result = await studio.submit({ ...video(seed, duration), ...(subjectId ? { subjectId } : {}) })
  if (result.outcome !== 'submitted') throw new Error(`${seed} submit ${result.outcome}`)
  return result.jobId
}

async function until(studio: Studio, seed: string, subjectId?: string) {
  const jobId = await submitted(studio, seed, 15, subjectId)
  for (let step = 0; step < 6; step += 1) {
    const polled = await studio.poll(jobId)
    if (polled.outcome === 'completed' || polled.outcome === 'failed' || polled.outcome === 'refused' || polled.outcome === 'timed-out') {
      return jobId
    }
  }
  throw new Error(`${seed} did not settle`)
}

async function generationOf(db: StudioDatabase, jobId: string) {
  const [row] = await db.select().from(job).where(eq(job.id, jobId))
  if (!row) throw new Error(`missing ${jobId}`)
  const [gen] = await db.select().from(generation).where(eq(generation.id, row.generationId))
  if (!gen?.outputAssetId) throw new Error(`no output ${jobId}`)
  return { row, gen, assetId: gen.outputAssetId }
}

async function stampReady(db: StudioDatabase, mediaDir: string, jobId: string) {
  const { gen, assetId } = await generationOf(db, jobId)
  await db.update(asset).set({ width: 320, height: 180, durationS: '1.000' }).where(eq(asset.id, assetId))
  const stillPath = path.join(mediaDir, `still-${jobId}.jpg`)
  writeFileSync(stillPath, minimalJpeg)
  const [still] = await db.insert(asset).values({
    role: 'keyframe',
    sha256: sha256(minimalJpeg),
    mime: 'image/jpeg',
    bytes: minimalJpeg.byteLength,
    width: 8,
    height: 8,
    localPath: stillPath,
  }).returning()
  if (!still) throw new Error('still')
  await db.insert(generationInput).values({ generationId: gen.id, assetId: still.id, role: 'first' })
}

async function spendOf(db: StudioDatabase): Promise<string> {
  const [open] = await db.select().from(session).where(isNull(session.closedAt)).limit(1)
  if (!open) return '0.000000'
  const lines = await db.select().from(ledger).where(eq(ledger.sessionId, open.id))
  const views: LedgerView[] = lines.map((line) => ({
    jobId: line.jobId,
    settlement: line.settlement === 'reconciled' ? 'reconciled' : 'pending',
    estimateUsd: line.estimateUsd,
    amountUsd: line.amountUsd,
    at: line.at,
  }))
  return sessionExposure(views)
}

async function fillSession(db: StudioDatabase, mediaDir: string) {
  const spend = await spendOf(db)
  const unit = parseUsd('0.025000')
  const cap = parseUsd('6.000000')
  const next = parseUsd('0.375000')
  const current = parseUsd(spend)
  const minAdd = cap - next - current + 1n
  const maxAdd = cap - current
  if (minAdd <= 0n) return spend
  const steps = (minAdd + unit - 1n) / unit
  const add = steps * unit
  if (add > maxAdd || add > parseUsd('1.500000')) {
    throw new Error(`cannot fill session from ${spend}: add ${formatUsd(add)}`)
  }
  const duration = Number(add / unit)
  const { studio } = openStudio(db, mediaDir, 'queued-then-completed')
  await submitted(studio, 'filler', duration)
  return spendOf(db)
}

export async function seedAdmin(dataDir: string, mediaDir: string, mode: 'matrix' | 'flow'): Promise<SeedManifest> {
  mkdirSync(dataDir, { recursive: true })
  mkdirSync(mediaDir, { recursive: true })
  const { client, db } = await openDb(dataDir)
  const jobs: Record<string, string> = {}
  try {
    const [who] = await db.insert(subject).values({ name: 'Fenway', description: 'synthetic proof subject' }).returning()
    if (!who) throw new Error('subject')
    const photo = storePhoto(mediaDir, minimalJpeg)
    if ('outcome' in photo) throw new Error(photo.outcome)

    const plain = openStudio(db, mediaDir, 'queued-then-completed')
    jobs.downloaded = await until(plain.studio, 'downloaded', who.id)
    await plain.studio.download(jobs.downloaded)

    jobs.keptPlain = await until(plain.studio, 'kept-plain', who.id)
    await plain.studio.download(jobs.keptPlain)
    const kept = await plain.studio.keep(jobs.keptPlain, CHECKLIST_LINES.map((line) => ({ line, answer: 'clear' as const, by: 'operator' })))
    if (kept.outcome !== 'kept') throw new Error(kept.outcome)

    if (mode === 'flow' || mode === 'matrix') {
      jobs.keptReady = await until(plain.studio, 'kept-ready', who.id)
      await plain.studio.download(jobs.keptReady)
      await stampReady(db, mediaDir, jobs.keptReady)
      const ready = await plain.studio.keep(jobs.keptReady, CHECKLIST_LINES.map((line) => ({ line, answer: 'clear' as const, by: 'operator' })))
      if (ready.outcome !== 'kept') throw new Error(ready.outcome)
    }

    if (mode === 'matrix') {
      jobs.discarded = await until(plain.studio, 'discarded', who.id)
      await plain.studio.download(jobs.discarded)
      if ((await plain.studio.discard(jobs.discarded)).outcome !== 'discarded') throw new Error('discard')

      jobs.submitted = await submitted(plain.studio, 'submitted')
      const queueStudio = openStudio(db, mediaDir, 'queued-then-completed')
      jobs.queued = await submitted(queueStudio.studio, 'queued')
      if ((await queueStudio.studio.poll(jobs.queued)).outcome !== 'queued') throw new Error('queued')
      const progressStudio = openStudio(db, mediaDir, 'queued-then-completed')
      jobs.inProgress = await submitted(progressStudio.studio, 'in-progress')
      await progressStudio.studio.poll(jobs.inProgress)
      if ((await progressStudio.studio.poll(jobs.inProgress)).outcome !== 'in-progress') throw new Error('in-progress')
      jobs.completed = await until(plain.studio, 'completed')

      const failing = openStudio(db, mediaDir, 'queued-then-completed', { downloadThrows: true })
      jobs.downloadFailed = await until(failing.studio, 'download-failed')
      if ((await failing.studio.download(jobs.downloadFailed)).outcome !== 'download-failed') throw new Error('download-failed')

      const expired = openStudio(db, mediaDir, 'expired-result')
      jobs.resultExpired = await until(expired.studio, 'result-expired')
      if ((await expired.studio.download(jobs.resultExpired)).outcome !== 'result-expired') throw new Error('result-expired')

      const errored = openStudio(db, mediaDir, 'error-payload')
      jobs.failed = await until(errored.studio, 'failed')

      const safety = openStudio(db, mediaDir, 'safety-refusal')
      jobs.refused = await until(safety.studio, 'refused')

      const timed = openStudio(db, mediaDir, 'timeout', { ceilingMs: 1000 })
      jobs.timedOut = await submitted(timed.studio, 'timed-out')
      timed.advance(5000)
      if ((await timed.studio.poll(jobs.timedOut)).outcome !== 'timed-out') throw new Error('timed-out')

      jobs.cancelled = await submitted(plain.studio, 'cancelled')
      if ((await plain.studio.cancel(jobs.cancelled)).outcome !== 'cancelled') throw new Error('cancelled')

      const credit = openStudio(db, mediaDir, 'out-of-credit')
      const draft = await credit.studio.submit(video('draft'))
      if (draft.outcome !== 'out-of-credit' || !('jobId' in draft)) throw new Error(`draft ${draft.outcome}`)
      jobs.draft = draft.jobId

      const over = await plain.studio.submit(video('budget', 80))
      if (over.outcome !== 'budget-refused' || !('jobId' in over)) throw new Error(`budget ${over.outcome}`)
      jobs.budgetRefused = over.jobId

      jobs.published = await until(plain.studio, 'published', who.id)
      await plain.studio.download(jobs.published)
      await stampReady(db, mediaDir, jobs.published)
      if ((await plain.studio.keep(jobs.published, CHECKLIST_LINES.map((line) => ({ line, answer: 'clear' as const, by: 'operator' })))).outcome !== 'kept') {
        throw new Error('published keep')
      }
      jobs.withdrawn = await until(plain.studio, 'withdrawn', who.id)
      await plain.studio.download(jobs.withdrawn)
      await stampReady(db, mediaDir, jobs.withdrawn)
      if ((await plain.studio.keep(jobs.withdrawn, CHECKLIST_LINES.map((line) => ({ line, answer: 'clear' as const, by: 'operator' })))).outcome !== 'kept') {
        throw new Error('withdrawn keep')
      }
      const gate = await plain.studio.recordGate({
        answer: 'Recorded for the proof matrix. Applicability is not decided here.',
        disclosure: 'The Generated label stays on the clip.',
        recordedBy: 'operator',
        source: 'seed-admin',
      })
      if (gate.outcome !== 'gate-recorded') throw new Error(gate.outcome)
      const published = await plain.studio.publish({
        jobId: jobs.published,
        publicId: 'matrix-published',
        title: 'Synthetic published clip',
        position: 1,
      })
      if (published.outcome !== 'published') throw new Error(`publish ${published.outcome}`)
      const withdrawn = await plain.studio.publish({
        jobId: jobs.withdrawn,
        publicId: 'matrix-withdrawn',
        title: 'Synthetic withdrawn clip',
        position: 2,
      })
      if (withdrawn.outcome !== 'published') throw new Error(`withdraw-publish ${withdrawn.outcome}`)
      const removed = await plain.studio.unpublish(jobs.withdrawn, { deleteFiles: false })
      if (removed.outcome !== 'withdrawn') throw new Error(removed.outcome)

      await fillSession(db, mediaDir)
    }

    const manifest: SeedManifest = {
      mode,
      subjectId: who.id,
      photoId: photo.id,
      jobs,
      sessionSpendUsd: await spendOf(db),
    }
    writeFileSync(path.join(dataDir, 'seed-manifest.json'), JSON.stringify(manifest, null, 2))
    return manifest
  } finally {
    await client.close()
  }
}

const invoked = process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (invoked) {
  const dataDir = process.argv[2]
  const mediaDir = process.argv[3]
  const mode = process.argv[4]
  if (!dataDir || !mediaDir || (mode !== 'matrix' && mode !== 'flow')) {
    process.stderr.write('usage: tsx scripts/seed-admin.ts <data-dir> <media-dir> matrix|flow\n')
    process.exitCode = 1
  } else {
    seedAdmin(dataDir, mediaDir, mode).then((manifest) => {
      process.stdout.write(`${JSON.stringify(manifest)}\n`)
    }).catch((error: unknown) => {
      process.stderr.write(`${error instanceof Error ? error.message : 'seed failed'}\n`)
      process.exitCode = 1
    })
  }
}
