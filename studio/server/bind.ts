/** The admin listens on IPv4 loopback and nowhere else. */
export const LOOPBACK_HOST = '127.0.0.1'

export function assertLoopbackBind(host: string): void {
  if (host !== LOOPBACK_HOST) {
    throw new Error('The Studio admin binds to 127.0.0.1 only')
  }
}

/** Host header must be loopback. A public name that rebinds to this machine is refused. */
export function isLoopbackHost(hostHeader: string | undefined, port: number): boolean {
  if (!hostHeader) return false
  const host = hostHeader.trim().toLowerCase()
  return host === LOOPBACK_HOST
    || host === `${LOOPBACK_HOST}:${port}`
    || host === '[::1]'
    || host === `[::1]:${port}`
}
