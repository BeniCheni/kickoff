import { COMPETITIONS, COMPETITION_KEYS, TABLE_LEAGUES, type CompetitionKey } from './competitions'
import { encodeLens, parseLens } from './lens'

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

export type Tab = 'fixtures' | 'table'
export type CalendarView = 'week' | 'month'
export const encodeTab = (tab: Tab): string | null => tab === 'fixtures' ? null : tab
export const parseTab = (raw: string): Tab => raw === 'table' ? 'table' : 'fixtures'
export const encodeView = (view: CalendarView): string | null => view === 'week' ? null : view
export const parseView = (raw: string): CalendarView => raw === 'month' ? 'month' : 'week'
export const encodeLeague = (league: CompetitionKey): string | null => league === 'laliga' ? null : league
export const parseLeague = (raw: string): CompetitionKey => TABLE_LEAGUES.includes(raw as CompetitionKey) ? raw as CompetitionKey : 'laliga'
export const encodeOnly = (active: ReadonlySet<CompetitionKey>): string | null =>
  active.size === COMPETITION_KEYS.length ? null : [...active].join(',')
export const encodeDate = (date: string, today: string): string | null => date === today ? null : date

/** Normalize only owned keys, using the renderers' codecs. Called once per App load,
 * not on ticks or page remounts: a previously nondefault date pin must survive becoming
 * today. Unknown parameters and an explicitly empty competition selection survive. */
export function canonicalSearch(search: string, today: string): string {
  const params = new URLSearchParams(search)
  const normalize = (key: string, codec: (raw: string) => string | null) => {
    const raw = params.get(key)
    if (raw === null) return
    const value = codec(raw)
    if (value === null) params.delete(key)
    else params.set(key, value)
  }
  normalize('tab', (s) => encodeTab(parseTab(s)))
  normalize('lens', (s) => encodeLens(parseLens(s)))
  normalize('view', (s) => encodeView(parseView(s)))
  normalize('date', (s) => encodeDate(parseDateParam(s, today), today))
  normalize('only', (s) => encodeOnly(parseOnlyParam(s)))
  normalize('league', (s) => encodeLeague(parseLeague(s)))
  const result = params.toString()
  return result ? `?${result}` : ''
}
