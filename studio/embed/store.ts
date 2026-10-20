import { sql } from 'drizzle-orm'
import { clipText, clipTextSha256 } from './text.ts'
import { CLIP_DIMS, EmbedError, type Embedder, type EmbedderIdentity, type EmbedReason } from './model.ts'

export type StoredClip = {
  videoId: string
  title: string
  editorialNote: string | null
  keyframePath: string | null
  keyframeSha256: string
}

export type StoreResult = {
  status: 'written' | 'skipped' | 'missing'
  reason?: EmbedReason
}

type Row = Record<string, unknown>

type VectorDatabase = {
  execute: (statement: ReturnType<typeof sql>) => Promise<unknown>
}

async function query(db: VectorDatabase, statement: ReturnType<typeof sql>): Promise<Row[]> {
  const result = await db.execute(statement)
  if (Array.isArray(result)) return result as Row[]
  if (result && typeof result === 'object' && 'rows' in result && Array.isArray((result as { rows: unknown }).rows)) {
    return (result as { rows: Row[] }).rows
  }
  return []
}

function vectorLiteral(values: readonly number[]): string {
  if (values.length !== CLIP_DIMS || values.some((value) => !Number.isFinite(value))) {
    throw new EmbedError('embed-failed', 'the vector is not 512 numbers')
  }
  return `[${values.join(',')}]`
}

const vectorSchemas = new WeakMap<VectorDatabase, string>()

async function vectorSchema(db: VectorDatabase): Promise<string> {
  const cached = vectorSchemas.get(db)
  if (cached) return cached
  const rows = await query(db, sql`
    SELECT n.nspname AS schema
    FROM pg_extension e
    JOIN pg_namespace n ON n.oid = e.extnamespace
    WHERE e.extname = 'vector'
  `)
  const schema = rows[0]?.schema
  if (typeof schema !== 'string' || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(schema)) {
    throw new EmbedError('write-failed', 'the vector extension schema is missing')
  }
  vectorSchemas.set(db, schema)
  return schema
}

async function sourceOf(
  db: VectorDatabase,
  videoId: string,
  kind: 'keyframe' | 'text',
  identity: EmbedderIdentity,
): Promise<string | null> {
  const rows = await query(db, sql`
    SELECT source_sha256
    FROM studio.clip_embeddings
    WHERE video_id = ${videoId}::uuid
      AND kind = ${kind}
      AND model_id = ${identity.model}
      AND revision = ${identity.revision}
      AND dtype = ${identity.dtype}
  `)
  const value = rows[0]?.source_sha256
  return typeof value === 'string' ? value : null
}

async function writeVector(
  db: VectorDatabase,
  videoId: string,
  kind: 'keyframe' | 'text',
  source: string,
  values: readonly number[],
  identity: EmbedderIdentity,
) {
  const literal = vectorLiteral(values)
  const schema = await vectorSchema(db)
  const cast = `'${literal}'::${schema}.vector`
  await db.execute(sql`
    INSERT INTO studio.clip_embeddings (
      video_id, kind, model_id, revision, dtype, dims, embedding, source_sha256
    ) VALUES (
      ${videoId}::uuid,
      ${kind},
      ${identity.model},
      ${identity.revision},
      ${identity.dtype},
      ${CLIP_DIMS},
      ${sql.raw(cast)},
      ${source}
    )
    ON CONFLICT (video_id, kind, model_id, revision, dtype)
    DO UPDATE SET
      embedding = EXCLUDED.embedding,
      source_sha256 = EXCLUDED.source_sha256,
      created_at = now()
  `)
}

/** Writes the keyframe and text vectors. A matching model and source hash is skipped. */
export async function storeClipEmbeddings(db: VectorDatabase, embedder: Embedder, clip: StoredClip): Promise<StoreResult> {
  const text = clipText(clip.title, clip.editorialNote)
  const textHash = clipTextSha256(clip.title, clip.editorialNote)
  let wrote = false
  try {
    const keyStored = await sourceOf(db, clip.videoId, 'keyframe', embedder.identity)
    if (keyStored !== clip.keyframeSha256) {
      if (!clip.keyframePath) throw new EmbedError('read-failed', 'the keyframe has no local file')
      const vector = await embedder.keyframe(clip.keyframePath)
      await writeVector(db, clip.videoId, 'keyframe', clip.keyframeSha256, vector, embedder.identity)
      wrote = true
    }
    const textStored = await sourceOf(db, clip.videoId, 'text', embedder.identity)
    if (textStored !== textHash) {
      const vector = await embedder.text(text)
      await writeVector(db, clip.videoId, 'text', textHash, vector, embedder.identity)
      wrote = true
    }
    return { status: wrote ? 'written' : 'skipped' }
  } catch (error) {
    if (error instanceof EmbedError) return { status: 'missing', reason: error.reason }
    return { status: 'missing', reason: 'write-failed' }
  }
}
