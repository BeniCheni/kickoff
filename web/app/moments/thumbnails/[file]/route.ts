import { siteCopyPath } from '@kickoff/catalog'
import { readFileSync } from 'node:fs'
import { bytesResponse, openMapped } from '../../../../lib/catalog/serve'

export const dynamic = 'force-dynamic'

export function GET(request: Request, context: { params: Promise<{ file: string }> }): Promise<Response> {
  return context.params.then(params => {
    if (!params.file.endsWith('.jpg')) return new Response(null, { status: 404 })
    const id = params.file.slice(0, -'.jpg'.length)
    if (siteCopyPath(id) !== `/moments/thumbnails/${id}.jpg`) return new Response(null, { status: 404 })
    const opened = openMapped({
      catalog: process.env.KICKOFF_CATALOG,
      vercelEnv: process.env.VERCEL_ENV,
      stubFile: process.env.KICKOFF_STUB_CATALOG_FILE,
    }, `site:${id}`, file => readFileSync(file, 'utf8'), file => readFileSync(file))
    if (!opened) return new Response(null, { status: 404 })
    return bytesResponse(opened.bytes, opened.type, request.headers.get('range'))
  })
}
