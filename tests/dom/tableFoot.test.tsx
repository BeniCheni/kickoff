import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { COMPETITIONS, TABLE_LEAGUES, type CompetitionKey } from '../../src/lib/competitions'
import { FIXTURES, META, SYNC_STAMP } from '../../src/lib/fixtures'
import { STANDINGS, tableFor } from '../../src/lib/standings'
import { todayIso } from '../../src/lib/time'
import { PageFoot } from '../../src/components/PageFoot'
import { TablePage } from '../../src/components/TablePage'
import { primeClock } from './rig'
import { finishedFor, holdSnapshot, specimenId, specimenTable, withFiveFinishedRoundsEach, withoutUclTable } from './tableSnapshots'

/**
 * The foot of the Table: the scorch, then the black foot and its paragraphs. The last
 * paragraph makes two claims about the page above it, so each is held against the page:
 * the key does say form runs oldest to newest, and a dot is drawn for exactly the slots the
 * snapshot has no finished result for.
 *
 * None of it may depend on what today's sync happens to hold. A snapshot without a Champions
 * League table is a valid one, and so is one where no club is short of five results (the review
 * of PR #352, finding 2). So the provider's rows are compared club by club in whatever leagues
 * the snapshot holds, each of those two snapshots is set in memory and run on its own, and the
 * short and the full strip are specimens (tests/dom/tableSnapshots.ts).
 */
let release: (() => void) | undefined
let restore: (() => void) | undefined
const unmount = () => { cleanup(); release?.(); release = undefined }
afterEach(() => { unmount(); restore?.(); restore = undefined })

function mount(league: CompetitionKey) {
  window.history.replaceState(null, '', `/?league=${league}`)
  const now = new Date(META.lastSyncAt)
  release = primeClock(now)
  const rows = tableFor(league, todayIso(now), now.toISOString())
  return { ...render(<TablePage />), rows }
}

const FIRST = 'Table read from ESPN\'s standings feed by npm run sync, never recomputed locally. Form and next fixture join to the fixtures snapshot.'
// String 8's third sentence, less the clause that is not true of the app (see the cross-competition case below).
const LAST = 'Zones & key, opened, reads: form runs oldest to newest. A dot is an empty slot.'

describe('the Table’s foot', () => {
  it('is black stock: the provenance line, then its paragraphs, the last being string 8’s third sentence', () => {
    const { container } = mount('pl')
    const foot = container.querySelector('footer.page-foot') as HTMLElement
    expect(foot.getAttribute('data-stock')).toBe('black')
    expect(foot.firstElementChild!.classList.contains('provenance')).toBe(true)
    expect(foot.firstElementChild!.textContent).toContain(`SYNCED ${SYNC_STAMP}`)
    expect([...foot.querySelectorAll('p.page-foot-copy')].map((paragraph) => paragraph.textContent)).toEqual([FIRST, LAST])
    // Nothing in the foot is a control, and nothing in it speaks of a photograph the cover does not have.
    expect(foot.querySelector('button, a, input, [tabindex]')).toBeNull()
    expect(foot.textContent).not.toMatch(/photograph|ILLUSTRATIVE/i)
  })

  it('ends the page: the scorch under the last row, the foot under the scorch, and nothing after', () => {
    const { container } = mount('pl')
    const register = container.querySelector('.register') as HTMLElement
    const [table, scorch, foot] = [...register.children].slice(-3)
    expect(table!.getAttribute('data-table')).toBe('desktop')
    expect(scorch!.className).toBe('register-scorch')
    expect(foot!.tagName).toBe('FOOTER')
  })

  it.each(['pl', 'ucl'] as const)('draws the scorch as one empty element a reader cannot reach: no text on it, under it or in it (%s)', (league) => {
    restore = holdSnapshot()
    // The long table is a specimen: whether the provider supplies one today is not this test's to assume.
    if (league === 'ucl') STANDINGS.leagues.ucl = specimenTable('ucl')
    const { container, rows } = mount(league)
    expect(rows).toHaveLength(league === 'ucl' ? 36 : 20)
    const scorch = container.querySelector('.register-scorch') as HTMLElement
    expect(container.querySelectorAll('.register-scorch')).toHaveLength(1)
    expect(scorch.getAttribute('aria-hidden')).toBe('true')
    expect(scorch.childNodes).toHaveLength(0)
    expect(scorch.getAttribute('style')).toBeNull()
    expect(scorch.tagName).toBe('DIV')
  })

  it('has no foot and no scorch where the snapshot holds no table', () => {
    const held = STANDINGS.leagues.seriea
    STANDINGS.leagues.seriea = []
    try {
      const { container } = mount('seriea')
      expect(screen.getByText(/No table in the snapshot for Serie A/)).toBeTruthy()
      expect(container.querySelector('.page-foot, .register-scorch')).toBeNull()
    } finally { STANDINGS.leagues.seriea = held! }
  })

  it('draws the empty page, and says why, where the provider no longer supplies a Champions League table', () => {
    restore = holdSnapshot()
    withoutUclTable()
    const { container } = mount('ucl')
    expect(container.querySelector('[data-empty-table]')!.textContent).toBe(`No table in the snapshot for ${COMPETITIONS.ucl.name} — the provider no longer supplies the configured league-phase table.`)
    expect(container.querySelector('[data-table], .page-foot, .register-scorch, .zones-key-bar, .form-pips')).toBeNull()
    // The cover and the six tabs stand, and the tab pressed is the league that was asked for.
    expect(container.querySelector('.register-cover-line')!.textContent).toBe(COMPETITIONS.ucl.name)
    const tabs = [...container.querySelectorAll('[data-table-picker] button')]
    expect(tabs).toHaveLength(6)
    expect(tabs.filter((tab) => tab.getAttribute('aria-pressed') === 'true').map((tab) => tab.textContent)).toEqual([COMPETITIONS.ucl.name])
    unmount()
    // The five leagues the snapshot does hold are drawn whole: both tables, the scorch and the foot.
    for (const league of TABLE_LEAGUES.filter((key) => key !== 'ucl')) {
      const page = mount(league)
      expect(page.rows.length, league).toBeGreaterThan(0)
      expect(page.container.querySelectorAll('[data-table]'), league).toHaveLength(2)
      expect(page.container.querySelectorAll('.register-scorch, footer.page-foot'), league).toHaveLength(2)
      expect(page.container.querySelector('[data-empty-table]'), league).toBeNull()
      unmount()
    }
  })
})

/**
 * Every strip the page draws, against the snapshot in memory: five slots, a dot for each of the
 * five this competition's fixtures hold no finished result for, the letters in the row's own
 * order. A league the snapshot holds no table for has no provider rows to compare, and has to
 * draw the empty page instead of a strip.
 */
function everyStripAgainstTheSnapshot() {
  const seen = { clubs: 0, short: 0, full: 0, withoutTable: [] as CompetitionKey[] }
  for (const league of TABLE_LEAGUES) {
    const { container, rows } = mount(league)
    if (!rows.length) {
      expect(container.querySelector('[data-empty-table]'), league).not.toBeNull()
      expect(container.querySelector('.form-pips'), league).toBeNull()
      seen.withoutTable.push(league)
    } else {
      const strips = [...container.querySelectorAll('[data-table="mobile"] [data-table-row] .form-pips')]
      expect(strips, league).toHaveLength(rows.length)
      rows.forEach((row, i) => {
        // The club's finished results in the snapshot, counted here and not taken from the row.
        const finished = FIXTURES.filter((fixture) => fixture.competition === league && fixture.status === 'full_time' && fixture.result
          && [fixture.home.sourceId, fixture.away.sourceId].includes(row.teamId)).length
        const pips = [...strips[i]!.querySelectorAll('.form-pip')].map((pip) => pip.textContent)
        expect(pips, row.name).toHaveLength(5)
        expect(pips.filter((pip) => pip === '·'), row.name).toHaveLength(5 - Math.min(5, finished))
        // Oldest to newest: the letters are the row's form in its own order, and the dots come after.
        expect(pips.slice(0, row.form.length), row.name).toEqual(row.form)
        seen.clubs += 1
        if (finished < 5) seen.short += 1
        else seen.full += 1
      })
    }
    unmount()
  }
  return seen
}

/** The pips of one specimen club's strip on the phone table, as drawn. */
const strip = (container: HTMLElement, rank: number) => [...container.querySelectorAll(`[data-table="mobile"] [data-table-row="${specimenId(rank)}"] .form-pip`)].map((pip) => pip.textContent)

describe('what the foot’s last sentence says of the page', () => {
  it.each(['bundesliga', 'ucl'] as const)('“form runs oldest to newest” is what the opened key reads (%s)', (league) => {
    restore = holdSnapshot()
    if (league === 'ucl') STANDINGS.leagues.ucl = specimenTable('ucl')
    const { container } = mount(league)
    fireEvent.click(screen.getByRole('button', { name: 'Zones & key' }))
    expect(container.querySelector('.zones-key-panel')!.textContent).toContain('Form results oldest to newest')
  })

  it('“a dot is an empty slot” is what every strip draws from the committed snapshot, club by club', () => {
    const seen = everyStripAgainstTheSnapshot()
    // The comparison reached the provider's rows. How many of them are short is the snapshot's business.
    expect(seen.clubs).toBeGreaterThan(0)
    expect(seen.short + seen.full).toBe(seen.clubs)
  })

  it('holds on a snapshot without a Champions League table: five leagues compared, and the sixth is the empty page', () => {
    restore = holdSnapshot()
    withoutUclTable()
    const seen = everyStripAgainstTheSnapshot()
    expect(seen.withoutTable).toEqual(['ucl'])
    expect(seen.clubs).toBe(TABLE_LEAGUES.filter((key) => key !== 'ucl').reduce((sum, key) => sum + STANDINGS.leagues[key]!.length, 0))
  })

  it('holds once every club has five finished results: every strip is five letters, and none draws a dot', () => {
    restore = holdSnapshot()
    withFiveFinishedRoundsEach()
    const seen = everyStripAgainstTheSnapshot()
    expect(seen.clubs).toBeGreaterThan(0)
    expect(seen).toMatchObject({ short: 0, full: seen.clubs })
  })

  it('draws the short strip and the full strip from specimens: none, two, five and seven finished results', () => {
    restore = holdSnapshot()
    STANDINGS.leagues.pl = specimenTable('pl')
    FIXTURES.splice(0, FIXTURES.length,
      ...finishedFor(specimenId(2), 'pl', ['W', 'L']),
      ...finishedFor(specimenId(3), 'pl', ['W', 'D', 'L', 'W', 'D']),
      ...finishedFor(specimenId(4), 'pl', ['L', 'L', 'W', 'D', 'L', 'W', 'W']),
    )
    const { container } = mount('pl')
    expect(strip(container, 1)).toEqual(['·', '·', '·', '·', '·'])
    expect(strip(container, 2)).toEqual(['W', 'L', '·', '·', '·'])
    expect(strip(container, 3)).toEqual(['W', 'D', 'L', 'W', 'D'])
    // Seven results: the latest five, still oldest to newest, and no slot left over.
    expect(strip(container, 4)).toEqual(['W', 'D', 'L', 'W', 'W'])
  })

  // The review of PR #352, finding 7. On the snapshot it read, 59 of 132 rows drew a dot for a
  // club the snapshot held five or more finished results for, Arsenal in both of its tables.
  it('counts a slot against this competition alone: six finished results across two competitions still draw three dots', () => {
    restore = holdSnapshot()
    STANDINGS.leagues.pl = specimenTable('pl')
    STANDINGS.leagues.ucl = specimenTable('ucl')
    FIXTURES.splice(0, FIXTURES.length,
      ...finishedFor(specimenId(5), 'pl', ['W', 'W']),
      ...finishedFor(specimenId(5), 'ucl', ['L', 'D', 'L', 'L']),
    )
    const club = (fixture: (typeof FIXTURES)[number]) => [fixture.home.sourceId, fixture.away.sourceId].includes(specimenId(5))
    expect(FIXTURES.filter((fixture) => club(fixture) && fixture.status === 'full_time' && fixture.result)).toHaveLength(6)

    const league = mount('pl')
    expect(strip(league.container, 5)).toEqual(['W', 'W', '·', '·', '·'])
    expect(league.container.querySelector(`[data-table="mobile"] [data-table-row="${specimenId(5)}"] .form-pips`)!.getAttribute('aria-label')).toBe('Form, oldest to newest: won, won. 3 empty slots.')
    // So the foot may not say the snapshot holds fewer than five for that club: it holds six.
    const foot = league.container.querySelector('footer.page-foot')!.textContent!
    expect(foot).toContain('A dot is an empty slot.')
    expect(foot).not.toMatch(/fewer than five finished results for that club(?! in this competition)/)
    unmount()

    // The same club in its other table: four letters from that competition's results, in order, and one dot.
    expect(strip(mount('ucl').container, 5)).toEqual(['L', 'D', 'L', 'L', '·'])
  })

  it('says nothing of the snapshot for a club with no result in this competition and four in another', () => {
    restore = holdSnapshot()
    STANDINGS.leagues.pl = specimenTable('pl')
    FIXTURES.splice(0, FIXTURES.length, ...finishedFor(specimenId(6), 'ucl', ['W', 'W', 'W', 'W']))
    const { container } = mount('pl')
    const pips = container.querySelector(`[data-table="mobile"] [data-table-row="${specimenId(6)}"] .form-pips`)!
    expect(pips.getAttribute('aria-label')).toBe('Form: 5 empty slots.')
    expect(container.textContent).not.toMatch(/no finished results in the snapshot/)
  })
})

describe('PageFoot', () => {
  it('holds one paragraph unless it is handed more, so the Fixtures foot is as it was', () => {
    const { container } = render(<PageFoot kind="ledger">Always verify in the book before staking.</PageFoot>)
    expect([...container.querySelectorAll('p.page-foot-copy')].map((paragraph) => paragraph.textContent)).toEqual(['Always verify in the book before staking.'])
    expect(container.querySelector('footer')!.getAttribute('data-stock')).toBeNull()
  })

  it('sets each further paragraph under the first, in order', () => {
    const { container } = render(<PageFoot kind="table" more={['Second.', 'Third.']}>First.</PageFoot>)
    expect([...container.querySelectorAll('p.page-foot-copy')].map((paragraph) => paragraph.textContent)).toEqual(['First.', 'Second.', 'Third.'])
  })
})
