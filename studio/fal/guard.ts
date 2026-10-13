export const STUB_HOST = 'studio-stub.invalid'

export class NetworkGuardError extends Error {
  readonly host: string

  constructor(host: string) {
    super(`network guard: host ${host} is not the stub`)
    this.name = 'NetworkGuardError'
    this.host = host
  }
}

export function requestUrl(input: Parameters<typeof fetch>[0]): URL {
  if (typeof input === 'string') return new URL(input)
  if (input instanceof URL) return input
  return new URL(input.url)
}

export function createNetworkGuard(inner: typeof fetch, allowedHost = STUB_HOST): typeof fetch {
  return async (input, init) => {
    const url = requestUrl(input)
    if (url.host !== allowedHost) throw new NetworkGuardError(url.host)
    return inner(input, init)
  }
}
