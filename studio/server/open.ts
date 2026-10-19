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
import { createStorageStub } from '../storage/stub.ts'
import type { DatabaseEngine, DatabaseName, StorageName, TransportName } from '../shared/types.ts'
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

/**
 * A live admin starts with STUDIO_LIVE=1 and DATABASE_URL.
 * FAL_KEY is checked later, only behind Submit and Regenerate.
 * The browser has no way to set any of this.
 */
export function assertLiveStart(live: boolean, env: NodeJS.ProcessEnv): void {
  if (!live) return
  const missing: string[] = []
  if (env.STUDIO_LIVE !== '1') missing.push('STUDIO_LIVE')
  if (!env.DATABASE_URL) missing.push('DATABASE_URL')
  if (missing.length > 0) throw new Error(`refused: --live needs ${missing.join(' and ')}`)
}

/** Which database and storage a start will use. Live storage stays refused until ST3b wires R2. */
export function adminBackends(live: boolean, env: NodeJS.ProcessEnv): { databaseEngine: DatabaseEngine; storage: StorageName; pglite: boolean } {
  const pglite = !live || (env.STUDIO_ADMIN_LIVE_PGLITE === '1' && process.env.NODE_ENV === 'test')
  return {
    databaseEngine: pglite ? 'pglite' : 'postgres',
    storage: live ? 'refused' : 'stub',
    pglite,
  }
}

export async function openAdmin(env: NodeJS.ProcessEnv, live: boolean): Promise<OpenedAdmin> {
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
  const storagePort = backends.storage === 'refused'
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
  const fal = selectFalTransport({ argv: live ? ['--live'] : [], env: loaded, stub })
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
    falConfigured: !live || Boolean(loaded.FAL_KEY),
    script,
    outOfCredit: { current: script === 'out-of-credit' },
    clock,
    async close() {
      writeFileSync(cursorPath, JSON.stringify(cursor))
      await closeDb()
    },
  }
}
