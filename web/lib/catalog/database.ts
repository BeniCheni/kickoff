import 'server-only'
import postgres from 'postgres'
import type { DemoSocial } from '@kickoff/demo'
import { demoFromRows } from '../demo/rows'
import { DemoReadError } from '../demo/read'
import { connectionOptions } from './connection'
import { asCatalogRows, catalogFromRows } from './hosted'
import { CatalogReadError, type CatalogSuccess } from './types'

let client: ReturnType<typeof postgres> | undefined
let openedFor: string | undefined

export function catalogClient(): ReturnType<typeof postgres> {
  const url = process.env.KICKOFF_DATABASE_URL
  if (!url) throw new CatalogReadError('catalog database address is not set', false)
  if (client && openedFor === url) return client
  const previous = client
  let opened: ReturnType<typeof postgres>
  try {
    opened = postgres(url, connectionOptions(url))
  } catch {
    throw new CatalogReadError('catalog database address is not usable', false)
  }
  client = opened
  openedFor = url
  if (previous) void previous.end({ timeout: 1 })
  return opened
}

export type HostedMoments = {
  catalog: CatalogSuccess
  demo: DemoSocial | null
  demoError: DemoReadError | null
}

type Bound = {
  (strings: TemplateStringsArray, ...values: never[]): Promise<unknown>
  savepoint<T>(fn: (tx: Bound) => Promise<T>): Promise<T>
}

/**
 * One read-only transaction for a Moments request.
 * postgres.js pipelines by default, and the transaction pooler cannot take that.
 * begin holds the single connection until commit, and each statement is awaited,
 * so a second request waits instead of sending another query early.
 * List and detail are the same snapshot.
 */
export async function loadHostedMoments(includeDemo: boolean): Promise<HostedMoments> {
  const client = catalogClient()
  try {
    return await client.begin('read only', async (tx: Bound) => {
      const list = asCatalogRows(await tx`SELECT * FROM catalog.videos ORDER BY position ASC, id ASC`)
      const detail = asCatalogRows(await tx`SELECT * FROM catalog.video ORDER BY position ASC, id ASC`)
      const catalog = catalogFromRows(list, detail)
      if (!includeDemo) return { catalog, demo: null, demoError: null }
      try {
        const demo = await tx.savepoint(async (sp) => {
          const users = asCatalogRows(await sp`SELECT * FROM demo.social_users ORDER BY id`)
          const stats = asCatalogRows(await sp`SELECT * FROM demo.social_stats ORDER BY video_id`)
          const comments = asCatalogRows(await sp`SELECT * FROM demo.social_comments ORDER BY id`)
          try {
            return demoFromRows(users, stats, comments)
          } catch {
            throw new DemoReadError('demo social failed validation', true)
          }
        })
        return { catalog, demo, demoError: null }
      } catch (error) {
        const demoError = error instanceof DemoReadError
          ? error
          : new DemoReadError('demo social could not be read', true)
        return { catalog, demo: null, demoError }
      }
    })
  } catch (error) {
    if (error instanceof CatalogReadError) throw error
    throw new CatalogReadError('catalog database read failed', false)
  }
}

/** List and detail only. Same transaction as a Moments request with the sample layer off. */
export async function loadHostedCatalog(): Promise<CatalogSuccess> {
  return (await loadHostedMoments(false)).catalog
}

export async function closeCatalogClient(): Promise<void> {
  const current = client
  client = undefined
  openedFor = undefined
  if (current) await current.end({ timeout: 1 })
}
