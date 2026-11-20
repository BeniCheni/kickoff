import { afterEach, beforeEach, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { META } from '../../src/lib/fixtures'
import { TABLE_LEAGUES } from '../../src/lib/competitions'
import { StalenessBanner } from '../../src/components/StalenessBanner'
import { TablePage } from '../../src/components/TablePage'
import { STANDINGS } from '../../src/lib/standings'
import { normalizeStandingEntry } from '../../scripts/providers/espn-standings'
import recorded from '../fixtures/espn/ucl-standings.json'
import { primeClock } from './rig'

const originalUcl = STANDINGS.leagues.ucl
beforeEach(() => { STANDINGS.leagues.ucl = recorded.children[0]!.standings.entries.map((entry) => normalizeStandingEntry(entry)!) })
afterEach(() => { if (originalUcl) STANDINGS.leagues.ucl = originalUcl; else delete STANDINGS.leagues.ucl })

let release: (() => void) | undefined
afterEach(() => { cleanup(); release?.(); release = undefined })

// Voice inventory, not a jsdom contrast measurement. The Table's two notes were the first
// edition's amber wash; they are flat now, each unit in a named voice on the page's ground.
// tests/tableSkin.test.ts holds every voice to the pair the handoff measured for it.
function voiceOf(element: Element | null) {
  return element?.getAttribute('data-voice') ?? null
}
it('the 24h banner is the amber plane, and the 72h banner is the alarm plane', () => {
  release = primeClock(new Date(Date.parse(META.lastSyncAt) + 25 * 60 * 60 * 1000))
  const day = render(<StalenessBanner />)
  expect(day.container.querySelector('.staleness')?.getAttribute('data-plane')).toBe('amber')
  expect(day.container.querySelector('.staleness')?.getAttribute('data-voice')).toBe('amber')
  expect(day.container.querySelector('.bg-floodlight-bg')).toBeNull()
  day.unmount()
  release()
  release = primeClock(new Date(Date.parse(META.lastSyncAt) + 73 * 60 * 60 * 1000))
  const old = render(<StalenessBanner />)
  expect(old.container.querySelector('.staleness')?.getAttribute('data-plane')).toBe('alarm')
  expect(old.container.querySelector('.staleness')?.getAttribute('data-voice')).toBe('alarm')
  expect(old.container.textContent).toContain('Data is stale.')
})
it.each(TABLE_LEAGUES)('%s: the games-in-hand note and the sorted note are flat, in named voices', (league) => {
  window.history.replaceState(null, '', `/?league=${league}`)
  release = primeClock(new Date(META.lastSyncAt))
  const { container } = render(<TablePage />)
  const played = STANDINGS.leagues[league]!.map((row) => row.played)
  const behind = played.filter((count) => count < Math.max(...played)).length

  // Amber heading and left rule, the sentence in ink, and a chip per club behind, per layout.
  const note = container.querySelector('[data-inhand-note]')
  expect(Boolean(note)).toBe(behind > 0)
  if (note) {
    expect(voiceOf(note.querySelector('.inhand-note-heading'))).toBe('amber')
    expect(voiceOf(note.querySelector('.inhand-note-copy'))).toBe('ink')
  }
  const chips = [...container.querySelectorAll('.inhand-chip')]
  expect(chips).toHaveLength(behind * 2)
  for (const chip of chips) expect(voiceOf(chip)).toBe('amber')

  fireEvent.click(screen.getByRole('button', { name: 'PPG' }))
  expect(voiceOf(screen.getByText(/Sorted by/))).toBe('ink')
  expect(container.querySelector('.bg-floodlight-bg')).toBeNull()
})
