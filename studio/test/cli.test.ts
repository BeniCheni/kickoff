import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { liveDatabaseArmed, runCli, type CliIo } from '../cli.ts'
import { openPglite } from '../db/pglite.ts'
import { minimalJpeg } from './jpeg.ts'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const VIDEO = 'minimax/h3-max-turbo/image-to-video'

function capture(): CliIo & { out: string[]; err: string[] } {
  const out: string[] = []
  const err: string[] = []
  return {
    out,
    err,
    stdout: (line) => out.push(line),
    stderr: (line) => err.push(line),
  }
}

function jobOf(line: string): string {
  const match = /job=([0-9a-f-]{36})/.exec(line)
  const id = match?.[1]
  if (!id) throw new Error(line)
  return id
}

describe('command line', () => {
  it('stays on the stub unless the live flag and the live environment are both present', () => {
    expect(liveDatabaseArmed(['submit'], { STUDIO_LIVE: '1', DATABASE_URL: 'present' })).toBe(false)
    expect(liveDatabaseArmed(['submit', '--live'], { STUDIO_LIVE: '1' })).toBe(false)
    expect(liveDatabaseArmed(['submit', '--live'], { STUDIO_LIVE: '1', DATABASE_URL: 'present' })).toBe(true)
  })

  it('estimates on the pinned price and refuses an unknown endpoint', async () => {
    const io = capture()
    const env = { STUDIO_NOW: '2026-10-12T16:00:00.000Z' }
    const code = await runCli([
      'estimate', '--endpoint', VIDEO, '--duration', '15', '--resolution', '480P',
    ], env, io)
    expect(code).toBe(0)
    expect(io.out).toEqual([
      '0.225000 tag=DOCUMENTED registry=minimax-h3-max-turbo-i2v-480p-through-2026-10-14 database=none',
    ])
    const unknown = capture()
    expect(await runCli(['estimate', '--endpoint', 'not-a-model'], env, unknown)).toBe(0)
    expect(unknown.out).toEqual(['not-in-registry database=none'])
    const blocked = capture()
    expect(await runCli([
      'estimate', '--endpoint', VIDEO, '--duration', '15', '--resolution', '480P', '--image-size', 'square',
    ], env, blocked)).toBe(0)
    expect(blocked.out).toEqual(['param-not-allowed param=image_size database=none'])
    const liveEstimate = capture()
    expect(await runCli([
      'estimate', '--live', '--endpoint', 'not-a-model',
    ], { ...env, STUDIO_LIVE: '1', DATABASE_URL: 'present' }, liveEstimate)).toBe(0)
    expect(liveEstimate.out).toEqual(['not-in-registry database=none'])
  })

  it('labels migrate as postgres even without --live', async () => {
    let calls = 0
    const migrate = async () => {
      calls += 1
    }
    const offline = capture()
    expect(await runCli(['migrate'], {}, offline, { migrate })).toBe(0)
    expect(calls).toBe(1)
    expect(offline.out).toEqual(['migrated database=postgres'])
    const live = capture()
    expect(await runCli(['migrate', '--live'], { STUDIO_LIVE: '1', DATABASE_URL: 'present' }, live, { migrate })).toBe(0)
    expect(calls).toBe(2)
    expect(live.out).toEqual(['migrated database=postgres'])
  })

  it('refuses migrate and an in-repo data directory without opening a database', async () => {
    const missing = capture()
    expect(await runCli(['migrate'], {}, missing)).toBe(1)
    expect(missing.err.join('\n')).toMatch(/DATABASE_URL/)
    const inside = capture()
    const code = await runCli(['list'], {
      STUDIO_DATA_DIR: path.join(repoRoot, 'studio'),
      STUDIO_MEDIA_DIR: path.join(repoRoot, 'studio'),
      STUDIO_NOW: '2026-10-12T16:00:00.000Z',
    }, inside)
    expect(code).toBe(1)
    expect(inside.err.join('\n')).toMatch(/inside the worktree/)
  })

  it('runs the offline commands against the stub', async () => {
    const data = mkdtempSync(path.join(tmpdir(), 'kickoff-studio-data-'))
    const media = mkdtempSync(path.join(tmpdir(), 'kickoff-studio-media-'))
    const keyframe = path.join(media, 'k0.jpg')
    writeFileSync(keyframe, minimalJpeg)
    const env = {
      STUDIO_DATA_DIR: data,
      STUDIO_MEDIA_DIR: media,
      STUDIO_NOW: '2026-10-12T16:00:00.000Z',
    }
    const refusedLive = capture()
    expect(await runCli([
      'submit', '--endpoint', VIDEO, '--prompt', 'a fictional cat', '--duration', '15',
      '--resolution', '480P', '--seed', '1', '--keyframe', keyframe, '--live',
    ], env, refusedLive)).toBe(1)
    expect(refusedLive.err.join('\n')).toMatch(/STUDIO_LIVE/)
    expect(refusedLive.err.join('\n')).toMatch(/FAL_KEY/)
    expect(refusedLive.err.join('\n')).not.toMatch(/SECRET|postgres:\/\//)
    expect(refusedLive.out).toEqual([])

    const submitted = capture()
    expect(await runCli([
      'submit', '--endpoint', VIDEO, '--prompt', 'a fictional cat', '--duration', '15',
      '--resolution', '480P', '--seed', '1', '--keyframe', keyframe,
    ], env, submitted)).toBe(0)
    expect(submitted.out[0]).toContain('submitted')
    expect(submitted.out[0]).toContain('req-stub-1')
    expect(submitted.out[0]).toContain('transport=stub')
    const job = jobOf(submitted.out[0] ?? '')

    let outcome = ''
    for (let step = 0; step < 4 && outcome !== 'completed'; step += 1) {
      const polled = capture()
      expect(await runCli(['poll', '--job', job], env, polled)).toBe(0)
      outcome = (polled.out[0] ?? '').split(' ')[0] ?? ''
    }
    expect(outcome).toBe('completed')

    const downloaded = capture()
    expect(await runCli(['download', '--job', job], env, downloaded)).toBe(0)
    expect(downloaded.out[0]).toContain('downloaded')
    expect(downloaded.out[0]).toContain('transport=stub')
    const kept = capture()
    expect(await runCli([
      'keep', '--job', job, '--answers', 'clear,clear,clear,clear,clear',
    ], env, kept)).toBe(0)
    expect(kept.out).toEqual(['kept database=pglite'])

    const closed = capture()
    expect(await runCli([
      'publish', '--job', job, '--public-id', 'fenway', '--title', 'Fenway', '--position', '1',
    ], env, closed)).toBe(0)
    expect(closed.out[0]).toContain('gate-closed')
    expect(closed.out[1]).toContain('Article 50')

    const gate = capture()
    expect(await runCli([
      'record-gate', '--answer', 'recorded', '--disclosure', 'pending', '--by', 'unspecified', '--source', 'A-06',
    ], env, gate)).toBe(0)
    const refusedCard = capture()
    expect(await runCli([
      'publish', '--job', job, '--public-id', 'fenway', '--title', 'Fenway', '--position', '1',
    ], env, refusedCard)).toBe(0)
    expect(refusedCard.out[0]).toBe(
      'card-refused: missing a positive width; missing a positive height; missing a positive duration; missing an approved subject database=pglite storage=stub',
    )
    const pg = await openPglite(path.join(data, 'pglite'))
    await pg.exec(`
      UPDATE studio.asset SET width = 768, height = 480, duration_s = 15.084 WHERE role = 'video';
      INSERT INTO studio.subject (name) VALUES ('Fenway');
      INSERT INTO studio.generation_subject (generation_id, subject_id)
      SELECT generation_id, (SELECT id FROM studio.subject WHERE name = 'Fenway' LIMIT 1)
      FROM studio.job;
    `)
    await pg.close()
    const published = capture()
    expect(await runCli([
      'publish', '--job', job, '--public-id', 'fenway', '--title', 'Fenway', '--position', '1',
    ], env, published)).toBe(0)
    expect(published.out[0]).toContain('published')
    expect(published.out[0]).toContain('live=true')

    const balance = capture()
    expect(await runCli(['record-balance', '--amount', '9.37'], env, balance)).toBe(0)
    expect(balance.out[0]).toContain('readFromFal=false')
    expect(balance.out[0]).toContain('aboveCeiling=false')

    const withdrawn = capture()
    expect(await runCli(['unpublish', '--job', job], env, withdrawn)).toBe(0)
    expect(withdrawn.out[0]).toContain('withdrawn')
    expect(withdrawn.out[0]).toContain('removal=merged')
    expect(withdrawn.out[0]).not.toContain('live=true')
    const relist = capture()
    expect(await runCli([
      'publish', '--job', job, '--public-id', 'fenway-2', '--title', 'Fenway', '--position', '1',
    ], env, relist)).toBe(0)
    expect(relist.out[0]).toContain('not-relisted')

    const listed = capture()
    expect(await runCli(['list'], env, listed)).toBe(0)
    expect(listed.out.some((row) => row.includes('withdrawn') && row.includes('publishable=false'))).toBe(true)
  }, 30_000)
})
