import { headers } from 'next/headers'
import { searchParamsToQuery } from '../../src/lib/urlCodecs'
import { requestStorageOrigin } from '../lib/catalog/origin'
import { momentsFor, tabIsMoments, watchIdFrom } from '../lib/catalog/request'
import { warnCatalogRead } from '../lib/catalog/failure'
import { CatalogReadError, type MomentsPayload } from '../lib/catalog/types'
import { loadMomentsRead } from '../lib/moments-read'
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
    const read = await loadMomentsRead(search)
    return momentsFor(search, () => read.catalog, origin, read.demo, read.similar)
  } catch (error) {
    warnCatalogRead(error)
    const preview = error instanceof CatalogReadError ? error.preview : false
    return { state: 'unavailable', preview, watchId: watchIdFrom(search) }
  }
}
