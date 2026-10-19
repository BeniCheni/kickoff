import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator'
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { parseEnvFile, resolveEnvFile } from '../db/migrate.ts'
import { studioTables } from '../db/schema.ts'
import { createStudio, type Studio, type StudioDatabase } from '../engine.ts'
import { selectFalTransport } from '../fal/live.ts'
import { createFalStub, type ScriptName, type StubCursor } from '../fal/stub.ts'
import { createR2Storage, missingR2 } from '../storage/r2.ts'
import { createStorageStub } from '../storage/stub.ts'
import type { DatabaseEngine, DatabaseName, FalMode, StorageName, TransportName } from '../shared/types.ts'
import { createRefusingFal } from './fal-refused.ts'
import { probeDatabase } from './probe.ts'
import { createRefusingStorage } from './storage-refused.ts'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '../..')
const migrationsFolder = path.resolve(here, '../db/migrations')

const SCRIPTS: readonly ScriptName[] = [
  'queued-then-completed',
  'error-payload',
  'safety-refusal',
  'timeout',
  'expired-result',
  'duplicate-delivery',
  'out-of-credit',
]

export type OpenedAdmin = {
  studio: Studio
  db: StudioDatabase
  mediaDir: string
  transport: TransportName
  database: DatabaseName
  /** Set when a test forces the paused banner. A live probe does not clear it. */
  databaseHold: boolean
  databaseEngine: DatabaseEngine
  storage: StorageName
  /** Set only when the test inject fetch is the R2 port. Never on a real Postgres start. */
  storageFetch: 'injected' | null
  fal: FalMode
  falConfigured: boolean
  script: ScriptName
  outOfCredit: { current: boolean }
  clock: () => Date
  close: () => Promise<void>
}

function requiredEnv(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key]
  if (!value) throw new Error(`${key} is not set. Point it at a directory outside the worktree.`)
  return value
}

function loadEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const next = { ...env }
  if (!next.STUDIO_ENV_FILE) return next
  const parsed = parseEnvFile(readFileSync(resolveEnvFile(next.STUDIO_ENV_FILE, repoRoot), 'utf8'))
  for (const [key, value] of Object.entries(parsed)) {
    if (!next[key]) next[key] = value
  }
  return next
}

function scriptFrom(env: NodeJS.ProcessEnv): ScriptName {
  const name = env.STUDIO_STUB ?? 'queued-then-completed'
  if (!(SCRIPTS as readonly string[]).includes(name)) throw new Error(`unknown stub script ${name}`)
  return name as ScriptName
}

function cursorFile(dataDir: string): string {
  return path.join(dataDir, 'stub-cursor.json')
}

function loadCursor(file: string): StubCursor {
  if (!existsSync(file)) return { statusCalls: 0, requestSequence: 0 }
  const parsed = JSON.parse(readFileSync(file, 'utf8')) as Partial<StubCursor>
  return {
    statusCalls: typeof parsed.statusCalls === 'number' ? parsed.statusCalls : 0,
    requestSequence: typeof parsed.requestSequence === 'number' ? parsed.requestSequence : 0,
  }
}

export type OpenAdminOptions = {
  /** Test seam. Live R2 uses this fetch and never the network. */
  fetchImpl?: typeof fetch
}

/**
 * A live admin starts with STUDIO_LIVE=1 and DATABASE_URL.
 * It never opens the local database. FAL_KEY is checked later, behind each fal action.
 * The four R2 names select the R2 adapter. Without them, storage stays refused.
 * The browser has no way to set any of this.
 */
export function assertLiveStart(live: boolean, env: NodeJS.ProcessEnv): void {
  if (!live) return
  const missing: string[] = []
  if (env.STUDIO_LIVE !== '1') missing.push('STUDIO_LIVE')
  if (!env.DATABASE_URL) missing.push('DATABASE_URL')
  if (missing.length > 0) throw new Error(`refused: --live needs ${missing.join(' and ')}`)
}

/** Which database and storage a start will use. Live never falls back to PGlite. */
export function adminBackends(live: boolean, env: NodeJS.ProcessEnv): { databaseEngine: DatabaseEngine; storage: StorageName; pglite: boolean } {
  const pglite = !live || (env.STUDIO_ADMIN_LIVE_PGLITE === '1' && process.env.NODE_ENV === 'test')
  const storage: StorageName = !live ? 'stub' : missingR2(env).length === 0 ? 'r2' : 'refused'
  return {
    databaseEngine: pglite ? 'pglite' : 'postgres',
    storage,
    pglite,
  }
}

export async function openAdmin(env: NodeJS.ProcessEnv, live: boolean, options: OpenAdminOptions = {}): Promise<OpenedAdmin> {
  const loaded = loadEnv(env)
  assertLiveStart(live, loaded)
  const dataDir = resolveEnvFile(requiredEnv(loaded, 'STUDIO_DATA_DIR'), repoRoot)
  const mediaDir = resolveEnvFile(requiredEnv(loaded, 'STUDIO_MEDIA_DIR'), repoRoot)
  mkdirSync(dataDir, { recursive: true })
  mkdirSync(mediaDir, { recursive: true })
  const cursorPath = cursorFile(dataDir)
  const cursor = loadCursor(cursorPath)
  const fails = new Set((loaded.STUDIO_STORAGE_FAIL ?? '').split(',').map((item) => item.trim()).filter(Boolean))
  const backends = adminBackends(live, loaded)
  if (loaded.STUDIO_R2_FETCH === 'inject' && !backends.pglite) {
    throw new Error('refused: STUDIO_R2_FETCH=inject needs the PGlite test seam')
  }
  const injectedFetch: typeof fetch | undefined = backends.pglite && process.env.NODE_ENV === 'test' && loaded.STUDIO_R2_FETCH === 'inject'
    ? async (input, init) => {
      void input
      return new Response(null, { status: init?.method === 'DELETE' ? 204 : 200 })
    }
    : undefined
  if (backends.storage === 'r2' && process.env.NODE_ENV === 'test' && !options.fetchImpl && !injectedFetch) {
    throw new Error('refused: a test live R2 start needs an injected fetch')
  }
  const storagePort = backends.storage === 'r2'
    ? createR2Storage({ env: loaded, fetchImpl: options.fetchImpl ?? injectedFetch })
    : backends.storage === 'refused'
      ? createRefusingStorage()
      : createStorageStub({
        failVideo: fails.has('video'),
        failThumbnail: fails.has('thumbnail'),
        failFallback: fails.has('fallback'),
        failRemoval: fails.has('removal'),
        failRemove: fails.has('remove'),
        failRemoveVideo: fails.has('video-remove'),
        failRemoveThumbnail: fails.has('thumbnail-remove'),
      }).port
  const script = scriptFrom(loaded)
  const stub = createFalStub(script, cursor)
  const falMode: FalMode = !live ? 'stub' : loaded.FAL_KEY ? 'live' : 'refused'
  const fal = falMode === 'refused'
    ? createRefusingFal()
    : selectFalTransport({ argv: live ? ['--live'] : [], env: loaded, stub })
  const transport: TransportName = live ? 'live' : 'stub'
  const databaseHold = loaded.STUDIO_ADMIN_DATABASE === 'unavailable'
  const clock = () => (loaded.STUDIO_NOW ? new Date(loaded.STUDIO_NOW) : new Date())

  let db: StudioDatabase
  let closeDb: () => Promise<void>
  if (!backends.pglite) {
    const sql = postgres(loaded.DATABASE_URL ?? '', { prepare: false, max: 1, connect_timeout: 5 })
    db = drizzlePostgres(sql, { schema: studioTables }) as unknown as StudioDatabase
    closeDb = async () => {
      await sql.end({ timeout: 5 })
    }
  } else {
    const client = new PGlite(path.join(dataDir, 'pglite'))
    const opened = drizzle(client, { schema: studioTables })
    await migratePglite(opened, { migrationsFolder })
    db = opened
    closeDb = () => client.close()
  }

  const studio = createStudio({ db, fal, storage: storagePort, mediaDir, repoRoot, clock })
  let database: DatabaseName = databaseHold ? 'unavailable' : 'reachable'
  if (!databaseHold && !(await probeDatabase(db))) database = 'unavailable'
  return {
    studio,
    db,
    mediaDir,
    transport,
    database,
    databaseHold,
    databaseEngine: backends.databaseEngine,
    storage: backends.storage,
    storageFetch: injectedFetch ? 'injected' : null,
    fal: falMode,
    falConfigured: falMode !== 'refused',
    script,
    outOfCredit: { current: script === 'out-of-credit' },
    clock,
    async close() {
      writeFileSync(cursorPath, JSON.stringify(cursor))
      await closeDb()
    },
  }
}
