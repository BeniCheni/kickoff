import 'server-only'
import { readFileSync } from 'node:fs'
import { readCatalog, type CatalogSuccess } from './read'

function databaseAddress(): string | undefined {
  const value = process.env.KICKOFF_DATABASE_URL
  return value && value.length > 0 ? value : undefined
}

/** Server-only catalog read. Callers catch the throw and show the unavailable state. */
export function loadCatalog(): CatalogSuccess {
  return readCatalog({
    catalog: process.env.KICKOFF_CATALOG,
    stubFile: process.env.KICKOFF_STUB_CATALOG_FILE,
    databaseUrl: databaseAddress(),
    vercelEnv: process.env.VERCEL_ENV,
  }, file => readFileSync(file, 'utf8'))
}
