import type { JobView } from '../../shared/jobs.ts'
import type { ShellView } from '../../shared/types.ts'

export async function getShell(): Promise<ShellView> {
  const response = await fetch('/api/shell', { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error('refused')
  return await response.json() as ShellView
}

async function postJson(path: string, body?: unknown): Promise<Response> {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body ?? {}),
  })
  if (!response.ok) throw new Error('refused')
  return response
}

export async function getJobs(): Promise<JobView[]> {
  const response = await fetch('/api/jobs', { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error('refused')
  return await response.json() as JobView[]
}

export async function pollJobs(ids: readonly string[]): Promise<JobView[]> {
  const response = await postJson('/api/jobs/poll', { ids })
  return await response.json() as JobView[]
}

export async function downloadJob(id: string): Promise<void> {
  await postJson(`/api/jobs/${id}/download`)
}

export async function regenerateJob(id: string, confirmEstimate: string): Promise<unknown> {
  const response = await postJson(`/api/jobs/${id}/regenerate`, { confirmEstimate })
  return await response.json() as unknown
}

export type ComposeCatalog = {
  subjects: { id: string; name: string }[]
  photos: { id: string; sha256: string }[]
  keyframeModels: { id: string; endpoint: string; pinnedOn: string }[]
  clipModels: { id: string; endpoint: string; pinnedOn: string }[]
  sessionSpendUsd: string
  perJobCapUsd: string
  sessionCapUsd: string
  database: 'reachable' | 'unavailable'
}

export type EstimateLine =
  | { outcome: 'estimate'; usd: string; registryId: string; tag: string }
  | { outcome: 'not-in-registry' }
  | { outcome: 'param-not-allowed'; param: string }

export async function getCompose(): Promise<ComposeCatalog> {
  const response = await fetch('/api/compose', { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error('refused')
  return await response.json() as ComposeCatalog
}

export async function estimateJobs(jobs: { endpoint: string; params: Record<string, unknown> }[]): Promise<{
  lines: EstimateLine[]
  totalUsd: string
  overBudget: boolean
  unpriced: boolean
}> {
  const response = await postJson('/api/estimate', { jobs })
  return await response.json() as {
    lines: EstimateLine[]
    totalUsd: string
    overBudget: boolean
    unpriced: boolean
  }
}

export async function submitJobs(body: {
  confirmTotalUsd: string
  jobs: {
    endpoint: string
    params: Record<string, unknown>
    prompt: string
    seed: string | null
    photoId: string | null
    subjectId: string | null
  }[]
}): Promise<unknown> {
  const response = await postJson('/api/submit', body)
  return await response.json() as unknown
}

export type ReviewView = {
  outcome: 'review' | 'missing'
  jobId?: string
  status?: string
  prompt?: string | null
  endpoint?: string | null
  resolution?: string | null
  seed?: string | null
  expansion?: string | null
  assetId?: string | null
  file?: {
    mime: string
    bytes: number
    sha256: string
    width: number | null
    height: number | null
    durationS: string | null
  } | null
  parents?: string[]
  answers?: { line: string; answer: string }[]
  regenerateEstimateUsd?: string | null
  attestation?: { by: string | null; at: string } | null
}

export async function getReview(id: string): Promise<ReviewView> {
  const response = await fetch(`/api/review/${id}`, { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error('refused')
  return await response.json() as ReviewView
}

export async function keepReview(id: string, answers: { line: string; answer: string }[]): Promise<unknown> {
  const response = await postJson(`/api/review/${id}/keep`, { answers })
  return await response.json() as unknown
}

export async function discardReview(id: string): Promise<unknown> {
  const response = await postJson(`/api/review/${id}/discard`, {})
  return await response.json() as unknown
}

export async function regenerateReview(id: string, confirmEstimate: string): Promise<unknown> {
  const response = await postJson(`/api/review/${id}/regenerate`, { confirmEstimate })
  return await response.json() as unknown
}

export type PublishView = {
  outcome: 'publish' | 'missing'
  status?: string
  assetId?: string | null
  gateRecorded?: boolean
  gateReason?: string | null
  refusals: string[]
  keys?: { video: string; thumbnail: string } | null
}

export async function getPublish(id: string, publicId: string): Promise<PublishView> {
  const response = await fetch(`/api/publish/${id}?publicId=${encodeURIComponent(publicId)}`, { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error('refused')
  return await response.json() as PublishView
}

export async function recordGate(body: { answer: string; disclosure: string; recordedBy: string; source: string }): Promise<unknown> {
  const response = await postJson('/api/gate', body)
  return await response.json() as unknown
}

export async function publishClip(id: string, body: { publicId: string; title: string; position: number; confirm: true }): Promise<unknown> {
  const response = await postJson(`/api/publish/${id}/go`, body)
  return await response.json() as unknown
}

export async function unpublishClip(id: string, deleteFiles: boolean): Promise<unknown> {
  const response = await postJson(`/api/publish/${id}/unpublish`, { deleteFiles })
  return await response.json() as unknown
}

export async function retryDelete(id: string): Promise<unknown> {
  const response = await postJson(`/api/publish/${id}/retry-delete`, {})
  return await response.json() as unknown
}

export async function retryRemoval(id: string): Promise<unknown> {
  const response = await postJson(`/api/publish/${id}/retry-removal`, {})
  return await response.json() as unknown
}

export async function uploadPhoto(bytes: ArrayBuffer): Promise<{ id: string; sha256: string }> {
  const response = await fetch('/api/photos', {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'image/jpeg' },
    body: bytes,
  })
  if (!response.ok) throw new Error('refused')
  return await response.json() as { id: string; sha256: string }
}
