import { createContext, createElement, useCallback, useContext, useEffect, useEffectEvent, useRef, useState, type ReactNode } from 'react'
import { canonicalSearch } from './urlCodecs'

/**
 * The request's search string, when a server render supplies one. Absent on the Vite
 * app, which keeps reading `window.location`.
 */
export const SearchContext = createContext<string | null>(null)

export function SearchProvider({ search, children }: { search: string; children: ReactNode }) {
  return createElement(SearchContext.Provider, { value: search }, children)
}

/**
 * View state lives in the URL query string so a view survives a reload and can be sent to
 * someone. The prototype kept filters in memory only and reset them on every refresh.
 *
 * `history` picks how a change lands: filters and view tweaks `replace` (the default —
 * flipping five competition chips should not bury the page you came from), while top-level
 * navigation like the Fixtures/Table tab must `push`, so the Back button returns to the
 * previous tab instead of leaving the site.
 */
export function useUrlState<T>(
  key: string,
  initial: T,
  encode: (v: T) => string | null,
  decode: (s: string) => T,
  history: 'replace' | 'push' = 'replace',
): [T, (v: T) => void] {
  const provided = useContext(SearchContext)
  const [value, setValue] = useState<T>(() => {
    const search = provided ?? (typeof window === 'undefined' ? '' : window.location.search)
    const raw = new URLSearchParams(search).get(key)
    if (raw === null) return initial
    try {
      return decode(raw)
    } catch {
      return initial
    }
  })

  const set = useCallback(
    (v: T) => {
      setValue(v)
      const params = new URLSearchParams(window.location.search)
      const encoded = encode(v)
      if (encoded === null) params.delete(key)
      else params.set(key, encoded)
      const qs = params.toString()
      const url = window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash
      if (history === 'push') window.history.pushState(null, '', url)
      else window.history.replaceState(null, '', url)
    },
    [key, encode, history],
  )

  // The subscription stays put; initial/decode stay fresh when today's date changes.
  const onPop = useEffectEvent(() => {
      const raw = new URLSearchParams(window.location.search).get(key)
      if (raw === null) {
        setValue(initial)
        return
      }
      try {
        setValue(decode(raw))
      } catch {
        setValue(initial)
      }
  })
  useEffect(() => {
    const listener = () => onPop()
    window.addEventListener('popstate', listener)
    return () => window.removeEventListener('popstate', listener)
  }, [key])

  return [value, set]
}

/** Once per load, as App has always done. A later tick must not unpin a date that has
 *  become today. The fragment is kept. */
export function useCanonicalSearch(today: string) {
  const normalized = useRef(false)
  useEffect(() => {
    if (normalized.current) return
    normalized.current = true
    const search = canonicalSearch(window.location.search, today)
    if (search !== window.location.search) {
      window.history.replaceState(window.history.state, '', window.location.pathname + search + window.location.hash)
    }
  }, [today])
}
