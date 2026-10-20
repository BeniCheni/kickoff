import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { describe, expect, it } from 'vitest'
import { CHECKLIST_LINES, studioTables } from '../db/schema.ts'
import { openPglite } from '../db/pglite.ts'
import { createFakeEmbedder } from '../embed/fake.ts'
import { createStudio } from '../engine.ts'
import { createFalStub } from '../fal/stub.ts'
import { syntheticMp4 } from '../media/mp4.ts'
import { createStorageStub } from '../storage/stub.ts'
import { minimalJpeg } from './jpeg.ts'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const migrationsFolder = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../db/migrations')
const MAC_EPOCH_SECONDS = 2_082_844_800

type Place = 'absent' | 'public' | 'extensions' | 'extensions-without-vector' | 'narrow-search-path'

async function placeExtension(client: Awaited<ReturnType<typeof openPglite>>, place: Place) {
  if (place === 'public') await client.exec('CREATE EXTENSION vector')
  if (place === 'extensions' || place === 'narrow-search-path') {
    await client.exec('CREATE SCHEMA extensions')
    await client.exec('CREATE EXTENSION vector WITH SCHEMA extensions')
  }
  if (place === 'extensions-without-vector') await client.exec('CREATE SCHEMA extensions')
}

async function publishPair(place: Place) {
  const client = await openPglite()
  await placeExtension(client, place)
  const db = drizzle(client, { schema: studioTables })
  await migrate(db, { migrationsFolder })
  if (place === 'narrow-search-path') {
    await client.exec("SELECT set_config('search_path', 'pg_catalog, public', false)")
  }
  const mediaDir = mkdtempSync(path.join(tmpdir(), 'st4-place-'))
  const studio = createStudio({
    db,
    fal: createFalStub('queued-then-completed'),
    storage: createStorageStub().port,
    mediaDir,
    repoRoot,
    clock: () => new Date('2026-10-18T16:00:00.000Z'),
    embedder: createFakeEmbedder(),
  })
  const clears = CHECKLIST_LINES.map((line) => ({ line, answer: 'clear' as const, by: 'operator' }))
  const ids = ['place-a', 'place-b']
  for (const [index, publicId] of ids.entries()) {
    const imported = await studio.importClip({
      video: syntheticMp4({
        creationTime: Math.floor(Date.parse('2026-10-18T15:00:00.000Z') / 1000) + MAC_EPOCH_SECONDS + index + 3,
      }),
      keyframe: minimalJpeg,
      source: 'grok-imagine',
      prompt: `A cat ${publicId}`,
      subjects: ['Fenway'],
      title: publicId,
    })
    expect(imported.outcome).toBe('imported')
    if (imported.outcome !== 'imported') throw new Error('import did not keep a job')
    expect((await studio.keep(imported.jobId, clears)).outcome).toBe('kept')
    if (index === 0) {
      expect((await studio.recordGate({
        answer: 'recorded',
        disclosure: 'pending',
        recordedBy: 'the test',
        source: 'A-06',
      })).outcome).toBe('gate-recorded')
    }
    const published = await studio.publish({
      jobId: imported.jobId,
      publicId,
      title: publicId,
      position: index + 1,
    })
    expect(published).toMatchObject({ outcome: 'published', embedding: 'written' })
  }
  const schema = await client.query<{ nspname: string }>(`
    SELECT n.nspname
    FROM pg_extension e
    JOIN pg_namespace n ON n.oid = e.extnamespace
    WHERE e.extname = 'vector'
  `)
  await client.exec('SET ROLE studio_reader')
  const neighbours = await client.query<{ id: string }>("SELECT id FROM catalog.similar_moments('place-a', 6)")
  await client.exec('RESET ROLE')
  await client.close()
  return {
    schema: schema.rows[0]?.nspname,
    neighbours: neighbours.rows.map((row) => row.id),
  }
}

describe('vector placement', () => {
  it.each([
    ['absent', 'public'],
    ['public', 'public'],
    ['extensions', 'extensions'],
    ['extensions-without-vector', 'extensions'],
    ['narrow-search-path', 'extensions'],
  ] as const)('publishes through the engine when the extension is %s', async (place, schema) => {
    const result = await publishPair(place)
    expect(result.schema).toBe(schema)
    expect(result.neighbours).toEqual(['place-b'])
  })
})
