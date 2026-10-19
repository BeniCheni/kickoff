import { headers } from 'next/headers'
import { searchParamsToQuery } from '../../src/lib/urlCodecs'
import { loadCatalog } from '../lib/catalog/load'
import { requestStorageOrigin } from '../lib/catalog/origin'
import { momentsFor, tabIsMoments, watchIdFrom } from '../lib/catalog/request'
import { CatalogReadError, type MomentsPayload } from '../lib/catalog/types'
import { loadDemo } from '../lib/demo/load'
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
  const origin = requestStorageOrigin(await headers())
  const moments = await momentsPayload(search, origin)
  return <Shell search={search} moments={moments} catalogMode={catalogMode} />
}

async function momentsPayload(search: string, origin: string | null): Promise<MomentsPayload> {
  if (!tabIsMoments(search)) return { state: 'skipped' }
  try {
    const catalog = await loadCatalog()
    return momentsFor(search, () => catalog, origin, await loadDemo(search))
  } catch (error) {
    const preview = error instanceof CatalogReadError ? error.preview : false
    return { state: 'unavailable', preview, watchId: watchIdFrom(search) }
  }
}
