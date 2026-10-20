import { readFileSync } from 'node:fs'
import path from 'node:path'
import { META } from '../../../../src/lib/fixtures'
import pkg from '../../../../package.json'
import { snapshotDigest } from '../../../lib/snapshotDigest'

export function GET() {
  const sha = process.env.KICKOFF_SOURCE_SHA || process.env.VERCEL_GIT_COMMIT_SHA
  const body = {
    sourceSha: typeof sha === 'string' && sha.length > 0 ? sha : null,
    snapshotDigest: snapshotDigest([
      { name: 'fixtures.json', bytes: readFileSync(path.join(process.cwd(), '../src/data/fixtures.json')) },
      { name: 'meta.json', bytes: readFileSync(path.join(process.cwd(), '../src/data/meta.json')) },
      { name: 'standings.json', bytes: readFileSync(path.join(process.cwd(), '../src/data/standings.json')) },
    ]),
    lastSyncAt: META.lastSyncAt,
    version: pkg.version,
  }
  return Response.json(body, { headers: { 'Cache-Control': 'no-store' } })
}
