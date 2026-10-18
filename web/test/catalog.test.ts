import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { catalogDetailRowSchema, publishedListColumns } from '@kickoff/catalog'
import { expect, test } from 'vitest'
import { CatalogReadError } from '../lib/catalog/types'
import { readCatalog } from '../lib/catalog/read'
import { momentsFor, previewAllowed, storageOriginFrom, tabIsMoments } from '../lib/catalog/request'

const fixtureDir = fileURLToPath(new URL('../fixtures/catalog/', import.meta.url))
const read = (name: string) => readFileSync(path.join(fixtureDir, name), 'utf8')
const readText = (file: string) => readFileSync(file, 'utf8')
const env = (over: Partial<{ catalog: string; stubFile: string; databaseUrl: string; vercelEnv: string }> = {}) => ({
  catalog: undefined as string | undefined,
  stubFile: undefined as string | undefined,
  databaseUrl: undefined as string | undefined,
  vercelEnv: undefined as string | undefined,
  ...over,
})

test('a missing database address throws and does not open a file', () => {
  let reads = 0
  expect(() => readCatalog(env(), () => { reads += 1; return '' })).toThrow(CatalogReadError)
  expect(reads).toBe(0)
  try {
    readCatalog(env({ catalog: 'production' }), () => '')
  } catch (error) {
    expect(error).toBeInstanceOf(CatalogReadError)
    expect((error as CatalogReadError).preview).toBe(false)
  }
})

test('a database address without a client still throws', () => {
  expect(() => readCatalog(env({ databaseUrl: 'present' }), () => '')).toThrow(/not in this build/)
})

test('stub beside production refuses before opening a file', () => {
  let reads = 0
  try {
    readCatalog(env({ catalog: 'stub', vercelEnv: 'production', stubFile: 'unused' }), () => { reads += 1; return '' })
  } catch (error) {
    expect((error as CatalogReadError).preview).toBe(false)
  }
  expect(reads).toBe(0)
})

test('stub without a file path throws instead of opening a baked-in file', () => {
  expect(() => readCatalog(env({ catalog: 'stub' }), () => '')).toThrow(/not set/)
})

test('an unknown mode throws and is not stub', () => {
  try {
    readCatalog(env({ catalog: 'yes' }), () => '')
  } catch (error) {
    expect((error as CatalogReadError).preview).toBe(false)
  }
})

test('every fixture file carries the sentinel and the named sets parse', () => {
  for (const name of ['empty.json', 'one.json', 'several.json', 'missing-thumbnail.json', 'unavailable.json', 'README.md']) {
    expect(read(name)).toContain('KICKOFF-STUB-CATALOG')
  }
  const empty = readCatalog(env({ catalog: 'stub', stubFile: path.join(fixtureDir, 'empty.json') }), readText)
  expect(empty.list).toEqual([])
  expect(empty.preview).toBe(true)
  const one = readCatalog(env({ catalog: 'stub', stubFile: path.join(fixtureDir, 'one.json') }), readText)
  expect(one.list).toHaveLength(1)
  expect(one.details[0]?.subjects).toEqual(['Fenway'])
  expect(one.details[0]?.width).toBe(768)
  expect(one.details[0]?.height).toBe(480)
  expect(one.details[0]?.thumbnail_is_keyframe).toBe(true)
  expect(one.details[0]?.kept_at).toBeTruthy()
  const several = readCatalog(env({ catalog: 'stub', stubFile: path.join(fixtureDir, 'several.json') }), readText)
  expect(several.list.map(row => row.subjects)).toEqual([['Fenway', 'Frankenstein'], ['Fenway'], [], ['Frankenstein']])
  expect(several.list.map(row => row.title)).toContain('Fenway')
  expect(several.list.find(row => row.title === 'Fenway')?.subjects).toEqual([])
  expect(several.details.some(row => row.width === 768 && row.height === 432)).toBe(true)
  expect(several.details.some(row => row.width === 768 && row.height === 480)).toBe(true)
  expect(several.details.some(row => row.width === null && row.height === null)).toBe(true)
  expect(several.details.filter(row => row.generated_at === '2026-10-05T16:00:00.000Z')).toHaveLength(2)
  expect(several.details.some(row => row.seed === null && row.kept_at === null && row.thumbnail_is_keyframe === false)).toBe(true)
  expect(several.details.some(row => row.sha256 === 'not-a-digest')).toBe(true)
  expect(several.list.every(row => !('prompt' in row))).toBe(true)
  expect(Object.keys(several.list[0] ?? {}).sort()).toEqual([...publishedListColumns].sort())
  const missing = readCatalog(env({ catalog: 'stub', stubFile: path.join(fixtureDir, 'missing-thumbnail.json') }), readText)
  expect(missing.details[0]?.thumbnail_bucket).toBeNull()
  expect(missing.details[0]?.thumbnail_object_path).toBeNull()
  expect(() => readCatalog(env({ catalog: 'stub', stubFile: path.join(fixtureDir, 'unavailable.json') }), readText)).toThrow(/unavailable/)
})

test('a video with an extra key fails the whole read', () => {
  const body = JSON.parse(read('one.json')) as { videos: Record<string, unknown>[] }
  body.videos[0]!.job_id = 'private'
  expect(() => readCatalog(env({ catalog: 'stub', stubFile: 'memory' }), () => JSON.stringify(body))).toThrow(/failed validation/)
  expect(catalogDetailRowSchema.safeParse(body.videos[0]).success).toBe(false)
})

test('fixtures and table do not call the loader', () => {
  for (const search of ['', '?tab=table', '?watch=stub-fenway-one', '?tab=fixtures&watch=stub-fenway-one']) {
    let calls = 0
    const result = momentsFor(search, () => { calls += 1; throw new Error('called') }, null)
    expect(calls).toBe(0)
    expect(result).toEqual({ state: 'skipped' })
    expect(tabIsMoments(search)).toBe(false)
  }
})

test('moments calls the loader once and keeps prompts off the list', () => {
  const read = readCatalog(env({ catalog: 'stub', stubFile: path.join(fixtureDir, 'several.json') }), readText)
  let calls = 0
  const gallery = momentsFor('?tab=moments', () => { calls += 1; return read }, 'http://127.0.0.1/stub-storage')
  expect(calls).toBe(1)
  expect(gallery.state).toBe('ready')
  if (gallery.state !== 'ready') return
  expect(gallery.detail).toBeNull()
  expect(gallery.list.every(row => !('prompt' in row))).toBe(true)
  const watch = momentsFor('?tab=moments&watch=withdrawn-clip', () => read, null)
  expect(watch.state).toBe('ready')
  if (watch.state !== 'ready') return
  expect(watch.detail).toBeNull()
  expect(watch.watchId).toBe('withdrawn-clip')
  const found = momentsFor('?tab=moments&watch=stub-fenway-one', () => read, null)
  if (found.state !== 'ready') throw new Error('expected ready')
  expect(found.detail?.id).toBe('stub-fenway-one')
  expect(found.detail?.prompt).toContain('synthetic')
  expect(gallery.videoAddress).toBeNull()
  expect(gallery.thumbnails['stub-fenway-one']).toEqual({
    storage: 'http://127.0.0.1/stub-storage/moments/stub-fenway-one/thumbnail-a1b2c3d4.jpg',
    site: '/moments/thumbnails/stub-fenway-one.jpg',
  })
})

test('stub storage ignores forwarded hosts and accepts only a local Host or an explicit origin', () => {
  const env = { KICKOFF_CATALOG: 'stub' }
  const header = new Headers({ host: '127.0.0.1:5175', 'x-forwarded-host': 'attacker.example', 'x-forwarded-proto': 'https' })
  expect(storageOriginFrom(header, env)).toBe('http://127.0.0.1:5175/stub-storage')
  header.set('host', 'attacker.example')
  expect(storageOriginFrom(header, env)).toBeNull()
  expect(storageOriginFrom(header, { ...env, KICKOFF_STUB_STORAGE_ORIGIN: 'https://preview.example/stub-storage/' })).toBe('https://preview.example/stub-storage')
  expect(storageOriginFrom(header, { ...env, KICKOFF_STUB_STORAGE_ORIGIN: 'https://user@attacker.example/' })).toBeNull()
  expect(storageOriginFrom(header, { ...env, VERCEL_ENV: 'production', KICKOFF_STUB_STORAGE_ORIGIN: 'https://preview.example/stub-storage' })).toBeNull()
})

test('a failed moments read is unavailable and does not substitute the stub', () => {
  const failed = momentsFor('?tab=moments', () => { throw new CatalogReadError('catalog database address is not set', false) }, null)
  expect(failed).toEqual({ state: 'unavailable', preview: false, watchId: null })
})

test('preview outside stub mode is refused', () => {
  expect(previewAllowed(true, 'closed')).toBe(false)
  expect(previewAllowed(true, 'stub')).toBe(true)
  expect(previewAllowed(false, 'closed')).toBe(true)
})

test('the loader source is server-only and has no baked-in fixture path', () => {
  const load = readFileSync(fileURLToPath(new URL('../lib/catalog/load.ts', import.meta.url)), 'utf8')
  const reader = readFileSync(fileURLToPath(new URL('../lib/catalog/read.ts', import.meta.url)), 'utf8')
  expect(load).toContain("import 'server-only'")
  expect(load).toContain('process.env.KICKOFF_DATABASE_URL')
  expect(load + reader).not.toContain('KICKOFF-STUB-CATALOG')
  expect(load + reader).not.toContain('fixtures/catalog')
})
