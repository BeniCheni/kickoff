import { fixtureSchema, type Fixture } from '../src/lib/schema'

/**
 * Validation at the boundary, all-or-nothing. A row the schema rejects means the provider
 * changed shape — or the mapper let a value through it shouldn't have: an ESPN score of
 * "1.5" passes `Number.isFinite` in normalizeEvent and fails `z.number().int()` here. Once
 * the sync runs unattended, a warning nobody reads is the same as no warning: the row would
 * vanish from the snapshot silently, and if it was new, without even a DISAPPEARED line to
 * notice it by. So every offender is collected and reported together, and the caller refuses
 * to write. Never coerced — that is how bad data gets laundered into good-looking data.
 */
export function validateFixtures(candidates: readonly unknown[]): {
  valid: Fixture[]
  rejected: string[]
} {
  const valid: Fixture[] = []
  const rejected: string[] = []
  for (const candidate of candidates) {
    const parsed = fixtureSchema.safeParse(candidate)
    if (parsed.success) {
      valid.push(parsed.data)
      continue
    }
    const id = (candidate as { id?: unknown } | null)?.id
    const issue = parsed.error.issues[0]
    const where = issue?.path.length ? issue.path.join('.') : '(root)'
    rejected.push(
      `  ! ${typeof id === 'string' ? id : '(no id)'}: ${where} — ${issue?.message ?? 'invalid'}`,
    )
  }
  return { valid, rejected }
}
