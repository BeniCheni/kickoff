import { createHash } from 'node:crypto'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { request as httpRequest, type IncomingHttpHeaders } from 'node:http'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { eq } from 'drizzle-orm'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { PER_JOB_CAP_USD, PREPAID_CEILING_USD, SESSION_CAP_USD } from '../caps.ts'
import { CHECKLIST_LINES, asset, generation, generationInput, job, subject, videos } from '../db/schema.ts'
import { adminBackends, openAdmin } from '../server/open.ts'
import { startAdmin, type AdminServer } from '../server/http.ts'
import { DRAFT, STORAGE_REFUSAL } from '../shared/admin-copy.ts'
import type { ComposeDraft } from '../shared/compose.ts'
import type { ShellView } from '../shared/types.ts'
import { COPY } from '../copy.ts'
import { ComposeForm } from '../ui/app/compose.tsx'
import { PublishCard } from '../ui/app/publish.tsx'
import { StudioShell } from '../ui/app/shell.tsx'
import { minimalJpeg } from './jpeg.ts'

const servers: AdminServer[] = []

afterEach(async () => {
  while (servers.length > 0) await servers.pop()?.close()
})

function folders(extra: Record<string, string> = {}): NodeJS.ProcessEnv & { STUDIO_MEDIA_DIR: string } {
  return {
    STUDIO_DATA_DIR: mkdtempSync(path.join(tmpdir(), 'kickoff-studio-data-')),
    STUDIO_MEDIA_DIR: mkdtempSync(path.join(tmpdir(), 'kickoff-studio-media-')),
    STUDIO_NOW: '2026-10-18T18:00:00.000Z',
    STUDIO_LIVE: '1',
    DATABASE_URL: ['postgres', '://127.0.0.1:1/studio'].join(''),
    STUDIO_ADMIN_LIVE_PGLITE: '1',
    ...extra,
  }
}

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

async function cookieFor(admin: AdminServer): Promise<string> {
  const ticket = await ask(admin, { path: `/?ticket=${encodeURIComponent(admin.token)}` })
  const header = ticket.headers['set-cookie']
  return (Array.isArray(header) ? header[0] : header)?.split(';')[0] ?? ''
}

describe('live storage refusal', () => {
  it('selects postgres and refused storage for a real live start', () => {
    expect(adminBackends(true, { STUDIO_LIVE: '1', DATABASE_URL: ['postgres', '://example/studio'].join('') })).toEqual({
      databaseEngine: 'postgres',
      storage: 'refused',
      pglite: false,
    })
    expect(adminBackends(false, {})).toEqual({
      databaseEngine: 'pglite',
      storage: 'stub',
      pglite: true,
    })
  })

  it('starts live without FAL_KEY and disables Submit for that reason', async () => {
    const admin = await startAdmin({ live: true, env: folders(), port: 0 })
    servers.push(admin)
    expect(admin.transport).toBe('live')
    expect(admin.storage).toBe('refused')
    const cookie = await cookieFor(admin)
    const shell = JSON.parse((await ask(admin, { path: '/api/shell', headers: { cookie } })).body) as ShellView
    expect(shell.transport).toBe('live')
    expect(shell.databaseEngine).toBe('pglite')
    expect(shell.storage).toBe('refused')
    expect(shell.falConfigured).toBe(false)
    expect(shell.fal).toBe('refused')
    const refused = JSON.parse((await ask(admin, {
      path: '/api/submit',
      method: 'POST',
      headers: { cookie, origin: admin.origin, 'content-type': 'application/json' },
      body: JSON.stringify({ confirmTotalUsd: '0.000000', jobs: [] }),
    })).body) as { outcome: string }
    expect(refused.outcome).toBe('fal-key-missing')

    const draft: ComposeDraft = {
      subjectId: 'fen',
      photoId: null,
      keyframeEndpoint: 'openai/gpt-image-2/edit',
      canvas: '16:10',
      prompts: { k0: '', k1: '', k2: '' },
      clipEndpoint: 'minimax/h3-max-turbo/image-to-video',
      frames: 'k0-k2',
      resolution: '480P',
      duration: 15,
      motion: 'a fictional cat walks',
      seed: '',
      expansion: 'off',
    }
    const html = renderToStaticMarkup(
      <ComposeForm
        catalog={{
          subjects: [{ id: 'fen', name: 'Fenway' }],
          photos: [],
          keyframeModels: [],
          clipModels: [],
          sessionSpendUsd: '0.000000',
          perJobCapUsd: PER_JOB_CAP_USD,
          sessionCapUsd: SESSION_CAP_USD,
          database: 'reachable',
        }}
        shell={{ ...shell, port: 5176 }}
        draft={draft}
        onDraft={() => undefined}
        lines={[{ outcome: 'estimate', usd: '0.375000', registryId: 'clip', tag: 'current' }]}
        onEstimate={() => undefined}
        onSubmit={() => undefined}
      />,
    )
    expect(html).toContain(DRAFT.falKey)
    expect(html).toContain('disabled')
  })

  it('refuses a live publish and the delete routes, and leaves videos empty', async () => {
    const env = folders()
    const opened = await openAdmin(env, false)
    const [who] = await opened.db.insert(subject).values({ name: 'Fenway' }).returning()
    if (!who) throw new Error('no subject')
    const submitted = await opened.studio.submit({
      endpoint: 'minimax/h3-max-turbo/image-to-video',
      params: { prompt: 'a fictional cat', duration: 15, resolution: '480P', seed: 'live' },
      prompt: 'a fictional cat',
      seed: 'live',
      subjectId: who.id,
    })
    expect(submitted.outcome).toBe('submitted')
    if (submitted.outcome !== 'submitted') return
    for (let step = 0; step < 4; step += 1) {
      const polled = await opened.studio.poll(submitted.jobId)
      if (polled.outcome === 'completed') break
    }
    expect((await opened.studio.download(submitted.jobId)).outcome).toBe('downloaded')
    const [row] = await opened.db.select().from(job).where(eq(job.id, submitted.jobId))
    const [gen] = row ? await opened.db.select().from(generation).where(eq(generation.id, row.generationId)) : []
    if (!gen?.outputAssetId) throw new Error('no output')
    await opened.db.update(asset).set({ width: 320, height: 180, durationS: '1.000' }).where(eq(asset.id, gen.outputAssetId))
    const stillPath = path.join(env.STUDIO_MEDIA_DIR, 'still.jpg')
    writeFileSync(stillPath, minimalJpeg)
    const [still] = await opened.db.insert(asset).values({
      role: 'keyframe',
      sha256: createHash('sha256').update(minimalJpeg).digest('hex'),
      mime: 'image/jpeg',
      bytes: minimalJpeg.byteLength,
      width: 8,
      height: 8,
      localPath: stillPath,
    }).returning()
    if (!still) throw new Error('still')
    await opened.db.insert(generationInput).values({ generationId: gen.id, assetId: still.id, role: 'first' })
    expect((await opened.studio.keep(submitted.jobId, CHECKLIST_LINES.map((line) => ({ line, answer: 'clear' as const, by: 'operator' })))).outcome).toBe('kept')
    await opened.close()

    const admin = await startAdmin({ live: true, env, port: 0 })
    servers.push(admin)
    const cookie = await cookieFor(admin)
    const headers = { cookie, origin: admin.origin, 'content-type': 'application/json' }
    const gate = JSON.parse((await ask(admin, {
      path: '/api/gate',
      method: 'POST',
      headers,
      body: JSON.stringify({
        answer: 'Recorded for the live refusal test.',
        disclosure: 'The Generated label stays.',
        recordedBy: 'operator',
        source: 'test',
      }),
    })).body) as { outcome: string }
    expect(gate.outcome).toBe('gate-recorded')
    const published = JSON.parse((await ask(admin, {
      path: `/api/publish/${submitted.jobId}/go`,
      method: 'POST',
      headers,
      body: JSON.stringify({ publicId: 'live-ready', title: 'Live ready', position: 1, confirm: true }),
    })).body) as { outcome: string }
    expect(published.outcome).toBe('upload-failed')
    const listed = JSON.parse((await ask(admin, { path: '/api/jobs', headers: { cookie } })).body) as { id: string; status: string }[]
    expect(listed.find((item) => item.id === submitted.jobId)?.status).toBe('kept')
    for (const [pathName, body] of [
      [`/api/publish/${submitted.jobId}/unpublish`, JSON.stringify({ deleteFiles: true })],
      [`/api/publish/${submitted.jobId}/retry-delete`, '{}'],
      [`/api/publish/${submitted.jobId}/retry-removal`, '{}'],
    ] as const) {
      const refused = JSON.parse((await ask(admin, { path: pathName, method: 'POST', headers, body })).body) as { outcome: string; message: string }
      expect(refused.outcome).toBe('storage-refused')
      expect(refused.message).toBe(STORAGE_REFUSAL)
    }
    await admin.close()
    servers.pop()
    const check = await openAdmin(env, true)
    expect(await check.db.select().from(videos)).toEqual([])
    await check.close()

    const shell: ShellView = {
      transport: 'live',
      databaseEngine: 'postgres',
      storage: 'refused',
      fal: 'live',
      falConfigured: true,
      host: '127.0.0.1',
      port: 5176,
      balance: null,
      session: null,
      caps: { perJobUsd: PER_JOB_CAP_USD, sessionUsd: SESSION_CAP_USD, prepaidCeilingUsd: PREPAID_CEILING_USD },
      database: 'reachable',
      outOfCredit: false,
    }
    const html = renderToStaticMarkup(
      <PublishCard
        view={{ outcome: 'publish', status: 'kept', gateRecorded: true, gateReason: null, refusals: [], assetId: null }}
        publicId="live-ready"
        title="Live ready"
        onPublicId={() => undefined}
        onTitle={() => undefined}
        gateAnswer=""
        gateDisclosure=""
        gateBy=""
        gateSource=""
        position="1"
        onGateAnswer={() => undefined}
        onGateDisclosure={() => undefined}
        onGateBy={() => undefined}
        onGateSource={() => undefined}
        onPosition={() => undefined}
        onGate={() => undefined}
        onPublish={() => undefined}
        onUnpublish={() => undefined}
        onRetryDelete={() => undefined}
        onRetryRemoval={() => undefined}
        confirm={shell.storage === 'refused' ? STORAGE_REFUSAL : DRAFT.publishConfirm}
      />,
    )
    expect(html).toContain(STORAGE_REFUSAL)
    expect(html).not.toContain('live on the next read')
  })

  it('shows the paused banner for a database that does not answer, with no driver text', async () => {
    const env = folders()
    delete env.STUDIO_ADMIN_LIVE_PGLITE
    env[['FAL', '_KEY'].join('')] = 'present'
    const admin = await startAdmin({
      live: true,
      env,
      port: 0,
      boom: 'Failed query: select "id" from "studio"."balance_entry"',
    })
    servers.push(admin)
    const cookie = await cookieFor(admin)
    const shellResponse = await ask(admin, { path: '/api/shell', headers: { cookie } })
    expect(shellResponse.status).toBe(200)
    expect(shellResponse.body).not.toContain('Failed query')
    const shell = JSON.parse(shellResponse.body) as ShellView
    expect(shell.database).toBe('unavailable')
    expect(shell.databaseEngine).toBe('postgres')
    const jobs = await ask(admin, { path: '/api/jobs', headers: { cookie } })
    expect(jobs.status).toBe(200)
    expect(jobs.body).toBe('[]')
    expect(jobs.body).not.toContain('Failed query')
    const compose = JSON.parse((await ask(admin, { path: '/api/compose', headers: { cookie } })).body) as { database: string }
    expect(compose.database).toBe('unavailable')
    const banner = renderToStaticMarkup(
      <StudioShell shell={{ ...shell, port: 5176 }} tab="jobs" theme="light" onTab={() => undefined} onTheme={() => undefined} />,
    )
    const split = COPY.databaseUnavailable.indexOf('. ')
    expect(banner).toContain(COPY.databaseUnavailable.slice(0, split + 1))
    expect(banner).toContain(COPY.databaseUnavailable.slice(split + 2))
    expect(banner).toContain('data-kind="ledger"')
    const form = renderToStaticMarkup(
      <ComposeForm
        catalog={{
          subjects: [],
          photos: [],
          keyframeModels: [],
          clipModels: [],
          sessionSpendUsd: '0.000000',
          perJobCapUsd: PER_JOB_CAP_USD,
          sessionCapUsd: SESSION_CAP_USD,
          database: 'unavailable',
        }}
        shell={{ ...shell, port: 5176 }}
        draft={{
          subjectId: null,
          photoId: null,
          keyframeEndpoint: 'openai/gpt-image-2/edit',
          canvas: '16:10',
          prompts: { k0: '', k1: '', k2: '' },
          clipEndpoint: 'minimax/h3-max-turbo/image-to-video',
          frames: 'k0-k2',
          resolution: '480P',
          duration: 15,
          motion: 'a fictional cat walks',
          seed: '',
          expansion: 'off',
        }}
        onDraft={() => undefined}
        lines={[{ outcome: 'estimate', usd: '0.375000', registryId: 'clip', tag: 'current' }]}
        onEstimate={() => undefined}
        onSubmit={() => undefined}
      />,
    )
    expect(form).toContain(DRAFT.submitDatabase)
    const boom = await ask(admin, { path: '/api/boom', headers: { cookie } })
    expect(boom.status).toBe(500)
    expect(boom.body).toBe('{"error":"refused"}')
    expect(boom.body).not.toContain('Failed query')
  })
})
