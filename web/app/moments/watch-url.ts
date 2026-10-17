import { encodeTab, type Tab } from '../../../src/lib/urlCodecs'

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
