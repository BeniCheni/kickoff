import { expect, test } from 'vitest'
import { assertMomentsScope } from '../scripts/moments-css.mjs'

test('all selector-list members and the first rule inside at-rules must be scoped', () => {
  for (const css of [
    '.moments-gallery h1,\n.x h2 {}',
    '@media (min-width: 888px) { .x {} .moments-gallery h1 {} }',
    '@supports (display: grid) { @media (min-width: 888px) { .x {} } }',
    '.moments-gallery-other h1 {}',
    '.moments-gallery + .x {}',
  ]) expect(() => assertMomentsScope(css)).toThrow(/scoped|escapes/)
})

test('scoped lens rules and commas inside functional selectors pass', () => {
  expect(() => assertMomentsScope('@media (min-width: 888px) { .moments-gallery :is(h1,h2), [data-lens="poster"] .moments-gallery h1 {} }')).not.toThrow()
})
