import { expect, it } from 'vitest'
import { QUIET_PUBLISH_AFTER_HOURS, shouldPublish, snapshotAgeHours } from '../scripts/publish-gate'

it('publishes a real change even when the snapshot is fresh', () => {
  expect(shouldPublish(true, 1)).toBe(true)
  expect(shouldPublish(true, 0)).toBe(true)
})

it('skips a quiet check inside the 20-hour window', () => {
  expect(shouldPublish(false, 0)).toBe(false)
  expect(shouldPublish(false, QUIET_PUBLISH_AFTER_HOURS - 0.01)).toBe(false)
})

it('publishes a quiet check once the snapshot is 20 hours old', () => {
  expect(shouldPublish(false, QUIET_PUBLISH_AFTER_HOURS)).toBe(true)
  expect(shouldPublish(false, 48)).toBe(true)
})

it('publishes when the snapshot age cannot be read', () => {
  expect(shouldPublish(false, Number.NaN)).toBe(true)
  expect(shouldPublish(false, Number.POSITIVE_INFINITY)).toBe(true)
  expect(Number.isFinite(snapshotAgeHours(''))).toBe(false)
})
