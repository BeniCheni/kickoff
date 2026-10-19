import 'server-only'
import { readFileSync } from 'node:fs'
import { loadHostedCatalog } from './database'
import { readCatalog, type CatalogSuccess } from './read'
import { CatalogReadError } from './types'

/** Server-only catalog read. Callers catch the throw and show the unavailable state. */
export async function loadCatalog(): Promise<CatalogSuccess> {
  const catalog = process.env.KICKOFF_CATALOG
  const vercelEnv = process.env.VERCEL_ENV
  if (catalog === 'stub') {
    return readCatalog({
      catalog,
      stubFile: process.env.KICKOFF_STUB_CATALOG_FILE,
      databaseUrl: undefined,
      vercelEnv,
    }, file => readFileSync(file, 'utf8'))
  }
  if (catalog === undefined || catalog === '' || catalog === 'production') return loadHostedCatalog()
  throw new CatalogReadError('unknown catalog mode', false)
}
