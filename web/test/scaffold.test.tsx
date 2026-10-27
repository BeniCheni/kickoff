import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { clockSnapshotAt } from '../../src/lib/clock'
import { RequestClock } from '../../src/lib/RequestClock'
import { Shell } from '../app/shell'

test('the shell header carries the root version and renders Fixtures', () => {
  const html = renderToStaticMarkup(
    <RequestClock snapshot={clockSnapshotAt(Date.parse('2026-09-14T16:00:00Z'))}>
      <Shell search="" />
    </RequestClock>,
  )
  expect(html).toContain('Kickoff')
  expect(html).toContain('Brooklyn · ET')
  expect(html).toContain('Filters')
  expect(html).not.toContain('Not ported yet')
  expect(html).toContain('v0.5.3')
  expect(html).not.toContain('v0.0.0')
  expect(html).not.toMatch(/<video|<iframe|<img/)
})
