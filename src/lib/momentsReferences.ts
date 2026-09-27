/** Shared caller/storage boundary. Do not trim: that could identify another reference. */
export const isMomentReference = (id: unknown): id is string =>
  typeof id === 'string' && id.length > 0 && id === id.trim()

export const momentReferences = (value: unknown): string[] =>
  Array.isArray(value) ? [...new Set(value.filter(isMomentReference))] : []
