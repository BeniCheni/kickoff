import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { migrateReport } from '../db/migrate.ts'
import { seedReport } from '../db/seed-demo.ts'

const here = path.dirname(fileURLToPath(import.meta.url))

describe('migrate and seed reports', () => {
  it('names the engine and the rows, and never a host', () => {
    expect(migrateReport([])).toBe('migrated database=postgres applied=none\n')
    expect(migrateReport(['0000_studio_tables', '0004_demo_social'])).toBe('migrated database=postgres applied=0000_studio_tables,0004_demo_social\n')
    expect(seedReport({ videos: 2, users: 12, comments: 15 })).toBe('seeded database=postgres videos=2 users=12 comments=15\n')
    const migrate = readFileSync(path.join(here, '../db/migrate.ts'), 'utf8')
    const seed = readFileSync(path.join(here, '../db/seed-demo.ts'), 'utf8')
    expect(migrate).toContain('write(migrateReport(applied))')
    expect(seed).toContain('write(seedReport(')
    expect(migrate + seed).not.toMatch(/postgres(?:ql)?:\/\//i)
  })
})
