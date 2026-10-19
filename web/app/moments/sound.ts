const KEY = 'kickoff-moments-sound-v1'

/** Absent, or any word other than `on`, means muted. */
export function readSound(storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): boolean {
  try {
    return storage?.getItem(KEY) === 'on'
  } catch {
    return false
  }
}

/** Returns the visit's choice. A refused write does not add another key or a sentence. */
export function writeSound(on: boolean, storage: Pick<Storage, 'setItem'> | undefined = globalThis.localStorage): boolean {
  try {
    storage?.setItem(KEY, on ? 'on' : 'off')
  } catch {
    // The visit keeps `on`. Nothing else is stored.
  }
  return on
}
