import { z } from 'zod'
import { youtubeVideoIdSchema } from '../../../src/lib/moments'
import { fictionalIds, providerDomains } from './policy'

const schema = z.object({
  who: z.literal('Beni'),
  at: z.iso.datetime({ offset: true }),
  words: z.string().trim().min(1),
  hosts: z.array(z.string().max(253).regex(/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/)).min(2).max(32),
  origin: z.string(),
  ids: z.array(z.object({
    id: youtubeVideoIdSchema,
    role: z.enum(['play', 'owner-blocked-expected', 'unknown']),
    source: z.enum(['own-upload', 'third-party']),
  }).strict()).min(1).max(2),
}).strict()
export type Authority = z.infer<typeof schema>
export class Refusal extends Error {
  constructor(public reason: string, detail = '') { super(`${reason}${detail ? ': ' + detail : ''}`) }
}
export function validateAuthority(raw: unknown, origin: string, now: string, mode: 'stub' | 'live'): Authority {
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]!
    const reason = issue.path.includes('id') ? 'malformed-video-id' : issue.path[0] === 'ids' && issue.code === 'too_big' ? 'too-many-ids' : 'authority-schema'
    throw new Refusal(reason, `${issue.path.join('.')}: ${issue.message}`)
  }
  const authority = parsed.data
  if (Date.parse(authority.at) > Date.parse(now) || !Number.isFinite(Date.parse(now))) throw new Refusal('future-authority')
  if (new Set(authority.ids.map(i => i.id)).size !== authority.ids.length) throw new Refusal('duplicate-id')
  if (new Set(authority.hosts).size !== authority.hosts.length || !authority.hosts.includes('youtube.com') || !authority.hosts.includes('youtube-nocookie.com')) throw new Refusal('authority-hosts')
  let u: URL
  try { u = new URL(authority.origin) } catch { throw new Refusal('invalid-origin') }
  if (u.origin !== authority.origin || u.username || u.password || !['http:', 'https:'].includes(u.protocol)) throw new Refusal('invalid-origin')
  const loopback = ['127.0.0.1', 'localhost'].includes(u.hostname)
  if (mode === 'live' && u.port === '0') throw new Refusal('live-port-zero')
  if (!loopback && u.protocol !== 'https:') throw new Refusal('non-loopback-requires-https')
  if (origin !== authority.origin) throw new Refusal('origin-mismatch')
  if (mode === 'stub' && (!loopback || authority.ids.some(i => ![...fictionalIds, 'S4Accept001', 'S4Accept002'].includes(i.id)))) throw new Refusal('stub-fictional-only')
  if (mode === 'live' && authority.ids.some(i => /^S4(?:Accept|Stub)/.test(i.id))) throw new Refusal('fictional-id-in-live')
  return authority
}
export function stubAuthority(origin: string): Authority {
  return { who: 'Beni', at: '2026-10-02T00:00:00Z', words: 'FICTIONAL STUB FIXTURE. This is not Beni\'s provider authority.',
    hosts: [...providerDomains], origin, ids: fictionalIds.map(id => ({ id, role: 'unknown', source: 'third-party' })) }
}
