import { parseDemoSocial, type DemoSocial } from '@kickoff/demo'
import { tabIsMoments } from '../catalog/request'

export type DemoEnv = {
  demo: string | undefined
  demoFile: string | undefined
  vercelEnv: string | undefined
}

export class DemoReadError extends Error {
  readonly preview: boolean
  constructor(message: string, preview: boolean) {
    super(message)
    this.name = 'DemoReadError'
    this.preview = preview
  }
}

/**
 * Sample social data, or null when the flag is off.
 * There is no baked-in path. Production refuses the flag before any read.
 * A bad document throws. It does not return a partial audience.
 */
export function readDemo(env: DemoEnv, readFile: (file: string) => string): DemoSocial | null {
  if (env.demo !== 'on') return null
  if (env.vercelEnv === 'production') throw new DemoReadError('demo social refused', false)
  if (!env.demoFile) throw new DemoReadError('demo social file is not set', true)
  let text: string
  try {
    text = readFile(env.demoFile)
  } catch {
    throw new DemoReadError('demo social file could not be read', true)
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new DemoReadError('demo social file is not JSON', true)
  }
  try {
    return parseDemoSocial(parsed)
  } catch {
    throw new DemoReadError('demo social failed validation', true)
  }
}

/** Fixtures and Table never ask for the file. */
export function readDemoFor(search: string, env: DemoEnv, readFile: (file: string) => string): DemoSocial | null {
  if (!tabIsMoments(search)) return null
  return readDemo(env, readFile)
}
