import 'server-only'
import { hostedStorageOrigin } from './addresses'
import { storageOriginFrom } from './request'

/** Stub keeps its loopback or explicit origin. A real catalog uses the https origin only. */
export function requestStorageOrigin(header: { get(name: string): string | null }): string | null {
  if (process.env.KICKOFF_CATALOG === 'stub' && process.env.VERCEL_ENV !== 'production') {
    return storageOriginFrom(header, {
      KICKOFF_CATALOG: process.env.KICKOFF_CATALOG,
      VERCEL_ENV: process.env.VERCEL_ENV,
      KICKOFF_STUB_STORAGE_ORIGIN: process.env.KICKOFF_STUB_STORAGE_ORIGIN,
    })
  }
  return hostedStorageOrigin(process.env.KICKOFF_STORAGE_ORIGIN)
}
