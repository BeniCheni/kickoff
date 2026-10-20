import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { openPglite } from '../db/pglite.ts'
import { studioTables } from '../db/schema.ts'
import type { StudioDatabase } from '../engine.ts'

const migrationsFolder = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../db/migrations')

export async function freshDatabase() {
  const client = await openPglite()
  const db = drizzle(client, { schema: studioTables })
  await migrate(db, { migrationsFolder })
  return { client, db }
}

export type { StudioDatabase }
export type StudioClient = Awaited<ReturnType<typeof freshDatabase>>['client']

export function errorText(error: unknown): string {
  if (error instanceof Error) {
    const cause = error.cause instanceof Error ? error.cause.message : ''
    return `${error.message}\n${cause}`
  }
  return String(error)
}

export function throwsMatching(pattern: RegExp) {
  return (error: unknown) => pattern.test(errorText(error))
}
