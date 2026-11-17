import { describe, expect, it } from 'vitest'
import fixtures from '../src/data/fixtures.json'
import meta from '../src/data/meta.json'
import { MATCHDAY_WINDOWS } from '../src/lib/competitions'
import { addDays as appAddDays, brooklynDate as appBrooklynDate, startOfWeek as appStartOfWeek } from '../src/lib/time'
import {
  BOARD_ANCHOR,
  UCL_WINDOWS,
  addDays,
  brooklynDate,
  chooseWeeks,
  matrixAnchor,
  startOfWeek,
  wholeWeeks,
} from '../scripts/evidence-weeks.mjs'

const INSTANTS = [
  '2026-10-16T15:00:00.000Z',
  '2026-10-25T00:30:00.000Z',
  '2026-11-01T03:30:00.000Z',
  '2026-11-01T06:30:00.000Z',
  '2026-11-21T20:00:00.000Z',
  '2027-04-14T03:30:00.000Z',
]

describe('evidence week rules', () => {
  it('matches the app clock and the Champions League windows', () => {
    for (const instant of INSTANTS) expect(brooklynDate(instant)).toBe(appBrooklynDate(instant))
    for (const iso of ['2026-10-16', '2026-10-19', '2026-11-01', '2026-11-21', '2027-04-14']) {
      expect(startOfWeek(iso)).toBe(appStartOfWeek(iso))
      expect(addDays(iso, 6)).toBe(appAddDays(iso, 6))
    }
    expect(UCL_WINDOWS).toEqual(MATCHDAY_WINDOWS.ucl)
  })

  it('picks the first whole week for each rule and invents nothing', () => {
    const window = { from: '2026-10-16', to: '2026-11-30' }
    const domestic = Array.from({ length: 40 }, (_, i) => ({
      competition: 'pl',
      kickoffUtc: `2026-10-26T16:${String(i).padStart(2, '0')}:00.000Z`,
    }))
    const list = [
      { competition: 'ucl', kickoffUtc: '2026-10-16T16:00:00.000Z' },
      { competition: 'ucl', kickoffUtc: '2026-10-20T16:00:00.000Z' },
      { competition: 'ucl', kickoffUtc: '2026-10-18T16:00:00.000Z' },
      ...domestic,
    ]
    const chosen = chooseWeeks(list, window)
    expect(chosen.uefa).toMatchObject({ monday: '2026-10-19', count: 1 })
    expect(chosen.heavy).toMatchObject({ monday: '2026-10-26', count: 40 })
    expect(chosen.quiet).toMatchObject({ monday: '2026-11-02', count: 0 })
    expect(wholeWeeks(window)[0]).toEqual({ monday: '2026-10-19', sunday: '2026-10-25' })

    // Forty league fixtures do not make a week heavy while it also holds a Champions League one.
    const crowded = chooseWeeks(
      [...domestic.map((fixture) => ({ ...fixture, kickoffUtc: fixture.kickoffUtc.replace('2026-10-26', '2026-10-19') })), ...list],
      window,
    )
    expect(crowded.heavy).toMatchObject({ monday: '2026-10-26', count: 40 })

    const none = chooseWeeks([], { from: '2026-11-02', to: '2026-11-08' })
    expect(none.heavy.monday).toBeNull()
    expect(none.heavy.missing).toMatch(/40 or more/)
    expect(none.quiet).toMatchObject({ monday: '2026-11-02', count: 0 })
    expect(none.uefa.monday).toBeNull()
  })

  it('keeps the board anchor while the window holds it', () => {
    const held = { from: '2026-10-16', to: '2027-04-14' }
    expect(matrixAnchor(held, { heavy: { monday: '2026-10-26' } })).toBe(BOARD_ANCHOR)
    expect(matrixAnchor({ from: '2026-11-22', to: '2027-04-14' }, { heavy: { monday: '2026-11-23' } })).toBe('2026-11-23')
    expect(() => matrixAnchor({ from: '2026-11-22', to: '2026-11-30' }, { heavy: { monday: null } })).toThrow(/inventing none/)
  })

  // chooseWeeks builds one Intl.DateTimeFormat per fixture per whole week: 36,150 on the
  // snapshot of 15 Nov 2026 (1,446 fixtures, 25 weeks). Alone that is about a second. In the
  // full suite it took 1.9 to 4.6 s over twelve verify runs on 15 and 16 Nov, against the
  // node project's 5 s default, and it timed out locally with the cores busy. 20 s is the
  // dom project's limit. The cost is in scripts/evidence-weeks.mjs, not in this test.
  it('names weeks from the committed snapshot without a hard-coded date', { timeout: 20_000 }, () => {
    const chosen = chooseWeeks(fixtures, meta.window)
    const weeks = wholeWeeks(meta.window).map((week) => {
      const rows = fixtures.filter((fixture) => {
        const day = appBrooklynDate(fixture.kickoffUtc)
        return day >= week.monday && day <= week.sunday
      })
      const hasUcl = rows.some((fixture) => fixture.competition === 'ucl')
      const uclWindow = rows.some((fixture) =>
        fixture.competition === 'ucl' &&
        MATCHDAY_WINDOWS.ucl!.some((w) => {
          const day = appBrooklynDate(fixture.kickoffUtc)
          return day >= w.from && day <= w.to
        }))
      return { ...week, count: rows.length, hasUcl, uclWindow }
    })
    expect(chosen.heavy.monday).toBe(weeks.find((week) => week.count >= 40 && !week.hasUcl)?.monday ?? null)
    expect(chosen.quiet.monday).toBe(weeks.find((week) => week.count === 0)?.monday ?? null)
    expect(chosen.uefa.monday).toBe(weeks.find((week) => week.uclWindow)?.monday ?? null)
    if (meta.window.from <= BOARD_ANCHOR && BOARD_ANCHOR <= meta.window.to) {
      expect(matrixAnchor(meta.window, chosen)).toBe(BOARD_ANCHOR)
    }
    for (const week of [chosen.heavy, chosen.quiet, chosen.uefa]) {
      if (!week.monday) expect(week.missing).toEqual(expect.any(String))
      else {
        expect(week.monday >= meta.window.from && week.sunday! <= meta.window.to).toBe(true)
        expect(week.monday).toBe(appStartOfWeek(week.monday))
      }
    }
  })
})
