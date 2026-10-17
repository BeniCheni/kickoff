import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { clockSnapshotAt } from '../../src/lib/clock'
import { RequestClock } from '../../src/lib/RequestClock'
import { Shell } from '../app/shell'
import { MomentsRegion } from '../app/moments/region'
import type { MomentsPayload } from '../lib/catalog/types'

const snapshot = clockSnapshotAt(Date.parse('2026-09-14T16:00:00Z'))
const unavailable = 'The gallery is unavailable.'
const cause = 'The server could not read the list of published videos. The cause is unknown from here.'
const body = 'Nothing is shown from memory. The site\u2019s fallback thumbnails are keyed to that list, and a video withdrawn since the last deploy must not reappear, so no card is drawn without its record.'

test('moments without a catalog shows the unavailable state and no cards', () => {
  const html = renderToStaticMarkup(
    <RequestClock snapshot={snapshot}>
      <Shell search="?tab=moments" />
    </RequestClock>,
  )
  expect(html).toContain(unavailable)
  expect(html).toContain(cause)
  expect(html).toContain(body)
  expect(html).toContain('Try again')
  expect(html).not.toContain('Preview catalog')
  expect(html).not.toContain('No moments curated yet')
  expect(html).not.toMatch(/<video|<img/)
})

test('a stub read shows Preview catalog and the count, including the empty catalog', () => {
  const ready: MomentsPayload = {
    state: 'ready',
    preview: true,
    list: [],
    detail: null,
    watchId: null,
    storageOrigin: null,
  }
  const html = renderToStaticMarkup(<MomentsRegion moments={ready} catalogMode="stub" />)
  expect(html).toContain('Preview catalog')
  expect(html).toContain('data-catalog="stub"')
  expect(html).toContain('Fenway and Frankenstein.')
  expect(html).toContain('0 of 0 videos')
  expect(html).not.toContain(unavailable)
  expect(html).not.toMatch(/<video|<img/)
})

test('preview outside stub mode renders unavailable instead of the records', () => {
  const ready: MomentsPayload = {
    state: 'ready',
    preview: true,
    list: [{
      id: 'stub-fenway-one',
      title: 'Stub Fenway one',
      position: 1,
      published_at: '2026-10-02T18:30:00.000Z',
      thumbnail_bucket: null,
      thumbnail_object_path: null,
      mime: 'video/mp4',
      width: 768,
      height: 480,
      duration_s: null,
      generated_at: '2026-10-01T16:00:00.000Z',
      editorial_note: null,
      subjects: ['Fenway'],
    }],
    detail: null,
    watchId: null,
    storageOrigin: null,
  }
  const html = renderToStaticMarkup(<MomentsRegion moments={ready} catalogMode="closed" />)
  expect(html).toContain(unavailable)
  expect(html).not.toContain('Preview catalog')
  expect(html).not.toContain('Stub Fenway one')
  expect(html).not.toContain('0 of 0 videos')
  expect(html).not.toContain('1 of 1 videos')
})

test('a stub failure still shows Preview catalog', () => {
  const html = renderToStaticMarkup(
    <MomentsRegion moments={{ state: 'unavailable', preview: true, watchId: null }} catalogMode="stub" />,
  )
  expect(html).toContain('Preview catalog')
  expect(html).toContain(unavailable)
  expect(html).not.toMatch(/<video|<img/)
})
