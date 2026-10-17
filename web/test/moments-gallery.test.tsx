import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { readCatalog } from '../lib/catalog/read'
import { Gallery } from '../app/moments/gallery'
import { beniOrder, matchingRows, newestOrder, shuffleIds } from '../app/moments/order'
import { durationClock, generatedDate } from '../app/moments/format'

const fixture = path.join(fileURLToPath(new URL('../fixtures/catalog/', import.meta.url)), 'several.json')
const readText = (file: string) => readFileSync(file, 'utf8')
const list = readCatalog({
  catalog: 'stub', stubFile: fixture, databaseUrl: undefined, vercelEnv: undefined,
}, readText).list

function html(props: Partial<Parameters<typeof Gallery>[0]> = {}) {
  return renderToStaticMarkup(<Gallery list={list} search="?tab=moments&only=epl&extra=1" storageOrigin="http://127.0.0.1:5174/stub-storage" {...props} />)
}

function article(markup: string, id: string) {
  const start = markup.indexOf(`data-moment="${id}"`)
  return markup.slice(start, markup.indexOf('</article>', start))
}

test('dates and durations omit a null duration and use the Brooklyn calendar date', () => {
  expect(generatedDate('2026-10-01T16:00:00.000Z')).toBe('1 Oct 2026')
  expect(durationClock(null)).toBeNull()
  expect(durationClock('12.400')).toBe('0:12')
  expect(durationClock('8')).toBe('0:08')
})

test('Beni’s order is position then id, and newest breaks a shared instant that way', () => {
  expect(beniOrder(list).map(row => row.id)).toEqual([
    'stub-fenway-one', 'stub-frankenstein-one', 'stub-both-cats', 'stub-title-fenway',
  ])
  expect(newestOrder(list).map(row => row.id)).toEqual([
    'stub-frankenstein-one', 'stub-both-cats', 'stub-title-fenway', 'stub-fenway-one',
  ])
})

test('a title of Fenway with no subject matches neither subject filter', () => {
  const fenway = matchingRows(list, 'Fenway', false, new Set())
  expect(fenway.map(row => row.id).sort()).toEqual(['stub-both-cats', 'stub-fenway-one'])
  const frank = matchingRows(list, 'Frankenstein', false, new Set())
  expect(frank.map(row => row.id).sort()).toEqual(['stub-both-cats', 'stub-frankenstein-one'])
  expect(matchingRows(list, 'all', false, new Set())).toHaveLength(4)
})

test('the gallery renders D9’s head, filters, and cards without counts on a card', () => {
  const markup = html()
  expect(markup).toContain('Kickoff Studio · generated video')
  expect(markup).toContain('Fenway and Frankenstein.')
  expect(markup).toContain('4 of 4 videos')
  expect(markup).toContain('Generated in the Studio · never a match still')
  expect(markup).toContain('Find a video')
  expect(markup).toContain('4 / 4')
  expect(markup).toContain('All subjects')
  expect(markup).toContain('A video with both cats matches either subject. All subjects shows every video.')
  expect(markup).toContain('Newest uses the date generated, read from the record. Ties follow Beni’s order. Every video here is generated; the Generated label is never filtered away.')
  expect(markup).toContain('Shuffle remaining')
  expect(markup).toContain('Undo shuffle')
  expect(markup).toContain('Restore Beni’s order')
  expect(markup).toContain('Beni’s order for the remainder')
  expect(markup).toContain('disabled')
  const fenway = article(markup, 'stub-fenway-one')
  expect(fenway).toContain('Generated')
  expect(fenway).toContain('0:12')
  expect(fenway).toContain('Generated 1 Oct 2026')
  expect(fenway).toContain('Synthetic note for the stub.')
  expect(fenway).toContain('aspect-ratio:768 / 480')
  expect(fenway).toContain('watch=stub-fenway-one')
  expect(fenway).toContain('only=epl')
  expect(fenway).toContain('extra=1')
  expect(fenway).not.toContain('views')
  const frank = article(markup, 'stub-frankenstein-one')
  expect(frank).toContain('Generated 5 Oct 2026')
  expect(frank).not.toContain(' · 0:')
  expect(frank).not.toContain('Synthetic note')
  expect(frank).toContain('aspect-ratio:768 / 432')
  const titled = article(markup, 'stub-title-fenway')
  expect(titled).not.toContain('aspect-ratio')
  expect(markup).not.toContain('No videos match.')
})

test('an empty catalog is 0 of 0 videos and not the no-results copy', () => {
  const markup = renderToStaticMarkup(<Gallery list={[]} search="" storageOrigin={null} />)
  expect(markup).toContain('0 of 0 videos')
  expect(markup).toContain('0 / 0')
  expect(markup).not.toContain('No videos match.')
  expect(markup).not.toContain('<article')
})

test('filters that match nothing use the no-results copy and 0 of m', () => {
  const markup = html({
    initialSavedOnly: true,
    initialSaved: { ids: [], persistence: 'local', reason: null },
    freezeSaved: true,
  })
  expect(markup).toContain('No videos match.')
  expect(markup).toContain('No video is active. Clear filters to browse the gallery.')
  expect(markup).toContain('Clear filters')
  expect(markup).toContain('0 of 4 videos')
  expect(markup).toContain('0 / 4')
  expect(markup).not.toContain('<article')
})

test('a refused save shows the visit-only notice', () => {
  const markup = html({
    initialSaved: { ids: ['stub-fenway-one'], persistence: 'visit-only', reason: 'read-refused' },
    freezeSaved: true,
  })
  expect(markup).toContain('Saved for this visit only. Browser storage refused the update.')
  expect(article(markup, 'stub-fenway-one')).toContain('Saved reference · visit only')
  expect(article(markup, 'stub-both-cats')).toContain('Not saved · visit only')
})

test('shuffle permutes and can be recognised', () => {
  const ids = ['a', 'b', 'c', 'd']
  const shuffled = shuffleIds(ids, () => 0)
  expect([...shuffled].sort()).toEqual([...ids].sort())
  expect(shuffled).not.toEqual(ids)
})
