import { mkdtempSync, writeFileSync } from 'node:fs'
import { createServer, request as httpRequest, type IncomingHttpHeaders } from 'node:http'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { serveFile } from '../server/media.ts'

const file = path.join(mkdtempSync(path.join(tmpdir(), 'kickoff-studio-range-')), 'clip.bin')
const bytes = Buffer.from(Array.from({ length: 1000 }, (_, index) => index % 256))
writeFileSync(file, bytes)

function fetchRange(header?: string): Promise<{ status: number; headers: IncomingHttpHeaders; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const server = createServer((request, response) => serveFile(request, response, file, 'application/octet-stream'))
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (!address || typeof address === 'string') {
        reject(new Error('no port'))
        return
      }
      const req = httpRequest({
        hostname: '127.0.0.1',
        port: address.port,
        path: '/clip.bin',
        headers: header ? { range: header } : {},
      }, (response) => {
        const chunks: Buffer[] = []
        response.on('data', (chunk: Buffer) => chunks.push(chunk))
        response.on('end', () => {
          server.close()
          resolve({
            status: response.statusCode ?? 0,
            headers: response.headers,
            body: Buffer.concat(chunks),
          })
        })
      })
      req.on('error', reject)
      req.end()
    })
  })
}

describe('suffix range', () => {
  it('serves the last bytes, ignores a bare suffix, and caps a long prefix', async () => {
    const lastTen = await fetchRange('bytes=-10')
    expect(lastTen.status).toBe(206)
    expect(lastTen.headers['content-range']).toBe('bytes 990-999/1000')
    expect(lastTen.body.equals(bytes.subarray(990))).toBe(true)

    const lastOne = await fetchRange('bytes=-1')
    expect(lastOne.status).toBe(206)
    expect(lastOne.headers['content-range']).toBe('bytes 999-999/1000')
    expect(lastOne.body.equals(bytes.subarray(999))).toBe(true)

    const bare = await fetchRange('bytes=-')
    expect(bare.status).toBe(200)
    expect(bare.headers['content-range']).toBeUndefined()
    expect(bare.body.equals(bytes)).toBe(true)

    const tail = await fetchRange('bytes=990-')
    expect(tail.status).toBe(206)
    expect(tail.headers['content-range']).toBe('bytes 990-999/1000')
    expect(tail.body.equals(bytes.subarray(990))).toBe(true)

    const over = await fetchRange('bytes=0-5000')
    expect(over.status).toBe(206)
    expect(over.headers['content-range']).toBe('bytes 0-999/1000')
    expect(over.body.equals(bytes)).toBe(true)
  })
})
