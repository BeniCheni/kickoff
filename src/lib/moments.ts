import { z } from 'zod'
import rawMoments from '../curated/moments.json'
import { FIXTURES } from './fixtures'
import { fixtureSchema, type Fixture } from './schema'

export const MOMENT_CATEGORIES = ['prematch', 'highlights', 'celebrations'] as const
const webUrl = z.url({ protocol: /^https?$/ })
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
  source: z.object({ name: z.string().trim().min(1), url: webUrl }),
  still: z.object({ url: webUrl, credit: z.string().trim().min(1) }).optional(),
  curatedAt: z.iso.datetime(),
  fixture: momentFixtureSchema,
})
export const momentsSchema = z.array(momentSchema).superRefine((moments, ctx) => {
  const ids = new Set<string>()
  for (const [index, moment] of moments.entries()) {
    if (ids.has(moment.id)) ctx.addIssue({ code: 'custom', path: [index, 'id'], message: 'Moment ids must be unique' })
    ids.add(moment.id)
  }
})
export type Moment = z.infer<typeof momentSchema>

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
