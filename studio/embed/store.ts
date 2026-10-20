import { sql } from 'drizzle-orm'
import { clipText, clipTextSha256 } from './text.ts'
import { CLIP_DIMS, CLIP_DTYPE, CLIP_MODEL, CLIP_REVISION, EmbedError, type Embedder, type EmbedReason } from './model.ts'

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
  if (values.length !== CLIP_DIMS) throw new EmbedError('embed-failed', 'the vector is not 512 numbers')
  return `[${values.join(',')}]`
}

async function sourceOf(db: VectorDatabase, videoId: string, kind: 'keyframe' | 'text'): Promise<string | null> {
  const rows = await query(db, sql`
    SELECT source_sha256
    FROM studio.clip_embeddings
    WHERE video_id = ${videoId}::uuid
      AND kind = ${kind}
      AND model_id = ${CLIP_MODEL}
      AND revision = ${CLIP_REVISION}
      AND dtype = ${CLIP_DTYPE}
  `)
  const value = rows[0]?.source_sha256
  return typeof value === 'string' ? value : null
}

async function writeVector(db: VectorDatabase, videoId: string, kind: 'keyframe' | 'text', source: string, values: readonly number[]) {
  const literal = vectorLiteral(values)
  await db.execute(sql`
    INSERT INTO studio.clip_embeddings (
      video_id, kind, model_id, revision, dtype, dims, embedding, source_sha256
    ) VALUES (
      ${videoId}::uuid,
      ${kind},
      ${CLIP_MODEL},
      ${CLIP_REVISION},
      ${CLIP_DTYPE},
      ${CLIP_DIMS},
      ${literal}::vector,
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
    const keyStored = await sourceOf(db, clip.videoId, 'keyframe')
    if (keyStored !== clip.keyframeSha256) {
      if (!clip.keyframePath) throw new EmbedError('read-failed', 'the keyframe has no local file')
      const vector = await embedder.keyframe(clip.keyframePath)
      await writeVector(db, clip.videoId, 'keyframe', clip.keyframeSha256, vector)
      wrote = true
    }
    const textStored = await sourceOf(db, clip.videoId, 'text')
    if (textStored !== textHash) {
      const vector = await embedder.text(text)
      await writeVector(db, clip.videoId, 'text', textHash, vector)
      wrote = true
    }
    return { status: wrote ? 'written' : 'skipped' }
  } catch (error) {
    if (error instanceof EmbedError) return { status: 'missing', reason: error.reason }
    return { status: 'missing', reason: 'write-failed' }
  }
}
