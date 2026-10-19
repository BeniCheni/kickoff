import { redact } from '../log/redact.ts'
import { findSecrets } from '../secrets/scan.ts'

/** A client-visible error. Secrets, including on the throw path, become a bare refusal. */
export function publicError(error: unknown): string {
  const raw = error instanceof Error ? error.message : 'refused'
  const cleaned = redact(raw)
  if (findSecrets(raw).length > 0 || findSecrets(cleaned).length > 0) return 'refused'
  if (cleaned.includes('[redacted]') || cleaned.includes('[connection-redacted]')) return 'refused'
  if (/failed query|econnrefused|etimedout|enotfound|connect_timeout|password authentication|too many clients/i.test(raw) || /failed query|econnrefused|etimedout|enotfound|connect_timeout|password authentication|too many clients/i.test(cleaned)) {
    return 'refused'
  }
  return cleaned.length > 0 ? cleaned : 'refused'
}
