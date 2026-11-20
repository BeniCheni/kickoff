export type Motion = 'on' | 'off'

/** Anything other than the two stored values reads as "no stored choice". */
export function parseMotion(raw: string | null): Motion | null {
  return raw === 'on' || raw === 'off' ? raw : null
}

export function motionStorageKey(): 'kickoff-motion' {
  return 'kickoff-motion'
}

/** A stored choice wins. Absent, reduced motion means off. */
export function resolveMotion(stored: Motion | null, prefersReduced: boolean): Motion {
  return stored ?? (prefersReduced ? 'off' : 'on')
}

type MotionKey = ReturnType<typeof motionStorageKey>

type MotionEnvironment = {
  localStorage?: { getItem(k: string): string | null; setItem(k: string, v: string): void }
  matchMedia?: (query: string) => { matches: boolean }
}
const env = globalThis as MotionEnvironment

/** A read can throw. A missing store is "no stored choice", never a blank page. */
export function readStoredMotion(key: MotionKey): Motion | null {
  try {
    return parseMotion(env.localStorage?.getItem(key) ?? null)
  } catch {
    return null
  }
}

/** A write can throw. The in-page state has already been applied by the caller. */
export function writeStoredMotion(key: MotionKey, motion: Motion): void {
  try {
    env.localStorage?.setItem(key, motion)
  } catch {
    // a private window may keep nothing
  }
}

export function resolveMotionFromEnvironment(): Motion {
  return resolveMotion(
    readStoredMotion(motionStorageKey()),
    env.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  )
}

/** The pre-paint script and the shell read this. It does not touch the document. */
export function readBootMotion(): Motion {
  return resolveMotionFromEnvironment()
}
