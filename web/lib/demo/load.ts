import 'server-only'
import { readFileSync } from 'node:fs'
import { DemoReadError, readDemoFor, warnDemoRead } from './read'
import { readDemoFromDatabase } from './database'

/** Server-only. A refused or invalid read becomes no social layer, not a partial one. */
export async function loadDemo(search: string) {
  try {
    return readDemoFor(search, {
      demo: process.env.KICKOFF_DEMO,
      demoFile: process.env.KICKOFF_DEMO_FILE,
      vercelEnv: process.env.VERCEL_ENV,
      catalog: process.env.KICKOFF_CATALOG,
    }, file => readFileSync(file, 'utf8'))
  } catch (error) {
    if (error instanceof DemoReadError && error.message === 'demo social read is hosted') {
      try {
        return await readDemoFromDatabase()
      } catch (hosted) {
        if (hosted instanceof DemoReadError) {
          warnDemoRead(hosted)
          return null
        }
        throw hosted
      }
    }
    if (error instanceof DemoReadError) {
      warnDemoRead(error)
      return null
    }
    throw error
  }
}
