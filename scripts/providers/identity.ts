/** Validate the provider value before coercion or deduplication. Never mint an identity
 * from a missing value, an object, whitespace, or a previously coerced null/undefined. */
export function providerIdentity(value: unknown): string | null {
  if (typeof value === 'number') return Number.isSafeInteger(value) && value >= 0 ? String(value) : null
  if (typeof value !== 'string' || value.trim() !== value || value.length === 0) return null
  return value === 'undefined' || value === 'null' ? null : value
}

/** Diagnostic context only: unlike identity creation, this must describe invalid inputs. */
export function identityContext(value: unknown): string {
  return value === undefined ? '(missing)' : JSON.stringify(value) ?? '(unprintable)'
}
