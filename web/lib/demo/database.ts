import 'server-only'
import { loadHostedMoments } from '../catalog/database'
import { DemoReadError } from './read'

/** The three demo views, inside the same read-only transaction as the catalog. */
export async function readDemoFromDatabase() {
  const bundle = await loadHostedMoments(true)
  if (bundle.demoError) throw bundle.demoError
  if (!bundle.demo) throw new DemoReadError('demo social could not be read', true)
  return bundle.demo
}
