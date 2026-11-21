import { expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { FixtureRow } from '../../src/components/FixtureRow'
import { unsettledStatus } from '../../src/lib/schema'
import { nextKickoffId, kickoffBounds } from '../../src/lib/lensSelectors'
import { edgeFixture, rowStates, specimenRowProps } from '../fixtures/edgeFixtures'

for (const lens of ['poster', 'ledger'] as const) {
  it.each(rowStates)(`${lens} renders %s with the recorded state and score`, (_name, fixture, label) => {
    const { container } = render(<FixtureRow {...specimenRowProps(fixture)} lens={lens} />)
    const text = container.textContent ?? ''
    expect(text).not.toMatch(/\b(?:EST|EDT|CET|CEST|GMT|UTC|BST|EET|EEST|PDT|PST)\b|[+-]\d\d:\d\d/)
    expect(container.querySelector('[aria-expanded], button')).toBeNull()
    if (fixture.note) expect(container.querySelector<HTMLElement>('.fixture-note')?.dataset.voice).toBe('muted')
    if (fixture.note) expect(text).toContain(fixture.note)
    if (fixture.id === 'prev-day' || fixture.id === 'next-day') {
      const expected = fixture.id === 'prev-day' ? '(Sun, prev. day)' : '(Sun, next day)'
      const clock = container.querySelector('.fixture-clock')!
      expect(clock.querySelector('small')?.textContent).toBe(expected)
      expect(lens === 'poster' ? clock.textContent.startsWith(expected) : clock.textContent.endsWith(expected)).toBe(true)
    }
    if (fixture.id === 'unset') {
      expect(text).not.toMatch(/\d:\d\d|local/)
      expect(container.querySelector<HTMLElement>('.fixture-clock')?.dataset.voice).toBe('ink')
      expect(container.querySelector<HTMLElement>('.fixture-unset')?.dataset.voice).toBe('amber')
    }
    const status = container.querySelector<HTMLElement>('.fixture-status')
    const score = container.querySelector<HTMLElement>('.fixture-score')
    const word = label === 'NEXT' && lens === 'ledger' ? '' : label
    expect(status?.textContent ?? '').toBe(word)
    if (unsettledStatus(fixture.status)) {
      expect(status?.dataset.voice).toBe('alarm')
      expect(container.textContent).not.toMatch(/\d:\d\d|local|prev\. day|next day|—/)
    }
    if (label === 'KICKED OFF') {
      expect(status?.dataset.voice).toBe('amber')
      expect(container.querySelector('.fixture-clock')?.textContent).toBe('3:00 PM')
      expect(container.querySelector('.stadium-clock')?.textContent).toBe('21:00 local')
      expect(score?.textContent ?? '').toBe(fixture.id === 'stale' ? '1–0' : '')
      if (score) expect(score.dataset.voice).toBe('amber')
    }
    if (label === 'LIVE') expect(score?.dataset.voice).toBe('ink')
    if (['FT', 'AET', 'PENS'].includes(label)) expect(score?.dataset.voice).toBe('pitch')
  })
}


it('selects the first credible time for NEXT and the day’s first kickoff', () => {
  const stored = '2026-11-01T15:00:00Z'
  const ineligible = (['postponed', 'cancelled', 'suspended', 'abandoned'] as const).map(status =>
    edgeFixture({ id: status, status, kickoffUtc: stored }))
  ineligible.push(edgeFixture({ id: 'unset', timeConfidence: 'tbd', kickoffUtc: stored }))
  const later = edgeFixture({ id: 'later', kickoffUtc: '2026-11-01T20:00:00Z' })
  const day = [...ineligible, later]
  expect(nextKickoffId(day, '2026-11-01T12:00:00Z')).toBe(later.id)
  expect(kickoffBounds(day)).toEqual({ first: later, last: later })
})

it('a caller asking for NEXT cannot put it on a clockless Poster row', () => {
  const unset = edgeFixture({ timeConfidence: 'tbd' })
  const view = render(<FixtureRow lens="poster" fixture={unset} next />)
  expect(view.container.textContent).not.toContain('NEXT')
  view.rerender(<FixtureRow lens="poster" fixture={edgeFixture({ status: 'postponed' })} next />)
  expect(view.container.textContent).toContain('POSTPONED')
  expect(view.container.textContent).not.toContain('NEXT')
})

it.each(['poster', 'ledger'] as const)('%s keeps each metadata separator with its preceding unit', lens => {
  const fixture = edgeFixture()
  const view = render(<FixtureRow lens={lens} fixture={fixture} />)
  const units = () => [...view.container.querySelectorAll('.fixture-meta > span')]
    .map(el => el.textContent).filter(Boolean)
  expect(units()).toEqual(['La Liga · ', 'Ramón Sánchez-Pizjuán · ', '21:00 local'])
  expect(units().join('')).toBe('La Liga · Ramón Sánchez-Pizjuán · 21:00 local')
  view.rerender(<FixtureRow lens={lens} fixture={{ ...fixture, venue: undefined }} />)
  expect(units()).toEqual(['La Liga · ', '21:00 local'])
  view.rerender(<FixtureRow lens={lens} fixture={{ ...fixture, timeConfidence: 'tbd' }} />)
  expect(units()).toEqual(['La Liga · ', 'Ramón Sánchez-Pizjuán'])
  view.rerender(<FixtureRow lens={lens} fixture={{ ...fixture, venue: undefined, timeConfidence: 'tbd' }} />)
  expect(units()).toEqual(['La Liga'])
})
