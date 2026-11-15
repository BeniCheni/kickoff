import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { WeekView } from '../../src/components/WeekView'
import { COMPETITION_KEYS, competitionRank } from '../../src/lib/competitions'
import { FIXTURES } from '../../src/lib/fixtures'
import type { Fixture } from '../../src/lib/schema'
import { brooklynDate, posterDayTitle, startOfWeek, weekdayShort } from '../../src/lib/time'

const active = new Set(COMPETITION_KEYS)

/** The rule, computed here rather than by calling sortForDisplay, so a lens that
 *  reorders rows fails even when the helper itself is right. Sort is stable. */
function expectedOrder(date: string): Fixture[] {
  return FIXTURES.filter((fixture) => brooklynDate(fixture.kickoffUtc) === date).sort(
    (a, b) =>
      competitionRank(a.competition) - competitionRank(b.competition) ||
      a.kickoffUtc.localeCompare(b.kickoffUtc),
  )
}

function pairing(fixture: Fixture): string {
  return `${fixture.home.name} vs ${fixture.away.name}`
}

/** An element's own text, ignoring descendants. Ledger's weekday and numeral are divs. */
function ownText(element: Element): string | null {
  if (element.childNodes.length !== 1 || element.childNodes[0]?.nodeType !== Node.TEXT_NODE) return null
  return element.textContent
}

function sectionFor(container: HTMLElement, date: string, lens: 'poster' | 'ledger'): HTMLElement | null {
  const sections = [...container.querySelectorAll('section')]
  if (lens === 'poster') {
    const title = posterDayTitle(date)
    return sections.find((section) =>
      [...section.querySelectorAll('span')].some((span) => ownText(span) === title),
    ) ?? null
  }
  const numeral = String(Number(date.slice(8)))
  const weekday = weekdayShort(date)
  return sections.find((section) => {
    const texts = [...section.querySelectorAll('div')].map(ownText)
    return texts.includes(weekday) && texts.includes(numeral)
  }) ?? null
}

/** Longest contained pairing wins, so "Arsenal vs Chelsea" does not claim "Arsenal vs Chelsea B". */
function renderedIds(section: HTMLElement, expected: Fixture[]): string[] {
  const remaining = [...expected]
  const found: string[] = []
  for (const button of section.querySelectorAll('button')) {
    const text = button.textContent ?? ''
    const hits = remaining.filter((fixture) => text.includes(pairing(fixture)))
    hits.sort((a, b) => pairing(b).length - pairing(a).length)
    const hit = hits[0]
    if (!hit) continue
    found.push(hit.id)
    remaining.splice(remaining.indexOf(hit), 1)
  }
  return found
}

describe('a day renders in display order in both lenses', () => {
  it('keeps group, then kickoff, in Poster and Ledger', () => {
    const date = [...new Set(FIXTURES.map((fixture) => brooklynDate(fixture.kickoffUtc)))].find((day) => {
      const ranks = new Set(expectedOrder(day).map((fixture) => competitionRank(fixture.competition)))
      return ranks.size >= 2
    })
    expect(date, 'the snapshot holds a day in more than one competition group').toBeTruthy()
    const expected = expectedOrder(date!)
    expect(expected.length).toBeGreaterThan(1)

    for (const lens of ['poster', 'ledger'] as const) {
      const view = render(
        <WeekView weekStart={startOfWeek(date!)} active={active} today="2026-01-01" lens={lens} />,
      )
      const section = sectionFor(view.container, date!, lens)
      expect(section, `${lens} section for ${date}`).toBeTruthy()
      expect(renderedIds(section!, expected)).toEqual(expected.map((fixture) => fixture.id))
      view.unmount()
    }
  })
})
