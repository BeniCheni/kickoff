import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { expect, test } from 'vitest'
import { mappedMediaName } from '../lib/catalog/media'
import { openMapped } from '../lib/catalog/serve'

test('a mapped name cannot leave the media directory', () => {
  expect(mappedMediaName({ media: { 'moments/a.jpg': '../secret.jpg' } }, 'moments/a.jpg')).toBeNull()
  expect(mappedMediaName({ media: { 'moments/a.jpg': 'thumb-16x10.jpg' } }, 'moments/a.jpg')).toBe('thumb-16x10.jpg')
  expect(mappedMediaName({ media: {} }, 'moments/missing.jpg')).toBeNull()
})

test('stub media is unread unless the flag is on', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'kickoff-stub-'))
  const catalog = path.join(root, 'several.json')
  const media = path.join(root, 'media')
  mkdirSync(media)
  writeFileSync(catalog, JSON.stringify({ media: { 'moments/a.jpg': 'thumb.jpg', 'site:stub-a': 'thumb.jpg' } }))
  writeFileSync(path.join(media, 'thumb.jpg'), Buffer.from([0xff, 0xd8]))
  const readText = (file: string) => readFileSync(file, 'utf8')
  const readBytes = (file: string) => readFileSync(file)
  let reads = 0
  const counting = (file: string) => { reads += 1; return readText(file) }
  expect(openMapped({ catalog: undefined, vercelEnv: undefined, stubFile: catalog }, 'moments/a.jpg', counting, readBytes)).toBeNull()
  expect(reads).toBe(0)
  expect(openMapped({ catalog: 'stub', vercelEnv: 'production', stubFile: catalog }, 'moments/a.jpg', counting, readBytes)).toBeNull()
  expect(reads).toBe(0)
  const opened = openMapped({ catalog: 'stub', vercelEnv: undefined, stubFile: catalog }, 'moments/a.jpg', readText, readBytes)
  expect(opened?.type).toBe('image/jpeg')
  expect(opened?.bytes.length).toBe(2)
})
