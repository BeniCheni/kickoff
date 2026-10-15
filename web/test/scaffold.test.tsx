import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { clockSnapshotAt } from '../../src/lib/clock'
import { RequestClock } from '../../src/lib/RequestClock'
import { Shell } from '../app/shell'

test('the only page identifies itself as an unreleased scaffold', () => {
  const html = renderToStaticMarkup(
    <RequestClock snapshot={clockSnapshotAt(Date.parse('2026-09-14T16:00:00Z'))}>
      <Shell search="" />
    </RequestClock>,
  )
  expect(html).toContain('unreleased scaffold')
  expect(html).toContain('It shows no fixtures.')
  expect(html).not.toMatch(/<video|<iframe|<img|v\d+\.\d+\.\d+/)
})
