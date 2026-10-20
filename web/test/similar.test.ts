import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { momentsFor } from '../lib/catalog/request'
import { readCatalog } from '../lib/catalog/read'
import { SIMILAR_PAGE_LIMIT, similarIdsFromRows } from '../lib/catalog/similar-rows'
import { loadMomentsRead } from '../lib/moments-read'
import { payloadScoreHits } from '../scripts/check-client.mjs'

const fixtureDir = fileURLToPath(new URL('../fixtures/catalog/', import.meta.url))
const several = readCatalog({
  catalog: 'stub',
  stubFile: path.join(fixtureDir, 'several.json'),
  databaseUrl: undefined,
  vercelEnv: undefined,
}, file => readFileSync(file, 'utf8'))

test('an extra column fails the similarity read, and the watched id and strangers are dropped', () => {
  const listIds = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'])
  expect(() => similarIdsFromRows([{ id: 'b', score: 0.5, secret: 'vector' }], listIds, 'a')).toThrow(/failed validation/)
  expect(() => similarIdsFromRows([{ id: 'b', score: Number.NaN }], listIds, 'a')).toThrow(/failed validation/)
  expect(() => similarIdsFromRows([{ id: 'b', score: '0.5' }], listIds, 'a')).toThrow(/failed validation/)
  const rows = [
    { id: 'not-published', score: 0.912345678 },
    { id: 'a', score: 0.95 },
    { id: 'b', score: 0.5 },
    { id: 'b', score: 0.49 },
    { id: 'c', score: 0.4 },
    { id: 'd', score: 0.3 },
    { id: 'e', score: 0.2 },
    { id: 'f', score: 0.1 },
    { id: 'g', score: 0.05 },
    { id: 'h', score: 0.01 },
  ]
  const kept = similarIdsFromRows(rows, listIds, 'a')
  expect(kept).toEqual(['b', 'c', 'd', 'e', 'f', 'g'])
  expect(kept).toHaveLength(SIMILAR_PAGE_LIMIT)
  expect(kept).not.toContain('a')
  expect(kept).not.toContain('not-published')
  expect(JSON.stringify(kept)).not.toContain('0.912345678')
  expect(JSON.stringify(kept)).not.toContain('score')
})

test('the gallery carries no similar list, and a watch payload keeps ids only', () => {
  let calls = 0
  const gallery = momentsFor('?tab=moments', () => { calls += 1; return several }, null, null, ['stub-both-cats'])
  expect(calls).toBe(1)
  expect(gallery.state).toBe('ready')
  if (gallery.state !== 'ready') return
  expect(gallery).not.toHaveProperty('similar')
  expect(payloadScoreHits(gallery)).toEqual([])
  const watch = momentsFor('?tab=moments&watch=stub-fenway-one', () => several, null, null, [
    'stub-title-fenway',
    'stub-fenway-one',
    'withdrawn-clip',
    'stub-both-cats',
    'stub-both-cats',
  ])
  if (watch.state !== 'ready') throw new Error('expected ready')
  expect(watch.similar).toEqual(['stub-title-fenway', 'stub-both-cats'])
  expect(payloadScoreHits(watch)).toEqual([])
  expect(JSON.stringify(watch)).not.toContain('similarById')
  expect(JSON.stringify(watch)).not.toContain('score')
  const skipped = momentsFor('?tab=table', () => { throw new Error('called') }, null, null, ['stub-both-cats'])
  expect(skipped).toEqual({ state: 'skipped' })
})

test('a stub watch read resolves the map and a gallery read does not attach it', async () => {
  const previous = process.env.KICKOFF_CATALOG
  const previousFile = process.env.KICKOFF_STUB_CATALOG_FILE
  process.env.KICKOFF_CATALOG = 'stub'
  process.env.KICKOFF_STUB_CATALOG_FILE = path.join(fixtureDir, 'several.json')
  delete process.env.KICKOFF_DEMO
  try {
    const watch = await loadMomentsRead('?tab=moments&watch=stub-fenway-one')
    expect(watch.similar).toEqual(['stub-title-fenway', 'stub-both-cats'])
    const payload = momentsFor('?tab=moments&watch=stub-fenway-one', () => watch.catalog, null, watch.demo, watch.similar)
    if (payload.state !== 'ready') throw new Error('expected ready')
    expect(payload.similar).toEqual(['stub-title-fenway', 'stub-both-cats'])
    expect(payloadScoreHits(payload)).toEqual([])
    expect(JSON.stringify(payload)).not.toContain('similarById')
    const gallery = await loadMomentsRead('?tab=moments')
    expect(gallery.similar).toBeUndefined()
    const galleryPayload = momentsFor('?tab=moments', () => gallery.catalog, null, gallery.demo, gallery.similar)
    expect(galleryPayload).not.toHaveProperty('similar')
    const missing = await loadMomentsRead('?tab=moments&watch=withdrawn-clip')
    expect(missing.similar).toBeUndefined()
  } finally {
    if (previous === undefined) delete process.env.KICKOFF_CATALOG
    else process.env.KICKOFF_CATALOG = previous
    if (previousFile === undefined) delete process.env.KICKOFF_STUB_CATALOG_FILE
    else process.env.KICKOFF_STUB_CATALOG_FILE = previousFile
  }
})
