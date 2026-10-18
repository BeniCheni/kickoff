import { useContext } from 'react'
import { SearchContext } from '../../src/lib/useUrlState'

export function useRouter() {
  return {
    push(url: string) {
      if (typeof window === 'undefined') return
      window.history.pushState(null, '', url)
    },
    refresh() {},
  }
}
export function useSearchParams() {
  return new URLSearchParams(useContext(SearchContext) ?? '')
}
