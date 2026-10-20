import { createRequire } from 'node:module'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { describe, expect, it } from 'vitest'
import { runCli, type CliIo } from '../cli.ts'
import { openPglite } from '../db/pglite.ts'
import { FAKE_EMBED_REFUSAL, selectEmbedder } from '../embed/select.ts'
import { FAKE_MODEL } from '../embed/fake.ts'
import { openAdmin } from '../server/open.ts'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const migrationsFolder = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../db/migrations')

function capture(): CliIo & { out: string[]; err: string[] } {
  const out: string[] = []
  const err: string[] = []
  return { out, err, stdout: (line) => out.push(line), stderr: (line) => err.push(line) }
}

describe('STUDIO_EMBED=fake', () => {
  it('stays on PGlite during tests and is refused everywhere else', () => {
    const allowed = selectEmbedder({ STUDIO_EMBED: 'fake' }, repoRoot, { pglite: true })
    expect(allowed.identity.model).toBe(FAKE_MODEL)
    expect(() => selectEmbedder({ STUDIO_EMBED: 'fake' }, repoRoot, { pglite: false })).toThrow(FAKE_EMBED_REFUSAL)
    const previous = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    try {
      expect(() => selectEmbedder({ STUDIO_EMBED: 'fake' }, repoRoot, { pglite: true })).toThrow(FAKE_EMBED_REFUSAL)
    } finally {
      process.env.NODE_ENV = previous
    }
  })

  it('refuses a live wire for the CLI and the admin while NODE_ENV is test', async () => {
    const database = await openPglite()
    await migrate(drizzle(database), { migrationsFolder })
    let port = 1
    let wire: { close: () => void } | undefined
    try {
      const requireWeb = createRequire(path.join(repoRoot, 'web/package.json'))
      const serverPath = requireWeb.resolve('pglite-server')
      const loaded = await import(pathToFileURL(serverPath).href) as {
        createServer: (db: typeof database) => {
          listen: (listenPort: number, host: string, cb: () => void) => void
          address: () => { port: number } | string | null
          close: () => void
        }
      }
      const started = loaded.createServer(database)
      await new Promise<void>((resolve) => started.listen(0, '127.0.0.1', () => resolve()))
      const address = started.address()
      if (!address || typeof address === 'string') throw new Error('wire did not bind')
      port = address.port
      wire = started
    } catch (error) {
      const missing = error instanceof Error && /Cannot find module/.test(error.message)
      if (!missing) throw error
    }
    const databaseUrl = ['postgres', '://', `postgres:probe-pw@127.0.0.1:${port}/postgres`].join('')
    const env = {
      STUDIO_LIVE: '1',
      DATABASE_URL: databaseUrl,
      STUDIO_EMBED: 'fake',
      STUDIO_DATA_DIR: mkdtempSync(path.join(tmpdir(), 'st4-seam-data-')),
      STUDIO_MEDIA_DIR: mkdtempSync(path.join(tmpdir(), 'st4-seam-media-')),
    }
    const started = Date.now()
    const cli = capture()
    expect(await runCli(['embed', '--backfill', '--live'], env, cli)).toBe(1)
    expect(cli.err).toEqual([FAKE_EMBED_REFUSAL])
    expect(cli.out.join('\n')).not.toContain('embedding=')
    await expect(openAdmin(env, true)).rejects.toThrow(FAKE_EMBED_REFUSAL)
    expect(Date.now() - started).toBeLessThan(2500)
    if (wire) {
      const stored = await database.query<{ n: number }>('SELECT count(*)::int AS n FROM studio.clip_embeddings')
      expect(stored.rows[0]?.n).toBe(0)
      wire.close()
    }
    await database.close()
  })
})
