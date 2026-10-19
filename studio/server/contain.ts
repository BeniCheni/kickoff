import { existsSync, realpathSync } from 'node:fs'
import path from 'node:path'

/** The real path of a file that stays inside root. A symlink that leaves is refused. */
export function containedPath(root: string, candidate: string): string | null {
  if (!existsSync(candidate)) return null
  try {
    const base = realpathSync(root)
    const full = realpathSync(candidate)
    const relative = path.relative(base, full)
    if (relative.startsWith('..') || path.isAbsolute(relative)) return null
    return full
  } catch {
    return null
  }
}
