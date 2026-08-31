import { COMPETITIONS, COMPETITION_KEYS, type CompetitionKey } from './competitions'

/**
 * Decoders for the shared URL params. Every decoder is total: junk input falls back to a
 * sane default instead of throwing mid-render or quietly filtering the app into an empty
 * state. The `?lens=` codec lives beside the lens type in lens.ts; these cover the rest.
 */

/**
 * A real calendar date, not just a date-shaped string — `2026-13-45` matches the shape
 * regex but sent `startOfWeek` through NaN into a render-time RangeError. The round-trip
 * through the Date parser rejects impossible dates (`2026-02-30`) too.
 */
export function parseDateParam(raw: string, fallback: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return fallback
  const parsed = new Date(`${raw}T12:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return fallback
  return parsed.toISOString().slice(0, 10) === raw ? raw : fallback
}

/**
 * Competition filters. Own keys only — `'toString' in COMPETITIONS` is true, so an `in`
 * check let prototype names pad the set to full size and vanish real filters from the
 * URL. An empty param is an explicitly cleared selection and stays empty; a param with
 * no valid key at all is junk and falls back to every competition.
 */
export function parseOnlyParam(raw: string): ReadonlySet<CompetitionKey> {
  if (raw === '') return new Set()
  const keys = raw.split(',').filter((k): k is CompetitionKey => Object.hasOwn(COMPETITIONS, k))
  return keys.length > 0 ? new Set(keys) : new Set(COMPETITION_KEYS)
}
