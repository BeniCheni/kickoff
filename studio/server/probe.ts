import { sql } from 'drizzle-orm'

type Executable = { execute: (query: ReturnType<typeof sql>) => Promise<unknown> }

/** `select 1`. A failure, including a connect timeout, is a paused database. */
export async function probeDatabase(db: unknown): Promise<boolean> {
  try {
    await (db as Executable).execute(sql`select 1`)
    return true
  } catch {
    return false
  }
}
