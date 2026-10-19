import { expect, test } from 'vitest'
import { widthOnly } from '../scripts/n3-next-vite.mjs'

const box = (w: number, h = 10) => [{ tag: 'DIV', w, h }]

test('61.4 against 61.5 is within the one-tenth boundary', () => {
  expect(widthOnly(box(61.4), box(61.5))).toBe(true)
})

test('61.4 against 61.6 is outside the one-tenth boundary', () => {
  expect(widthOnly(box(61.4), box(61.6))).toBe(false)
})

test('an x or y shift of one tenth is the same boundary', () => {
  const left = [{ tag: 'A', x: 10.4, y: 20.4, w: 1, h: 1 }]
  expect(widthOnly(left, [{ tag: 'A', x: 10.5, y: 20.4, w: 1, h: 1 }])).toBe(true)
  expect(widthOnly(left, [{ tag: 'A', x: 10.4, y: 20.5, w: 1, h: 1 }])).toBe(true)
  expect(widthOnly(left, [{ tag: 'A', x: 10.6, y: 20.4, w: 1, h: 1 }])).toBe(false)
})

test('a height difference is not a width-only match', () => {
  expect(widthOnly(box(61.4, 10), box(61.5, 11))).toBe(false)
})
