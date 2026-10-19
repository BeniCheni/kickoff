import { connect, createServer as createTcp } from 'node:net'
import { afterAll, expect, test } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { createServer as createWire } from 'pglite-server'
import { closeCatalogClient, loadHostedMoments } from '../lib/catalog/database'

const database = new PGlite()
await database.waitReady
await database.exec(`
  CREATE SCHEMA catalog;
  CREATE SCHEMA demo;
  CREATE TABLE catalog.videos (id text, position integer);
  CREATE TABLE catalog.video (id text, position integer);
  CREATE TABLE demo.social_users (id text);
  CREATE TABLE demo.social_stats (video_id text);
  CREATE TABLE demo.social_comments (id text);
`)
const wire = createWire(database)
await new Promise<void>((resolve) => wire.listen(0, '127.0.0.1', () => resolve()))
const wirePort = (wire.address() as { port: number }).port

let maxOutstanding = 0
let queries = 0
const proxy = createTcp((client) => {
  const upstream = connect(wirePort, '127.0.0.1')
  let outstanding = 0
  let started = false
  let frontend = Buffer.alloc(0)
  let backend = Buffer.alloc(0)
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
      if (type === 'S' || type === 'Q') {
        queries += 1
        outstanding += 1
        maxOutstanding = Math.max(maxOutstanding, outstanding)
      }
      frontend = frontend.subarray(len + 1)
    }
  })
  upstream.on('data', (chunk) => {
    client.write(chunk)
    backend = Buffer.concat([backend, chunk])
    while (backend.length >= 5) {
      const type = String.fromCharCode(backend[0]!)
      const len = backend.readInt32BE(1)
      if (backend.length < len + 1) break
      if (type === 'Z') outstanding = Math.max(0, outstanding - 1)
      backend = backend.subarray(len + 1)
    }
  })
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
})

test('six concurrent Moments reads keep one query outstanding', async () => {
  maxOutstanding = 0
  queries = 0
  const one = await loadHostedMoments(true)
  expect(one.catalog.list).toEqual([])
  expect(one.demoError).toBeNull()
  expect(maxOutstanding).toBe(1)
  expect(queries).toBeGreaterThanOrEqual(5)

  maxOutstanding = 0
  queries = 0
  const six = await Promise.all(Array.from({ length: 6 }, () => loadHostedMoments(true)))
  expect(six.every((bundle) => bundle.demoError === null && bundle.catalog.list.length === 0)).toBe(true)
  expect(maxOutstanding).toBeLessThanOrEqual(1)
  expect(queries).toBeGreaterThanOrEqual(30)
})
