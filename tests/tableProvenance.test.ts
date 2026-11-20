import { expect, it } from 'vitest'
import { META } from '../src/lib/fixtures'
import { STANDINGS } from '../src/lib/standings'

/**
 * The Register's cover no longer says when the table was synced, because the band's
 * provenance line, directly above it, already does. That holds only while the standings and
 * the fixtures are stamped by one sync run. Since v0.2.5 they are one snapshot boundary: a
 * failure in either aborts before a write, and all three generated files move together.
 *
 * If this fails, the two stamps have come apart and the band's line is no longer the
 * Table's: the cover has to state the standings' own stamp again.
 */
it('the standings and the fixtures are stamped by one sync run, so one provenance line serves both', () => {
  const apart = Math.abs(Date.parse(STANDINGS.fetchedAt) - Date.parse(META.lastSyncAt))
  expect(apart).toBeLessThan(60_000)
})
