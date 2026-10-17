import { describe, expect, it } from 'vitest'
import { offlineBundleViolations } from '../scripts/scan-offline-bundle'

describe('offline bundle scan', () => {
  it('passes a Fixtures page and fails each forbidden marker', () => {
    expect(offlineBundleViolations('<html>Offline snapshot Fixtures Table</html>')).toEqual([])
    for (const marker of ['next/', 'drizzle', ['postgres', '://'].join(''), 'studio/', '@kickoff/catalog', 'DATABASE_URL', 'iframe_api', 'player-lost']) {
      expect(offlineBundleViolations(`<html>${marker}</html>`).length).toBeGreaterThan(0)
    }
  })
})
