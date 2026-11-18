import { useEffect, useRef, useState } from 'react'
import {
  motionStorageKey,
  readStoredMotion,
  resolveMotionFromEnvironment,
  writeStoredMotion,
  type Motion,
} from './motion'

/**
 * Motion for the shell. The initializer reads the pre-paint attribute, so the
 * first frame matches the head script. A server render has no document; the
 * Next shell paints both names and the attribute selects one before paint.
 */
export function useMotionController() {
  const [motion, setMotion] = useState<Motion>(() => {
    if (typeof document === 'undefined') return 'on'
    const attr = document.documentElement.dataset.motion
    if (attr === 'on' || attr === 'off') return attr
    const next = resolveMotionFromEnvironment()
    document.documentElement.dataset.motion = next
    return next
  })
  // A press in this visit stays, even when storage throws or the system changes.
  const session = useRef<Motion | null>(null)

  useEffect(() => {
    const next = session.current ?? resolveMotionFromEnvironment()
    document.documentElement.dataset.motion = next
    setMotion(next)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const key = motionStorageKey()
    const onChange = () => {
      if (session.current || readStoredMotion(key)) return
      const next = resolveMotionFromEnvironment()
      document.documentElement.dataset.motion = next
      setMotion(next)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const toggle = () => {
    const next: Motion = motion === 'on' ? 'off' : 'on'
    document.documentElement.dataset.motion = next
    session.current = next
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Start under reduced motion is for this visit only.
    if (!(next === 'on' && reduced)) writeStoredMotion(motionStorageKey(), next)
    setMotion(next)
  }

  return { motion, toggle }
}
