import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { readCatalog } from '../lib/catalog/read'
import { MomentsRegion } from '../app/moments/region'
import { WatchPage } from '../app/moments/watch'
import { readAutoplay, writeAutoplay } from '../app/moments/autoplay'
import { readSound, writeSound } from '../app/moments/sound'
import { PREVIEW_DELAY_MS, previewAllowed } from '../app/moments/preview-gate'
import { mergeWatch } from '../app/moments/watch-url'
import { scrubIgnoredWatch } from '../app/moments/watch-scrub'
import { provenanceLines, recoveryCopy } from '../app/moments/provenance'
import type { CatalogDetailRow } from '@kickoff/catalog'

const fixtureDir = fileURLToPath(new URL('../fixtures/catalog/', import.meta.url))
const readText = (file: string) => readFileSync(file, 'utf8')
const several = readCatalog({
  catalog: 'stub',
  stubFile: path.join(fixtureDir, 'several.json'),
  databaseUrl: undefined,
  vercelEnv: undefined,
}, readText)
const detail = (id: string) => several.details.find(row => row.id === id) as CatalogDetailRow

test('mergeWatch keeps unknown keys and the fragment, and drops watch off Moments', () => {
  expect(mergeWatch('?tab=moments&only=epl&extra=1', '#clip', 'moments', 'stub-fenway-one'))
    .toBe('?tab=moments&only=epl&extra=1&watch=stub-fenway-one#clip')
  expect(mergeWatch('?tab=moments&watch=stub-fenway-one&only=epl', '', 'moments', null))
    .toBe('?tab=moments&only=epl')
  expect(mergeWatch('?tab=moments&watch=stub-fenway-one&lens=broadcast', '#x', 'fixtures', null))
    .toBe('?lens=broadcast#x')
  expect(mergeWatch('?tab=moments&watch=withdrawn-clip', '', 'table', null))
    .toBe('?tab=table')
})

test('an ignored watch is cleared on the next non-Moments URL and kept when opening Moments', () => {
  expect(scrubIgnoredWatch('?tab=table&watch=stub-fenway-one&extra=1#clip', 'http://127.0.0.1/?tab=fixtures&watch=stub-fenway-one#clip'))
    .toBe('/?tab=table&extra=1#clip')
  expect(scrubIgnoredWatch('?lens=broadcast&watch=stub-fenway-one&kept=1#clip', 'http://127.0.0.1/?watch=stub-fenway-one#clip'))
    .toBe('/?lens=broadcast&kept=1#clip')
  expect(scrubIgnoredWatch('?tab=moments&watch=stub-fenway-one&extra=1#clip', 'http://127.0.0.1/'))
    .toBe('?tab=moments&watch=stub-fenway-one&extra=1#clip')
  expect(scrubIgnoredWatch('?tab=table&extra=1#clip', 'http://127.0.0.1/'))
    .toBe('?tab=table&extra=1#clip')
})

test('sound is off unless the stored word is on', () => {
  const memory = new Map<string, string>()
  const storage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => { memory.set(key, value) },
  }
  expect(readSound(storage)).toBe(false)
  storage.setItem('kickoff-moments-sound-v1', 'nope')
  expect(readSound(storage)).toBe(false)
  writeSound(true, storage)
  expect(readSound(storage)).toBe(true)
  expect(memory.get('kickoff-moments-sound-v1')).toBe('on')
  writeSound(false, storage)
  expect(memory.get('kickoff-moments-sound-v1')).toBe('off')
})

test('a card preview is refused for touch, reduced motion, and Save-Data', () => {
  expect(previewAllowed({ hover: true, fine: true, reduce: false, saveData: false })).toBe(true)
  expect(previewAllowed({ hover: false, fine: false, reduce: false, saveData: false })).toBe(false)
  expect(previewAllowed({ hover: true, fine: true, reduce: true, saveData: false })).toBe(false)
  expect(previewAllowed({ hover: true, fine: true, reduce: false, saveData: true })).toBe(false)
  expect(PREVIEW_DELAY_MS).toBe(400)
})

test('autoplay is on unless the stored word is off', () => {
  const memory = new Map<string, string>()
  const storage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => { memory.set(key, value) },
  }
  expect(readAutoplay(storage)).toBe(true)
  storage.setItem('kickoff-moments-autoplay-v1', 'nope')
  expect(readAutoplay(storage)).toBe(true)
  writeAutoplay(false, storage)
  expect(readAutoplay(storage)).toBe(false)
  expect(memory.get('kickoff-moments-autoplay-v1')).toBe('off')
})

test('provenance omits null clauses and keeps the attestation whole', () => {
  const fenway = provenanceLines(detail('stub-fenway-one'), several.list).join('\n')
  expect(fenway).toContain('reviewed and kept')
  expect(fenway).toContain('seed 4102')
  expect(fenway).toContain('12.400 s')
  expect(fenway).toContain('SHA-256 c5c43794\u20262aa9')
  expect(fenway).toContain('Thumbnail K0, the keyframe the clip starts from')
  expect(fenway).toContain('Stub attestation. Not parsed.')
  expect(fenway).not.toContain('recipe')
  expect(fenway).not.toContain('AAC')
  expect(fenway).not.toContain('Prompt expansion')
  expect(fenway).not.toContain('First generation')
  const frank = provenanceLines(detail('stub-frankenstein-one'), several.list).join('\n')
  expect(frank).not.toContain('reviewed and kept')
  expect(frank).not.toContain('seed ')
  expect(frank).not.toContain('SHA-256')
  expect(frank).not.toContain('Thumbnail K0')
  expect(frank).not.toContain('12.400 s')
  expect(frank).toContain('File video/mp4 · 768 \u00d7 432')
})

test('recovery uses D5 sentences and code 4 has no retry wording of its own', () => {
  const network = recoveryCopy(2, 'Stub both cats', true)
  expect(network.heading).toBe('The clip did not arrive.')
  expect(network.body).toContain('Next opens \u201cStub both cats\u201d.')
  expect(network.body).toContain('Autoplay next stopped here. Nothing is skipped past a failure.')
  const unsupported = recoveryCopy(4, null, false)
  expect(unsupported.heading).toBe('No playable file at the published address.')
  expect(unsupported.body).toContain('There is no next video in Beni\u2019s order.')
  expect(unsupported.body).not.toContain('Retry')
})

test('the watch page has one video, no src, and no autoplay attribute', () => {
  const markup = renderToStaticMarkup(
    <WatchPage detail={detail('stub-fenway-one')} list={several.list} search="?tab=moments" address="http://127.0.0.1:5174/stub-storage/moments/stub-fenway-one/video-b1b2c3d4.mp4" />,
  )
  const videos = markup.match(/<video\b[^>]*>/g) ?? []
  expect(videos).toHaveLength(1)
  expect(videos[0]).toContain('preload="none"')
  expect(videos[0]).toContain('playsInline')
  expect(videos[0]).toContain('controls')
  expect(videos[0]).toContain('muted')
  expect(videos[0]).not.toContain('src')
  expect(videos[0]).not.toContain('autoplay')
  expect(markup).toContain('Generated clip: Stub Fenway one')
  expect(markup).toContain('Starting muted.')
  expect(markup).toContain('Unmute')
  expect(markup).toContain('Videos start muted when you open them.')
  expect(markup).not.toContain('The video is not requested until Play.')
  expect(markup).not.toContain('Nothing starts on arrival')
  expect(markup).toContain('Play')
  expect(markup).toContain('Unmute')
  expect(markup).toContain('Copy link')
  expect(markup).toContain('Source &amp; curation')
  expect(markup).toContain('aria-label="Autoplay next"')
  expect(markup).toContain('Stub Frankenstein one')
  expect(markup).not.toContain('Nothing after this one')
  expect(markup).not.toContain('Similar moments')
})

test('the last video says nothing follows it in Beni’s order', () => {
  const markup = renderToStaticMarkup(
    <WatchPage detail={detail('stub-title-fenway')} list={several.list} search="?tab=moments" address={null} />,
  )
  expect(markup).toContain('Nothing after this one in Beni\u2019s order.')
  expect(markup).toContain('Earlier')
})

test('similar moments sit after Up next and Earlier, and a repeated title keeps its own name', () => {
  const markup = renderToStaticMarkup(
    <WatchPage
      detail={detail('stub-fenway-one')}
      list={several.list}
      search="?tab=moments"
      address={null}
      similar={['stub-title-fenway', 'missing-clip', 'stub-fenway-one', 'stub-both-cats', 'stub-both-cats']}
    />,
  )
  const up = markup.indexOf('>Up next<')
  const earlier = markup.indexOf('>Earlier<')
  const similar = markup.indexOf('>Similar moments<')
  expect(up).toBeGreaterThan(-1)
  expect(earlier).toBe(-1)
  expect(similar).toBeGreaterThan(up)
  expect(markup).toContain('Picked by how alike the opening frame and title are.')
  const title = markup.indexOf('id="similar-stub-title-fenway"')
  const both = markup.indexOf('id="similar-stub-both-cats"')
  expect(title).toBeGreaterThan(similar)
  expect(both).toBeGreaterThan(title)
  expect(markup).not.toContain('id="similar-stub-fenway-one"')
  expect(markup).not.toContain('id="similar-missing-clip"')
  expect(markup).toContain('id="up-stub-title-fenway"')
  expect(markup).toContain('aria-labelledby="similar-stub-title-fenway"')
  expect(markup).toContain('aria-labelledby="up-stub-title-fenway"')
  expect(markup.indexOf('id="up-stub-frankenstein-one"')).toBeLessThan(similar)
  expect(markup).not.toContain('score')
  const absent = renderToStaticMarkup(
    <WatchPage detail={detail('stub-fenway-one')} list={several.list} search="?tab=moments" address={null} similar={[]} />,
  )
  expect(absent).not.toContain('Similar moments')
  expect(absent).not.toContain('Picked by how alike')
  const region = readFileSync(fileURLToPath(new URL('../app/moments/region.tsx', import.meta.url)), 'utf8')
  expect(region).toContain('similar={moments.similar}')
})

test('a missing id stays a not-found page and a failed watch read uses the watch sentence', () => {
  const missing = renderToStaticMarkup(
    <MomentsRegion
      catalogMode="stub"
      search="?tab=moments&watch=withdrawn-clip"
      moments={{ state: 'ready', preview: true, list: several.list, detail: null, watchId: 'withdrawn-clip', thumbnails: {}, videoAddress: null }}
    />,
  )
  expect(missing).toContain('No published video has this address.')
  expect(missing).toContain('Stub catalog · synthetic records')
  expect(missing).toContain('href="?tab=moments"')
  expect(missing).not.toContain('<video')
  const failed = renderToStaticMarkup(
    <MomentsRegion
      catalogMode="stub"
      search="?tab=moments&watch=stub-fenway-one"
      moments={{ state: 'unavailable', preview: true, watchId: 'stub-fenway-one' }}
    />,
  )
  expect(failed).toContain('The watch page is unavailable.')
  expect(failed).toContain('The server could not read this video\u2019s record. The cause is unknown from here.')
  expect(failed).not.toContain('The gallery is unavailable.')
})
