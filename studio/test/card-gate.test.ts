import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { eq } from 'drizzle-orm'
import { afterEach, describe, expect, it } from 'vitest'
import {
  CHECKLIST_LINES,
  article50Answer,
  asset,
  event,
  generationInput,
  generationSubject,
  job,
  subject,
  videos,
} from '../db/schema.ts'
import { createStudio, type Studio } from '../engine.ts'
import { createFalStub } from '../fal/stub.ts'
import { createStorageStub } from '../storage/stub.ts'
import { freshDatabase, throwsMatching, type StudioClient } from './harness.ts'
import { seedClip } from './fixture.ts'
import { attachCardFacts } from './card-facts.ts'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const clients: StudioClient[] = []

afterEach(async () => {
  await Promise.all(clients.splice(0).map((client) => client.close()))
})

function clears() {
  return CHECKLIST_LINES.map((line) => ({ line, answer: 'clear' as const, by: 'operator' }))
}

async function readyClip(options: { facts?: boolean } = {}) {
  const { client, db } = await freshDatabase()
  clients.push(client)
  const mediaDir = mkdtempSync(path.join(tmpdir(), 'kickoff-card-'))
  const storage = createStorageStub()
  const studio = createStudio({
    db,
    fal: createFalStub('queued-then-completed'),
    storage: storage.port,
    mediaDir,
    repoRoot,
    clock: () => new Date('2026-10-12T16:00:00.000Z'),
  })
  const submitted = await studio.submit({
    endpoint: 'minimax/h3-max-turbo/image-to-video',
    params: { prompt: 'a fictional cat', duration: 15, resolution: '480P', seed: 'card' },
    prompt: 'a fictional cat',
    seed: 'card',
  })
  expect(submitted.outcome).toBe('submitted')
  if (submitted.outcome !== 'submitted') throw new Error('not submitted')
  let done = false
  for (let step = 0; step < 4; step += 1) {
    const polled = await studio.poll(submitted.jobId)
    if (polled.outcome === 'completed') {
      done = true
      break
    }
  }
  expect(done).toBe(true)
  expect((await studio.download(submitted.jobId)).outcome).toBe('downloaded')
  expect((await studio.keep(submitted.jobId, clears())).outcome).toBe('kept')
  const [row] = await db.select().from(job).where(eq(job.id, submitted.jobId))
  if (!row) throw new Error('missing job')
  const [k0] = await db.insert(asset).values({
    role: 'keyframe',
    sha256: 'k0-hash',
    mime: 'image/jpeg',
    bytes: 4,
    localPath: path.join(mediaDir, 'k0.jpg'),
  }).returning()
  if (!k0) throw new Error('missing keyframe')
  await db.insert(generationInput).values({ generationId: row.generationId, assetId: k0.id, role: 'first' })
  if (options.facts === false) {
    const video = (await db.select().from(asset)).find((item) => item.role === 'video')
    if (!video) throw new Error('missing video')
    await db.update(asset).set({ width: 768, height: 480, durationS: '15.084' }).where(eq(asset.id, video.id))
  } else {
    await attachCardFacts(db, row.generationId)
  }
  expect((await studio.recordGate({
    answer: 'recorded',
    disclosure: 'pending a named answer',
    recordedBy: 'unspecified',
    source: 'A-06',
  })).outcome).toBe('gate-recorded')
  return { client, db, studio, storage, jobId: row.id, generationId: row.generationId }
}

async function listed(client: StudioClient): Promise<number> {
  const result = await client.query<{ id: string }>('SELECT id FROM catalog.videos')
  return result.rows.length
}

function publish(studio: Studio, jobId: string, publicId = 'fenway') {
  return studio.publish({ jobId, publicId, title: 'Fenway', position: 1 })
}

describe('Card gate', () => {
  it('refuses a missing width and writes nothing', async () => {
    const clip = await readyClip()
    const video = (await clip.db.select().from(asset)).find((item) => item.role === 'video')
    if (!video) throw new Error('missing video')
    await clip.db.update(asset).set({ width: null }).where(eq(asset.id, video.id))
    const eventsBefore = await clip.db.select().from(event)
    const assetsBefore = await clip.db.select().from(asset)
    const refused = await publish(clip.studio, clip.jobId)
    expect(refused).toEqual({ outcome: 'card-refused', missing: ['a positive width'], live: false })
    expect(clip.storage.calls).toEqual([])
    expect(await listed(clip.client)).toBe(0)
    expect(await clip.db.select().from(videos)).toHaveLength(0)
    expect(await clip.db.select().from(event)).toHaveLength(eventsBefore.length)
    expect(await clip.db.select().from(asset)).toHaveLength(assetsBefore.length)
    const [row] = await clip.db.select().from(job).where(eq(job.id, clip.jobId))
    expect(row?.status).toBe('kept')
  })

  it('refuses a zero height, a zero duration, and a negative width', async () => {
    const height = await readyClip()
    const heightVideo = (await height.db.select().from(asset)).find((item) => item.role === 'video')
    if (!heightVideo) throw new Error('missing video')
    await height.db.update(asset).set({ height: 0 }).where(eq(asset.id, heightVideo.id))
    expect(await publish(height.studio, height.jobId)).toEqual({
      outcome: 'card-refused',
      missing: ['a positive height'],
      live: false,
    })
    expect(height.storage.calls).toEqual([])

    const duration = await readyClip()
    const durationVideo = (await duration.db.select().from(asset)).find((item) => item.role === 'video')
    if (!durationVideo) throw new Error('missing video')
    await duration.db.update(asset).set({ durationS: '0.000' }).where(eq(asset.id, durationVideo.id))
    expect(await publish(duration.studio, duration.jobId)).toEqual({
      outcome: 'card-refused',
      missing: ['a positive duration'],
      live: false,
    })
    expect(duration.storage.calls).toEqual([])

    const width = await readyClip()
    const widthVideo = (await width.db.select().from(asset)).find((item) => item.role === 'video')
    if (!widthVideo) throw new Error('missing video')
    await width.db.update(asset).set({ width: -1 }).where(eq(asset.id, widthVideo.id))
    expect(await publish(width.studio, width.jobId)).toEqual({
      outcome: 'card-refused',
      missing: ['a positive width'],
      live: false,
    })
    expect(await listed(width.client)).toBe(0)
  })

  it('refuses a clip with no approved subject, including a name that only looks like one', async () => {
    const clip = await readyClip({ facts: false })
    expect(await publish(clip.studio, clip.jobId)).toEqual({
      outcome: 'card-refused',
      missing: ['an approved subject'],
      live: false,
    })
    expect(clip.storage.calls).toEqual([])

    const lowercase = await readyClip({ facts: false })
    const [other] = await lowercase.db.insert(subject).values({ name: 'fenway' }).returning()
    if (!other) throw new Error('subject insert returned nothing')
    await lowercase.db.insert(generationSubject).values({ generationId: lowercase.generationId, subjectId: other.id })
    expect(await publish(lowercase.studio, lowercase.jobId)).toEqual({
      outcome: 'card-refused',
      missing: ['an approved subject'],
      live: false,
    })
    expect(await listed(lowercase.client)).toBe(0)
  })

  it('refuses an unsafe public id and names it with any other gap', async () => {
    const cases = ['-fenway', 'a/b', 'has space', 'a'.repeat(65), '_fenway', '..', '.fenway']
    for (const publicId of cases) {
      const clip = await readyClip()
      const refused = await publish(clip.studio, clip.jobId, publicId)
      expect(refused).toEqual({ outcome: 'card-refused', missing: ['a safe public id'], live: false })
      expect(clip.storage.calls).toEqual([])
      expect(await listed(clip.client)).toBe(0)
    }

    const both = await readyClip({ facts: false })
    const refused = await publish(both.studio, both.jobId, 'fenway/clip')
    expect(refused).toEqual({
      outcome: 'card-refused',
      missing: ['an approved subject', 'a safe public id'],
      live: false,
    })
    expect(both.storage.calls).toEqual([])
    expect(await both.db.select().from(videos)).toHaveLength(0)
  })

  it('refuses a missing finish time', async () => {
    const clip = await readyClip()
    await clip.db.update(job).set({ finishedAt: null }).where(eq(job.id, clip.jobId))
    expect(await publish(clip.studio, clip.jobId)).toEqual({
      outcome: 'card-refused',
      missing: ['a finish time'],
      live: false,
    })
    expect(clip.storage.calls).toEqual([])
    expect(await listed(clip.client)).toBe(0)
  })

  it('publishes when the card facts are present, including Frankenstein alone and a 64-character id', async () => {
    const fenway = await readyClip()
    expect(await publish(fenway.studio, fenway.jobId)).toMatchObject({ outcome: 'published', live: true })
    expect(await listed(fenway.client)).toBe(1)
    const subjects = await fenway.client.query<{ subjects: string[] }>('SELECT subjects FROM catalog.video')
    expect(subjects.rows[0]?.subjects).toEqual(['Fenway'])

    const frankenstein = await readyClip({ facts: false })
    await attachCardFacts(frankenstein.db, frankenstein.generationId, 'Frankenstein')
    expect(await publish(frankenstein.studio, frankenstein.jobId, 'frankenstein')).toMatchObject({
      outcome: 'published',
      live: true,
    })
    const named = await frankenstein.client.query<{ subjects: string[] }>('SELECT subjects FROM catalog.video')
    expect(named.rows[0]?.subjects).toEqual(['Frankenstein'])

    const longId = await readyClip()
    const id = 'a'.repeat(64)
    expect(await publish(longId.studio, longId.jobId, id)).toMatchObject({ outcome: 'published', live: true })
    const row = await longId.client.query<{ id: string }>('SELECT id FROM catalog.videos')
    expect(row.rows[0]?.id).toBe(id)
  })

  it('rejects an unsafe public id in the database', async () => {
    const { client, db } = await freshDatabase()
    clients.push(client)
    const clip = await seedClip(db)
    await db.insert(article50Answer).values({
      answer: 'recorded for the test',
      disclosure: 'the test disclosure',
      recordedOn: clip.when,
      recordedBy: 'the test',
      source: 'schema test',
    })
    const [thumb] = await db.insert(asset).values({
      role: 'thumbnail',
      sha256: 'thumb-for-check',
      mime: 'image/jpeg',
      bytes: 10,
      localPath: '/outside/thumb.jpg',
    }).returning()
    if (!thumb) throw new Error('thumbnail insert returned nothing')
    await expect(db.insert(videos).values({
      publicId: '-fenway',
      title: 'Fenway',
      position: 1,
      publishedAt: clip.when,
      jobId: clip.jobId,
      generationId: clip.generationId,
      videoAssetId: clip.videoAssetId,
      thumbnailAssetId: thumb.id,
      endpoint: 'minimax/h3-max-turbo/image-to-video',
      pinnedOn: '2026-10-05',
      prompt: 'a fictional cat',
      generatedAt: clip.when,
      attestationSummary: 'policy v1',
      fallbackStatus: 'merged',
    })).rejects.toSatisfy(throwsMatching(/videos_id_token/))
    expect(await db.select().from(videos)).toHaveLength(0)
  })
})
