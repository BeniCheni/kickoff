import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { describe, expect, it } from 'vitest'
import { openPglite } from '../db/pglite.ts'
import {
  article50Answer,
  asset,
  generation,
  job,
  studioTables,
  videos,
} from '../db/schema.ts'
import { similarMomentRowSchema } from '@kickoff/catalog'
import { FAKE_DTYPE, FAKE_MODEL, FAKE_REVISION } from '../embed/fake.ts'
import { CLIP_DTYPE, CLIP_MODEL, CLIP_REVISION } from '../embed/model.ts'
import { seedClip } from './fixture.ts'
import { freshDatabase } from './harness.ts'

const migrationsFolder = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../db/migrations')

type Client = {
  query: <T>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>
  exec: (sql: string) => Promise<unknown>
}

type Database = Awaited<ReturnType<typeof freshDatabase>>['db']
type Clip = Awaited<ReturnType<typeof seedClip>>

function axis(index: number): string {
  const values = Array.from({ length: 512 }, (_, at) => (at === index ? '1' : '0'))
  return `[${values.join(',')}]`
}

async function rows<T>(client: Client, sql: string, params?: unknown[]) {
  const result = await client.query<T>(sql, params)
  return result.rows
}

async function migratePlacement(place: 'absent' | 'public' | 'extensions') {
  const client = await openPglite()
  if (place === 'public') await client.exec('CREATE EXTENSION vector')
  if (place === 'extensions') {
    await client.exec('CREATE SCHEMA extensions')
    await client.exec('CREATE EXTENSION vector WITH SCHEMA extensions')
  }
  const db = drizzle(client, { schema: studioTables })
  await migrate(db, { migrationsFolder })
  return client
}

async function extensionSchema(client: Client): Promise<string> {
  const found = await rows<{ nspname: string }>(client, `
    SELECT n.nspname
    FROM pg_extension e
    JOIN pg_namespace n ON n.oid = e.extnamespace
    WHERE e.extname = 'vector'
  `)
  const name = found[0]?.nspname
  if (!name) throw new Error('vector extension is missing')
  return name
}

async function publish(db: Database, clip: Clip, publicId: string, position: number, published: boolean) {
  const [gen] = await db.insert(generation).values({
    kind: 'video',
    modelId: clip.modelId,
    prompt: `prompt-${publicId}`,
    promptSha256: `prompt-${publicId}`,
    params: { duration: 15, resolution: '480P' },
    cacheKey: publicId,
    status: published ? 'downloaded' : 'withdrawn',
  }).returning()
  if (!gen) throw new Error('generation insert returned nothing')
  const [row] = await db.insert(job).values({
    generationId: gen.id,
    sessionId: clip.sessionId,
    attempt: 1,
    idempotencyKey: publicId,
    estimateUsd: '0.225000',
    status: published ? 'downloaded' : 'withdrawn',
    finishedAt: clip.when,
  }).returning()
  if (!row) throw new Error('job insert returned nothing')
  const [thumb] = await db.insert(asset).values({
    role: 'thumbnail',
    sha256: `thumb-${publicId}`,
    mime: 'image/jpeg',
    bytes: 10,
    localPath: `/outside/${publicId}.jpg`,
  }).returning()
  if (!thumb) throw new Error('thumbnail insert returned nothing')
  await db.insert(videos).values({
    publicId,
    title: publicId,
    position,
    publishedAt: published ? clip.when : null,
    unpublishedAt: published ? null : clip.when,
    jobId: row.id,
    generationId: gen.id,
    videoAssetId: clip.videoAssetId,
    thumbnailAssetId: thumb.id,
    endpoint: 'minimax/h3-max-turbo/image-to-video',
    pinnedOn: '2026-10-05',
    prompt: `prompt-${publicId}`,
    generatedAt: clip.when,
    attestationSummary: 'policy v1 · 5 of 5 clear',
    fallbackStatus: 'merged',
  })
  const [video] = await db.select().from(videos).where(eq(videos.publicId, publicId))
  if (!video) throw new Error(`missing video ${publicId}`)
  return video.id
}

async function embed(client: Client, videoId: string, kind: 'keyframe' | 'text', axisIndex: number, source: string) {
  await embedAs(client, videoId, kind, axisIndex, source, { model: 'test/clip', revision: 'rev', dtype: 'fp32' })
}

async function embedAs(
  client: Client,
  videoId: string,
  kind: 'keyframe' | 'text',
  axisIndex: number,
  source: string,
  identity: { model: string; revision: string; dtype: string },
) {
  await client.query(
    `INSERT INTO studio.clip_embeddings
      (video_id, kind, model_id, revision, dtype, dims, embedding, source_sha256)
     VALUES ($1::uuid, $2, $3, $4, $5, 512, $6::vector, $7)`,
    [videoId, kind, identity.model, identity.revision, identity.dtype, axis(axisIndex), source],
  )
}

function near(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThan(1e-9)
}

describe('migration 0005', () => {
  it.each(['absent', 'public', 'extensions'] as const)('applies when the extension is %s', async (place) => {
    const client = await migratePlacement(place)
    const schema = await extensionSchema(client)
    expect(schema).toBe(place === 'extensions' ? 'extensions' : 'public')
    const column = await rows<{ typ: string }>(client, `
      SELECT format_type(a.atttypid, a.atttypmod) AS typ
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'studio' AND c.relname = 'clip_embeddings' AND a.attname = 'embedding'
    `)
    expect(column[0]?.typ).toContain('vector(512)')
    expect(await rows(client, `SELECT id, score FROM catalog.similar_moments('missing', 4)`)).toEqual([])
    expect(await rows(client, `SELECT id, score FROM catalog.moments_like(ARRAY['missing'], 4)`)).toEqual([])
    const index = await rows<{ indexdef: string }>(client, `
      SELECT indexdef FROM pg_indexes
      WHERE schemaname = 'studio' AND indexname = 'clip_embeddings_keyframe_cosine'
    `)
    expect(index[0]?.indexdef).toContain('USING hnsw')
    expect(index[0]?.indexdef).toContain('vector_cosine_ops')
    expect(index[0]?.indexdef).toContain('keyframe')
  })

  it('keeps the functions stable, definer, and executable only by the reader', async () => {
    const { client } = await freshDatabase()
    const defs = await rows<{
      proname: string
      owner: string
      language: string
      volatile: string
      security: boolean
      config: string[] | null
    }>(client, `
      SELECT p.proname,
             r.rolname AS owner,
             l.lanname AS language,
             p.provolatile AS volatile,
             p.prosecdef AS security,
             p.proconfig AS config
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      JOIN pg_roles r ON r.oid = p.proowner
      JOIN pg_language l ON l.oid = p.prolang
      WHERE n.nspname = 'catalog'
        AND p.proname IN ('similar_moments', 'moments_like')
      ORDER BY p.proname
    `)
    const who = await rows<{ current_user: string }>(client, 'SELECT current_user')
    expect(defs).toHaveLength(2)
    for (const def of defs) {
      expect(def.owner).toBe(who[0]?.current_user)
      expect(def.language).toBe('sql')
      expect(def.volatile).toBe('s')
      expect(def.security).toBe(true)
      expect(def.config?.join(' ')).toContain('search_path=pg_catalog, public, extensions, catalog, studio, pg_temp')
    }
    const publicExecute = await rows<{ count: string }>(client, `
      SELECT count(*)::text AS count
      FROM information_schema.routine_privileges
      WHERE routine_schema = 'catalog'
        AND routine_name IN ('similar_moments', 'moments_like')
        AND grantee = 'PUBLIC'
    `)
    expect(publicExecute[0]?.count).toBe('0')
  })
})

describe('similarity functions', () => {
  async function world() {
    const opened = await freshDatabase()
    const clip = await seedClip(opened.db)
    await opened.db.insert(article50Answer).values({
      answer: 'recorded for the test',
      disclosure: 'the test disclosure',
      recordedOn: clip.when,
      recordedBy: 'the test',
      source: 'embeddings test',
    })
    const ids: Record<string, string> = {}
    const specs = [
      ['m-anchor', true],
      ['m-same', true],
      ['m-keyonly', true],
      ['m-blend', true],
      ['m-orth', true],
      ['m-notext', true],
      ['m-novec', true],
      ['m-withdrawn', false],
    ] as const
    for (const [publicId, published] of specs) {
      ids[publicId] = await publish(opened.db, clip, publicId, Object.keys(ids).length + 1, published)
    }
    await embed(opened.client, ids['m-anchor'] ?? '', 'keyframe', 0, 'anchor-kf')
    await embed(opened.client, ids['m-anchor'] ?? '', 'text', 0, 'anchor-tx')
    await embed(opened.client, ids['m-same'] ?? '', 'keyframe', 0, 'same-kf')
    await embed(opened.client, ids['m-same'] ?? '', 'text', 0, 'same-tx')
    await embed(opened.client, ids['m-keyonly'] ?? '', 'keyframe', 0, 'keyonly-kf')
    await embed(opened.client, ids['m-blend'] ?? '', 'keyframe', 0, 'blend-kf')
    await embed(opened.client, ids['m-blend'] ?? '', 'text', 1, 'blend-tx')
    await embed(opened.client, ids['m-orth'] ?? '', 'keyframe', 1, 'orth-kf')
    await embed(opened.client, ids['m-orth'] ?? '', 'text', 1, 'orth-tx')
    await embed(opened.client, ids['m-notext'] ?? '', 'keyframe', 0, 'notext-kf')
    await embed(opened.client, ids['m-withdrawn'] ?? '', 'keyframe', 0, 'withdrawn-kf')
    await embed(opened.client, ids['m-withdrawn'] ?? '', 'text', 0, 'withdrawn-tx')
    return opened
  }

  it('orders published neighbours and leaves out the query clip', async () => {
    const { client } = await world()
    const listed = await rows<{ id: string; score: number }>(client, `
      SELECT id, score FROM catalog.similar_moments('m-anchor', 6)
    `)
    expect(listed.map((row) => row.id)).toEqual(['m-keyonly', 'm-notext', 'm-same', 'm-blend', 'm-orth'])
    expect(listed.map((row) => Object.keys(row))).toEqual(listed.map(() => ['id', 'score']))
    for (const row of listed) {
      expect(typeof row.score).toBe('number')
      expect(similarMomentRowSchema.parse(row)).toEqual({ id: row.id, score: row.score })
    }
    near(listed[0]?.score ?? NaN, 1)
    near(listed[1]?.score ?? NaN, 1)
    near(listed[2]?.score ?? NaN, 1)
    near(listed[3]?.score ?? NaN, 0.7)
    near(listed[4]?.score ?? NaN, 0)
    expect(listed.some((row) => row.id === 'm-anchor' || row.id === 'm-withdrawn' || row.id === 'm-novec')).toBe(false)

    const textless = await rows<{ id: string; score: number }>(client, `
      SELECT id, score FROM catalog.similar_moments('m-notext', 6)
    `)
    expect(textless.map((row) => row.id)).toEqual(['m-anchor', 'm-blend', 'm-keyonly', 'm-same', 'm-orth'])
    for (const row of textless.slice(0, 4)) near(row.score, 1)
    near(textless[4]?.score ?? NaN, 0)

    const limited = await rows<{ id: string }>(client, `SELECT id FROM catalog.similar_moments('m-anchor', 2)`)
    expect(limited.map((row) => row.id)).toEqual(['m-keyonly', 'm-notext'])
    for (const call of [
      `SELECT id FROM catalog.similar_moments('m-anchor', 0)`,
      `SELECT id FROM catalog.similar_moments('m-anchor', -3)`,
      `SELECT id FROM catalog.similar_moments('m-anchor', NULL)`,
      `SELECT id FROM catalog.similar_moments('missing', 6)`,
      `SELECT id FROM catalog.similar_moments('m-withdrawn', 6)`,
      `SELECT id FROM catalog.similar_moments('m-novec', 6)`,
    ]) {
      expect(await rows(client, call), call).toEqual([])
    }
  })

  it('never returns a fake-model row for a CLIP anchor', async () => {
    const opened = await freshDatabase()
    const clip = await seedClip(opened.db)
    await opened.db.insert(article50Answer).values({
      answer: 'recorded for the test',
      disclosure: 'the test disclosure',
      recordedOn: clip.when,
      recordedBy: 'the test',
      source: 'embeddings test',
    })
    const anchor = await publish(opened.db, clip, 'clip-anchor', 1, true)
    const neighbour = await publish(opened.db, clip, 'clip-neighbour', 2, true)
    const fake = await publish(opened.db, clip, 'fake-neighbour', 3, true)
    const clipIdentity = { model: CLIP_MODEL, revision: CLIP_REVISION, dtype: CLIP_DTYPE }
    const fakeIdentity = { model: FAKE_MODEL, revision: FAKE_REVISION, dtype: FAKE_DTYPE }
    await embedAs(opened.client, anchor, 'keyframe', 0, 'anchor', clipIdentity)
    await embedAs(opened.client, neighbour, 'keyframe', 1, 'neighbour', clipIdentity)
    await embedAs(opened.client, fake, 'keyframe', 0, 'fake', fakeIdentity)
    const listed = await rows<{ id: string }>(opened.client, `SELECT id FROM catalog.similar_moments('clip-anchor', 12)`)
    expect(listed.map((row) => row.id)).toEqual(['clip-neighbour'])
    const stored = await rows<{ model_id: string }>(opened.client, `
      SELECT DISTINCT model_id FROM studio.clip_embeddings ORDER BY model_id
    `)
    expect(stored.map((row) => row.model_id)).toEqual([CLIP_MODEL, FAKE_MODEL])
  })

  it('averages the usable inputs and ignores the rest', async () => {
    const { client } = await world()
    const liked = await rows<{ id: string; score: number }>(client, `
      SELECT id, score FROM catalog.moments_like(ARRAY['m-anchor', 'm-anchor', 'nope', 'm-same'], 6)
    `)
    expect(liked.map((row) => row.id)).toEqual(['m-keyonly', 'm-notext', 'm-blend', 'm-orth'])
    near(liked[0]?.score ?? NaN, 1)
    near(liked[1]?.score ?? NaN, 1)
    near(liked[2]?.score ?? NaN, 0.7)
    near(liked[3]?.score ?? NaN, 0)

    const early = Array.from({ length: 49 }, (_, index) => `missing-${index}`)
    const window = await rows<{ id: string }>(client, `
      SELECT id FROM catalog.moments_like($1::text[], 12)
    `, [[...early, 'm-anchor', 'm-same']])
    expect(window.map((row) => row.id)).toContain('m-same')
    expect(window.map((row) => row.id)).not.toContain('m-anchor')

    for (const call of [
      `SELECT id FROM catalog.moments_like(ARRAY['nope', 'm-withdrawn', 'm-novec'], 6)`,
      `SELECT id FROM catalog.moments_like(ARRAY[]::text[], 6)`,
      `SELECT id FROM catalog.moments_like(NULL, 6)`,
      `SELECT id FROM catalog.moments_like(ARRAY['m-anchor'], NULL)`,
      `SELECT id FROM catalog.moments_like(ARRAY['m-anchor'], 0)`,
    ]) {
      expect(await rows(client, call), call).toEqual([])
    }
  })

  it('returns at most 12 rows', async () => {
    const opened = await freshDatabase()
    const clip = await seedClip(opened.db)
    await opened.db.insert(article50Answer).values({
      answer: 'recorded for the test',
      disclosure: 'the test disclosure',
      recordedOn: clip.when,
      recordedBy: 'the test',
      source: 'embeddings test',
    })
    const anchor = await publish(opened.db, clip, 'c-anchor', 1, true)
    await embed(opened.client, anchor, 'keyframe', 0, 'anchor')
    await embed(opened.client, anchor, 'text', 0, 'anchor-text')
    for (let index = 0; index < 13; index += 1) {
      const publicId = `c${String(index).padStart(2, '0')}`
      const id = await publish(opened.db, clip, publicId, index + 2, true)
      await embed(opened.client, id, 'keyframe', 0, publicId)
      await embed(opened.client, id, 'text', 0, `${publicId}-text`)
    }
    const capped = await rows<{ id: string }>(opened.client, `
      SELECT id FROM catalog.similar_moments('c-anchor', 100)
    `)
    expect(capped).toHaveLength(12)
    expect(capped.map((row) => row.id)).not.toContain('c12')
    expect(capped.map((row) => row.id)).not.toContain('c-anchor')
    const liked = await rows<{ id: string }>(opened.client, `
      SELECT id FROM catalog.moments_like(ARRAY['c-anchor'], 100)
    `)
    expect(liked).toHaveLength(12)
    expect(liked.map((row) => row.id)).not.toContain('c12')
  })

  it('lets the reader call both functions and not read the vectors', async () => {
    const { client } = await world()
    await client.exec('SET ROLE studio_reader')
    const listed = await rows<{ id: string }>(client, `SELECT id FROM catalog.similar_moments('m-anchor', 3)`)
    expect(listed.map((row) => row.id)).toEqual(['m-keyonly', 'm-notext', 'm-same'])
    const liked = await rows<{ id: string }>(client, `
      SELECT id FROM catalog.moments_like(ARRAY['m-anchor'], 2)
    `)
    expect(liked.map((row) => row.id)).toEqual(['m-keyonly', 'm-notext'])
    await expect(client.query('SELECT embedding FROM studio.clip_embeddings')).rejects.toThrow(/permission denied/i)
    await client.exec('RESET ROLE')
  })

  it('records the plan without requiring the HNSW index to be chosen', async () => {
    const { client } = await world()
    const plan = await rows<{ 'QUERY PLAN': string }>(client, `
      EXPLAIN SELECT c.public_id
      FROM studio.videos c
      JOIN studio.clip_embeddings e ON e.video_id = c.id AND e.kind = 'keyframe'
      ORDER BY e.embedding <=> (SELECT embedding FROM studio.clip_embeddings WHERE kind = 'keyframe' LIMIT 1)
      LIMIT 5
    `)
    const text = plan.map((row) => row['QUERY PLAN']).join('\n')
    expect(text.length).toBeGreaterThan(0)
    expect(text).toMatch(/Scan/)
    const fn = await rows<{ 'QUERY PLAN': string }>(client, `
      EXPLAIN SELECT * FROM catalog.similar_moments('m-anchor', 6)
    `)
    const fnText = fn.map((row) => row['QUERY PLAN']).join('\n')
    expect(fnText.length).toBeGreaterThan(0)
  })
})
