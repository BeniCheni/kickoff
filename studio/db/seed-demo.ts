import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'
import { parseEnvFile, redactConnectionText, resolveEnvFile } from './migrate.ts'

const here = path.dirname(fileURLToPath(import.meta.url))

export function seedDemoSql(): string {
  return readFileSync(path.join(here, 'seed-demo.sql'), 'utf8')
}

export async function runSeedDemo(env: NodeJS.ProcessEnv = process.env): Promise<void> {
  const next = { ...env }
  if (next.STUDIO_ENV_FILE) {
    const parsed = parseEnvFile(readFileSync(resolveEnvFile(next.STUDIO_ENV_FILE), 'utf8'))
    if (!next.DATABASE_URL && parsed.DATABASE_URL) next.DATABASE_URL = parsed.DATABASE_URL
  }
  const url = next.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set. Export it from an env file outside the worktree.')
  }
  const sql = postgres(url, { prepare: false, max: 1, connect_timeout: 5 })
  try {
    await sql.unsafe(seedDemoSql())
  } finally {
    await sql.end({ timeout: 5 })
  }
}

const invokedDirectly = process.argv[1] !== undefined
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (invokedDirectly) {
  runSeedDemo().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'seed failed'
    process.stderr.write(`${redactConnectionText(message)}\n`)
    process.exitCode = 1
  })
}
