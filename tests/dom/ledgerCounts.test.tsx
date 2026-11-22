import { expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { COMPETITIONS, COMPETITION_KEYS, type CompetitionKey } from '../../src/lib/competitions'
import { FIXTURES } from '../../src/lib/fixtures'
import { addDays, brooklynDate, startOfWeek, weekdayShort } from '../../src/lib/time'
import { WeekView } from '../../src/components/WeekView'

const byWeek = new Map<string, number>()
for (const f of FIXTURES) {
  const monday = startOfWeek(brooklynDate(f.kickoffUtc))
  byWeek.set(monday, (byWeek.get(monday) ?? 0) + 1)
}
const week = [...byWeek.keys()].sort().find(monday => byWeek.get(monday)! >= 40)!

it.each([
  ['all', COMPETITION_KEYS],
  ['three', ['pl', 'ucl', 'laliga']],
  ['no supercups', COMPETITION_KEYS.filter(k => COMPETITIONS[k].group !== 'supercup')],
  ['none', []],
] as [string, CompetitionKey[]][])('accounts for every fixture with %s shown', (_name, keys) => {
  const active = new Set(keys)
  const { container } = render(<WeekView weekStart={week} today={week} lens="ledger" active={active} />)
  for (const line of container.querySelectorAll('.ledger-date, .matchday-line, .week-hidden, .week-count, .week-gap')) {
    expect(line.textContent).not.toMatch(/\b(?:EDT|EST|CET|CEST|GMT|UTC|BST|EET|EEST)\b|[+-]\d\d:\d\d/)
  }
  const breakdown = []
  let count = 0
  for (let offset = 0; offset < 7; offset++) {
    const date = addDays(week, offset)
    const day = FIXTURES.filter(f => brooklynDate(f.kickoffUtc) === date)
    const expected = day.filter(f => active.has(f.competition)).map(f => f.id)
    const el = container.querySelector<HTMLElement>(`[data-week-date="${date}"]`)!
    const ids = [...el.querySelectorAll<HTMLElement>('[data-fixture-id]')].map(row => row.dataset.fixtureId)
    expect(ids.sort()).toEqual(expected.sort())
    expect(ids.length + Number(el.dataset.hidden)).toBe(day.length)
    if (expected.length) breakdown.push(`${weekdayShort(date).toUpperCase()} ${expected.length}`)
    count += expected.length
  }
  expect(container.querySelector('.week-count')!.textContent).toBe(
    [`END OF WEEK · ${count} ${count === 1 ? 'FIXTURE' : 'FIXTURES'}`, ...breakdown].join(' · '),
  )
  if (!keys.length) {
    expect(container.querySelectorAll('.week-gap')).toHaveLength(1)
    expect(container.querySelector('.week-gap')!.textContent).toContain(`NO FIXTURES · ${byWeek.get(week)} hidden by filters`)
  }
})


it('shows the hidden count below both sizes of Poster date line', async () => {
  const { PosterWeek } = await import('../../src/components/PosterWeek')
  const { planPosterWeek } = await import('../../src/lib/lensSelectors')
  const fixtures = FIXTURES.slice(0, 3)
  const blocks = planPosterWeek([
    { date: week, shown: fixtures, total: 5, isToday: false },
    { date: addDays(week, 1), shown: fixtures.slice(0, 1), total: 4, isToday: false },
  ])
  const { container } = render(<PosterWeek blocks={blocks} />)
  expect([...container.querySelectorAll('.week-hidden')].map(el => el.textContent)).toEqual(['2 hidden by filters', '3 hidden by filters'])
})
