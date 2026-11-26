/** Active milliseconds. The caller suspends this clock when the page or Rack is hidden. */
export const FIRST_HOLD = 9000
export const HOLD = 7000
export const CROSS = 1800
export const SWAP = 1450
const HALF_FADE = 110

export function rackClock(now: () => number) {
  let accumulated = 0
  let since: number | null = null
  const read = () => accumulated + (since === null ? 0 : now() - since)
  return {
    read,
    start() { since ??= now() },
    suspend() { accumulated = read(); since = null },
  }
}

export function crossingFrame(from: number, to: number, ms: number) {
  const outgoing = ms < SWAP + HALF_FADE
  const alpha = outgoing ? (SWAP + HALF_FADE - ms) / HALF_FADE : (ms - SWAP - HALF_FADE) / HALF_FADE
  return {
    from, to, progress: Math.min(1, ms / CROSS),
    marker: ms < SWAP ? from : to,
    text: outgoing ? from : to,
    opacity: Math.min(1, Math.max(0, alpha)),
  }
}

/** The first n−1 destinations follow the starting book. The last follows today's live rest. */
export function passFrame(ms: number, count: number, start: number, rest: number) {
  const step = Math.floor((ms - FIRST_HOLD) / (CROSS + HOLD))
  const within = (ms - FIRST_HOLD) % (CROSS + HOLD)
  if (count === 1 || step >= count || (step === count - 1 && within >= CROSS)) {
    return { index: rest, done: true, wait: 0 }
  }
  if (ms < FIRST_HOLD) return { index: start, initial: true, done: false, wait: FIRST_HOLD - ms }
  const from = (start + step) % count
  const to = step === count - 1 ? rest : (from + 1) % count
  if (within >= CROSS) return { index: to, done: false, wait: CROSS + HOLD - within }
  const crossing = crossingFrame(from, to, within)
  return { index: crossing.marker, done: false, wait: 0, crossing }
}
