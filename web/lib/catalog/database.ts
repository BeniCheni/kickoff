import 'server-only'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import type { DemoSocial } from '@kickoff/demo'
import { demoFromRows } from '../demo/rows'
import { DemoReadError } from '../demo/read'
import { connectionOptions } from './connection'
import { asCatalogRows, catalogFromRows } from './hosted'
import { catalogFailure, isCatalogTimeout, warnSimilarRead } from './failure'
import { SIMILAR_MOMENTS } from './similar'
import { similarIdsFromRows } from './similar-rows'
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
  } catch (error) {
    if (error instanceof CatalogReadError) throw error
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
  /** Ids only. Absent when this request did not ask, or the similarity read kept nothing. */
  similar?: string[]
}

const DEFAULT_READ_TIMEOUT_MS = 8000

const momentsTransaction = {
  isolationLevel: 'repeatable read',
  accessMode: 'read only',
} as const

type MomentsTx = Parameters<Parameters<ReturnType<typeof drizzle>['transaction']>[0]>[0]

/** Eight seconds unless a test sets a shorter integer. Never longer. */
export function readTimeoutMs(env: NodeJS.ProcessEnv = process.env): number {
  const raw = env.KICKOFF_READ_TIMEOUT_MS
  if (raw === undefined || raw === '') return DEFAULT_READ_TIMEOUT_MS
  if (!/^[1-9][0-9]{0,3}$/.test(raw)) return DEFAULT_READ_TIMEOUT_MS
  const parsed = Number(raw)
  return parsed > DEFAULT_READ_TIMEOUT_MS ? DEFAULT_READ_TIMEOUT_MS : parsed
}

/**
 * One repeatable-read, read-only transaction for a Moments request.
 * Drizzle opens it with postgres.js `begin`, then `SET TRANSACTION`.
 * The pooler sees one statement at a time because each read is awaited,
 * and `max: 1` keeps the connection for this request alone.
 * Repeatable read is what makes the list and the detail one snapshot.
 */
export async function withMomentsTransaction<T>(work: (tx: MomentsTx) => Promise<T>): Promise<T> {
  const timeoutMs = readTimeoutMs()
  const db = drizzle(catalogClient())
  let timer: ReturnType<typeof setTimeout> | undefined
  const query = db.transaction(async (tx) => {
    await tx.execute(sql.raw(`SET LOCAL statement_timeout = ${timeoutMs}`))
    return work(tx)
  }, momentsTransaction)
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('catalog read deadline')), timeoutMs + 250)
  })
  query.catch(() => {})
  try {
    return await Promise.race([query, deadline])
  } catch (error) {
    if (isCatalogTimeout(error)) {
      await closeCatalogClient()
      throw new CatalogReadError('catalog database read timed out', false, 'timed out')
    }
    if (error instanceof CatalogReadError) throw error
    throw new CatalogReadError('catalog database read failed', false, catalogFailure(error))
  } finally {
    if (timer) clearTimeout(timer)
  }
}

export async function momentsTransactionSettings(): Promise<{ isolation: string, readOnly: string }> {
  return withMomentsTransaction(async (tx) => {
    const [row] = asCatalogRows(await tx.execute(sql`SELECT current_setting('transaction_isolation') AS isolation, current_setting('transaction_read_only') AS read_only`))
    const record = row as { isolation?: unknown, read_only?: unknown }
    return { isolation: String(record.isolation), readOnly: String(record.read_only) }
  })
}

const SIMILAR_RELATION = `catalog.${SIMILAR_MOMENTS}`

function similarMomentsQuery(watchId: string) {
  if (!/^catalog\.[a-z_]+$/.test(SIMILAR_RELATION)) {
    throw new CatalogReadError('similar row failed validation', false, 'read failed')
  }
  return sql`SELECT id, score FROM ${sql.raw(SIMILAR_RELATION)}(${watchId}, 6)`
}

/**
 * One similarity statement, inside a savepoint, after the list and the detail.
 * A refused, failing, or invalid read leaves the catalog in place.
 * A statement timeout is rethrown, the same way the demo savepoint rethrows one.
 */
async function readSimilar(tx: MomentsTx, catalog: CatalogSuccess, watchId: string | null): Promise<string[] | undefined> {
  if (!watchId) return undefined
  const listIds = new Set(catalog.list.map(row => row.id))
  if (!listIds.has(watchId)) return undefined
  try {
    const ids = await tx.transaction(async (sp) => {
      const rows = asCatalogRows(await sp.execute(similarMomentsQuery(watchId)))
      const kept = similarIdsFromRows(rows, listIds, watchId)
      return kept.length > 0 ? kept : undefined
    })
    return ids
  } catch (error) {
    if (isCatalogTimeout(error)) throw error
    warnSimilarRead(error)
    return undefined
  }
}

function withSimilar<T extends { catalog: CatalogSuccess, demo: DemoSocial | null, demoError: DemoReadError | null }>(
  bundle: T,
  similar: string[] | undefined,
): HostedMoments {
  return similar ? { ...bundle, similar } : bundle
}

export async function loadHostedMoments(includeDemo: boolean, watchId: string | null = null): Promise<HostedMoments> {
  return withMomentsTransaction(async (tx) => {
    const list = asCatalogRows(await tx.execute(sql`SELECT * FROM catalog.videos ORDER BY position ASC, id ASC`))
    const detail = asCatalogRows(await tx.execute(sql`SELECT * FROM catalog.video ORDER BY position ASC, id ASC`))
    const catalog = catalogFromRows(list, detail)
    const similar = await readSimilar(tx, catalog, watchId)
    if (!includeDemo) return withSimilar({ catalog, demo: null, demoError: null }, similar)
    try {
      const demo = await tx.transaction(async (sp) => {
        const users = asCatalogRows(await sp.execute(sql`SELECT * FROM demo.social_users ORDER BY id`))
        const stats = asCatalogRows(await sp.execute(sql`SELECT * FROM demo.social_stats ORDER BY video_id`))
        const comments = asCatalogRows(await sp.execute(sql`SELECT * FROM demo.social_comments ORDER BY id`))
        try {
          return demoFromRows(users, stats, comments)
        } catch {
          throw new DemoReadError('demo social failed validation', true)
        }
      })
      return withSimilar({ catalog, demo, demoError: null }, similar)
    } catch (error) {
      if (isCatalogTimeout(error)) throw error
      const demoError = error instanceof DemoReadError
        ? error
        : new DemoReadError('demo social could not be read', true)
      return withSimilar({ catalog, demo: null, demoError }, similar)
    }
  })
}

/** List and detail only. Same transaction as a Moments request with the sample layer off. */
export async function loadHostedCatalog(): Promise<CatalogSuccess> {
  return (await loadHostedMoments(false)).catalog
}

export async function closeCatalogClient(): Promise<void> {
  const current = client
  client = undefined
  openedFor = undefined
  if (current) await current.end({ timeout: 0 })
}
