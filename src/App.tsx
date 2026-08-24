import { useCallback, useMemo, useState } from 'react'
import { COMPETITION_KEYS, COMPETITIONS, type CompetitionKey } from './lib/competitions'
import { addDays, addMonths, niceDate, shortDate, startOfWeek, todayIso } from './lib/time'
import { LAST_SYNC_DATE, META, upcoming } from './lib/fixtures'
import { useUrlState } from './lib/useUrlState'
import { Ticker } from './components/Ticker'
import { FilterBar } from './components/FilterBar'
import { WeekView } from './components/WeekView'
import { MonthView } from './components/MonthView'
import { WatchPanel } from './components/WatchPanel'
import { StalenessBanner } from './components/StalenessBanner'

const ALL = new Set(COMPETITION_KEYS)

export default function App() {
  const today = useMemo(() => todayIso(), [])
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme ?? 'light')

  const [view, setView] = useUrlState<'week' | 'month'>(
    'view', 'week',
    (v) => (v === 'week' ? null : v),
    (s) => (s === 'month' ? 'month' : 'week'),
  )
  const [anchor, setAnchor] = useUrlState<string>(
    'date', today,
    (v) => (v === today ? null : v),
    (s) => (/^\d{4}-\d{2}-\d{2}$/.test(s) ? s : today),
  )
  const [active, setActive] = useUrlState<ReadonlySet<CompetitionKey>>(
    'only', ALL,
    (v) => (v.size === COMPETITION_KEYS.length ? null : [...v].join(',')),
    (s) => new Set(s.split(',').filter((k): k is CompetitionKey => k in COMPETITIONS)),
  )

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    localStorage.setItem('kickoff-theme', next)
    setTheme(next)
  }

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
  const monthStart = `${anchor.slice(0, 7)}-01`
  const nav = (dir: number) =>
    setAnchor(view === 'week' ? addDays(anchor, dir * 7) : addMonths(monthStart, dir))

  const periodLabel =
    view === 'week'
      ? `${shortDate(weekStart)} – ${niceDate(addDays(weekStart, 6))}`
      : niceDate(monthStart).replace(/ \d+,/, '')

  const next = useMemo(() => upcoming(today, active, 8), [today, active])

  return (
    <div className="mx-auto max-w-[780px] px-5 pt-7 pb-16">
      <header className="mb-6 flex items-start justify-between border-b-2 border-ink pb-5">
        <div className="leading-none">
          <span className="font-display block text-[34px] font-bold tracking-wide uppercase">Kickoff</span>
          <span className="label-caps block text-[13px] text-pitch">Brooklyn · ET</span>
          <span className="label-caps mt-1 block text-[10px] text-floodlight">
            v0.0.1 · {META.total} fixtures · synced {LAST_SYNC_DATE}
          </span>
        </div>
        <button
          onClick={toggleTheme}
          className="label-caps cursor-pointer rounded border-[1.5px] border-ink bg-ink px-3.5 py-2.5 text-[11px] text-bg"
        >
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </header>

      <StalenessBanner />

      <div className="label-caps mb-2 text-[11px] text-floodlight">Next up</div>
      <Ticker fixtures={next} />

      <WatchPanel />
      <FilterBar
        active={active}
        onToggle={onToggle}
        onSetGroup={onSetGroup}
        onSetAll={(on) => setActive(on ? ALL : new Set())}
      />

      <div className="mb-3.5 flex gap-2">
        {(['week', 'month'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={[
              'label-caps flex-1 cursor-pointer rounded border-[1.5px] py-2.5 text-[13px]',
              view === v ? 'border-pitch bg-pitch text-white' : 'border-line-strong bg-surface text-ink-secondary',
            ].join(' ')}
          >
            {v === 'week' ? 'Weekly' : 'Monthly'}
          </button>
        ))}
      </div>

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

      {view === 'week' ? (
        <WeekView weekStart={weekStart} active={active} today={today} />
      ) : (
        <MonthView monthStart={monthStart} active={active} today={today} />
      )}

      <footer className="mt-8 border-t border-line pt-4 text-[11.5px] leading-relaxed text-ink-muted">
        <div className="label-caps mb-1 text-[10px] text-floodlight">Data</div>
        <p>
          Fixtures are generated by <code className="font-mono">npm run sync</code> from ESPN's
          public fixture API and validated on the way in — they are never hand-edited. Every sync
          diffs against the previous snapshot and reports what moved, so a rescheduled kickoff or
          a swapped home side surfaces instead of rotting. Times shown are the stadium's local
          kickoff and the Brooklyn equivalent, both derived from one stored UTC instant, so they
          cannot drift apart across a DST change.
        </p>
        <p className="mt-2.5">
          Kickoffs marked <i>time not yet set</i> are fixtures where the league has fixed the date
          but not the hour. Always verify in the book before staking.
        </p>
      </footer>
    </div>
  )
}
