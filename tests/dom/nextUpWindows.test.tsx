import { afterEach, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { NextUpStrip } from '../../src/components/NextUpStrip'
import { META, FIXTURES } from '../../src/lib/fixtures'
import { COMPETITION_KEYS } from '../../src/lib/competitions'
import { addDays, brooklynDate } from '../../src/lib/time'
import { primeClock } from './rig'

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
  expect(view.container.textContent).toContain(`No upcoming fixtures through ${META.window.to}, the end of this snapshot.`)
  view.rerender(<NextUpStrip today={addDays(META.window.to, 1)} active={new Set()} />)
  expect(view.container.textContent).toContain(`through ${META.window.to}`)
})

