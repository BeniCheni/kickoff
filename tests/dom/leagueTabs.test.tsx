import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { COMPETITIONS, TABLE_LEAGUES, type CompetitionKey } from '../../src/lib/competitions'
import { LeagueTabs } from '../../src/components/LeagueTabs'

/**
 * The league tabs' one use of a competition's colour: an 8px dot on the tab being read, as
 * boards 07 and 08 draw it (the review of PR #352, finding 9). What the dot's paint is, and
 * that the hue has no other use, is read from the stylesheet in tests/tableSkin.test.ts.
 */
function Tabs({ start }: { start: CompetitionKey }) {
  const [league, setLeague] = useState(start)
  return <LeagueTabs league={league} onPick={setLeague} />
}
const tabs = (container: HTMLElement) => [...container.querySelectorAll<HTMLButtonElement>('[data-table-picker] button')]
const dots = (container: HTMLElement) => [...container.querySelectorAll<HTMLElement>('.league-tab-dot')]

describe('the league tabs’ competition dot', () => {
  it.each(TABLE_LEAGUES)('is on the current tab alone, ahead of the name, in that competition’s hue (%s)', (league) => {
    const { container } = render(<Tabs start={league} />)
    expect(dots(container)).toHaveLength(1)
    const [dot] = dots(container)
    const tab = dot!.closest('button')!
    expect(tab.getAttribute('aria-pressed')).toBe('true')
    expect(tab.getAttribute('data-league')).toBe(league)
    expect(dot!.style.getPropertyValue('--comp-hue')).toBe(COMPETITIONS[league].color)
    // Ahead of the name, inside the black plate, and nothing a screen reader is told about.
    const plate = tab.firstElementChild!
    expect(plate.getAttribute('data-stock')).toBe('black')
    expect(plate.firstChild).toBe(dot)
    expect(dot!.getAttribute('aria-hidden')).toBe('true')
    expect(dot!.childNodes).toHaveLength(0)
    expect(screen.getByRole('button', { name: COMPETITIONS[league].name, pressed: true })).toBe(tab)
  })

  it('gives no other tab a dot, a hue, a flag or a style of its own', () => {
    const { container } = render(<Tabs start="pl" />)
    for (const tab of tabs(container).filter((each) => each.getAttribute('aria-pressed') !== 'true')) {
      expect(tab.querySelector('.league-tab-dot'), tab.textContent!).toBeNull()
      expect(tab.querySelector('[style]'), tab.textContent!).toBeNull()
      expect(tab.firstElementChild!.getAttribute('data-stock'), tab.textContent!).toBeNull()
    }
    // Each tab reads its league's name and nothing else, and carries its league's key in order.
    expect(tabs(container).map((tab) => tab.textContent)).toEqual(TABLE_LEAGUES.map((key) => COMPETITIONS[key].name))
    expect(tabs(container).map((tab) => tab.getAttribute('data-league'))).toEqual([...TABLE_LEAGUES])
    expect(container.textContent).not.toMatch(/[\u{1F1E6}-\u{1F1FF}\u{1F3F4}⭐]/u)
    // The hue is on no tab, no plate and no label: the dot is the only element with a style.
    expect([...container.querySelectorAll('[style]')]).toEqual(dots(container))
  })

  it('moves with the league: one dot, on the tab just pressed, in the new competition’s hue', () => {
    const { container } = render(<Tabs start="pl" />)
    fireEvent.click(screen.getByRole('button', { name: 'Serie A' }))
    expect(dots(container)).toHaveLength(1)
    expect(dots(container)[0]!.closest('button')!.getAttribute('data-league')).toBe('seriea')
    expect(dots(container)[0]!.style.getPropertyValue('--comp-hue')).toBe(COMPETITIONS.seriea.color)
    expect(COMPETITIONS.seriea.color).not.toBe(COMPETITIONS.pl.color)
  })
})
