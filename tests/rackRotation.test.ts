import { expect, it } from 'vitest'
import { CROSS, FIRST_HOLD, HOLD, crossingFrame, passFrame, rackClock } from '../src/lib/rackRotation'

it('visits each neighbour once, including the Register, then follows the current resting book', () => {
  expect(passFrame(8999, 4, 2, 2).wait).toBe(1)
  for (let step = 0; step < 4; step++) {
    const t = FIRST_HOLD + step * (HOLD + CROSS)
    expect(passFrame(t, 4, 2, 0).crossing?.to).toBe([3, 0, 1, 0][step])
  }
  expect(passFrame(FIRST_HOLD + 3 * (HOLD + CROSS) + CROSS, 4, 2, 0)).toMatchObject({ done: true, index: 0 })
  expect(passFrame(0, 1, 0, 0).done).toBe(true)
})

it('changes the marker at 1450, the single text block at zero opacity, and settles at 1670', () => {
  for (const [ms, marker, text, opacity] of [[1449,0,0,1], [1450,1,0,1], [1505,1,0,.5], [1560,1,1,0], [1615,1,1,.5], [1670,1,1,1]]) {
    expect(crossingFrame(0, 1, ms!)).toMatchObject({ marker, text, opacity })
  }
})

it('resumes at the same active millisecond after a suspension', () => {
  let now = 20
  const clock = rackClock(() => now)
  clock.start()
  now += 9500
  clock.suspend()
  now += 400000
  clock.start()
  now += 15
  expect(clock.read()).toBe(9515)
})
