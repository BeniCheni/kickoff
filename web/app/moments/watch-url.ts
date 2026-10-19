import { encodeTab, type Tab } from '../../../src/lib/urlCodecs'
import { createContext, createElement, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

/** One merge for every watch change. Unknown keys and the hash stay. `watch` is removed off Moments. */
export function mergeWatch(search: string, hash: string, tab: Tab, watch: string | null): string {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const encoded = encodeTab(tab)
  if (encoded === null) params.delete('tab')
  else params.set('tab', encoded)
  if (tab !== 'moments' || watch === null) params.delete('watch')
  else params.set('watch', watch)
  const query = params.toString()
  const fragment = hash.startsWith('#') || hash === '' ? hash : `#${hash}`
  return `${query ? `?${query}` : ''}${fragment}`
}

export function useIgnoredWatchScrub() {
  useEffect(() => {
    let restore: (() => void) | undefined
    let dead = false
    const id = window.setTimeout(() => {
      void import('./watch-scrub').then(mod => {
        if (dead) return
        restore = mod.installIgnoredWatchScrub()
      })
    }, 0)
    return () => {
      dead = true
      window.clearTimeout(id)
      restore?.()
    }
  }, [])
}

const WatchNavigation = createContext<(tab: Tab, watch: string | null) => void>(() => {})

/** Next 16.4.1 caches the initial canonical URL with its hash, then appends the
 * target hash during route prediction. Push the hashless route and restore the
 * exact fragment in the committed entry, retaining Next's new history state. */
export function WatchNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const search = useSearchParams().toString()
  const pending = useRef<{ route: string; search: string; hash: string } | null>(null)
  const navigate = useCallback((tab: Tab, watch: string | null) => {
    const href = mergeWatch(window.location.search, window.location.hash, tab, watch)
    const target = new URL(`${window.location.pathname}${href}`, window.location.origin)
    const route = `${target.pathname}${target.search}`
    pending.current = { route, search: target.searchParams.toString(), hash: target.hash }
    const push = () => router.push(route)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = (document as Document & { startViewTransition?: (update: () => void) => void }).startViewTransition
    if (!reduced && typeof start === 'function') start.call(document, push)
    else push()
  }, [router])
  useLayoutEffect(() => {
    const target = pending.current
    if (!target || target.search !== search || `${location.pathname}${location.search}` !== target.route) return
    pending.current = null
    if (location.hash !== target.hash) history.replaceState(history.state, '', `${target.route}${target.hash}`)
  }, [search])
  return createElement(WatchNavigation.Provider, { value: navigate }, children)
}

export function useWatchNavigation() {
  return useContext(WatchNavigation)
}

/** The server cannot see a fragment. Add it after hydration; `search` is supplied
 * by the shell's reactive Next search params, including native-history changes. */
export function useWatchHref(search: string, watch: string | null): string {
  const [hash, setHash] = useState('')
  useEffect(() => {
    const sync = () => setHash(window.location.hash)
    sync()
    window.addEventListener('hashchange', sync)
    window.addEventListener('popstate', sync)
    return () => {
      window.removeEventListener('hashchange', sync)
      window.removeEventListener('popstate', sync)
    }
  }, [search])
  return mergeWatch(search, hash, 'moments', watch)
}
