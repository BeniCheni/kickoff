import 'server-only'
import { readFileSync } from 'node:fs'
import { DemoReadError, readDemoFor, warnDemoRead } from './read'

/** Server-only. A refused or invalid file becomes no social layer, not a partial one. */
export function loadDemo(search: string) {
  try {
    return readDemoFor(search, {
      demo: process.env.KICKOFF_DEMO,
      demoFile: process.env.KICKOFF_DEMO_FILE,
      vercelEnv: process.env.VERCEL_ENV,
    }, file => readFileSync(file, 'utf8'))
  } catch (error) {
    if (error instanceof DemoReadError) {
      warnDemoRead(error)
      return null
    }
    throw error
  }
}
