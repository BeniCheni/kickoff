import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '../..')
const migrationsFolder = path.join(here, 'migrations')

export function resolveEnvFile(file: string, root = repoRoot): string {
  const resolved = path.resolve(file)
  const relative = path.relative(root, resolved)
  const inside = relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
  if (inside) throw new Error('Refusing to read an env file inside the worktree')
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

export async function runMigrate(env: NodeJS.ProcessEnv = process.env): Promise<void> {
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
    await migrate(drizzle(sql), { migrationsFolder })
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
