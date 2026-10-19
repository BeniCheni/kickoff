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

function codeOf(error: unknown): string {
  if (typeof error !== 'object' || error === null) return ''
  const code = (error as { code?: unknown }).code
  return typeof code === 'string' ? code : ''
}

function safeClass(value: string): string {
  if (value.includes('://') || value.includes('@') || /postgres(?:ql)?:\/\//i.test(value)) return 'read failed'
  return value
}

/** A plain class. The original message is not used, because it can carry the address. */
export function catalogFailure(error: unknown): string {
  if (error instanceof CatalogReadError) return safeClass(error.failure)
  return CLASSES[codeOf(error)] ?? 'read failed'
}

/** One line per process per class. The line is the class only. */
export function warnCatalogRead(error: unknown, warn: (line: string) => void = console.warn) {
  const failure = catalogFailure(error)
  if (seen.has(failure)) return
  seen.add(failure)
  warn(`catalog read: ${failure}`)
}
