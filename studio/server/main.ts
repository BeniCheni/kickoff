import { redact } from '../log/redact.ts'
import { startAdmin } from './http.ts'

const live = process.argv.includes('--live')

startAdmin({ env: process.env, live }).then((admin) => {
  process.stdout.write(`${admin.url}\n`)
  process.stdout.write(`transport=${admin.transport} database=${admin.databaseEngine} storage=${admin.storage}\n`)
}).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'studio failed'
  process.stderr.write(`${redact(message)}\n`)
  process.exitCode = 1
})
