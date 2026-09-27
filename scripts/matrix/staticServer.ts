import { createServer, type Server } from 'node:http'
import { readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

/** Serves a directory of static fixtures. No app code, no network of its own. */
export function startStaticServer(root: string): Promise<{ url: string; close: () => Promise<void> }> {
  const base = path.resolve(root)
  const server: Server = createServer((request, response) => {
    const raw = request.url ?? '/'
    let pathname = '/'
    try {
      pathname = new URL(raw, 'http://127.0.0.1').pathname
    } catch {
      response.writeHead(400)
      response.end('bad path')
      return
    }
    const rel = decodeURIComponent(pathname).replace(/^\/+/, '') || 'index.html'
    if (rel.includes('\0')) {
      response.writeHead(400)
      response.end('bad path')
      return
    }
    const file = path.resolve(base, rel)
    if (file !== base && !file.startsWith(base + path.sep)) {
      response.writeHead(403)
      response.end('forbidden')
      return
    }
    try {
      if (!statSync(file).isFile()) {
        response.writeHead(404)
        response.end('not found')
        return
      }
      const body = readFileSync(file)
      response.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' })
      response.end(body)
    } catch {
      response.writeHead(404)
      response.end('not found')
    }
  })
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      const port = address && typeof address === 'object' ? address.port : 0
      resolve({
        url: `http://127.0.0.1:${port}/`,
        close: () => new Promise((done) => server.close(() => done())),
      })
    })
  })
}
