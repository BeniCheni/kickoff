import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { FormPips, formLabel } from '../../src/components/FormPips'

/**
 * The form strip. Its letters are the result and its fill is the skin, so the rule a reader
 * leans on is the letter: W, D or L in the order the snapshot holds them, and a dot where it
 * holds no result. The paint is asserted against the stylesheet in tests/tableSkin.test.ts.
 */
describe('form pips', () => {
  it('draws five slots oldest to newest, a letter per result and a dot per empty slot', () => {
    const { container } = render(<FormPips form={['W', 'L', 'D']} />)
    const pips = [...container.querySelectorAll('.form-pip')]
    expect(pips.map((pip) => pip.textContent)).toEqual(['W', 'L', 'D', '·', '·'])
    expect(pips.map((pip) => pip.getAttribute('data-result'))).toEqual(['W', 'L', 'D', 'none', 'none'])
  })

  it('never draws more or fewer than five, and invents no result for a club with none', () => {
    const { container, rerender } = render(<FormPips form={[]} />)
    expect([...container.querySelectorAll('.form-pip')].map((pip) => pip.textContent)).toEqual(['·', '·', '·', '·', '·'])
    rerender(<FormPips form={['W', 'W', 'D', 'L', 'W']} />)
    expect([...container.querySelectorAll('.form-pip')].map((pip) => pip.textContent)).toEqual(['W', 'W', 'D', 'L', 'W'])
  })

  it('gives each strip one text alternative and hides the letters it replaces', () => {
    const { container } = render(<FormPips form={['W', 'L', 'D', 'W']} />)
    const strip = container.querySelector('.form-pips')!
    expect(strip.getAttribute('role')).toBe('img')
    expect(strip.getAttribute('aria-label')).toBe('Form, oldest to newest: won, lost, drew, won. 1 empty slot.')
    for (const pip of strip.querySelectorAll('.form-pip')) expect(pip.getAttribute('aria-hidden')).toBe('true')
  })

  it('words the alternative from the results alone', () => {
    expect(formLabel([])).toBe('Form: no finished results in the snapshot.')
    expect(formLabel(['D'])).toBe('Form, oldest to newest: drew. 4 empty slots.')
    expect(formLabel(['W', 'W', 'D', 'L', 'W'])).toBe('Form, oldest to newest: won, won, drew, lost, won.')
  })
})
