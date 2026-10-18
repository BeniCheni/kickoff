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

/** Thousands separators without relying on the process locale. */
export function groupedCount(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Draft relative time for Beni. A future instant, or one under a minute, reads `just now`.
 * Months are 30 days and years are 365. Both are approximations.
 */
export function relativeTime(iso: string, nowMs: number): string {
  const then = Date.parse(iso)
  if (!Number.isFinite(then)) return 'just now'
  const seconds = Math.floor((nowMs - then) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return days === 1 ? '1 day ago' : `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return months === 1 ? '1 month ago' : `${months} months ago`
  const years = Math.floor(days / 365)
  return years === 1 ? '1 year ago' : `${years} years ago`
}

export function viewsLine(views: number, publishedAt: string, nowMs: number): string {
  return `${groupedCount(views)} views · ${relativeTime(publishedAt, nowMs)}`
}
