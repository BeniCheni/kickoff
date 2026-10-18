import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { eq } from 'drizzle-orm'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { describe, expect, it } from 'vitest'
import { article50NonblankSql, BLANK_CODE_POINTS } from '../answer.ts'
import {
  article50Answer,
  asset,
  event,
  generation,
  generationInput,
  generationSubject,
  job,
  ledger,
  policyCheck,
  subject,
  videos,
} from '../db/schema.ts'
import { publishedDetailColumns, publishedListColumns } from '../db/public-columns.ts'
import { markKept, seedClip } from './fixture.ts'
import { freshDatabase, throwsMatching } from './harness.ts'

const migrationsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../db/migrations')

async function rows<T>(client: { query: (sql: string) => Promise<{ rows: T[] }> }, sql: string) {
  const result = await client.query(sql)
  return result.rows
}

type Database = Awaited<ReturnType<typeof freshDatabase>>['db']
type Clip = Awaited<ReturnType<typeof seedClip>>

function iso(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const date = value instanceof Date ? value : new Date(String(value))
  if (Number.isNaN(date.getTime())) throw new Error(`not an instant: ${String(value)}`)
  return date.toISOString()
}

async function liveClip(db: Database, clip: Clip, spec: {
  publicId: string
  title: string
  position: number
  prompt: string
  subjectIds?: string[]
  keptAt?: Date[]
  attestedAt?: Date
  thumbnailSha: string
  linkFirst: boolean
}) {
  const [gen] = await db.insert(generation).values({
    kind: 'video',
    modelId: clip.modelId,
    prompt: spec.prompt,
    promptSha256: `prompt-${spec.publicId}`,
    params: { duration: 15, resolution: '480P' },
    cacheKey: spec.publicId,
    status: 'downloaded',
  }).returning()
  if (!gen) throw new Error('generation insert returned nothing')
  const [row] = await db.insert(job).values({
    generationId: gen.id,
    sessionId: clip.sessionId,
    attempt: 1,
    idempotencyKey: spec.publicId,
    estimateUsd: '0.225000',
    status: 'downloaded',
    finishedAt: clip.when,
  }).returning()
  if (!row) throw new Error('job insert returned nothing')
  const [thumb] = await db.insert(asset).values({
    role: 'thumbnail',
    sha256: spec.thumbnailSha,
    mime: 'image/jpeg',
    bytes: 10,
    localPath: `/outside/${spec.publicId}.jpg`,
  }).returning()
  if (!thumb) throw new Error('thumbnail insert returned nothing')
  if (spec.linkFirst) {
    await db.insert(generationInput).values({ generationId: gen.id, assetId: clip.k0Id, role: 'first' })
  }
  for (const subjectId of spec.subjectIds ?? []) {
    await db.insert(generationSubject).values({ generationId: gen.id, subjectId })
  }
  for (const at of spec.keptAt ?? []) {
    await db.insert(event).values({ jobId: row.id, at, type: 'kept' })
  }
  if (spec.attestedAt) {
    await db.insert(policyCheck).values({
      generationId: gen.id,
      policyVersion: 'v1',
      fictionalOnly: true,
      noRealMarks: true,
      attestedAt: spec.attestedAt,
      attestedBy: 'operator',
    })
  }
  await db.insert(videos).values({
    publicId: spec.publicId,
    title: spec.title,
    position: spec.position,
    publishedAt: clip.when,
    jobId: row.id,
    generationId: gen.id,
    videoAssetId: clip.videoAssetId,
    thumbnailAssetId: thumb.id,
    endpoint: 'minimax/h3-max-turbo/image-to-video',
    pinnedOn: '2026-10-05',
    prompt: spec.prompt,
    generatedAt: clip.when,
    attestationSummary: 'policy v1 · 5 of 5 clear',
    fallbackStatus: 'merged',
  })
  return row.id
}

describe('migrations on a fresh database', () => {
  it('applies the committed SQL from scratch', async () => {
    const { client } = await freshDatabase()
    const tables = await rows<{ relname: string }>(client, `
      SELECT c.relname
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'studio' AND c.relkind = 'r'
      ORDER BY 1
    `)
    expect(tables.map((row) => row.relname)).toEqual([
      'article50_answer',
      'asset',
      'balance_entry',
      'event',
      'generation',
      'generation_input',
      'generation_parent',
      'generation_subject',
      'job',
      'ledger',
      'model',
      'policy_answer',
      'policy_check',
      'session',
      'subject',
      'videos',
    ])
  })

  it('applies 0000 through 0003 and a second migrate is a no-op', async () => {
    const { client, db } = await freshDatabase()
    const before = await rows<{ count: number }>(client, `
      SELECT count(*)::int AS count FROM drizzle.__drizzle_migrations
    `)
    expect(before[0]?.count).toBe(4)
    const gate = readFileSync(path.join(migrationsDir, '0003_card_gate.sql'), 'utf8')
    expect(gate).toContain('videos_id_token')
    expect(gate).not.toMatch(/create\s+(or\s+replace\s+)?view/i)
    expect(gate).not.toMatch(/drop\s+view/i)
    expect(gate).not.toMatch(/alter\s+view/i)
    await migrate(db, { migrationsFolder: migrationsDir })
    const after = await rows<{ count: number }>(client, `
      SELECT count(*)::int AS count FROM drizzle.__drizzle_migrations
    `)
    expect(after).toEqual(before)
  })

  it('carries no connection string and no password', () => {
    const sqlFiles = readdirSync(migrationsDir).filter((name) => name.endsWith('.sql'))
    expect(sqlFiles.length).toBeGreaterThan(0)
    for (const name of sqlFiles) {
      const sql = readFileSync(path.join(migrationsDir, name), 'utf8')
      expect(sql).not.toMatch(/postgres(?:ql)?:\/\//i)
      expect(sql.toLowerCase()).not.toContain('password')
    }
  })
})

describe('Data API control', () => {
  it('keeps every table out of the exposed schemas, with row-level security and no policies', async () => {
    const { client } = await freshDatabase()
    const tables = await rows<{ nspname: string; relname: string; relrowsecurity: boolean }>(client, `
      SELECT n.nspname, c.relname, c.relrowsecurity
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'r'
        AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'drizzle')
      ORDER BY 1, 2
    `)
    expect(tables.length).toBeGreaterThan(0)
    for (const table of tables) {
      expect(table.nspname).toBe('studio')
      expect(table.relrowsecurity).toBe(true)
    }
    const exposed = await rows<{ count: string }>(client, `
      SELECT count(*)::text AS count
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'r' AND n.nspname IN ('public', 'graphql_public')
    `)
    expect(exposed[0]?.count).toBe('0')
    const policies = await rows<{ count: string }>(client, `
      SELECT count(*)::text AS count
      FROM pg_policy pol
      JOIN pg_class c ON c.oid = pol.polrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'studio'
    `)
    expect(policies[0]?.count).toBe('0')
  })
})

describe('read-only catalog role', () => {
  it('reads only published public columns and cannot read or write the Studio tables', async () => {
    const { client, db } = await freshDatabase()
    const clip = await seedClip(db)
    await markKept(db, clip.generationId, clip.jobId)
    await db.insert(article50Answer).values({
      answer: 'recorded for the test',
      disclosure: 'the test disclosure',
      recordedOn: clip.when,
      recordedBy: 'the test',
      source: 'schema test',
    })
    await db.insert(videos).values({
      publicId: 'fenway-strike',
      title: 'Fenway',
      editorialNote: 'A fictional strike',
      position: 1,
      publishedAt: clip.when,
      jobId: clip.jobId,
      generationId: clip.generationId,
      videoAssetId: clip.videoAssetId,
      thumbnailAssetId: clip.thumbnailId,
      endpoint: 'minimax/h3-max-turbo/image-to-video',
      pinnedOn: '2026-10-05',
      prompt: 'the published prompt',
      promptExpansion: null,
      seed: '20261004',
      generatedAt: clip.when,
      attestationSummary: 'policy v1 · 5 of 5 clear',
      fallbackStatus: 'merged',
    })
    const [withdrawnJob] = await db.insert(job).values({
      generationId: clip.generationId,
      sessionId: clip.sessionId,
      attempt: 2,
      idempotencyKey: 'idem-withdrawn',
      estimateUsd: '0.225000',
      status: 'withdrawn',
      finishedAt: clip.when,
    }).returning()
    if (!withdrawnJob) throw new Error('withdrawn job insert returned nothing')
    await db.insert(videos).values({
      publicId: 'withdrawn-clip',
      title: 'Withdrawn',
      position: 2,
      publishedAt: null,
      unpublishedAt: clip.when,
      jobId: withdrawnJob.id,
      generationId: clip.generationId,
      videoAssetId: clip.videoAssetId,
      thumbnailAssetId: clip.thumbnailId,
      endpoint: 'minimax/h3-max-turbo/image-to-video',
      pinnedOn: '2026-10-05',
      prompt: 'should not be listed',
      generatedAt: clip.when,
      attestationSummary: 'policy v1 · 5 of 5 clear',
      fallbackStatus: 'merged',
    })

    await client.exec('SET ROLE studio_reader')
    const listed = await rows<Record<string, unknown>>(client, 'SELECT * FROM catalog.videos')
    expect(listed).toHaveLength(1)
    expect(Object.keys(listed[0] ?? {})).toEqual([...publishedListColumns])
    expect(listed[0]?.id).toBe('fenway-strike')
    expect(JSON.stringify(listed)).not.toContain('draft-prompt-secret')
    expect(JSON.stringify(listed)).not.toContain('photo-hash-private')

    const detail = await rows<Record<string, unknown>>(client, `SELECT * FROM catalog.video`)
    expect(Object.keys(detail[0] ?? {})).toEqual([...publishedDetailColumns])
    expect(detail[0]?.prompt).toBe('the published prompt')
    expect(detail[0]?.id).toBe('fenway-strike')
    expect(listed[0]?.id).toBe('fenway-strike')
    const published = JSON.stringify(listed) + JSON.stringify(detail)
    expect(published).not.toContain('draft-prompt-secret')
    expect(published).not.toContain(clip.jobId)
    expect(published).not.toContain(withdrawnJob.id)
    expect(published).not.toContain(clip.videoAssetId)
    expect(published).not.toContain(clip.thumbnailId)
    expect(published).not.toContain(clip.generationId)

    await expect(client.query('SELECT prompt FROM studio.generation')).rejects.toThrow(/permission denied/i)
    await expect(client.query('SELECT amount_usd FROM studio.ledger')).rejects.toThrow(/permission denied/i)
    await expect(client.query('SELECT sha256 FROM studio.asset')).rejects.toThrow(/permission denied/i)
    await expect(client.query(`INSERT INTO studio.subject (name) VALUES ('nope')`)).rejects.toThrow(/permission denied/i)
    await expect(client.query(`UPDATE catalog.videos SET title = 'changed'`)).rejects.toThrow(/permission denied|cannot update/i)
    await expect(client.query(`DELETE FROM catalog.video WHERE id = 'fenway-strike'`)).rejects.toThrow(/permission denied|cannot delete/i)
    await client.exec('RESET ROLE')
  })

  it('projects only the 0002 columns and grants the reader nothing else', async () => {
    const { client, db } = await freshDatabase()
    const clip = await seedClip(db)
    await db.insert(article50Answer).values({
      answer: 'recorded for the test',
      disclosure: 'the test disclosure',
      recordedOn: clip.when,
      recordedBy: 'the test',
      source: 'schema test',
    })
    const [fenway] = await db.insert(subject).values({
      name: 'Fenway',
      description: 'secret-description-not-public',
      triggerWord: 'private-fenway-token',
    }).returning()
    const [frankenstein] = await db.insert(subject).values({
      name: 'Frankenstein',
      triggerWord: 'private-frankenstein-token',
    }).returning()
    const [other] = await db.insert(subject).values({
      name: 'Other',
      triggerWord: 'private-other-token',
    }).returning()
    if (!fenway || !frankenstein || !other) throw new Error('subject insert returned nothing')

    const keptOnce = new Date('2020-05-05T05:05:05.000Z')
    const attestedOnly = new Date('1999-01-01T00:00:00.000Z')
    const keptTwiceA = new Date('2019-01-01T00:00:00.000Z')
    const keptTwiceB = new Date('2019-06-01T00:00:00.000Z')

    await liveClip(db, clip, {
      publicId: 'linked-fenway',
      title: 'A linked cat',
      position: 1,
      prompt: 'prompt-linked-fenway',
      subjectIds: [fenway.id],
      keptAt: [keptOnce],
      attestedAt: clip.when,
      thumbnailSha: 'k0-hash',
      linkFirst: true,
    })
    await liveClip(db, clip, {
      publicId: 'linked-other',
      title: 'Some other subject',
      position: 2,
      prompt: 'prompt-linked-other',
      subjectIds: [other.id],
      attestedAt: attestedOnly,
      thumbnailSha: 'not-the-keyframe',
      linkFirst: true,
    })
    await liveClip(db, clip, {
      publicId: 'title-only',
      title: 'Fenway',
      position: 3,
      prompt: 'prompt-title-only',
      keptAt: [keptTwiceA, keptTwiceB],
      thumbnailSha: 'k0-hash',
      linkFirst: false,
    })
    await liveClip(db, clip, {
      publicId: 'both-cats',
      title: 'Both',
      position: 4,
      prompt: 'prompt-both-cats',
      subjectIds: [frankenstein.id, fenway.id],
      thumbnailSha: 'k0-hash',
      linkFirst: true,
    })
    const [withdrawnGen] = await db.insert(generation).values({
      kind: 'video',
      modelId: clip.modelId,
      prompt: 'withdrawn-generation-prompt',
      promptSha256: 'prompt-withdrawn',
      params: { duration: 15, resolution: '480P' },
      cacheKey: 'withdrawn-row',
      status: 'withdrawn',
    }).returning()
    if (!withdrawnGen) throw new Error('withdrawn generation insert returned nothing')
    const [withdrawnJob] = await db.insert(job).values({
      generationId: withdrawnGen.id,
      sessionId: clip.sessionId,
      attempt: 1,
      idempotencyKey: 'withdrawn-row',
      estimateUsd: '0.225000',
      status: 'withdrawn',
      finishedAt: clip.when,
    }).returning()
    if (!withdrawnJob) throw new Error('withdrawn job insert returned nothing')
    await db.insert(videos).values({
      publicId: 'withdrawn-secret-id',
      title: 'Withdrawn',
      position: 5,
      publishedAt: null,
      unpublishedAt: clip.when,
      jobId: withdrawnJob.id,
      generationId: withdrawnGen.id,
      videoAssetId: clip.videoAssetId,
      thumbnailAssetId: clip.thumbnailId,
      endpoint: 'minimax/h3-max-turbo/image-to-video',
      pinnedOn: '2026-10-05',
      prompt: 'withdrawn-prompt-secret',
      generatedAt: clip.when,
      attestationSummary: 'policy v1 · 5 of 5 clear',
      fallbackStatus: 'merged',
    })

    const types = await rows<{ relname: string; attname: string; typ: string }>(client, `
      SELECT c.relname, a.attname, format_type(a.atttypid, a.atttypmod) AS typ
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'catalog' AND c.relkind = 'v' AND a.attnum > 0 AND NOT a.attisdropped
      ORDER BY c.relname, a.attnum
    `)
    const typed = (relname: string) => types.filter((row) => row.relname === relname).map((row) => `${row.attname} ${row.typ}`)
    expect(typed('videos')).toEqual([
      'id text',
      'title text',
      'position integer',
      'published_at timestamp with time zone',
      'thumbnail_bucket text',
      'thumbnail_object_path text',
      'mime text',
      'width integer',
      'height integer',
      'duration_s numeric(12,3)',
      'generated_at timestamp with time zone',
      'editorial_note text',
      'subjects text[]',
    ])
    expect(typed('video')).toEqual([
      'id text',
      'title text',
      'editorial_note text',
      'position integer',
      'published_at timestamp with time zone',
      'endpoint text',
      'pinned_on text',
      'prompt text',
      'prompt_expansion text',
      'seed text',
      'parent text',
      'generated_at timestamp with time zone',
      'attestation_summary text',
      'video_bucket text',
      'video_object_path text',
      'sha256 text',
      'mime text',
      'bytes integer',
      'width integer',
      'height integer',
      'duration_s numeric(12,3)',
      'thumbnail_bucket text',
      'thumbnail_object_path text',
      'subjects text[]',
      'kept_at timestamp with time zone',
      'thumbnail_mime text',
      'thumbnail_is_keyframe boolean',
    ])

    await client.exec('SET ROLE studio_reader')
    const grants = await rows<{ table_schema: string; table_name: string; privilege_type: string }>(client, `
      SELECT table_schema, table_name, privilege_type
      FROM information_schema.role_table_grants
      WHERE grantee = 'studio_reader'
      ORDER BY table_name, privilege_type
    `)
    expect(grants).toEqual([
      { table_schema: 'catalog', table_name: 'video', privilege_type: 'SELECT' },
      { table_schema: 'catalog', table_name: 'videos', privilege_type: 'SELECT' },
    ])
    const schemaPrivileges = await rows<{
      studio_usage: boolean
      studio_create: boolean
      catalog_usage: boolean
      catalog_create: boolean
    }>(client, `
      SELECT
        has_schema_privilege('studio_reader', 'studio', 'USAGE') AS studio_usage,
        has_schema_privilege('studio_reader', 'studio', 'CREATE') AS studio_create,
        has_schema_privilege('studio_reader', 'catalog', 'USAGE') AS catalog_usage,
        has_schema_privilege('studio_reader', 'catalog', 'CREATE') AS catalog_create
    `)
    expect(schemaPrivileges).toEqual([{
      studio_usage: false,
      studio_create: false,
      catalog_usage: true,
      catalog_create: false,
    }])
    const options = await rows<{ relname: string; reloptions: string[] | null }>(client, `
      SELECT c.relname, c.reloptions
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'catalog' AND c.relkind = 'v'
      ORDER BY 1
    `)
    expect(options.map((row) => row.relname)).toEqual(['video', 'videos'])
    for (const row of options) {
      expect(row.reloptions).toEqual(['security_invoker=false'])
      expect(row.reloptions?.join(' ')).not.toMatch(/security_invoker=true/i)
    }

    const listed = await rows<Record<string, unknown>>(client, 'SELECT * FROM catalog.videos ORDER BY id')
    const detail = await rows<Record<string, unknown>>(client, 'SELECT * FROM catalog.video ORDER BY id')
    expect(listed.map((row) => row.id)).toEqual(['both-cats', 'linked-fenway', 'linked-other', 'title-only'])
    expect(detail.map((row) => row.id)).toEqual(listed.map((row) => row.id))
    for (const row of listed) expect(Object.keys(row)).toEqual([...publishedListColumns])
    for (const row of detail) expect(Object.keys(row)).toEqual([...publishedDetailColumns])

    const detailById = new Map(detail.map((row) => [row.id, row]))
    const fenwayRow = detailById.get('linked-fenway')
    const otherRow = detailById.get('linked-other')
    const titleRow = detailById.get('title-only')
    const bothRow = detailById.get('both-cats')
    expect(fenwayRow?.subjects).toEqual(['Fenway'])
    expect(otherRow?.subjects).toEqual([])
    expect(titleRow?.subjects).toEqual([])
    expect(titleRow?.title).toBe('Fenway')
    expect(bothRow?.subjects).toEqual(['Fenway', 'Frankenstein'])
    expect(iso(fenwayRow?.kept_at)).toBe(keptOnce.toISOString())
    expect(iso(otherRow?.kept_at)).toBeNull()
    expect(iso(titleRow?.kept_at)).toBeNull()
    expect(fenwayRow?.thumbnail_is_keyframe).toBe(true)
    expect(otherRow?.thumbnail_is_keyframe).toBe(false)
    expect(titleRow?.thumbnail_is_keyframe).toBeNull()

    const published = JSON.stringify(listed) + JSON.stringify(detail)
    for (const secret of [
      'private-fenway-token',
      'private-frankenstein-token',
      'private-other-token',
      'secret-description-not-public',
      'withdrawn-secret-id',
      'withdrawn-prompt-secret',
      withdrawnJob.id,
      '1999-01-01',
    ]) {
      expect(published, secret).not.toContain(secret)
    }

    for (const sql of [
      'SELECT id FROM studio.videos',
      'SELECT sha256 FROM studio.asset',
      'SELECT prompt FROM studio.generation',
      'SELECT name FROM studio.subject',
      'SELECT subject_id FROM studio.generation_subject',
      'SELECT type FROM studio.event',
      'SELECT status FROM studio.job',
      'SELECT amount_usd FROM studio.ledger',
      `INSERT INTO catalog.videos (id) VALUES ('nope')`,
      `INSERT INTO catalog.video (id) VALUES ('nope')`,
      `UPDATE catalog.videos SET title = 'changed'`,
      `UPDATE catalog.video SET title = 'changed'`,
      `DELETE FROM catalog.videos WHERE id = 'linked-fenway'`,
      `DELETE FROM catalog.video WHERE id = 'linked-fenway'`,
      'CREATE TABLE studio.reader_denied (id int)',
      'CREATE TABLE catalog.reader_denied (id int)',
      'ALTER TABLE studio.videos ADD COLUMN reader_denied int',
      'ALTER TABLE catalog.videos ADD COLUMN reader_denied int',
      'DROP TABLE studio.videos',
      'DROP VIEW catalog.videos',
      'TRUNCATE studio.videos',
      'TRUNCATE catalog.videos',
    ]) {
      try {
        await client.query(sql)
        throw new Error(`studio_reader was allowed to run: ${sql}`)
      } catch (error) {
        const text = error instanceof Error ? error.message : String(error)
        expect(text, sql).toMatch(/permission denied|must be owner|cannot insert|cannot update|cannot delete|cannot truncate|is not a table/i)
      }
    }
    await client.exec('RESET ROLE')
  })
})

describe('publication gate', () => {
  it('refuses a published row until an Article 50 answer is recorded, then accepts one', async () => {
    const { db } = await freshDatabase()
    const clip = await seedClip(db)
    await markKept(db, clip.generationId, clip.jobId)
    const row = {
      publicId: 'fenway-strike',
      title: 'Fenway',
      position: 1,
      publishedAt: clip.when,
      jobId: clip.jobId,
      generationId: clip.generationId,
      videoAssetId: clip.videoAssetId,
      thumbnailAssetId: clip.thumbnailId,
      endpoint: 'minimax/h3-max-turbo/image-to-video',
      pinnedOn: '2026-10-05',
      prompt: 'the published prompt',
      generatedAt: clip.when,
      attestationSummary: 'policy v1 · 5 of 5 clear',
      fallbackStatus: 'pending' as const,
    }
    await expect(db.insert(article50Answer).values({
      answer: '   ',
      disclosure: 'blank',
      recordedOn: clip.when,
      recordedBy: 'the test',
      source: 'schema test',
    })).rejects.toThrow()
    await expect(db.insert(videos).values(row)).rejects.toSatisfy(throwsMatching(/Article 50/))
    await db.insert(article50Answer).values({
      answer: 'recorded for the test',
      disclosure: 'the test disclosure',
      recordedOn: clip.when,
      recordedBy: 'the test',
      source: 'schema test',
    })
    await expect(db.insert(article50Answer).values({
      answer: 'a second answer',
      disclosure: 'no',
      recordedOn: clip.when,
      recordedBy: 'the test',
      source: 'schema test',
    })).rejects.toThrow()
    const [published] = await db.insert(videos).values(row).returning()
    expect(published?.publicId).toBe('fenway-strike')
    await db.update(job).set({ status: 'published' }).where(eq(job.id, clip.jobId))
    await db.update(videos).set({ publishedAt: null, unpublishedAt: clip.when }).where(eq(videos.id, published!.id))
    await db.update(job).set({ status: 'withdrawn' }).where(eq(job.id, clip.jobId))
    await expect(db.update(videos).set({ publishedAt: clip.when, unpublishedAt: null }).where(eq(videos.id, published!.id)))
      .rejects.toSatisfy(throwsMatching(/not relisted/))
    await expect(db.update(job).set({ status: 'published' }).where(eq(job.id, clip.jobId)))
      .rejects.toSatisfy(throwsMatching(/not relisted/))
  })

  it('refuses every blank code point and keeps publication blocked', async () => {
    const { db, client } = await freshDatabase()
    const clip = await seedClip(db)
    await markKept(db, clip.generationId, clip.jobId)
    const row = {
      publicId: 'fenway-strike',
      title: 'Fenway',
      position: 1,
      publishedAt: clip.when,
      jobId: clip.jobId,
      generationId: clip.generationId,
      videoAssetId: clip.videoAssetId,
      thumbnailAssetId: clip.thumbnailId,
      endpoint: 'minimax/h3-max-turbo/image-to-video',
      pinnedOn: '2026-10-05',
      prompt: 'the published prompt',
      generatedAt: clip.when,
      attestationSummary: 'policy v1 · 5 of 5 clear',
      fallbackStatus: 'pending' as const,
    }
    async function refuse(literal: string, name: string) {
      const insert = client.query(`
        INSERT INTO studio.article50_answer (answer, disclosure, recorded_on, recorded_by, source)
        VALUES (${literal}, 'blank', timestamptz '2026-10-12 16:00:00+00', 'the test', 'schema test')
      `)
      await expect(insert, name).rejects.toThrow()
      const answers = await client.query('SELECT count(*)::int AS count FROM studio.article50_answer')
      expect(answers.rows[0], name).toEqual({ count: 0 })
      await expect(db.insert(videos).values(row), name).rejects.toSatisfy(throwsMatching(/Article 50/))
      const listed = await client.query('SELECT id FROM catalog.videos')
      expect(listed.rows, name).toEqual([])
    }
    for (const code of BLANK_CODE_POINTS) {
      await refuse(`chr(${code})`, `U+${code.toString(16).toUpperCase()}`)
    }
    await refuse(BLANK_CODE_POINTS.map((code) => `chr(${code})`).join(' || '), 'mix')
    await client.query(`
      INSERT INTO studio.article50_answer (answer, disclosure, recorded_on, recorded_by, source)
      VALUES (chr(${BLANK_CODE_POINTS[0]}) || 'visible' || chr(${BLANK_CODE_POINTS[BLANK_CODE_POINTS.length - 1]}), 'shown', timestamptz '2026-10-12 16:00:00+00', 'the test', 'schema test')
    `)
    const [published] = await db.insert(videos).values(row).returning()
    expect(published?.publicId).toBe('fenway-strike')
    const expression = article50NonblankSql()
    const migration = readFileSync(path.join(migrationsDir, '0000_studio_tables.sql'), 'utf8')
    const schemaSource = readFileSync(path.resolve(migrationsDir, '../schema.ts'), 'utf8')
    expect(migration).toContain(expression)
    expect(schemaSource).toContain(expression)
  })

  it('refuses a second catalog row for a withdrawn job', async () => {
    const { db } = await freshDatabase()
    const clip = await seedClip(db)
    await markKept(db, clip.generationId, clip.jobId)
    await db.insert(article50Answer).values({
      answer: 'recorded for the test',
      disclosure: 'the test disclosure',
      recordedOn: clip.when,
      recordedBy: 'the test',
      source: 'schema test',
    })
    const row = {
      publicId: 'fenway-strike',
      title: 'Fenway',
      position: 1,
      publishedAt: clip.when,
      jobId: clip.jobId,
      generationId: clip.generationId,
      videoAssetId: clip.videoAssetId,
      thumbnailAssetId: clip.thumbnailId,
      endpoint: 'minimax/h3-max-turbo/image-to-video',
      pinnedOn: '2026-10-05',
      prompt: 'the published prompt',
      generatedAt: clip.when,
      attestationSummary: 'policy v1 · 5 of 5 clear',
      fallbackStatus: 'merged' as const,
    }
    const [published] = await db.insert(videos).values(row).returning()
    if (!published) throw new Error('catalog insert returned nothing')
    await db.update(job).set({ status: 'published' }).where(eq(job.id, clip.jobId))
    await db.update(videos).set({ publishedAt: null, unpublishedAt: clip.when }).where(eq(videos.id, published.id))
    await db.update(job).set({ status: 'withdrawn' }).where(eq(job.id, clip.jobId))
    await expect(db.insert(videos).values({
      ...row,
      publicId: 'fenway-again',
      publishedAt: null,
      unpublishedAt: clip.when,
    })).rejects.toSatisfy(throwsMatching(/videos_job_id|duplicate key/i))
  })

  it('refuses Keep without five Clear answers', async () => {
    const { db } = await freshDatabase()
    const clip = await seedClip(db)
    await expect(db.update(job).set({ status: 'kept' }).where(eq(job.id, clip.jobId)))
      .rejects.toSatisfy(throwsMatching(/five Clear/))
  })
})

describe('append-only records', () => {
  it('rejects an update to the ledger', async () => {
    const { db } = await freshDatabase()
    const clip = await seedClip(db)
    const [line] = await db.insert(ledger).values({
      jobId: clip.jobId,
      sessionId: clip.sessionId,
      at: clip.when,
      estimateUsd: '0.225000',
      basis: 'estimate',
      settlement: 'pending',
      runningSessionTotal: '0.225000',
    }).returning()
    await expect(db.update(ledger).set({ amountUsd: '0.000000' }).where(eq(ledger.id, line!.id)))
      .rejects.toSatisfy(throwsMatching(/append-only/))
  })
})
