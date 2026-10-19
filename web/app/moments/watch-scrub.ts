import { parseTab } from '../../../src/lib/urlCodecs'
import { mergeWatch } from './watch-url'

/** Drop an ignored `watch` from a non-Moments URL. Moments URLs and watch-less URLs pass through. */
export function scrubIgnoredWatch(url: string | URL | null | undefined, currentHref = 'http://127.0.0.1/'): string | URL | null | undefined {
  if (url == null || url === '') return url
  let parsed: URL
  try {
    parsed = new URL(String(url), currentHref)
  } catch {
    return url
  }
  const current = new URL(currentHref)
  if (parsed.origin !== current.origin) return url
  if (parseTab(parsed.searchParams.get('tab') ?? '') === 'moments' || !parsed.searchParams.has('watch')) return url
  const tab = parseTab(parsed.searchParams.get('tab') ?? '')
  const merged = mergeWatch(parsed.search, parsed.hash, tab, null)
  return `${parsed.pathname}${merged}`
}

export function installIgnoredWatchScrub(): () => void {
  const push = window.history.pushState
  const replace = window.history.replaceState
  const wrap = (original: History['pushState']) => function (this: History, data: unknown, unused: string, url?: string | URL | null) {
    return original.call(this, data, unused, scrubIgnoredWatch(url, window.location.href) as string | URL | null | undefined)
  }
  window.history.pushState = wrap(push)
  window.history.replaceState = wrap(replace)
  return () => {
    window.history.pushState = push
    window.history.replaceState = replace
  }
}
