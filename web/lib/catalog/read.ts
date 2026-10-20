import { catalogDetailRowSchema, catalogListRowSchema, publishedListColumns, type CatalogDetailRow, type CatalogListRow } from '@kickoff/catalog'
import { CatalogReadError, type CatalogSuccess } from './types'

export type { CatalogSuccess }

export type CatalogEnv = {
  catalog: string | undefined
  stubFile: string | undefined
  databaseUrl: string | undefined
  vercelEnv: string | undefined
}

function projectList(detail: CatalogDetailRow): CatalogListRow {
  const row = {
    id: detail.id,
    title: detail.title,
    position: detail.position,
    published_at: detail.published_at,
    thumbnail_bucket: detail.thumbnail_bucket,
    thumbnail_object_path: detail.thumbnail_object_path,
    mime: detail.mime,
    width: detail.width,
    height: detail.height,
    duration_s: detail.duration_s,
    generated_at: detail.generated_at,
    editorial_note: detail.editorial_note,
    subjects: detail.subjects,
  }
  const parsed = catalogListRowSchema.safeParse(row)
  if (!parsed.success) throw new CatalogReadError('catalog list row failed validation', true)
  const keys = Object.keys(parsed.data)
  if (keys.length !== publishedListColumns.length || publishedListColumns.some(key => !keys.includes(key))) {
    throw new CatalogReadError('catalog list row failed validation', true)
  }
  return parsed.data
}

function readStub(text: string): CatalogSuccess {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new CatalogReadError('stub catalog file is not JSON', true)
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new CatalogReadError('stub catalog file is not an object', true)
  }
  const body = parsed as Record<string, unknown>
  if (body.mode === 'unavailable') throw new CatalogReadError('stub catalog is unavailable', true)
  if (!Array.isArray(body.videos)) throw new CatalogReadError('stub catalog has no video list', true)
  const details: CatalogDetailRow[] = []
  const seen = new Set<string>()
  for (const video of body.videos) {
    const row = catalogDetailRowSchema.safeParse(video)
    if (!row.success) throw new CatalogReadError('stub catalog video failed validation', true)
    if (seen.has(row.data.id)) throw new CatalogReadError('stub catalog repeated an id', true)
    seen.add(row.data.id)
    details.push(row.data)
  }
  const similarById = readSimilarMap(body, seen)
  return {
    preview: true,
    details,
    list: details.map(projectList),
    ...(similarById ? { similarById } : {}),
  }
}

function readSimilarMap(body: Record<string, unknown>, ids: ReadonlySet<string>): Record<string, string[]> | undefined {
  if (!Object.prototype.hasOwnProperty.call(body, 'similar')) return undefined
  const similar = body.similar
  if (similar === null || typeof similar !== 'object' || Array.isArray(similar)) {
    throw new CatalogReadError('stub catalog video failed validation', true)
  }
  const out: Record<string, string[]> = {}
  for (const [key, value] of Object.entries(similar)) {
    if (!ids.has(key) || !Array.isArray(value) || value.length > 6) {
      throw new CatalogReadError('stub catalog video failed validation', true)
    }
    const seen = new Set<string>()
    const list: string[] = []
    for (const item of value) {
      if (typeof item !== 'string' || !ids.has(item) || item === key || seen.has(item)) {
        throw new CatalogReadError('stub catalog video failed validation', true)
      }
      seen.add(item)
      list.push(item)
    }
    out[key] = list
  }
  return out
}

/**
 * One read. Either a validated list and its detail rows, or a throw.
 * Stub is opt-in. There is no baked-in file path. A hosted address is not opened
 * here. The throw is not replaced with stub rows.
 */
export function readCatalog(env: CatalogEnv, readFile: (file: string) => string): CatalogSuccess {
  if (env.catalog === 'stub') {
    if (env.vercelEnv === 'production') throw new CatalogReadError('stub catalog refused', false)
    if (!env.stubFile) throw new CatalogReadError('stub catalog file is not set', true)
    let text: string
    try {
      text = readFile(env.stubFile)
    } catch {
      throw new CatalogReadError('stub catalog file could not be read', true)
    }
    return readStub(text)
  }
  if (env.catalog === undefined || env.catalog === '' || env.catalog === 'production') {
    if (!env.databaseUrl) throw new CatalogReadError('catalog database address is not set', false)
    throw new CatalogReadError('catalog database read is hosted', false)
  }
  throw new CatalogReadError('unknown catalog mode', false)
}
