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

function checkedLens(markup: string): string {
  const match = markup.match(/aria-checked="true"[\s\S]*?>(Poster|Ledger)</)
  if (!match?.[1]) throw new Error('server markup has no checked lens')
  return match[1]
}

test('Fixtures and Table render from the shared pages', () => {
  const fixtures = html('')
  expect(fixtures).toContain('Filters')
  expect(fixtures).toContain('Filters, 14 of 14 competitions shown')
  expect(fixtures).not.toContain('data-ticker')
  expect(fixtures).not.toContain('data-table-picker')

  const legacyView = html('?view=month&only=pl&date=2026-09-20')
  expect(legacyView).not.toContain('Monthly')
  expect(legacyView).toMatch(/<button[^>]*class="week-today"[^>]*>Today<\/button>/)
  expect(legacyView).toMatch(/1 of \d+ competitions shown/)
  expect(legacyView).toContain('Premier League')

  const table = html('?tab=table&league=bundesliga')
  expect(table).toContain('data-table-picker')
  expect(table).toContain('Bundesliga')
  expect(table).toContain('Pts')
  expect(table).not.toContain('Filters')

  for (const search of ['', '?lens=ledger', '?lens=broadcast', '?view=month']) {
    const cleared = html(search)
    expect(cleared).toContain('Filters')
    expect(cleared).not.toContain('data-ticker')
    expect(cleared).not.toContain('Where to Watch')
    expect(cleared).not.toContain('📺')
    expect(cleared).not.toMatch(/>Weekly<|>Monthly</)
    // The shell sets no data-lens attribute in server markup. The checked radio is the
    // decode a reader gets: the retired lens is Poster, and ledger stays Ledger.
    expect(checkedLens(cleared)).toBe(search.includes('lens=ledger') ? 'Ledger' : 'Poster')
    expect(cleared.indexOf('>Poster<')).toBeLessThan(cleared.indexOf('>Ledger<'))
  }

  // watch stays unknown: the shell still renders Fixtures and does not grow a watch page.
  const watch = html('?watch=abc&kept=1')
  expect(watch).toContain('Filters')
  expect(watch).not.toContain('Not ported yet')
  expect(watch).not.toContain('Privacy')
  expect(watch).not.toContain('/privacy')
})
