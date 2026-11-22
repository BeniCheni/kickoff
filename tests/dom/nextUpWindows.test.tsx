import { afterEach, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { NextUpStrip } from '../../src/components/NextUpStrip'
import { META, FIXTURES } from '../../src/lib/fixtures'
import { COMPETITION_KEYS } from '../../src/lib/competitions'
import { addDays, brooklynDate, niceDate } from '../../src/lib/time'
import { primeClock } from './rig'
import * as fixtures from '../../src/lib/fixtures'
import { edgeFixture } from '../fixtures/edgeFixtures'

let release: (() => void) | undefined
afterEach(() => release?.())

it('distinguishes filtered kickoffs from the end of the snapshot', () => {
  const next = FIXTURES.find(f => f.status === 'scheduled' && f.timeConfidence === 'exact')!
  release = primeClock(new Date(Date.parse(next.kickoffUtc) - 60_000))
  const view = render(<NextUpStrip today={brooklynDate(next.kickoffUtc)} active={new Set(COMPETITION_KEYS)} />)
  expect(view.container.querySelectorAll('[data-next-id]').length).toBeGreaterThan(0)
  expect(view.container.textContent).not.toMatch(/\b(?:EDT|EST|CET|CEST|GMT|UTC|BST|EET|EEST)\b|[+-]\d\d:\d\d/)
  view.rerender(<NextUpStrip today={brooklynDate(next.kickoffUtc)} active={new Set()} />)
  expect(view.container.textContent).toContain('Your filters hide every upcoming fixture.')
  view.rerender(<NextUpStrip today={addDays(META.window.to, 1)} active={new Set(COMPETITION_KEYS)} />)
  expect(view.container.textContent).toContain(`No upcoming fixtures through ${niceDate(META.window.to)}, the end of this snapshot.`)
  view.rerender(<NextUpStrip today={addDays(META.window.to, 1)} active={new Set()} />)
  expect(view.container.textContent).toContain(`through ${niceDate(META.window.to)}`)
})


it('the fifth upcoming fixture contributes to more today only on its Brooklyn date', () => {
  const today = '2026-11-22'
  release = primeClock(new Date('2026-11-22T12:00:00Z'))
  const four = Array.from({ length: 4 }, (_, i) => edgeFixture({ id: String(i) }))
  const fifth = edgeFixture({ id: 'fifth' })
  const tomorrow = edgeFixture({ id: 'sixth', kickoffUtc: '2026-11-23T20:00:00Z' })
  const selected = vi.spyOn(fixtures, 'upcoming').mockReturnValue([...four, tomorrow])
  try {
    const view = render(<NextUpStrip today={today} active={new Set(COMPETITION_KEYS)} />)
    expect(view.container.querySelectorAll('[data-next-id]')).toHaveLength(4)
    expect(view.container.querySelector('.next-more')).toBeNull()
    selected.mockReturnValue([...four, fifth, tomorrow])
    view.rerender(<NextUpStrip today={today} active={new Set(COMPETITION_KEYS)} />)
    expect(view.container.querySelector('.next-more')?.textContent).toContain('+1 more today')
  } finally {
    selected.mockRestore()
  }
})
