import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { META } from '../../src/lib/fixtures'
import pkg from '../../package.json'
import { GET } from '../app/api/snapshot/route'
import { SNAPSHOT_FILES, snapshotDigest } from '../lib/snapshotDigest'

const dataDir = fileURLToPath(new URL('../../src/data/', import.meta.url))

beforeEach(() => {
  vi.stubEnv('KICKOFF_SOURCE_SHA', undefined)
  vi.stubEnv('VERCEL_GIT_COMMIT_SHA', undefined)
})
afterEach(() => vi.unstubAllEnvs())

test('a one-byte data change moves the digest and the response has nothing else', async () => {
  const files = SNAPSHOT_FILES.map(name => ({ name, bytes: readFileSync(path.join(dataDir, name)) }))
  const digest = snapshotDigest(files)
  const flipped = Buffer.from(files[0].bytes)
  flipped[0] = flipped[0] ^ 0xff
  expect(snapshotDigest([{ name: files[0].name, bytes: flipped }, files[1], files[2]])).not.toBe(digest)

  const response = GET()
  expect(response.headers.get('Cache-Control')).toBe('no-store')
  const body = await response.json() as Record<string, unknown>
  expect(Object.keys(body).sort()).toEqual(['lastSyncAt', 'snapshotDigest', 'sourceSha', 'version'])
  expect(body).toEqual({
    sourceSha: null,
    snapshotDigest: digest,
    lastSyncAt: META.lastSyncAt,
    version: pkg.version,
  })
  expect(body.version).toBe('0.5.3')
})

test.each([
  [undefined, 'a'.repeat(40), 'a'.repeat(40)],
  ['', 'a'.repeat(40), 'a'.repeat(40)],
  ['b'.repeat(40), 'a'.repeat(40), 'b'.repeat(40)],
  ['', '', null],
])('source SHA uses the explicit override, then Vercel, then null', async (override, vercel, expected) => {
  vi.stubEnv('KICKOFF_SOURCE_SHA', override)
  vi.stubEnv('VERCEL_GIT_COMMIT_SHA', vercel)
  expect((await GET().json()).sourceSha).toBe(expected)
})
