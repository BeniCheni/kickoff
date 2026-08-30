import { useMemo, useState } from 'react'
import { todayIso } from './lib/time'
import { LAST_SYNC_DATE, META } from './lib/fixtures'
import { useUrlState } from './lib/useUrlState'
import { TabNav, type Tab } from './components/TabNav'
import { FixturesPage } from './components/FixturesPage'
import { TablePage } from './components/TablePage'
import { StalenessBanner } from './components/StalenessBanner'

export default function App() {
  const today = useMemo(() => todayIso(), [])
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme ?? 'light')

  // `/` is Fixtures; `/?tab=table` is the league table. The header and tab row persist
  // across both, so each view is always one tap from the other.
  const [tab, setTab] = useUrlState<Tab>(
    'tab', 'fixtures',
    (v) => (v === 'fixtures' ? null : v),
    (s) => (s === 'table' ? 'table' : 'fixtures'),
  )

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    localStorage.setItem('kickoff-theme', next)
    setTheme(next)
  }

  return (
    <div className="mx-auto max-w-[780px] px-5 pt-7 pb-16">
      <header className="mb-4 flex items-start justify-between pb-1">
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

      <TabNav tab={tab} onSelect={setTab} />

      <StalenessBanner />

      {tab === 'table' ? <TablePage /> : <FixturesPage today={today} />}
    </div>
  )
}
