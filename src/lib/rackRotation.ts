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
    seek(elapsed: number) { accumulated = elapsed; if (since !== null) since = now() },
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

/** Keep the same hold deadline when a marker changes the displayed book. A selection
 * during a crossing settles the new book immediately and gives it the following hold. */
export function rackPass(count: number, now: () => number) {
  const clock = rackClock(now)
  let origin: number | null = null
  function frame(rest: number) {
    const elapsed = clock.read()
    if (elapsed >= FIRST_HOLD) origin ??= rest
    return passFrame(elapsed, count, origin ?? rest, rest)
  }
  return {
    start: clock.start, suspend: clock.suspend, frame,
    select(index: number, rest: number) {
      let current = frame(rest)
      if (current.done || current.index === index && !current.crossing) return current
      if (current.crossing) {
        clock.seek(clock.read() + CROSS * (1 - current.crossing.progress))
        current = frame(rest)
      }
      origin = ((origin ?? rest) + index - current.index + count) % count
      return frame(rest)
    },
  }
}

/** A wrapping stock leaves at the edge. It must never pass through the incoming stock. */
export function stockLane(from: number, to: number, progress: number, count: number) {
  if (count === 3 && from === -1 && to === 1) return null
  const start = from === 2 && to === -1 ? -2 : from
  let end = to
  if (from === -1 && to === 2) end = -2
  if (count === 2 && from === 0 && to === 1) end = -1
  return start + (end - start) * progress
}
