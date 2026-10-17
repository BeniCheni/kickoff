export function useRouter() {
  return {
    push(url: string) {
      if (typeof window === 'undefined') return
      window.history.pushState(null, '', url)
    },
    refresh() {},
  }
}
