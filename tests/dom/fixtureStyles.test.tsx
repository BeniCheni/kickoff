/// <reference types="node" />

import { afterAll, beforeAll, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { NextUpStrip } from '../../src/components/NextUpStrip'
import { FixturesPage } from '../../src/components/FixturesPage'
import { COMPETITION_KEYS } from '../../src/lib/competitions'
import { META, FIXTURES } from '../../src/lib/fixtures'
import { brooklynDate } from '../../src/lib/time'
import { primeClock } from './rig'
import { FixtureRow } from '../../src/components/FixtureRow'
import { readFileSync } from 'node:fs'
import { edgeFixture } from '../fixtures/edgeFixtures'

const style = document.createElement('style')
beforeAll(() => {
  // jsdom cannot resolve a variable inside the font shorthand. Give the source
  // tokens distinct literal values and let the stylesheet cascade on the real markup.
  style.textContent = readFileSync('src/shell.css', 'utf8')
    .replaceAll('var(--font-mono)', 'FixtureMono')
    .replaceAll('var(--fb-pulp-muted)', 'rgb(1, 2, 3)')
  document.head.append(style)
})
afterAll(() => style.remove())

it.each([
  ['poster', '.fixture-names', '17px', '1.25'],
  ['poster', '.fixture-clock', '16px', '1.25'],
  ['poster', '.stadium-clock', '11px', '1.4'],
  ['ledger', '.fixture-clock', '11.5px', '1.25'],
] as const)('%s %s uses the handoff scale', (lens, selector, size, leading) => {
  const { container } = render(<FixtureRow lens={lens} fixture={edgeFixture()} />)
  const css = getComputedStyle(container.querySelector(selector)!)
  expect([css.fontSize, css.lineHeight]).toEqual([size, leading])
})

it.each([
  ['poster', '.fixture-clock', '500'],
  ['ledger', '.fixture-clock', '600'],
  ['poster', '.fixture-score', '600'],
  ['ledger', '.fixture-score', '600'],
] as const)('%s %s asks for its shipped mono face', (lens, selector, weight) => {
  const fixture = edgeFixture({ status: 'full_time', result: { home: 2, away: 1 } })
  const { container } = render(<FixtureRow lens={lens} fixture={fixture} />)
  const css = getComputedStyle(container.querySelector(selector)!)
  expect([css.fontFamily, css.fontWeight]).toEqual(['FixtureMono', weight])
})

it('NEXT UP clock asks for the semibold mono face', () => {
  const next = FIXTURES.find(f => f.status === 'scheduled' && f.timeConfidence === 'exact')!
  const release = primeClock(new Date(Date.parse(next.kickoffUtc) - 60_000))
  try {
    const { container } = render(<NextUpStrip today={brooklynDate(next.kickoffUtc)} active={new Set(COMPETITION_KEYS)} />)
    const css = getComputedStyle(container.querySelector('.next-card .fixture-clock')!)
    expect([css.fontFamily, css.fontWeight]).toEqual(['FixtureMono', '600'])
  } finally { release() }
})

it.each([
  ['Previous', META.window.from, '.week-prev'],
  ['Next', META.window.to, '.week-next'],
  ['Show all', META.window.from, '.filter-heading button'],
] as const)('%s uses muted ink when unavailable', (_label, day, selector) => {
  const { container } = render(<FixturesPage today={day} lens="ledger" />)
  const control = container.querySelector(selector)!
  expect(control.getAttribute('aria-disabled')).toBe('true')
  expect(getComputedStyle(control).color).toBe('rgb(1, 2, 3)')
})
