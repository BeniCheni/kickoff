import { readFileSync } from 'node:fs'
import { bytesResponse, openMapped } from '../../../lib/catalog/serve'

export const dynamic = 'force-dynamic'

function env() {
  return {
    catalog: process.env.KICKOFF_CATALOG,
    vercelEnv: process.env.VERCEL_ENV,
    stubFile: process.env.KICKOFF_STUB_CATALOG_FILE,
  }
}

export function GET(request: Request, context: { params: Promise<{ path: string[] }> }): Promise<Response> {
  return context.params.then(params => {
    const key = params.path.join('/')
    const opened = openMapped(env(), key, file => readFileSync(file, 'utf8'), file => readFileSync(file))
    if (!opened) return new Response(null, { status: 404 })
    return bytesResponse(opened.bytes, opened.type, request.headers.get('range'))
  })
}
