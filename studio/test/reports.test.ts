import path from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { migrateReport, runMigrate } from '../db/migrate.ts'
import { runSeedDemo, seedReport } from '../db/seed-demo.ts'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

describe('migrate and seed reports', () => {
  it('prints the applied tags and the seeded counts, and names the engine', async () => {
    expect(migrateReport([])).toBe('migrated database=postgres applied=none\n')
    expect(seedReport({ videos: 2, users: 12, comments: 15 })).toBe('seeded database=postgres videos=2 users=12 comments=15\n')
    const database = new PGlite()
    await database.waitReady
    const serverModule = await import(pathToFileURL(path.join(repoRoot, 'web/node_modules/pglite-server/dist/index.js')).href) as {
      createServer: (db: PGlite) => {
        listen: (port: number, host: string, cb: () => void) => void
        address: () => { port: number } | null
        close: (cb: () => void) => void
      }
    }
    const wire = serverModule.createServer(database)
    await new Promise<void>((resolve) => wire.listen(0, '127.0.0.1', () => resolve()))
    const port = wire.address()?.port
    if (!port) throw new Error('wire did not listen')
    const url = ['postgres', '://', `postgres@127.0.0.1:${port}/postgres`].join('')
    const lines: string[] = []
    await runMigrate({ DATABASE_URL: url }, (line) => lines.push(line))
    expect(lines).toEqual(['migrated database=postgres applied=0000_studio_tables,0001_catalog_gate,0002_catalog_reader,0003_card_gate,0004_demo_social\n'])
    lines.length = 0
    await runMigrate({ DATABASE_URL: url }, (line) => lines.push(line))
    expect(lines).toEqual(['migrated database=postgres applied=none\n'])
    lines.length = 0
    await runSeedDemo({ DATABASE_URL: url }, (line) => lines.push(line))
    expect(lines).toEqual(['seeded database=postgres videos=0 users=12 comments=0\n'])
    expect(lines.join('')).not.toContain(String(port))
    await new Promise<void>((resolve) => wire.close(() => resolve()))
    await database.close()
  })
})
