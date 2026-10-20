import { mkdtempSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { CHECKLIST_LINES } from '../db/schema.ts'
import { openPglite } from '../db/pglite.ts'
import { runCli, type CliIo } from '../cli.ts'
import { syntheticMp4 } from '../media/mp4.ts'
import { minimalJpeg } from './jpeg.ts'

const MAC_EPOCH_SECONDS = 2_082_844_800

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

describe('publish embeddings', () => {
  it('publishes when the embedding fails, then backfill writes and a second run skips', async () => {
    const data = mkdtempSync(path.join(tmpdir(), 'st4-embed-data-'))
    const media = mkdtempSync(path.join(tmpdir(), 'st4-embed-media-'))
    const videoPath = path.join(media, 'clip.mp4')
    const stillPath = path.join(media, 'k0.jpg')
    const promptPath = path.join(media, 'prompt.txt')
    const created = Math.floor(Date.parse('2026-10-18T15:00:00.000Z') / 1000) + MAC_EPOCH_SECONDS
    writeFileSync(videoPath, syntheticMp4({ creationTime: created }))
    writeFileSync(stillPath, minimalJpeg)
    writeFileSync(promptPath, 'A cat scores\n')
    const env = {
      STUDIO_DATA_DIR: data,
      STUDIO_MEDIA_DIR: media,
      STUDIO_NOW: '2026-10-18T16:00:00.000Z',
      STUDIO_EMBED: 'fake',
    }
    const imported = capture()
    expect(await runCli([
      'import', '--file', videoPath, '--keyframe', stillPath, '--source', 'grok-imagine',
      '--prompt-file', promptPath, '--subjects', 'Fenway', '--title', 'Fenway', '--note', 'A note',
    ], env, imported)).toBe(0)
    const job = /job=([0-9a-f-]{36})/.exec(imported.out[0] ?? '')?.[1] ?? ''
    expect(job).not.toBe('')
    expect(await runCli(['keep', '--job', job, '--answers', CHECKLIST_LINES.map(() => 'clear').join(',')], env, capture())).toBe(0)
    expect(await runCli([
      'record-gate', '--answer', 'recorded', '--disclosure', 'pending', '--by', 'the test', '--source', 'A-06',
    ], env, capture())).toBe(0)

    const stored = readdirSync(media).find((name) => name.endsWith('.jpg') && name !== 'k0.jpg')
    if (!stored) throw new Error('import did not keep a keyframe')
    const storedPath = path.join(media, stored)
    unlinkSync(storedPath)
    const failed = capture()
    expect(await runCli([
      'publish', '--job', job, '--public-id', 'fenway-note', '--position', '1',
    ], env, failed)).toBe(0)
    expect(failed.out[0]).toBe('published live=true database=pglite storage=stub embedding=missing reason=read-failed')

    writeFileSync(storedPath, minimalJpeg)
    const filled = capture()
    expect(await runCli(['embed', '--backfill', '--public-id', 'fenway-note'], env, filled)).toBe(0)
    expect(filled.out[0]).toBe('clip=fenway-note embedding=written database=pglite')
    expect(filled.out[1]).toBe('embedded database=pglite written=1 skipped=0 missing=0')
    const again = capture()
    expect(await runCli(['embed', '--backfill'], env, again)).toBe(0)
    expect(again.out[0]).toBe('clip=fenway-note embedding=skipped database=pglite')
    expect(again.out[1]).toBe('embedded database=pglite written=0 skipped=1 missing=0')

    const database = await openPglite(path.join(data, 'pglite'))
    const vectors = await database.query<{ kind: string; model_id: string }>('SELECT kind, model_id FROM studio.clip_embeddings ORDER BY kind')
    expect(vectors.rows.map((row) => row.kind)).toEqual(['keyframe', 'text'])
    expect(vectors.rows.map((row) => row.model_id)).toEqual(['fake/sha256-unit', 'fake/sha256-unit'])
    const similar = await database.query('SELECT id, score FROM catalog.similar_moments(\'fenway-note\', 6)')
    expect(similar.rows).toEqual([])
    await database.close()
    expect(await runCli(['unpublish', '--job', job], env, capture())).toBe(0)
    const missingId = capture()
    expect(await runCli(['embed', '--backfill', '--public-id', 'not-a-clip'], env, missingId)).toBe(0)
    expect(missingId.out).toEqual([
      'clip=not-a-clip not-published database=pglite',
      'embedded database=pglite written=0 skipped=0 missing=0',
    ])
    const after = await openPglite(path.join(data, 'pglite'))
    const still = await after.query<{ count: number }>('SELECT count(*)::int AS count FROM studio.clip_embeddings')
    expect(still.rows[0]?.count).toBe(2)
    const hidden = await after.query('SELECT id FROM catalog.similar_moments(\'fenway-note\', 6)')
    expect(hidden.rows).toEqual([])
    await after.close()
  })
})
