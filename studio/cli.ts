import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator'
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { CHECKLIST_LINES, type ChecklistAnswer, studioTables } from './db/schema.ts'
import { parseEnvFile, resolveEnvFile, runMigrate } from './db/migrate.ts'
import { COPY } from './copy.ts'
import { createStudio, type Studio, type StudioDatabase } from './engine.ts'
import { missingLivePieces, selectFalTransport } from './fal/live.ts'
import { createFalStub, type ScriptName, type StubCursor } from './fal/stub.ts'
import { sha256 } from './hash.ts'
import { redact } from './log/redact.ts'
import { estimateUsd, selectRegistry, unknownParam } from './registry.ts'
import { createR2Storage, missingR2 } from './storage/r2.ts'
import { createStorageStub } from './storage/stub.ts'

const here = path.dirname(fileURLToPath(import.meta.url))
const migrationsFolder = path.join(here, 'db', 'migrations')

const SCRIPTS: readonly ScriptName[] = [
  'queued-then-completed',
  'error-payload',
  'safety-refusal',
  'timeout',
  'expired-result',
  'duplicate-delivery',
  'out-of-credit',
]

const USAGE = [
  'estimate --endpoint <endpoint> [--duration <seconds>] [--resolution 480P] [--prompt <text>] [--seed <seed>]',
  'submit --endpoint <endpoint> --prompt <text> [--duration <seconds>] [--resolution 480P] [--seed <seed>] [--photo <file>] [--keyframe <file>] [--parent <generation-id>]',
  'poll --job <id>',
  'resume --job <id>',
  'download --job <id>',
  'import --file <clip.mp4> --keyframe <still.jpg> --source grok-imagine --prompt-file <prompt.txt> --subjects Fenway,Frankenstein --title <title> [--note <text>] [--made-on YYYY-MM-DD]',
  'list',
  'keep --job <id> --answers <clear|present|unsure>,... (five, checklist order)',
  'discard --job <id>',
  'cancel --job <id>',
  'publish --job <id> --public-id <slug> --title <title> --position <n> [--note <text>]',
  'unpublish --job <id> [--delete]',
  'retry-delete --job <id>',
  'retry-removal --job <id>',
  'close-session',
  'attach-request --job <id> --request-id <id>',
  'settle-unconfirmed --job <id> --not-accepted --evidence <text> [--amount <usd>]',
  'record-gate --answer <text> --disclosure <text> --by <name> --source <source>',
  'record-balance --amount <usd>',
  'migrate',
  'Offline unless --live is set together with STUDIO_LIVE=1 and the secret that command needs. Fal commands need FAL_KEY. publish, unpublish --delete and retry-delete also need the R2 names and DATABASE_URL. --live refuses, and names the missing piece.',
].join('\n')

export type CliIo = {
  stdout: (line: string) => void
  stderr: (line: string) => void
}

export function liveDatabaseArmed(argv: readonly string[], env: NodeJS.ProcessEnv): boolean {
  return argv.includes('--live') && env.STUDIO_LIVE === '1' && Boolean(env.DATABASE_URL)
}

function loadEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const next = { ...env }
  if (!next.STUDIO_ENV_FILE) return next
  const parsed = parseEnvFile(readFileSync(resolveEnvFile(next.STUDIO_ENV_FILE), 'utf8'))
  for (const [key, value] of Object.entries(parsed)) {
    if (!next[key]) next[key] = value
  }
  return next
}

function parseArgs(argv: readonly string[]) {
  const flags: Record<string, string> = {}
  let live = false
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--live') {
      live = true
      continue
    }
    if (arg === '--delete') {
      flags.delete = '1'
      continue
    }
    if (arg === '--not-accepted') {
      flags['not-accepted'] = '1'
      continue
    }
    if (!arg?.startsWith('--')) throw new Error(`unexpected argument ${arg ?? ''}`)
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) throw new Error(`missing value for ${arg}`)
    flags[arg.slice(2)] = value
    index += 1
  }
  return { flags, live }
}

function required(flags: Record<string, string>, key: string): string {
  const value = flags[key]
  if (!value) throw new Error(`missing --${key}`)
  return value
}

function paramsFrom(flags: Record<string, string>): Record<string, unknown> {
  const params: Record<string, unknown> = {}
  if (flags.prompt) params.prompt = flags.prompt
  if (flags.duration) params.duration = Number(flags.duration)
  if (flags.resolution) params.resolution = flags.resolution
  if (flags.seed) params.seed = flags.seed
  if (flags['image-size']) params.image_size = flags['image-size']
  if (flags.quality) params.quality = flags.quality
  return params
}

function clockFrom(env: NodeJS.ProcessEnv): () => Date {
  return () => (env.STUDIO_NOW ? new Date(env.STUDIO_NOW) : new Date())
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

function needsObjectStore(command: string, flags: Record<string, string>): boolean {
  return command === 'publish' || command === 'retry-delete' || (command === 'unpublish' && flags.delete === '1')
}

async function openStudio(env: NodeJS.ProcessEnv, live: boolean, objectStore: boolean) {
  const dataDir = resolveEnvFile(requiredEnv(env, 'STUDIO_DATA_DIR'))
  const mediaDir = resolveEnvFile(requiredEnv(env, 'STUDIO_MEDIA_DIR'))
  mkdirSync(dataDir, { recursive: true })
  mkdirSync(mediaDir, { recursive: true })
  const cursor = loadCursor(cursorFile(dataDir))
  const fails = new Set((env.STUDIO_STORAGE_FAIL ?? '').split(',').map((item) => item.trim()).filter(Boolean))
  const useR2 = live && env.STUDIO_LIVE === '1' && objectStore
  const storage = useR2
    ? { port: createR2Storage({ env }) }
    : createStorageStub({
      failVideo: fails.has('video'),
      failThumbnail: fails.has('thumbnail'),
      failFallback: fails.has('fallback'),
      failRemoval: fails.has('removal'),
      failRemove: fails.has('remove'),
      failRemoveVideo: fails.has('video-remove'),
      failRemoveThumbnail: fails.has('thumbnail-remove'),
    })
  const stub = createFalStub(scriptFrom(env), cursor)
  const fal = selectFalTransport({
    argv: live ? ['--live'] : [],
    env,
    stub,
  })
  const opened = await openDatabase(env, live, dataDir)
  const studio = createStudio({
    db: opened.db,
    fal,
    storage: storage.port,
    mediaDir,
    repoRoot: path.resolve(here, '..'),
    clock: clockFrom(env),
  })
  return {
    studio,
    async close() {
      writeFileSync(cursorFile(dataDir), JSON.stringify(cursor))
      await opened.close()
    },
  }
}

function requiredEnv(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key]
  if (!value) throw new Error(`${key} is not set. Point it at a directory outside the worktree.`)
  return value
}

async function openDatabase(env: NodeJS.ProcessEnv, live: boolean, dataDir: string): Promise<{
  db: StudioDatabase
  close: () => Promise<void>
}> {
  if (live && env.STUDIO_LIVE === '1' && env.DATABASE_URL) {
    const sql = postgres(env.DATABASE_URL, { prepare: false, max: 1 })
    const db = drizzlePostgres(sql, { schema: studioTables })
    return {
      db: db as unknown as StudioDatabase,
      close: async () => {
        await sql.end({ timeout: 5 })
      },
    }
  }
  const client = new PGlite(path.join(dataDir, 'pglite'))
  const db = drizzle(client, { schema: studioTables })
  await migratePglite(db, { migrationsFolder })
  return { db, close: () => client.close() }
}

function line(outcome: string, fields: Record<string, string | number | boolean | null | undefined> = {}): string {
  const parts = [outcome]
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null) parts.push(`${key}=${value}`)
  }
  return parts.join(' ')
}

function explain(io: CliIo, outcome: string) {
  if (outcome === 'database-unavailable') io.stdout(COPY.databaseUnavailable)
  if (outcome === 'out-of-credit') io.stdout(COPY.outOfCredit)
  if (outcome === 'refused') io.stdout(COPY.refused)
  if (outcome === 'timed-out') io.stdout(COPY.timedOut)
  if (outcome === 'gate-closed') io.stdout(COPY.gate)
  if (outcome === 'completed') io.stdout(COPY.completed)
  if (outcome === 'download-failed') io.stdout(COPY.downloadFailed)
  if (outcome === 'result-expired') io.stdout(COPY.resultExpired)
}

async function withStudio(
  env: NodeJS.ProcessEnv,
  live: boolean,
  objectStore: boolean,
  run: (studio: Studio) => Promise<void>,
): Promise<void> {
  const opened = await openStudio(env, live, objectStore)
  try {
    await run(opened.studio)
  } finally {
    await opened.close()
  }
}

export async function runCli(argv: readonly string[], env: NodeJS.ProcessEnv, io: CliIo): Promise<number> {
  try {
    const [command, ...rest] = argv
    if (!command || command === 'help') {
      io.stdout(USAGE)
      return 0
    }
    const loaded = loadEnv(env)
    const { flags, live } = parseArgs(rest)
    const touchesFal = new Set(['submit', 'poll', 'resume', 'download', 'cancel'])
    if (live && touchesFal.has(command)) {
      const missing = missingLivePieces(loaded)
      if (missing.length > 0) {
        io.stderr(`refused: --live needs ${missing.join(' and ')}`)
        return 1
      }
    }
    const transport = live && missingLivePieces(loaded).length === 0 ? 'live' : 'stub'
    if (command === 'migrate') {
      await runMigrate(loaded)
      io.stdout('migrated')
      return 0
    }
    if (command === 'estimate') {
      const endpoint = required(flags, 'endpoint')
      const params = paramsFrom(flags)
      const row = selectRegistry(endpoint, params, clockFrom(loaded)())
      if (!row) {
        io.stdout('not-in-registry')
        return 0
      }
      const unknown = unknownParam(row, params)
      if (unknown) {
        io.stdout(line('param-not-allowed', { param: unknown }))
        return 0
      }
      const usd = estimateUsd(row, params)
      if (!usd) {
        io.stdout('not-in-registry')
        return 0
      }
      io.stdout(line(usd, { tag: row.price.tag, registry: row.id }))
      return 0
    }

    const objectStore = needsObjectStore(command, flags)
    if (live && loaded.STUDIO_LIVE === '1' && objectStore) {
      const missing = [...missingR2(loaded)]
      if (!loaded.DATABASE_URL?.trim()) missing.push('DATABASE_URL')
      if (missing.length > 0) {
        io.stderr(`refused: --live needs ${missing.join(' and ')}`)
        return 1
      }
    }

    await withStudio(loaded, live, objectStore, async (studio) => {
      if (command === 'submit') {
        const endpoint = required(flags, 'endpoint')
        const prompt = required(flags, 'prompt')
        const photograph = flags.photo ? new Uint8Array(readFileSync(resolveEnvFile(flags.photo))) : undefined
        const keyframe = flags.keyframe
          ? (() => {
              const localPath = resolveEnvFile(flags.keyframe ?? '')
              const bytes = readFileSync(localPath)
              return { localPath, sha256: sha256(bytes), bytes: bytes.byteLength }
            })()
          : undefined
        const result = await studio.submit({
          endpoint,
          prompt,
          params: paramsFrom(flags),
          seed: flags.seed,
          photograph,
          parentGenerationId: flags.parent,
          keyframe,
        })
        if (result.outcome === 'submitted') {
          io.stdout(line('submitted', { job: result.jobId, request: result.requestId, sha256: result.sentSha256, transport }))
          return
        }
        if (result.outcome === 'budget-refused' || result.outcome === 'cache-hit' || result.outcome === 'in-flight' || result.outcome === 'submit-unconfirmed' || result.outcome === 'urls-unusable' || result.outcome === 'failed' || result.outcome === 'refused' || result.outcome === 'database-unavailable') {
          io.stdout(line(result.outcome, { job: 'jobId' in result ? result.jobId : undefined, transport }))
          return
        }
        io.stdout(line(result.outcome, { transport }))
        explain(io, result.outcome)
        return
      }
      if (command === 'poll' || command === 'resume') {
        const result = command === 'poll'
          ? await studio.poll(required(flags, 'job'))
          : await studio.resume(required(flags, 'job'))
        io.stdout(line(result.outcome, { job: 'jobId' in result ? result.jobId : undefined, transport }))
        explain(io, result.outcome)
        return
      }
      if (command === 'download') {
        const result = await studio.download(required(flags, 'job'))
        io.stdout(line(result.outcome, { transport }))
        explain(io, result.outcome)
        return
      }
      if (command === 'import') {
        const video = new Uint8Array(readFileSync(resolveEnvFile(required(flags, 'file'))))
        const keyframe = new Uint8Array(readFileSync(resolveEnvFile(required(flags, 'keyframe'))))
        const prompt = readFileSync(resolveEnvFile(required(flags, 'prompt-file')), 'utf8')
        const result = await studio.importClip({
          video,
          keyframe,
          source: required(flags, 'source'),
          prompt,
          subjects: required(flags, 'subjects').split(','),
          title: required(flags, 'title'),
          note: flags.note,
          madeOn: flags['made-on'],
        })
        if (result.outcome === 'imported') {
          io.stdout(line('imported', {
            job: result.jobId,
            sha256: result.sha256,
            width: result.width,
            height: result.height,
            duration: result.durationS,
            container: result.container,
            codec: result.videoCodec,
            audio: result.audio,
            fps: result.frameRate,
            transport,
          }))
          return
        }
        if (result.outcome === 'clip-refused' && result.reason === 'not-mp4') {
          io.stdout('refused: not an mp4')
          return
        }
        if (result.outcome === 'clip-refused' && result.reason === 'no-video') {
          io.stdout('refused: missing a video track')
          return
        }
        if (result.outcome === 'clip-refused') {
          io.stdout('refused: duration is zero')
          return
        }
        if (result.outcome === 'not-a-jpeg') {
          io.stdout('refused: keyframe is not a jpeg')
          return
        }
        if (result.outcome === 'already-imported') {
          io.stdout('refused: this file was already imported')
          return
        }
        if (result.outcome === 'needs-made-on') {
          io.stdout('refused: pass --made-on YYYY-MM-DD; the clip has no creation time')
          return
        }
        if (result.outcome === 'made-on-invalid') {
          io.stdout('refused: --made-on must be YYYY-MM-DD')
          return
        }
        if (result.outcome === 'source-refused') {
          io.stdout('refused: source must be grok-imagine')
          return
        }
        if (result.outcome === 'subject-refused') {
          io.stdout('refused: subjects must be Fenway or Frankenstein')
          return
        }
        if (result.outcome === 'prompt-empty') {
          io.stdout('refused: the prompt file is empty')
          return
        }
        if (result.outcome === 'title-empty') {
          io.stdout('refused: the title is empty')
          return
        }
        throw new Error('unexpected import result')
      }
      if (command === 'list') {
        const rows = await studio.list()
        if (rows.length === 0) io.stdout('none')
        for (const row of rows) {
          io.stdout(line(row.status, {
            job: row.id,
            substate: row.substate,
            estimate: row.estimateUsd,
            billed: row.billed,
            publishable: row.publishable,
          }))
        }
        return
      }
      if (command === 'keep') {
        const answers = required(flags, 'answers').split(',')
        if (answers.length !== CHECKLIST_LINES.length) throw new Error('keep needs five answers')
        const result = await studio.keep(required(flags, 'job'), CHECKLIST_LINES.map((lineId, index) => ({
          line: lineId,
          answer: answers[index] as ChecklistAnswer,
          by: flags.by ?? 'operator',
        })))
        io.stdout(result.outcome)
        return
      }
      if (command === 'discard') {
        io.stdout((await studio.discard(required(flags, 'job'))).outcome)
        return
      }
      if (command === 'cancel') {
        const result = await studio.cancel(required(flags, 'job'))
        io.stdout(line(result.outcome, {
          charge: 'chargeRetained' in result ? result.chargeRetained : undefined,
          hint: 'hint' in result ? result.hint : undefined,
          transport,
        }))
        return
      }
      if (command === 'close-session') {
        const result = await studio.closeSession()
        io.stdout(line(result.outcome, {
          total: result.outcome === 'closed' ? result.totalUsd : undefined,
          jobs: result.outcome === 'close-refused' ? result.jobIds.join(',') : undefined,
        }))
        return
      }
      if (command === 'settle-unconfirmed') {
        const result = await studio.settleUnconfirmed({
          jobId: required(flags, 'job'),
          notAccepted: flags['not-accepted'] === '1',
          evidence: required(flags, 'evidence'),
          ...(flags.amount ? { amountUsd: flags.amount } : {}),
        })
        io.stdout(line(result.outcome, { job: 'jobId' in result ? result.jobId : undefined }))
        return
      }
      if (command === 'attach-request') {
        const result = await studio.attachRequest({
          jobId: required(flags, 'job'),
          requestId: required(flags, 'request-id'),
        })
        io.stdout(line(result.outcome, { job: 'jobId' in result ? result.jobId : undefined }))
        return
      }
      if (command === 'record-gate') {
        const result = await studio.recordGate({
          answer: required(flags, 'answer'),
          disclosure: required(flags, 'disclosure'),
          recordedBy: required(flags, 'by'),
          source: required(flags, 'source'),
        })
        io.stdout(line(result.outcome, { recordedOn: 'recordedOn' in result ? result.recordedOn : undefined }))
        return
      }
      if (command === 'record-balance') {
        const result = await studio.recordBalance(required(flags, 'amount'))
        io.stdout(line('balance', {
          amount: result.amountUsd,
          aboveCeiling: result.aboveCeiling,
          readFromFal: result.readFromFal,
        }))
        return
      }
      if (command === 'publish') {
        const result = await studio.publish({
          jobId: required(flags, 'job'),
          publicId: required(flags, 'public-id'),
          title: required(flags, 'title'),
          position: Number(required(flags, 'position')),
          editorialNote: flags.note,
        })
        if (result.outcome === 'card-refused') {
          io.stdout(`card-refused: missing ${result.missing.join('; missing ')}`)
          return
        }
        io.stdout(line(result.outcome, {
          live: 'live' in result ? result.live : undefined,
          retryable: 'retryable' in result ? result.retryable : undefined,
          object: 'object' in result ? result.object : undefined,
        }))
        explain(io, result.outcome)
        return
      }
      if (command === 'unpublish') {
        const result = await studio.unpublish(required(flags, 'job'), { deleteFiles: flags.delete === '1' })
        io.stdout(line(result.outcome, {
          removal: 'removal' in result ? result.removal : undefined,
          filesReadable: 'filesReadable' in result ? result.filesReadable : undefined,
          live: 'live' in result ? result.live : undefined,
        }))
        return
      }
      if (command === 'retry-delete') {
        const result = await studio.retryDelete(required(flags, 'job'))
        io.stdout(line(result.outcome, {
          filesReadable: 'filesReadable' in result ? result.filesReadable : undefined,
          idempotent: 'idempotent' in result ? result.idempotent : undefined,
        }))
        return
      }
      if (command === 'retry-removal') {
        const result = await studio.retryRemoval(required(flags, 'job'))
        io.stdout(line(result.outcome, { idempotent: 'idempotent' in result ? result.idempotent : undefined }))
        return
      }
      throw new Error(`unknown command ${command}`)
    })
    return 0
  } catch (error) {
    io.stderr(redact(error instanceof Error ? error.message : 'studio failed'))
    return 1
  }
}

const invokedDirectly = process.argv[1] !== undefined
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (invokedDirectly) {
  runCli(process.argv.slice(2), process.env, {
    stdout: (message) => process.stdout.write(`${message}\n`),
    stderr: (message) => process.stderr.write(`${redact(message)}\n`),
  }).then((code) => {
    process.exitCode = code
  })
}
