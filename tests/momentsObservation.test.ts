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
import { redirectLocation } from '../docs/verification/moments-observation/redirect'

const origin = 'http://127.0.0.1:4318', instant = '2026-10-02T18:00:00Z'
const authority = () => stubAuthority(origin)
const input = (override: Partial<RequestInput> = {}): RequestInput => ({ url: apiUrl, phase: 'after-play', resourceType: 'script',
  origin, namedIds: fictionalIds, hosts: providerDomains, seen: { api: false, frames: [] }, ...override })
const refused = (value: unknown, reason: string, url = origin, mode: 'stub' | 'live' = 'stub') => {
  expect(() => validateAuthority(value, url, instant, mode)).toThrow(reason)
}

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
