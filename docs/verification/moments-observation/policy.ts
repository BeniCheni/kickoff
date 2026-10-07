// Pure request policy. There is deliberately no network or clock access in this module.
export const providerDomains = ['youtube.com', 'youtu.be', 'youtube-nocookie.com', 'ytimg.com', 'googlevideo.com', 'ggpht.com'] as const
export const fictionalIds = ['S4Stub00001', 'S4Stub00002'] as const
export const apiUrl = 'https://www.youtube.com/iframe_api'
export const providerHost = (host: string): boolean => providerDomains.some(d => host.toLowerCase().replace(/\.$/, '') === d || host.toLowerCase().replace(/\.$/, '').endsWith('.' + d))
export const dnsGuard = '--host-resolver-rules=' + providerDomains.flatMap(d => [`MAP ${d} ~NOTFOUND`, `MAP *.${d} ~NOTFOUND`]).join(', ')

/** Recognised identity locations only, including repeated parameters and nested URLs.
 * Opaque media signatures, binary bodies and undocumented encodings are not decoded.
 * Malformed explicit identities are retained so they fail the named-id check. */
export function extractIds(url: string, body = ''): string[] {
  const ids = new Set<string>()
  const keys = new Set(['v', 'video_id', 'videoid', 'docid'])
  const visit = (value: string, depth: number) => {
    if (depth > 3) return
    try {
      const u = new URL(value)
      const parts = u.pathname.split('/').map(p => { try { return decodeURIComponent(p) } catch { return p } })
      for (const label of ['embed', 'shorts', 'live', 'v', 'vi', 'vi_webp', 'an_webp', 'sb']) {
        const index = parts.indexOf(label)
        if (index >= 0 && parts[index + 1]) ids.add(parts[index + 1]!)
      }
      if (u.hostname.replace(/\.$/, '') === 'youtu.be' && parts[1]) ids.add(parts[1])
      for (const [key, item] of u.searchParams) {
        if (keys.has(key.toLowerCase())) ids.add(item)
        else if (/^https?:/.test(item)) visit(item, depth + 1)
      }
    } catch { /* Not a URL; form/JSON are handled separately. */ }
  }
  visit(url, 0)
  if (body) {
    // Keep duplicate explicit JSON identities rather than losing one to JSON.parse.
    for (const match of body.matchAll(/"(?:v|video_id|videoId|docid)"\s*:\s*"((?:[^"\\]|\\.)*)"/gi)) {
      try { ids.add(JSON.parse('"' + match[1] + '"') as string) } catch { ids.add(match[1]!) }
    }
    for (const [key, value] of new URLSearchParams(body)) if (keys.has(key.toLowerCase())) ids.add(value)
    try {
      const walk = (value: unknown, depth: number) => {
        if (depth > 12 || !value || typeof value !== 'object') return
        for (const [key, child] of Object.entries(value)) {
          if (keys.has(key.toLowerCase()) && typeof child === 'string') ids.add(child)
          else walk(child, depth + 1)
        }
      }
      walk(JSON.parse(body), 0)
    } catch { /* Binary and non-JSON bodies remain opaque. */ }
  }
  return [...ids]
}

/** Empty, or only `sqp` and `rs`, each once, with a bounded token value. Keys are case-sensitive.
 * The alphabet binds the value after one percent-decode, so an escape can spell only a token
 * character: never the `:` of a nested URL, the `%` of a second encoding, `&` or whitespace. */
export function shelfQueryAllowed(search: string): boolean {
  if (search === '') return true
  const seen = new Set<string>()
  for (const pair of search.slice(1).split('&')) {
    const eq = pair.indexOf('=')
    if (eq <= 0) return false
    const key = pair.slice(0, eq)
    const value = pair.slice(eq + 1)
    if (key !== 'sqp' && key !== 'rs') return false
    if (seen.has(key)) return false
    seen.add(key)
    if (value.length === 0 || value.length > 256) return false
    let token: string
    try { token = decodeURIComponent(value) } catch { return false }
    if (!/^[A-Za-z0-9_.=+/-]+$/.test(token)) return false
  }
  return true
}

export type RequestState = { api: boolean; frames: readonly string[] }
export type Decision = { action: 'release' | 'record' | 'abort' | 'stop'; reason: string; provider: boolean; ids: string[]; next: RequestState }
export type RequestInput = {
  url: string; body?: string; resourceType: string; phase: 'before-play' | 'after-play';
  origin: string; namedIds: readonly string[]; hosts: readonly string[]; seen: RequestState
}
export function decideRequest(input: RequestInput): Decision {
  const { seen, namedIds, phase } = input
  const u = new URL(input.url), provider = providerHost(u.hostname), ids = extractIds(input.url, input.body)
  const result = (action: Decision['action'], reason: string, next = seen): Decision => ({ action, reason, next, provider, ids })
  const authorized = input.hosts.some(host => u.hostname === host || u.hostname.endsWith('.' + host))
  // A named id with any query stays a player request. Shelf is the unnamed exception, and a named image with an empty query.
  const shelf = input.resourceType === 'image' && !input.body && /^\/(?:vi|vi_webp|an_webp|sb)\/[^/]+\//.test(u.pathname) && shelfQueryAllowed(u.search) && ids.length === 1 && (!u.search || ids.some(id => !namedIds.includes(id)))
  if (!provider) {
    if (u.origin === input.origin || (u.protocol === 'https:' && ['fonts.googleapis.com', 'fonts.gstatic.com'].includes(u.hostname))) return result('release', 'local-or-fonts')
    if (!authorized) return result('abort', 'unlisted-host')
    if (phase === 'before-play') return result('abort', 'extra-host-before-play')
  }
  if (phase === 'before-play') return result('stop', 'provider-before-play')
  if (!shelf && ids.some(id => !namedIds.includes(id))) return result('stop', 'unnamed-id')
  if (u.protocol !== 'https:' || u.username || u.password || u.port) return result('stop', 'provider-url-refused')
  if (!authorized) return result('stop', 'provider-host-not-authorized')
  if (!provider) return result('record', shelf ? 'shelf-image' : 'named-extra-host')
  if (shelf && seen.api) return result('record', 'shelf-image')
  if (u.href === apiUrl) {
    if (seen.api) return result('stop', 'second-api-request')
    return result('release', 'api-entry', { ...seen, api: true })
  }
  if (input.resourceType === 'document' || u.pathname.startsWith('/embed/')) {
    const id = u.pathname.slice('/embed/'.length)
    if (u.hostname !== 'www.youtube-nocookie.com' || !u.pathname.startsWith('/embed/') || !namedIds.includes(id)) return result('stop', 'frame-url-refused')
    if (seen.frames.includes(id)) return result('stop', 'second-frame-request')
    if (!seen.api) return result('stop', 'frame-before-api')
    return result('release', 'named-frame', { ...seen, frames: [...seen.frames, id] })
  }
  if (!seen.api) return result('stop', 'provider-before-player')
  return result('record', 'player-request')
}
