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
export function connectionOptions(url: string, env: NodeJS.ProcessEnv = process.env): CatalogConnection {
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
  for (const key of parsed.searchParams.keys()) {
    if (key !== 'sslmode') {
      throw new CatalogReadError('catalog database address is not usable', false, 'connection string has extra parameters')
    }
  }
  const local = loopback(parsed.hostname)
  if (local && env.VERCEL_ENV) {
    throw new CatalogReadError('catalog database address is not usable', false, 'loopback database is local only')
  }
  return {
    prepare: false,
    max: 1,
    connect_timeout: 5,
    idle_timeout: 20,
    ssl: local ? false : 'require',
    onnotice: () => {},
  }
}
