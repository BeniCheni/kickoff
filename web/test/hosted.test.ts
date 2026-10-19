import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { hostedStorageOrigin, stubSiteCopyPath } from '../lib/catalog/addresses'
import { connectionOptions } from '../lib/catalog/connection'
import { catalogFromRows } from '../lib/catalog/hosted'
import { readCatalog } from '../lib/catalog/read'
import { momentsFor } from '../lib/catalog/request'
import { CatalogReadError } from '../lib/catalog/types'

const fixtureDir = fileURLToPath(new URL('../fixtures/catalog/', import.meta.url))
const readText = (file: string) => readFileSync(file, 'utf8')

function several() {
  return readCatalog({
    catalog: 'stub',
    stubFile: path.join(fixtureDir, 'several.json'),
    databaseUrl: undefined,
    vercelEnv: undefined,
  }, readText)
}

test('a hosted read parses strict rows and rejects an extra column', () => {
  const stub = several()
  const hosted = catalogFromRows(stub.list, stub.details)
  expect(hosted.preview).toBe(false)
  expect(hosted.list.map(row => row.id)).toEqual(stub.list.map(row => row.id))
  const extra = stub.list.map((row, index) => index === 0 ? { ...row, job_id: 'private' } : row)
  expect(() => catalogFromRows(extra, stub.details)).toThrow(CatalogReadError)
  const dated = stub.list.map(row => ({ ...row, published_at: new Date(row.published_at) }))
  const detailDated = stub.details.map(row => ({ ...row, published_at: new Date(row.published_at), kept_at: row.kept_at ? new Date(row.kept_at) : null }))
  expect(catalogFromRows(dated, detailDated).list[0]?.published_at).toBe(stub.list[0]?.published_at)
  expect(() => catalogFromRows(stub.list, stub.details.slice(1))).toThrow(/do not match/)
  expect(catalogFromRows([], []).list).toEqual([])
})

test('the connection requires TLS except on loopback and does not keep the address', () => {
  const local = connectionOptions(['postgres', '://', 'reader@127.0.0.1:5432/kickoff'].join(''))
  expect(local).toMatchObject({ prepare: false, max: 1, connect_timeout: 5, ssl: false })
  expect(connectionOptions(['postgresql', '://', 'reader@localhost/kickoff'].join('')).ssl).toBe(false)
  expect(connectionOptions(['postgres', '://', 'reader@[::1]:5432/kickoff'].join('')).ssl).toBe(false)
  const remote = connectionOptions(['postgres', '://', 'reader@db.example:6543/postgres?sslmode=disable'].join(''))
  expect(remote.ssl).toBe('require')
  expect(JSON.stringify(remote)).not.toContain('db.example')
  expect(() => connectionOptions('present')).toThrow(/not usable/)
  expect(() => connectionOptions('https://db.example/postgres')).toThrow(/not usable/)
  const extra = ['postgres', '://', 'reader@db.example:6543/postgres?pgbouncer=true'].join('')
  expect(() => connectionOptions(extra)).toThrow(CatalogReadError)
  try {
    connectionOptions(extra)
  } catch (error) {
    expect(error).toBeInstanceOf(CatalogReadError)
    expect((error as CatalogReadError).failure).toBe('connection string has extra parameters')
    expect(String(error)).not.toContain('pgbouncer')
  }
  expect(connectionOptions(['postgres', '://', 'reader@db.example:6543/postgres?sslmode=require'].join('')).ssl).toBe('require')
  const loopbackUrl = ['postgres', '://', 'reader@127.0.0.1:5432/kickoff'].join('')
  try {
    connectionOptions(loopbackUrl, { VERCEL_ENV: 'preview' })
    throw new Error('loopback was accepted on a preview')
  } catch (error) {
    expect(error).toBeInstanceOf(CatalogReadError)
    expect((error as CatalogReadError).failure).toBe('loopback database is local only')
  }
})

test('a real storage origin is https only, and a hosted row does not use the stub site route', () => {
  expect(hostedStorageOrigin(undefined)).toBeNull()
  expect(hostedStorageOrigin('')).toBeNull()
  expect(hostedStorageOrigin('https://media.example/')).toBe('https://media.example')
  expect(hostedStorageOrigin('https://media.example/moments')).toBeNull()
  expect(hostedStorageOrigin('http://media.example')).toBeNull()
  expect(hostedStorageOrigin('http://127.0.0.1:9')).toBe('http://127.0.0.1:9')
  expect(hostedStorageOrigin('http://127.0.0.1:9', 'preview')).toBeNull()
  expect(hostedStorageOrigin('https://media.example', 'preview')).toBe('https://media.example')
  expect(hostedStorageOrigin('https://user:secret@media.example')).toBeNull()
  expect(hostedStorageOrigin('not a url')).toBeNull()
  const stub = several()
  const hosted = { ...stub, preview: false as const }
  const gallery = momentsFor('?tab=moments', () => hosted, 'https://media.example')
  if (gallery.state !== 'ready') throw new Error('expected ready')
  expect(gallery.preview).toBe(false)
  const row = gallery.list[0]
  if (!row) throw new Error('expected a row')
  expect(gallery.thumbnails[row.id]?.site).toBe(`/moments/thumbnails/${row.id}.jpg`)
  expect(gallery.thumbnails[row.id]?.storage).toContain('https://media.example/moments/')
  expect(stubSiteCopyPath(row.id)).toBe(`/moments/stub-site/${row.id}.jpg`)
  expect(stubSiteCopyPath('../x')).toBeNull()
  const missing = momentsFor('?tab=moments', () => hosted, null)
  if (missing.state !== 'ready') throw new Error('expected ready')
  expect(missing.videoAddress).toBeNull()
  expect(missing.thumbnails[row.id]?.storage).toBeNull()
})
