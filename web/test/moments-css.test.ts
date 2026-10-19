import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { assertMomentsMotion, assertMomentsScope, VIEW_TRANSITION_SELECTORS } from '../scripts/moments-css.mjs'

test('all selector-list members and the first rule inside at-rules must be scoped', () => {
  for (const css of [
    '.moments-gallery h1,\n.x h2 {}',
    '@media (min-width: 888px) { .x {} .moments-gallery h1 {} }',
    '@supports (display: grid) { @media (min-width: 888px) { .x {} } }',
    '.moments-gallery-other h1 {}',
    '.moments-gallery + .x {}',
  ]) expect(() => assertMomentsScope(css)).toThrow(/scoped|escapes/)
})

test('an unknown keyframe or a non-composited property is rejected', () => {
  expect(() => assertMomentsMotion('@keyframes moments-card-enter { from { opacity: 0; } to { opacity: 1; } } @keyframes moments-reaction-burst { from { transform: scale(1); } to { transform: scale(1); } } @keyframes moments-reaction-particle { from { opacity: 1; } to { opacity: 0; } } @keyframes moments-countdown-ring { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 1; } } @keyframes moments-comment-in { from { transform: none; } to { transform: none; } } @keyframes moments-count-tick { from { opacity: 0; } to { opacity: 1; } } @keyframes moments-slide { from { left: 0; } to { left: 8px; } }')).toThrow(/allowlist|left/)
})

test('the Moments sheet matches the motion allowlist', () => {
  const css = readFileSync(fileURLToPath(new URL('../app/moments/gallery.css', import.meta.url)), 'utf8')
  expect(() => assertMomentsScope(css)).not.toThrow()
  expect(() => assertMomentsMotion(css)).not.toThrow()
})

test('view-transition selectors are exactly the 180 ms set', () => {
  const css = readFileSync(fileURLToPath(new URL('../app/moments/gallery.css', import.meta.url)), 'utf8')
  const used = [...css.matchAll(/::view-transition-[\w-]+\([^)]*\)/g)].map(match => match[0])
  expect(new Set(used)).toEqual(VIEW_TRANSITION_SELECTORS)
  expect(() => assertMomentsScope('::view-transition-old(other) {}')).toThrow(/scoped/)
})

test('a color transition is rejected', () => {
  const css = readFileSync(fileURLToPath(new URL('../app/moments/gallery.css', import.meta.url)), 'utf8')
  expect(() => assertMomentsMotion(`${css}\n.moments-gallery { transition: color 150ms; }`)).toThrow(/color|composited/)
})

test('scoped lens rules and commas inside functional selectors pass', () => {
  expect(() => assertMomentsScope('@media (min-width: 888px) { .moments-gallery :is(h1,h2), [data-lens="poster"] .moments-gallery h1 {} }')).not.toThrow()
})
