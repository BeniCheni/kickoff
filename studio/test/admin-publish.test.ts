import { mkdtempSync, writeFileSync } from 'node:fs'
import { request as httpRequest, type IncomingHttpHeaders } from 'node:http'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { eq } from 'drizzle-orm'
import { afterEach, describe, expect, it } from 'vitest'
import { CHECKLIST_LINES, asset, generation, generationInput, generationSubject, job, subject } from '../db/schema.ts'
import { DRAFT } from '../shared/admin-copy.ts'
import { statusLine } from '../shared/status.ts'
import { openAdmin } from '../server/open.ts'
import { startAdmin, type AdminServer } from '../server/http.ts'
import { minimalJpeg } from './jpeg.ts'

const servers: AdminServer[] = []

afterEach(async () => {
  while (servers.length > 0) await servers.pop()?.close()
})

function ask(admin: AdminServer, options: {
  path: string
  method?: string
  headers?: IncomingHttpHeaders
  body?: string
}): Promise<{ status: number; body: string; headers: IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const req = httpRequest({
      hostname: '127.0.0.1',
      port: admin.port,
      path: options.path,
      method: options.method ?? 'GET',
      headers: { host: `127.0.0.1:${admin.port}`, ...options.headers },
    }, (response) => {
      const chunks: Buffer[] = []
      response.on('data', (chunk: Buffer) => chunks.push(chunk))
      response.on('end', () => resolve({
        status: response.statusCode ?? 0,
        headers: response.headers,
        body: Buffer.concat(chunks).toString('utf8'),
      }))
    })
    req.on('error', reject)
    if (options.body) req.write(options.body)
    req.end()
  })
}

describe('publish', () => {
  it('refuses a publish that lacks width, height, and duration, in plain words', async () => {
    const folders = {
      STUDIO_DATA_DIR: mkdtempSync(`${tmpdir()}/kickoff-studio-data-`),
      STUDIO_MEDIA_DIR: mkdtempSync(`${tmpdir()}/kickoff-studio-media-`),
      STUDIO_NOW: '2026-10-18T18:00:00.000Z',
    }
    const opened = await openAdmin(folders, false)
    const [who] = await opened.db.insert(subject).values({ name: 'Fenway' }).returning()
    if (!who) throw new Error('no subject')
    const submitted = await opened.studio.submit({
      endpoint: 'minimax/h3-max-turbo/image-to-video',
      params: { prompt: 'a fictional cat', duration: 15, resolution: '480P', seed: 'publish' },
      prompt: 'a fictional cat',
      seed: 'publish',
      subjectId: who.id,
    })
    expect(submitted.outcome).toBe('submitted')
    if (submitted.outcome !== 'submitted') return
    for (let step = 0; step < 4; step += 1) {
      const polled = await opened.studio.poll(submitted.jobId)
      if (polled.outcome === 'completed') break
    }
    expect((await opened.studio.download(submitted.jobId)).outcome).toBe('downloaded')
    const [ready] = await opened.db.select().from(job).where(eq(job.id, submitted.jobId))
    const [readyGen] = ready ? await opened.db.select().from(generation).where(eq(generation.id, ready.generationId)) : []
    if (!readyGen) throw new Error('no generation')
    const stillPath = path.join(folders.STUDIO_MEDIA_DIR, 'still.jpg')
    writeFileSync(stillPath, minimalJpeg)
    const [still] = await opened.db.insert(asset).values({
      role: 'keyframe',
      sha256: 'c'.repeat(64),
      mime: 'image/jpeg',
      bytes: minimalJpeg.byteLength,
      localPath: stillPath,
    }).returning()
    if (!still) throw new Error('still')
    await opened.db.insert(generationInput).values({ generationId: readyGen.id, assetId: still.id, role: 'first' })
    const kept = await opened.studio.keep(submitted.jobId, CHECKLIST_LINES.map((line) => ({ line, answer: 'clear' as const, by: 'operator' })))
    expect(kept.outcome).toBe('kept')
    const linked = await opened.db.select().from(generationSubject)
    expect(linked.length).toBe(1)
    await opened.close()

    const admin = await startAdmin({ env: folders, port: 0 })
    servers.push(admin)
    const ticket = await ask(admin, { path: `/?ticket=${encodeURIComponent(admin.token)}` })
    const header = ticket.headers['set-cookie']
    const cookie = (Array.isArray(header) ? header[0] : header)?.split(';')[0] ?? ''
    const preview = JSON.parse((await ask(admin, {
      path: `/api/publish/${submitted.jobId}?publicId=fenway-1`,
      headers: { cookie },
    })).body) as { gateRecorded: boolean; missing: string[]; refusals: string[]; status: string }
    expect(preview.gateRecorded).toBe(false)
    expect(preview.missing).toEqual(['a positive width', 'a positive height', 'a positive duration'])
    expect(preview.refusals).toEqual([DRAFT.cardWidth, DRAFT.cardHeight, DRAFT.cardDuration])
    expect(preview.refusals).not.toContain(DRAFT.cardSubject)
    expect(preview.refusals).not.toContain(DRAFT.cardPublicId)
    const refused = JSON.parse((await ask(admin, {
      path: `/api/publish/${submitted.jobId}/go`,
      method: 'POST',
      headers: { cookie, origin: admin.origin, 'content-type': 'application/json' },
      body: JSON.stringify({ publicId: 'fenway-1', title: 'Fenway', position: 1, confirm: true }),
    })).body) as { outcome: string }
    expect(refused.outcome).toBe('gate-closed')
    const recorded = JSON.parse((await ask(admin, {
      path: '/api/gate',
      method: 'POST',
      headers: { cookie, origin: admin.origin, 'content-type': 'application/json' },
      body: JSON.stringify({
        answer: 'Article 50 is recorded for this test.',
        disclosure: 'The Generated label stays.',
        recordedBy: 'operator',
        source: 'test',
      }),
    })).body) as { outcome: string }
    expect(recorded.outcome).toBe('gate-recorded')
    const blocked = JSON.parse((await ask(admin, {
      path: `/api/publish/${submitted.jobId}/go`,
      method: 'POST',
      headers: { cookie, origin: admin.origin, 'content-type': 'application/json' },
      body: JSON.stringify({ publicId: 'fenway-1', title: 'Fenway', position: 1, confirm: true }),
    })).body) as { outcome: string; missing: string[]; refusals: string[] }
    expect(blocked.outcome).toBe('card-refused')
    expect(blocked.missing).toEqual(['a positive width', 'a positive height', 'a positive duration'])
    expect(blocked.refusals).toEqual([DRAFT.cardWidth, DRAFT.cardHeight, DRAFT.cardDuration])
    expect(statusLine(blocked)).toBe(`${DRAFT.cardWidth} ${DRAFT.cardHeight} ${DRAFT.cardDuration}`)
    expect(statusLine(blocked)).not.toContain('Card facts are not on the record')
    const listed = JSON.parse((await ask(admin, { path: '/api/jobs', headers: { cookie } })).body) as { status: string }[]
    expect(listed[0]?.status).toBe('kept')
  })

  it('uses the engine subject rule and the first-frame still', async () => {
    const media = mkdtempSync(`${tmpdir()}/kickoff-studio-media-`)
    const folders = {
      STUDIO_DATA_DIR: mkdtempSync(`${tmpdir()}/kickoff-studio-data-`),
      STUDIO_MEDIA_DIR: media,
      STUDIO_NOW: '2026-10-18T18:00:00.000Z',
    }
    const opened = await openAdmin(folders, false)
    const [fenway] = await opened.db.insert(subject).values({ name: 'Fenway' }).returning()
    const [frankenstein] = await opened.db.insert(subject).values({ name: 'Frankenstein' }).returning()
    if (!fenway || !frankenstein) throw new Error('subjects')
    const submitted = await opened.studio.submit({
      endpoint: 'minimax/h3-max-turbo/image-to-video',
      params: { prompt: 'a fictional cat', duration: 15, resolution: '480P', seed: 'card' },
      prompt: 'a fictional cat',
      seed: 'card',
      subjectId: fenway.id,
    })
    if (submitted.outcome !== 'submitted') throw new Error(submitted.outcome)
    for (let step = 0; step < 4; step += 1) {
      const polled = await opened.studio.poll(submitted.jobId)
      if (polled.outcome === 'completed') break
    }
    expect((await opened.studio.download(submitted.jobId)).outcome).toBe('downloaded')
    expect((await opened.studio.keep(submitted.jobId, CHECKLIST_LINES.map((line) => ({ line, answer: 'clear' as const, by: 'operator' })))).outcome).toBe('kept')
    const [row] = await opened.db.select().from(job).where(eq(job.id, submitted.jobId))
    const [gen] = row ? await opened.db.select().from(generation).where(eq(generation.id, row.generationId)) : []
    if (!gen?.outputAssetId) throw new Error('no output')
    await opened.db.update(asset).set({ width: 1920, height: 1080, durationS: '5.000' }).where(eq(asset.id, gen.outputAssetId))
    await opened.db.insert(generationSubject).values({ generationId: gen.id, subjectId: frankenstein.id })
    const stillPath = path.join(media, 'still.jpg')
    writeFileSync(stillPath, minimalJpeg)
    const lastSha = 'b'.repeat(64)
    const firstSha = 'a'.repeat(64)
    const [last] = await opened.db.insert(asset).values({
      role: 'keyframe',
      sha256: lastSha,
      mime: 'image/jpeg',
      bytes: minimalJpeg.byteLength,
      localPath: stillPath,
    }).returning()
    const [first] = await opened.db.insert(asset).values({
      role: 'keyframe',
      sha256: firstSha,
      mime: 'image/jpeg',
      bytes: minimalJpeg.byteLength,
      localPath: stillPath,
    }).returning()
    if (!last || !first) throw new Error('stills')
    await opened.db.insert(generationInput).values({ generationId: gen.id, assetId: last.id, role: 'last' })
    await opened.db.insert(generationInput).values({ generationId: gen.id, assetId: first.id, role: 'first' })
    await opened.close()

    const admin = await startAdmin({ env: folders, port: 0 })
    servers.push(admin)
    const ticket = await ask(admin, { path: `/?ticket=${encodeURIComponent(admin.token)}` })
    const header = ticket.headers['set-cookie']
    const cookie = (Array.isArray(header) ? header[0] : header)?.split(';')[0] ?? ''
    const both = JSON.parse((await ask(admin, {
      path: `/api/publish/${submitted.jobId}?publicId=fenway-1`,
      headers: { cookie },
    })).body) as { missing: string[]; refusals: string[]; keys: { thumbnail: string } | null }
    expect(both.missing).not.toContain('an approved subject')
    expect(both.refusals).not.toContain(DRAFT.cardSubject)
    expect(both.keys?.thumbnail).toBe('fenway-1/thumbnail-aaaaaaaa.jpg')
    expect(both.keys?.thumbnail).not.toContain('bbbbbbbb')
    await admin.close()
    servers.pop()

    const check = await openAdmin(folders, false)
    await check.db.delete(generationSubject).where(eq(generationSubject.generationId, gen.id))
    const [other] = await check.db.insert(subject).values({ name: 'Other' }).returning()
    if (!other) throw new Error('other')
    await check.db.insert(generationSubject).values({ generationId: gen.id, subjectId: other.id })
    await check.close()
    const again = await startAdmin({ env: folders, port: 0 })
    servers.push(again)
    const againTicket = await ask(again, { path: `/?ticket=${encodeURIComponent(again.token)}` })
    const againHeader = againTicket.headers['set-cookie']
    const againCookie = (Array.isArray(againHeader) ? againHeader[0] : againHeader)?.split(';')[0] ?? ''
    const refused = JSON.parse((await ask(again, {
      path: `/api/publish/${submitted.jobId}?publicId=fenway-1`,
      headers: { cookie: againCookie },
    })).body) as { missing: string[]; refusals: string[] }
    expect(refused.missing).toContain('an approved subject')
    expect(refused.refusals).toContain(DRAFT.cardSubject)
  })
})
