import { useCallback, useEffect, useRef } from 'react'
import { COMPETITION_KEYS, COMPETITIONS, type CompetitionKey } from '../lib/competitions'
import { addDays, niceDate, shortDate, startOfWeek } from '../lib/time'
import { useUrlState } from '../lib/useUrlState'
import { encodeDate, encodeOnly, parseDateParam, parseOnlyParam } from '../lib/urlCodecs'
import type { Lens } from '../lib/lens'
import { SYNC_STAMP } from '../lib/fixtures'
import { PageFoot } from './PageFoot'
import { NextUpStrip } from './NextUpStrip'
import { TonightSlate } from './TonightSlate'
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
  const nav = (dir: number) => setAnchor(addDays(anchor, dir * 7))
  const periodLabel = `${shortDate(weekStart)} – ${niceDate(addDays(weekStart, 6))}`

  return (
    <>
      {/* The hero is the one lens axis that changes the tree: Ledger's Next-up strip,
          and Poster's tonight's slate. */}
      {lens === 'poster' ? (
        <TonightSlate today={today} active={active} />
      ) : lens === 'ledger' ? (
        <NextUpStrip today={today} active={active} />
      ) : null}

      <FilterBar
        active={active}
        onToggle={onToggle}
        onSetGroup={onSetGroup}
        onSetAll={(on) => setActive(on ? ALL : new Set())}
      />

      <div className="mb-4 flex items-center justify-between gap-2">
        <button onClick={() => nav(-1)} aria-label="Previous"
          className="size-9 shrink-0 cursor-pointer rounded border-[1.5px] border-line-strong bg-surface">‹</button>
        <div className="flex-1">
          <div className="font-display text-center text-[17px] font-semibold">{periodLabel}</div>
          <button onClick={() => setAnchor(today)}
            className="mt-0.5 w-full cursor-pointer text-center text-[10px] font-semibold tracking-wide text-pitch uppercase">
            Jump to today
          </button>
        </div>
        <button onClick={() => nav(1)} aria-label="Next"
          className="size-9 shrink-0 cursor-pointer rounded border-[1.5px] border-line-strong bg-surface">›</button>
      </div>

      <WeekView weekStart={weekStart} active={active} today={today} lens={lens} />

      <PageFoot kind={lens === 'ledger' ? 'ledger' : 'poster'}>
        {lens === 'ledger'
          ? 'Always verify in the book before staking.'
          : `Fixtures from the snapshot synced ${SYNC_STAMP}. Times are Brooklyn unless marked local. Always verify in the book before staking.`}
      </PageFoot>
    </>
  )
}
