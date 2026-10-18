import { expect, test } from 'vitest'
import { widthOnly } from '../scripts/n3-next-vite.mjs'

const box = (w: number, h = 10) => [{ tag: 'DIV', w, h }]

test('61.4 against 61.5 is within the one-tenth boundary', () => {
  expect(widthOnly(box(61.4), box(61.5))).toBe(true)
})

test('61.4 against 61.6 is outside the one-tenth boundary', () => {
  expect(widthOnly(box(61.4), box(61.6))).toBe(false)
})

test('a height difference is not a width-only match', () => {
  expect(widthOnly(box(61.4, 10), box(61.5, 11))).toBe(false)
})
