import type { Box, Point } from './types'

/**
 * Subpixel layout and 1px borders should not fail a flush fit. The D-06 overhang
 * this tool exists to catch is tens of pixels, so 1 CSS pixel of slack does not hide it.
 */
export const GEOMETRY_EPSILON = 1

export function boxArea(box: Box): number {
  return Math.max(0, box.right - box.left) * Math.max(0, box.bottom - box.top)
}

/** A's border box lies within B's, with a small edge tolerance. A zero-area box fails closed. */
export function boxInside(inner: Box, outer: Box, epsilon = 0): boolean {
  if (boxArea(inner) <= 0 || boxArea(outer) <= 0) return false
  return (
    inner.left >= outer.left - epsilon &&
    inner.top >= outer.top - epsilon &&
    inner.right <= outer.right + epsilon &&
    inner.bottom <= outer.bottom + epsilon
  )
}

/**
 * True when the overlap on both axes is greater than `epsilon`. Flush edges
 * (overlap 0) are disjoint: a column sitting against its neighbour is not a cover.
 */
export function boxesIntersect(a: Box, b: Box, epsilon = 0): boolean {
  if (boxArea(a) <= 0 || boxArea(b) <= 0) return false
  const overlapW = Math.min(a.right, b.right) - Math.max(a.left, b.left)
  const overlapH = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
  return overlapW > epsilon && overlapH > epsilon
}

/** A's box meets none of the B boxes. */
export function boxDisjoint(a: Box, others: readonly Box[], epsilon = 0): boolean {
  return others.every((other) => !boxesIntersect(a, other, epsilon))
}

/**
 * Centre plus two inset points, clamped to the part of the box that is actually
 * on screen. Returns null when the element has no visible area to hit.
 */
export function hitPoints(
  box: Box,
  viewport: { width: number; height: number },
  inset = 8,
): Point[] | null {
  const left = Math.max(box.left, 0)
  const top = Math.max(box.top, 0)
  const right = Math.min(box.right, viewport.width)
  const bottom = Math.min(box.bottom, viewport.height)
  const width = right - left
  const height = bottom - top
  if (width < 2 || height < 2) return null
  const pad = 0.5
  const clamp = (value: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, value))
  const dx = Math.min(inset, width / 4)
  const dy = Math.min(inset, height / 4)
  const cx = left + width / 2
  const cy = top + height / 2
  return [
    { x: clamp(cx, left + pad, right - pad), y: clamp(cy, top + pad, bottom - pad) },
    { x: clamp(left + dx, left + pad, right - pad), y: clamp(top + dy, top + pad, bottom - pad) },
    { x: clamp(right - dx, left + pad, right - pad), y: clamp(bottom - dy, top + pad, bottom - pad) },
  ]
}
