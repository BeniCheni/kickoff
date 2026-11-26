import { useEffect, useRef, useState, type RefObject } from 'react'
import { passFrame, rackClock } from './rackRotation'
import type { Motion } from './motion'

/** One finite pass per start. A visibility change freezes both the hold and the crossing. */
export function useRackRotation(root: RefObject<HTMLDivElement | null>, count: number, rest: number, motion: Motion, locked: boolean) {
  const [held, setHeld] = useState<number | null>(null)
  const [generation, setGeneration] = useState(0)
  const [frame, setFrame] = useState<ReturnType<typeof passFrame> | null>(null)
  const latestRest = useRef(rest)
  useEffect(() => { latestRest.current = rest }, [rest])
  useEffect(() => {
    setHeld(null)
    setFrame(null)
  }, [motion])
  useEffect(() => {
    if (locked) { setHeld(current => current ?? latestRest.current); return }
    if (held !== null || motion === 'off' || count < 2) return
    const start = latestRest.current
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
      const next = passFrame(clock.read(), count, start, latestRest.current)
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
  const index = held ?? (auto ? frame?.index : null) ?? rest
  function restart() { setFrame(null); setHeld(null); setGeneration(n => n + 1) }
  return { auto, index, crossing: auto ? frame?.crossing : undefined, held,
    pause: () => { if (auto) setHeld(index) }, select: setHeld, restart }
}
