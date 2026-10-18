import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { eq } from 'drizzle-orm'
import { afterEach, describe, expect, it } from 'vitest'
import { catalogDetailRowSchema, publishedDetailColumns } from '@kickoff/catalog'
import { CHECKLIST_LINES, asset, generation, job, ledger, session } from '../db/schema.ts'
import { createStudio } from '../engine.ts'
import { createFalStub } from '../fal/stub.ts'
import { sha256 } from '../hash.ts'
import { syntheticMp4 } from '../media/mp4.ts'
import { createStorageStub } from '../storage/stub.ts'
import { runCli } from '../cli.ts'
import { freshDatabase, type StudioClient } from './harness.ts'
import { minimalJpeg, taggedJpeg } from './jpeg.ts'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const clients: StudioClient[] = []
const MAC_EPOCH_SECONDS = 2_082_844_800

afterEach(async () => {
  await Promise.all(clients.splice(0).map((client) => client.close()))
})

function clears() {
  return CHECKLIST_LINES.map((line) => ({ line, answer: 'clear' as const, by: 'operator' }))
}

function creationTime(iso: string): number {
  return Math.floor(new Date(iso).getTime() / 1000) + MAC_EPOCH_SECONDS
}

async function open(now = '2026-10-18T16:00:00.000Z') {
  const { client, db } = await freshDatabase()
  clients.push(client)
  const mediaDir = mkdtempSync(path.join(tmpdir(), 'kickoff-import-'))
  const fal = createFalStub('queued-then-completed')
  const storage = createStorageStub()
  const studio = createStudio({
    db,
    fal,
    storage: storage.port,
    mediaDir,
    repoRoot,
    clock: () => new Date(now),
  })
  return { client, db, studio, fal, storage, mediaDir }
}

function clip(options: { audio?: boolean; creation?: string; durationS?: number } = {}) {
  return syntheticMp4({
    width: 1920,
    height: 1080,
    durationS: options.durationS ?? 5,
    frameRate: 24,
    audio: options.audio ?? true,
    creationTime: options.creation ? creationTime(options.creation) : 0,
  })
}

describe('import', () => {
  it('records a handmade clip, refuses the same bytes, and does not touch fal or the ledger', async () => {
    const opened = await open()
    const video = clip({ creation: '2026-10-18T15:00:00.000Z' })
    const first = await opened.studio.importClip({
      video,
      keyframe: taggedJpeg(),
      source: 'grok-imagine',
      prompt: 'A cat scores\n',
      subjects: ['Frankenstein', 'Fenway'],
      title: 'Both cats',
      note: 'made by hand',
    })
    expect(first.outcome).toBe('imported')
    if (first.outcome !== 'imported') return
    expect(first.width).toBe(1920)
    expect(first.height).toBe(1080)
    expect(first.durationS).toBe('5.000')
    expect(first.container).toBe('isom')
    expect(first.videoCodec).toBe('H.264')
    expect(first.audio).toBe(true)
    expect(first.frameRate).toBe(24)
    expect(opened.fal.calls).toHaveLength(0)
    expect(await opened.db.select().from(ledger)).toHaveLength(0)
    expect(await opened.db.select().from(session)).toHaveLength(0)

    const [row] = await opened.db.select().from(job).where(eq(job.id, first.jobId))
    expect(row?.status).toBe('downloaded')
    expect(row?.providerRequestId).toBeNull()
    expect(row?.estimateUsd).toBe('0.000000')
    expect(row?.sessionId).toBeNull()
    expect(row?.finishedAt?.toISOString()).toBe('2026-10-18T15:00:00.000Z')
    const [gen] = await opened.db.select().from(generation).where(eq(generation.id, row?.generationId ?? ''))
    expect(gen?.prompt).toBe('A cat scores')
    expect(gen?.promptExpansion).toBeNull()
    expect(gen?.seed).toBeNull()
    expect(gen?.params).toMatchObject({
      source: 'grok-imagine',
      container: 'isom',
      videoCodec: 'H.264',
      frameRate: 24,
      audio: true,
      pinned_on: '2026-10-18',
    })
    const still = (await opened.db.select().from(asset)).find((item) => item.role === 'keyframe')
    expect(still?.sha256).toBe(sha256(minimalJpeg))
    expect(still?.localPath).toBeTruthy()
    const storedStill = readFileSync(still?.localPath ?? '')
    expect(Buffer.from(storedStill).equals(Buffer.from(minimalJpeg))).toBe(true)
    expect(storedStill.includes(Buffer.from('GPS'))).toBe(false)

    const again = await opened.studio.importClip({
      video,
      keyframe: minimalJpeg,
      source: 'grok-imagine',
      prompt: 'a different prompt',
      subjects: ['Fenway'],
      title: 'Again',
    })
    expect(again).toMatchObject({ outcome: 'already-imported', sha256: first.sha256 })
    expect(await opened.db.select().from(job)).toHaveLength(1)

    const other = await opened.studio.importClip({
      video: clip({ creation: '2026-10-18T15:00:00.000Z', durationS: 6 }),
      keyframe: minimalJpeg,
      source: 'grok-imagine',
      prompt: 'another clip',
      subjects: ['Fenway'],
      title: 'Second',
      madeOn: '2026-10-21',
    })
    expect(other.outcome).toBe('imported')
    if (other.outcome !== 'imported') return
    const [second] = await opened.db.select().from(job).where(eq(job.id, other.jobId))
    expect(second?.finishedAt?.toISOString()).toBe('2026-10-21T04:00:00.000Z')
    expect(await opened.db.select().from(ledger)).toHaveLength(0)

    const submitted = await opened.studio.submit({
      endpoint: 'minimax/h3-max-turbo/image-to-video',
      params: { prompt: 'a fictional cat', duration: 15, resolution: '480P', seed: '1' },
      prompt: 'a fictional cat',
      seed: '1',
    })
    expect(submitted.outcome).toBe('submitted')
    expect(await opened.db.select().from(ledger)).toHaveLength(1)
  })

  it('refuses a bad clip, a bad still, an unknown subject, and a missing finish time before it writes', async () => {
    const opened = await open()
    const base = {
      video: clip({ creation: '2026-10-18T15:00:00.000Z' }),
      keyframe: minimalJpeg,
      source: 'grok-imagine',
      prompt: 'A cat scores',
      subjects: ['Fenway'],
      title: 'Fenway',
    }
    expect((await opened.studio.importClip({ ...base, source: 'fal' })).outcome).toBe('source-refused')
    expect((await opened.studio.importClip({ ...base, subjects: ['Other'] })).outcome).toBe('subject-refused')
    expect((await opened.studio.importClip({ ...base, subjects: [] })).outcome).toBe('subject-refused')
    expect((await opened.studio.importClip({ ...base, prompt: ' \n' })).outcome).toBe('prompt-empty')
    expect((await opened.studio.importClip({ ...base, title: '  ' })).outcome).toBe('title-empty')
    expect((await opened.studio.importClip({ ...base, keyframe: new Uint8Array([1, 2, 3]) })).outcome).toBe('not-a-jpeg')
    expect((await opened.studio.importClip({ ...base, video: new Uint8Array([1, 2, 3, 4]) })).outcome).toBe('clip-refused')
    expect((await opened.studio.importClip({
      ...base,
      video: syntheticMp4({ video: false, audio: true }),
    })).outcome).toBe('clip-refused')
    expect((await opened.studio.importClip({
      ...base,
      video: syntheticMp4({ durationS: 0, creationTime: creationTime('2026-10-18T15:00:00.000Z') }),
    })).outcome).toBe('clip-refused')
    expect((await opened.studio.importClip({
      ...base,
      video: clip(),
      madeOn: undefined,
    })).outcome).toBe('needs-made-on')
    expect((await opened.studio.importClip({ ...base, madeOn: '2026-02-31' })).outcome).toBe('made-on-invalid')
    expect(await opened.db.select().from(job)).toHaveLength(0)
    expect(await opened.db.select().from(asset)).toHaveLength(0)
    expect(opened.fal.calls).toHaveLength(0)
  })

  it('keeps, records the gate, and publishes onto the catalog with the omitted nulls', async () => {
    const opened = await open()
    const video = clip({ audio: true, creation: '2026-10-18T15:00:00.000Z' })
    const imported = await opened.studio.importClip({
      video,
      keyframe: minimalJpeg,
      source: 'grok-imagine',
      prompt: 'A cat scores',
      subjects: ['Fenway', 'Frankenstein'],
      title: 'Both cats',
      note: 'handmade',
    })
    expect(imported.outcome).toBe('imported')
    if (imported.outcome !== 'imported') return
    expect((await opened.studio.keep(imported.jobId, clears())).outcome).toBe('kept')
    expect((await opened.studio.recordGate({
      answer: 'recorded',
      disclosure: 'pending a named answer',
      recordedBy: 'unspecified',
      source: 'A-06',
    })).outcome).toBe('gate-recorded')
    const published = await opened.studio.publish({
      jobId: imported.jobId,
      publicId: 'both-cats',
      title: 'Both cats',
      position: 1,
    })
    expect(published).toMatchObject({ outcome: 'published', live: true })
    const result = await opened.client.query<Record<string, unknown>>('SELECT * FROM catalog.video')
    expect(result.rows).toHaveLength(1)
    const row = result.rows[0]
    if (!row) throw new Error('detail row missing')
    expect(Object.keys(row)).toEqual([...publishedDetailColumns])
    const projected: Record<string, unknown> = {}
    for (const key of publishedDetailColumns) {
      const value = row[key]
      if (key === 'published_at' || key === 'generated_at' || key === 'kept_at') {
        projected[key] = value === null || value === undefined ? null : new Date(String(value)).toISOString()
      } else if (key === 'position' || key === 'bytes' || key === 'width' || key === 'height') {
        projected[key] = value === null || value === undefined ? null : Number(value)
      } else if (key === 'duration_s') {
        projected[key] = value === null || value === undefined ? null : String(value)
      } else {
        projected[key] = value ?? null
      }
    }
    const parsed = catalogDetailRowSchema.parse(projected)
    expect(parsed.endpoint).toBe('xai/grok-imagine (grok.com, made by hand)')
    expect(parsed.pinned_on).toBe('2026-10-18')
    expect(parsed.prompt).toBe('A cat scores')
    expect(parsed.prompt_expansion).toBeNull()
    expect(parsed.seed).toBeNull()
    expect(parsed.subjects).toEqual(['Fenway', 'Frankenstein'])
    expect(parsed.editorial_note).toBe('handmade')
    expect(parsed.width).toBe(1920)
    expect(parsed.height).toBe(1080)
    expect(parsed.duration_s).toBe('5.000')
    expect(parsed.video_bucket).toBe('moments')
    expect(parsed.video_object_path).toBe(`both-cats/video-${imported.sha256.slice(0, 8)}.mp4`)
    expect(parsed.thumbnail_object_path).toBe(`both-cats/thumbnail-${sha256(minimalJpeg).slice(0, 8)}.jpg`)
    expect(parsed.generated_at).toBe('2026-10-18T15:00:00.000Z')
    expect(JSON.stringify(parsed)).not.toContain(imported.jobId)
    expect(await opened.db.select().from(ledger)).toHaveLength(0)

    const readme = readFileSync(path.join(repoRoot, 'studio/README.md'), 'utf8')
    const sql = /```sql\n([\s\S]*?)```/.exec(readme)?.[1]?.trim()
    expect(sql).toBeTruthy()
    expect(sql).not.toContain('public_id')
    expect(sql).toContain('where id =')
    expect(readme).toContain("The public id's column is `id`.")
    const queried = await opened.client.query<Record<string, unknown>>(
      (sql ?? '').replaceAll("'fenway-wednesday'", "'both-cats'"),
    )
    expect(queried.rows).toHaveLength(1)
    expect(queried.rows[0]?.id).toBe('both-cats')
    expect(queried.rows[0]?.endpoint).toBe('xai/grok-imagine (grok.com, made by hand)')
    expect(queried.rows[0]?.prompt_expansion).toBeNull()
    expect(queried.rows[0]?.seed).toBeNull()
    expect(queried.rows[0]?.video_bucket).toBe('moments')
  })

  it('imports from the command line and refuses the same file', async () => {
    const data = mkdtempSync(path.join(tmpdir(), 'kickoff-import-data-'))
    const media = mkdtempSync(path.join(tmpdir(), 'kickoff-import-media-'))
    const videoPath = path.join(media, 'clip.mp4')
    const stillPath = path.join(media, 'k0.jpg')
    const promptPath = path.join(media, 'prompt.txt')
    writeFileSync(videoPath, clip({ creation: '2026-10-18T15:00:00.000Z' }))
    writeFileSync(stillPath, minimalJpeg)
    writeFileSync(promptPath, 'A cat scores\n')
    const env = {
      STUDIO_DATA_DIR: data,
      STUDIO_MEDIA_DIR: media,
      STUDIO_NOW: '2026-10-18T16:00:00.000Z',
    }
    const args = [
      'import',
      '--file', videoPath,
      '--keyframe', stillPath,
      '--source', 'grok-imagine',
      '--prompt-file', promptPath,
      '--subjects', 'Fenway',
      '--title', 'Fenway',
      '--note', 'from the cli',
    ]
    const out: string[] = []
    const err: string[] = []
    const io = {
      stdout: (line: string) => out.push(line),
      stderr: (line: string) => err.push(line),
    }
    expect(await runCli(args, env, io)).toBe(0)
    expect(out[0]).toContain('imported')
    expect(out[0]).toContain('transport=stub')
    expect(out[0]).toContain('codec=H.264')
    expect(out[0]).toContain('audio=true')
    expect(err).toEqual([])
    const second: string[] = []
    expect(await runCli(args, env, {
      stdout: (line) => second.push(line),
      stderr: () => undefined,
    })).toBe(0)
    expect(second).toEqual(['refused: this file was already imported database=pglite'])
  })

  it('prints why a position or a public id was taken', async () => {
    const data = mkdtempSync(path.join(tmpdir(), 'kickoff-import-taken-'))
    const media = mkdtempSync(path.join(tmpdir(), 'kickoff-import-taken-media-'))
    const env = {
      STUDIO_DATA_DIR: data,
      STUDIO_MEDIA_DIR: media,
      STUDIO_NOW: '2026-10-18T16:00:00.000Z',
    }
    const say = () => {
      const out: string[] = []
      return { out, stdout: (line: string) => out.push(line), stderr: () => undefined }
    }
    const bring = async (name: string, durationS: number) => {
      const videoPath = path.join(media, `${name}.mp4`)
      const stillPath = path.join(media, `${name}.jpg`)
      const promptPath = path.join(media, `${name}.txt`)
      writeFileSync(videoPath, clip({ creation: '2026-10-18T15:00:00.000Z', durationS }))
      writeFileSync(stillPath, minimalJpeg)
      writeFileSync(promptPath, 'A cat scores\n')
      const imported = say()
      expect(await runCli([
        'import', '--file', videoPath, '--keyframe', stillPath, '--source', 'grok-imagine',
        '--prompt-file', promptPath, '--subjects', 'Fenway', '--title', name,
      ], env, imported)).toBe(0)
      const job = /job=([0-9a-f-]{36})/.exec(imported.out[0] ?? '')?.[1] ?? ''
      expect(await runCli(['keep', '--job', job, '--answers', CHECKLIST_LINES.map(() => 'clear').join(',')], env, say())).toBe(0)
      return job
    }
    const first = await bring('one', 5)
    const secondJob = await bring('two', 6)
    expect(await runCli(['record-gate', '--answer', 'recorded', '--disclosure', 'pending', '--by', 'unspecified', '--source', 'A-06'], env, say())).toBe(0)
    expect(await runCli(['publish', '--job', first, '--public-id', 'fenway-one', '--title', 'One', '--position', '1'], env, say())).toBe(0)
    const taken = say()
    expect(await runCli(['publish', '--job', secondJob, '--public-id', 'fenway-two', '--title', 'Two', '--position', '1'], env, taken)).toBe(0)
    expect(taken.out[0]).toBe('record-failed live=false reason=position-taken database=pglite storage=stub')
    const sameId = say()
    expect(await runCli(['publish', '--job', secondJob, '--public-id', 'fenway-one', '--title', 'Two', '--position', '2'], env, sameId)).toBe(0)
    expect(sameId.out[0]).toBe('record-failed live=false reason=public-id-taken database=pglite storage=stub')
    const listed = say()
    expect(await runCli(['list'], env, listed)).toBe(0)
    expect(listed.out.some((line) => line.includes(first) && line.includes('database=pglite'))).toBe(true)
    const readme = readFileSync(path.join(repoRoot, 'studio/README.md'), 'utf8')
    expect(readme).toContain('record-failed live=false reason=position-taken database=postgres storage=r2')
    expect(readme).toContain('reason=public-id-taken')
    expect(readme).toContain('npm run cli -- list --live')
  })
})
