/// <reference types="node" />

import { afterAll, beforeAll, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { FixtureRow } from '../../src/components/FixtureRow'
import { readFileSync } from 'node:fs'
import { edgeFixture } from '../fixtures/edgeFixtures'

const style = document.createElement('style')
beforeAll(() => {
  style.textContent = readFileSync('src/shell.css', 'utf8')
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
