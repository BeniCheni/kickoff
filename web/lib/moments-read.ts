import 'server-only'
import type { DemoSocial } from '@kickoff/demo'
import { loadCatalog } from './catalog/load'
import { loadHostedMoments } from './catalog/database'
import { loadDemo } from './demo/load'
import { DemoReadError, readDemoFor, warnDemoRead } from './demo/read'
import type { CatalogSuccess } from './catalog/types'

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
export async function loadMomentsRead(search: string): Promise<{ catalog: CatalogSuccess, demo: DemoSocial | null }> {
  const catalog = process.env.KICKOFF_CATALOG
  const hosted = catalog === undefined || catalog === '' || catalog === 'production'
  if (!hosted) return { catalog: await loadCatalog(), demo: await loadDemo(search) }

  let includeDemo = false
  try {
    const decided = readDemoFor(search, demoEnv(), () => {
      throw new DemoReadError('demo social file could not be read', true)
    })
    const bundle = await loadHostedMoments(false)
    return { catalog: bundle.catalog, demo: decided }
  } catch (error) {
    if (error instanceof DemoReadError && error.message === 'demo social read is hosted') {
      includeDemo = true
    } else if (error instanceof DemoReadError) {
      warnDemoRead(error)
    } else {
      throw error
    }
  }
  const bundle = await loadHostedMoments(includeDemo)
  if (bundle.demoError) warnDemoRead(bundle.demoError)
  return { catalog: bundle.catalog, demo: bundle.demo }
}
