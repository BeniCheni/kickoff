import { CatalogReadError } from './types'

const seen = new Set<string>()

const CLASSES: Record<string, string> = {
  ECONNREFUSED: 'connection refused',
  ECONNRESET: 'connection failed',
  ENOTFOUND: 'host not found',
  EAI_AGAIN: 'host not found',
  ETIMEDOUT: 'connection timed out',
  CONNECT_TIMEOUT: 'connection timed out',
  '28P01': 'authentication failed',
  '28000': 'authentication failed',
  '42501': 'permission denied',
  '3D000': 'database not found',
  '42P01': 'relation not found',
  '57014': 'timed out',
  '53300': 'too many connections',
  '57P01': 'connection failed',
  '08000': 'connection failed',
  '08001': 'connection failed',
  '08003': 'connection failed',
  '08006': 'connection failed',
}

/** The driver's code, including one Drizzle left on `.cause`. Never a message. */
export function driverCode(error: unknown): string {
  const seen = new Set<unknown>()
  let current: unknown = error
  for (let depth = 0; depth < 5; depth += 1) {
    if (typeof current !== 'object' || current === null) return ''
    if (seen.has(current)) return ''
    seen.add(current)
    const code = (current as { code?: unknown }).code
    if (typeof code === 'string' && code !== '') return code
    current = (current as { cause?: unknown }).cause
  }
  return ''
}

function safeClass(value: string): string {
  if (value.includes('://') || value.includes('@') || /postgres(?:ql)?:\/\//i.test(value)) return 'read failed'
  return value
}

/** A plain class. No message from the chain is used: Drizzle's carries the SQL, and a driver's can carry the user. */
export function catalogFailure(error: unknown): string {
  if (error instanceof CatalogReadError) return safeClass(error.failure)
  return CLASSES[driverCode(error)] ?? 'read failed'
}

export function isCatalogTimeout(error: unknown): boolean {
  if (error instanceof Error && error.message === 'catalog read deadline') return true
  return driverCode(error) === '57014'
}

/** One line per process per class. The line is the class only. */
export function warnCatalogRead(error: unknown, warn: (line: string) => void = console.warn) {
  const failure = catalogFailure(error)
  if (seen.has(failure)) return
  seen.add(failure)
  warn(`catalog read: ${failure}`)
}
