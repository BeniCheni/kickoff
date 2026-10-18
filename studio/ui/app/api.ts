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

export async function pollJobs(): Promise<JobView[]> {
  const response = await postJson('/api/jobs/poll', {})
  return await response.json() as JobView[]
}

export async function downloadJob(id: string): Promise<void> {
  await postJson(`/api/jobs/${id}/download`)
}

export async function regenerateJob(id: string, confirmEstimate: string): Promise<void> {
  await postJson(`/api/jobs/${id}/regenerate`, { confirmEstimate })
}
