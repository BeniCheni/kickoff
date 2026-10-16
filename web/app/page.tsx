import { searchParamsToQuery } from '../../src/lib/urlCodecs'
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
  return <Shell search={searchParamsToQuery(entries)} />
}
