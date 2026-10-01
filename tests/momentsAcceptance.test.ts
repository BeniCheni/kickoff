import { expect, it } from 'vitest'
import raw from '../docs/verification/moments-acceptance/edition.json'
import provenance from '../docs/verification/moments-acceptance/fixture-provenance.json'
import { FIXTURES } from '../src/lib/fixtures'
import { hasEmbedPermission, parseMoments } from '../src/lib/moments'

it('the acceptance edition validates; every archived fixture is absent from the current snapshot', () => {
  const edition = parseMoments(raw, FIXTURES)
  expect(edition).toHaveLength(6)
  expect(provenance.snapshotSha).toMatch(/^[a-f0-9]{40}$/)
  for (const item of edition) {
    expect(FIXTURES.some(f => f.id === item.fixtureId)).toBe(false)
    const row = provenance.rows.find(f => f.id === item.fixtureId)
    expect(row).toBeDefined()
    for (const [key, value] of Object.entries(item.fixture)) expect(row).toHaveProperty(key, value)
    expect(['pkEpLtePJm0', 'iBuTEywEQ6U', 'sXAkBsEcXSo']).not.toContain(item.source.identity?.videoId)
    for (const permission of item.source.permissions ?? []) expect(permission.basis).toContain('Fictional acceptance record')
  }
  expect(edition.map(m => hasEmbedPermission(m.source, '2026-10-01T16:00:00Z'))).toEqual([true, true, false, false, false, false])
})
