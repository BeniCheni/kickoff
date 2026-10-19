import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { CHECKLIST_LINES } from '../db/schema.ts'
import { runCli } from '../cli.ts'
import { sha256 } from '../hash.ts'
import { syntheticMp4 } from '../media/mp4.ts'
import { minimalJpeg } from './jpeg.ts'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const MAC_EPOCH_SECONDS = 2_082_844_800

function wednesday(): string {
  const readme = readFileSync(path.join(repoRoot, 'studio/README.md'), 'utf8')
  const section = readme.split('## Wednesday 21 Oct 2026')[1]
  if (!section) throw new Error('Wednesday section missing')
  return section
}

function commands(section: string): string[][] {
  return [...section.matchAll(/```bash\n([\s\S]*?)```/g)].map((match) => tokenize(match[1] ?? ''))
}

function tokenize(command: string): string[] {
  const body = command.replace(/^npm run cli --\s*/, '').trim()
  return [...body.matchAll(/"([^"]*)"|(\S+)/g)].map((match) => match[1] ?? match[2] ?? '')
}

function capture() {
  const out: string[] = []
  const err: string[] = []
  return {
    out,
    err,
    stdout: (line: string) => out.push(line),
    stderr: (line: string) => err.push(line),
  }
}

describe('Wednesday walk-through', () => {
  it('refuses every --live command when the variables are missing', async () => {
    const section = wednesday()
    const listed = commands(section)
    expect(listed.length).toBeGreaterThan(0)
    expect(listed.every((argv) => argv.includes('--live'))).toBe(true)
    const objectStore = new Set(['publish', 'retry-delete'])
    for (const argv of listed) {
      const io = capture()
      expect(await runCli(argv, {}, io)).toBe(1)
      const deleteFiles = argv[0] === 'unpublish' && argv.includes('--delete')
      const expected = objectStore.has(argv[0] ?? '') || deleteFiles
        ? 'refused: --live needs STUDIO_LIVE and DATABASE_URL and R2_ACCOUNT_ID and R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY and R2_BUCKET'
        : 'refused: --live needs STUDIO_LIVE and DATABASE_URL'
      expect(io.err, argv.join(' ')).toEqual([expected])
      expect(io.out).toEqual([])
    }
    expect(section).toContain('refused: --live needs STUDIO_LIVE and DATABASE_URL')
  })

  it('matches the README lines on the stub, apart from migrate', async () => {
    const section = wednesday()
    const data = mkdtempSync(path.join(tmpdir(), 'kickoff-wednesday-'))
    const media = mkdtempSync(path.join(tmpdir(), 'kickoff-wednesday-media-'))
    const clip = syntheticMp4({
      width: 1920,
      height: 1080,
      durationS: 5,
      frameRate: 24,
      audio: true,
      creationTime: Math.floor(Date.parse('2026-10-18T15:00:00.000Z') / 1000) + MAC_EPOCH_SECONDS,
    })
    const video = path.join(media, 'fenway.mp4')
    const still = path.join(media, 'fenway.jpg')
    const prompt = path.join(media, 'fenway.txt')
    writeFileSync(video, clip)
    writeFileSync(still, minimalJpeg)
    writeFileSync(prompt, 'A cat scores\n')
    const env = {
      STUDIO_DATA_DIR: data,
      STUDIO_MEDIA_DIR: media,
      STUDIO_NOW: '2026-10-21T16:00:00.000Z',
    }
    const migrate = capture()
    expect(await runCli(['migrate'], env, migrate)).toBe(1)
    expect(migrate.err.join('\n')).toContain('DATABASE_URL')

    const imported = capture()
    expect(await runCli([
      'import', '--file', video, '--keyframe', still, '--source', 'grok-imagine',
      '--prompt-file', prompt, '--subjects', 'Fenway', '--title', 'Fenway', '--made-on', '2026-10-21',
    ], env, imported)).toBe(0)
    const digest = sha256(clip)
    expect(imported.out).toEqual([
      `imported job=${/job=([0-9a-f-]{36})/.exec(imported.out[0] ?? '')?.[1]} sha256=${digest} width=1920 height=1080 duration=5.000 container=isom codec=H.264 audio=true fps=24 stripped=none faststart=true transport=stub database=pglite`,
    ])
    expect(section).toContain('stripped=none')
    expect(section).toContain('faststart=false')
    expect(section).toContain('database=postgres')
    const job = /job=([0-9a-f-]{36})/.exec(imported.out[0] ?? '')?.[1] ?? ''

    const kept = capture()
    expect(await runCli(['keep', '--job', job, '--answers', CHECKLIST_LINES.map(() => 'clear').join(',')], env, kept)).toBe(0)
    expect(kept.out).toEqual(['kept database=pglite'])
    expect(section).toContain('This prints `kept database=postgres`.')

    const gate = capture()
    expect(await runCli([
      'record-gate', '--answer', 'recorded', '--disclosure', 'pending', '--by', 'unspecified', '--source', 'A-06',
    ], env, gate)).toBe(0)
    expect(gate.out).toEqual(['gate-recorded recordedOn=2026-10-21T16:00:00.000Z database=pglite'])

    const listed = capture()
    expect(await runCli(['list'], env, listed)).toBe(0)
    expect(listed.out.find((line) => line.includes(job))).not.toContain('public_id=')
    expect(listed.out.some((line) => line.includes(job) && line.endsWith('database=pglite'))).toBe(true)

    const published = capture()
    expect(await runCli([
      'publish', '--job', job, '--public-id', 'fenway-wednesday', '--title', 'Fenway', '--position', '1',
    ], env, published)).toBe(0)
    expect(published.out[0]).toBe('published live=true database=pglite storage=stub')
    expect(section).toContain('Publish prints `published live=true database=postgres storage=r2`.')
    const occupied = capture()
    expect(await runCli(['list'], env, occupied)).toBe(0)
    const holding = occupied.out.find((line) => line.includes(job))
    expect(holding).toContain('public_id=fenway-wednesday')
    expect(holding).toContain('position=1')
    expect(section).toContain('A job that is still in the catalog prints `position=` as well.')

    const withdrawn = capture()
    expect(await runCli(['unpublish', '--job', job], env, withdrawn)).toBe(0)
    expect(withdrawn.out).toEqual(['withdrawn removal=merged filesReadable=false database=pglite storage=stub'])
    const again = capture()
    expect(await runCli(['unpublish', '--job', job], env, again)).toBe(0)
    expect(again.out).toEqual(['already-withdrawn database=pglite storage=stub'])
    const released = capture()
    expect(await runCli(['list'], env, released)).toBe(0)
    const freed = released.out.find((line) => line.includes(job))
    expect(freed).toContain('public_id=fenway-wednesday')
    expect(freed).not.toContain('position=')
    expect(section).toContain('A withdrawn clip keeps `public_id=` and drops `position=`')

    const secondVideo = path.join(media, 'second.mp4')
    writeFileSync(secondVideo, syntheticMp4({
      width: 1920,
      height: 1080,
      durationS: 6,
      frameRate: 24,
      audio: true,
      creationTime: Math.floor(Date.parse('2026-10-18T15:00:00.000Z') / 1000) + MAC_EPOCH_SECONDS,
    }))
    const second = capture()
    expect(await runCli([
      'import', '--file', secondVideo, '--keyframe', still, '--source', 'grok-imagine',
      '--prompt-file', prompt, '--subjects', 'Fenway', '--title', 'Second',
    ], env, second)).toBe(0)
    const secondJob = /job=([0-9a-f-]{36})/.exec(second.out[0] ?? '')?.[1] ?? ''
    expect(await runCli(['keep', '--job', secondJob, '--answers', CHECKLIST_LINES.map(() => 'clear').join(',')], env, capture())).toBe(0)
    const deleted = capture()
    expect(await runCli([
      'publish', '--job', secondJob, '--public-id', 'fenway-delete', '--position', '2',
    ], env, deleted)).toBe(0)
    expect(deleted.out[0]).toContain('published')
    const removed = capture()
    expect(await runCli(['unpublish', '--delete', '--job', secondJob], env, removed)).toBe(0)
    expect(removed.out).toEqual(['withdrawn removal=merged filesReadable=false database=pglite storage=stub'])
    const retried = capture()
    expect(await runCli(['retry-delete', '--job', secondJob], env, retried)).toBe(0)
    expect(retried.out).toEqual(['delete-retried filesReadable=false idempotent=true database=pglite storage=stub'])
    expect(section).toContain('delete-retried filesReadable=false idempotent=true database=postgres storage=r2')
  })
})
