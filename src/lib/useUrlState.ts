import { useCallback, useEffect, useEffectEvent, useState } from 'react'

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
  const [value, setValue] = useState<T>(() => {
    const raw = new URLSearchParams(window.location.search).get(key)
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
