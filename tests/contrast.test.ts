import { describe, expect, it } from 'vitest'
import { contrastCases, ratio, rgb } from './contrast'

describe('measured semantic color contrast against rendered grounds', () => {
  it.each(contrastCases)('$theme $role on $ground', ({ ratio, minimum }) => {
    expect(ratio).toBeGreaterThanOrEqual(minimum)
  })
  it('independently reproduces the rejected accent-on-alt gap and unsafe floodlight repaint', () => {
    expect(ratio(rgb('#bd4720'), rgb('#efead9'))).toBeLessThan(4.5)
    expect(ratio(rgb('#16211b'), rgb('#8a5f00'))).toBeLessThan(4.5)
  })
})
