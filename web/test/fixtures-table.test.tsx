import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { clockSnapshotAt } from '../../src/lib/clock'
import { RequestClock } from '../../src/lib/RequestClock'
import { Shell } from '../app/shell'

const snapshot = clockSnapshotAt(Date.parse('2026-09-14T16:00:00Z'))

function html(search: string) {
  return renderToStaticMarkup(
    <RequestClock snapshot={snapshot}>
      <Shell search={search} />
    </RequestClock>,
  )
}

test('Fixtures, Table and the Broadcast ticker render from the shared pages', () => {
  const fixtures = html('')
  expect(fixtures).toContain('Filters')
  expect(fixtures).toContain('All ')
  expect(fixtures).not.toContain('data-ticker')
  expect(fixtures).not.toContain('data-table-picker')

  const month = html('?view=month&only=pl&date=2026-09-20')
  expect(month).toContain('Monday')
  expect(month).toMatch(/1 of \d+ competitions shown/)
  expect(month).toContain('Premier League')

  const table = html('?tab=table&league=bundesliga')
  expect(table).toContain('data-table-picker')
  expect(table).toContain('Bundesliga')
  expect(table).toContain('Pts')
  expect(table).not.toContain('Filters')

  const broadcast = html('?lens=broadcast')
  expect(broadcast).toContain('data-ticker=')
  expect(broadcast).toContain('Filters')

  // watch stays unknown: the shell still renders Fixtures and does not grow a watch page.
  const watch = html('?watch=abc&kept=1')
  expect(watch).toContain('Filters')
  expect(watch).not.toContain('Not ported yet')
})
