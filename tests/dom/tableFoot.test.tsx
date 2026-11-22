import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { COMPETITIONS, TABLE_LEAGUES, type CompetitionKey } from '../../src/lib/competitions'
import { FIXTURES, META, SYNC_STAMP } from '../../src/lib/fixtures'
import type { Fixture } from '../../src/lib/schema'
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
 * snapshot has no finished result for, for that club in this competition. The second is
 * said in the words approved on 21 Nov 2026 (the review of PR #352, question 11), and those
 * words are held here letter for letter.
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
// The dot sentence as approved: string 8's clause, made true of the app by "in this competition"
// (see the cross-competition case below).
const DOT = 'A dot is an empty slot: the snapshot holds fewer than five finished results for that club in this competition.'
// String 8's third sentence, the foot's last paragraph, ending on it.
const LAST = `Zones & key, opened, reads: form runs oldest to newest. ${DOT}`

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

  it('ends on the dot sentence as approved, word for word, in every league the snapshot holds a table for', () => {
    const held = TABLE_LEAGUES.filter((league) => (STANDINGS.leagues[league] ?? []).length > 0)
    expect(held.length).toBeGreaterThan(0)
    for (const league of held) {
      const { container } = mount(league)
      const paragraphs = [...container.querySelectorAll('footer.page-foot p.page-foot-copy')].map((paragraph) => paragraph.textContent)
      expect(paragraphs, league).toEqual([FIRST, LAST])
      expect(paragraphs[paragraphs.length - 1]!.endsWith(DOT), league).toBe(true)
      // Said once, in the foot, and in no other words anywhere on the page.
      expect(container.textContent!.split(/a dot is/i).length - 1, league).toBe(1)
      unmount()
    }
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

/** The statuses under which a match has ended with a score. A strip draws a letter for the first
 *  alone; "finished results" in the foot is read as widely as a reader could, as all three. */
const ENDED: ReadonlySet<Fixture['status']> = new Set(['full_time', 'after_extra_time', 'after_penalties'])

/**
 * What the snapshot in memory holds for one club in one competition, counted here from FIXTURES
 * and from nothing the page computed: its full-time results as letters, oldest to newest, and
 * how many of its matches have ended with a score, however they ended.
 */
function heldFor(league: CompetitionKey, teamId: string) {
  const mine = FIXTURES
    .filter((fixture) => fixture.competition === league && fixture.result && [fixture.home.sourceId, fixture.away.sourceId].includes(teamId))
    .sort((a, b) => a.kickoffUtc.localeCompare(b.kickoffUtc))
  const letter = (fixture: Fixture) => {
    const [us, them] = fixture.home.sourceId === teamId ? [fixture.result!.home, fixture.result!.away] : [fixture.result!.away, fixture.result!.home]
    return us > them ? 'W' : us === them ? 'D' : 'L'
  }
  return {
    letters: mine.filter((fixture) => fixture.status === 'full_time').map(letter),
    finished: mine.filter((fixture) => ENDED.has(fixture.status)).length,
  }
}

/**
 * Every strip the page draws, in both tables, against the snapshot in memory. A strip is five
 * slots: a letter for each of the club's latest full-time results in this competition, oldest to
 * newest, then a dot for each slot it has no result for. So every dot drawn is a result the
 * snapshot does not hold for that club in this competition, and where a club draws one the
 * snapshot holds fewer than five finished results for it here, which is what the foot says. A
 * league the snapshot holds no table for has no provider rows to compare, and has to draw the
 * empty page instead of a strip.
 */
function everyStripAgainstTheSnapshot() {
  const seen = { clubs: 0, strips: 0, dots: 0, short: 0, full: 0, withoutTable: [] as CompetitionKey[] }
  for (const league of TABLE_LEAGUES) {
    const { container, rows } = mount(league)
    if (!rows.length) {
      expect(container.querySelector('[data-empty-table]'), league).not.toBeNull()
      expect(container.querySelector('.form-pips'), league).toBeNull()
      seen.withoutTable.push(league)
    } else {
      const paragraphs = [...container.querySelectorAll('footer.page-foot p.page-foot-copy')]
      const said = paragraphs[paragraphs.length - 1]?.textContent ?? ''
      expect(container.querySelectorAll('.form-pips'), league).toHaveLength(2 * rows.length)
      for (const row of rows) {
        const held = heldFor(league, row.teamId)
        const latest = held.letters.slice(-5)
        const owed = [...latest, ...Array<string>(5 - latest.length).fill('·')]
        for (const layout of ['mobile', 'desktop'] as const) {
          const strips = container.querySelectorAll(`[data-table="${layout}"] [data-table-row="${row.teamId}"] .form-pips`)
          expect(strips, `${row.name}, ${league}, ${layout}`).toHaveLength(1)
          expect([...strips[0]!.querySelectorAll('.form-pip')].map((pip) => pip.textContent), `${row.name}, ${league}, ${layout}`).toEqual(owed)
          seen.strips += 1
          seen.dots += 5 - latest.length
        }
        if (latest.length < 5) {
          // The foot's reason for a dot, held to this club: fewer than five finished results here, however a match ended.
          expect(held.finished, `${row.name} draws a dot in ${league}, and the snapshot holds ${held.finished} finished results for it there`).toBeLessThan(5)
          expect(said.endsWith(DOT), `${league} draws a dot and its foot does not say why`).toBe(true)
          seen.short += 1
        } else seen.full += 1
        seen.clubs += 1
      }
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

  it('“a dot is an empty slot: the snapshot holds fewer than five finished results for that club in this competition” is true of every dot the committed snapshot draws, club by club', () => {
    const seen = everyStripAgainstTheSnapshot()
    // The comparison reached the provider's rows, each in both tables. How many of them are short is the snapshot's business.
    expect(seen.clubs).toBeGreaterThan(0)
    expect(seen.strips).toBe(2 * seen.clubs)
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
    expect(foot).toContain(DOT)
    expect(foot).not.toMatch(/fewer than five finished results for that club(?! in this competition)/)
    unmount()

    // The same club in its other table: four letters from that competition's results, in order, and one dot.
    expect(strip(mount('ucl').container, 5)).toEqual(['L', 'D', 'L', 'L', '·'])
  })

  it('gives a strip no words about the snapshot for a club with no result in this competition and four in another', () => {
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
