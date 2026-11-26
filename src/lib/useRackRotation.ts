import { useEffect, useRef, useState, type RefObject } from 'react'
import { FIRST_HOLD, passFrame, rackClock } from './rackRotation'
import type { Motion } from './motion'

/** One finite pass per start. A visibility change freezes both the hold and the crossing. */
export function useRackRotation(root: RefObject<HTMLDivElement | null>, count: number, rest: number, motion: Motion, locked: boolean) {
  const [held, setHeld] = useState<number | null>(null)
  const [generation, setGeneration] = useState(0)
  const [frame, setFrame] = useState<ReturnType<typeof passFrame> | null>(null)
  const latestRest = useRef(rest)
  useEffect(() => {
    if (latestRest.current !== rest && motion === 'off' && !locked) setHeld(null)
    latestRest.current = rest
  }, [rest, motion, locked])
  useEffect(() => {
    setHeld(null)
    setFrame(null)
  }, [motion])
  useEffect(() => {
    if (locked) { setHeld(current => current ?? latestRest.current); return }
    if (held !== null || motion === 'off' || count < 2) return
    let start: number | null = null
    const clock = rackClock(() => performance.now())
    let timer = 0
    let raf = 0
    let visible = typeof IntersectionObserver === 'undefined'
    let done = false
    function stop() {
      window.clearTimeout(timer)
      window.cancelAnimationFrame(raf)
      clock.suspend()
    }
    function sample() {
      const elapsed = clock.read()
      // Next's request clock catches up after hydration. Let the still follow the
      // live resting date until the first crossing actually leaves that book.
      if (elapsed >= FIRST_HOLD) start ??= latestRest.current
      const next = passFrame(elapsed, count, start ?? latestRest.current, latestRest.current)
      setFrame(next)
      done = next.done
      if (done) return
      if (next.wait > 0) timer = window.setTimeout(sample, next.wait)
      else raf = window.requestAnimationFrame(sample)
    }
    function sync() {
      stop()
      if (!done && visible && !document.hidden) { clock.start(); sample() }
    }
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      visible = entries[entries.length - 1]!.isIntersecting
      sync()
    })
    if (root.current) observer?.observe(root.current)
    document.addEventListener('visibilitychange', sync)
    sync()
    return () => { stop(); observer?.disconnect(); document.removeEventListener('visibilitychange', sync) }
  }, [root, count, motion, held, generation, locked])

  const auto = motion === 'on' && held === null && !frame?.done && count > 1
  const index = held ?? (auto && !frame?.initial ? frame?.index : null) ?? rest
  function restart() { setFrame(null); setHeld(null); setGeneration(n => n + 1) }
  return { auto, index, crossing: auto ? frame?.crossing : undefined, held,
    pause: () => { if (auto) setHeld(index) }, select: setHeld, restart }
}
