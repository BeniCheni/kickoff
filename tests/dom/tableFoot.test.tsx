import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { TABLE_LEAGUES, type CompetitionKey } from '../../src/lib/competitions'
import { FIXTURES, META, SYNC_STAMP } from '../../src/lib/fixtures'
import { STANDINGS, tableFor } from '../../src/lib/standings'
import { todayIso } from '../../src/lib/time'
import { PageFoot } from '../../src/components/PageFoot'
import { TablePage } from '../../src/components/TablePage'
import { primeClock } from './rig'

/**
 * The foot of the Table: the scorch, then the black foot and its paragraphs. The last
 * paragraph makes two claims about the page above it, so each is held against the page:
 * the key does say form runs oldest to newest, and a dot is drawn for exactly the slots the
 * snapshot has no finished result for.
 */
let release: (() => void) | undefined
afterEach(() => { cleanup(); release?.(); release = undefined })

function mount(league: CompetitionKey) {
  window.history.replaceState(null, '', `/?league=${league}`)
  const now = new Date(META.lastSyncAt)
  release = primeClock(now)
  const rows = tableFor(league, todayIso(now), now.toISOString())
  return { ...render(<TablePage />), rows }
}

const FIRST = 'Table read from ESPN\'s standings feed by npm run sync, never recomputed locally. Form and next fixture join to the fixtures snapshot.'
const LAST = 'Zones & key, opened, reads: form runs oldest to newest. A dot is an empty slot: the snapshot holds fewer than five finished results for that club.'

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

  it('draws the scorch as one empty element a reader cannot reach: no text on it, under it or in it', () => {
    const { container } = mount('ucl')
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
})

describe('what the foot’s last sentence says of the page', () => {
  it('“form runs oldest to newest” is what the opened key reads', () => {
    for (const league of ['bundesliga', 'ucl'] as const) {
      const { container } = mount(league)
      fireEvent.click(screen.getByRole('button', { name: 'Zones & key' }))
      expect(container.querySelector('.zones-key-panel')!.textContent, league).toContain('Form results oldest to newest')
      cleanup(); release?.(); release = undefined
    }
  })

  it('“a dot is an empty slot” is what every strip draws: five slots, a dot for each result the snapshot does not hold', () => {
    let short = 0
    for (const league of TABLE_LEAGUES) {
      const { container, rows } = mount(league)
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
        if (finished < 5) short += 1
      })
      cleanup(); release?.(); release = undefined
    }
    // The sentence is about something the snapshot shows today: some club has fewer than five.
    expect(short).toBeGreaterThan(0)
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
