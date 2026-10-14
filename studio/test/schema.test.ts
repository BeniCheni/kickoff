import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { article50NonblankSql, BLANK_CODE_POINTS } from '../answer.ts'
import { article50Answer, job, ledger, videos } from '../db/schema.ts'
import { publishedDetailColumns, publishedListColumns } from '../db/public-columns.ts'
import { markKept, seedClip } from './fixture.ts'
import { freshDatabase, throwsMatching } from './harness.ts'

const migrationsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../db/migrations')

async function rows<T>(client: { query: (sql: string) => Promise<{ rows: T[] }> }, sql: string) {
  const result = await client.query(sql)
  return result.rows
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
