import { expect, test } from 'vitest'
import { feedbackFaults, reducedChromeFaults } from '../scripts/evidence.mjs'

test('reduced motion: a control with no running transition passes, one that keeps a duration is named', () => {
  const still = { 'theme disc': [], 'lens thumb': [], 'lens label': [], 'disc hit area': [], tab: [] }
  expect(reducedChromeFaults(still)).toEqual([])
  expect(reducedChromeFaults({ ...still, 'lens thumb': ['background-color 0.18s', 'color 0.18s'], tab: ['color 0.15s'] })).toEqual([
    'lens thumb still runs background-color 0.18s, color 0.18s',
    'tab still runs color 0.15s',
  ])
  expect(reducedChromeFaults({ ...still, 'theme disc': null })).toEqual(['theme disc is missing'])
})

test('feedback: ink moves through the band’s voices, and a control that never changes is named', () => {
  const voices = { ink: 'rgb(242, 235, 221)', muted: 'rgb(166, 158, 143)', pitch: 'rgb(86, 192, 131)' }
  const at = (ink: string, extra = {}) => ({ ink, ground: 'rgba(0, 0, 0, 0)', shadow: 'none', voices, ...extra })
  const disc = { name: 'motion', states: ['ink', 'pitch', 'muted'] }
  const tab = { name: 'inactive tab', states: ['muted', 'ink', 'pitch'] }
  expect(feedbackFaults(disc, { rest: at(voices.ink), hover: at(voices.pitch), held: at(voices.muted) })).toEqual([])
  expect(feedbackFaults(tab, { rest: at(voices.muted), hover: at(voices.ink), held: at(voices.pitch) })).toEqual([])
  // The reviewed head: the same ink at rest, under the pointer and while held.
  expect(feedbackFaults(tab, { rest: at(voices.muted), hover: at(voices.muted), held: at(voices.muted) })).toEqual([
    'inactive tab hover ink is muted, expected ink',
    'inactive tab held ink is muted, expected pitch',
  ])
  expect(feedbackFaults(disc, { rest: at(voices.ink), hover: at(voices.pitch, { ground: 'rgb(1, 2, 3)' }), held: at('rgb(9, 9, 9)', { shadow: '0 0 4px red' }) })).toEqual([
    'motion held ink is rgb(9, 9, 9), expected muted',
    'motion hover repaints its ground',
    'motion held changes its shadow',
  ])
})
