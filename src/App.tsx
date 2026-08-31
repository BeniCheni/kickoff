import { useEffect, useMemo, useRef, useState } from 'react'
import { todayIso } from './lib/time'
import { META, SYNC_STAMP } from './lib/fixtures'
import { useUrlState } from './lib/useUrlState'
import { encodeLens, parseLens, type Lens } from './lib/lens'
import { resolveThemeFromEnvironment, themeStorageKey, writeStoredTheme, type Theme } from './lib/theme'
import { TabNav, type Tab } from './components/TabNav'
import { LensSwitcher } from './components/LensSwitcher'
import { FixturesPage } from './components/FixturesPage'
import { TablePage } from './components/TablePage'
import { StalenessBanner } from './components/StalenessBanner'
import { TickerStrip } from './components/TickerStrip'

export default function App() {
  const today = useMemo(() => todayIso(), [])
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  )

  // `/` is Fixtures; `/?tab=table` is the league table. The header and tab row persist
  // across both, so each view is always one tap from the other. Tab switches push a
  // history entry — Back returns to the previous tab, not out of the site.
  const [tab, setTab] = useUrlState<Tab>(
    'tab', 'fixtures',
    (v) => (v === 'fixtures' ? null : v),
    (s) => (s === 'table' ? 'table' : 'fixtures'),
    'push',
  )

  // The lens is a view preference, not navigation — replace history, default omitted.
  const [lens, setLens] = useUrlState<Lens>('lens', 'ledger', encodeLens, parseLens, 'replace')

  const prevLens = useRef<Lens | null>(null)
  const fadeTimer = useRef<number | undefined>(undefined)

  // The single lens → DOM sync point. Covers switcher clicks and Back/Forward alike
  // (useUrlState's popstate handler re-renders us). Re-resolving the theme here is what
  // makes Broadcast dark-by-default on entry and restores the prior choice on exit.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.lens = lens
    const next = resolveThemeFromEnvironment(lens)
    root.dataset.theme = next
    setTheme(next)
    if (
      prevLens.current !== null &&
      prevLens.current !== lens &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      // Transient cross-fade: token-driven colours transition for 220ms, then the
      // class comes off so no global transitions are left permanently enabled.
      root.classList.add('lens-switching')
      window.clearTimeout(fadeTimer.current)
      fadeTimer.current = window.setTimeout(() => root.classList.remove('lens-switching'), 240)
    }
    prevLens.current = lens
    return () => {
      // Drop the class too — a cleared timer must not strand `.lens-switching` (and its
      // document-wide transitions) on <html>.
      window.clearTimeout(fadeTimer.current)
      root.classList.remove('lens-switching')
    }
  }, [lens])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    writeStoredTheme(themeStorageKey(lens), next)
    setTheme(next)
  }

  return (
    <div className="mx-auto max-w-[780px] px-5 pt-7 pb-16">
      <header className="mb-4 flex items-start justify-between pb-1">
        <div className="leading-none">
          <span className="font-display block text-[34px] font-bold tracking-wide uppercase">Kickoff</span>
          <span className="label-caps block text-[13px] text-pitch">Brooklyn · ET</span>
          <span className="label-caps mt-1 block text-[10px] text-floodlight">
            v{__APP_VERSION__} · {META.total} fixtures · synced {SYNC_STAMP}
          </span>
        </div>
        <button
          onClick={toggleTheme}
          className="label-caps cursor-pointer rounded border-[1.5px] border-ink bg-ink px-3.5 py-2.5 text-[11px] text-bg"
        >
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </header>

      <TabNav tab={tab} onSelect={setTab}>
        <LensSwitcher lens={lens} onSelect={setLens} />
      </TabNav>

      {lens === 'broadcast' && tab === 'fixtures' && <TickerStrip />}

      <StalenessBanner />

      {tab === 'table' ? <TablePage /> : <FixturesPage today={today} lens={lens} />}
    </div>
  )
}
