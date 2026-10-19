import 'server-only'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { connectionOptions } from './connection'
import { asCatalogRows, catalogFromRows } from './hosted'
import { CatalogReadError, type CatalogSuccess } from './types'

let client: ReturnType<typeof postgres> | undefined
let openedFor: string | undefined

export function catalogClient(): ReturnType<typeof postgres> {
  const url = process.env.KICKOFF_DATABASE_URL
  if (!url) throw new CatalogReadError('catalog database address is not set', false)
  if (client && openedFor === url) return client
  const previous = client
  let opened: ReturnType<typeof postgres>
  try {
    opened = postgres(url, connectionOptions(url))
  } catch {
    throw new CatalogReadError('catalog database address is not usable', false)
  }
  client = opened
  openedFor = url
  if (previous) void previous.end({ timeout: 1 })
  return opened
}

/** List, then detail. Two statements, both unnamed, for one Moments request. */
export async function loadHostedCatalog(): Promise<CatalogSuccess> {
  const db = drizzle(catalogClient())
  try {
    const list = await db.execute(sql`SELECT * FROM catalog.videos ORDER BY position ASC, id ASC`)
    const detail = await db.execute(sql`SELECT * FROM catalog.video ORDER BY position ASC, id ASC`)
    return catalogFromRows(asCatalogRows(list), asCatalogRows(detail))
  } catch (error) {
    if (error instanceof CatalogReadError) throw error
    throw new CatalogReadError('catalog database read failed', false)
  }
}
