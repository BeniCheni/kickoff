import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { clockSnapshotAt } from '../../src/lib/clock'
import { TABLE_LEAGUES } from '../../src/lib/competitions'
import { RequestClock } from '../../src/lib/RequestClock'
import { STANDINGS } from '../../src/lib/standings'
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

// The review of PR #352, question 11, approved on 21 Nov 2026. The Next reader draws the Table's
// foot on the server, so the sentence is held in the markup a reader is sent, letter for letter.
test('the Table’s foot ends on the dot sentence as approved, in the server markup of every league the snapshot holds a table for', () => {
  const DOT = 'A dot is an empty slot: the snapshot holds fewer than five finished results for that club in this competition.'
  const held = TABLE_LEAGUES.filter((league) => (STANDINGS.leagues[league] ?? []).length > 0)
  expect(held.length).toBeGreaterThan(0)
  for (const league of held) {
    const markup = html(`?tab=table&league=${league}`)
    const paragraphs = [...markup.matchAll(/<p class="page-foot-copy">([\s\S]*?)<\/p>/g)].map((match) => match[1]!.replaceAll('&#x27;', '\'').replaceAll('&amp;', '&'))
    expect(paragraphs, league).toHaveLength(2)
    expect(paragraphs[1], league).toBe(`Zones & key, opened, reads: form runs oldest to newest. ${DOT}`)
    // Said once in what the server sends, and in no other words.
    expect(markup.split(/a dot is/i).length - 1, league).toBe(1)
  }
})
