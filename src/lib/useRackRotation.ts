import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { FIRST_HOLD, HOLD, passFrame, rackPass } from './rackRotation'
import type { Motion } from './motion'

/** Global motion starts a new pass. Reader and visibility pauses suspend the same clock. */
export function useRackRotation(root: RefObject<HTMLDivElement | null>, count: number, rest: number, motion: Motion, paused: boolean) {
  const pass = useMemo(() => rackPass(count, () => performance.now()), [count, motion])
  const [sample, setSample] = useState<{ pass: typeof pass; frame: ReturnType<typeof passFrame> } | null>(null)
  const [chosen, setChosen] = useState<{ pass: typeof pass; rest: number; index: number; settled: boolean } | null>(null)
  const [running, setRunning] = useState(false)
  const latestRest = useRef(rest)
  useEffect(() => { latestRest.current = rest }, [rest])

  useEffect(() => {
    if (motion === 'off' || count < 2 || paused) return
    let timer = 0
    let raf = 0
    let visible = typeof IntersectionObserver === 'undefined'
    function stop() {
      window.clearTimeout(timer)
      window.cancelAnimationFrame(raf)
      pass.suspend()
    }
    function tick() {
      const frame = pass.frame(latestRest.current)
      setSample({ pass, frame })
      if (frame.done) { pass.suspend(); return }
      if (frame.wait > 0) timer = window.setTimeout(tick, frame.wait)
      else raf = window.requestAnimationFrame(tick)
    }
    function sync() {
      stop()
      const active = visible && !document.hidden
      setRunning(active)
      if (active) { pass.start(); tick() }
    }
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      visible = entries[entries.length - 1]!.isIntersecting
      sync()
    })
    if (root.current) observer?.observe(root.current)
    document.addEventListener('visibilitychange', sync)
    sync()
    return () => { stop(); observer?.disconnect(); document.removeEventListener('visibilitychange', sync) }
  }, [root, pass, count, motion, paused])

  const frame = sample?.pass === pass ? sample.frame : null
  const manual = chosen?.pass === pass && (motion === 'on' || chosen.rest === rest) ? chosen.index : null
  const auto = motion === 'on' && !paused && !frame?.done && count > 1
  const index = manual !== null && (chosen?.settled || frame?.initial) ? manual
    : frame && !frame.initial && !frame.done ? frame.index : rest
  const duration = frame?.initial ? FIRST_HOLD : HOLD
  const hold = auto && frame && frame.wait > 0
    ? { duration, elapsed: duration - frame.wait, running } : null
  function select(index: number) {
    if (motion === 'on') setSample({ pass, frame: pass.select(index, rest) })
    setChosen({ pass, rest, index, settled: motion === 'off' || !!frame?.done })
  }
  return { index, auto, hold, reader: paused || (manual !== null && !auto), crossing: auto ? frame?.crossing : undefined, select }
}
