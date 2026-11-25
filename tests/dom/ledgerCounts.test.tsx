import { describe, expect, it } from 'vitest'
import { fireEvent, render, within } from '@testing-library/react'
import { COMPETITIONS, COMPETITION_KEYS, type CompetitionKey } from '../../src/lib/competitions'
import { FIXTURES } from '../../src/lib/fixtures'
import { addDays, brooklynDate, startOfWeek, weekdayShort } from '../../src/lib/time'
import { LedgerWeek } from '../../src/components/LedgerWeek'
import { PosterWeek } from '../../src/components/PosterWeek'
import { WeekView } from '../../src/components/WeekView'

const byWeek = new Map<string, number>()
for (const f of FIXTURES) {
  const monday = startOfWeek(brooklynDate(f.kickoffUtc))
  byWeek.set(monday, (byWeek.get(monday) ?? 0) + 1)
}
const week = [...byWeek.keys()].sort().find(monday => byWeek.get(monday)! >= 40)!

describe.each(['poster', 'ledger'] as const)('%s snapshot accounts', lens => {
  it.each([
    ['all', COMPETITION_KEYS],
    ['three', ['pl', 'ucl', 'laliga']],
    ['no supercups', COMPETITION_KEYS.filter(k => COMPETITIONS[k].group !== 'supercup')],
    ['none', []],
  ] as [string, CompetitionKey[]][])('accounts for every fixture with %s shown', (_name, keys) => {
    const active = new Set(keys)
    const { container } = render(<WeekView weekStart={week} today={week} lens={lens} active={active} />)
    for (const line of container.querySelectorAll('.book-date, .ledger-date, .matchday-line, .week-hidden, .week-count, .week-gap')) {
      expect(line.textContent).not.toMatch(/\b(?:EDT|EST|CET|CEST|GMT|UTC|BST|EET|EEST)\b|[+-]\d\d:\d\d/)
    }
    const breakdown = []
    let count = 0
    for (let offset = 0; offset < 7; offset++) {
      const date = addDays(week, offset)
      const day = FIXTURES.filter(f => brooklynDate(f.kickoffUtc) === date)
      const expected = day.filter(f => active.has(f.competition)).map(f => f.id)
      const short = `${weekdayShort(date)} ${Number(date.slice(8))}`
      if (day.length === 0) {
        // A genuinely empty date may share its printed gap with its neighbours.
        const gap = [...container.firstElementChild!.children].find(el =>
          el.textContent?.toLowerCase().includes(short.toLowerCase()) && /no fixtures/i.test(el.textContent))
        expect(gap).toBeDefined()
        expect(gap!.textContent).not.toMatch(/hidden by filters/i)
        expect(gap!.querySelectorAll('[data-fixture-id]')).toHaveLength(0)
        continue
      }
      const section = container.querySelector<HTMLElement>(`section[data-week-date="${date}"]`)!
      const more = within(section).queryByRole('button', { name: /More stories/ })
      if (more) fireEvent.click(more)
      const ids = [...section.querySelectorAll<HTMLElement>('[data-fixture-id]')].map(row => row.dataset.fixtureId)
      expect(ids.sort()).toEqual(expected.sort())
      expect(within(section).getByText(new RegExp(`\\b${expected.length} match(?:es)?\\b`, 'i'))).toBeTruthy()
      const hidden = day.length - ids.length
      expect(section.querySelector('.week-hidden')?.textContent ?? '').toBe(hidden ? `${hidden} hidden by filters` : '')
      if (lens === 'ledger') expect(ids.length + Number(section.dataset.hidden)).toBe(day.length)
      if (expected.length) breakdown.push(`${weekdayShort(date).toUpperCase()} ${expected.length}`)
      count += expected.length
    }
    if (lens === 'ledger') expect(container.querySelector('.week-count')!.textContent).toBe(
      [`END OF WEEK · ${count} ${count === 1 ? 'FIXTURE' : 'FIXTURES'}`, ...breakdown].join(' · '),
    )
  })
})

it('shows the hidden count below both sizes of Poster date line', () => {
  const fixtures = FIXTURES.slice(0, 3)
  const days = [
    { date: week, shown: fixtures, total: 5, isToday: false },
    { date: addDays(week, 1), shown: fixtures.slice(0, 1), total: 4, isToday: false },
  ]
  const { container } = render(<PosterWeek days={days} />)
  expect([...container.querySelectorAll('.week-hidden')].map(el => el.textContent)).toEqual(['2 hidden by filters', '3 hidden by filters'])
})

// Read the printed counts alongside the actual rows. Adjacent empty dates share one
// line, including at either end of a week, but can never borrow a neighbour's fixtures.
for (const lens of ['ledger', 'poster'] as const) {
  it.each(['mixed', 'hidden', 'empty'] as const)(`${lens} prints the daily accounts for a %s week`, selection => {
    const days = [0, 0, 3, 2, 1, 0, 0].map((total, i) => ({
      date: addDays(week, i), isToday: false, total: selection === 'empty' ? 0 : total,
      shown: selection === 'mixed' && i !== 3 ? FIXTURES.slice(0, total) : [],
    }))
    const { container } = render(lens === 'ledger'
      ? <LedgerWeek days={days} /> : <PosterWeek days={days} />)
    const wrapper = container.firstElementChild!
    const lines = [...wrapper.children].filter(el => !el.matches('.week-count'))
    const short = (date: string) => `${weekdayShort(date)} ${Number(date.slice(8))}`
    let line = 0
    for (let i = 0; i < days.length;) {
      const day = days[i]!
      const el = lines[line++]!
      if (!day.total) {
        const dates = []
        while (i < days.length && !days[i]!.total) dates.push(short(days[i++]!.date))
        expect(el.textContent?.toLowerCase()).toBe(`${dates.join(' · ')} — no fixtures`.toLowerCase())
        continue
      }
      expect(el.tagName).toBe('SECTION')
      const heading = el.firstElementChild!.textContent!
      expect(heading.toLowerCase()).toContain(short(day.date).toLowerCase())
      const listed = Number(heading.match(/(\d+) match(?:es)?/i)?.[1])
      const hiddenText = el.querySelector('.week-hidden')?.textContent ?? '0 hidden by filters'
      expect(hiddenText).toBe(`${day.total - day.shown.length} hidden by filters`)
      expect(listed).toBe(el.querySelectorAll('[data-fixture-id]').length)
      expect(listed + parseInt(hiddenText)).toBe(day.total)
      if (!listed) expect(heading).not.toMatch(/first|[ap]m/i)
      i++
    }
    expect(line).toBe(lines.length)
  })
}
