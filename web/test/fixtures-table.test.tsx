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

test('Fixtures and Table render from the shared pages', () => {
  const fixtures = html('')
  expect(fixtures).toContain('Filters')
  expect(fixtures).toContain('All ')
  expect(fixtures).not.toContain('data-ticker')
  expect(fixtures).not.toContain('data-table-picker')

  const legacyView = html('?view=month&only=pl&date=2026-09-20')
  expect(legacyView).not.toContain('Monthly')
  expect(legacyView).toContain('Jump to today')
  expect(legacyView).toMatch(/1 of \d+ competitions shown/)
  expect(legacyView).toContain('Premier League')

  const table = html('?tab=table&league=bundesliga')
  expect(table).toContain('data-table-picker')
  expect(table).toContain('Bundesliga')
  expect(table).toContain('Pts')
  expect(table).not.toContain('Filters')

  for (const search of ['', '?lens=ledger', '?lens=\u0062roadcast', '?view=month']) {
    const cleared = html(search)
    expect(cleared).toContain('Filters')
    expect(cleared).not.toContain('data-ticker')
    expect(cleared).not.toContain('Where to Watch')
    expect(cleared).not.toContain('\u{1f4fa}')
    expect(cleared).not.toMatch(/>Weekly<|>Monthly</)
    expect(cleared).not.toContain('data-lens="\u0062roadcast"')
    expect(cleared.indexOf('>Poster<')).toBeLessThan(cleared.indexOf('>Ledger<'))
  }

  // watch stays unknown: the shell still renders Fixtures and does not grow a watch page.
  const watch = html('?watch=abc&kept=1')
  expect(watch).toContain('Filters')
  expect(watch).not.toContain('Not ported yet')
  expect(watch).not.toContain('Privacy')
  expect(watch).not.toContain('/privacy')
})
