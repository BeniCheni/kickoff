import { CatalogReadError } from './types'

export type CatalogConnection = {
  prepare: false
  max: 1
  connect_timeout: 5
  idle_timeout: 20
  ssl: false | 'require'
  onnotice: () => void
}

function loopback(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '[::1]'
}

/**
 * One connection, unnamed statements, a five-second connect.
 * TLS is required except on a loopback host, which is the local proof.
 * The address itself is not copied into the returned options.
 */
export function connectionOptions(url: string): CatalogConnection {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new CatalogReadError('catalog database address is not usable', false)
  }
  if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
    throw new CatalogReadError('catalog database address is not usable', false)
  }
  if (!parsed.hostname) throw new CatalogReadError('catalog database address is not usable', false)
  return {
    prepare: false,
    max: 1,
    connect_timeout: 5,
    idle_timeout: 20,
    ssl: loopback(parsed.hostname) ? false : 'require',
    onnotice: () => {},
  }
}
