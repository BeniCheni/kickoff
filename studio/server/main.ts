import { redact } from '../log/redact.ts'
import { startAdmin } from './http.ts'

const live = process.argv.includes('--live')

startAdmin({ env: process.env, live }).then((admin) => {
  process.stdout.write(`${admin.url}\n`)
  const injected = admin.storageFetch === 'injected' ? ' fetch=injected' : ''
  process.stdout.write(`transport=${admin.transport} fal=${admin.fal} database=${admin.databaseEngine} storage=${admin.storage}${injected}\n`)
}).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'studio failed'
  process.stderr.write(`${redact(message)}\n`)
  process.exitCode = 1
})
