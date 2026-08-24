import { z } from 'zod'
import { COMPETITION_KEYS, type CompetitionKey } from './competitions'

/**
 * The shape of a fixture as stored in src/data/fixtures.json.
 *
 * The single most important decision here: the stored fact is `kickoffUtc`, an absolute
 * instant — NOT a calendar date plus a local time string. The prototype stored date and
 * local time as two independent fields, which is what let an entire Ligue 1 matchday sit
 * one day early without anything contradicting it. Stadium-local time and Brooklyn time
 * are both *derived* from this instant, so they can never disagree with each other or
 * with the source.
 */
export const teamSchema = z.object({
  name: z.string().min(1),
  /** ESPN's own id, kept so a rename upstream doesn't look like a different team. */
  sourceId: z.string().optional(),
})

export const fixtureSchema = z.object({
  /** Stable across syncs. The join key for later betting overlays (positions, tokens). */
  id: z.string().min(1),
  competition: z.enum(COMPETITION_KEYS as [CompetitionKey, ...CompetitionKey[]]),
  /** ISO-8601 instant, always UTC. The one authoritative time fact. */
  kickoffUtc: z.iso.datetime(),
  /** IANA zone of the stadium, for rendering the local kickoff. */
  venueTz: z.string().min(1),
  venue: z.string().optional(),
  home: teamSchema,
  away: teamSchema,
  status: z.enum(['scheduled', 'in_play', 'full_time', 'postponed', 'cancelled']),
  /**
   * Whether the *time* (not the date) is settled.
   *  - `exact`             the league has set the kickoff time
   *  - `round_placeholder` date is fixed, time is not; the source is showing a filler time
   *  - `tbd`               neither is settled
   * Rendering a placeholder as though it were exact is how the prototype came to claim a
   * confirmed 16:15 kickoff for a Clásico that LaLiga had not scheduled.
   */
  timeConfidence: z.enum(['exact', 'round_placeholder', 'tbd']),
  round: z.string().optional(),
  result: z.object({ home: z.number().int(), away: z.number().int() }).optional(),
  /** Hand-authored context. Preserved across syncs by fixture id — the sync never clobbers it. */
  note: z.string().optional(),
  source: z.object({
    provider: z.literal('espn'),
    sourceId: z.string(),
    fetchedAt: z.iso.datetime(),
  }),
})

export const metaSchema = z.object({
  lastSyncAt: z.iso.datetime(),
  provider: z.literal('espn'),
  window: z.object({ from: z.string(), to: z.string() }),
  counts: z.record(z.string(), z.number().int()),
  total: z.number().int(),
})

export const fixturesFileSchema = z.array(fixtureSchema)

export type Team = z.infer<typeof teamSchema>
export type Fixture = z.infer<typeof fixtureSchema>
export type SyncMeta = z.infer<typeof metaSchema>
export type FixtureStatus = Fixture['status']
export type TimeConfidence = Fixture['timeConfidence']

/**
 * Fixture identity.
 *
 * This is the provider's own event id, namespaced by competition — NOT a slug built from the
 * two team names. That distinction matters twice over:
 *
 *  - A league season contains BOTH legs of every pairing. A name-based id makes
 *    "Elche v Barcelona" in August and "Barcelona v Elche" in February look like one fixture
 *    that inverted, when they are two separate fixtures that both legitimately exist.
 *  - The provider keeps its event id stable when a fixture is rescheduled or relocated, which
 *    is exactly what the diff needs: the same fixture moving, rather than one disappearing
 *    and an unrelated one appearing.
 *
 * Consequence to keep in mind: ids are provider-scoped. A second provider added in a later
 * version matches on (competition, kickoff date, teams), not on this id.
 */
export function fixtureId(competition: CompetitionKey, sourceId: string): string {
  return `${competition}:${sourceId}`
}

/** Stable, human-readable label for logs and diff output. Not an identity. */
export function fixtureSlug(home: string, away: string): string {
  const slug = (s: string) =>
    s
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  return `${slug(home)}-v-${slug(away)}`
}
