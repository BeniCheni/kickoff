import { expect, test } from 'vitest'
import { hitAreaFaults } from '../scripts/evidence.mjs'

test('a 44px control passes, a short one fails, and a shared edge is not an overlap', () => {
  const ok = { name: 'Stop motion', left: 0, top: 0, right: 44, bottom: 44, w: 44, h: 44 }
  const next = { name: 'Dark mode', left: 44, top: 0, right: 88, bottom: 44, w: 44, h: 44 }
  expect(hitAreaFaults([ok, next])).toEqual([])
  expect(hitAreaFaults([{ ...ok, w: 26, h: 26 }])).toEqual(['Stop motion 26.0×26.0'])
  expect(hitAreaFaults([ok, { ...next, left: 40, right: 84 }])).toEqual(['Stop motion overlaps Dark mode'])
})
