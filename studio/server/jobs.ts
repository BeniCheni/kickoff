import { desc, eq, inArray } from 'drizzle-orm'
import { generation, generationSubject, job, ledger, model, subject } from '../db/schema.ts'
import type { Studio, StudioDatabase } from '../engine.ts'
import {
  ADMIN_JOB_STATES,
  type AdminJobState,
  type JobBilled,
  type JobView,
} from '../shared/jobs.ts'
import { probeDatabase } from './probe.ts'
import type { OpenedAdmin } from './open.ts'

const IN_FLIGHT = new Set<AdminJobState>(['submitted', 'queued', 'in-progress'])

function isState(value: string): value is AdminJobState {
  return (ADMIN_JOB_STATES as readonly string[]).includes(value)
}

function stepOf(kind: string, params: unknown): string {
  const record = params && typeof params === 'object' ? params as Record<string, unknown> : {}
  const duration = typeof record.duration === 'number' ? record.duration : null
  const resolution = typeof record.resolution === 'string' ? record.resolution : null
  if (duration !== null && resolution) return `Clip · ${duration} s · ${resolution}`
  if (kind === 'edit' || kind === 'image') return 'Keyframe'
  return kind
}

function billedOf(status: AdminJobState, lines: readonly { settlement: string; amountUsd: string | null; at: Date }[]): JobBilled {
  if (status === 'timed-out' || status === 'cancelled') return { kind: 'unknown' }
  const reconciled = lines
    .filter((line) => line.settlement === 'reconciled' && line.amountUsd)
    .sort((left, right) => left.at.getTime() - right.at.getTime())
  const latest = reconciled.at(-1)
  if (latest?.amountUsd) return { kind: 'reconciled', amountUsd: latest.amountUsd }
  if (lines.some((line) => line.settlement === 'pending')) return { kind: 'pending' }
  return { kind: 'none' }
}

export async function readJobs(db: StudioDatabase, studio: Studio, now: Date): Promise<JobView[]> {
  const rows = await db.select().from(job).orderBy(desc(job.createdAt))
  const generationIds = [...new Set(rows.map((row) => row.generationId))]
  const generations = generationIds.length === 0
    ? []
    : await db.select().from(generation).where(inArray(generation.id, generationIds))
  const generationById = new Map(generations.map((row) => [row.id, row]))
  const modelIds = [...new Set(generations.map((row) => row.modelId))]
  const models = modelIds.length === 0 ? [] : await db.select().from(model).where(inArray(model.id, modelIds))
  const modelById = new Map(models.map((row) => [row.id, row]))
  const jobIds = rows.map((row) => row.id)
  const lines = jobIds.length === 0 ? [] : await db.select().from(ledger).where(inArray(ledger.jobId, jobIds))
  const linesByJob = new Map<string, typeof lines>()
  for (const line of lines) {
    const list = linesByJob.get(line.jobId) ?? []
    list.push(line)
    linesByJob.set(line.jobId, list)
  }
  const links = generationIds.length === 0
    ? []
    : await db.select().from(generationSubject).where(inArray(generationSubject.generationId, generationIds))
  const subjectIds = [...new Set(links.map((link) => link.subjectId))]
  const subjects = subjectIds.length === 0 ? [] : await db.select().from(subject).where(inArray(subject.id, subjectIds))
  const subjectById = new Map(subjects.map((row) => [row.id, row.name]))
  const namesByGeneration = new Map<string, string[]>()
  for (const link of links) {
    const name = subjectById.get(link.subjectId)
    if (!name) continue
    const list = namesByGeneration.get(link.generationId) ?? []
    list.push(name)
    namesByGeneration.set(link.generationId, list)
  }
  const views: JobView[] = []
  for (const row of rows) {
    if (!isState(row.status)) continue
    const gen = generationById.get(row.generationId)
    const pinned = gen ? modelById.get(gen.modelId) : undefined
    const names = gen ? namesByGeneration.get(gen.id) ?? [] : []
    const substate = row.completedSubstate === 'download-failed' || row.completedSubstate === 'result-expired'
      ? row.completedSubstate
      : null
    let regenerateEstimateUsd: string | null = null
    if (row.status === 'completed' && substate === 'result-expired' && pinned && gen) {
      const params = gen.params && typeof gen.params === 'object' ? gen.params as Record<string, unknown> : {}
      const estimate = await studio.estimate({ endpoint: pinned.endpoint, params })
      if (estimate.outcome === 'estimate') regenerateEstimateUsd = estimate.usd
    }
    const at = row.finishedAt ?? row.submittedAt ?? row.createdAt
    const elapsedSeconds = row.submittedAt && IN_FLIGHT.has(row.status)
      ? Math.max(0, Math.floor((now.getTime() - row.submittedAt.getTime()) / 1000))
      : null
    views.push({
      id: row.id,
      status: row.status,
      substate,
      subject: names.length > 0 ? names.join(', ') : null,
      step: gen ? stepOf(gen.kind, gen.params) : row.status,
      model: pinned?.endpoint ?? null,
      estimateUsd: row.estimateUsd,
      billed: billedOf(row.status, linesByJob.get(row.id) ?? []),
      at: at.toISOString(),
      elapsedSeconds,
      regenerateEstimateUsd,
    })
  }
  return views
}

const JOB_ID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

export function jobIdFrom(pathname: string, action: 'download' | 'regenerate'): string | null {
  const match = new RegExp(`^/api/jobs/(${JOB_ID})/${action}$`, 'i').exec(pathname)
  return match?.[1] ?? null
}

export async function pollInFlight(opened: OpenedAdmin, ids: readonly string[]): Promise<JobView[]> {
  if (!opened.falConfigured) return readJobs(opened.db, opened.studio, opened.clock())
  if (!opened.databaseHold) {
    opened.database = (await probeDatabase(opened.db)) ? 'reachable' : 'unavailable'
    if (opened.database === 'unavailable') return []
  }
  if (opened.databaseHold || process.env.STUDIO_ADMIN_FREEZE === '1') {
    return readJobs(opened.db, opened.studio, opened.clock())
  }
  const current = await readJobs(opened.db, opened.studio, opened.clock())
  const wanted = new Set(ids)
  for (const row of current) {
    if (!IN_FLIGHT.has(row.status) || !wanted.has(row.id)) continue
    await opened.studio.poll(row.id)
  }
  return readJobs(opened.db, opened.studio, opened.clock())
}

export async function downloadJob(opened: OpenedAdmin, jobId: string) {
  if (!opened.falConfigured) return { outcome: 'fal-key-missing' as const }
  return opened.studio.download(jobId)
}

export async function regenerateJob(opened: OpenedAdmin, jobId: string, confirmEstimate: string) {
  if (!opened.falConfigured) return { outcome: 'fal-key-missing' as const }
  if (opened.database === 'unavailable') return { outcome: 'database-unavailable' as const }
  const [current] = await opened.db.select().from(job).where(eq(job.id, jobId))
  if (!current || current.completedSubstate !== 'result-expired') return { outcome: 'not-ready' as const }
  const [gen] = await opened.db.select().from(generation).where(eq(generation.id, current.generationId))
  const [pinned] = gen ? await opened.db.select().from(model).where(eq(model.id, gen.modelId)) : []
  if (!gen || !pinned) return { outcome: 'not-ready' as const }
  const params = gen.params && typeof gen.params === 'object' ? gen.params as Record<string, unknown> : {}
  const estimate = await opened.studio.estimate({ endpoint: pinned.endpoint, params })
  if (estimate.outcome !== 'estimate') return { outcome: estimate.outcome, ...(estimate.outcome === 'param-not-allowed' ? { param: estimate.param } : {}) }
  if (confirmEstimate !== estimate.usd) return { outcome: 'estimate-changed' as const, usd: estimate.usd }
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
