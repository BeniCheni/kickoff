const KEY = 'kickoff-moments-autoplay-v1'

export function readAutoplay(storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): boolean {
  try {
    const value = storage?.getItem(KEY)
    if (value === 'off') return false
    return true
  } catch {
    return true
  }
}

/** Returns the visit's choice. A refused write does not add another key or a sentence. */
export function writeAutoplay(on: boolean, storage: Pick<Storage, 'setItem'> | undefined = globalThis.localStorage): boolean {
  try {
    storage?.setItem(KEY, on ? 'on' : 'off')
  } catch {
    // The visit keeps `on`. Nothing else is stored.
  }
  return on
}
