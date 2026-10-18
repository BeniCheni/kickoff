import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { DEMO_SENTINEL, parseDemoSocial } from '@kickoff/demo'
import { readCatalog } from '../lib/catalog/read'
import { momentsFor } from '../lib/catalog/request'
import { DemoReadError, readDemo, readDemoFor } from '../lib/demo/read'
import { MomentsRegion } from '../app/moments/region'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))
const socialPath = path.join(repoRoot, 'web/fixtures/demo/social.json')
const severalPath = path.join(repoRoot, 'web/fixtures/catalog/several.json')
const socialText = readFileSync(socialPath, 'utf8')
const social = parseDemoSocial(JSON.parse(socialText))
const env = (over: Partial<{ demo: string; demoFile: string; vercelEnv: string }> = {}) => ({
  demo: undefined as string | undefined,
  demoFile: undefined as string | undefined,
  vercelEnv: undefined as string | undefined,
  ...over,
})

test('the flag off does not open a file, and there is no baked-in path', () => {
  let reads = 0
  expect(readDemo(env({ demoFile: socialPath }), () => { reads += 1; return socialText })).toBeNull()
  expect(readDemo(env({ demo: 'yes', demoFile: socialPath }), () => { reads += 1; return socialText })).toBeNull()
  expect(reads).toBe(0)
  expect(() => readDemo(env({ demo: 'on' }), () => socialText)).toThrow(/not set/)
  const source = readFileSync(fileURLToPath(new URL('../lib/demo/read.ts', import.meta.url)), 'utf8')
    + readFileSync(fileURLToPath(new URL('../lib/demo/load.ts', import.meta.url)), 'utf8')
  expect(source).toContain("import 'server-only'")
  expect(source).not.toContain('fixtures/demo')
  expect(source).not.toContain(DEMO_SENTINEL)
})

test('demo beside production refuses before opening a file', () => {
  let reads = 0
  try {
    readDemo(env({ demo: 'on', vercelEnv: 'production', demoFile: socialPath }), () => { reads += 1; return socialText })
    throw new Error('expected a refusal')
  } catch (error) {
    expect(error).toBeInstanceOf(DemoReadError)
    expect((error as DemoReadError).preview).toBe(false)
  }
  expect(reads).toBe(0)
})

test('a synthetic false file and an unknown reaction key fail the whole read', () => {
  const falseDoc = structuredClone(social)
  falseDoc.synthetic = false as true
  expect(() => readDemo(env({ demo: 'on', demoFile: 'memory' }), () => JSON.stringify(falseDoc))).toThrow(/failed validation/)
  const unknown = structuredClone(social)
  unknown.stats[0]!.reactions = { ...unknown.stats[0]!.reactions, sparkle: 4 } as typeof unknown.stats[0]['reactions']
  expect(() => readDemo(env({ demo: 'on', demoFile: 'memory' }), () => JSON.stringify(unknown))).toThrow(DemoReadError)
  expect(() => parseDemoSocial(unknown)).toThrow()
})

test('fixtures and table do not read demo data, and a missing id has no social layer', () => {
  let reads = 0
  for (const search of ['', '?tab=table', '?tab=fixtures&watch=stub-fenway-one']) {
    expect(readDemoFor(search, env({ demo: 'on', demoFile: socialPath }), () => { reads += 1; return socialText })).toBeNull()
  }
  expect(reads).toBe(0)
  const read = readCatalog({
    catalog: 'stub', stubFile: severalPath, databaseUrl: undefined, vercelEnv: undefined,
  }, file => readFileSync(file, 'utf8'))
  const joined = momentsFor('?tab=moments', () => read, null, social)
  if (joined.state !== 'ready') throw new Error('expected ready')
  expect(joined.social?.['stub-fenway-one']?.views).toBeGreaterThan(0)
  expect(joined.social?.['stub-fenway-one']?.commentCount).toBe(joined.social?.['stub-fenway-one']?.comments.length)
  expect(joined.social?.['not-a-video']).toBeUndefined()
  const plain = momentsFor('?tab=moments', () => read, null, null)
  if (plain.state !== 'ready') throw new Error('expected ready')
  expect(plain.social).toBeUndefined()
  expect(JSON.stringify(plain)).not.toContain(DEMO_SENTINEL)
})

test('demo mode shows the sample label and still hides the sentinel', () => {
  const html = renderToStaticMarkup(
    <MomentsRegion
      demo
      catalogMode="stub"
      moments={{ state: 'ready', preview: true, list: [], detail: null, watchId: null, thumbnails: {}, videoAddress: null }}
    />,
  )
  expect(html).toContain('Stub catalog · synthetic records')
  expect(html).toContain('Sample reactions and comments · made-up viewers, not real ones')
  expect(html).not.toContain(DEMO_SENTINEL)
  expect(html).not.toMatch(/\d[\d,]* views/)
})
