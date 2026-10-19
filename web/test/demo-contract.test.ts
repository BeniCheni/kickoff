import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import {
  DEMO_SEED,
  DEMO_SENTINEL,
  REACTION_KEYS,
  DemoContractError,
  generateDemoSocial,
  parseDemoSocial,
} from '@kickoff/demo'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))
const fixtureDir = path.join(repoRoot, 'web/fixtures/catalog')

function stubIds(): string[] {
  const ids: string[] = []
  for (const name of readdirSync(fixtureDir).filter(entry => entry.endsWith('.json')).sort()) {
    const body = JSON.parse(readFileSync(path.join(fixtureDir, name), 'utf8')) as { videos?: { id?: string }[] }
    for (const video of body.videos ?? []) {
      if (typeof video.id === 'string') ids.push(video.id)
    }
  }
  return [...new Set(ids)].sort()
}

test('the seeded generator matches the committed sample and stays modest', () => {
  const ids = stubIds()
  expect(ids).toEqual([
    'stub-both-cats',
    'stub-fenway-one',
    'stub-frankenstein-one',
    'stub-missing-thumb',
    'stub-only-one',
    'stub-title-fenway',
  ])
  const social = generateDemoSocial(ids, DEMO_SEED)
  const committed = parseDemoSocial(JSON.parse(readFileSync(path.join(repoRoot, 'web/fixtures/demo/social.json'), 'utf8')))
  expect(social).toEqual(committed)
  expect(social.synthetic).toBe(true)
  expect(social.sentinel).toBe(DEMO_SENTINEL)
  expect(social.stats.map(row => row.video_id)).toEqual(ids)
  for (const row of social.stats) {
    expect(row.views).toBeGreaterThanOrEqual(280)
    expect(row.views).toBeLessThanOrEqual(2400)
    expect(Object.keys(row.reactions)).toEqual([...REACTION_KEYS])
    expect(row.comment_count).toBe(social.comments.filter(comment => comment.video_id === row.video_id).length)
  }
  expect(social.comments.some(comment => comment.parent_id !== null)).toBe(true)
  expect(social.users.every(user => user.handle.startsWith('@'))).toBe(true)
  expect(JSON.stringify(social)).not.toMatch(/Beni|YouTube|Manchester|Messi/i)
})

test('the same seed repeats and a different seed does not', () => {
  const ids = stubIds()
  expect(generateDemoSocial(ids)).toEqual(generateDemoSocial(ids, DEMO_SEED))
  expect(generateDemoSocial(ids, DEMO_SEED).stats[0]?.views).not.toBe(generateDemoSocial(ids, DEMO_SEED + 1).stats[0]?.views)
})

test('a bad row fails the whole document', () => {
  const social = generateDemoSocial(stubIds())
  const broken = structuredClone(social) as unknown as {
    synthetic: boolean
    stats: { reactions: Record<string, number>; comment_count: number }[]
    comments: { user_id: string; parent_id: string | null; video_id: string }[]
    users: { avatar: { emoji: string } }[]
    extra?: boolean
  }
  broken.synthetic = false
  expect(() => parseDemoSocial(broken)).toThrow(DemoContractError)
  const unknown = structuredClone(social)
  unknown.stats[0]!.reactions = { ...unknown.stats[0]!.reactions, sparkle: 1 } as typeof unknown.stats[0]['reactions']
  expect(() => parseDemoSocial(unknown)).toThrow(DemoContractError)
  const mismatch = structuredClone(social)
  mismatch.stats[0]!.comment_count += 1
  expect(() => parseDemoSocial(mismatch)).toThrow(DemoContractError)
  const stranger = structuredClone(social)
  stranger.comments[0]!.user_id = 'demo-user-missing'
  expect(() => parseDemoSocial(stranger)).toThrow(DemoContractError)
  const nested = structuredClone(social)
  const reply = nested.comments.find(comment => comment.parent_id !== null)
  const top = nested.comments.find(comment => comment.parent_id === null && comment.video_id === reply?.video_id)
  if (!reply || !top) throw new Error('expected a reply')
  reply.parent_id = nested.comments.find(comment => comment.parent_id !== null && comment.id !== reply.id)?.id ?? reply.id
  expect(() => parseDemoSocial(nested)).toThrow(/failed validation/)
  const extra = { ...social, audience: true }
  expect(() => parseDemoSocial(extra)).toThrow(DemoContractError)
  const photo = structuredClone(social)
  photo.users[0]!.avatar = { emoji: '😺', palette: 0, src: 'https://example.test/a.png' } as typeof photo.users[0]['avatar']
  expect(() => parseDemoSocial(photo)).toThrow(DemoContractError)
})

test('the demo package source does not import the app, the reader, or the studio', () => {
  const dir = path.join(repoRoot, 'packages/kickoff-demo/src')
  const specifiers = readdirSync(dir).flatMap(name => {
    const source = readFileSync(path.join(dir, name), 'utf8')
    return [...source.matchAll(/\b(?:import|export)\s+(?:type\s+)?['"]([^'"]+)['"]|\b(?:import|export)\s+(?:type\s+)?[^;'"]*?\sfrom\s*['"]([^'"]+)['"]|\b(?:import|require)\s*\(\s*['"]([^'"]+)['"]/g)]
      .map(match => match[1] ?? match[2] ?? match[3] ?? '')
  })
  expect(specifiers).toEqual(["zod"])
})
