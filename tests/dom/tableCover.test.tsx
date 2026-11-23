import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { COMPETITIONS, LEAGUE_TABLES, type CompetitionKey } from '../../src/lib/competitions'
import { META, SYNC_STAMP } from '../../src/lib/fixtures'
import { matchdayProgress, STANDINGS, tableFor } from '../../src/lib/standings'
import { todayIso } from '../../src/lib/time'
import { TablePage } from '../../src/components/TablePage'
import { primeClock } from './rig'

/**
 * The Register's short cover. It carries the book's label and name and one line: the league
 * being read and the app's own "As of matchday N of M". The numbers are matchdayProgress's,
 * read here from the same snapshot; the cover computes nothing.
 */
let release: (() => void) | undefined
afterEach(() => { cleanup(); release?.(); release = undefined })

function mount(league: CompetitionKey) {
  window.history.replaceState(null, '', `/?league=${league}`)
  const now = new Date(META.lastSyncAt)
  release = primeClock(now)
  const progress = matchdayProgress(tableFor(league, todayIso(now), now.toISOString()), LEAGUE_TABLES[league])!
  return { ...render(<TablePage />), progress }
}
const cover = (container: HTMLElement) => container.querySelector('.register-cover') as HTMLElement

describe('The Register’s cover', () => {
  it('is the first thing on the page, on black stock, with the book’s label and name', () => {
    const { container } = mount('laliga')
    expect(container.querySelector('.register')!.firstElementChild).toBe(cover(container))
    expect(cover(container).getAttribute('data-stock')).toBe('black')
    expect(cover(container).querySelector('.register-cover-label')!.textContent).toBe('A Fergie Time Book · The Register')
    expect(cover(container).querySelector('.register-cover-title')!.textContent).toBe('The Register')
  })

  it('carries the league and the app’s own matchday line, from matchdayProgress', () => {
    const { container, progress } = mount('laliga')
    const line = cover(container).querySelector('.register-cover-line')!
    expect(line.textContent).toBe(`La Liga · As of matchday ${progress.played} of 38`)
    // Rule 9: it breaks at a middot only, so each side of the middot is its own unit.
    expect([...line.querySelectorAll('span')].map((unit) => unit.textContent)).toEqual(['La Liga', `As of matchday ${progress.played} of 38`])
  })

  it('names the phase where the competition has one', () => {
    if (!STANDINGS.leagues.ucl?.length) return
    const { container, progress } = mount('ucl')
    expect(cover(container).querySelector('.register-cover-line')!.textContent).toBe(`Champions League · As of matchday ${progress.played} of 8 · league phase`)
  })

  it('follows the league tabs', () => {
    const { container } = mount('laliga')
    fireEvent.click(screen.getByRole('button', { name: 'Bundesliga' }))
    expect(cover(container).querySelector('.register-cover-line')!.textContent).toMatch(/^Bundesliga · As of matchday \d+ of 34$/)
    expect(COMPETITIONS.bundesliga.name).toBe('Bundesliga')
  })

  it('has no photograph, no caption, no tagline and no control: the art window is empty stock', () => {
    const { container } = mount('pl')
    const art = cover(container).querySelector('.register-cover-art')!
    expect(art.getAttribute('aria-hidden')).toBe('true')
    expect(art.childElementCount).toBe(0)
    expect(art.getAttribute('style')).toBeNull()
    expect(cover(container).querySelector('img, picture, video, canvas, svg, button, a')).toBeNull()
    expect([...cover(container).querySelectorAll('p')]).toHaveLength(3)
    expect(cover(container).textContent).not.toMatch(/ILLUSTRATIVE|falling/i)
  })

  it('leaves the sync instant to the provenance line, which the page’s own foot still prints', () => {
    const { container } = mount('seriea')
    expect(cover(container).textContent).not.toMatch(/sync/i)
    expect(container.querySelector('.page-foot .provenance')!.textContent).toContain(`SYNCED ${SYNC_STAMP}`)
  })
})
