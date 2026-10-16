import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useNow } from './lib/useNow'
import { useCanonicalSearch, useUrlState } from './lib/useUrlState'
import { encodeTab, parseTab, type Tab } from './lib/urlCodecs'
import { DEFAULT_LENS, encodeLens, parseLens } from './lib/lens'
import { useThemeController } from './lib/useThemeController'
import { TabNav } from './components/TabNav'
import { AppHeader } from './components/AppHeader'
import { LensSwitcher } from './components/LensSwitcher'
import { FixturesPage } from './components/FixturesPage'
import { TablePage } from './components/TablePage'
import { StalenessBanner } from './components/StalenessBanner'
import { TickerStrip } from './components/TickerStrip'
import { ViewBoundary } from './components/ViewBoundary'
import './index.css'

const OFFLINE_TABS: ReadonlyArray<{ key: Tab; label: string }> = [
  { key: 'fixtures', label: 'Fixtures' },
  { key: 'table', label: 'Table' },
]

/**
 * Fixtures and Table only. `?tab=moments` renders Fixtures and does not rewrite the URL.
 * The "Offline snapshot" line sits outside AppHeader, so the shared header's DOM in the
 * Vite app and the Next app is unchanged.
 */
export function OfflineApp() {
  const { today } = useNow()
  const [tab, setTab] = useUrlState<Tab>('tab', 'fixtures', encodeTab, parseTab, 'push')
  const [lens, setLens] = useUrlState('lens', DEFAULT_LENS, encodeLens, parseLens, 'replace')
  useCanonicalSearch(today)
  const { theme, toggle } = useThemeController(lens)
  const shown = tab === 'table' ? 'table' : 'fixtures'

  return (
    <div className="mx-auto max-w-[780px] px-5 pt-7 pb-16">
      <AppHeader
        version={__APP_VERSION__}
        onToggleTheme={toggle}
        themeLabel={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      />
      <p data-offline-snapshot="" className="label-caps mb-4 text-[10px] text-ink-muted">Offline snapshot</p>
      <TabNav tab={shown} onSelect={setTab} tabs={OFFLINE_TABS}>
        <LensSwitcher lens={lens} onSelect={setLens} />
      </TabNav>
      <div data-moments-background="route">
        <ViewBoundary key={`${shown}:${lens}`}>
          {lens === 'broadcast' && shown === 'fixtures' && <TickerStrip />}
          <StalenessBanner />
          {shown === 'table' ? <TablePage /> : <FixturesPage today={today} lens={lens} />}
        </ViewBoundary>
      </div>
    </div>
  )
}

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <OfflineApp />
    </StrictMode>,
  )
}
