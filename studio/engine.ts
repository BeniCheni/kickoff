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
  ledger,
  model,
  policyAnswer,
  policyCheck,
  session,
  videos,
  studioTables,
} from './db/schema.ts'
import { decideBudget, PER_JOB_CAP_USD, PREPAID_CEILING_USD, SESSION_CAP_USD, TIMEOUT_CEILING_LABEL, TIMEOUT_CEILING_MS } from './caps.ts'
import { falHeaders } from './fal/headers.ts'
import { resultState, resultEnvelopeSchema, statusResponseSchema, submitResponseSchema } from './fal/schemas.ts'
import { OutOfCreditError, ResultExpiredError, type FalTransport } from './fal/stub.ts'
import { cacheKey as makeCacheKey, sha256 } from './hash.ts'
import { aboveManualCeiling, jobExposure, reconcileAmount, sessionExposure, type LedgerView } from './ledger.ts'
import { addUsd } from './money.ts'
import { preparePhotograph } from './photos/strip.ts'
import { estimateUsd, selectRegistry, unknownParam, type RegistryRow } from './registry.ts'
import type { StoragePort, StoredObject } from './storage/port.ts'
import type { PgliteDatabase } from 'drizzle-orm/pglite'

export type StudioDatabase = PgliteDatabase<typeof studioTables>

const IN_FLIGHT = new Set<JobState>(['submitted', 'queued', 'in-progress', 'completed'])
const STORED = new Set<JobState>(['downloaded', 'kept', 'published', 'withdrawn'])

export type StudioFlags = {
  breakLedgerWrite: boolean
  breakAfterAccept: boolean
  breakRecordWrite: boolean
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
  const requestTimeoutSeconds = options.requestTimeoutSeconds ?? 120
  const flags = options.flags ?? { breakLedgerWrite: false, breakAfterAccept: false, breakRecordWrite: false }
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

  async function recordEvent(jobId: string, type: string, detail?: unknown) {
    await db.insert(event).values({ jobId, at: clock(), type, detail: detail ?? null })
  }

  async function setJob(jobId: string, generationId: string, status: JobState, extra: {
    substate?: 'download-failed' | 'result-expired' | null
    refusalReason?: string | null
    requestId?: string
    finished?: boolean
    submitted?: boolean
  } = {}) {
    await db.update(job).set({
      status,
      ...(extra.substate !== undefined ? { completedSubstate: extra.substate } : {}),
      ...(extra.refusalReason !== undefined ? { refusalReason: extra.refusalReason } : {}),
      ...(extra.requestId !== undefined ? { providerRequestId: extra.requestId } : {}),
      ...(extra.finished ? { finishedAt: clock() } : {}),
      ...(extra.submitted ? { submittedAt: clock() } : {}),
    }).where(eq(job.id, jobId))
    await db.update(generation).set({
      status,
      ...(extra.refusalReason !== undefined ? { refusalReason: extra.refusalReason } : {}),
      ...(status === 'kept' || status === 'discarded' ? { reviewed: status } : {}),
    }).where(eq(generation.id, generationId))
    await recordEvent(jobId, status)
  }

  async function headers(carriesPhotograph: boolean) {
    return falHeaders({ requestTimeoutSeconds, carriesPhotograph })
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
      const unknown = unknownParam(row, input.params)
      if (unknown) return { outcome: 'param-not-allowed' as const, param: unknown }
      const usd = estimateUsd(row, input.params)
      if (!usd) return { outcome: 'not-in-registry' as const }

      let photographHash: string | undefined
      const body: Record<string, unknown> = { ...input.params }
      const hashes = [...(input.inputHashes ?? [])]
      if (input.photograph) {
        const prepared = preparePhotograph(input.photograph)
        photographHash = prepared.sha256
        hashes.push(prepared.sha256)
        body.image_urls = [Buffer.from(prepared.bytes).toString('base64')]
      }
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
      if (latest?.status === 'refused') return { outcome: 'refused' as const, jobId: latest.id, retried: false as const }
      if (latest && IN_FLIGHT.has(latest.status as JobState)) {
        return { outcome: 'in-flight' as const, jobId: latest.id, status: latest.status }
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
      let accepted: { request_id: string }
      try {
        const raw = await fal.submit({
          endpoint: row.endpoint,
          body,
          headers: await headers(carriesPhotograph),
        })
        accepted = submitResponseSchema.parse(raw)
        if (flags.breakAfterAccept) throw new Error('database unavailable')
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
        throw error
      }

      await setJob(prepared.jobId, prepared.generationId, 'submitted', {
        requestId: accepted.request_id,
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
      if (!current.providerRequestId) return { outcome: 'not-resubmitted' as const, jobId }
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

      const started = current.submittedAt ?? current.createdAt
      if (clock().getTime() - started.getTime() > timeoutCeilingMs && IN_FLIGHT.has(current.status as JobState)) {
        await setJob(current.id, current.generationId, 'timed-out', { finished: true })
        return { outcome: 'timed-out' as const, label: TIMEOUT_CEILING_LABEL, ceilingMs: timeoutCeilingMs }
      }

      const status = statusResponseSchema.parse(await fal.status({
        requestId: current.providerRequestId,
        headers: await headers(false),
      }))
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
      if (!current?.providerRequestId) return { outcome: 'not-resubmitted' as const, jobId }
      return this.poll(jobId)
    },

    async cancel(jobId: string) {
      const [current] = await db.select().from(job).where(eq(job.id, jobId))
      if (!current) return { outcome: 'missing' as const }
      if (current.providerRequestId) {
        await fal.cancel({ requestId: current.providerRequestId, headers: await headers(false) })
      }
      await setJob(current.id, current.generationId, 'cancelled', { finished: true })
      const lines = await db.select().from(ledger).where(eq(ledger.jobId, jobId))
      return { outcome: 'cancelled' as const, chargeRetained: lines.length > 0, exposure: jobExposure(views(lines)) }
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
      await db.insert(article50Answer).values({
        answer: input.answer,
        disclosure: input.disclosure,
        recordedOn: clock(),
        recordedBy: input.recordedBy,
        source: input.source,
      })
    },

    async publish(input: { jobId: string; publicId: string; title: string; position: number; editorialNote?: string }) {
      const [current] = await db.select().from(job).where(eq(job.id, input.jobId))
      if (!current) return { outcome: 'missing' as const }
      if (current.status === 'withdrawn') return { outcome: 'not-relisted' as const }
      const [existingVideo] = await db.select().from(videos).where(eq(videos.jobId, input.jobId)).limit(1)
      if (current.status === 'published') {
        if (existingVideo?.fallbackStatus === 'missing') {
          try {
            await storage.deliverFallback({ publicId: existingVideo.publicId, sourceSha256: 'retry' })
            await db.update(videos).set({ fallbackStatus: 'delivered' }).where(eq(videos.id, existingVideo.id))
            return { outcome: 'published' as const, live: true as const, fallbackRetried: true as const }
          } catch {
            return { outcome: 'fallback-missing' as const, live: true as const, retryable: true as const }
          }
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
          })
          await saved(videoAsset.id, object)
          videoAsset.bucket = object.bucket
          videoAsset.objectPath = object.objectPath
        }
      } catch {
        return { outcome: 'upload-failed' as const, live: false as const, listedAgain: true as const }
      }
      try {
        if (!thumbnail.bucket || !thumbnail.objectPath) {
          const object = await storage.putThumbnail({
            localPath: thumbnail.localPath ?? k0.localPath,
            sha256: thumbnail.sha256,
            publicId: input.publicId,
          })
          await saved(thumbnail.id, object)
          thumbnail.bucket = object.bucket
          thumbnail.objectPath = object.objectPath
        }
      } catch {
        return { outcome: 'upload-failed' as const, live: false as const, listedAgain: true as const }
      }

      if (flags.breakRecordWrite) {
        return { outcome: 'record-failed' as const, live: false as const, listedAgain: true as const }
      }

      const [policy] = await db.select().from(policyCheck).where(eq(policyCheck.generationId, gen.id)).orderBy(desc(policyCheck.createdAt)).limit(1)
      const attestedAt = policy?.attestedAt?.toISOString() ?? 'unattested'
      try {
        await db.transaction(async (tx) => {
          await tx.insert(videos).values({
            publicId: input.publicId,
            title: input.title,
            editorialNote: input.editorialNote ?? null,
            position: input.position,
            publishedAt: clock(),
            jobId: current.id,
            generationId: gen.id,
            videoAssetId: videoAsset.id,
            thumbnailAssetId: thumbnail.id,
            endpoint: pinned.endpoint,
            pinnedOn: pinned.pinnedOn,
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
        const message = error instanceof Error ? `${error.message} ${error.cause instanceof Error ? error.cause.message : ''}` : ''
        if (message.includes('Article 50')) return { outcome: 'gate-closed' as const, live: false as const }
        return { outcome: 'record-failed' as const, live: false as const, listedAgain: true as const }
      }
      await recordEvent(current.id, 'published')

      const [liveRow] = await db.select().from(videos).where(eq(videos.jobId, current.id))
      try {
        await storage.deliverFallback({ publicId: input.publicId, sourceSha256: thumbnail.sha256 })
        if (liveRow) await db.update(videos).set({ fallbackStatus: 'delivered' }).where(eq(videos.id, liveRow.id))
        return { outcome: 'published' as const, live: true as const }
      } catch {
        if (liveRow) await db.update(videos).set({ fallbackStatus: 'missing' }).where(eq(videos.id, liveRow.id))
        return { outcome: 'fallback-missing' as const, live: true as const, retryable: true as const }
      }
    },

    async unpublish(jobId: string) {
      const [current] = await db.select().from(job).where(eq(job.id, jobId))
      const [row] = await db.select().from(videos).where(eq(videos.jobId, jobId))
      if (!current || !row || current.status !== 'published') return { outcome: 'not-published' as const }
      const [videoAsset] = await db.select().from(asset).where(eq(asset.id, row.videoAssetId))
      const [thumbnail] = await db.select().from(asset).where(eq(asset.id, row.thumbnailAssetId))
      try {
        if (videoAsset?.bucket && videoAsset.objectPath) {
          await storage.remove({ bucket: videoAsset.bucket, objectPath: videoAsset.objectPath })
        }
        if (thumbnail?.bucket && thumbnail.objectPath) {
          await storage.remove({ bucket: thumbnail.bucket, objectPath: thumbnail.objectPath })
        }
      } catch {
        return { outcome: 'remove-failed' as const, live: true as const }
      }
      await db.transaction(async (tx) => {
        await tx.update(videos).set({ publishedAt: null, unpublishedAt: clock() }).where(eq(videos.id, row.id))
        await tx.update(job).set({ status: 'withdrawn' }).where(eq(job.id, jobId))
        await tx.update(generation).set({ status: 'withdrawn' }).where(eq(generation.id, current.generationId))
        await tx.insert(event).values({ jobId, at: clock(), type: 'unpublished' })
      })
      return { outcome: 'withdrawn' as const }
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
