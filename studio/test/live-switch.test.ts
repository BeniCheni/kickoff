import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { CHECKLIST_LINES } from '../db/schema.ts'
import { missingLiveDatabase, openDatabase, runCli, type DatabaseFactory } from '../cli.ts'
import { syntheticMp4 } from '../media/mp4.ts'
import { freshDatabase, type StudioClient } from './harness.ts'
import { minimalJpeg } from './jpeg.ts'

const clients: StudioClient[] = []
const databaseUrl = ['postgres', '://', 'example.invalid/studio'].join('')
const databaseScheme = ['postgres', '://'].join('')
const commands = [
  'estimate', 'submit', 'poll', 'resume', 'download', 'import', 'list', 'keep', 'discard', 'cancel',
  'publish', 'unpublish', 'retry-delete', 'retry-removal', 'close-session', 'attach-request',
  'settle-unconfirmed', 'record-gate', 'record-balance', 'migrate',
]

afterEach(async () => {
  await Promise.all(clients.splice(0).map((client) => client.close()))
})

function io() {
  const out: string[] = []
  const err: string[] = []
  return {
    out,
    err,
    stdout: (line: string) => out.push(line),
    stderr: (line: string) => err.push(line),
  }
}

describe('--live', () => {
  it('refuses unless STUDIO_LIVE is 1 and DATABASE_URL is set, for every command', async () => {
    const unset = io()
    expect(await runCli(['list', '--live'], {}, unset)).toBe(1)
    expect(unset.err).toEqual(['refused: --live needs STUDIO_LIVE and DATABASE_URL'])
    expect(unset.out).toEqual([])

    const typo = io()
    expect(await runCli(['publish', '--live'], { STUDIO_LIVE: 'true', DATABASE_URL: databaseUrl }, typo)).toBe(1)
    expect(typo.err.join('\n')).toContain('STUDIO_LIVE')
    expect(typo.err.join('\n')).not.toContain(databaseUrl)
    expect(typo.out).toEqual([])

    for (const command of commands) {
      let opened = false
      const captured = io()
      const code = await runCli([command, '--live'], { STUDIO_LIVE: '1' }, captured, {
        openDatabase: async () => {
          opened = true
          throw new Error('opened')
        },
      })
      expect(code, command).toBe(1)
      expect(opened, command).toBe(false)
      expect(captured.err.join('\n'), command).toContain('DATABASE_URL')
      expect(captured.err.join('\n'), command).not.toContain(databaseScheme)
    }
  })

  it('accepts import, keep and record-gate with no fal key and no R2 names, and never builds PGlite', async () => {
    const { client, db } = await freshDatabase()
    clients.push(client)
    const opened: boolean[] = []
    const factory: DatabaseFactory = async ({ live }) => {
      opened.push(live)
      if (!live) throw new Error('pglite')
      return { db, kind: 'postgres', close: async () => undefined }
    }
    const media = mkdtempSync(path.join(tmpdir(), 'kickoff-live-switch-'))
    const data = mkdtempSync(path.join(tmpdir(), 'kickoff-live-switch-data-'))
    const video = path.join(media, 'clip.mp4')
    const still = path.join(media, 'k0.jpg')
    const prompt = path.join(media, 'prompt.txt')
    writeFileSync(video, syntheticMp4({ width: 1920, height: 1080, durationS: 5, frameRate: 24, creationTime: 0 }))
    writeFileSync(still, minimalJpeg)
    writeFileSync(prompt, 'A cat scores\n')
    const env = {
      STUDIO_LIVE: '1',
      DATABASE_URL: databaseUrl,
      STUDIO_DATA_DIR: data,
      STUDIO_MEDIA_DIR: media,
      STUDIO_NOW: '2026-10-21T16:00:00.000Z',
    }
    const imported = io()
    expect(await runCli([
      'import', '--live', '--file', video, '--keyframe', still, '--source', 'grok-imagine',
      '--prompt-file', prompt, '--subjects', 'Fenway', '--title', 'Fenway', '--made-on', '2026-10-21',
    ], env, imported, { openDatabase: factory })).toBe(0)
    expect(imported.err).toEqual([])
    expect(imported.out[0]).toContain('imported')
    expect(imported.out[0]).toContain('database=postgres')
    expect(imported.out[0]).not.toContain('storage=')
    const job = /job=([0-9a-f-]{36})/.exec(imported.out[0] ?? '')?.[1]
    expect(job).toBeTruthy()

    const kept = io()
    expect(await runCli([
      'keep', '--live', '--job', job ?? '', '--answers', CHECKLIST_LINES.map(() => 'clear').join(','),
    ], env, kept, { openDatabase: factory })).toBe(0)
    expect(kept.out).toEqual(['kept database=postgres'])

    const gate = io()
    expect(await runCli([
      'record-gate', '--live', '--answer', 'recorded', '--disclosure', 'pending', '--by', 'unspecified', '--source', 'A-06',
    ], env, gate, { openDatabase: factory })).toBe(0)
    expect(gate.out[0]).toContain('gate-recorded')
    expect(gate.out[0]).toContain('database=postgres')
    expect(opened.every((live) => live)).toBe(true)
    expect(opened).toHaveLength(3)
  })

  it('does not construct PGlite when --live opens Postgres', async () => {
    let pgliteBuilds = 0
    class CountingPGlite {
      constructor(_dir: string) {
        pgliteBuilds += 1
      }
      async close() {}
    }
    let postgresOpens = 0
    const opened = await openDatabase(
      { STUDIO_LIVE: '1', DATABASE_URL: databaseUrl },
      true,
      '/tmp/kickoff-live-switch-unused',
      {
        PGlite: CountingPGlite as unknown as typeof PGlite,
        postgres: () => {
          postgresOpens += 1
          return { async end() {} }
        },
      },
    )
    expect(opened.kind).toBe('postgres')
    expect(pgliteBuilds).toBe(0)
    expect(postgresOpens).toBe(1)
    await opened.close()
    expect(missingLiveDatabase({ STUDIO_LIVE: 'true', DATABASE_URL: databaseUrl })).toEqual(['STUDIO_LIVE'])
    expect(missingLiveDatabase({ STUDIO_LIVE: '1' })).toEqual(['DATABASE_URL'])
  })
})
