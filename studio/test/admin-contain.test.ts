import { mkdtempSync, symlinkSync, writeFileSync } from 'node:fs'
import { request as httpRequest, type IncomingHttpHeaders } from 'node:http'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { asset } from '../db/schema.ts'
import { startAdmin, type AdminServer } from '../server/http.ts'
import { openAdmin } from '../server/open.ts'

const servers: AdminServer[] = []

afterEach(async () => {
  while (servers.length > 0) await servers.pop()?.close()
})

function ask(admin: AdminServer, options: { path: string; headers?: IncomingHttpHeaders }): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = httpRequest({
      hostname: '127.0.0.1',
      port: admin.port,
      path: options.path,
      headers: { host: `127.0.0.1:${admin.port}`, ...options.headers },
    }, (response) => {
      const chunks: Buffer[] = []
      response.on('data', (chunk: Buffer) => chunks.push(chunk))
      response.on('end', () => resolve({ status: response.statusCode ?? 0, body: Buffer.concat(chunks).toString('utf8') }))
    })
    req.on('error', reject)
    req.end()
  })
}

describe('media containment', () => {
  it('refuses a symlink that leaves the media directory', async () => {
    const data = mkdtempSync(path.join(tmpdir(), 'kickoff-studio-data-'))
    const media = mkdtempSync(path.join(tmpdir(), 'kickoff-studio-media-'))
    const outside = mkdtempSync(path.join(tmpdir(), 'kickoff-studio-outside-'))
    const secret = path.join(outside, 'secret.txt')
    writeFileSync(secret, 'outside the media dir')
    const link = path.join(media, 'evil-link.mp4')
    symlinkSync(secret, link)
    const opened = await openAdmin({
      STUDIO_DATA_DIR: data,
      STUDIO_MEDIA_DIR: media,
      STUDIO_NOW: '2026-10-18T18:00:00.000Z',
    }, false)
    const [row] = await opened.db.insert(asset).values({
      role: 'video',
      sha256: 'a'.repeat(64),
      mime: 'video/mp4',
      bytes: 22,
      localPath: link,
    }).returning()
    await opened.close()
    if (!row) throw new Error('no asset')
    const admin = await startAdmin({
      env: { STUDIO_DATA_DIR: data, STUDIO_MEDIA_DIR: media, STUDIO_NOW: '2026-10-18T18:00:00.000Z' },
      port: 0,
    })
    servers.push(admin)
    const headed = await new Promise<{ status: number; cookie: string }>((resolve, reject) => {
      const req = httpRequest({
        hostname: '127.0.0.1',
        port: admin.port,
        path: `/?ticket=${encodeURIComponent(admin.token)}`,
        headers: { host: `127.0.0.1:${admin.port}` },
      }, (response) => {
        response.on('data', () => undefined)
        response.on('end', () => {
          const setCookie = response.headers['set-cookie']
          const value = (Array.isArray(setCookie) ? setCookie[0] : setCookie)?.split(';')[0] ?? ''
          resolve({ status: response.statusCode ?? 0, cookie: value })
        })
      })
      req.on('error', reject)
      req.end()
    })
    const mediaResponse = await ask(admin, { path: `/media/assets/${row.id}`, headers: { cookie: headed.cookie } })
    expect(headed.status).toBe(302)
    expect(mediaResponse.status).toBe(404)
    expect(mediaResponse.body).not.toContain('outside the media dir')
  })
})
