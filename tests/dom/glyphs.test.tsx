import { render } from '@testing-library/react'
import { expect, it } from 'vitest'
import { GLYPHS, Glyph, PlusFive } from '../../src/components/glyphs'

it('draws the six stroke glyphs and the badge, with no accessible name', () => {
  const { container } = render(
    <>
      {GLYPHS.map((name) => <Glyph key={name} name={name} />)}
      <PlusFive />
    </>,
  )
  const drawn = [...container.querySelectorAll('svg')]
  expect(drawn).toHaveLength(GLYPHS.length + 1)
  for (const svg of drawn) {
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(svg.querySelector('img, use')).toBeNull()
  }
  expect(container.textContent).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u)
})
