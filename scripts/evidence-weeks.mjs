// Week choice for the evidence runner. Plain JS so `node web/scripts/evidence.mjs` can load
// it; tests/evidenceWeeks.test.ts locks it to src/lib/time.ts and MATCHDAY_WINDOWS.
import { readFileSync } from 'node:fs'
import path from 'node:path'

const BROOKLYN = 'America/New_York'

/** The week the design boards draw. Used while the snapshot window still holds it. */
export const BOARD_ANCHOR = '2026-11-21'

/** UEFA Champions League league-phase windows. Keep identical to MATCHDAY_WINDOWS.ucl. */
export const UCL_WINDOWS = [
  { md: 1, from: '2026-09-08', to: '2026-09-10' },
  { md: 2, from: '2026-10-13', to: '2026-10-14' },
  { md: 3, from: '2026-10-20', to: '2026-10-21' },
  { md: 4, from: '2026-11-03', to: '2026-11-04' },
  { md: 5, from: '2026-11-24', to: '2026-11-25' },
  { md: 6, from: '2026-12-08', to: '2026-12-09' },
  { md: 7, from: '2027-01-19', to: '2027-01-20' },
  { md: 8, from: '2027-01-27', to: '2027-01-27' },
]

// Built once. chooseWeeks asks for a Brooklyn date per fixture per week, and building a
// formatter costs far more than formatting with one.
const BROOKLYN_DAY = new Intl.DateTimeFormat('en-US', {
  timeZone: BROOKLYN, year: 'numeric', month: '2-digit', day: '2-digit',
})

export function brooklynDate(kickoffUtc) {
  const parts = Object.fromEntries(
    BROOKLYN_DAY.formatToParts(new Date(kickoffUtc)).map((part) => [part.type, part.value]),
  )
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function addDays(iso, n) {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** Monday of the Brooklyn week containing `iso`. Same noon-UTC arithmetic as src/lib/time.ts. */
export function startOfWeek(iso) {
  const dow = new Date(`${iso}T12:00:00Z`).getUTCDay()
  return addDays(iso, dow === 0 ? -6 : 1 - dow)
}

/** Monday–Sunday weeks wholly inside the snapshot window. A partial week is not a candidate. */
export function wholeWeeks(window) {
  const weeks = []
  let monday = startOfWeek(window.from)
  if (monday < window.from) monday = addDays(monday, 7)
  for (;;) {
    const sunday = addDays(monday, 6)
    if (sunday > window.to) break
    weeks.push({ monday, sunday })
    monday = addDays(monday, 7)
  }
  return weeks
}

function inUclWindow(day, windows) {
  return windows.some((w) => day >= w.from && day <= w.to)
}

function pack(week, missing) {
  if (!week) return { monday: null, sunday: null, count: null, missing }
  return { monday: week.monday, sunday: week.sunday, count: week.count }
}

/**
 * heavy: the first whole week with 40 or more fixtures and no Champions League fixture.
 * quiet: the first whole week with none.
 * uefa: the first whole week with a Champions League fixture whose Brooklyn date sits
 * inside a league-phase window. A missing rule is named and not filled in.
 */
export function chooseWeeks(fixtures, window, windows = UCL_WINDOWS) {
  const weeks = wholeWeeks(window).map((week) => {
    const rows = fixtures.filter((fixture) => {
      const day = brooklynDate(fixture.kickoffUtc)
      return day >= week.monday && day <= week.sunday
    })
    return { ...week, rows, count: rows.length }
  })
  const heavy = weeks.find((week) => week.count >= 40 && !week.rows.some((fixture) => fixture.competition === 'ucl'))
  const quiet = weeks.find((week) => week.count === 0)
  const uefa = weeks.find((week) => week.rows.some((fixture) =>
    fixture.competition === 'ucl' && inUclWindow(brooklynDate(fixture.kickoffUtc), windows)))
  return {
    heavy: pack(heavy, 'no whole week with 40 or more fixtures and no Champions League fixture'),
    quiet: pack(quiet, 'no whole week with no fixtures'),
    uefa: pack(uefa, 'no whole week with a Champions League fixture inside a league-phase window'),
  }
}

/** Board anchor while the window holds it; otherwise the heavy week's Monday. Invents nothing. */
export function matrixAnchor(window, weeks) {
  if (BOARD_ANCHOR >= window.from && BOARD_ANCHOR <= window.to) return BOARD_ANCHOR
  if (weeks.heavy?.monday) return weeks.heavy.monday
  throw new Error('The board anchor is outside the snapshot window and no heavy week exists; inventing none')
}

export function readSnapshot(root) {
  const fixtures = JSON.parse(readFileSync(path.join(root, 'src/data/fixtures.json'), 'utf8'))
  const meta = JSON.parse(readFileSync(path.join(root, 'src/data/meta.json'), 'utf8'))
  return { fixtures, window: meta.window }
}
