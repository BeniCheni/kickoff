import { useCallback, useEffect, useState } from 'react'

/**
 * View state lives in the URL query string so a view survives a reload and can be sent to
 * someone. The prototype kept filters in memory only and reset them on every refresh.
 */
export function useUrlState<T>(
  key: string,
  initial: T,
  encode: (v: T) => string | null,
  decode: (s: string) => T,
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
      window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
    },
    [key, encode],
  )

  useEffect(() => {
    const onPop = () => {
      const raw = new URLSearchParams(window.location.search).get(key)
      setValue(raw === null ? initial : decode(raw))
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  })

  return [value, set]
}
