import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '../..')
const migrationsFolder = path.join(here, 'migrations')

export function resolveEnvFile(file: string, root = repoRoot, kind = 'env file'): string {
  const resolved = path.resolve(file)
  const relative = path.relative(root, resolved)
  const inside = relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
  if (inside) throw new Error(`Refusing to read a ${kind} inside the worktree`)
  return resolved
}

export function parseEnvFile(text: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out[key] = value
  }
  return out
}

export function redactConnectionText(text: string): string {
  return text.replace(/postgres(?:ql)?:\/\/\S+/gi, '[connection-redacted]')
}

export function migrateReport(tags: readonly string[]): string {
  return `migrated database=postgres applied=${tags.length === 0 ? 'none' : tags.join(',')}\n`
}

export async function appliedMigrationTags(sql: postgres.Sql): Promise<string[]> {
  const journal = JSON.parse(readFileSync(path.join(migrationsFolder, 'meta/_journal.json'), 'utf8')) as {
    entries: { tag: string, when: number }[]
  }
  let rows: { created_at: string | number }[] = []
  try {
    rows = await sql`SELECT created_at FROM drizzle.__drizzle_migrations`
  } catch {
    return []
  }
  const have = new Set(rows.map((row) => Number(row.created_at)))
  return journal.entries.filter((entry) => have.has(entry.when)).map((entry) => entry.tag)
}

export async function runMigrate(env: NodeJS.ProcessEnv = process.env, write: (line: string) => void = (line) => process.stdout.write(line)): Promise<void> {
  const next = { ...env }
  if (next.STUDIO_ENV_FILE) {
    const parsed = parseEnvFile(readFileSync(resolveEnvFile(next.STUDIO_ENV_FILE), 'utf8'))
    if (!next.DATABASE_URL && parsed.DATABASE_URL) next.DATABASE_URL = parsed.DATABASE_URL
  }
  const url = next.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set. Export it from an env file outside the worktree.')
  }
  const sql = postgres(url, { prepare: false, max: 1 })
  try {
    const before = new Set(await appliedMigrationTags(sql))
    await migrate(drizzle(sql), { migrationsFolder })
    const applied = (await appliedMigrationTags(sql)).filter((tag) => !before.has(tag))
    write(migrateReport(applied))
  } finally {
    await sql.end({ timeout: 5 })
  }
}

const invokedDirectly = process.argv[1] !== undefined
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (invokedDirectly) {
  runMigrate().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'migrate failed'
    process.stderr.write(`${redactConnectionText(message)}\n`)
    process.exitCode = 1
  })
}
