import { describe, expect, it } from 'vitest'
import { parseMotion, readStoredMotion, resolveMotion, motionStorageKey, writeStoredMotion } from '../src/lib/motion'

describe('motion preference', () => {
  it('a stored choice wins over either system setting', () => {
    for (const reduced of [false, true]) {
      expect(resolveMotion('on', reduced)).toBe('on')
      expect(resolveMotion('off', reduced)).toBe('off')
    }
  })
  it('follows reduced motion when nothing is stored', () => {
    expect(resolveMotion(null, true)).toBe('off')
    expect(resolveMotion(null, false)).toBe('on')
  })
  it('uses one storage key', () => {
    expect(motionStorageKey()).toBe('kickoff-motion')
  })
  it('parseMotion treats junk as no stored choice', () => {
    expect(parseMotion(null)).toBeNull()
    expect(parseMotion('')).toBeNull()
    expect(parseMotion('ON')).toBeNull()
    expect(parseMotion('light')).toBeNull()
    expect(parseMotion('on')).toBe('on')
    expect(parseMotion('off')).toBe('off')
  })
})

describe('storage guards', () => {
  it('reads as no stored choice when localStorage itself throws', () => {
    expect(readStoredMotion('kickoff-motion')).toBeNull()
  })
  it('writes silently give up when storage is unavailable', () => {
    expect(() => writeStoredMotion('kickoff-motion', 'off')).not.toThrow()
  })
})
