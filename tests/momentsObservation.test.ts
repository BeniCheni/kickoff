import { describe, expect, it, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import templates from '../docs/verification/moments-acceptance/edition.json'
import { FIXTURES } from '../src/lib/fixtures'
import { availabilityObservationSchema, hasEmbedPermission, parseMoments, youtubeVideoIdSchema } from '../src/lib/moments'
import { apiUrl, decideRequest, extractIds, fictionalIds, providerDomains, providerHost, type RequestInput } from '../docs/verification/moments-observation/policy'
import { Refusal, stubAuthority, validateAuthority } from '../docs/verification/moments-observation/authority'
import { checkBundle, generateEdition } from '../docs/verification/moments-observation/edition'
import { providerRelease, applyDecision } from '../docs/verification/moments-observation/route'
import { detectStop, stopReasons, type Evidence } from '../docs/verification/moments-observation/stops'
import { Telemetry, observations } from '../docs/verification/moments-observation/telemetry'
import { instrumentAdapter } from '../docs/verification/moments-observation/instrumentation'
import { redirectLocation, cancelledInterception } from '../docs/verification/moments-observation/redirect'
import { guardNetwork, type GuardRoute, type GuardSession } from '../docs/verification/moments-observation/cdp-network.mjs'

const origin = 'http://127.0.0.1:4318', instant = '2026-10-02T18:00:00Z'
const authority = () => stubAuthority(origin)
const input = (override: Partial<RequestInput> = {}): RequestInput => ({ url: apiUrl, phase: 'after-play', resourceType: 'script',
  origin, namedIds: fictionalIds, hosts: providerDomains, seen: { api: false, frames: [] }, ...override })
const refused = (value: unknown, reason: string, url = origin, mode: 'stub' | 'live' = 'stub', clock = instant) => {
  expect(() => validateAuthority(value, url, clock, mode)).toThrow(reason)
}
const liveAuthority = (at: string) => ({ ...authority(), at, ids: [{ id: 'S4Fake00001', role: 'unknown' as const, source: 'own-upload' as const }] })

describe('identity extraction and network policy', () => {
  it('redirect guard refuses Location before automatic redirect handling', () => {
    for (const status of [301, 302, 303, 307, 308]) expect(redirectLocation(status, [{ name: 'Location', value: apiUrl }])).toBe(apiUrl)
    expect(redirectLocation(200, [{ name: 'location', value: apiUrl }])).toBeNull()
    expect(redirectLocation(304, [])).toBeNull()
  })
  it.each([
    ['https://www.youtube-nocookie.com/embed/S4Stub00001', ['S4Stub00001']],
    ['https://www.youtube.com/watch?v=S4Stub00001&v=S4Stub00002', [...fictionalIds]],
    ['https://youtu.be/S4Stub00001', ['S4Stub00001']],
    ['https://i.ytimg.com/vi/S4Stub00002/hqdefault.jpg', ['S4Stub00002']],
    ['https://i.ytimg.com/vi_webp/S4Stub00002/default.webp', ['S4Stub00002']],
    ['https://i.ytimg.com/sb/S4Stub00002/storyboard.jpg', ['S4Stub00002']],
    ['https://www.youtube.com/shorts/S4Stub00001', ['S4Stub00001']],
    ['https://www.youtube.com/live/S4Stub00001', ['S4Stub00001']],
    ['https://www.youtube.com/v/S4Stub00001', ['S4Stub00001']],
    ['https://www.youtube.com/x?video_id=S4Stub00001&docid=S4Stub00002', [...fictionalIds]],
    ['https://www.youtube.com/x?url=https%3A%2F%2Fyoutu.be%2FS4Stub00001', ['S4Stub00001']],
    ['https://www.youtube.com/embed/not-valid', ['not-valid']],
    ['https://r1.googlevideo.com/videoplayback?id=opaque-signature', []],
  ])('extracts %s', (url, expected) => expect(extractIds(url)).toEqual(expected))
  it.each(['v=S4Stub00002', 'video_id=S4Stub00002', '{"context":{"videoId":"S4Stub00002"}}'])('extracts body %s', body => {
    expect(extractIds(apiUrl, body)).toEqual(['S4Stub00002'])
  })
  it.each(providerDomains)('provider-before-play catches %s and subdomains', domain => {
    for (const host of [domain, `x.${domain}`, `${domain}.`]) expect(decideRequest(input({ url: `https://${host}/x`, phase: 'before-play' }))).toMatchObject({ action: 'stop', reason: 'provider-before-play' })
    expect(providerHost(`${domain}.example.org`)).toBe(false)
  })
  it('releases exactly the API entry and one named frame, recording loader and later requests', () => {
    const api = decideRequest(input())
    expect(api.action).toBe('release')
    const loader = decideRequest(input({ url: 'https://www.youtube.com/s/player/synthetic.js', seen: api.next }))
    expect(loader.action).toBe('record')
    const frame = decideRequest(input({ url: 'https://www.youtube-nocookie.com/embed/S4Stub00001?origin=' + origin, resourceType: 'document', seen: api.next }))
    expect(frame.action).toBe('release')
    expect(decideRequest(input({ url: 'https://r1.googlevideo.com/videoplayback?id=opaque', seen: frame.next })).action).toBe('record')
    expect(decideRequest(input({ seen: api.next }))).toMatchObject({ action: 'stop', reason: 'second-api-request' })
    expect(decideRequest(input({ url: 'https://www.youtube-nocookie.com/embed/S4Stub00001', resourceType: 'document', seen: frame.next }))).toMatchObject({ action: 'stop', reason: 'second-frame-request' })
  })
  it.each([
    ['https://www.youtube.com/watch?v=S4Stub99999', 'unnamed-id'],
    ['https://i.ytimg.com/vi/S4Stub99999/default.jpg', 'unnamed-id'],
    ['http://www.youtube.com/iframe_api', 'provider-url-refused'],
    ['https://www.youtube.com:444/iframe_api', 'provider-url-refused'],
    ['https://user@www.youtube.com/iframe_api', 'provider-url-refused'],
    ['https://www.youtube.com/embed/S4Stub00001', 'frame-url-refused'],
  ])('refuses %s as %s', (url, reason) => expect(decideRequest(input({ url }))).toMatchObject({ action: 'stop', reason: reason }))
  it('rejects unnamed body identities even on a released host', () => expect(decideRequest(input({ body: '{"videoId":"S4Stub99999"}' }))).toMatchObject({ action: 'stop', reason: 'unnamed-id' }))
  it('does not discard duplicate JSON identity keys', () => expect(extractIds(apiUrl, '{"videoId":"S4Stub99999","videoId":"S4Stub00001"}')).toEqual(['S4Stub99999', 'S4Stub00001']))
  it('refuses an unauthorised host and requests before the API', () => {
    expect(decideRequest(input({ hosts: ['youtube-nocookie.com'] }))).toMatchObject({ action: 'stop', reason: 'provider-host-not-authorized' })
    expect(decideRequest(input({ url: 'https://i.ytimg.com/picture.jpg' }))).toMatchObject({ action: 'stop', reason: 'provider-before-player' })
    expect(decideRequest(input({ url: 'https://www.youtube-nocookie.com/embed/S4Stub00001', resourceType: 'document' }))).toMatchObject({ action: 'stop', reason: 'frame-before-api' })
  })
  it.each([[origin + '/', 'release'], ['https://fonts.googleapis.com/css2', 'release'], ['https://fonts.gstatic.com/font.woff2', 'release'], ['https://example.com/', 'abort'], ['http://fonts.gstatic.com/font', 'abort']])('non-provider %s: %s', (url, action) => expect(decideRequest(input({ url })).action).toBe(action))
})

describe('authority and generated edition', () => {
  it('accepts exact loopback and named HTTPS origins', () => {
    expect(validateAuthority(authority(), origin, instant, 'stub')).toEqual(authority())
    const live = { ...authority(), origin: 'https://observation.example', ids: [{ id: 'S4Fake00001', role: 'unknown', source: 'own-upload' }] }
    expect(validateAuthority(live, live.origin, instant, 'live').origin).toBe(live.origin)
  })
  it.each(['who', 'at', 'words', 'hosts', 'origin', 'ids'])('requires %s', key => {
    const raw: Record<string, unknown> = authority(); delete raw[key]; refused(raw, 'authority-schema')
  })
  it.each(['role', 'source', 'id'])('requires per-id %s', key => {
    const raw = authority(); delete (raw.ids[0] as unknown as Record<string, unknown>)[key]
    refused(raw, key === 'id' ? 'malformed-video-id' : 'authority-schema')
  })
  it('rejects every extra-field location', () => {
    refused({ ...authority(), permission: true }, 'authority-schema')
    const raw = authority(); Object.assign(raw.ids[0]!, { extra: true }); refused(raw, 'authority-schema')
  })
  it.each(['x'.repeat(27), 'short', 'S4Stub0000!', 'S4Stub00001 '])('malformed-video-id: %s', id => {
    const raw = authority(); raw.ids[0]!.id = id; refused(raw, 'malformed-video-id')
  })
  it('future-authority', () => refused({ ...authority(), at: '2099-01-01T00:00:00Z' }, 'future-authority'))
  it('accepts an authority exactly 24 hours old in live mode and refuses one millisecond older', () => {
    const at = '2026-10-02T00:00:00.000Z'
    expect(validateAuthority(liveAuthority(at), origin, '2026-10-03T00:00:00.000Z', 'live').at).toBe(at)
    const staleAt = '2026-10-03T00:00:00.001Z'
    const ageMs = Date.parse(staleAt) - Date.parse(at)
    expect(() => validateAuthority(liveAuthority(at), origin, staleAt, 'live')).toThrow(`stale-authority: ${ageMs / 3600000} hours`)
  })
  it('compares an offset instant, not its clock face', () => {
    const at = '2026-10-02T05:30:00+05:30'
    expect(validateAuthority(liveAuthority(at), origin, '2026-10-03T00:00:00.000Z', 'live').at).toBe(at)
    refused(liveAuthority(at), 'stale-authority', origin, 'live', '2026-10-03T00:00:00.001Z')
    refused(liveAuthority('2026-10-03T05:30:00.001+05:30'), 'future-authority', origin, 'live', '2026-10-03T00:00:00.000Z')
  })
  it('keeps a missing or malformed at on the schema refusal', () => {
    refused({ ...authority(), at: '2026-10-02' }, 'authority-schema')
    refused({ ...authority(), at: 'yesterday' }, 'authority-schema')
  })
  it('keeps the dated stub fixture valid in stub mode and refuses that same date in live mode', () => {
    expect(validateAuthority(authority(), origin, '2027-01-01T00:00:00Z', 'stub')).toEqual(authority())
    const ageMs = Date.parse('2026-10-03T00:00:00.001Z') - Date.parse(authority().at)
    expect(() => validateAuthority(authority(), origin, '2026-10-03T00:00:00.001Z', 'live')).toThrow(`stale-authority: ${ageMs / 3600000} hours`)
  })
  it('too-many-ids', () => { const raw = authority(); raw.ids.push({ ...raw.ids[0]!, id: 'S4Stub00003' }); refused(raw, 'too-many-ids') })
  it('duplicate-id', () => { const raw = authority(); raw.ids[1]!.id = raw.ids[0]!.id; refused(raw, 'duplicate-id') })
  it('origin-mismatch', () => refused(authority(), 'origin-mismatch', 'http://localhost:4318'))
  it('live-port-zero', () => refused({ ...authority(), origin: 'http://127.0.0.1:0' }, 'live-port-zero', 'http://127.0.0.1:0', 'live'))
  it('non-loopback-requires-https', () => refused({ ...authority(), origin: 'http://observation.example' }, 'non-loopback-requires-https', 'http://observation.example'))
  it.each(['http://127.0.0.1:4318/', 'file:///tmp/index.html', 'http://user@localhost:4318'])('invalid-origin %s', value => refused({ ...authority(), origin: value }, 'invalid-origin', value))
  it('authority-hosts', () => refused({ ...authority(), hosts: ['youtube.com', 'ytimg.com'] }, 'authority-hosts'))
  it('stub-fictional-only', () => { const raw = authority(); raw.ids[0]!.id = 'S4Fake00001'; refused(raw, 'stub-fictional-only') })
  it('fictional-id-in-live', () => refused(authority(), 'fictional-id-in-live', origin, 'live'))
  it.each([1, 2])('generator preserves fixture validation with %s named IDs only', count => {
    const raw = authority(); raw.ids = raw.ids.slice(0, count)
    const validated = validateAuthority(raw, origin, instant, 'stub')
    const edition = generateEdition(validated, templates, FIXTURES)
    expect(edition.map(m => m.id)).toEqual(Array.from({ length: count }, (_, i) => `kickoff-moments-slice-4-test-${i + 1}`))
    expect(edition.map(m => m.source.identity!.videoId)).toEqual(raw.ids.map(i => i.id))
    expect(JSON.stringify(edition)).not.toContain('S4Accept')
    expect(parseMoments(edition, FIXTURES)).toEqual(edition)
    for (const item of edition) {
      expect(youtubeVideoIdSchema.safeParse(item.source.identity!.videoId).success).toBe(true)
      expect(item.source.identity!.videoId).toHaveLength(11)
      expect(hasEmbedPermission(item.source, validated.at)).toBe(true)
      expect(item.source.permissions![0]!.basis).toContain('not an edition permission')
      expect(item.source.permissions![0]).not.toHaveProperty('expiresAt')
      expect(item.fixture).toEqual(templates[edition.indexOf(item)]!.fixture)
    }
  })
  it('generator still refuses a fixture disagreement', () => {
    const changed = structuredClone(templates); changed[0]!.fixtureId = FIXTURES[0]!.id
    expect(() => generateEdition(authority(), changed, FIXTURES)).toThrow('disagrees with fixture')
  })
  it('bundle guard requires exact manifest, hooks, IDs and absence of fictional identities in live', () => {
    const make = (ids: string[]) => 'momentsAcceptance moments-observation-hook-v1 ' + ids.join(' ') + '<script type="application/json" id="moments-observation-manifest">' + JSON.stringify({ ids }) + '</script>'
    expect(() => checkBundle(make([...fictionalIds]), authority(), 'stub')).not.toThrow()
    expect(() => checkBundle(make([...fictionalIds, 'S4Stub99999']), authority(), 'stub')).toThrow('bundle-id-mismatch')
    expect(() => checkBundle(make(['S4Stub00001']), authority(), 'stub')).toThrow('bundle-missing-named-id')
    expect(() => checkBundle(make([...fictionalIds]), authority(), 'live')).toThrow('bundle-has-fictional-id')
    expect(() => checkBundle(make([...fictionalIds]).replace('moments-observation-hook-v1', ''), authority(), 'stub')).toThrow('missing-observation-hooks')
  })
})

describe('provider continuation guard', () => {
  it('continues only live after valid authority and exact typed confirmation', async () => {
    const route = { abort: vi.fn(async () => {}), continue: vi.fn(async () => {}) }, local = vi.fn(async () => {})
    const decision = decideRequest(input())
    await applyDecision(route, decision, providerRelease('stub', authority(), origin, instant, '', local))
    expect(local).toHaveBeenCalledOnce(); expect(route.continue).not.toHaveBeenCalled()
    const raw = authority(); raw.ids = [{ id: 'S4Fake00001', role: 'unknown', source: 'third-party' }]
    expect(() => providerRelease('live', {}, origin, instant, 'RELEASE ' + origin, local)).toThrow(Refusal)
    expect(() => providerRelease('live', raw, origin, instant, '', local)).toThrow('confirmation-refused')
    expect(route.continue).not.toHaveBeenCalled()
    await applyDecision(route, decision, providerRelease('live', raw, origin, instant, 'RELEASE ' + origin, local))
    expect(route.continue).toHaveBeenCalledOnce()
    await applyDecision(route, decideRequest(input({ phase: 'before-play' })), providerRelease('live', raw, origin, instant, 'RELEASE ' + origin, local))
    expect(route.abort).toHaveBeenCalledOnce(); expect(route.continue).toHaveBeenCalledOnce()
  })
})

export const faults: Evidence[] = [
  { providerBeforePlay: true }, { frames: 2 }, { parentChanged: true }, { queueCovered: true },
  { navigationWaits: true }, { terminalFailures: 2 }, { position: 8, samples: [7] }, { error150Territory: true },
  { providerError: 153 }, { warmAutoplayBlocked: true }, { returnedBlank: true }, { resume: true, lastSample: 0 },
  { playShown: true, permitted: false }, { unnamedId: true },
]
describe('fourteen immediate stop decisions', () => {
  it.each(stopReasons.map((reason, i) => [reason, faults[i]!] as const))('%s', (reason, fault) => expect(detectStop(fault)).toBe(reason))
  it('second API element and dead instance independently stop', () => {
    expect(detectStop({ apiElements: 2 })).toBe('second-element')
    expect(detectStop({ instanceDied: true })).toBe('parked-return-blank')
  })
  it('normal evidence is not a stop', () => expect(detectStop({ frames: 1, apiElements: 1, terminalFailures: 1, position: 7, samples: [7], resume: true, lastSample: 7, playShown: true, permitted: true, providerError: 150 })).toBeNull())
})

describe('telemetry and observation schema', () => {
  const play = (t: Telemetry) => t.accept({ kind: 'play', value: { itemId: 'kickoff-moments-slice-4-test-1', attempt: 1, videoId: fictionalIds[0] } })
  it('observations keep test identity outside the strict schema and classify 150 as owner-blocked', () => {
    const t = new Telemetry(fictionalIds); play(t)
    t.accept({ kind: 'error', value: 150 })
    const obs = observations(fictionalIds, t, 'loopback ' + origin + '; Chrome stub headless darwin', instant, true)
    expect(availabilityObservationSchema.array().safeParse(obs).success).toBe(true)
    expect(obs[0]!.outcome).toBe('owner-blocked'); expect(obs[1]!.outcome).toBe('unknown')
    expect(obs.every(o => !o.note.includes('territory block'))).toBe(true)
    expect(availabilityObservationSchema.safeParse({ ...obs[0], outcome: 'unavailable' }).success).toBe(false)
    expect(availabilityObservationSchema.safeParse({ ...obs[0], videoId: fictionalIds[0] }).success).toBe(false)
  })
  it('hook observations stop on repeat failure, bad position, error 153, warm block, zero resume and unnamed id', () => {
    const t = new Telemetry(fictionalIds); play(t)
    t.accept({ kind: 'sample', value: 12 })
    expect(t.accept({ kind: 'dispatch', value: { itemId: 'a', attempt: 1, event: 'position', position: 12 } })).toBeNull()
    expect(t.accept({ kind: 'dispatch', value: { itemId: 'a', attempt: 1, event: 'position', position: 99 } })).toBe('unsampled-position')
    const failure = { kind: 'dispatch', value: { itemId: 'a', attempt: 1, event: 'failure', failure: { kind: 'unknown' } } }
    expect(t.accept(failure)).toBeNull(); expect(t.accept(failure)).toBe('second-terminal-failure')
    expect(t.accept({ kind: 'error', value: 153 })).toBe('error-153')
    expect(t.accept({ kind: 'blocked', value: null })).toBeNull()
    t.warmDirect = true
    expect(t.accept({ kind: 'blocked', value: null })).toBe('warm-autoplay-blocked')
    t.accept({ kind: 'sample', value: 0 })
    expect(t.accept({ kind: 'resume', value: true })).toBe('resume-at-zero')
    expect(t.accept({ kind: 'play', value: { videoId: 'S4Stub99999' } })).toBe('unnamed-id')
  })
  it('acceptance hooks fail on drift and leave production source intact', () => {
    const file = path.resolve('src/lib/momentsPlayer.ts'), before = fs.readFileSync(file, 'utf8')
    const transformed = instrumentAdapter(before)
    expect(transformed).toContain('moments-observation-hook-v1')
    expect(transformed).toContain("observe('sample', value)")
    expect(transformed).toContain("observe('dispatch', event)")
    expect(() => instrumentAdapter(transformed)).toThrow('observation-hook-source-mismatch')
    expect(fs.readFileSync(file, 'utf8')).toBe(before)
  })
  it('CI, package scripts and tests have no execution edge into the manual browser runner or its drivers', () => {
    // The drivers spawn the runner, so a script that names prove.mjs is an edge into it too.
    const targets = ['runner.mjs', 'prove.mjs', 'runner-mutations.mjs', 'mutations.mjs', 'generate.mjs'].map(f => ['moments-observation', f].join('/'))
    const free = (text: string) => { for (const target of targets) expect(text).not.toContain(target) }
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> }
    for (const command of Object.values(pkg.scripts)) free(command)
    for (const f of fs.readdirSync('.github', { recursive: true, withFileTypes: true }).filter(e => e.isFile())) free(fs.readFileSync(path.join(f.parentPath, f.name), 'utf8'))
    for (const f of fs.readdirSync('tests', { recursive: true, withFileTypes: true }).filter(e => e.isFile() && /\.[cm]?[jt]sx?$/.test(e.name))) {
      free(fs.readFileSync(path.join(f.parentPath, f.name), 'utf8'))
    }
    for (const f of fs.readdirSync('scripts', { recursive: true, withFileTypes: true }).filter(e => e.isFile())) free(fs.readFileSync(path.join(f.parentPath, f.name), 'utf8'))
    expect(fs.readFileSync('vite.config.ts', 'utf8')).not.toContain('moments-observation')
  })
})


describe('Pass 2 observation honesty and authority boundaries', () => {
  it('names extra host families with strict DNS syntax and a bounded list', () => {
    expect(validateAuthority({ ...authority(), hosts: [...providerDomains, 'named.s4a.test'] }, origin, instant, 'stub').hosts).toContain('named.s4a.test')
    for (const host of ['https://extra.test', '*.extra.test', 'extra.test/path', 'extra.test:443', '-bad.test', 'EXTRA.test', '127.0.0.1', 'com', 'x..test', 'x.test.']) refused({ ...authority(), hosts: [...providerDomains, host] }, 'authority-schema')
    refused({ ...authority(), hosts: [...providerDomains, ...Array.from({ length: 27 }, (_, i) => `x${i}.test`)] }, 'authority-schema')
  })
  it('named extra hosts release only after Play and check playback identity', () => {
    const extra = { url: 'https://child.named.s4a.test/api', hosts: [...providerDomains, 'named.s4a.test'], seen: { api: true, frames: [] } }
    expect(decideRequest(input(extra))).toMatchObject({ action: 'record', reason: 'named-extra-host' })
    expect(decideRequest(input({ ...extra, phase: 'before-play' }))).toMatchObject({ action: 'abort', reason: 'extra-host-before-play' })
    expect(decideRequest(input({ ...extra, body: '{"videoId":"S4Stub99999"}' }))).toMatchObject({ action: 'stop', reason: 'unnamed-id' })
    expect(decideRequest(input({ ...extra, url: 'https://unnamed.s4a.test/api' }))).toMatchObject({ action: 'abort', reason: 'unlisted-host' })
    expect(decideRequest(input({ ...extra, url: 'http://named.s4a.test/api' }))).toMatchObject({ action: 'stop', reason: 'provider-url-refused' })
  })
  it('records shelf images but stops an unnamed document, fetch, body, or media identity', () => {
    for (const label of ['vi', 'vi_webp', 'an_webp', 'sb']) {
      const url = `https://i.ytimg.com/${label}/S4Stub99999/default.jpg`
      expect(decideRequest(input({ url, resourceType: 'image', seen: { api: true, frames: [] } }))).toMatchObject({ action: 'record', reason: 'shelf-image', ids: ['S4Stub99999'] })
      for (const resourceType of ['document', 'fetch', 'media']) expect(decideRequest(input({ url, resourceType }))).toMatchObject({ action: 'stop', reason: 'unnamed-id' })
      expect(decideRequest(input({ url: url + '?v=S4Stub99998', resourceType: 'image' }))).toMatchObject({ action: 'stop', reason: 'unnamed-id' })
    }
  })
  it('records a shelf thumbnail whose only query is sqp and rs, and stops every other query', () => {
    const seen = { api: true, frames: [] as const }
    const image = (url: string, extra: Partial<RequestInput> = {}) => decideRequest(input({ url, resourceType: 'image', seen, ...extra }))
    const recorded = { action: 'record', reason: 'shelf-image', ids: ['S4Stub99999'] }
    const hq = 'https://i.ytimg.com/vi/S4Stub99999/hqdefault.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLDRBT62N1_6CyJy49C2YL2wz4po6g'
    expect(image(hq)).toMatchObject(recorded)
    expect(image('https://i.ytimg.com/vi/S4Stub99999/sddefault.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG=')).toMatchObject(recorded)
    for (const label of ['vi', 'vi_webp', 'an_webp', 'sb']) {
      expect(image(`https://i.ytimg.com/${label}/S4Stub99999/hqdefault.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLDRBT62N1_6CyJy49C2YL2wz4po6g`)).toMatchObject(recorded)
    }
    const base = 'https://i.ytimg.com/vi/S4Stub99999/hqdefault.jpg'
    const unpadded = 'A'.repeat(43)
    for (const query of ['?sqp=a', '?rs=b', '?sqp=a&rs=b', '?rs=b&sqp=a', '?sqp=' + 'a'.repeat(256), '?sqp=a==', '?sqp=' + unpadded]) {
      expect(image(base + query)).toMatchObject(recorded)
    }
    const stop = (url: string, extra: Partial<RequestInput> = {}) => expect(image(url, extra), url).toMatchObject({ action: 'stop', reason: 'unnamed-id' })
    stop(base + '?sqp=a&rs=b&v=S4Stub99998')
    stop(base + '?sqp=a&extra=b')
    stop(base + '?SQP=a')
    stop(base + '?sqp=a&sqp=b')
    stop(base + '?sqp=')
    stop(base + '?sqp=' + 'a'.repeat(257))
    stop(base + '?sqp=https://x.test/')
    stop(base + '?sqp=%G1')
    stop(base + '?sqp=a%2Fb')
    stop(base + '?sqp=a+b')
    stop(base + '?sqp=a.b')
    stop(base + '?sqp=a/b')
    stop(base + '?sqp=a=b')
    stop(base + '?sqp=a===')
    stop(base + '?sqp=%3D')
    for (const resourceType of ['document', 'fetch', 'xhr', 'media', 'script']) stop(hq, { resourceType })
    stop(hq, { body: 'not-empty' })
    stop('https://i.ytimg.com/vi/S4Stub99999/sb/S4Stub99998/hqdefault.jpg')
    expect(image('https://i.ytimg.com/vi/S4Stub00001/hqdefault.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLDRBT62N1_6CyJy49C2YL2wz4po6g')).toMatchObject({ action: 'record', reason: 'player-request', ids: ['S4Stub00001'] })
    expect(image('https://i.ytimg.com/vi/S4Stub00001/hqdefault.jpg')).toMatchObject({ action: 'record', reason: 'shelf-image', ids: ['S4Stub00001'] })
    expect(image('https://i.ytimg.com/vi/S4Stub00001/hqdefault.jpg?extra=1')).toMatchObject({ action: 'record', reason: 'player-request', ids: ['S4Stub00001'] })
    expect(decideRequest(input({ url: 'http://i.ytimg.com/vi/S4Stub99999/hqdefault.jpg', resourceType: 'image', seen }))).toMatchObject({ action: 'stop', reason: 'provider-url-refused' })
    expect(image('https://i.ytimg.com:444/vi/S4Stub99999/hqdefault.jpg')).toMatchObject({ action: 'stop', reason: 'provider-url-refused' })
    expect(image('https://user@i.ytimg.com/vi/S4Stub99999/hqdefault.jpg')).toMatchObject({ action: 'stop', reason: 'provider-url-refused' })
  })
  it('stops a shelf query whose escapes spell a nested URL, a second key, whitespace or a second encoding', () => {
    // Pass 1 (7 Oct 2026): the raw-only alphabet let %XX spell anything, so each of these was recorded as a shelf image.
    // The extractor follows only a lower-case `http(s):` at the start of a value, so the upper-case and double-encoded
    // forms also hid their second id from the one-id check.
    const seen = { api: true, frames: [] as const }
    const image = (url: string) => decideRequest(input({ url, resourceType: 'image', seen }))
    const base = 'https://i.ytimg.com/vi/S4Stub99999/hqdefault.jpg'
    const rs = '&rs=AOn4CLDRBT62N1_6CyJy49C2YL2wz4po6g'
    for (const value of [
      'https%3A%2F%2Fx.test%2F', '%68ttps%3A%2F%2Fx.test%2F', 'HTTPS%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DS4Stub99998',
      'Https%3A%2F%2Fwww.youtube-nocookie.com%2Fembed%2FS4Stub99998', 'https%253A%252F%252Fwww.youtube.com%252Fwatch%253Fv%253DS4Stub99998',
      'data%3Atext%2Fhtml%2Cx', 'a%26v%3DS4Stub99998', 'a%20b', 'a%0Ab', '%C3%A9', '%25', '%C3',
    ]) {
      expect(image(base + '?sqp=' + value + rs), value).toMatchObject({ action: 'stop', reason: 'unnamed-id' })
      expect(image(base + '?rs=' + value), value).toMatchObject({ action: 'stop', reason: 'unnamed-id' })
    }
    // An escape that spells a base64url character, or trailing padding, is still a token. `/` and `+` are not.
    // A lower-case nested URL that the extractor reads still stops on its id.
    for (const value of ['a%3D', '-oaymwEmCIAFEOAD8quKqQMa8AEB-AH-BYAC4AOKAgwIABABGEMgUyhlMA8=']) {
      expect(image(base + '?sqp=' + value + rs), value).toMatchObject({ action: 'record', reason: 'shelf-image', ids: ['S4Stub99999'] })
    }
    for (const value of ['a%2Fb', 'a%2Bb']) {
      expect(image(base + '?sqp=' + value + rs), value).toMatchObject({ action: 'stop', reason: 'unnamed-id' })
      expect(image(base + '?rs=' + value), value).toMatchObject({ action: 'stop', reason: 'unnamed-id' })
    }
    expect(image(base + '?sqp=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DS4Stub99998')).toMatchObject({ action: 'stop', reason: 'unnamed-id', ids: ['S4Stub99999', 'S4Stub99998'] })
    // A pair without `=` is not a key: `rsX` must not be read as key `rs` with value `rsX`.
    for (const query of ['?rsX', '?sqpX', '?sqp', '?=a', '?sqp=a&rsX']) expect(image(base + query), query).toMatchObject({ action: 'stop', reason: 'unnamed-id' })
    // The scheme-less path is closed by Beni's Base64url ruling.
    expect(image(base + '?sqp=%2F%2Fwww.youtube.com%2Fembed%2FS4Stub99998')).toMatchObject({ action: 'stop', reason: 'unnamed-id' })
  })
  it('PLAYING alone is unknown; a later positive sample confirms only the current named attempt', () => {
    const t = new Telemetry(fictionalIds)
    t.accept({ kind: 'play', value: { itemId: 'a', attempt: 1, videoId: fictionalIds[0] } })
    t.accept({ kind: 'sample', value: 12 })
    t.accept({ kind: 'dispatch', value: { itemId: 'a', attempt: 1, event: 'playing' } })
    expect(observations(fictionalIds, t, 'environment', instant, true)[0]!.outcome).toBe('unknown')
    t.accept({ kind: 'sample', value: 0 })
    expect(t.played.size).toBe(0)
    t.accept({ kind: 'sample', value: 12 })
    expect(t.played.has(fictionalIds[0])).toBe(true)
    t.accept({ kind: 'play', value: { itemId: 'b', attempt: 2, videoId: fictionalIds[1] } })
    t.accept({ kind: 'dispatch', value: { itemId: 'a', attempt: 1, event: 'playing' } })
    t.accept({ kind: 'sample', value: 20 })
    expect(t.played.has(fictionalIds[1])).toBe(false)
    const obs = observations(fictionalIds, t, 'environment', instant, true)
    expect(obs.every(o => o.environment.includes('STUB') && o.note.includes('Synthetic'))).toBe(true)
  })
  it.each([undefined, NaN, Infinity, -1, Number.MAX_SAFE_INTEGER + 1, 150.5, '150', null])('malformed error %s cannot lose a receipt', value => {
    const t = new Telemetry(fictionalIds)
    t.accept({ kind: 'play', value: { itemId: 'a', attempt: 1, videoId: fictionalIds[0] } })
    t.accept({ kind: 'error', value: 150 })
    t.accept({ kind: 'error', value })
    const obs = observations(fictionalIds, t, 'environment', instant, true)
    expect(obs[0]).toMatchObject({ outcome: 'unknown' })
    expect(obs[0]).not.toHaveProperty('providerError')
    expect(obs[0]!.note).toContain('Malformed')
    expect(obs[1]!.note).toContain('not reached')
  })
})

it('a later zero sample does not invalidate an already emitted positive resume label', () => {
  const t = new Telemetry(fictionalIds)
  t.accept({ kind: 'play', value: { itemId: 'a', attempt: 1, videoId: fictionalIds[0] } })
  t.accept({ kind: 'sample', value: 12 })
  t.accept({ kind: 'resume', value: true })
  t.accept({ kind: 'sample', value: 0 })
  expect(t.resumeSample).toBe(12)
  expect(detectStop({ resume: true, lastSample: t.resumeSample })).toBeNull()
})


it('a valid owner-block callback after a malformed one remains serializable', () => {
  const t = new Telemetry(fictionalIds)
  t.accept({ kind: 'play', value: { itemId: 'a', attempt: 1, videoId: fictionalIds[0] } })
  t.accept({ kind: 'error', value: undefined })
  t.accept({ kind: 'error', value: 150 })
  expect(observations(fictionalIds, t, 'environment', instant, true)[0]).toMatchObject({ outcome: 'owner-blocked', providerError: 150 })
})


it('only an expired response continuation is a cancellation, never a redirect or request-release failure', () => {
  expect(cancelledInterception('Fetch.continueResponse', -32602, 'Invalid InterceptionId.')).toBe(true)
  for (const method of ['Fetch.continueRequest', 'Fetch.failRequest', 'Fetch.fulfillRequest']) expect(cancelledInterception(method, -32602, 'Invalid InterceptionId.')).toBe(false)
  expect(cancelledInterception('Fetch.continueResponse', -32000, 'Invalid InterceptionId.')).toBe(false)
  expect(cancelledInterception('Fetch.continueResponse', -32602, 'Other failure')).toBe(false)
})

describe('browser-wide Fetch guard on the pipe session', () => {
  type Send = GuardSession['send']
  const fake = (send: Send) => {
    const sessionListeners = new Map<string, ((params: never) => void)[]>(), browserListeners: (() => void)[] = []
    const session: GuardSession = {
      on: (event, listener) => { sessionListeners.set(event, [...(sessionListeners.get(event) ?? []), listener]) },
      send, detach: async () => { for (const listener of sessionListeners.get('close') ?? []) listener(undefined as never) },
    }
    const browser = { newBrowserCDPSession: async () => session, on: (_event: 'disconnected', listener: () => void) => { browserListeners.push(listener) } }
    const emit = (event: string, params: unknown) => { for (const listener of sessionListeners.get(event) ?? []) listener(params as never) }
    return { browser, emit, disconnect: () => { for (const listener of browserListeners) listener() } }
  }
  const paused = (extra: object) => ({ requestId: 'r', frameId: 'f', resourceType: 'Fetch', request: { url: 'http://127.0.0.1:4318/x', method: 'GET', headers: {} }, ...extra })
  const install = async (send: Send, route: (r: GuardRoute) => Promise<unknown> = async r => { await r.continue() }) => {
    const f = fake(send); const failures: string[] = [], redirects: string[] = [], pending = new Set<Promise<unknown>>()
    const guard = await guardNetwork(f.browser, route, r => { redirects.push(r.location) }, e => { failures.push(e.message) }, pending)
    return { ...f, guard, failures, redirects, settle: () => Promise.all([...pending]) }
  }
  const ok: Send = async () => ({})
  it('reports the guard lost when the browser disconnects, not only when the session detaches', async () => {
    const died = await install(ok); died.disconnect()
    expect(died.failures).toEqual(['browser-network-guard-disconnected'])
    const detached = await install(ok); detached.guard.close(); await new Promise(r => setTimeout(r, 0))
    expect(detached.failures).toEqual(['browser-network-guard-disconnected'])
  })
  it('fails a redirect response before its Location and reports the paused url', async () => {
    const sent: string[] = []
    const g = await install(async method => { sent.push(method); return {} })
    g.emit('Fetch.requestPaused', paused({ responseStatusCode: 302, responseHeaders: [{ name: 'Location', value: '/landed' }] }))
    await g.settle()
    expect(sent).toEqual(['Fetch.enable', 'Fetch.failRequest']); expect(g.redirects).toEqual(['/landed']); expect(g.failures).toEqual([])
  })
  it('logs only the exact expired-continuation message as a cancellation; any other failure stops', async () => {
    const throwing = (text: string): Send => async method => { if (method === 'Fetch.enable') return {}; throw new Error(text) }
    const response = paused({ responseStatusCode: 200, responseHeaders: [] })
    const exact = await install(throwing('Protocol error (Fetch.continueResponse): Invalid InterceptionId.'))
    exact.emit('Fetch.requestPaused', response); await exact.settle()
    expect(exact.failures).toEqual([])
    expect(exact.guard.audit.filter(a => a.stage === 'cancelled-response')).toEqual([{ stage: 'cancelled-response', method: 'Fetch.continueResponse', code: -32602, message: 'Invalid InterceptionId.' }])
    for (const text of ['Protocol error (Fetch.continueResponse): Invalid InterceptionId', 'Protocol error (Fetch.continueResponse): Invalid InterceptionId. extra', 'Protocol error (Fetch.continueResponse): Target closed']) {
      const other = await install(throwing(text)); other.emit('Fetch.requestPaused', response); await other.settle()
      expect(other.failures).toHaveLength(1); expect(other.guard.audit.some(a => a.stage === 'cancelled-response')).toBe(false)
    }
    const request = await install(throwing('Protocol error (Fetch.failRequest): Invalid InterceptionId.'), async r => { await r.abort() })
    request.emit('Fetch.requestPaused', paused({})); await request.settle()
    expect(request.failures).toEqual(['Invalid InterceptionId.'])
  })
})
