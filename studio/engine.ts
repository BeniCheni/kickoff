import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { and, desc, eq, isNull } from 'drizzle-orm'
import {
  CHECKLIST_LINES,
  type ChecklistAnswer,
  type ChecklistLine,
  type JobState,
  article50Answer,
  asset,
  balanceEntry,
  event,
  generation,
  generationInput,
  generationParent,
  generationSubject,
  job,
  subject,
  ledger,
  model,
  policyAnswer,
  policyCheck,
  session,
  videos,
  studioTables,
} from './db/schema.ts'
import { SUBJECT_LABELS } from '@kickoff/catalog'
import { hasVisibleAnswer } from './answer.ts'
import { decideBudget, PER_JOB_CAP_USD, PREPAID_CEILING_USD, REQUEST_START_TIMEOUT_SECONDS, SESSION_CAP_USD, TIMEOUT_CEILING_LABEL, TIMEOUT_CEILING_MS } from './caps.ts'
import { falHeaders } from './fal/headers.ts'
import { cancelResponseSchema, resultState, resultEnvelopeSchema, statusResponseSchema, submitEnvelopeSchema, submitResponseSchema } from './fal/schemas.ts'
import { OutOfCreditError, ResultExpiredError, type FalTransport } from './fal/stub.ts'
import { isQueueOrigin, queueAddresses } from './fal/urls.ts'
import { cacheKey as makeCacheKey, sha256 } from './hash.ts'
import { aboveManualCeiling, jobExposure, reconcileAmount, sessionExposure, type LedgerView } from './ledger.ts'
import { addUsd, formatUsd, parseUsd } from './money.ts'
import { readClipFacts } from './media/mp4.ts'
import { preparePhotograph } from './photos/strip.ts'
import { brooklynDate, brooklynStart, estimateUsd, GROK_IMAGINE, selectRegistry, unknownParam, type RegistryRow } from './registry.ts'
import { ObjectStoreError, siteCopyStatus, type SiteCopyOutcome, type StoragePort, type StoredObject } from './storage/port.ts'
import type { PgliteDatabase } from 'drizzle-orm/pglite'

export type StudioDatabase = PgliteDatabase<typeof studioTables>

const SAFE_PUBLIC_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/
const APPROVED_SUBJECTS = new Set<string>(SUBJECT_LABELS)

function pinnedOnOf(params: unknown, fallback: string): string {
  if (!params || typeof params !== 'object') return fallback
  const value = (params as { pinned_on?: unknown }).pinned_on
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : fallback
}

function importedNote(detail: unknown): string | null {
  if (!detail || typeof detail !== 'object') return null
  const note = (detail as { note?: unknown }).note
  return typeof note === 'string' && note.length > 0 ? note : null
}

export function cardGaps(input: {
  publicId: string
  width: number | null
  height: number | null
  duration: string | number | null
  approvedSubjects: number
  finishedAt: Date | null
}): string[] {
  const missing: string[] = []
  if (input.width === null || input.width <= 0) missing.push('a positive width')
  if (input.height === null || input.height <= 0) missing.push('a positive height')
  const duration = input.duration === null ? Number.NaN : Number(input.duration)
  if (!Number.isFinite(duration) || duration <= 0) missing.push('a positive duration')
  if (input.approvedSubjects < 1) missing.push('an approved subject')
  if (!SAFE_PUBLIC_ID.test(input.publicId)) missing.push('a safe public id')
  if (input.finishedAt === null) missing.push('a finish time')
  return missing
}

const IN_FLIGHT = new Set<JobState>(['submitted', 'queued', 'in-progress', 'completed'])
const CANCELLABLE = new Set<JobState>(['submitted', 'queued', 'in-progress'])
const CLOSE_BLOCKED = new Set<JobState>(['submitted', 'queued', 'in-progress'])
const STORED = new Set<JobState>(['downloaded', 'kept', 'published', 'withdrawn'])

export type StudioFlags = {
  breakLedgerWrite: boolean
  breakAfterAccept: boolean
  breakRecordWrite: boolean
}

type LedgerLine = { settlement: string; amountUsd: string | null }

function isSubmitUnconfirmed(row: { status: string; providerRequestId: string | null }, lines: readonly LedgerLine[]): boolean {
  if (row.status !== 'draft' || row.providerRequestId) return false
  if (lines.some((line) => line.settlement === 'reconciled')) return false
  return lines.some((line) => line.settlement === 'pending')
}

/** fal's reliability page, read 13 Oct 2026: failed requests that return 5xx are not billed. */
const SERVER_ERROR_BILLING = 'https://fal.ai/docs/model-apis/model-endpoints/reliability'

function requestIdOf(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null
  const id = (body as { request_id?: unknown }).request_id
  return typeof id === 'string' && id.length > 0 ? id : null
}

function falErrorType(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null
  const record = body as { error_type?: unknown; error?: unknown }
  if (typeof record.error_type === 'string' && record.error_type.length > 0) return record.error_type
  if (record.error && typeof record.error === 'object') {
    const type = (record.error as { type?: unknown }).type
    if (typeof type === 'string' && type.length > 0) return type
  }
  return null
}

function acceptedQueueBody(body: unknown): { request_id: string; status_url: string; response_url: string; cancel_url: string } | null {
  const parsed = submitResponseSchema.safeParse(body)
  if (!parsed.success) return null
  if (!isQueueOrigin(parsed.data.status_url) || !isQueueOrigin(parsed.data.response_url) || !isQueueOrigin(parsed.data.cancel_url)) {
    return null
  }
  return parsed.data
}

function photographDataUri(bytes: Uint8Array): string {
  return `data:image/jpeg;base64,${Buffer.from(bytes).toString('base64')}`
}

export type SubmitInput = {
  endpoint: string
  params: Record<string, unknown>
  prompt: string
  inputHashes?: readonly string[]
  seed?: string | null
  photograph?: Uint8Array
  subjectId?: string
  parentGenerationId?: string
  keyframe?: { localPath: string; sha256: string; bytes: number }
}

type EngineOptions = {
  db: StudioDatabase
  fal: FalTransport
  storage: StoragePort
  mediaDir: string
  repoRoot: string
  clock?: () => Date
  timeoutCeilingMs?: number
  requestTimeoutSeconds?: number
  flags?: StudioFlags
}

function assertOutsideWorktree(dir: string, repoRoot: string) {
  const relative = path.relative(repoRoot, path.resolve(dir))
  const inside = relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
  if (inside) throw new Error('media directory must sit outside the worktree')
}

function views(lines: readonly {
  jobId: string
  settlement: string
  estimateUsd: string
  amountUsd: string | null
  at: Date
}[]): LedgerView[] {
  return lines.map((line) => ({
    jobId: line.jobId,
    settlement: line.settlement === 'reconciled' ? 'reconciled' : 'pending',
    estimateUsd: line.estimateUsd,
    amountUsd: line.amountUsd,
    at: line.at,
  }))
}

export function createStudio(options: EngineOptions) {
  const clock = options.clock ?? (() => new Date())
  const timeoutCeilingMs = options.timeoutCeilingMs ?? TIMEOUT_CEILING_MS
  const requestTimeoutSeconds = options.requestTimeoutSeconds ?? REQUEST_START_TIMEOUT_SECONDS
  const flags = options.flags ?? {
    breakLedgerWrite: false,
    breakAfterAccept: false,
    breakRecordWrite: false,
  }
  assertOutsideWorktree(options.mediaDir, options.repoRoot)
  const { db, fal, storage } = options

  async function spend(sessionId: string): Promise<string> {
    const lines = await db.select().from(ledger).where(eq(ledger.sessionId, sessionId))
    return sessionExposure(views(lines))
  }

  async function currentSession() {
    const [open] = await db.select().from(session).where(isNull(session.closedAt)).limit(1)
    if (open) return open
    const [created] = await db.insert(session).values({
      capUsd: SESSION_CAP_USD,
      perJobCapUsd: PER_JOB_CAP_USD,
      openedAt: clock(),
    }).returning()
    if (!created) throw new Error('session insert returned nothing')
    return created
  }

  async function upsertModel(row: RegistryRow, tx: StudioDatabase) {
    const [existing] = await tx.select().from(model).where(eq(model.registryId, row.id))
    if (existing) return existing
    const [created] = await tx.insert(model).values({
      registryId: row.id,
      endpoint: row.endpoint,
      task: row.task,
      allowedParams: [...row.allowedParams],
      priceRule: row.price,
      priceCheckedOn: row.priceReadOn,
      priceValidUntil: row.validUntil,
      pinnedOn: row.pinnedOn,
    }).returning()
    if (!created) throw new Error('model insert returned nothing')
    return created
  }

  async function approvedSubjectCount(generationId: string): Promise<number> {
    const links = await db.select().from(generationSubject).where(eq(generationSubject.generationId, generationId))
    let count = 0
    for (const link of links) {
      const [row] = await db.select().from(subject).where(eq(subject.id, link.subjectId))
      if (row && APPROVED_SUBJECTS.has(row.name)) count += 1
    }
    return count
  }

  async function recordEvent(jobId: string, type: string, detail?: unknown, writer: StudioDatabase = db) {
    await writer.insert(event).values({ jobId, at: clock(), type, detail: detail ?? null })
  }

  function storeFailure(error: unknown): { status?: number; code?: string } {
    if (!(error instanceof ObjectStoreError)) return {}
    return {
      ...(typeof error.status === 'number' ? { status: error.status } : {}),
      code: error.code,
    }
  }

  async function setJob(jobId: string, generationId: string, status: JobState, extra: {
    substate?: 'download-failed' | 'result-expired' | null
    refusalReason?: string | null
    requestId?: string
    statusUrl?: string
    responseUrl?: string
    cancelUrl?: string
    finished?: boolean
    submitted?: boolean
  } = {}, writer?: StudioDatabase) {
    const apply = async (tx: StudioDatabase) => {
      await tx.update(job).set({
        status,
        ...(extra.substate !== undefined ? { completedSubstate: extra.substate } : {}),
        ...(extra.refusalReason !== undefined ? { refusalReason: extra.refusalReason } : {}),
        ...(extra.requestId !== undefined ? { providerRequestId: extra.requestId } : {}),
        ...(extra.statusUrl !== undefined ? { statusUrl: extra.statusUrl } : {}),
        ...(extra.responseUrl !== undefined ? { responseUrl: extra.responseUrl } : {}),
        ...(extra.cancelUrl !== undefined ? { cancelUrl: extra.cancelUrl } : {}),
        ...(extra.finished ? { finishedAt: clock() } : {}),
        ...(extra.submitted ? { submittedAt: clock() } : {}),
      }).where(eq(job.id, jobId))
      await tx.update(generation).set({
        status,
        ...(extra.refusalReason !== undefined ? { refusalReason: extra.refusalReason } : {}),
        ...(status === 'kept' || status === 'discarded' ? { reviewed: status } : {}),
      }).where(eq(generation.id, generationId))
      await recordEvent(jobId, status, undefined, tx)
    }
    if (writer) await apply(writer)
    else await db.transaction(async (tx) => apply(tx as unknown as StudioDatabase))
  }

  async function headers(carriesPhotograph: boolean) {
    return falHeaders({ requestTimeoutSeconds, carriesPhotograph })
  }

  function recordFailure(error: unknown) {
    const message = error instanceof Error
      ? `${error.message} ${error.cause instanceof Error ? error.cause.message : ''}`
      : String(error)
    if (message.includes('videos_id_token')) {
      return { outcome: 'card-refused' as const, missing: ['a safe public id'], live: false as const }
    }
    if (message.includes('Article 50')) return { outcome: 'gate-closed' as const, live: false as const }
    if (message.includes('videos_live_position')) {
      return { outcome: 'record-failed' as const, live: false as const, listedAgain: true as const, reason: 'position-taken' as const }
    }
    if (message.includes('videos_public_id')) {
      return { outcome: 'record-failed' as const, live: false as const, listedAgain: true as const, reason: 'public-id-taken' as const }
    }
    return { outcome: 'record-failed' as const, live: false as const, listedAgain: true as const, reason: 'unspecified' as const }
  }

  async function finishFallback(videoId: string, publicId: string, sourceSha256: string, retried: boolean) {
    let outcome: SiteCopyOutcome = 'checks-failed'
    try {
      outcome = (await storage.deliverFallback({ publicId, sourceSha256 })).outcome
    } catch {
      outcome = 'checks-failed'
    }
    await db.update(videos).set({ fallbackStatus: siteCopyStatus(outcome) }).where(eq(videos.id, videoId))
    if (outcome === 'checks-failed') {
      return { outcome: 'checks-failed' as const, live: true as const, retryable: true as const }
    }
    return {
      outcome: 'published' as const,
      live: true as const,
      fallback: outcome,
      ...(retried ? { fallbackRetried: true as const } : {}),
    }
  }

  async function deleteRemaining(videoId: string) {
    const [row] = await db.select().from(videos).where(eq(videos.id, videoId))
    if (!row) throw new Error('missing catalog row')
    let videoRemoved = row.videoRemovedAt !== null
    let thumbnailRemoved = row.thumbnailRemovedAt !== null
    let attempted = 0
    let failure: { status?: number; code?: string } = {}
    const note = async (object: 'video' | 'thumbnail', error: unknown) => {
      const fields = storeFailure(error)
      if (failure.code === undefined) failure = fields
      await recordEvent(row.jobId, 'delete-failed', { object, ...fields })
    }
    if (!videoRemoved) {
      const [videoAsset] = await db.select().from(asset).where(eq(asset.id, row.videoAssetId))
      if (!videoAsset?.bucket || !videoAsset.objectPath) videoRemoved = true
      else {
        attempted += 1
        try {
          await storage.remove({ bucket: videoAsset.bucket, objectPath: videoAsset.objectPath })
          await db.update(videos).set({ videoRemovedAt: clock() }).where(eq(videos.id, row.id))
          videoRemoved = true
        } catch (error) {
          videoRemoved = false
          await note('video', error)
        }
      }
    }
    if (!thumbnailRemoved) {
      const [thumbnail] = await db.select().from(asset).where(eq(asset.id, row.thumbnailAssetId))
      if (!thumbnail?.bucket || !thumbnail.objectPath) thumbnailRemoved = true
      else {
        attempted += 1
        try {
          await storage.remove({ bucket: thumbnail.bucket, objectPath: thumbnail.objectPath })
          await db.update(videos).set({ thumbnailRemovedAt: clock() }).where(eq(videos.id, row.id))
          thumbnailRemoved = true
        } catch (error) {
          thumbnailRemoved = false
          await note('thumbnail', error)
        }
      }
    }
    return { videoRemoved, thumbnailRemoved, attempted, ...failure }
  }

  async function runRemoval(videoId: string, publicId: string): Promise<{ outcome: SiteCopyOutcome }> {
    let outcome: SiteCopyOutcome = 'checks-failed'
    try {
      outcome = (await storage.removeSiteCopy({ publicId })).outcome
    } catch {
      outcome = 'checks-failed'
    }
    await db.update(videos).set({ removalStatus: siteCopyStatus(outcome) }).where(eq(videos.id, videoId))
    return { outcome }
  }

  return {
    timeoutCeilingMs,
    timeoutCeilingLabel: TIMEOUT_CEILING_LABEL,
    prepaidCeilingUsd: PREPAID_CEILING_USD,

    async estimate(input: { endpoint: string; params: Record<string, unknown> }) {
      const row = selectRegistry(input.endpoint, input.params, clock())
      if (!row) return { outcome: 'not-in-registry' as const }
      const unknown = unknownParam(row, input.params)
      if (unknown) return { outcome: 'param-not-allowed' as const, param: unknown }
      const usd = estimateUsd(row, input.params)
      if (!usd) return { outcome: 'not-in-registry' as const }
      return { outcome: 'estimate' as const, usd, registryId: row.id, tag: row.price.tag }
    },

    async recordBalance(amountUsd: string) {
      const open = await currentSession()
      await db.insert(balanceEntry).values({
        sessionId: open.id,
        amountUsd,
        enteredAt: clock(),
      })
      return { amountUsd, aboveCeiling: aboveManualCeiling(amountUsd), readFromFal: false as const }
    },

    async submit(input: SubmitInput) {
      const row = selectRegistry(input.endpoint, input.params, clock())
      if (!row) return { outcome: 'not-in-registry' as const }

      let photographHash: string | undefined
      const body: Record<string, unknown> = { ...input.params }
      const hashes = [...(input.inputHashes ?? [])]
      if (input.photograph) {
        let prepared: { bytes: Uint8Array; sha256: string }
        try {
          prepared = preparePhotograph(input.photograph)
        } catch (error) {
          if (error instanceof Error && error.message === 'not a jpeg') return { outcome: 'not-a-jpeg' as const }
          throw error
        }
        photographHash = prepared.sha256
        hashes.push(prepared.sha256)
        body.image_urls = [photographDataUri(prepared.bytes)]
      }
      const unknown = unknownParam(row, body)
      if (unknown) return { outcome: 'param-not-allowed' as const, param: unknown }
      const usd = estimateUsd(row, input.params)
      if (!usd) return { outcome: 'not-in-registry' as const }
      const key = makeCacheKey({
        registryId: row.id,
        params: input.params,
        inputHashes: hashes,
        seed: input.seed ?? null,
      })

      const cached = await db.select().from(generation).where(eq(generation.cacheKey, key))
      for (const item of cached) {
        if (!item.outputAssetId) continue
        const [storedJob] = await db.select().from(job).where(eq(job.generationId, item.id)).orderBy(desc(job.createdAt)).limit(1)
        if (storedJob && STORED.has(storedJob.status as JobState)) {
          return { outcome: 'cache-hit' as const, assetId: item.outputAssetId, costUsd: '0.000000', jobId: storedJob.id }
        }
      }

      const [latest] = await db.select({
        id: job.id,
        status: job.status,
        requestId: job.providerRequestId,
      }).from(job).innerJoin(generation, eq(generation.id, job.generationId)).where(eq(generation.cacheKey, key)).orderBy(desc(job.createdAt)).limit(1)
      if (latest?.status === 'refused' && latest.requestId) return { outcome: 'refused' as const, jobId: latest.id, retried: false as const }
      if (latest && IN_FLIGHT.has(latest.status as JobState)) {
        return { outcome: 'in-flight' as const, jobId: latest.id, status: latest.status }
      }
      if (latest?.status === 'draft' && latest.requestId) {
        return { outcome: 'urls-unusable' as const, jobId: latest.id, requestId: latest.requestId }
      }
      if (latest?.status === 'draft' && !latest.requestId) {
        const prior = await db.select().from(ledger).where(eq(ledger.jobId, latest.id))
        if (isSubmitUnconfirmed({ status: latest.status, providerRequestId: latest.requestId }, prior)) {
          return { outcome: 'submit-unconfirmed' as const, jobId: latest.id }
        }
      }

      const open = await currentSession()
      const sessionSpend = await spend(open.id)
      if (decideBudget(usd, sessionSpend) === 'budget-refused') {
        const refused = await db.transaction(async (tx) => {
          const pinned = await upsertModel(row, tx as unknown as StudioDatabase)
          const [gen] = await tx.insert(generation).values({
            kind: row.task === 'edit' ? 'edit' : 'video',
            modelId: pinned.id,
            prompt: input.prompt,
            promptSha256: sha256(input.prompt),
            params: input.params,
            seed: input.seed ?? null,
            cacheKey: key,
            status: 'budget-refused',
          }).returning()
          if (!gen) throw new Error('generation insert returned nothing')
          const [created] = await tx.insert(job).values({
            generationId: gen.id,
            sessionId: open.id,
            attempt: 1,
            idempotencyKey: randomUUID(),
            estimateUsd: usd,
            status: 'budget-refused',
          }).returning()
          if (!created) throw new Error('job insert returned nothing')
          return created
        })
        await recordEvent(refused.id, 'budget-refused')
        return { outcome: 'budget-refused' as const, jobId: refused.id }
      }

      let prepared: { jobId: string; generationId: string; idempotencyKey: string }
      try {
        prepared = await db.transaction(async (tx) => {
          if (flags.breakLedgerWrite) throw new Error('database unavailable')
          const pinned = await upsertModel(row, tx as unknown as StudioDatabase)
          const [gen] = await tx.insert(generation).values({
            kind: row.task === 'edit' ? 'edit' : 'video',
            modelId: pinned.id,
            prompt: input.prompt,
            promptSha256: sha256(input.prompt),
            params: input.params,
            seed: input.seed ?? null,
            cacheKey: key,
            status: 'draft',
          }).returning()
          if (!gen) throw new Error('generation insert returned nothing')
          if (input.keyframe) {
            const [k0] = await tx.insert(asset).values({
              role: 'keyframe',
              sha256: input.keyframe.sha256,
              mime: 'image/jpeg',
              bytes: input.keyframe.bytes,
              localPath: input.keyframe.localPath,
            }).returning()
            if (!k0) throw new Error('keyframe insert returned nothing')
            await tx.insert(generationInput).values({
              generationId: gen.id,
              assetId: k0.id,
              role: 'first',
            })
          }
          if (input.subjectId) {
            await tx.insert(generationSubject).values({ generationId: gen.id, subjectId: input.subjectId })
          }
          if (input.parentGenerationId) {
            await tx.insert(generationParent).values({ generationId: gen.id, parentId: input.parentGenerationId })
          }
          const idempotencyKey = randomUUID()
          const [created] = await tx.insert(job).values({
            generationId: gen.id,
            sessionId: open.id,
            attempt: 1,
            idempotencyKey,
            estimateUsd: usd,
            status: 'draft',
          }).returning()
          if (!created) throw new Error('job insert returned nothing')
          const soFar = await tx.select().from(ledger).where(eq(ledger.sessionId, open.id))
          const running = addUsd(sessionExposure(views(soFar)), usd)
          await tx.insert(ledger).values({
            jobId: created.id,
            sessionId: open.id,
            at: clock(),
            estimateUsd: usd,
            basis: 'estimate',
            settlement: 'pending',
            runningSessionTotal: running,
          })
          await tx.insert(event).values({ jobId: created.id, at: clock(), type: 'estimate-recorded' })
          return { jobId: created.id, generationId: gen.id, idempotencyKey }
        })
      } catch (error) {
        if (error instanceof Error && error.message === 'database unavailable') {
          return { outcome: 'database-unavailable' as const }
        }
        throw error
      }

      const carriesPhotograph = Boolean(input.photograph)
      let accepted: { request_id: string; status_url: string; response_url: string; cancel_url: string }
      try {
        const raw = await fal.submit({
          endpoint: row.endpoint,
          body,
          headers: await headers(carriesPhotograph),
        })
        if (flags.breakAfterAccept) throw new Error('database unavailable')
        const envelope = submitEnvelopeSchema.safeParse(raw)
        if (!envelope.success) {
          await recordEvent(prepared.jobId, 'submit-unconfirmed', { reason: 'unparsed' })
          return { outcome: 'submit-unconfirmed' as const, jobId: prepared.jobId }
        }
        const { httpStatus, body: responseBody } = envelope.data
        const requestId = requestIdOf(responseBody)
        const parsedUrls = acceptedQueueBody(responseBody)
        if (httpStatus >= 400 && !requestId) {
          const mapped = resultState(httpStatus, responseBody)
          const errorType = falErrorType(responseBody)
          try {
            await db.transaction(async (tx) => {
              const writer = tx as unknown as StudioDatabase
              if (httpStatus >= 500 && httpStatus <= 599) {
                const sessionLines = await writer.select().from(ledger).where(eq(ledger.sessionId, open.id))
                const others = sessionExposure(views(sessionLines).filter((line) => line.jobId !== prepared.jobId))
                await writer.insert(ledger).values({
                  jobId: prepared.jobId,
                  sessionId: open.id,
                  at: clock(),
                  amountUsd: '0.000000',
                  estimateUsd: usd,
                  basis: 'provider_reported',
                  settlement: 'reconciled',
                  billableUnits: '0.000000',
                  unitPriceUsd: row.price.usd,
                  runningSessionTotal: addUsd(others, '0.000000'),
                })
              }
              await setJob(prepared.jobId, prepared.generationId, mapped, {
                refusalReason: mapped === 'refused' ? 'safety-checker' : null,
                finished: true,
              }, writer)
              await recordEvent(prepared.jobId, 'provider-submit', {
                httpStatus,
                errorType,
                ...(httpStatus >= 500 && httpStatus <= 599 ? { billing: SERVER_ERROR_BILLING } : {}),
              }, writer)
            })
          } catch {
            return { outcome: 'database-unavailable' as const, jobId: prepared.jobId }
          }
          return { outcome: mapped, jobId: prepared.jobId, httpStatus, errorType }
        }
        if (requestId && !parsedUrls) {
          try {
            await db.transaction(async (tx) => {
              const writer = tx as unknown as StudioDatabase
              await writer.update(job).set({ providerRequestId: requestId }).where(eq(job.id, prepared.jobId))
              await recordEvent(prepared.jobId, 'urls-unusable', { httpStatus, requestId }, writer)
            })
          } catch {
            return { outcome: 'database-unavailable' as const, jobId: prepared.jobId }
          }
          return { outcome: 'urls-unusable' as const, jobId: prepared.jobId, requestId }
        }
        if (!parsedUrls) {
          await recordEvent(prepared.jobId, 'submit-unconfirmed', { httpStatus })
          return { outcome: 'submit-unconfirmed' as const, jobId: prepared.jobId }
        }
        accepted = parsedUrls
      } catch (error) {
        if (error instanceof OutOfCreditError) {
          await db.insert(ledger).values({
            jobId: prepared.jobId,
            sessionId: open.id,
            at: clock(),
            amountUsd: '0.000000',
            estimateUsd: usd,
            basis: 'provider_reported',
            settlement: 'reconciled',
            billableUnits: '0.000000',
            unitPriceUsd: row.price.usd,
            runningSessionTotal: sessionExposure([
              ...views(await db.select().from(ledger).where(eq(ledger.sessionId, open.id))),
              {
                jobId: prepared.jobId,
                settlement: 'reconciled',
                estimateUsd: usd,
                amountUsd: '0.000000',
                at: clock(),
              },
            ]),
          })
          await recordEvent(prepared.jobId, 'out-of-credit', { message: error.message })
          return { outcome: 'out-of-credit' as const, jobId: prepared.jobId }
        }
        if (error instanceof Error && error.message === 'database unavailable') {
          return { outcome: 'database-unavailable' as const, jobId: prepared.jobId }
        }
        await recordEvent(prepared.jobId, 'submit-unconfirmed', {
          reason: error instanceof Error ? error.name : 'error',
        })
        return { outcome: 'submit-unconfirmed' as const, jobId: prepared.jobId }
      }

      await setJob(prepared.jobId, prepared.generationId, 'submitted', {
        requestId: accepted.request_id,
        statusUrl: accepted.status_url,
        responseUrl: accepted.response_url,
        cancelUrl: accepted.cancel_url,
        submitted: true,
      })
      return {
        outcome: 'submitted' as const,
        jobId: prepared.jobId,
        requestId: accepted.request_id,
        sentSha256: photographHash,
      }
    },

    async poll(jobId: string) {
      const [current] = await db.select().from(job).where(eq(job.id, jobId))
      if (!current) return { outcome: 'missing' as const }
      if (!current.providerRequestId) {
        const lines = await db.select().from(ledger).where(eq(ledger.jobId, jobId))
        if (isSubmitUnconfirmed(current, lines)) return { outcome: 'submit-unconfirmed' as const, jobId }
        return { outcome: 'not-resubmitted' as const, jobId }
      }
      if (current.status === 'cancelled') return { outcome: 'cancelled' as const, chargeRetained: true as const }
      const settled = new Set<JobState>(['failed', 'refused', 'downloaded', 'kept', 'published', 'withdrawn', 'discarded', 'budget-refused', 'timed-out'])
      if (current.status === 'completed') {
        const lines = await db.select().from(ledger).where(eq(ledger.jobId, jobId))
        if (lines.some((line) => line.settlement === 'reconciled')) {
          return { outcome: 'duplicate-delivery' as const, status: current.status }
        }
      } else if (settled.has(current.status as JobState)) {
        return { outcome: 'duplicate-delivery' as const, status: current.status }
      }
      if (!current.statusUrl || !current.responseUrl || !isQueueOrigin(current.statusUrl) || !isQueueOrigin(current.responseUrl)) {
        return { outcome: 'provider-urls-missing' as const, jobId }
      }

      const started = current.submittedAt ?? current.createdAt
      const pastCeiling = clock().getTime() - started.getTime() > timeoutCeilingMs && IN_FLIGHT.has(current.status as JobState)
      const status = statusResponseSchema.parse(await fal.status({
        requestId: current.providerRequestId,
        statusUrl: current.statusUrl,
        headers: await headers(false),
      }))
      if ('httpStatus' in status) {
        await setJob(current.id, current.generationId, 'failed', { finished: true })
        await recordEvent(jobId, 'provider-http', { httpStatus: status.httpStatus, timeoutType: status.timeoutType })
        return { outcome: 'failed' as const, jobId, httpStatus: status.httpStatus, timeoutType: status.timeoutType }
      }
      if (pastCeiling && status.status !== 'COMPLETED') {
        await setJob(current.id, current.generationId, 'timed-out', { finished: true })
        return { outcome: 'timed-out' as const, label: TIMEOUT_CEILING_LABEL, ceilingMs: timeoutCeilingMs }
      }
      if (status.status === 'IN_QUEUE') {
        await setJob(current.id, current.generationId, 'queued')
        return { outcome: 'queued' as const, jobId }
      }
      if (status.status === 'IN_PROGRESS') {
        await setJob(current.id, current.generationId, 'in-progress')
        return { outcome: 'in-progress' as const, jobId }
      }

      const envelope = resultEnvelopeSchema.parse(await fal.result({
        requestId: current.providerRequestId,
        responseUrl: current.responseUrl,
        headers: await headers(false),
      }))
      const mapped = resultState(envelope.httpStatus, envelope.body)
      const [gen] = await db.select().from(generation).where(eq(generation.id, current.generationId))
      const [pinned] = gen ? await db.select().from(model).where(eq(model.id, gen.modelId)) : []
      const unitPrice = typeof pinned?.priceRule === 'object' && pinned.priceRule && 'usd' in pinned.priceRule
        ? String((pinned.priceRule as { usd: string }).usd)
        : current.estimateUsd
      if (envelope.billableUnits !== null && current.sessionId) {
        const amount = reconcileAmount(envelope.billableUnits, unitPrice)
        const existing = await db.select().from(ledger).where(eq(ledger.jobId, jobId))
        if (!existing.some((line) => line.settlement === 'reconciled')) {
          const sessionLines = await db.select().from(ledger).where(eq(ledger.sessionId, current.sessionId))
          const others = sessionExposure(views(sessionLines).filter((line) => line.jobId !== jobId))
          await db.insert(ledger).values({
            jobId,
            sessionId: current.sessionId,
            at: clock(),
            amountUsd: amount,
            estimateUsd: current.estimateUsd,
            basis: 'reconciled',
            settlement: 'reconciled',
            billableUnits: envelope.billableUnits,
            unitPriceUsd: unitPrice,
            runningSessionTotal: addUsd(others, amount),
          })
        }
      }
      await setJob(current.id, current.generationId, mapped, {
        substate: mapped === 'completed' ? null : undefined,
        refusalReason: mapped === 'refused' ? 'safety-checker' : null,
        finished: true,
      })
      return { outcome: mapped, jobId, httpStatus: envelope.httpStatus }
    },

    async resume(jobId: string) {
      const [current] = await db.select().from(job).where(eq(job.id, jobId))
      if (!current) return { outcome: 'missing' as const }
      if (!current.providerRequestId) {
        const lines = await db.select().from(ledger).where(eq(ledger.jobId, jobId))
        if (isSubmitUnconfirmed(current, lines)) return { outcome: 'submit-unconfirmed' as const, jobId }
        return { outcome: 'not-resubmitted' as const, jobId }
      }
      return this.poll(jobId)
    },

    async attachRequest(input: { jobId: string; requestId: string }) {
      const [current] = await db.select().from(job).where(eq(job.id, input.jobId))
      if (!current) return { outcome: 'missing' as const }
      const lines = await db.select().from(ledger).where(eq(ledger.jobId, current.id))
      const urlsUnusable = current.status === 'draft' && current.providerRequestId !== null
      if (!isSubmitUnconfirmed(current, lines) && !urlsUnusable) {
        return { outcome: 'not-unconfirmed' as const, jobId: current.id }
      }
      if (current.providerRequestId && current.providerRequestId !== input.requestId) {
        return { outcome: 'request-id-mismatch' as const, jobId: current.id }
      }
      const [gen] = await db.select().from(generation).where(eq(generation.id, current.generationId))
      const [pinned] = gen ? await db.select().from(model).where(eq(model.id, gen.modelId)) : []
      if (!pinned) return { outcome: 'missing' as const }
      let urls: { statusUrl: string; responseUrl: string; cancelUrl: string }
      try {
        urls = queueAddresses(pinned.endpoint, input.requestId)
      } catch {
        return { outcome: 'url-refused' as const, jobId: current.id }
      }
      const before = lines.length
      try {
        await setJob(current.id, current.generationId, 'submitted', {
          requestId: input.requestId,
          statusUrl: urls.statusUrl,
          responseUrl: urls.responseUrl,
          cancelUrl: urls.cancelUrl,
          submitted: true,
        })
      } catch {
        return { outcome: 'database-unavailable' as const, jobId: current.id }
      }
      const after = await db.select().from(ledger).where(eq(ledger.jobId, current.id))
      if (after.length !== before) throw new Error('attach-request wrote a ledger line')
      return { outcome: 'attached' as const, jobId: current.id }
    },

    async settleUnconfirmed(input: { jobId: string; notAccepted: boolean; evidence: string; amountUsd?: string }) {
      if (!input.notAccepted || !hasVisibleAnswer(input.evidence)) {
        return { outcome: 'settle-refused' as const, jobId: input.jobId }
      }
      const entered = input.amountUsd === undefined ? undefined : formatUsd(parseUsd(input.amountUsd))
      try {
        return await db.transaction(async (tx) => {
          const writer = tx as unknown as StudioDatabase
          const [current] = await writer.select().from(job).where(eq(job.id, input.jobId))
          if (!current) return { outcome: 'missing' as const }
          const lines = await writer.select().from(ledger).where(eq(ledger.jobId, current.id))
          if (!isSubmitUnconfirmed(current, lines)) return { outcome: 'not-unconfirmed' as const, jobId: current.id }
          if (entered !== undefined) {
            if (!current.sessionId) return { outcome: 'settle-refused' as const, jobId: current.id }
            const sessionLines = await writer.select().from(ledger).where(eq(ledger.sessionId, current.sessionId))
            const others = sessionExposure(views(sessionLines).filter((line) => line.jobId !== current.id))
            await writer.insert(ledger).values({
              jobId: current.id,
              sessionId: current.sessionId,
              at: clock(),
              amountUsd: entered,
              estimateUsd: current.estimateUsd,
              basis: 'reconciled',
              settlement: 'reconciled',
              runningSessionTotal: addUsd(others, entered),
            })
          }
          await setJob(current.id, current.generationId, 'failed', { finished: true }, writer)
          await recordEvent(current.id, 'submit-not-accepted', {
            evidence: input.evidence,
            ...(entered ? { amountUsd: entered } : {}),
          }, writer)
          return { outcome: 'failed' as const, jobId: current.id, estimatePending: entered === undefined }
        })
      } catch {
        return { outcome: 'database-unavailable' as const, jobId: input.jobId }
      }
    },

    async closeSession() {
      const [open] = await db.select().from(session).where(isNull(session.closedAt)).limit(1)
      if (!open) return { outcome: 'no-open-session' as const }
      const jobs = await db.select().from(job).where(eq(job.sessionId, open.id))
      const jobIds: string[] = []
      for (const row of jobs) {
        const lines = await db.select().from(ledger).where(eq(ledger.jobId, row.id))
        const unsettledCompletion = row.status === 'completed' && !lines.some((line) => line.settlement === 'reconciled')
        const urlsUnusable = row.status === 'draft' && row.providerRequestId !== null
        if (CLOSE_BLOCKED.has(row.status as JobState) || isSubmitUnconfirmed(row, lines) || urlsUnusable || unsettledCompletion) {
          jobIds.push(row.id)
        }
      }
      if (jobIds.length > 0) return { outcome: 'close-refused' as const, jobIds }
      const totalUsd = await spend(open.id)
      await db.update(session).set({ closedAt: clock() }).where(eq(session.id, open.id))
      return { outcome: 'closed' as const, sessionId: open.id, totalUsd }
    },

    async cancel(jobId: string) {
      const [current] = await db.select().from(job).where(eq(job.id, jobId))
      if (!current) return { outcome: 'missing' as const }
      if (!CANCELLABLE.has(current.status as JobState)) {
        return {
          outcome: 'cancel-refused' as const,
          jobId,
          status: current.status,
          ...(current.status === 'published' ? { hint: 'use unpublish' as const } : {}),
        }
      }
      if (!current.providerRequestId || !current.cancelUrl || !isQueueOrigin(current.cancelUrl)) {
        return { outcome: 'cancel-refused' as const, jobId, status: current.status }
      }
      const parsed = cancelResponseSchema.safeParse(await fal.cancel({
        requestId: current.providerRequestId,
        cancelUrl: current.cancelUrl,
        headers: await headers(false),
      }))
      if (!parsed.success) return { outcome: 'cancel-unconfirmed' as const, jobId }
      const reported = parsed.data.body && typeof parsed.data.body === 'object'
        ? (parsed.data.body as { status?: unknown }).status
        : undefined
      if (parsed.data.httpStatus === 202 && reported === 'CANCELLATION_REQUESTED') {
        try {
          await setJob(current.id, current.generationId, 'cancelled', { finished: true })
        } catch {
          return { outcome: 'database-unavailable' as const, jobId }
        }
        const lines = await db.select().from(ledger).where(eq(ledger.jobId, jobId))
        return { outcome: 'cancelled' as const, chargeRetained: lines.length > 0, exposure: jobExposure(views(lines)) }
      }
      if (parsed.data.httpStatus === 400 && reported === 'ALREADY_COMPLETED') {
        return { outcome: 'cancel-already-completed' as const, jobId }
      }
      if (parsed.data.httpStatus === 404 && reported === 'NOT_FOUND') {
        return { outcome: 'cancel-not-found' as const, jobId }
      }
      return { outcome: 'cancel-unconfirmed' as const, jobId }
    },

    async download(jobId: string) {
      const [current] = await db.select().from(job).where(eq(job.id, jobId))
      if (!current) return { outcome: 'missing' as const }
      if (current.completedSubstate === 'result-expired') {
        return { outcome: 'result-expired' as const, chargeStands: true as const }
      }
      if (current.status !== 'completed') return { outcome: 'not-ready' as const, status: current.status }
      const before = await db.select().from(ledger).where(eq(ledger.jobId, jobId))
      try {
        if (!current.providerRequestId) throw new Error('no request')
        const bytes = await fal.download({ requestId: current.providerRequestId, headers: await headers(false) })
        const digest = sha256(bytes)
        mkdirSync(options.mediaDir, { recursive: true })
        const localPath = path.join(options.mediaDir, `${digest}.mp4`)
        writeFileSync(localPath, bytes)
        const [stored] = await db.insert(asset).values({
          role: 'video',
          sha256: digest,
          mime: 'video/mp4',
          bytes: bytes.byteLength,
          localPath,
          sourceGenerationId: current.generationId,
        }).returning()
        if (!stored) throw new Error('asset insert returned nothing')
        await db.update(generation).set({ outputAssetId: stored.id }).where(eq(generation.id, current.generationId))
        await setJob(current.id, current.generationId, 'downloaded', { substate: null })
        return { outcome: 'downloaded' as const, assetId: stored.id, sha256: digest }
      } catch (error) {
        const after = await db.select().from(ledger).where(eq(ledger.jobId, jobId))
        if (after.length !== before.length) throw new Error('download changed the ledger')
        if (error instanceof ResultExpiredError) {
          await db.update(job).set({ completedSubstate: 'result-expired' }).where(eq(job.id, jobId))
          await recordEvent(jobId, 'result-expired')
          return { outcome: 'result-expired' as const, chargeStands: true as const }
        }
        await db.update(job).set({ completedSubstate: 'download-failed' }).where(eq(job.id, jobId))
        await recordEvent(jobId, 'download-failed')
        return { outcome: 'download-failed' as const, retryWithoutCharge: true as const }
      }
    },

    async keep(jobId: string, answers: { line: ChecklistLine; answer: ChecklistAnswer; by: string }[]) {
      const [current] = await db.select().from(job).where(eq(job.id, jobId))
      if (!current || current.status !== 'downloaded') return { outcome: 'not-ready' as const }
      const byLine = new Map(answers.map((answer) => [answer.line, answer]))
      if (CHECKLIST_LINES.some((line) => !byLine.has(line))) return { outcome: 'keep-unavailable' as const }
      const [check] = await db.insert(policyCheck).values({
        generationId: current.generationId,
        policyVersion: 'v1',
        fictionalOnly: true,
        noRealMarks: true,
        attestedAt: clock(),
        attestedBy: answers[0]?.by ?? 'operator',
      }).returning()
      if (!check) throw new Error('policy check insert returned nothing')
      await db.insert(policyAnswer).values(CHECKLIST_LINES.map((line) => {
        const answer = byLine.get(line)!
        return {
          policyCheckId: check.id,
          line,
          answer: answer.answer,
          answeredBy: answer.by,
          answeredAt: clock(),
        }
      }))
      if (CHECKLIST_LINES.some((line) => byLine.get(line)?.answer !== 'clear')) {
        return { outcome: 'keep-unavailable' as const, jobId }
      }
      await setJob(current.id, current.generationId, 'kept')
      return { outcome: 'kept' as const, jobId }
    },

    async discard(jobId: string) {
      const [current] = await db.select().from(job).where(eq(job.id, jobId))
      if (!current || (current.status !== 'downloaded' && current.status !== 'kept')) {
        return { outcome: 'not-ready' as const }
      }
      await setJob(current.id, current.generationId, 'discarded')
      return { outcome: 'discarded' as const, jobId }
    },

    async recordGate(input: { answer: string; disclosure: string; recordedBy: string; source: string }) {
      if (!hasVisibleAnswer(input.answer)) return { outcome: 'gate-empty' as const }
      const answer = input.answer.trim()
      const [existing] = await db.select().from(article50Answer).limit(1)
      if (existing) {
        return { outcome: 'gate-already-recorded' as const, recordedOn: existing.recordedOn.toISOString() }
      }
      const recordedOn = clock()
      await db.insert(article50Answer).values({
        answer,
        disclosure: input.disclosure,
        recordedOn,
        recordedBy: input.recordedBy,
        source: input.source,
      })
      return { outcome: 'gate-recorded' as const, recordedOn: recordedOn.toISOString() }
    },

    async importClip(input: {
      video: Uint8Array
      keyframe: Uint8Array
      source: string
      prompt: string
      subjects: readonly string[]
      title: string
      note?: string
      madeOn?: string
    }) {
      if (input.source !== 'grok-imagine') return { outcome: 'source-refused' as const }
      const prompt = input.prompt.replace(/\r?\n$/, '')
      if (prompt.trim().length === 0) return { outcome: 'prompt-empty' as const }
      if (input.title.trim().length === 0) return { outcome: 'title-empty' as const }
      const names = [...new Set(input.subjects.map((name) => name.trim()).filter((name) => name.length > 0))]
      if (names.length === 0 || names.some((name) => !APPROVED_SUBJECTS.has(name))) {
        return { outcome: 'subject-refused' as const }
      }
      const read = readClipFacts(input.video)
      if (!read.ok) return { outcome: 'clip-refused' as const, reason: read.reason }
      let still: { bytes: Uint8Array; sha256: string }
      try {
        still = preparePhotograph(input.keyframe)
      } catch (error) {
        if (error instanceof Error && (error.message === 'not a jpeg' || error.message === 'bad jpeg')) {
          return { outcome: 'not-a-jpeg' as const }
        }
        throw error
      }
      const facts = read.facts
      let finishedAt: Date
      if (input.madeOn) {
        const parsed = brooklynStart(input.madeOn)
        if (!parsed) return { outcome: 'made-on-invalid' as const }
        finishedAt = parsed
      } else if (facts.createdAt) {
        finishedAt = facts.createdAt
      } else {
        return { outcome: 'needs-made-on' as const }
      }
      const digest = sha256(input.video)
      const duplicate = await db.select().from(asset).where(and(eq(asset.role, 'video'), eq(asset.sha256, digest)))
      if (duplicate.length > 0) return { outcome: 'already-imported' as const, sha256: digest }

      const importedOn = brooklynDate(clock())
      const durationS = facts.durationS.toFixed(3)
      const frameRate = facts.frameRate !== null && Number.isFinite(facts.frameRate) && facts.frameRate > 0
        ? Math.round(facts.frameRate * 1000) / 1000
        : null
      const params = {
        source: 'grok-imagine',
        container: facts.container,
        videoCodec: facts.videoCodec,
        frameRate,
        audio: facts.audio,
        pinned_on: importedOn,
      }
      const key = makeCacheKey({
        registryId: GROK_IMAGINE.id,
        params,
        inputHashes: [digest, still.sha256],
        seed: null,
      })
      mkdirSync(options.mediaDir, { recursive: true })
      const videoPath = path.join(options.mediaDir, `${digest}.mp4`)
      const stillPath = path.join(options.mediaDir, `${still.sha256}.jpg`)
      writeFileSync(videoPath, input.video)
      writeFileSync(stillPath, still.bytes)
      const note = input.note?.trim() ? input.note : null

      try {
        const created = await db.transaction(async (tx) => {
          const writer = tx as unknown as StudioDatabase
          const again = await writer.select().from(asset).where(and(eq(asset.role, 'video'), eq(asset.sha256, digest)))
          if (again.length > 0) return null
          const [existingModel] = await writer.select().from(model).where(eq(model.registryId, GROK_IMAGINE.id))
          const pinned = existingModel ?? (await writer.insert(model).values({
            registryId: GROK_IMAGINE.id,
            endpoint: GROK_IMAGINE.endpoint,
            task: GROK_IMAGINE.task,
            allowedParams: [],
            priceRule: { kind: 'handmade' },
            priceCheckedOn: importedOn,
            priceValidUntil: null,
            pinnedOn: importedOn,
          }).returning())[0]
          if (!pinned) throw new Error('model insert returned nothing')
          const [gen] = await writer.insert(generation).values({
            kind: 'video',
            modelId: pinned.id,
            prompt,
            promptSha256: sha256(prompt),
            promptExpansion: null,
            params,
            seed: null,
            cacheKey: key,
            status: 'downloaded',
          }).returning()
          if (!gen) throw new Error('generation insert returned nothing')
          const [videoAsset] = await writer.insert(asset).values({
            role: 'video',
            sha256: digest,
            mime: 'video/mp4',
            bytes: input.video.byteLength,
            width: facts.width,
            height: facts.height,
            durationS,
            localPath: videoPath,
            sourceGenerationId: gen.id,
          }).returning()
          const [k0] = await writer.insert(asset).values({
            role: 'keyframe',
            sha256: still.sha256,
            mime: 'image/jpeg',
            bytes: still.bytes.byteLength,
            localPath: stillPath,
          }).returning()
          if (!videoAsset || !k0) throw new Error('asset insert returned nothing')
          await writer.update(generation).set({ outputAssetId: videoAsset.id }).where(eq(generation.id, gen.id))
          await writer.insert(generationInput).values({ generationId: gen.id, assetId: k0.id, role: 'first' })
          for (const name of names) {
            const [existingSubject] = await writer.select().from(subject).where(eq(subject.name, name))
            const row = existingSubject ?? (await writer.insert(subject).values({ name }).returning())[0]
            if (!row) throw new Error('subject insert returned nothing')
            await writer.insert(generationSubject).values({ generationId: gen.id, subjectId: row.id })
          }
          const [createdJob] = await writer.insert(job).values({
            generationId: gen.id,
            sessionId: null,
            attempt: 1,
            providerRequestId: null,
            idempotencyKey: `import:${digest}`,
            estimateUsd: '0.000000',
            status: 'downloaded',
            finishedAt,
          }).returning()
          if (!createdJob) throw new Error('job insert returned nothing')
          await writer.insert(event).values({
            jobId: createdJob.id,
            at: clock(),
            type: 'imported',
            detail: { title: input.title, note, source: 'grok-imagine' },
          })
          return createdJob
        })
        if (!created) return { outcome: 'already-imported' as const, sha256: digest }
        return {
          outcome: 'imported' as const,
          jobId: created.id,
          sha256: digest,
          width: facts.width,
          height: facts.height,
          durationS,
          container: facts.container,
          videoCodec: facts.videoCodec,
          audio: facts.audio,
          frameRate,
        }
      } catch (error) {
        const message = error instanceof Error
          ? `${error.message} ${error.cause instanceof Error ? error.cause.message : ''}`
          : String(error)
        if (message.includes('job_idempotency_key')) {
          return { outcome: 'already-imported' as const, sha256: digest }
        }
        throw error
      }
    },

    async publish(input: { jobId: string; publicId: string; title: string; position: number; editorialNote?: string }) {
      const [current] = await db.select().from(job).where(eq(job.id, input.jobId))
      if (!current) return { outcome: 'missing' as const }
      if (current.status === 'withdrawn') return { outcome: 'not-relisted' as const }
      const [existingVideo] = await db.select().from(videos).where(eq(videos.jobId, input.jobId)).limit(1)
      if (current.status === 'published') {
        if (existingVideo?.fallbackStatus === 'failed') {
          const [thumb] = await db.select().from(asset).where(eq(asset.id, existingVideo.thumbnailAssetId))
          if (!thumb) return { outcome: 'not-ready' as const }
          return finishFallback(existingVideo.id, existingVideo.publicId, thumb.sha256, true)
        }
        return { outcome: 'already-published' as const }
      }
      if (current.status !== 'kept') return { outcome: 'not-kept' as const }
      const [gate] = await db.select().from(article50Answer).limit(1)
      if (!gate) return { outcome: 'gate-closed' as const, live: false as const }

      const [gen] = await db.select().from(generation).where(eq(generation.id, current.generationId))
      if (!gen?.outputAssetId) return { outcome: 'not-ready' as const }
      const [videoAsset] = await db.select().from(asset).where(eq(asset.id, gen.outputAssetId))
      const [k0Link] = await db.select().from(generationInput).where(and(
        eq(generationInput.generationId, gen.id),
        eq(generationInput.role, 'first'),
      ))
      if (!videoAsset?.localPath || !k0Link) return { outcome: 'not-ready' as const }
      const [k0] = await db.select().from(asset).where(eq(asset.id, k0Link.assetId))
      if (!k0?.localPath) return { outcome: 'not-ready' as const }
      const [pinned] = await db.select().from(model).where(eq(model.id, gen.modelId))
      if (!pinned) return { outcome: 'not-ready' as const }

      const missing = cardGaps({
        publicId: input.publicId,
        width: videoAsset.width,
        height: videoAsset.height,
        duration: videoAsset.durationS,
        approvedSubjects: await approvedSubjectCount(gen.id),
        finishedAt: current.finishedAt,
      })
      if (missing.length > 0) {
        return { outcome: 'card-refused' as const, missing, live: false as const }
      }

      let [thumbnail] = await db.select().from(asset).where(and(
        eq(asset.sourceGenerationId, gen.id),
        eq(asset.role, 'thumbnail'),
      ))
      if (!thumbnail) {
        const [created] = await db.insert(asset).values({
          role: 'thumbnail',
          sha256: k0.sha256,
          mime: k0.mime,
          bytes: k0.bytes,
          width: k0.width,
          height: k0.height,
          localPath: k0.localPath,
          sourceGenerationId: gen.id,
        }).returning()
        thumbnail = created
      }
      if (!thumbnail) return { outcome: 'not-ready' as const }

      const saved = async (rowId: string, object: StoredObject) => {
        await db.update(asset).set({ bucket: object.bucket, objectPath: object.objectPath }).where(eq(asset.id, rowId))
      }
      try {
        if (!videoAsset.bucket || !videoAsset.objectPath) {
          const object = await storage.putVideo({
            localPath: videoAsset.localPath,
            sha256: videoAsset.sha256,
            publicId: input.publicId,
            mime: videoAsset.mime,
          })
          await saved(videoAsset.id, object)
          videoAsset.bucket = object.bucket
          videoAsset.objectPath = object.objectPath
        }
      } catch (error) {
        const fields = storeFailure(error)
        await recordEvent(current.id, 'upload-failed', { object: 'video', ...fields })
        return { outcome: 'upload-failed' as const, live: false as const, listedAgain: true as const, object: 'video' as const, ...fields }
      }
      try {
        if (!thumbnail.bucket || !thumbnail.objectPath) {
          const object = await storage.putThumbnail({
            localPath: thumbnail.localPath ?? k0.localPath,
            sha256: thumbnail.sha256,
            publicId: input.publicId,
            mime: thumbnail.mime,
          })
          await saved(thumbnail.id, object)
          thumbnail.bucket = object.bucket
          thumbnail.objectPath = object.objectPath
        }
      } catch (error) {
        const fields = storeFailure(error)
        await recordEvent(current.id, 'upload-failed', { object: 'thumbnail', ...fields })
        return { outcome: 'upload-failed' as const, live: false as const, listedAgain: true as const, object: 'thumbnail' as const, ...fields }
      }

      if (flags.breakRecordWrite) {
        return { outcome: 'record-failed' as const, live: false as const, listedAgain: true as const }
      }

      const [policy] = await db.select().from(policyCheck).where(eq(policyCheck.generationId, gen.id)).orderBy(desc(policyCheck.createdAt)).limit(1)
      const attestedAt = policy?.attestedAt?.toISOString() ?? 'unattested'
      const imported = (await db.select().from(event).where(eq(event.jobId, current.id))).find((item) => item.type === 'imported')
      const editorialNote = input.editorialNote ?? importedNote(imported?.detail)
      try {
        await db.transaction(async (tx) => {
          await tx.insert(videos).values({
            publicId: input.publicId,
            title: input.title,
            editorialNote,
            position: input.position,
            publishedAt: clock(),
            jobId: current.id,
            generationId: gen.id,
            videoAssetId: videoAsset.id,
            thumbnailAssetId: thumbnail.id,
            endpoint: pinned.endpoint,
            pinnedOn: pinnedOnOf(gen.params, pinned.pinnedOn),
            prompt: gen.prompt,
            promptExpansion: gen.promptExpansion,
            seed: gen.seed,
            generatedAt: current.finishedAt ?? current.createdAt,
            attestationSummary: `policy v1 · fictionalOnly true · checklist walked by ${policy?.attestedBy ?? 'operator'} · ${attestedAt} · 5 of 5 clear · answers recorded per line`,
            fallbackStatus: 'pending',
          })
          await tx.update(job).set({ status: 'published' }).where(eq(job.id, current.id))
          await tx.update(generation).set({ status: 'published' }).where(eq(generation.id, gen.id))
        })
      } catch (error) {
        return recordFailure(error)
      }
      await recordEvent(current.id, 'published')

      const [liveRow] = await db.select().from(videos).where(eq(videos.jobId, current.id))
      if (!liveRow) return { outcome: 'record-failed' as const, live: false as const, listedAgain: true as const, reason: 'unspecified' as const }
      return finishFallback(liveRow.id, input.publicId, thumbnail.sha256, false)
    },

    async unpublish(jobId: string, options?: { deleteFiles?: boolean }) {
      const [current] = await db.select().from(job).where(eq(job.id, jobId))
      const [row] = await db.select().from(videos).where(eq(videos.jobId, jobId))
      if (!current || !row || current.status !== 'published') {
        if (current?.status === 'withdrawn') return { outcome: 'already-withdrawn' as const, jobId }
        return { outcome: 'not-published' as const }
      }
      try {
        await db.transaction(async (tx) => {
          await tx.update(videos).set({ publishedAt: null, unpublishedAt: clock() }).where(eq(videos.id, row.id))
          await tx.update(job).set({ status: 'withdrawn' }).where(eq(job.id, jobId))
          await tx.update(generation).set({ status: 'withdrawn' }).where(eq(generation.id, current.generationId))
          await tx.insert(event).values({ jobId, at: clock(), type: 'unpublished' })
        })
      } catch {
        return { outcome: 'withdraw-failed' as const, live: true as const, filesTouched: false as const }
      }

      const deleted = options?.deleteFiles
        ? await deleteRemaining(row.id)
        : { videoRemoved: false, thumbnailRemoved: false, status: undefined, code: undefined }
      const removal = await runRemoval(row.id, row.publicId)
      return {
        outcome: 'withdrawn' as const,
        listed: false as const,
        deleteRequested: Boolean(options?.deleteFiles),
        videoRemoved: deleted.videoRemoved,
        thumbnailRemoved: deleted.thumbnailRemoved,
        filesReadable: Boolean(options?.deleteFiles) && (!deleted.videoRemoved || !deleted.thumbnailRemoved),
        removal: removal.outcome,
        status: deleted.status,
        code: deleted.code,
      }
    },

    async retryDelete(jobId: string) {
      const [current] = await db.select().from(job).where(eq(job.id, jobId))
      const [row] = await db.select().from(videos).where(eq(videos.jobId, jobId))
      if (!current || !row || current.status !== 'withdrawn') return { outcome: 'not-withdrawn' as const }
      const deleted = await deleteRemaining(row.id)
      return {
        outcome: 'delete-retried' as const,
        listed: false as const,
        videoRemoved: deleted.videoRemoved,
        thumbnailRemoved: deleted.thumbnailRemoved,
        filesReadable: !deleted.videoRemoved || !deleted.thumbnailRemoved,
        idempotent: deleted.attempted === 0,
        status: deleted.status,
        code: deleted.code,
      }
    },

    async retryRemoval(jobId: string) {
      const [current] = await db.select().from(job).where(eq(job.id, jobId))
      const [row] = await db.select().from(videos).where(eq(videos.jobId, jobId))
      if (!current || !row || current.status !== 'withdrawn') return { outcome: 'not-withdrawn' as const }
      if (row.removalStatus === 'merged') return { outcome: 'merged' as const, idempotent: true as const, listed: false as const }
      if (row.removalStatus === 'pending') return { outcome: 'pending' as const, idempotent: true as const, listed: false as const }
      const removal = await runRemoval(row.id, row.publicId)
      return { outcome: removal.outcome, listed: false as const, idempotent: false as const }
    },

    async list() {
      const rows = await db.select().from(job).orderBy(desc(job.createdAt))
      const output = []
      for (const row of rows) {
        const lines = await db.select().from(ledger).where(eq(ledger.jobId, row.id))
        const reconciled = lines.some((line) => line.settlement === 'reconciled')
        output.push({
          id: row.id,
          status: row.status,
          substate: row.completedSubstate,
          estimateUsd: row.estimateUsd,
          billed: reconciled ? 'reconciled' as const : lines.length > 0 ? 'pending' as const : 'none' as const,
          publishable: row.status === 'kept',
        })
      }
      return output
    },
  }
}

export type Studio = ReturnType<typeof createStudio>
