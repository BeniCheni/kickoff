import { expect, test } from 'vitest'
import { reducedChromeFaults } from '../scripts/evidence.mjs'

test('reduced motion: a control with no running transition passes, one that keeps a duration is named', () => {
  const still = { 'theme disc': [], 'lens thumb': [], 'lens label': [], 'disc hit area': [], tab: [] }
  expect(reducedChromeFaults(still)).toEqual([])
  expect(reducedChromeFaults({ ...still, 'lens thumb': ['background-color 0.18s', 'color 0.18s'], tab: ['color 0.15s'] })).toEqual([
    'lens thumb still runs background-color 0.18s, color 0.18s',
    'tab still runs color 0.15s',
  ])
  expect(reducedChromeFaults({ ...still, 'theme disc': null })).toEqual(['theme disc is missing'])
})
