import { expect, test } from 'vitest'
import { hitAreaFaults, momentsPaintFaults } from '../scripts/evidence.mjs'

test('a 44px control passes, a short one fails, and a shared edge is not an overlap', () => {
  const ok = { name: 'Stop motion', left: 0, top: 0, right: 44, bottom: 44, w: 44, h: 44 }
  const next = { name: 'Dark mode', left: 44, top: 0, right: 88, bottom: 44, w: 44, h: 44 }
  expect(hitAreaFaults([ok, next])).toEqual([])
  expect(hitAreaFaults([{ ...ok, w: 26, h: 26 }])).toEqual(['Stop motion 26.0×26.0'])
  expect(hitAreaFaults([ok, { ...next, left: 40, right: 84 }])).toEqual(['Stop motion overlaps Dark mode'])
})

test('Moments paint: pulp ground and pulp-ink pass; the first edition’s ground or ink is a fault', () => {
  const pulp = 'rgb(235, 221, 190)'
  const pulpInk = 'rgb(28, 22, 17)'
  expect(momentsPaintFaults({ ground: pulp, ink: pulpInk, heading: pulpInk, pulp, pulpInk })).toEqual([])
  expect(momentsPaintFaults({ ground: pulp, ink: pulpInk, heading: null, pulp, pulpInk })).toEqual([])
  expect(momentsPaintFaults({ ground: 'rgb(247, 245, 238)', ink: pulpInk, heading: pulpInk, pulp, pulpInk }))
    .toEqual(['ground rgb(247, 245, 238), expected pulp rgb(235, 221, 190)'])
  expect(momentsPaintFaults({ ground: pulp, ink: 'rgb(22, 33, 27)', heading: 'rgb(22, 33, 27)', pulp, pulpInk })).toEqual([
    'inherited ink rgb(22, 33, 27), expected pulp-ink rgb(28, 22, 17)',
    'heading ink rgb(22, 33, 27), expected pulp-ink rgb(28, 22, 17)',
  ])
  expect(momentsPaintFaults(null)).toEqual(['the Moments route is missing'])
})
