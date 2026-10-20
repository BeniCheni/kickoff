import { PGlite } from '@electric-sql/pglite'
import { vector } from '@electric-sql/pglite-pgvector'

/**
 * Opens PGlite with the pgvector extension loaded.
 * The migration still has to `CREATE EXTENSION vector`; this only makes that possible.
 * A data directory is the on-disk database. Omit it for a fresh in-memory database.
 */
export async function openPglite(dataDir?: string): Promise<PGlite> {
  const client = dataDir === undefined
    ? new PGlite({ extensions: { vector } })
    : new PGlite(dataDir, { extensions: { vector } })
  await client.waitReady
  return client
}
