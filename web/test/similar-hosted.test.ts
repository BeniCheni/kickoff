import { connect, createServer as createTcp } from 'node:net'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, expect, test } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { publishedDetailColumns, publishedListColumns, type CatalogDetailRow } from '@kickoff/catalog'
import { createServer as createWire } from 'pglite-server'
import { closeCatalogClient, loadHostedMoments } from '../lib/catalog/database'
import { resetSimilarReadWarnings } from '../lib/catalog/failure'
import { readCatalog } from '../lib/catalog/read'
import { momentsFor } from '../lib/catalog/request'
import { payloadScoreHits } from '../scripts/check-client.mjs'

const SCORE = '0.912345678'
const SECRET = 'vector-secret-token'
const RAISED = 'neighbour-secret-token'

const fixtureDir = fileURLToPath(new URL('../fixtures/catalog/', import.meta.url))
const several = readCatalog({
  catalog: 'stub',
  stubFile: path.join(fixtureDir, 'several.json'),
  databaseUrl: undefined,
  vercelEnv: undefined,
}, file => readFileSync(file, 'utf8'))

const INTEGER = new Set(['position', 'bytes', 'width', 'height'])
const BOOLEAN = new Set(['thumbnail_is_keyframe'])
const ARRAY = new Set(['subjects'])

function columnType(name: string): string {
  if (INTEGER.has(name)) return 'integer'
  if (BOOLEAN.has(name)) return 'boolean'
  if (ARRAY.has(name)) return 'text[]'
  return 'text'
}

function literal(column: string, value: unknown): string {
  if (value === null || value === undefined) return 'NULL'
  if (INTEGER.has(column)) return String(value)
  if (BOOLEAN.has(column)) return value ? 'true' : 'false'
  if (ARRAY.has(column)) {
    const items = value as readonly string[]
    if (items.length === 0) return 'ARRAY[]::text[]'
    return `ARRAY[${items.map(item => `'${item.replace(/'/g, "''")}'`).join(',')}]::text[]`
  }
  return `'${String(value).replace(/'/g, "''")}'`
}

function insert(table: string, columns: readonly string[], row: CatalogDetailRow): string {
  const values = columns.map(column => literal(column, row[column as keyof CatalogDetailRow]))
  return `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')})`
}

const database = new PGlite()
await database.waitReady
await database.exec(`
  CREATE SCHEMA catalog;
  CREATE TABLE catalog.videos (${publishedListColumns.map(column => `${column} ${columnType(column)}`).join(', ')});
  CREATE TABLE catalog.video (${publishedDetailColumns.map(column => `${column} ${columnType(column)}`).join(', ')});
`)
for (const row of several.details) {
  await database.exec(insert('catalog.videos', publishedListColumns, row))
  await database.exec(insert('catalog.video', publishedDetailColumns, row))
}

async function install(language: 'sql' | 'plpgsql', returns: string, body: string) {
  await database.exec('DROP FUNCTION IF EXISTS catalog.similar_moments(text, integer)')
  await database.exec(`
    CREATE FUNCTION catalog.similar_moments(p_id text, p_limit integer)
    RETURNS TABLE (${returns})
    LANGUAGE ${language} STABLE AS $$ ${body} $$
  `)
}

const happy = `
  SELECT ranked.id, ranked.score
  FROM (VALUES
    ('not-published', ${SCORE}::double precision),
    ('stub-fenway-one', 0.95::double precision),
    ('stub-both-cats', 0.50::double precision),
    ('stub-frankenstein-one', 0.40::double precision),
    ('stub-title-fenway', 0.20::double precision)
  ) AS ranked(id, score)
  WHERE p_limit IS NOT NULL AND p_limit >= 1
  ORDER BY ranked.score DESC, ranked.id ASC
  LIMIT LEAST(p_limit, 12)
`

await install('sql', 'id text, score double precision', happy)

const queries: string[] = []
const wire = createWire(database)
await new Promise<void>((resolve) => wire.listen(0, '127.0.0.1', () => resolve()))
const wirePort = (wire.address() as { port: number }).port
const proxy = createTcp((client) => {
  const upstream = connect(wirePort, '127.0.0.1')
  let started = false
  let frontend = Buffer.alloc(0)
  client.on('data', (chunk) => {
    upstream.write(chunk)
    frontend = Buffer.concat([frontend, chunk])
    while (frontend.length >= 5) {
      if (!started) {
        const len = frontend.readInt32BE(0)
        if (frontend.length < len) break
        const code = frontend.readInt32BE(4)
        frontend = frontend.subarray(len)
        if (code !== 80877103) started = true
        continue
      }
      const type = String.fromCharCode(frontend[0]!)
      const len = frontend.readInt32BE(1)
      if (frontend.length < len + 1) break
      const body = frontend.subarray(5, 1 + len)
      if (type === 'Q') queries.push(body.toString('utf8').replace(/\0+$/, ''))
      if (type === 'P') {
        const nameEnd = body.indexOf(0)
        const queryEnd = body.indexOf(0, nameEnd + 1)
        if (nameEnd >= 0 && queryEnd > nameEnd) queries.push(body.subarray(nameEnd + 1, queryEnd).toString('utf8'))
      }
      frontend = frontend.subarray(len + 1)
    }
  })
  upstream.on('data', (chunk) => { client.write(chunk) })
  client.on('error', () => {})
  upstream.on('error', () => {})
  client.on('close', () => upstream.end())
  upstream.on('close', () => client.end())
})
await new Promise<void>((resolve) => proxy.listen(0, '127.0.0.1', () => resolve()))
const proxyPort = (proxy.address() as { port: number }).port
process.env.KICKOFF_DATABASE_URL = ['postgres', '://', `reader:x@127.0.0.1:${proxyPort}/postgres`].join('')

afterAll(async () => {
  await closeCatalogClient()
  proxy.close()
  await new Promise<void>((resolve) => wire.close(() => resolve()))
  await database.close()
  delete process.env.KICKOFF_DATABASE_URL
})

function similarQueries(): string[] {
  return queries.filter(query => query.includes('similar_moments'))
}

async function warned(run: () => Promise<void>): Promise<string[]> {
  resetSimilarReadWarnings()
  const lines: string[] = []
  const original = console.warn
  console.warn = (line?: unknown) => { lines.push(String(line)) }
  try {
    await run()
  } finally {
    console.warn = original
  }
  return lines
}

test('the similarity statement runs once, keeps the function order, and drops the score', async () => {
  queries.length = 0
  const missed = await loadHostedMoments(false, null)
  expect(missed.similar).toBeUndefined()
  expect(similarQueries()).toEqual([])
  const absent = await loadHostedMoments(false, 'withdrawn-clip')
  expect(absent.catalog.list).toHaveLength(4)
  expect(absent.similar).toBeUndefined()
  expect(similarQueries()).toEqual([])

  queries.length = 0
  const watch = await loadHostedMoments(false, 'stub-fenway-one')
  expect(watch.similar).toEqual(['stub-both-cats', 'stub-frankenstein-one', 'stub-title-fenway'])
  expect(watch.catalog.list.map(row => row.id)).toEqual([
    'stub-fenway-one',
    'stub-frankenstein-one',
    'stub-both-cats',
    'stub-title-fenway',
  ])
  const calls = similarQueries()
  expect(calls).toHaveLength(1)
  expect(calls[0]).toContain('SELECT id, score FROM catalog.similar_moments')
  expect(calls[0]).not.toContain('*')
  const text = JSON.stringify(watch)
  expect(text).not.toContain(SCORE)
  expect(text).not.toContain('score')
  const payload = momentsFor('?tab=moments&watch=stub-fenway-one', () => watch.catalog, null, null, watch.similar)
  if (payload.state !== 'ready') throw new Error('expected ready')
  expect(payload.similar).toEqual(watch.similar)
  expect(payloadScoreHits(payload)).toEqual([])
  const source = readFileSync(fileURLToPath(new URL('../lib/catalog/database.ts', import.meta.url)), 'utf8')
  expect(source).toContain('SELECT id, score FROM')
  expect(source).not.toContain('SELECT * FROM catalog.similar_moments')
})

test('an extra column from the function does not reach the result', async () => {
  await install('sql', 'id text, score double precision, secret text', `
    SELECT 'stub-both-cats'::text, ${SCORE}::double precision, '${SECRET}'::text
  `)
  const watch = await loadHostedMoments(false, 'stub-fenway-one')
  expect(watch.similar).toEqual(['stub-both-cats'])
  expect(JSON.stringify(watch)).not.toContain(SECRET)
  expect(JSON.stringify(watch)).not.toContain(SCORE)
})

test('a raising function leaves Moments ready, logs the class, and keeps the row out of the log', async () => {
  await install('plpgsql', 'id text, score double precision', `
    BEGIN
      RAISE EXCEPTION '${RAISED}' USING ERRCODE = 'P0001';
    END
  `)
  const lines = await warned(async () => {
    const watch = await loadHostedMoments(false, 'stub-fenway-one')
    expect(watch.catalog.list).toHaveLength(4)
    expect(watch.similar).toBeUndefined()
    expect(watch.demoError).toBeNull()
  })
  expect(lines).toEqual(['similar read: read failed'])
  expect(lines[0]).not.toContain(RAISED)
  expect(lines[0]).not.toContain('stub-fenway-one')
  expect(lines[0]).not.toContain('SELECT')
})

test('a refused similarity read keeps the catalog and logs a class without the message', async () => {
  // pglite-server's thrown-error packet has no SQLSTATE, so 42501 arrives without a code.
  // failure.test.ts maps that code to permission denied. Here the class is the fallback.
  await install('plpgsql', 'id text, score double precision', `
    BEGIN
      RAISE EXCEPTION 'permission denied for function similar_moments' USING ERRCODE = '42501';
    END
  `)
  const lines = await warned(async () => {
    const watch = await loadHostedMoments(false, 'stub-fenway-one')
    expect(watch.similar).toBeUndefined()
    expect(watch.catalog.list).toHaveLength(4)
  })
  expect(lines).toEqual(['similar read: read failed'])
  expect(lines[0]).not.toContain('permission')
  expect(lines[0]).not.toContain('similar_moments')
  expect(lines[0]).not.toContain('stub-fenway-one')
  expect(lines[0]).not.toContain('SELECT')
})

test('an invalid score logs failed validation and returns no similar list', async () => {
  await install('sql', 'id text, score double precision', `
    SELECT 'stub-both-cats'::text, 'NaN'::double precision
  `)
  const lines = await warned(async () => {
    const watch = await loadHostedMoments(false, 'stub-fenway-one')
    expect(watch.similar).toBeUndefined()
    expect(watch.catalog.list).toHaveLength(4)
  })
  expect(lines).toEqual(['similar read: failed validation'])
})

test('a statement timeout inside the savepoint is unavailable, then the next read works', async () => {
  // PGlite does not enforce statement_timeout, and this wire drops SQLSTATE,
  // so the stand-in sleeps and the read's own deadline fires during that statement.
  // A driver 57014 takes the same outer path: the savepoint rethrows it.
  const source = readFileSync(fileURLToPath(new URL('../lib/catalog/database.ts', import.meta.url)), 'utf8')
  const similar = source.slice(source.indexOf('async function readSimilar'))
  expect(similar.indexOf('if (isCatalogTimeout(error)) throw error')).toBeGreaterThan(-1)
  expect(similar.indexOf('if (isCatalogTimeout(error)) throw error')).toBeLessThan(similar.indexOf('warnSimilarRead'))
  process.env.KICKOFF_READ_TIMEOUT_MS = '400'
  await install('plpgsql', 'id text, score double precision', `
    BEGIN
      PERFORM pg_sleep(1);
      RETURN QUERY SELECT 'stub-both-cats'::text, 0.5::double precision;
    END
  `)
  const lines = await warned(async () => {
    const started = Date.now()
    await expect(loadHostedMoments(false, 'stub-fenway-one')).rejects.toThrow(/timed out/)
    expect(Date.now() - started).toBeLessThan(1500)
  })
  expect(lines.join('\n')).not.toContain('similar read:')
  expect(lines.join('\n')).not.toContain(SCORE)
  delete process.env.KICKOFF_READ_TIMEOUT_MS
  await database.exec('ROLLBACK')
  await install('sql', 'id text, score double precision', happy)
  const again = await loadHostedMoments(false, 'stub-fenway-one')
  expect(again.similar).toEqual(['stub-both-cats', 'stub-frankenstein-one', 'stub-title-fenway'])
  expect(again.catalog.list).toHaveLength(4)
}, 10000)
