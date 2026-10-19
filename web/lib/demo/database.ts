import 'server-only'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import { catalogClient } from '../catalog/database'
import { asCatalogRows } from '../catalog/hosted'
import { DemoReadError } from './read'
import { demoFromRows } from './rows'

/** The three demo views, on the same server connection as the catalog. */
export async function readDemoFromDatabase() {
  const db = drizzle(catalogClient())
  let users: unknown[]
  let stats: unknown[]
  let comments: unknown[]
  try {
    users = asCatalogRows(await db.execute(sql`SELECT * FROM demo.social_users ORDER BY id`))
    stats = asCatalogRows(await db.execute(sql`SELECT * FROM demo.social_stats ORDER BY video_id`))
    comments = asCatalogRows(await db.execute(sql`SELECT * FROM demo.social_comments ORDER BY id`))
  } catch {
    throw new DemoReadError('demo social could not be read', true)
  }
  try {
    return demoFromRows(users, stats, comments)
  } catch {
    throw new DemoReadError('demo social failed validation', true)
  }
}
