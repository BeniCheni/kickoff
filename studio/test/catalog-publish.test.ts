import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { eq } from 'drizzle-orm'
import { afterEach, describe, expect, it } from 'vitest'
import { catalogDetailRowSchema, publishedDetailColumns } from '@kickoff/catalog'
import { CHECKLIST_LINES, asset, generationInput, job } from '../db/schema.ts'
import { createStudio, type StudioFlags } from '../engine.ts'
import type { ScriptName } from '../fal/stub.ts'
import { createFalStub } from '../fal/stub.ts'
import { createStorageStub, type StorageScript } from '../storage/stub.ts'
import { freshDatabase, type StudioClient } from './harness.ts'
import { minimalJpeg } from './jpeg.ts'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const clients: StudioClient[] = []

afterEach(async () => {
  await Promise.all(clients.splice(0).map((client) => client.close()))
})

const VIDEO = 'minimax/h3-max-turbo/image-to-video'
const INSTANTS = new Set(['published_at', 'generated_at', 'kept_at'])
const INTEGERS = new Set(['position', 'bytes', 'width', 'height'])

function clears() {
  return CHECKLIST_LINES.map((line) => ({ line, answer: 'clear' as const, by: 'operator' }))
}

function iso(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const date = value instanceof Date ? value : new Date(String(value))
  if (Number.isNaN(date.getTime())) throw new Error(`not an instant: ${String(value)}`)
  return date.toISOString()
}

function projectDetail(row: Record<string, unknown>) {
  const projected: Record<string, unknown> = {}
  for (const key of publishedDetailColumns) {
    const value = row[key]
    if (INSTANTS.has(key)) projected[key] = iso(value)
    else if (INTEGERS.has(key)) projected[key] = value === null || value === undefined ? null : Number(value)
    else if (key === 'duration_s') projected[key] = value === null || value === undefined ? null : String(value)
    else projected[key] = value ?? null
  }
  return projected
}

async function publishedClip() {
  const { client, db } = await freshDatabase()
  clients.push(client)
  const mediaDir = mkdtempSync(path.join(tmpdir(), 'kickoff-catalog-'))
  const storageScript: StorageScript = {}
  const storage = createStorageStub(storageScript)
  const flags: StudioFlags = { breakLedgerWrite: false, breakAfterAccept: false, breakRecordWrite: false }
  const now = new Date('2026-10-12T16:00:00.000Z')
  const studio = createStudio({
    db,
    fal: createFalStub('queued-then-completed' satisfies ScriptName),
    storage: storage.port,
    mediaDir,
    repoRoot,
    clock: () => now,
    flags,
  })
  const submitted = await studio.submit({
    endpoint: VIDEO,
    params: { prompt: 'a fictional cat', duration: 15, resolution: '480P', seed: '1' },
    prompt: 'a fictional cat',
    seed: '1',
  })
  expect(submitted.outcome).toBe('submitted')
  if (submitted.outcome !== 'submitted') throw new Error('not submitted')
  let completed = false
  for (let step = 0; step < 4; step += 1) {
    const polled = await studio.poll(submitted.jobId)
    if (polled.outcome === 'completed') {
      completed = true
      break
    }
  }
  expect(completed).toBe(true)
  expect((await studio.download(submitted.jobId)).outcome).toBe('downloaded')
  expect((await studio.keep(submitted.jobId, clears())).outcome).toBe('kept')
  const [current] = await db.select().from(job).where(eq(job.id, submitted.jobId))
  if (!current) throw new Error('missing job')
  const [k0] = await db.insert(asset).values({
    role: 'keyframe',
    sha256: 'k0-hash',
    mime: 'image/jpeg',
    bytes: minimalJpeg.byteLength,
    localPath: path.join(mediaDir, 'k0.jpg'),
  }).returning()
  if (!k0) throw new Error('missing keyframe')
  await db.insert(generationInput).values({ generationId: current.generationId, assetId: k0.id, role: 'first' })
  expect((await studio.recordGate({
    answer: 'recorded',
    disclosure: 'pending a named answer',
    recordedBy: 'unspecified',
    source: 'A-06',
  })).outcome).toBe('gate-recorded')
  const published = await studio.publish({
    jobId: submitted.jobId,
    publicId: 'fenway',
    title: 'Fenway',
    position: 1,
  })
  expect(published).toMatchObject({ outcome: 'published', live: true })
  return { client, jobId: submitted.jobId }
}

describe('publish projection', () => {
  it('parses the detail row a publish exposes and rejects a private field', async () => {
    const { client, jobId } = await publishedClip()
    const result = await client.query<Record<string, unknown>>('SELECT * FROM catalog.video')
    expect(result.rows).toHaveLength(1)
    const row = result.rows[0]
    if (!row) throw new Error('detail row missing')
    expect(Object.keys(row)).toEqual([...publishedDetailColumns])
    const projected = projectDetail(row)
    const parsed = catalogDetailRowSchema.parse(projected)
    expect(parsed.id).toBe('fenway')
    expect(parsed.title).toBe('Fenway')
    expect(parsed.subjects).toEqual([])
    expect(parsed.thumbnail_is_keyframe).toBe(true)
    expect(parsed.kept_at).not.toBeNull()
    expect(JSON.stringify(parsed)).not.toContain(jobId)
    const withPrivate = { ...projected, job_id: jobId }
    expect(catalogDetailRowSchema.safeParse(withPrivate).success).toBe(false)
  })
})
