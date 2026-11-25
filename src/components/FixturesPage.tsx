import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { COMPETITION_KEYS, COMPETITIONS, type CompetitionKey } from '../lib/competitions'
import { addDays, startOfWeek } from '../lib/time'
import { useUrlState } from '../lib/useUrlState'
import { encodeDate, encodeOnly, parseDateParam, parseOnlyParam } from '../lib/urlCodecs'
import type { Lens } from '../lib/lens'
import { bookWeek, posterBooks, restingBook, shelfGaps, weekCoverage } from '../lib/lensSelectors'
import { useNow } from '../lib/useNow'
import { BY_DATE, META, SYNC_STAMP } from '../lib/fixtures'
import { PageFoot } from './PageFoot'
import { NextUpStrip } from './NextUpStrip'
import { QuietWeek } from './QuietWeek'
import { BookShelf } from './BookShelf'
import { PosterRack } from './PosterRack'
import { WeekRow } from './WeekRow'
import { FilterBar } from './FilterBar'
import { WeekView } from './WeekView'

const ALL = new Set(COMPETITION_KEYS)

/**
 * The fixtures calendar — everything below the persistent header/tabs when the Fixtures
 * tab is active. Its navigation state (`date`, `only`) stays in the URL, so it survives
 * a hop to the Table tab and back.
 */
export function FixturesPage({ today, lens }: { today: string; lens: Lens }) {
  const encodeAnchor = useCallback((v: string) => encodeDate(v, today), [today])
  const decodeAnchor = useCallback((s: string) => parseDateParam(s, today), [today])
  const [anchor, setAnchor] = useUrlState<string>(
    'date', today,
    encodeAnchor, decodeAnchor,
  )

  // today ticks (useNow, in App) — when it rolls to a new day, follow it, but only while
  // nothing is pinned: a `?date=` in the URL is navigation, not a stale default, and a
  // reload keeps it too. The test is the URL, not "anchor === the day that just ended" —
  // that version dropped a pin on yesterday's date at the second midnight (browser-proven:
  // ?date=2026-09-12 lost its param at the 12th→13th rollover), and the next Sunday→Monday
  // would then have dragged the reader into a week they never asked for.
  const prevToday = useRef(today)
  useEffect(() => {
    if (prevToday.current === today) return
    prevToday.current = today
    if (!new URLSearchParams(window.location.search).has('date')) setAnchor(today)
  }, [today, setAnchor])
  const [active, setActive] = useUrlState<ReadonlySet<CompetitionKey>>(
    'only', ALL,
    encodeOnly,
    parseOnlyParam,
  )

  const onToggle = useCallback(
    (key: CompetitionKey) => {
      const next = new Set(active)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      setActive(next)
    },
    [active, setActive],
  )
  const onSetGroup = useCallback(
    (group: string, on: boolean) => {
      const next = new Set(active)
      for (const k of COMPETITION_KEYS) {
        if (COMPETITIONS[k].group === group) on ? next.add(k) : next.delete(k)
      }
      setActive(next)
    },
    [active, setActive],
  )

  const weekStart = startOfWeek(anchor)
  const { nowUtcIso } = useNow()
  const week = useMemo(() => bookWeek(weekStart, BY_DATE, META.window), [weekStart])
  const books = useMemo(() => lens === 'poster' ? posterBooks(week, active) : [], [week, active, lens])
  const nextBook = useMemo(() => lens === 'poster' ? posterBooks(bookWeek(addDays(weekStart, 7), BY_DATE, META.window), active)[0]
    : undefined, [weekStart, active, lens])
  const quiet = lens === 'poster' && week.every(day => day.total === 0)
  const resting = restingBook(books, weekStart, today, nowUtcIso)
  const nav = (dir: number) => setAnchor(addDays(anchor, dir * 7))
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <>
      {/* The hero is the one lens axis that changes the tree: Ledger's Next-up strip,
          and the Poster's anchored week of books. */}
      {quiet ? <QuietWeek start={weekStart} today={today} active={active} now={nowUtcIso}
        coverage={weekCoverage(week)} /> : lens === 'poster' ? (
        <PosterRack books={books} resting={resting} now={nowUtcIso} />
      ) : lens === 'ledger' ? (
        <NextUpStrip today={today} active={active} />
      ) : null}

      <WeekRow start={weekStart} today={today} lens={lens} count={active.size} expanded={filtersOpen}
        onNavigate={nav} onToday={() => setAnchor(today)} onFilters={() => setFiltersOpen(!filtersOpen)} />
      <FilterBar active={active} lens={lens} open={filtersOpen} onToggle={onToggle}
        onSetGroup={onSetGroup} onShowAll={() => setActive(ALL)} />

      {!quiet && <WeekView weekStart={weekStart} active={active} today={today} lens={lens} />}

      {lens === 'poster' && !quiet &&
        <BookShelf books={books} resting={resting} next={nextBook} gaps={shelfGaps(week)} />}

      <PageFoot kind={lens === 'ledger' ? 'ledger' : 'poster'}
        more={lens === 'poster' ? ['Titles and taglines are ILLUSTRATIVE.'] : []}>
        {lens === 'ledger'
          ? 'Always verify in the book before staking.'
          : `Fixtures from the snapshot synced ${SYNC_STAMP}. Times are Brooklyn unless marked local. Always verify in the book before staking.`}
      </PageFoot>
    </>
  )
}
