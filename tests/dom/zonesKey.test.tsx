import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { LEAGUE_TABLES, ZONES_SEASON } from '../../src/lib/competitions'
import { META } from '../../src/lib/fixtures'
import { STANDINGS } from '../../src/lib/standings'
import { TablePage } from '../../src/components/TablePage'
import { primeClock } from './rig'

/**
 * Zones & key, closed and opened, and the season note (ruling 26). The words are the app's
 * own; this file holds where they sit, which marks the page carries, and what the page does
 * when the zone data describes a different season from the snapshot.
 */
const season = STANDINGS.season
let release: (() => void) | undefined
afterEach(() => { cleanup(); release?.(); release = undefined; STANDINGS.season = season })

function mount(league: string) {
  window.history.replaceState(null, '', `/?league=${league}`)
  release = primeClock(new Date(META.lastSyncAt))
  return render(<TablePage />)
}
const bar = () => screen.getByRole('button', { name: 'Zones & key' })
const bands = (root: ParentNode, selector: string) => [...root.querySelectorAll(selector)].map((mark) => mark.getAttribute('data-band'))

describe('Zones & key', () => {
  it('is closed at first: a square per zone on the bar, and nothing of the key in the page', () => {
    const { container } = mount('ligue1')
    expect(bar().getAttribute('aria-expanded')).toBe('false')
    expect(bands(bar(), '.zone-mark-square')).toEqual(LEAGUE_TABLES.ligue1!.zones.map((zone) => zone.band))
    expect(bands(bar(), '.zone-mark-square')).toEqual(['place', 'playoff', 'place', 'place', 'relegation-playoff', 'relegation'])
    expect(container.querySelector('.zones-key-panel')).toBeNull()
    expect(screen.queryByText('Qualification zones')).toBeNull()
  })

  it('opens between the league tabs and the table head, and holds three things and no control', () => {
    const { container } = mount('bundesliga')
    fireEvent.click(bar())
    expect(bar().getAttribute('aria-expanded')).toBe('true')
    const panel = container.querySelector('.zones-key-panel')!
    expect(bar().getAttribute('aria-controls')).toBe(panel.id)
    expect([...panel.querySelectorAll('.zones-key-heading')].map((heading) => heading.textContent)).toEqual(['Qualification zones', 'Columns', 'How ties are broken'])
    expect(panel.querySelector('button, a, input, select, [tabindex]')).toBeNull()

    // In reading order: the picker, the key, then the first table.
    const order = [container.querySelector('[data-table-picker]')!, container.querySelector('.zones-key')!, container.querySelector('[data-table]')!]
    expect(order[0]!.compareDocumentPosition(order[1]!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(order[1]!.compareDocumentPosition(order[2]!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    // One entry per zone: its band, its name, its positions and its note, in the app's words.
    const zones = LEAGUE_TABLES.bundesliga!.zones
    const entries = [...panel.querySelectorAll('.zones-key-zone')]
    expect(entries.map((entry) => entry.querySelector('.zones-key-zone-note')!.textContent)).toEqual(zones.map((zone) => zone.note))
    expect(entries.map((entry) => entry.querySelector('.zones-key-zone-name')!.textContent)).toEqual(['Champions League 1–4', 'Europa League 5', 'Conference League 6', 'Relegation play-off 16', 'Relegation 17–18'])
    expect(bands(panel, '.zone-mark-band')).toEqual(['place', 'place', 'place', 'relegation-playoff', 'relegation'])
    expect(panel.textContent).toContain(LEAGUE_TABLES.bundesliga!.tieBreak)

    fireEvent.click(bar())
    expect(container.querySelector('.zones-key-panel')).toBeNull()
  })

  it('sets “league” in italics in a league’s Columns paragraph, each heading in bold', () => {
    const { container } = mount('pl')
    fireEvent.click(bar())
    const columns = container.querySelectorAll('.zones-key-copy')[0]!
    expect(columns.textContent).toBe('Pts points · Pl played · GD goal difference · PPG points per game — the honest comparator while clubs have games in hand · Form results oldest to newest, W / D / L lettered, not colour alone · Next the club\'s next league match — midweek European and cup ties are not shown here.')
    expect([...columns.querySelectorAll('i')].map((word) => word.textContent)).toEqual(['league'])
    expect([...columns.querySelectorAll('b')].map((word) => word.textContent)).toEqual(['Pts', 'Pl', 'GD', 'PPG', 'Form', 'Next'])
  })

  it('gives a phase competition its own two clauses', () => {
    const { container } = mount('ucl')
    if (!STANDINGS.leagues.ucl?.length) return
    fireEvent.click(bar())
    const columns = container.querySelectorAll('.zones-key-copy')[0]!
    expect(columns.textContent).toContain('points per game — different opponents limit the comparison · Form')
    expect(columns.textContent).toContain('the club\'s next match in this competition; domestic and other cup ties are not shown here.')
    expect(columns.querySelector('i')).toBeNull()
    expect(bands(bar(), '.zone-mark-square')).toEqual(['place', 'playoff', 'eliminated'])
  })

  it('marks every row with its zone’s band, and a row outside every zone with none', () => {
    const { container } = mount('laliga')
    const phone = container.querySelector('[data-table="mobile"]')!
    const marks = bands(phone, '[data-table-row] .zone-mark-band')
    expect(marks).toHaveLength(20)
    expect(marks.slice(0, 7)).toEqual(['place', 'place', 'place', 'place', 'place', 'place', 'place'])
    expect(marks.slice(7, 17)).toEqual(Array(10).fill(null))
    expect(marks.slice(17)).toEqual(['relegation', 'relegation', 'relegation'])
    // A zone header carries the same mark as its rows, as a square.
    expect(bands(phone, '[data-zone-divider] .zone-mark-square')).toEqual(['place', 'place', 'place', 'relegation'])
  })
})

describe('the season note (ruling 26)', () => {
  it('hides the bands, takes the squares off the bar, and says so first inside the opened key, in ink', () => {
    STANDINGS.season = ZONES_SEASON - 1
    const { container } = mount('laliga')

    // Closed: no squares, no band on any row, no zone header, and no note outside the key.
    expect(bar().querySelector('.zone-mark')).toBeNull()
    expect(bands(container, '[data-table-row] .zone-mark-band').every((band) => band === null)).toBe(true)
    expect(container.querySelector('[data-zone-divider]')).toBeNull()
    expect(container.textContent).not.toContain('Zone bands are hidden')

    fireEvent.click(bar())
    const panel = container.querySelector('.zones-key-panel')!
    const note = panel.firstElementChild!
    expect(note.hasAttribute('data-season-note')).toBe(true)
    expect(note.textContent).toBe('Zone bands are hidden: the snapshot is the 2025-26 season but the zone metadata describes 2026-27.')
    // Ink, on the panel's own voice: not amber and not the alarm.
    expect(panel.getAttribute('data-voice')).toBe('ink')
    expect(note.getAttribute('data-voice')).toBeNull()
    expect(panel.querySelector('[data-voice="amber"], [data-voice="alarm"]')).toBeNull()
    // The key still lists the zones, without a band beside any.
    expect(bands(panel, '.zone-mark-band').every((band) => band === null)).toBe(true)
    // The maintainers' instruction does not ship.
    expect(container.textContent).not.toMatch(/LEAGUE_TABLES/)
  })

  it('is absent while the zone data describes the snapshot’s season', () => {
    const { container } = mount('laliga')
    fireEvent.click(bar())
    expect(container.querySelector('[data-season-note]')).toBeNull()
  })
})
