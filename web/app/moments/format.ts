import { brooklynDate } from '../../../src/lib/time'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Brooklyn calendar date of one instant, as D9 prints a generated date: `3 Oct 2026`. */
export function generatedDate(instant: string): string {
  const [year, month, day] = brooklynDate(instant).split('-')
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`
}

/** `m:ss` from the stored numeric text. Null stays omitted. */
export function durationClock(stored: string | null): string | null {
  if (stored === null) return null
  const seconds = Number(stored)
  if (!Number.isFinite(seconds) || seconds < 0) return null
  const total = Math.round(seconds)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}
