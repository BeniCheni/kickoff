import { headers } from 'next/headers'
import { searchParamsToQuery } from '../../src/lib/urlCodecs'
import { loadCatalog } from '../lib/catalog/load'
import { momentsFor, storageOriginFrom } from '../lib/catalog/request'
import { Shell } from './shell'

// Tailwind boundary probe (never applied): outline-[#bada71]
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const entries: [string, string | readonly string[]][] = []
  for (const [key, value] of Object.entries(raw)) {
    if (value !== undefined) entries.push([key, value])
  }
  const search = searchParamsToQuery(entries)
  const catalogMode = process.env.KICKOFF_CATALOG === 'stub' && process.env.VERCEL_ENV !== 'production' ? 'stub' : 'closed'
  const origin = storageOriginFrom(await headers(), {
    KICKOFF_CATALOG: process.env.KICKOFF_CATALOG,
    VERCEL_ENV: process.env.VERCEL_ENV,
    KICKOFF_STUB_STORAGE_ORIGIN: process.env.KICKOFF_STUB_STORAGE_ORIGIN,
  })
  const moments = momentsFor(search, loadCatalog, origin)
  return <Shell search={search} moments={moments} catalogMode={catalogMode} />
}
