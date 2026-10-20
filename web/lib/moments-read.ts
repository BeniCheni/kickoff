import 'server-only'
import type { DemoSocial } from '@kickoff/demo'
import { loadCatalog } from './catalog/load'
import { loadHostedMoments } from './catalog/database'
import { watchIdFrom } from './catalog/request'
import { loadDemo } from './demo/load'
import { DemoReadError, readDemoFor, warnDemoRead } from './demo/read'
import type { CatalogSuccess } from './catalog/types'

export type MomentsRead = {
  catalog: CatalogSuccess
  demo: DemoSocial | null
  similar?: string[]
}

function demoEnv() {
  return {
    demo: process.env.KICKOFF_DEMO,
    demoFile: process.env.KICKOFF_DEMO_FILE,
    vercelEnv: process.env.VERCEL_ENV,
    catalog: process.env.KICKOFF_CATALOG,
  }
}

/**
 * One Moments read. A hosted catalog and its sample layer share one transaction,
 * so the list and the detail cannot come from two snapshots and the pooler
 * sees one statement at a time.
 */
export async function loadMomentsRead(search: string): Promise<MomentsRead> {
  const catalog = process.env.KICKOFF_CATALOG
  const hosted = catalog === undefined || catalog === '' || catalog === 'production'
  const watchId = watchIdFrom(search)
  if (!hosted) {
    const read = await loadCatalog()
    return { catalog: read, demo: await loadDemo(search), ...stubSimilar(read, watchId) }
  }

  let includeDemo = false
  try {
    const decided = readDemoFor(search, demoEnv(), () => {
      throw new DemoReadError('demo social file could not be read', true)
    })
    const bundle = await loadHostedMoments(false, watchId)
    return { catalog: bundle.catalog, demo: decided, ...(bundle.similar ? { similar: bundle.similar } : {}) }
  } catch (error) {
    if (error instanceof DemoReadError && error.message === 'demo social read is hosted') {
      includeDemo = true
    } else if (error instanceof DemoReadError) {
      warnDemoRead(error)
    } else {
      throw error
    }
  }
  const bundle = await loadHostedMoments(includeDemo, watchId)
  if (bundle.demoError) warnDemoRead(bundle.demoError)
  return { catalog: bundle.catalog, demo: bundle.demo, ...(bundle.similar ? { similar: bundle.similar } : {}) }
}

function stubSimilar(catalog: CatalogSuccess, watchId: string | null): { similar?: string[] } {
  if (!watchId || !catalog.similarById || !catalog.list.some(row => row.id === watchId)) return {}
  const ids = catalog.similarById[watchId]
  return ids && ids.length > 0 ? { similar: [...ids] } : {}
}
