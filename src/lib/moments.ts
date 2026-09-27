import { z } from 'zod'
import rawMoments from '../curated/moments.json'
import { FIXTURES } from './fixtures'
import { fixtureSchema, type Fixture } from './schema'

export const MOMENT_CATEGORIES = ['prematch', 'highlights', 'celebrations'] as const
const webUrl = z.url({ protocol: /^https?$/ })
const text = z.string().trim().min(1)
export const youtubeVideoIdSchema = z.string().regex(/^[A-Za-z0-9_-]{11}$/, 'An 11-character YouTube video ID')

/** New playback identities accept only these HTTPS watch destinations, never HTML. */
export function youtubeIdFromUrl(value: string): string | null {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash) return null
    const keys = [...url.searchParams.keys()]
    let id: string | null = null
    if (url.hostname === 'youtu.be' && keys.length === 0) id = url.pathname.slice(1)
    if (['youtube.com', 'www.youtube.com'].includes(url.hostname) && url.pathname === '/watch'
      && keys.length === 1 && keys[0] === 'v') id = url.searchParams.get('v')
    return youtubeVideoIdSchema.safeParse(id).success ? id : null
  } catch { return null }
}

export const playbackIdentitySchema = z.object({
  provider: z.literal('youtube'),
  videoId: youtubeVideoIdSchema,
}).strict()

export const availabilityObservationSchema = z.object({
  observedAt: z.iso.datetime(),
  environment: text,
  outcome: z.enum(['played', 'owner-blocked', 'unavailable', 'unknown']),
  providerError: z.number().int().nonnegative().optional(),
  note: text,
}).strict().superRefine((observation, ctx) => {
  if (observation.providerError === 150 && observation.outcome !== 'owner-blocked') {
    ctx.addIssue({ code: 'custom', message: 'Error 150 records an owner block, not an unknown or territory diagnosis' })
  }
})
export type AvailabilityObservation = z.infer<typeof availabilityObservationSchema>

/** Observations belong to one source; an unknown result cannot erase known evidence. */
export function latestKnownAvailability(observations: readonly AvailabilityObservation[]): AvailabilityObservation | undefined {
  const dated = [...observations].sort((a, b) => Date.parse(b.observedAt) - Date.parse(a.observedAt))
  return dated.find(o => o.outcome !== 'unknown') ?? dated[0]
}

const permissionSchema = z.object({
  use: z.enum(['link', 'embed', 'thumbnail', 'still', 'preview', 'hosted-video']),
  status: z.enum(['unknown', 'permitted', 'denied', 'revoked']),
  checkedAt: z.iso.datetime(),
  basis: text,
  expiresAt: z.iso.datetime().optional(),
}).strict()
const sourceSchema = z.object({
  name: text,
  // Legacy links stay valid and link-only. Declaring an identity opts into the allowlist.
  url: webUrl,
  identity: playbackIdentitySchema.optional(),
  content: z.object({
    scope: z.enum(['standalone-moment', 'highlights', 'compilation', 'commentary-reaction', 'celebration', 'preview', 'unknown']),
    description: text,
    verification: z.enum(['watched', 'source-described', 'unverified']),
  }).strict().optional(),
  availability: z.array(availabilityObservationSchema).optional(),
  permissions: z.array(permissionSchema).optional(),
}).strict().superRefine((source, ctx) => {
  if (source.identity && youtubeIdFromUrl(source.url) !== source.identity.videoId) {
    ctx.addIssue({ code: 'custom', path: ['url'], message: 'Source URL must be an allowlisted YouTube watch URL for the declared video ID' })
  }
  if (source.availability?.length && !source.identity) {
    ctx.addIssue({ code: 'custom', path: ['availability'], message: 'Playback observations need a source identity' })
  }
  const uses = source.permissions?.map(p => p.use) ?? []
  if (new Set(uses).size !== uses.length) ctx.addIssue({ code: 'custom', path: ['permissions'], message: 'One current permission decision per intended use' })
})
// Curation owns these facts after a fixture leaves the rolling snapshot. The extra
// clock fields prevent a lost zone or a placeholder becoming an invented local time.
const momentFixtureSchema = fixtureSchema.pick({
  home: true, away: true, kickoffUtc: true, competition: true,
  venueTz: true, timeConfidence: true, status: true,
})
export const momentSchema = z.object({
  id: z.string().trim().min(1),
  category: z.enum(MOMENT_CATEGORIES),
  fixtureId: z.string().min(1),
  title: z.string().trim().min(1),
  source: sourceSchema,
  still: z.object({ url: webUrl, credit: z.string().trim().min(1) }).optional(),
  curatedAt: z.iso.datetime(),
  fixture: momentFixtureSchema,
  editorial: z.object({ note: text, neutralTitle: text.optional(), neutralNote: text.optional() }).strict().optional(),
  collections: z.array(z.object({ id: text, order: z.number().int().nonnegative() }).strict()).optional(),
}).strict()
export const momentsSchema = z.array(momentSchema).superRefine((moments, ctx) => {
  const ids = new Set<string>()
  const slots = new Set<string>()
  for (const [index, moment] of moments.entries()) {
    if (ids.has(moment.id)) ctx.addIssue({ code: 'custom', path: [index, 'id'], message: 'Moment ids must be unique' })
    ids.add(moment.id)
    const memberships = new Set<string>()
    for (const member of moment.collections ?? []) {
      const slot = JSON.stringify([member.id, member.order])
      if (memberships.has(member.id) || slots.has(slot)) {
        ctx.addIssue({ code: 'custom', path: [index, 'collections'], message: 'Collection membership and order slots must be unique' })
      }
      memberships.add(member.id)
      slots.add(slot)
    }
  }
})
export type Moment = z.infer<typeof momentSchema>

/** Missing permissions, revoked decisions and known expiry never imply embed eligibility. */
export function hasEmbedPermission(source: Moment['source'], at: string): boolean {
  const permission = source.permissions?.find(p => p.use === 'embed')
  const now = Date.parse(at)
  return !!source.identity && !!source.content && source.content.scope !== 'unknown'
    && source.content.verification !== 'unverified' && Number.isFinite(now)
    && permission?.status === 'permitted' && Date.parse(permission.checkedAt) <= now
    && (!permission.expiresAt || now < Date.parse(permission.expiresAt))
}

/** A mismatch is a curation error. Never silently replace a card's saved facts. */
export function parseMoments(raw: unknown, fixtures: readonly Fixture[]): Moment[] {
  const moments = momentsSchema.parse(raw)
  const byId = new Map(fixtures.map(f => [f.id, f]))
  for (const m of moments) {
    const live = byId.get(m.fixtureId)
    if (!live) continue
    // Status records the curation instant: a scheduled preview naturally becomes FT.
    // Names/identities, the authoritative instant and clock confidence must still agree.
    const keys = ['home', 'away', 'kickoffUtc', 'competition', 'venueTz', 'timeConfidence'] as const
    for (const key of keys) {
      const saved = m.fixture[key]
      const current = live[key]
      const agrees = key === 'home' || key === 'away'
        ? m.fixture[key].name === live[key].name && m.fixture[key].sourceId === live[key].sourceId
        : saved === current
      if (!agrees) throw new Error(`Moment ${m.id}: ${key} disagrees with fixture ${m.fixtureId}; correct the curation`)
    }
  }
  return moments
}

export const MOMENTS = parseMoments(rawMoments, FIXTURES)
