import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseDemoSocial, type DemoSocial } from '@kickoff/demo'
import { article50Answer, generation, job, videos } from '../db/schema.ts'
import { seedDemoSql, seedNotReady } from '../db/seed-demo.ts'
import { markKept, seedClip } from './fixture.ts'
import { freshDatabase } from './harness.ts'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

async function rows<T>(client: { query: (sql: string) => Promise<{ rows: T[] }> }, sql: string) {
  return (await client.query(sql)).rows
}

type Database = Awaited<ReturnType<typeof freshDatabase>>['db']
type Clip = Awaited<ReturnType<typeof seedClip>>

async function publish(db: Database, clip: Clip, publicId: string, position: number) {
  const [gen] = await db.insert(generation).values({
    kind: 'video',
    modelId: clip.modelId,
    prompt: `prompt-${publicId}`,
    promptSha256: `prompt-${publicId}`,
    params: { duration: 15, resolution: '480P' },
    cacheKey: publicId,
    status: 'downloaded',
  }).returning()
  if (!gen) throw new Error('generation insert returned nothing')
  const [row] = await db.insert(job).values({
    generationId: gen.id,
    sessionId: clip.sessionId,
    attempt: 1,
    idempotencyKey: publicId,
    estimateUsd: '0.225000',
    status: 'downloaded',
    finishedAt: clip.when,
  }).returning()
  if (!row) throw new Error('job insert returned nothing')
  await db.insert(videos).values({
    publicId,
    title: `Synthetic ${publicId}`,
    position,
    publishedAt: clip.when,
    jobId: row.id,
    generationId: gen.id,
    videoAssetId: clip.videoAssetId,
    thumbnailAssetId: clip.thumbnailId,
    endpoint: 'minimax/h3-max-turbo/image-to-video',
    pinnedOn: '2026-10-05',
    prompt: `prompt-${publicId}`,
    generatedAt: clip.when,
    attestationSummary: 'policy v1 · 5 of 5 clear',
    fallbackStatus: 'merged',
  })
}

async function snapshot(client: { query: (sql: string) => Promise<{ rows: { digest: string }[] }> }) {
  const [row] = await rows<{ digest: string }>(client, `
    SELECT md5(concat_ws('|',
      (SELECT count(*)::text FROM studio.videos),
      (SELECT count(*)::text FROM studio.asset),
      (SELECT count(*)::text FROM studio.ledger),
      (SELECT coalesce(string_agg(id || ':' || title, ',' ORDER BY id), '') FROM catalog.videos),
      (SELECT coalesce(string_agg(id, ',' ORDER BY id), '') FROM catalog.video)
    )) AS digest
  `)
  if (!row) throw new Error('snapshot returned nothing')
  return row.digest
}

async function social(client: { query: (sql: string) => Promise<{ rows: Record<string, unknown>[] }> }): Promise<DemoSocial> {
  const users = await rows<Record<string, unknown>>(client, 'SELECT * FROM demo.social_users ORDER BY id')
  const stats = await rows<Record<string, unknown>>(client, 'SELECT * FROM demo.social_stats ORDER BY video_id')
  const comments = await rows<Record<string, unknown>>(client, 'SELECT * FROM demo.social_comments ORDER BY id')
  const strip = (row: Record<string, unknown>) => {
    if (row.synthetic !== true) throw new Error('non-synthetic demo row')
    const copy = { ...row }
    delete copy.synthetic
    return copy
  }
  return parseDemoSocial({
    synthetic: true,
    sentinel: 'KICKOFF-DEMO-SOCIAL',
    users: users.map(strip),
    stats: stats.map(strip),
    comments: comments.map(strip),
  })
}

describe('demo seed', () => {
  it('is generated inside the database, replaces itself, and leaves the catalog alone', async () => {
    const source = seedDemoSql()
    expect(source).toContain('setseed(')
    expect(source).toContain('generate_series(')
    expect(source).toContain('md5(')
    expect(source.toLowerCase()).not.toContain('password')
    expect(source).not.toMatch(/postgres(?:ql)?:\/\//i)
    expect(readFileSync(path.join(repoRoot, 'studio/package.json'), 'utf8')).toContain('"seed:demo"')

    const { client, db } = await freshDatabase()
    const clip = await seedClip(db)
    await markKept(db, clip.generationId, clip.jobId)
    await db.insert(article50Answer).values({
      answer: 'recorded for the test',
      disclosure: 'the test disclosure',
      recordedOn: clip.when,
      recordedBy: 'the test',
      source: 'seed test',
    })
    await publish(db, clip, 'clip-a', 1)
    await publish(db, clip, 'clip-b', 2)
    await client.exec(`INSERT INTO demo.users (id, handle, display_name, avatar_emoji, avatar_palette, joined_on) VALUES ('junk-user', '@junkuser', 'Junk', '😺', 0, '2026-01-01')`)
    const before = await snapshot(client)
    await client.exec(source)
    const first = await social(client)
    expect(first.users.map((user) => user.id)).not.toContain('junk-user')
    expect(first.stats.map((row) => row.video_id).sort()).toEqual(['clip-a', 'clip-b'])
    for (const row of first.stats) {
      expect(row.views).toBeGreaterThanOrEqual(200)
      expect(row.views).toBeLessThanOrEqual(4000)
      expect(row.comment_count).toBeGreaterThanOrEqual(3)
      expect(row.comment_count).toBeLessThanOrEqual(12)
      for (const count of Object.values(row.reactions)) {
        expect(count).toBeGreaterThanOrEqual(4)
        expect(count).toBeLessThanOrEqual(80)
      }
      const comments = first.comments.filter((comment) => comment.video_id === row.video_id)
      expect(comments).toHaveLength(row.comment_count)
      expect(comments.some((comment) => comment.parent_id === null)).toBe(true)
      expect(comments.some((comment) => comment.parent_id !== null)).toBe(true)
    }
    const text = JSON.stringify(first).toLowerCase()
    for (const banned of ['beni', 'arsenal', 'chelsea', 'liverpool', 'barcelona', 'madrid', 'bayern', 'juventus', 'milan', 'manchester', 'tottenham', 'nike', 'adidas']) {
      expect(text).not.toContain(banned)
    }
    expect(await snapshot(client)).toBe(before)
    await expectDates(client)

    await client.exec('CALL demo.seed_social()')
    expect(await social(client)).toEqual(first)
    expect(await snapshot(client)).toBe(before)

    await publish(db, clip, 'clip-c', 3)
    await client.exec('CALL demo.seed_social()')
    const widened = await social(client)
    expect(widened.stats.map((row) => row.video_id).sort()).toEqual(['clip-a', 'clip-b', 'clip-c'])
    const same = (id: string) => widened.comments.filter((comment) => comment.video_id === id)
    expect(same('clip-a')).toEqual(first.comments.filter((comment) => comment.video_id === 'clip-a'))
    expect(same('clip-b')).toEqual(first.comments.filter((comment) => comment.video_id === 'clip-b'))
    expect(widened.stats.find((row) => row.video_id === 'clip-a')).toEqual(first.stats.find((row) => row.video_id === 'clip-a'))

    await expect(client.exec('SET ROLE studio_reader; CALL demo.seed_social()')).rejects.toThrow(/permission denied/i)
    await client.exec('RESET ROLE')
  })

  it('keeps comments after the clip and no later than the seed, including a clip one hour old', async () => {
    const { client, db } = await freshDatabase()
    const clip = await seedClip(db)
    await markKept(db, clip.generationId, clip.jobId)
    await db.insert(article50Answer).values({
      answer: 'recorded for the test',
      disclosure: 'the test disclosure',
      recordedOn: clip.when,
      recordedBy: 'the test',
      source: 'seed test',
    })
    await publish(db, clip, 'clip-old', 1)
    await publish(db, clip, 'clip-hour', 2)
    await publish(db, clip, 'clip-fresh', 3)
    await client.exec(`UPDATE studio.videos SET published_at = statement_timestamp() - interval '1 hour' WHERE public_id = 'clip-hour'`)
    await client.exec(`UPDATE studio.videos SET published_at = statement_timestamp() - interval '1 minute' WHERE public_id = 'clip-fresh'`)
    await client.exec(seedDemoSql())
    await expectDates(client)

    const hour = await rows<{ posted_at: Date; published_at: Date }>(client, `
      SELECT c.posted_at, v.published_at
      FROM demo.comments c
      JOIN catalog.videos v ON v.id = c.video_id
      WHERE c.video_id = 'clip-hour'
    `)
    expect(hour.length).toBeGreaterThan(0)
    for (const row of hour) {
      const posted = new Date(row.posted_at).getTime()
      const published = new Date(row.published_at).getTime()
      expect(posted).toBeGreaterThan(published)
      expect(posted).toBeLessThanOrEqual(published + 35 * 60 * 1000)
      expect(posted).toBeLessThanOrEqual(Date.now())
    }

    const first = await social(client)
    await client.exec('CALL demo.seed_social()')
    const second = await social(client)
    const old = (socialRows: DemoSocial, id: string) => socialRows.comments.filter((comment) => comment.video_id === id)
    expect(old(second, 'clip-old')).toEqual(old(first, 'clip-old'))
    expect(old(second, 'clip-hour')).toEqual(old(first, 'clip-hour'))
    await expectDates(client)
  })

  it('refuses a publish time that is not yet in the past and keeps the previous rows', async () => {
    const { client, db } = await freshDatabase()
    const clip = await seedClip(db)
    await markKept(db, clip.generationId, clip.jobId)
    await db.insert(article50Answer).values({
      answer: 'recorded for the test',
      disclosure: 'the test disclosure',
      recordedOn: clip.when,
      recordedBy: 'the test',
      source: 'seed test',
    })
    await publish(db, clip, 'clip-old', 1)
    await client.exec(seedDemoSql())
    const kept = await social(client)

    await client.exec(`UPDATE studio.videos SET published_at = statement_timestamp() + interval '5 seconds' WHERE public_id = 'clip-old'`)
    await expect(client.exec('CALL demo.seed_social()')).rejects.toThrow(seedNotReady)
    expect(await social(client)).toEqual(kept)

    await client.exec(`UPDATE studio.videos SET published_at = statement_timestamp() WHERE public_id = 'clip-old'`)
    await expect(client.exec('CALL demo.seed_social()')).rejects.toThrow(seedNotReady)
    expect(await social(client)).toEqual(kept)

    await publish(db, clip, 'clip-30m', 2)
    await publish(db, clip, 'clip-5m', 3)
    await publish(db, clip, 'clip-10s', 4)
    await client.exec(`UPDATE studio.videos SET published_at = statement_timestamp() - interval '2 hours' WHERE public_id = 'clip-old'`)
    await client.exec(`UPDATE studio.videos SET published_at = statement_timestamp() - interval '30 minutes' WHERE public_id = 'clip-30m'`)
    await client.exec(`UPDATE studio.videos SET published_at = statement_timestamp() - interval '5 minutes' WHERE public_id = 'clip-5m'`)
    await client.exec(`UPDATE studio.videos SET published_at = statement_timestamp() - interval '10 seconds' WHERE public_id = 'clip-10s'`)
    await client.exec('CALL demo.seed_social()')
    await expectDates(client)
    const once = await social(client)
    await client.exec('CALL demo.seed_social()')
    const twice = await social(client)
    const only = (rows: DemoSocial, id: string) => rows.comments.filter((comment) => comment.video_id === id)
    expect(only(twice, 'clip-old')).toEqual(only(once, 'clip-old'))
    await expectDates(client)
  })
})

async function expectDates(client: { query: (sql: string) => Promise<{ rows: Record<string, unknown>[] }> }) {
  const comments = await rows<Record<string, unknown>>(client, `
    SELECT c.video_id, c.parent_id, c.posted_at, v.published_at, p.posted_at AS parent_posted
    FROM demo.comments c
    JOIN catalog.videos v ON v.id = c.video_id
    LEFT JOIN demo.comments p ON p.id = c.parent_id
  `)
  expect(comments.length).toBeGreaterThan(0)
  const now = Date.now()
  for (const row of comments) {
    const posted = new Date(row.posted_at as string).getTime()
    const published = new Date(row.published_at as string).getTime()
    expect(posted).toBeGreaterThan(published)
    expect(posted).toBeLessThanOrEqual(now + 1000)
    if (row.parent_id !== null) {
      expect(row.parent_posted).not.toBeNull()
      expect(posted).toBeGreaterThan(new Date(row.parent_posted as string).getTime())
    }
  }
}
